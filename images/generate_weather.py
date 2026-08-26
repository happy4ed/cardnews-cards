#!/usr/bin/env python3
"""Generate unique hero images (afternoon only), scp to HA, then fan out to other TODs."""
from __future__ import annotations
import subprocess, sys, time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prompts_weather import all_prompts

HERE = Path(__file__).resolve().parent
LOG_PATH = HERE / 'weather_progress.log'
SITE = 'https://auto-grapher.com/media-studio/'
SECRET = 'dujjoncam'

HA_HOST = 'root@192.168.0.124'
HA_KEY = '/home/ubuntu/.ssh/ha_agent'
HA_PROXY = 'proxmox-home'
HA_DEST = '/config/www/cardnews/heroes'

GEN_TIMEOUT_S = 240
TODS = ['dawn','morning','evening','night']  # copy afternoon → these


def log(msg: str) -> None:
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f'[{ts}] {msg}'
    print(line, flush=True)
    with LOG_PATH.open('a') as f:
        f.write(line + '\n')


def is_logged_in(page: Page) -> bool:
    try:
        return page.get_by_role('button', name='생성').first.is_visible(timeout=1500)
    except Exception:
        return False


def login(page: Page) -> None:
    log('로그인 시도...')
    secret_input = None
    for locator in [
        page.get_by_label('관리 시크릿'),
        page.get_by_placeholder('관리 시크릿'),
        page.locator('input[type="password"]').first,
        page.locator('input').first,
    ]:
        try:
            if locator.is_visible(timeout=1500):
                secret_input = locator; break
        except Exception:
            continue
    if secret_input is None:
        raise RuntimeError('secret input not found')
    secret_input.fill(SECRET)
    page.get_by_role('button', name='로그인').click()
    page.wait_for_timeout(1500)
    page.get_by_role('button', name='생성').first.wait_for(state='visible', timeout=15000)
    log('로그인 완료')


def ensure_16_9(page: Page) -> None:
    for sel in page.locator('select').all():
        try:
            options = [o.strip() for o in sel.evaluate('el => Array.from(el.options).map(o => o.textContent)')]
            if any('16:9' in o for o in options):
                sel.select_option(label=next(o for o in options if '16:9' in o))
                return
        except Exception:
            continue


def find_prompt_textbox(page: Page):
    for locator in [
        page.locator('textarea').first,
        page.get_by_role('textbox').first,
    ]:
        try:
            if locator.is_visible(timeout=1500):
                return locator
        except Exception:
            continue
    raise RuntimeError('prompt textbox not found')


def wait_for_result(page: Page, timeout_s: int = GEN_TIMEOUT_S) -> str:
    deadline = time.time() + timeout_s
    dl_link = page.get_by_role('link', name='이미지 다운로드').first
    while time.time() < deadline:
        try:
            if dl_link.is_visible(timeout=500):
                href = dl_link.get_attribute('href')
                if href: return href
        except Exception:
            pass
        time.sleep(4)
    raise TimeoutError(f'{timeout_s}s 초과')


def ssh_cmd(remote_cmd: str) -> subprocess.CompletedProcess:
    cmd = ['ssh', '-i', HA_KEY, '-o', f'ProxyJump={HA_PROXY}',
           '-o', 'StrictHostKeyChecking=no', HA_HOST, remote_cmd]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=60)


def scp_to_ha(local: Path, remote_name: str) -> bool:
    remote = f'{HA_HOST}:{HA_DEST}/{remote_name}'
    cmd = ['scp', '-i', HA_KEY, '-o', f'ProxyJump={HA_PROXY}',
           '-o', 'StrictHostKeyChecking=no', str(local), remote]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if r.returncode != 0:
            log(f'  scp 실패: {r.stderr.strip()}'); return False
        return True
    except Exception as e:
        log(f'  scp 예외: {e}'); return False


def fanout_tods(base_name: str) -> None:
    """base_name = 'hero-media-ma-hub'. Copies afternoon → other 4 TODs on HA."""
    src = f'{HA_DEST}/{base_name}-afternoon.png'
    parts = ' && '.join(f'cp -f {src} {HA_DEST}/{base_name}-{t}.png' for t in TODS)
    r = ssh_cmd(parts)
    if r.returncode == 0:
        log(f'  TOD fanout OK ({base_name})')
    else:
        log(f'  TOD fanout 실패: {r.stderr.strip()}')


def generate_one(page: Page, name: str, prompt: str) -> bool:
    log(f'▶ {name}')
    try:
        tb = find_prompt_textbox(page)
        tb.click(); tb.fill(''); tb.fill(prompt)
        ensure_16_9(page)
        page.get_by_role('button', name='생성').first.click()
        url = wait_for_result(page)
        if not url.startswith('http'):
            url = 'https://auto-grapher.com' + url
        resp = page.request.get(url)
        if resp.status != 200:
            log(f'  다운로드 실패 status={resp.status}'); return False
        data = resp.body()
        out_path = HERE / f'{name}.png'
        out_path.write_bytes(data)
        log(f'  저장 ({len(data)} bytes)')
        if scp_to_ha(out_path, f'{name}.png'):
            log('  HA scp OK')
            base = name.rsplit('-afternoon', 1)[0]
            fanout_tods(base)
            return True
        return False
    except Exception as e:
        log(f'  실패: {e}')
        try:
            page.reload(); page.wait_for_load_state('networkidle', timeout=10000)
            if not is_logged_in(page): login(page)
        except Exception as re:
            log(f'  reload 실패: {re}')
        return False


def main() -> int:
    # Filter by argv batch prefix if given
    prefix = sys.argv[1] if len(sys.argv) > 1 else None
    prompts = [(n,p) for n,p in all_prompts() if not prefix or n.startswith(prefix)]
    total = len(prompts)
    log(f'=== 시작: total={total} prefix={prefix} ===')
    success = 0; failed = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1400, 'height': 900})
        page = context.new_page()
        page.set_default_timeout(15000)
        page.goto(SITE, wait_until='networkidle')
        if not is_logged_in(page): login(page)
        for name, prompt in prompts:
            out_path = HERE / f'{name}.png'
            if out_path.exists():
                log(f'⏭ 존재: {name} (fanout만)')
                base = name.rsplit('-afternoon', 1)[0]
                # ensure remote afternoon exists then fanout
                scp_to_ha(out_path, f'{name}.png')
                fanout_tods(base)
                success += 1
                continue
            if not is_logged_in(page):
                try: login(page)
                except Exception as e: log(f'재로그인 실패: {e}'); break
            if generate_one(page, name, prompt):
                success += 1
            else:
                failed.append(name)
            time.sleep(2)
        context.close(); browser.close()
    log(f'=== 완료: success={success}/{total} failed={failed} ===')
    return 0

if __name__ == '__main__':
    sys.exit(main())
