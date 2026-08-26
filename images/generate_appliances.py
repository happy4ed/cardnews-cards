#!/usr/bin/env python3
"""Auto-grapher hero image generation pipeline.

For each (tab, time-of-day) in prompts.py:
  - Log in if needed (single 관리 시크릿 password textbox)
  - Fill prompt, ensure 16:9 selected, click 생성
  - Poll for result img + download link, save PNG to ./{name}.png
  - scp to HA server at /config/www/cardnews/heroes/{name}.png
  - Idempotent: skips if local PNG already exists
"""
from __future__ import annotations

import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prompts_appliances import all_prompts  # noqa: E402

HERE = Path(__file__).resolve().parent
LOG_PATH = HERE / 'gen_appliances.log'
SITE = 'https://auto-grapher.com/media-studio/'
SECRET = 'dujjoncam'

HA_HOST = 'root@192.168.0.124'
HA_KEY = '/home/ubuntu/.ssh/ha_agent'
HA_PROXY = 'proxmox-home'
HA_DEST = '/config/www/cardnews/heroes'

GEN_TIMEOUT_S = 180  # 3 minutes


def log(msg: str) -> None:
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f'[{ts}] {msg}'
    print(line, flush=True)
    with LOG_PATH.open('a') as f:
        f.write(line + '\n')


def is_logged_in(page: Page) -> bool:
    # After login, the 생성 button exists.
    try:
        return page.get_by_role('button', name='생성').first.is_visible(timeout=1500)
    except Exception:
        return False


def login(page: Page) -> None:
    log('로그인 시도...')
    # Look for the secret textbox and login button.
    # Try by label first, then by placeholder / any textbox.
    secret_input = None
    for locator in [
        page.get_by_label('관리 시크릿'),
        page.get_by_placeholder('관리 시크릿'),
        page.locator('input[type="password"]').first,
        page.locator('input').first,
    ]:
        try:
            if locator.is_visible(timeout=1500):
                secret_input = locator
                break
        except Exception:
            continue
    if secret_input is None:
        raise RuntimeError('secret input not found on login page')
    secret_input.fill(SECRET)
    page.get_by_role('button', name='로그인').click()
    page.wait_for_timeout(1500)
    # Wait for main UI (생성 button) to show.
    page.get_by_role('button', name='생성').first.wait_for(state='visible', timeout=15000)
    log('로그인 완료')


def ensure_16_9(page: Page) -> None:
    """Pick 16:9 from the ratio dropdown / select."""
    # Try native <select>
    for sel in page.locator('select').all():
        try:
            options = [o.strip() for o in sel.evaluate('el => Array.from(el.options).map(o => o.textContent)')]
            if any('16:9' in o for o in options):
                sel.select_option(label=next(o for o in options if '16:9' in o))
                return
        except Exception:
            continue
    # Try button/menu style dropdown
    try:
        btn = page.get_by_role('button', name='16:9').first
        if btn.is_visible(timeout=500):
            btn.click()
            return
    except Exception:
        pass
    # Try clicking a dropdown that shows ratio and then 16:9 option.
    try:
        for candidate in ['1:1', '9:16']:
            try:
                trigger = page.get_by_role('button', name=candidate).first
                if trigger.is_visible(timeout=500):
                    trigger.click()
                    page.wait_for_timeout(300)
                    page.get_by_text('16:9', exact=True).first.click()
                    return
            except Exception:
                continue
    except Exception:
        pass
    log('경고: 16:9 선택 로직 실패 (기본값 유지)')


def find_prompt_textbox(page: Page):
    # Prompt textbox: usually a <textarea>.
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
    """Return the download URL once the result appears."""
    deadline = time.time() + timeout_s
    dl_link = page.get_by_role('link', name='이미지 다운로드').first
    while time.time() < deadline:
        try:
            if dl_link.is_visible(timeout=500):
                href = dl_link.get_attribute('href')
                if href:
                    return href
        except Exception:
            pass
        # Check for error state text
        try:
            err = page.get_by_text('오류', exact=False).first
            if err.is_visible(timeout=200):
                raise RuntimeError('page shows 오류 state')
        except PWTimeout:
            pass
        except Exception:
            pass
        time.sleep(5)
    raise TimeoutError(f'생성 결과가 {timeout_s}초 내 나타나지 않음')


def scp_to_ha(local: Path, remote_name: str) -> bool:
    remote = f'{HA_HOST}:{HA_DEST}/{remote_name}'
    cmd = [
        'scp',
        '-i', HA_KEY,
        '-o', f'ProxyJump={HA_PROXY}',
        '-o', 'StrictHostKeyChecking=no',
        str(local),
        remote,
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if r.returncode != 0:
            log(f'  scp 실패: {r.stderr.strip()}')
            return False
        return True
    except Exception as e:
        log(f'  scp 예외: {e}')
        return False


def generate_one(page: Page, name: str, prompt: str) -> bool:
    log(f'▶ {name}')
    try:
        tb = find_prompt_textbox(page)
        tb.click()
        tb.fill('')
        tb.fill(prompt)
        ensure_16_9(page)
        page.get_by_role('button', name='생성').first.click()
        url = wait_for_result(page)
        if not url.startswith('http'):
            # Relative → resolve against origin.
            url = 'https://auto-grapher.com' + url
        resp = page.request.get(url)
        if resp.status != 200:
            log(f'  다운로드 실패 status={resp.status}')
            return False
        data = resp.body()
        out_path = HERE / f'{name}.png'
        out_path.write_bytes(data)
        log(f'  저장 완료 ({len(data)} bytes) → {out_path}')
        if scp_to_ha(out_path, f'{name}.png'):
            log('  HA 업로드 완료')
        return True
    except Exception as e:
        log(f'  실패: {e}')
        # Try to reset UI: reload page (session cookies persist).
        try:
            page.reload()
            page.wait_for_load_state('networkidle', timeout=10000)
            if not is_logged_in(page):
                login(page)
        except Exception as re:
            log(f'  reload 실패: {re}')
        return False


def main() -> int:
    prompts = list(all_prompts())
    total = len(prompts)
    log(f'=== 파이프라인 시작: total={total} ===')
    success = 0
    skipped = 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1400, 'height': 900})
        page = context.new_page()
        page.set_default_timeout(15000)
        page.goto(SITE, wait_until='networkidle')

        if not is_logged_in(page):
            login(page)

        for name, prompt in prompts:
            out_path = HERE / f'{name}.png'
            if out_path.exists():
                log(f'⏭ 스킵 (이미 존재): {name}')
                skipped += 1
                # Still try scp in case remote missing? Skip to keep idempotent+fast.
                continue
            if not is_logged_in(page):
                try:
                    login(page)
                except Exception as e:
                    log(f'재로그인 실패: {e}')
                    break
            if generate_one(page, name, prompt):
                success += 1
            # small pause between generations
            time.sleep(2)

        context.close()
        browser.close()

    log(f'=== 완료: success={success} skipped={skipped} total={total} ===')
    print(f'{success}/{total}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
