#!/usr/bin/env python3
"""Update cardnews-lab dashboard: rename hero_image on specific cards.

Uses card-signature matching (title/title_template/category/subtitle_template
sub-strings) to unambiguously find each target card and replace hero_image.
"""
from __future__ import annotations
import os, sys, json, asyncio, websockets
from pathlib import Path

# Load HA token from env file if not set
def load_env():
    env = os.environ.copy()
    p = Path('/opt/ha-agent/secrets/ha-agent.env')
    if p.exists():
        for line in p.read_text().splitlines():
            if '=' in line and not line.strip().startswith('#'):
                k,v = line.split('=',1)
                env.setdefault(k.strip(), v.strip())
    return env

ENV = load_env()

# Batch mappings: (view_path, matcher_dict, new_hero_image)
# matcher_dict: subset of keys that must equal or substring-match in the card
UPDATES = {
    'hero-media': [
        ('media', {'title': 'Music Assistant'}, 'hero-media-ma-hub'),
        ('media', {'title_template_has': 'android_tv_192_168_0_38'}, 'hero-media-shield-tv-living'),
        ('media', {'title_template_has': 'geosil_tv_kq85qnf90afxkr'}, 'hero-media-samsung-tv-living'),
        ('media', {'title_template_has': 'cimsil_gugeul_tv_2'}, 'hero-media-google-tv-bedroom'),
        ('media', {'title_template_has': 'geosil_seupikeo_3'}, 'hero-media-speaker-nowplaying'),
    ],
    'hero-summary': [
        ('summary', {'title_template_has': 'seungpyo_jinjja_jaesil'}, 'hero-summary-family'),
        ('energy',  {'title': '월간 소비'}, 'hero-summary-energy'),
        ('energy',  {'title_template_has': '누진'}, 'hero-summary-tier'),
    ],
    'hero-airquality': [
        ('summary', {'title_template_has': 'geosil_gonggijil_d2c0_pm2_5'}, 'hero-airquality-summary'),
        ('airquality', {'title': '거실 공기질'}, 'hero-airquality-living'),
        ('airquality', {'title': '안방 공기질'}, 'hero-airquality-bedroom'),
    ],
    'hero-life': [
        ('life', {'title': '버스 도착 현황'}, 'hero-life-bus'),
        ('life', {'title': '날씨'}, 'hero-life-weather'),
        ('life', {'title': '오늘의 일정'}, 'hero-life-schedule'),
    ],
    'hero-calendar': [
        ('calendar', {'title': '이번 주 일정'}, 'hero-calendar-week'),
        ('calendar', {'title': '가계부'}, 'hero-calendar-finance'),
        ('calendar', {'title': '스포츠 & 취미'}, 'hero-calendar-sports'),
    ],
    'hero-energy': [
        ('energy',  {'title': '현재 전력'}, 'hero-energy-live'),
        ('summary', {'title_template_has': 'jeongi_yogeum_gyesangi_kwhto_forecast_won'}, 'hero-energy-periods'),
    ],
    'hero-appliance': [
        ('energy', {'title': '가전별 실시간 전력'}, 'hero-appliance-live'),
        ('energy', {'title': '가전별 이달 사용량'}, 'hero-appliance-monthly'),
    ],
    'hero-lotto': [
        ('lotto', {'title': '로또 6/45 최신 회차'}, 'hero-lotto-latest'),
        ('lotto', {'title': '자동 구매'}, 'hero-lotto-auto'),
    ],
}


def match_card(card, matcher):
    for key, want in matcher.items():
        if key == 'title_template_has':
            tt = card.get('title_template','')
            if want not in tt: return False
        elif key.endswith('_has'):
            base = key[:-4]
            if want not in str(card.get(base,'')): return False
        else:
            if card.get(key) != want: return False
    return True


def apply_updates(cfg, updates_for_batches):
    """updates_for_batches: list of (view_path, matcher, new_name)"""
    changes = []
    misses = []
    for view_path, matcher, new_name in updates_for_batches:
        view = next((v for v in cfg['views'] if v.get('path')==view_path), None)
        if view is None:
            misses.append((view_path, matcher, 'view not found')); continue
        found = []
        def walk(node):
            if isinstance(node, dict):
                if match_card(node, matcher) and 'hero_image' in node:
                    found.append(node)
                for v in node.values():
                    if isinstance(v,(dict,list)): walk(v)
            elif isinstance(node,list):
                for v in node: walk(v)
        walk(view)
        if not found:
            misses.append((view_path, matcher, 'no card matched')); continue
        if len(found) > 1:
            misses.append((view_path, matcher, f'{len(found)} cards matched')); continue
        old = found[0].get('hero_image')
        found[0]['hero_image'] = new_name
        changes.append((view_path, old, new_name, matcher))
    return changes, misses


async def fetch_and_update(batch_keys):
    tok = ENV['HA_TOKEN']
    updates_flat = []
    for b in batch_keys:
        updates_flat.extend(UPDATES[b])
    async with websockets.connect('wss://ha.happy4ed.com/api/websocket', max_size=20_000_000) as ws:
        await ws.recv()
        await ws.send(json.dumps({'type':'auth','access_token':tok}))
        auth = json.loads(await ws.recv())
        assert auth.get('type')=='auth_ok', auth
        await ws.send(json.dumps({'id':1,'type':'lovelace/config','url_path':'cardnews-lab'}))
        resp = json.loads(await ws.recv())
        cfg = resp['result']
        changes, misses = apply_updates(cfg, updates_flat)
        print('CHANGES:', len(changes))
        for c in changes: print(' ', c)
        if misses:
            print('MISSES:')
            for m in misses: print(' ', m)
        if not changes:
            print('No changes; skipping save.'); return
        await ws.send(json.dumps({'id':2,'type':'lovelace/config/save','url_path':'cardnews-lab','config':cfg}))
        save = json.loads(await ws.recv())
        print('SAVE:', save.get('success'), save.get('error'))


if __name__ == '__main__':
    batches = sys.argv[1:]
    if not batches:
        print('usage: update_dashboard.py <batch1> [batch2 ...]'); sys.exit(1)
    asyncio.run(fetch_and_update(batches))
