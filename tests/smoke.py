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
    # co-op set-up cards (explainer, then step up or stay for each player), or the flame choice
    for _k in range(6):
        if not overlay_on(pg):
            break
        t = pg.inner_text('#overlayBox')
        if 'Together against' in t or 'how will you roll' in t or 'Choose your' in t:
            btns = pg.locator('#overlayBox button')
            btns.nth(_k % btns.count() if 'how will you roll' in t else 0).click(); pg.wait_for_timeout(250)
        else:
            break
    for _ in range(120):
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
            if _ % 2:   # every other answer with the quill
                pg.click('#quillBtn'); pg.wait_for_timeout(200)
                quill_write(pg, str(ans)); pg.wait_for_timeout(1200)
            else:
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


def play_clock(pg):
    import math
    def xy(box, deg, r):
        a = math.radians(deg - 90); k = box['width'] / 250
        return box['x'] + box['width'] / 2 + r * math.cos(a) * k, box['y'] + box['height'] / 2 + r * math.sin(a) * k
    def drag(box, a_from, r_from, a_to, r_to):
        pg.mouse.move(*xy(box, a_from, r_from)); pg.mouse.down()
        pg.mouse.move(*xy(box, a_to, r_to), steps=6); pg.mouse.up()
    for n in range(12):
        if overlay_on(pg):
            return True
        st = pg.evaluate("Modules.list.clock.peek()")
        if not st or st['busy']:
            pg.wait_for_timeout(700); continue
        box = pg.locator('#ckFace').bounding_box(); t = st['target']
        if n == 1:                      # one deliberate wrong answer to test the feedback path
            pg.click('#ckCheck'); pg.wait_for_timeout(200); continue
        if pg.locator('#ckG1').is_visible() and n == 2:
            pg.click('#ckG1'); pg.wait_for_timeout(200)
        # minute hand first (tip at r=74), then the hour hand (tip at r=46)
        drag(box, st['m'] * 6, 70, t['m'] * 6, 70)
        st = pg.evaluate("Modules.list.clock.peek()")
        ha = (st['h'] % 12) * 30 + st['m'] * .5
        drag(box, ha, 40, (t['h'] % 12) * 30 + t['m'] * .5, 40)
        st = pg.evaluate("Modules.list.clock.peek()")
        if (st['h'], st['m']) != (t['h'], t['m']):
            print('   clock drag mismatch', st, t)
        pg.click('#ckCheck'); pg.wait_for_timeout(2100)
    return overlay_on(pg)


def quill_write(pg, text, wobble=0):
    """Answer an open quill card by writing `text` (picking it first on the guided levels)."""
    if pg.locator('#quillLayer .qpad button.go').count():
        for k in text:
            pg.locator(f"#quillLayer .qpad button:text-is('{k}')").first.click()
        pg.click('#quillLayer .qpad button.go'); pg.wait_for_timeout(200)
    for i, ch in enumerate(text):
        strokes = pg.evaluate(f"Glyphs.DIGITS['{ch}'].strokes")
        box = pg.locator('#quillLayer .qcell canvas').nth(i).bounding_box()
        for st in strokes:
            pts = [(box['x'] + x / 100 * box['width'], box['y'] + y / 140 * box['height']) for x, y in st]
            pg.mouse.move(*pts[0]); pg.mouse.down()
            for p in pts[1:]:
                pg.mouse.move(*p)
            pg.mouse.up()
    pg.click('#quillLayer .qdone'); pg.wait_for_timeout(250)
    # if the quill asks "is this a X or a Y?", pick the right one
    q = pg.locator('#quillLayer .qquestion .qopts button')
    if q.count():
        for i in range(q.count()):
            if q.nth(i).inner_text().strip() in text:
                q.nth(i).click(); break


def play_scribe(pg):
    for _ in range(30):
        if overlay_on(pg):
            return True
        if pg.evaluate("Quill.isOpen()") and pg.locator('#quillLayer .qdone').count() + pg.locator('#quillLayer .qpad .go').count():
            target = pg.inner_text('#quillLayer .qprompt').split()[1]
            if not target.isdigit():
                target = str(['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'].index(target))
            quill_write(pg, target)
        pg.wait_for_timeout(1300)
    return overlay_on(pg)


def final_overlay(pg, *words):
    return overlay_on(pg) and any(w in pg.inner_text('#overlayBox') for w in words)


