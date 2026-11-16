"""Smoke test: plays every preset of every module in the sandbox, then a short run of the game.

Usage:  pip install playwright && playwright install chromium
        python tests/smoke.py [path-to-repo]
Exits non-zero if any page error happens or a scene does not finish.
"""
import re, sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parents[1])
import os
EXE = os.environ.get('CHROME_PATH')
DIRS = [(0, 1), (1, 0), (1, 1), (-1, 1), (0, -1), (-1, 0), (-1, -1), (1, -1)]


def overlay_on(pg):
    return pg.evaluate("document.getElementById('overlay').classList.contains('on')")


def click_overlay_last(pg):
    pg.locator('#overlayBox button').last.click()


def play_duel(pg):
    if overlay_on(pg):  # flame choice
        pg.locator('#overlayBox button').first.click()
    for _ in range(80):
        if overlay_on(pg):
            return True
        if pg.is_visible('#rollBtn'):
            pg.click('#rollBtn')
            pg.wait_for_timeout(900)
            if overlay_on(pg):
                return True
            q = pg.inner_text('#question')
            if 'Frozen solid' in q:
                pg.wait_for_timeout(1800)
                continue
            m = re.search(r"heat is (\d+)\.\s*You rolled ([\d and]+)\.", q.replace('\n', ' '))
            if not m:
                pg.wait_for_timeout(300)
                continue
            heat = int(m.group(1)); rolls = [int(x) for x in re.findall(r'\d+', m.group(2))]
            ans = heat - sum(rolls) if 'Cool' in q else heat + sum(rolls)
            for ch in str(ans):
                pg.locator('#pad button', has_text=re.compile('^' + ch + '$')).click()
            pg.locator('#pad button', has_text='✓').click()
            pg.wait_for_timeout(2600)
        else:
            pg.wait_for_timeout(400)
    return overlay_on(pg)


def play_wordsearch(pg):
    cells = pg.eval_on_selector_all('#grid .cell', 'els=>els.map(e=>[+e.dataset.r,+e.dataset.c,e.textContent])')
    n = max(r for r, _, _ in cells) + 1
    grid = [[''] * n for _ in range(n)]
    for r, c, ch in cells:
        grid[r][c] = ch
    words = pg.eval_on_selector_all('#wordList .word', 'els=>els.map(e=>e.textContent)')
    for w in words:
        found = None
        for r in range(n):
            for c in range(n):
                for dr, dc in DIRS:
                    rr, cc = r + dr * (len(w) - 1), c + dc * (len(w) - 1)
                    if 0 <= rr < n and 0 <= cc < n and all(grid[r + dr * i][c + dc * i] == w[i] for i in range(len(w))):
                        found = (r, c, rr, cc)
                        break
                if found: break
            if found: break
        if not found:
            continue
        a = pg.locator(f'#grid .cell[data-r="{found[0]}"][data-c="{found[1]}"]').bounding_box()
        b = pg.locator(f'#grid .cell[data-r="{found[2]}"][data-c="{found[3]}"]').bounding_box()
        pg.mouse.move(a['x'] + a['width'] / 2, a['y'] + a['height'] / 2); pg.mouse.down()
        pg.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2, steps=8); pg.mouse.up()
        pg.wait_for_timeout(120)
    pg.click('#searchDone')
    pg.wait_for_timeout(300)
    return overlay_on(pg)


def play_rhyme(pg):
    for _ in range(12):
        if overlay_on(pg):
            return True
        before = pg.inner_text('#rhymeInfo')
        for i in range(pg.locator('#rhymeOpts .ropt').count()):
            pg.locator('#rhymeOpts .ropt').nth(i).click()
            pg.wait_for_timeout(150)
            if 'got' in (pg.get_attribute('#blank', 'class') or ''):
                break
        pg.wait_for_timeout(1700)
    return overlay_on(pg)


PLAY = {'duel': play_duel, 'wordsearch': play_wordsearch, 'rhyme': play_rhyme}


def main():
    failures = []
    with sync_playwright() as p:
        b = p.chromium.launch(**({'executable_path': EXE} if EXE else {}))
        pg = b.new_page(viewport={'width': 1024, 'height': 768})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto((ROOT / 'sandbox.html').as_uri())
        mods = pg.evaluate("Object.values(Modules.list).map(m=>[m.id,Object.keys(m.presets)])")
        for mid, presets in mods:
            for pre in presets:
                pg.select_option('#sbModule', mid); pg.select_option('#sbPreset', pre)
                pg.click('#sbPlay'); pg.wait_for_timeout(400)
                ok = PLAY[mid](pg)
                if ok:
                    click_overlay_last(pg); pg.wait_for_timeout(300)
                on_results = pg.evaluate("document.getElementById('sbResults').classList.contains('on')")
                summary = pg.inner_text('#sbSummary').replace('\n', ' | ') if on_results else ''
                print(('OK  ' if on_results else 'FAIL'), mid, '·', pre, '·', summary[:110])
                if not on_results:
                    failures.append(f'{mid} / {pre}')
                    pg.goto((ROOT / 'sandbox.html').as_uri())
                else:
                    pg.click('#sbBack')
        # the game itself: new player, one encounter from the map, retreat
        pg.goto((ROOT / 'index.html').as_uri())
        pg.evaluate("localStorage.clear()"); pg.reload()
        pg.fill('#typedName', 'Smoke'); pg.click('#startBtn'); pg.wait_for_timeout(400)
        pg.locator('#mapSvg .node.avail').first.click(); pg.wait_for_timeout(500)
        if overlay_on(pg):
            pg.locator('#overlayBox button').first.click(); pg.wait_for_timeout(300)
        pg.locator('.screen.on .retreatBtn').click(); pg.locator('#overlayBox button.fire').click(); pg.wait_for_timeout(500)
        if not pg.evaluate("document.getElementById('map').classList.contains('on')"):
            failures.append('game: retreat did not return to map')
        b.close()
    if errors:
        print('PAGE ERRORS:', *errors, sep='\n  ')
    if failures or errors:
        print('FAILED:', failures); sys.exit(1)
    print('All scenes finished without errors.')


if __name__ == '__main__':
    main()
