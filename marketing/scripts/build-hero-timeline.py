#!/usr/bin/env python3
"""Build the hero's clock from the recorded slice.

Reads assets/evidence/hero-slice.json and marketing/motion/hero-loop/pacing.json,
and writes:
  - marketing/motion/hero-loop/timing.json: the clock, the cards, the wires and
    the status line, as numbers;
  - the equal TIMING copy inside assets/product-first.js (between the
    BEGIN TIMING and END TIMING markers), because the site publishes only assets/.

Every card and wire cites the seq numbers it draws. Idle time is compressed;
the order of events never changes. Run from the repository root:
  python3 marketing/scripts/build-hero-timeline.py
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLICE = json.loads((ROOT / 'assets/evidence/hero-slice.json').read_text())
PACE = json.loads((ROOT / 'marketing/motion/hero-loop/pacing.json').read_text())


def secs(t):
    h, m, s = t.split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def short(t):
    return t[:8]


def derive_cards(events):
    """Turns log events into cards, lane by lane, in time order."""
    lanes = list(SLICE['lanes'])
    by_lane = {l: [e for e in events if e['lane'] == l] for l in lanes}
    cards = []
    for lane, evs in by_lane.items():
        lease_lines = {}
        held_paths = {}   # path -> held card, until the save after it
        reread = set()
        items = []
        for e in evs:
            t = secs(e['time'])
            if e['type'] == 'lease_granted' and e.get('lines'):
                lease_lines[e['paths'][0]] = (e['seq'], e['lines'])
            elif e['type'] == 'operation_observed' and e.get('result') is None and e['tool'] in ('Edit', 'Write'):
                path = e['paths'][0]
                seqs, lines = [e['seq']], []
                if path in lease_lines:
                    seqs.insert(0, lease_lines[path][0]); lines = lease_lines.pop(path)[1]
                if path in held_paths:
                    items.append({'kind': 'saved', 'path': path, 't': t, 'time': e['time'], 'seq': seqs, 'lines': lines, 'after': held_paths.pop(path)})
                else:
                    items.append({'kind': 'edit', 'path': path, 't': t, 'time': e['time'], 'seq': seqs, 'lines': lines})
            elif e['type'] == 'operation_observed' and e['tool'] == 'Bash':
                items.append({'kind': 'command', 'paths': e.get('paths', []), 't': t, 'time': e['time'], 'seq': [e['seq']]})
            elif e['type'] == 'write_refused':
                card = {'kind': 'held', 'path': e['paths'][0], 't': t, 'time': e['time'], 'seq': [e['seq']], 'reason': e.get('reason'), 'by': e.get('held_by_change_from')}
                items.append(card); held_paths[e['paths'][0]] = card
            elif e['type'] == 'source_observed' and e.get('origin') == 'read':
                for p in e.get('paths', []):
                    if p in held_paths and p not in reread:
                        reread.add(p)
                        items.append({'kind': 'read', 'path': p, 't': t, 'time': e['time'], 'seq': [e['seq']]})
            elif e['type'] == 'message_sent':
                items.append({'kind': 'sent', 'to': e.get('to'), 'paths': e.get('paths', []), 't': t, 'time': e['time'], 'seq': [e['seq']]})
            elif e['type'] == 'message_acknowledged':
                items.append({'kind': 'got', 'from_seq': e.get('acknowledges'), 't': t, 'time': e['time'], 'seq': [e['seq']]})
        # Group runs of edits of one file, a few seconds apart, into one card.
        grouped = []
        for it in items:
            prev = grouped[-1] if grouped else None
            if (it['kind'] == 'edit' and prev and prev['kind'] == 'edit' and prev['path'] == it['path']
                    and it['t'] - prev['t_last'] <= PACE['group_edits_within_s']):
                prev['seq'] += it['seq']; prev['lines'] += it['lines']; prev['count'] += 1
                prev['t_last'] = it['t']; prev['time_last'] = it['time']
                continue
            it = dict(it, lane=lane, count=1, t_last=it['t'], time_last=it['time'])
            grouped.append(it)
        cards += grouped
    cards.sort(key=lambda c: (c['t'], lanes.index(c['lane'])))
    return cards, lanes


def merge_lines(lines):
    out = []
    for a, b in sorted(lines):
        if out and a <= out[-1][1]:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def describe(c, lanes):
    """The card's words and its details, all from the log."""
    name = lambda p: p.split('/')[-1]
    span = c['time'][:8] if c['count'] == 1 else f"{c['time'][:8]}–{c['time_last'][:8]}"
    file_row = lambda: ['File', c['path'] + (', lines ' + ', '.join(f'{a}–{b}' for a, b in merge_lines(c['lines'])) if c.get('lines') else '')]
    k = c['kind']
    if k == 'edit':
        return {'verb': 'Edited', 'code': c['path'], 'sub': f"{c['count']} edits" if c['count'] > 1 else '',
                'title': 'Edited', 'rows': [file_row(), ['Time', span + (f", {c['count']} edits" if c['count'] > 1 else '')]]}
    if k == 'command':
        return {'verb': 'Ran a command', 'code': '', 'sub': f"changed {len(c['paths'])} files" if c['paths'] else '',
                'title': 'Ran a command', 'rows': [['Changed', ', '.join(c['paths']) or 'no files'], ['Time', span]]}
    if k == 'held':
        rows = [['File', c['path']], ['Time', span], ['Why', c['reason'] or 'held']]
        return {'verb': 'Write held', 'code': c['path'], 'sub': c['reason'] or '', 'who': 'LangSpan', 'title': 'Write held', 'rows': rows}
    if k == 'read':
        return {'verb': 'Read', 'code': c['path'], 'sub': '', 'title': 'Read again', 'rows': [['File', c['path'] + ', the current version'], ['Time', span]]}
    if k == 'saved':
        return {'verb': 'Saved after re-reading', 'code': c['path'], 'sub': '', 'title': 'Saved after re-reading',
                'rows': [file_row(), ['Time', span], ['Started from', 'the current file']]}
    if k == 'sent':
        return {'verb': 'Sent a message', 'code': '', 'sub': 'to ' + c['to'].replace('Agent · ', ''), 'title': 'Sent a message',
                'rows': [['To', c['to']]] + ([['About', ', '.join(c['paths'])]] if c['paths'] else []) + [['Time', span]]}
    if k == 'got':
        return {'verb': 'Got a message', 'code': '', 'sub': 'with its next prompt', 'title': 'Got a message', 'rows': [['Time', span]]}
    raise ValueError(k)