def try_until(pg, sel):
    """Click enabled candidates one by one until one sticks (wrong ones get disabled)."""
    loc = pg.locator(sel)
    for i in range(loc.count()):
        el = loc.nth(i)
        if el.is_enabled() and el.is_visible():
            el.click(); pg.wait_for_timeout(250)
            if overlay_on(pg) or 'yes' in (el.get_attribute('class') or ''):
                return


def play_mystery(pg):
    for _ in range(40):
        if final_overlay(pg, '+1 Scholar badge'):
            return True
        if overlay_on(pg):
            pg.locator('#overlayBox button').first.click(); pg.wait_for_timeout(300); continue
        if pg.locator('#myScene [data-k]').count():
            try_until(pg, '#myScene [data-k]'); pg.wait_for_timeout(1000); continue
        try_until(pg, '#myScene [data-id]'); pg.wait_for_timeout(1100)
    return final_overlay(pg, '+1 Scholar badge')


def play_lilypad(pg):
    for _ in range(80):
        if overlay_on(pg):
            return True
        try_until(pg, '#lpPads button'); pg.wait_for_timeout(150)
        if pg.locator('#lpPads button').count() == 0:
            pg.wait_for_timeout(1300)
    return overlay_on(pg)


def play_addigator(pg):
    for _ in range(30):
        if final_overlay(pg, 'snoring', 'awake'):
            return True
        if overlay_on(pg):
            pg.locator('#overlayBox button').first.click(); pg.wait_for_timeout(300); continue
        if not pg.locator('.aggator.cur').count():
            pg.wait_for_timeout(600); continue
        last = int(pg.inner_text('.aggator.cur .agtag b'))
        if pg.locator('#agBuild .agslots').count():
            cards = pg.locator('#agOpts .agcard')
            order = sorted(range(cards.count()), key=lambda i: -int(cards.nth(i).inner_text()))
            for i in order:
                cards.nth(i).click(); pg.wait_for_timeout(80)
            pg.click('#agFeed')
        else:
            cards = pg.locator('#agOpts .agcard')
            for i in range(cards.count()):
                if int(cards.nth(i).get_attribute('data-v')) > last:
                    cards.nth(i).click(); break
        pg.wait_for_timeout(1500)
    return final_overlay(pg, 'snoring', 'awake')


