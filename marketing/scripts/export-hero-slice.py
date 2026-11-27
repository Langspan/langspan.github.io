#!/usr/bin/env python3
"""Export the hero's recorded slice from a LangSpan coordinator event log.

Read-only. Input: the JSON objects printed by
`langspan --json events --after SEQ --limit 200`, paged, merged into one
{seq: event} map. Output: assets/evidence/hero-slice.json, which keeps only
what the home page draws: event type, seq, time, tool, file paths, line
ranges, the lane label, and the links between a held write or a message and
the other lane. It drops prompts, message text, digests, every kind of ID,
symbol names, workspace roots and home paths.

Usage: export-hero-slice.py EVENTS.json OUT.json
"""
import datetime, json, sys

# The coordinator's at_ms is a monotonic clock. This anchor maps it to wall
# time: at_ms 2006850808 was 2026-11-26 01:45:14.270 UTC.
ANCHOR_MS, ANCHOR_AT = 1795657514270, 2006850808
LOCAL = datetime.timezone(datetime.timedelta(hours=-6), 'UTC-6')
# Window, local time (UTC-6), and the sessions in it. The log has no other
# sessions with tool calls in this window.
START, END = datetime.datetime(2026, 11, 25, 19, 52, 0, tzinfo=LOCAL), datetime.datetime(2026, 11, 25, 19, 58, 0, tzinfo=LOCAL)
LANES = {
    'claude-code.23ced2ad-9d95-47cc-bd16-99b180a081ac': ('Agent · #29 renames', 'shared checkout', 'dogfood/rename-safety'),
    'claude-code.878126d0-72df-4b2e-83aa-b56463f59104': ('Agent · #28 signature alerts', 'shared checkout', 'dogfood/rename-safety'),
    'claude-code.589a044b-261f-4a3d-b6ee-eeb08efa537a': ('Agent · worktree signatures', 'own worktree', 'feat/worktree-signatures-c7'),
}

def wall(ms):
    return datetime.datetime.fromtimestamp((ANCHOR_MS + ms - ANCHOR_AT) / 1000, tz=LOCAL)

def session(e):
    return (e.get('session_id') or (e.get('lease') or {}).get('session_id')
            or (e.get('observation') or {}).get('session_id') or (e.get('message') or {}).get('from'))

def main(src, out):
    ev = {int(k): v for k, v in json.load(open(src)).items()}
    timed = {}
    last = None
    for s in sorted(ev):
        e = ev[s]
        ms = e.get('at_ms') or (e.get('observation') or {}).get('observed_at_ms')
        if ms:
            last = wall(ms)
        timed[s] = (wall(ms), False) if ms else (last, True)
    seqs = [s for s in sorted(ev) if timed[s][0] and START <= timed[s][0] < END]
    lo, hi = seqs[0], seqs[-1]
    # For the status line at the start of the window: which lanes were already
    # working in the five minutes before it, and the writes held in the ten.
    before = [s for s in sorted(ev) if timed[s][0] and START - datetime.timedelta(minutes=10) <= timed[s][0] < START]
    active_before = sorted({LANES[session(ev[s])][0] for s in before if session(ev[s]) in LANES and timed[s][0] >= START - datetime.timedelta(minutes=5)})
    held_before = [timed[s][0].strftime('%H:%M:%S.%f')[:-3] for s in before if ev[s]['type'] == 'write_refused' and session(ev[s]) in LANES]
    sent = {}
    events = []
    for s in range(lo, hi + 1):
        e = ev.get(s)
        if not e or session(e) not in LANES:
            continue
        t, inferred = timed[s]
        obs, lease, msg = e.get('observation') or {}, e.get('lease') or {}, e.get('message') or {}
        r = {'seq': s, 'type': e['type'], 'lane': LANES[session(e)][0], 'time': t.strftime('%H:%M:%S.%f')[:-3]}
        if inferred:
            r['time_from_previous_event'] = True
        paths = [f['path'] for f in e.get('files', [])] or lease.get('paths') or obs.get('paths') or e.get('paths') or msg.get('paths')
        if paths:
            r['paths'] = paths
        if e['type'] == 'lease_granted':
            lines = [[x['start_line'], x['end_line']] for g in lease.get('regions', []) for x in g.get('regions', []) if 'start_line' in x]
            if lines:
                r['lines'] = lines
        if e['type'] == 'operation_observed':
            r['tool'] = obs['tool']
            if obs.get('result') != 'succeeded':
                r['result'] = obs.get('result')
        if e['type'] == 'source_observed':
            r['origin'] = e['origin']
        if e['type'] == 'write_refused':
            r['reason'] = {'stale_base': 'changed since this agent read it'}.get(e.get('kind'), e.get('kind'))
            if e.get('peer_session_id') in LANES:
                r['held_by_change_from'] = LANES[e['peer_session_id']][0]
        if e['type'] == 'message_sent':
            r['to'] = LANES.get((msg.get('to') or {}).get('session_id'), ('another agent',))[0]
            sent[msg.get('message_id')] = s
        if e['type'] == 'message_acknowledged':
            r['acknowledges'] = sent.get(e.get('message_id'))
        events.append(r)
    doc = {
        'name': 'LangSpan Live "Now" view, recorded slice',
        'recorded': 'Three Claude Code sessions in LangSpan\'s own development, exported read-only from the coordinator event log. Two work in one shared checkout of LangSpan.dev on branch dogfood/rename-safety; the third works in its own worktree on branch feat/worktree-signatures-c7. No other session made a tool call in this window.',
        'window': {'local_time': 'UTC-6', 'start': START.isoformat(), 'end': END.isoformat(), 'start_utc': START.astimezone(datetime.timezone.utc).isoformat(), 'end_utc': END.astimezone(datetime.timezone.utc).isoformat()},
        'seq_range': [lo, hi],
        'time': 'Event times are local wall time (UTC-6), mapped from the coordinator clock with the anchor at_ms 2006850808 = 2026-11-26T01:45:14.270Z. A message event records no time of its own; it takes the time of the event before it (time_from_previous_event).',
        'repository': 'LangSpan.dev',
        'before_window': {'lanes_working_in_previous_5_min': active_before, 'writes_held_in_previous_10_min_at': held_before},
        'lanes': {v[0]: {'agent': 'Claude Code', 'checkout': v[1], 'branch': v[2]} for v in LANES.values()},
        'kept': ['seq', 'type', 'time', 'lane label', 'paths', 'line ranges of each admitted edit', 'tool and non-success result of an observed operation', 'origin of a source observation', 'reason of a held write and the lane whose change held it', 'the lane a message went to, and which sent message an acknowledgement answers (by seq)'],
        'dropped': ['prompts (session_prompted)', 'message text', 'digests', 'session, lease, operation, observation, message and workspace IDs', 'symbol names', 'workspace roots and home paths', 'events of other sessions', 'events that name no session'],
        'events': events,
    }
    open(out, 'w').write(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')
    print(f'{len(events)} events, seq {lo}-{hi}')

if __name__ == '__main__':
    main(*sys.argv[1:3])