def main():
    events = SLICE['events']
    cards, lanes = derive_cards(events)
    p = PACE
    # Compress idle time, never the order: each gap between cards plays as
    # gap_min + (gap_max - gap_min) * min(real gap, gap_cap) / gap_cap seconds.
    # Coordination moments add a stop after their card.
    t, prev_real, stops, flow = p['lead_in_s'], None, [], 0.0
    for i, c in enumerate(cards):
        if prev_real is not None:
            g = c['t'] - prev_real
            step = p['gap_min_s'] + (p['gap_max_s'] - p['gap_min_s']) * min(g, p['gap_cap_s']) / p['gap_cap_s']
            t += step; flow += step
        prev_real = c['t']
        c['at'] = round(t, 3); c['flow'] = round(flow, 3)
        stop = {'held': p['stop_held_s'], 'saved': p['stop_saved_s'], 'got': p['stop_message_s']}.get(c['kind'], 0)
        if c['kind'] == 'got' and not any(x['kind'] == 'sent' and x['seq'][0] == c['from_seq'] for x in cards):
            stop = 0
        if stop:
            stops.append([round(t, 3), round(t + stop, 3), c['kind']])
            t += stop
    duration = round(t + p['tail_s'], 3)
    flow_total = round(flow + p['tail_s'] + p['lead_in_s'], 3)
    # Wires: a held write to the other lane's latest card on that file (or that
    # lane's latest card), a message from the sent card to the card that got it.
    out_cards, wires = [], []
    for i, c in enumerate(cards):
        d = describe(c, lanes)
        cid = f'c{i}'
        out_cards.append({'id': cid, 'lane': lanes.index(c['lane']), 'kind': c['kind'], 'at': c['at'], 'flow': c['flow'],
                          'seq': c['seq'], 'time': c['time'][:8], **{k: v for k, v in d.items() if v}})
        c['id'] = cid
    for c in cards:
        if c['kind'] == 'held' and c.get('by'):
            src = [x for x in cards if x['lane'] == c['by'] and x['t'] <= c['t'] and x['kind'] in ('edit', 'saved') and x.get('path') == c['path']]
            # Without a card on that file in the window, the wire starts at the other lane's edge.
            stop = next(s for s in stops if s[0] == c['at'])
            wires.append({'kind': 'held', 'label': 'Held', 'from': src[-1]['id'] if src else None, 'from_lane': lanes.index(c['by']),
                          'to': c['id'], 'at': round(c['at'] + p['wire_delay_s'], 3), 'ms': p['wire_draw_ms'], 'stop': stop[:2],
                          'emphasis_at': round(c['at'] + p['wire_delay_s'] + p['wire_draw_ms'] / 1000 + p['emphasis_gap_s'], 3), 'seq': c['seq']})
        if c['kind'] == 'got':
            src = [x for x in cards if x['kind'] == 'sent' and x['seq'][0] == c['from_seq']]
            if src:
                stop = next(s for s in stops if s[0] == c['at'])
                wires.append({'kind': 'message', 'label': 'Message', 'from': src[0]['id'], 'to': c['id'],
                              'at': round(c['at'] + p['message_delay_s'], 3), 'ms': p['message_draw_ms'], 'stop': stop[:2], 'seq': src[0]['seq'] + c['seq']})
    # Status line: real counts at each card's time.
    refused = [secs(e['time']) for e in events if e['type'] == 'write_refused'] + [secs(t) for t in SLICE['before_window']['writes_held_in_previous_10_min_at']]
    status, last = [], None
    for c in cards:
        held = sum(1 for r in refused if c['t'] - 600 < r <= c['t'])
        start = secs(SLICE['window']['start'][11:19])
        early = set(SLICE['before_window']['lanes_working_in_previous_5_min']) if c['t'] - 300 < start else set()
        lanes_active = len({e['lane'] for e in events if c['t'] - 300 < secs(e['time']) <= c['t']} | early)
        s = [lanes_active, held]
        if s != last:
            status.append({'at': c['at'], 'agents': lanes_active, 'held': held}); last = s
    timing = {
        'name': 'hero-loop',
        'contract': 'The home page hero (assets/product-first.js) and its phone cut read these values. The hero exposes window.LangSpanHero = { element, timing, renderAt(seconds) }; the phone cut renders that element and fails if timing differs from this file. Built by marketing/scripts/build-hero-timeline.py from assets/evidence/hero-slice.json and pacing.json.',
        'fps': 30, 'duration_s': duration, 'frames': round(duration * 30),
        'final_s': None, 'tolerance_ms': p['tolerance_ms'],
        'pacing': p,
        'flow_total_s': flow_total,
        'lanes': [{'label': l, 'short': l.replace('Agent · ', '').split(' ')[0].capitalize() if not l.replace('Agent · ', '').startswith('#') else l.replace('Agent · ', '').split(' ')[0], **SLICE['lanes'][l]} for l in lanes],
        'stops_s': stops, 'status': status, 'wires': wires, 'cards': out_cards,
    }
    first_held = next(w for w in wires if w['kind'] == 'held')
    timing['final_s'] = round(first_held['stop'][1] - 0.05, 3)
    timing['frames'] = round(duration * timing['fps'])
    timing['duration_s'] = round(timing['frames'] / timing['fps'], 3)
    timing['phone_cut'] = {'width': 540, 'height': 675, 'scale': 2, 'min_text_px': 28,
                           'seek_samples_s': p['seek_samples_s'], 'poster_s': timing['final_s'], 'stills_s': p['stills_s']}
    timing['source'] = (f"assets/evidence/hero-slice.json: seq {SLICE['seq_range'][0]}–{SLICE['seq_range'][1]}, "
                        f"{SLICE['window']['start'][11:19]}–{SLICE['window']['end'][11:19]} local (UTC−6) on 25 November 2026. "
                        "Idle time is compressed; the order of events is kept. No agent or daemon runs.")
    out = ROOT / 'marketing/motion/hero-loop/timing.json'
    out.write_text(json.dumps(timing, indent=1, ensure_ascii=False) + '\n')
    js = ROOT / 'assets/product-first.js'
    src = js.read_text()
    copy = {k: timing[k] for k in ('name', 'fps', 'duration_s', 'frames', 'final_s', 'tolerance_ms', 'pacing', 'flow_total_s', 'lanes', 'stops_s', 'status', 'wires', 'cards')}
    body = '  const TIMING = ' + json.dumps(copy, ensure_ascii=False, separators=(',', ':')) + ';'
    src2 = re.sub(r'(  // BEGIN TIMING\n).*?(\n  // END TIMING)', lambda m: m.group(1) + body + m.group(2), src, flags=re.S)
    assert src2 != src or body in src, 'TIMING markers not found in assets/product-first.js'
    js.write_text(src2)
    write_markup(timing)
    held = [w for w in wires if w['kind'] == 'held']; msgs = [w for w in wires if w['kind'] == 'message']
    print(f"{len(out_cards)} cards, {len(held)} held wires, {len(msgs)} message wires, loop {timing['duration_s']} s")
    for w in wires:
        print(f"  {w['label']:8} at {w['at']:6.2f} s  seq {w['seq']}")