def play_mozzies(pg):
    n = 0
    for _ in range(30):
        if overlay_on(pg):
            return True
        if pg.locator('.mzpick').count():
            vals = [int(x) for x in pg.locator('.mzpick').evaluate_all("els=>els.map(e=>e.dataset.v)")]
            pg.locator('.mzpick').nth(vals.index(max(vals))).click()
        elif pg.locator('#mzDone').count():
            t = int(pg.inner_text('.mzbig'))
            for _i in range(t // 10): pg.click('#mzT')
            for _i in range(t % 10): pg.click('#mzO')
            pg.click('#mzDone')
        elif pg.locator('.mzpad').count():
            v = 10 * pg.locator('#mzShow .mzjar').count() + pg.locator('#mzShow .mzfly').count()
            n += 1
            if n % 2:
                pg.click('#mzQuill'); pg.wait_for_timeout(200); quill_write(pg, str(v)); pg.wait_for_timeout(1300)
            else:
                for ch in str(v): pg.locator('.mzpad button', has_text=re.compile('^' + ch + '$')).click()
                pg.locator('.mzpad button.go').click()
        pg.wait_for_timeout(1400)
    return overlay_on(pg)


PLAY = {'mystery': play_mystery, 'lilypad': play_lilypad, 'addigator': play_addigator, 'mozzies': play_mozzies, 'scribe': play_scribe, 'duel': play_duel, 'wordsearch': play_wordsearch, 'rhyme': play_rhyme, 'clock': play_clock}


def play_current(pg):
    """Play whatever encounter is running, then close its result card."""
    mid = pg.evaluate("Modules.current&&Modules.current.m.id")
    if not mid:
        return False
    if PLAY[mid](pg):
        click_overlay_last(pg); pg.wait_for_timeout(700)
    return True


def test_multiplayer(pg, failures):
    """Hotseat players: save upgrade, adding a player, turns, and a boss fight played together."""
    idx = (ROOT / 'index.html').as_uri()
    pg.goto(idx); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.fill('#typedName', 'Ann'); pg.click('#startBtn'); pg.wait_for_timeout(400)
    # an old one-player save (no players list) becomes player 1, keeping everything
    pg.evaluate("(()=>{S.wiz=5;S.run.prot=2;const o=JSON.parse(JSON.stringify(S));delete o.players;delete o.turn;"
                "localStorage.setItem(SAVE_KEY,JSON.stringify(o));location.reload();})()")
    pg.wait_for_timeout(800)
    st = pg.evaluate("[S.players.length,S.players[0].name,S.players[0].wiz,S.run.prot]")
    print('upgrade to players:', st)
    if st != [1, 'Ann', 5, 2]:
        failures.append('multiplayer: one-player save upgrade')
    if overlay_on(pg):
        click_overlay_last(pg)
    # add a second player
    pg.click('#playersBtn'); pg.locator('#overlayBox button', has_text='Add a player').click(); pg.wait_for_timeout(300)
    pg.fill('#typedName', 'Ben'); pg.click('#startBtn'); pg.wait_for_timeout(400)
    st = pg.evaluate("[S.players.length,S.turn,S.name,S.players[1].name,S.players[0].colour!==S.players[1].colour]")
    print('added:', st)
    if st != [2, 0, 'Ann', 'Ben', True]:
        failures.append('multiplayer: adding a player')
    click_overlay_last(pg); pg.wait_for_timeout(200)
    # Ann plays one encounter, then it's Ben's turn
    for who, nxt in (('Ann', 'Ben'), ('Ben', 'Ann')):
        pg.locator('#mapSvg .node.avail').first.click(); pg.wait_for_timeout(500)
        play_current(pg)
        txt = pg.inner_text('#overlayBox') if overlay_on(pg) else ''
        st = pg.evaluate("[S.name,S.players.map(p=>p.name)]")
        print(f'after {who}:', st[0], '| card:', txt.split(chr(10))[0][:40])
        if st[0] != nxt or ('Over to ' + nxt) not in txt:
            failures.append(f'multiplayer: turn did not pass from {who} to {nxt}')
        if overlay_on(pg):
            click_overlay_last(pg); pg.wait_for_timeout(200)
    # a boss fight together: put Ann next to the forest boss
    before = pg.evaluate("S.players.map(p=>p.wiz)")
    pg.evaluate("""(()=>{const N=S.run.nodes,b=N.find(n=>n.region==='forest'&&n.t==='boss'),a=N.find(n=>n.next.includes(b.id));
      [a.id].forEach(i=>{if(!S.run.visited.includes(i))S.run.visited.push(i);});a.cleared=true;S.run.pos=a.id;goMap();enterNode(b.id);})()""")
    pg.wait_for_timeout(400)
    invite = pg.inner_text('#overlayBox')
    if 'Fight together' not in invite:
        failures.append('multiplayer: no invite at the boss')
    pg.locator('#overlayBox button.fire').click(); pg.wait_for_timeout(400)
    play_current(pg)
    team = pg.evaluate("document.getElementById('teamRow').children.length")
    after = pg.evaluate("S.players.map(p=>p.wiz)")
    txt = pg.inner_text('#overlayBox') if overlay_on(pg) else ''
    won = 'Travel on together' in txt
    print('co-op boss: team', team, '| won' if won else '| lost', '| wiz', before, '->', after)
    if team != 2:
        failures.append('multiplayer: co-op duel team')
    if won:
        if [a - b for a, b in zip(after, before)] != [2, 2]:
            failures.append('multiplayer: co-op rewards not shared')
        pg.locator('#overlayBox button.fire').click(); pg.wait_for_timeout(500)
        regs = pg.evaluate("S.players.map((p,i)=>S.run.nodes[(i===S.turn?S.run.pos:p.r.pos)].region)")
        print('travelled together to:', regs)
        if regs != ['frost', 'frost']:
            failures.append('multiplayer: travel together')
    else:
        rest = pg.evaluate("Object.keys(S.run.bossRest).length")
        if not rest:
            failures.append('multiplayer: lost boss should rest')
    if overlay_on(pg) and 'Over to' in pg.inner_text('#overlayBox'):
        print('turn passed after the boss fight')
    else:
        failures.append('multiplayer: no turn change after the boss fight')


def main():
    failures = []
    with sync_playwright() as p:
        b = p.chromium.launch(**({'executable_path': EXE} if EXE else {}))
        pg = b.new_page(viewport={'width': 1024, 'height': 768})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto((ROOT / 'sandbox.html').as_uri())
        mods = pg.evaluate("Object.values(Modules.list).map(m=>[m.id,Object.keys(m.presets)])")
        runs = [(mid, pre, lv) for mid, presets in mods for pre in presets
                for lv in (['1', '2', '3'] if mid == 'scribe' and pre in ('All digits 0–9', 'Two-digit numbers (10–20)') else ['1'])]
        for mid, pre, lv in runs:
            if True:
                pg.select_option('#sbModule', mid); pg.select_option('#sbPreset', pre); pg.select_option('#sbQuill', lv)
                pg.click('#sbPlay'); pg.wait_for_timeout(400)
                ok = PLAY[mid](pg)
                if ok:
                    click_overlay_last(pg); pg.wait_for_timeout(300)
                on_results = pg.evaluate("document.getElementById('sbResults').classList.contains('on')")
                summary = pg.inner_text('#sbSummary').replace('\n', ' | ') if on_results else ''
                print(('OK  ' if on_results else 'FAIL'), mid, '·', pre, '· quill', lv, '·', summary[:110])
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
        # the Haunted Hollow and Croakmire Swamp: reachable, and every new kind of stop plays through
        info = pg.evaluate("""(()=>{const N=S.run.nodes;const g=N.find(n=>n.region==='forest'&&n.t==='exit'&&N[n.to].region==='hollow');
          const h=N.filter(n=>n.region==='hollow'), w=N.filter(n=>n.region==='swamp');
          const hx=h.find(n=>n.t==='exit'), wb=w.find(n=>n.t==='back');
          return {gate:!!g, hollow:h.length, swamp:w.length, toSwamp:hx&&N[hx.to].region, backOk:wb&&N[wb.to].id===hx.id,
                  kinds:[...new Set([...h,...w].map(n=>n.t))].sort().join(' ')};})()""")
        print('world:', info)
        if not (info['gate'] and info['hollow'] and info['swamp'] and info['toSwamp'] == 'swamp' and info['backOk']):
            failures.append('world: hollow/swamp not wired')
        for t, mid in [('clock', 'clock'), ('mystery', 'mystery'), ('lily', 'lilypad'), ('mozzie', 'mozzies'), ('gators', 'addigator')]:
            nid = pg.evaluate(f"(S.run.nodes.find(n=>n.t==='{t}')||{{}}).id")
            if nid is None:
                continue
            pg.evaluate(f"(()=>{{const n=S.run.nodes[{nid}];n.cleared=false;S.run.pos=S.run.nodes.find(x=>x.region===n.region&&x.t==='start').id;startEncounter(n);S.run.pos={nid};}})()")
            pg.wait_for_timeout(500)
            ok = PLAY[mid](pg)
            if ok:
                click_overlay_last(pg); pg.wait_for_timeout(600)
            if overlay_on(pg):
                click_overlay_last(pg); pg.wait_for_timeout(400)
            on_map = pg.evaluate("document.getElementById('map').classList.contains('on')")
            print(('OK  ' if on_map else 'FAIL'), 'game encounter', t)
            if not on_map:
                failures.append(f'game: {t} did not return to the map')
        g = pg.evaluate("S.run.ghost")
        print('ghost friends after clocks:', g)
        # an old world-2 save is upgraded in place, keeping forest progress
        up = pg.evaluate("""(()=>{const nodes=[];
          const F=genRegion('forest',7,[{key:'hollow',layer:2,top:true},{key:'meadow',layer:4,top:false}],nodes);
          const R=genRegion('frost',5,[{key:'tundra',layer:2,top:true}],nodes);F.exit.to=R.start.id;
          S.run={world:2,nodes,pos:F.start.id,visited:[F.start.id,F.start.next[0]],seen:[],cleared:[F.start.next[0]],bossRest:{},rest:[],prot:4,arch:1,
                 deco:{forest:makeDeco('forest'),frost:makeDeco('frost')}};
          migrateRun();return {world:S.run.world,prot:S.run.prot,visited:S.run.visited.length,hollow:S.run.nodes.some(n=>n.region==='hollow')};})()""")
        print('upgrade:', up)
        if not (up['world'] == 3 and up['prot'] == 4 and up['visited'] == 2 and up['hollow']):
            failures.append('world: world-2 save upgrade failed')
        pg.evaluate("goMap()"); pg.wait_for_timeout(300)
        test_multiplayer(pg, failures)
        b.close()
    if errors:
        print('PAGE ERRORS:', *errors, sep='\n  ')
    if failures or errors:
        print('FAILED:', failures); sys.exit(1)
    print('All scenes finished without errors.')


if __name__ == '__main__':
    main()