def write_markup(timing):
    """Lane names, and a still of the settled first held moment for pages
    without JavaScript, in index.html between the HERO markers."""
    from html import escape
    lanes = ''.join(
        f'            <button type="button" class="lane-name lane-{"abcdefghij"[i % 10]}" data-lane="{i}" data-detail-open="lane:{i}" aria-haspopup="dialog" aria-expanded="false">'
        f'<span class="full">{escape(l["label"])}</span><span class="short">{escape(l["short"])}</span></button>\n'
        for i, l in enumerate(timing['lanes']))
    L = PACE['static_layout']
    flow = {c['id']: c['flow'] for c in timing['cards']}
    x, right = {}, {}
    for c in timing['cards']:
        want = L['K'] * flow[c['id']]
        x[c['id']] = want if c['lane'] not in right else max(want, right[c['lane']] + L['gap'])
        right[c['lane']] = x[c['id']] + L['W']
    t = timing['final_s']
    shown = [c for c in timing['cards'] if c['at'] <= t]
    newest = shown[-1]
    cam = x[newest['id']] + L['W'] / 2 - PACE['camera']['newest_at'] * L['Wc']
    cards = []
    for c in shown:
        left = x[c['id']] - cam
        if left + L['W'] < 0:
            continue
        inner = ''.join(f'<{tag} class="{cls}">{escape(c[k])}</{tag}>' for tag, cls, k in (('span', 'who', 'who'), ('span', 'verb', 'verb'), ('code', 'path', 'code'), ('span', 'sub', 'sub')) if c.get(k))
        cards.append(f'<li class="card {c["kind"]} lane-{"abcdefghij"[c["lane"] % 10]}" style="left:{left:.0f}px;top:{L["top"] + c["lane"] * L["row"]}px"><span class="card-hit">{inner}</span></li>')
    still = ('          <div class="live-static" data-static aria-hidden="true"><ol class="cards">' + ''.join(cards) + '</ol></div>\n')
    page = ROOT / 'index.html'
    html = page.read_text()
    html = re.sub(r'(<!-- BEGIN HERO LANES -->\n).*?(\s*<!-- END HERO LANES -->)', lambda m: m.group(1) + lanes.rstrip('\n') + m.group(2), html, flags=re.S)
    html = re.sub(r'(<!-- BEGIN HERO STATIC -->\n).*?(\s*<!-- END HERO STATIC -->)', lambda m: m.group(1) + still.rstrip('\n') + m.group(2), html, flags=re.S)
    page.write_text(html)


if __name__ == '__main__':
    main()
