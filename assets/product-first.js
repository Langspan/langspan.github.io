/* Home page interactions. No agent or daemon runs in the browser. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const all = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.remove('no-js');

  // Old home-page anchors whose sections now live on the technical guide.
  const legacy = new Set(['scale','why','research','workflow','capabilities','evidence','benchmark','film','team-story','peer-briefings','source-awareness','commit-ownership','team-awareness','integration-checks','coordination-demo','planned-setup','manual-setup','mission','hosts','semantic-awareness','langspan-live','demo']);
  function followLegacy() { if (legacy.has(location.hash.slice(1))) { location.replace('technical.html' + location.search + location.hash); return true; } return false; }
  if (followLegacy()) return;
  addEventListener('hashchange', followLegacy);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedStatic = new URLSearchParams(location.search).get('motion') === 'static';
  const isStatic = () => reduce.matches || forcedStatic;

  /* ---------- Hero: LangSpan Live "Now" view over a recorded slice ----------
     One clock. TIMING is an equal copy of marketing/motion/hero-loop/timing.json,
     written by marketing/scripts/build-hero-timeline.py from
     assets/evidence/hero-slice.json (the site publishes only assets/). Each card
     and wire names the event seq numbers it draws.
     frameState(t) is a pure function of t. renderAt(t) draws it for the current
     layout and, while the view follows the newest work, places the camera from t
     too, so any frame renders the same however the clock reached it. */
  // BEGIN TIMING
  const TIMING = {"name":"hero-loop","fps":30,"duration_s":33.4,"frames":1002,"final_s":4.0,"tolerance_ms":50,"pacing":{"about":"Numbers for the hero's motion. build-hero-timeline.py turns these and the recorded slice into timing.json.","lead_in_s":0.4,"gap_min_s":0.35,"gap_max_s":0.45,"gap_cap_s":4,"group_edits_within_s":20,"tail_s":0.6,"stop_held_s":3.2,"stop_saved_s":1.0,"stop_message_s":1.0,"wire_delay_s":0.8,"wire_draw_ms":600,"emphasis_gap_s":0.05,"emphasis_ms":150,"emphasis_scale":1.03,"message_delay_s":0.1,"message_draw_ms":400,"tint_delay_s":0.2,"tint_ms":300,"entrance_ms":200,"entrance_travel_px":8,"entrance_curve":[0.16,1,0.3,1],"camera":{"newest_at":0.72,"ease_ms":500,"ease_curve":[0.16,1,0.3,1],"px_per_flow_s":{"wide":72,"narrow":46,"film":58}},"zoom":{"min":0.25,"max":2,"step":1.25,"compact_below":0.7,"blocks_below":0.45},"tolerance_ms":50,"seek_samples_s":[1,8,15.5,20],"stills_s":[1,4,4.8,6,7.5,10],"banned":["springs with overshoot","typing effects","camera zoom or drift in the untouched loop beyond the lateral flow","particles or confetti","glow on anything but a Held wire","auto-opening panels","narration text"],"static_layout":{"about":"The wide layout's sizes, for the still shown without JavaScript; equal to the wide values in assets/product-first.css.","W":136,"H":80,"HH":108,"row":154,"top":56,"G":200,"gap":12,"K":72,"Wc":1358},"framing":{"about":"While a held write's wire draws, the camera frames both cards: it eases out over ease_ms, holds, and eases back over ease_ms before the stop ends. It never scales cards below min_text_px; if both cards can't fit, the wire starts from the nearest visible card in the source lane with an 'earlier' marker, or (narrow) from a source chip beside the held card.","enter_after_s":0.2,"ease_ms":600,"ease_curve":[0.16,1,0.3,1],"margin_px":48,"min_text_px":{"wide":10,"narrow":12},"hold_after_emphasis_s":1.0},"connector":{"about":"Each lane's chain of work: 2 px in the lane color from each card to that agent's next card, with 6 px nodes. A gap in the log longer than idle_after_s is drawn dashed and lighter.","width_px":2,"node_px":6,"idle_after_s":30},"wire_fade":{"about":"After its stop ends, a wire fades to this opacity, so only the current moment's wire is at full strength.","to":0.25,"ms":400}},"flow_total_s":18.805,"lanes":[{"label":"Agent · #29 renames","short":"#29","agent":"Claude Code","checkout":"shared checkout","branch":"dogfood/rename-safety"},{"label":"Agent · #28 signature alerts","short":"#28","agent":"Claude Code","checkout":"shared checkout","branch":"dogfood/rename-safety"},{"label":"Agent · worktree signatures","short":"Worktree","agent":"Claude Code","checkout":"own worktree","branch":"feat/worktree-signatures-c7"}],"stops_s":[[0.85,4.05,"held"],[4.95,5.95,"saved"],[17.448,18.448,"got"],[18.898,22.098,"held"],[23.264,24.264,"got"],[25.135,26.135,"saved"],[26.585,29.785,"held"],[31.805,32.805,"saved"]],"status":[{"at":0.4,"agents":3,"held":0},{"at":0.85,"agents":3,"held":1},{"at":18.898,"agents":3,"held":2},{"at":26.585,"agents":3,"held":3}],"wires":[{"kind":"held","label":"Held","from":null,"from_lane":1,"to":"c1","at":1.65,"ms":600,"stop":[0.85,4.05],"emphasis_at":2.3,"seq":[28584]},{"kind":"message","label":"Message","from":"c28","to":"c30","at":17.548,"ms":400,"stop":[17.448,18.448],"seq":[29178,29196]},{"kind":"held","label":"Held","from":"c3","from_lane":0,"to":"c31","at":19.698,"ms":600,"stop":[18.898,22.098],"emphasis_at":20.348,"seq":[29204]},{"kind":"message","label":"Message","from":"c33","to":"c34","at":23.364,"ms":400,"stop":[23.264,24.264],"seq":[29221,29224]},{"kind":"held","label":"Held","from":"c25","from_lane":0,"to":"c37","at":27.385,"ms":600,"stop":[26.585,29.785],"emphasis_at":28.035,"seq":[29256]}],"cards":[{"id":"c0","lane":1,"kind":"edit","at":0.4,"flow":0.0,"seq":[28551,28552,28556,28557,28563,28564,28568,28569,28573,28574,28595,28596,28602,28603,28607,28608,28612,28624,28625,28638,28639,28643,28644,28648,28649],"time":"19:52:06","verb":"Edited","code":"src/hook.rs","sub":"13 edits","title":"Edited","rows":[["File","src/hook.rs, lines 124–155, 218–435, 2642–2819, 2923–3071, 3115–3180, 3199–3330, 3678–3679"],["Time","19:52:06–19:53:17, 13 edits"]],"next":"c5"},{"id":"c1","lane":0,"kind":"held","at":0.85,"flow":0.45,"seq":[28584],"time":"19:52:30","verb":"Write held","code":"tests/break_alerts.rs","sub":"changed since this agent read it","who":"LangSpan","title":"Write held","rows":[["File","tests/break_alerts.rs"],["Time","19:52:30"],["Why","changed since this agent read it"]],"next":"c2"},{"id":"c2","lane":0,"kind":"read","at":4.5,"flow":0.9,"seq":[28591],"time":"19:52:35","verb":"Read","code":"tests/break_alerts.rs","title":"Read again","rows":[["File","tests/break_alerts.rs, the current version"],["Time","19:52:35"]],"next":"c3"},{"id":"c3","lane":0,"kind":"saved","at":4.95,"flow":1.35,"seq":[28617],"time":"19:52:55","verb":"Saved after re-reading","code":"tests/break_alerts.rs","title":"Saved after re-reading","rows":[["File","tests/break_alerts.rs"],["Time","19:52:55"],["Started from","the current file"]],"next":"c4"},{"id":"c4","lane":0,"kind":"edit","at":6.4,"flow":1.8,"seq":[28659],"time":"19:53:19","verb":"Edited","code":"crates/langspan-core/tests/renames.rs","title":"Edited","rows":[["File","crates/langspan-core/tests/renames.rs"],["Time","19:53:19"]],"next":"c8"},{"id":"c5","lane":1,"kind":"edit","at":6.789,"flow":2.189,"seq":[28663,28664],"time":"19:53:21","verb":"Edited","code":"src/claude_code.rs","title":"Edited","rows":[["File","src/claude_code.rs, lines 43–161"],["Time","19:53:21"]],"next":"c6"},{"id":"c6","lane":1,"kind":"edit","at":7.234,"flow":2.634,"seq":[28670,28672],"time":"19:53:24","verb":"Edited","code":"src/codex.rs","title":"Edited","rows":[["File","src/codex.rs, lines 39–166"],["Time","19:53:24"]],"next":"c9"},{"id":"c7","lane":2,"kind":"edit","at":7.584,"flow":2.984,"seq":[28671,28676,28715,28716],"time":"19:53:24","verb":"Edited","code":"tests/graph.rs","sub":"2 edits","title":"Edited","rows":[["File","tests/graph.rs, lines 185–224, 234–247, 248–252"],["Time","19:53:24–19:53:35, 2 edits"]],"next":"c11"},{"id":"c8","lane":0,"kind":"edit","at":7.986,"flow":3.386,"seq":[28684,28685,28695,28696,28700,28701,28731,28732,28741,28742,28753,28754,28759,28760,28763,28764,28791,28792,28802,28803],"time":"19:53:26","verb":"Edited","code":"crates/langspan-core/src/lib.rs","sub":"10 edits","title":"Edited","rows":[["File","crates/langspan-core/src/lib.rs, lines 1239–1265, 1316–1331, 6023–6103, 9086–9146, 9150–9165, 9167–9241"],["Time","19:53:26–19:54:20, 10 edits"]],"next":"c14"},{"id":"c9","lane":1,"kind":"edit","at":8.355,"flow":3.755,"seq":[28689,28690,28707,28708],"time":"19:53:27","verb":"Edited","code":"src/cursor.rs","sub":"2 edits","title":"Edited","rows":[["File","src/cursor.rs, lines 124–267"],["Time","19:53:27–19:53:32, 2 edits"]],"next":"c10"},{"id":"c10","lane":1,"kind":"edit","at":8.805,"flow":4.205,"seq":[28723,28724,28736,28737,28746,28747],"time":"19:53:37","verb":"Edited","code":"src/gemini.rs","sub":"3 edits","title":"Edited","rows":[["File","src/gemini.rs, lines 115–247"],["Time","19:53:37–19:53:44, 3 edits"]],"next":"c12"},{"id":"c11","lane":2,"kind":"edit","at":9.255,"flow":4.655,"seq":[28772,28773],"time":"19:54:02","verb":"Edited","code":"tests/graph.rs","title":"Edited","rows":[["File","tests/graph.rs, lines 1299–1349"],["Time","19:54:02"]],"next":"c13"},{"id":"c12","lane":1,"kind":"edit","at":9.679,"flow":5.079,"seq":[28779,28780,28785,28786],"time":"19:54:05","verb":"Edited","code":"docs/usage.md","sub":"2 edits","title":"Edited","rows":[["File","docs/usage.md, lines 985–993, 999–1007"],["Time","19:54:05–19:54:07, 2 edits"]],"next":"c16"},{"id":"c13","lane":2,"kind":"edit","at":10.129,"flow":5.529,"seq":[28806,28807,28823,28824,28850,28851,28866,28867,28887,28888,28903,28904,28913,28914,28919,28920,28933,28934,28957,28968,28969,28977,28978,28994,28995,29041,29042,29048,29049,29055,29056,29061,29062,29070,29071,29080,29081],"time":"19:54:25","verb":"Edited","code":"crates/langspan-core/src/lib.rs","sub":"19 edits","title":"Edited","rows":[["File","crates/langspan-core/src/lib.rs, lines 476–523, 1364–1376, 1693–1738, 1952–2267, 2327–2885, 3447–3789, 3828–5845, 6880–6884, 6886–7506, 7508–7517, 8149–9198"],["Time","19:54:25–19:56:04, 19 edits"]],"next":"c26"},{"id":"c14","lane":0,"kind":"edit","at":10.579,"flow":5.979,"seq":[28816,28817],"time":"19:54:30","verb":"Edited","code":"crates/langspan-core/tests/interface_counts.rs","title":"Edited","rows":[["File","crates/langspan-core/tests/interface_counts.rs, lines 26–38"],["Time","19:54:30"]],"next":"c15"},{"id":"c15","lane":0,"kind":"edit","at":11.029,"flow":6.429,"seq":[28828,28829],"time":"19:54:34","verb":"Edited","code":"crates/langspan-core/tests/dashboard.rs","title":"Edited","rows":[["File","crates/langspan-core/tests/dashboard.rs, lines 261–351"],["Time","19:54:34"]],"next":"c17"},{"id":"c16","lane":1,"kind":"edit","at":11.414,"flow":6.814,"seq":[28835,28836,28840,28841,28845,28846,28862,28863,28871,28872,28880,28881,28894,28895,28898,28899,28908,28909,28926,28927],"time":"19:54:35","verb":"Edited","code":"docs/adr/0029-break-alerts-at-write-time.md","sub":"10 edits","title":"Edited","rows":[["File","docs/adr/0029-break-alerts-at-write-time.md, lines 3–10, 17–34, 68–75, 131–138, 148–155, 186–193, 194–202, 225–232, 243–246"],["Time","19:54:35–19:55:05, 10 edits"]],"next":"c19"},{"id":"c17","lane":0,"kind":"edit","at":11.864,"flow":7.264,"seq":[28875,28876],"time":"19:54:45","verb":"Edited","code":"crates/langspan-core/src/lib.rs","title":"Edited","rows":[["File","crates/langspan-core/src/lib.rs, lines 9150–9166"],["Time","19:54:45"]],"next":"c18"},{"id":"c18","lane":0,"kind":"edit","at":12.314,"flow":7.714,"seq":[28939,28940,28945,28946,28961,28962,28972,28973,28984,28985,28989,28990,29032,29033],"time":"19:55:11","verb":"Edited","code":"src/graph.rs","sub":"7 edits","title":"Edited","rows":[["File","src/graph.rs, lines 45–111, 135–179, 184–275, 366–568, 1804–1821"],["Time","19:55:11–19:55:45, 7 edits"]],"next":"c24"},{"id":"c19","lane":1,"kind":"edit","at":12.764,"flow":8.164,"seq":[28950,28951],"time":"19:55:15","verb":"Edited","code":"docs/security/threat-model.md","title":"Edited","rows":[["File","docs/security/threat-model.md, lines 511–517"],["Time","19:55:15"]],"next":"c20"},{"id":"c20","lane":1,"kind":"edit","at":13.214,"flow":8.614,"seq":[28999,29000],"time":"19:55:29","verb":"Edited","code":"src/cursor.rs","title":"Edited","rows":[["File","src/cursor.rs, lines 312–317"],["Time","19:55:29"]],"next":"c21"},{"id":"c21","lane":1,"kind":"edit","at":13.664,"flow":9.064,"seq":[29019],"time":"19:55:38","verb":"Edited","code":"README.md","title":"Edited","rows":[["File","README.md"],["Time","19:55:38"]],"next":"c22"},{"id":"c22","lane":1,"kind":"edit","at":14.062,"flow":9.462,"seq":[29023,29024],"time":"19:55:40","verb":"Edited","code":"docs/roadmap.md","title":"Edited","rows":[["File","docs/roadmap.md, lines 45–51"],["Time","19:55:40"]],"next":"c23"},{"id":"c23","lane":1,"kind":"edit","at":14.512,"flow":9.912,"seq":[29075,29076,29085,29086],"time":"19:56:03","verb":"Edited","code":"src/hook.rs","sub":"2 edits","title":"Edited","rows":[["File","src/hook.rs, lines 506–556, 3202–3331"],["Time","19:56:03–19:56:04, 2 edits"]],"next":"c28","idle_after":true},{"id":"c24","lane":0,"kind":"edit","at":14.917,"flow":10.317,"seq":[29090,29091,29106,29107,29111,29112],"time":"19:56:06","verb":"Edited","code":"src/breaks.rs","sub":"3 edits","title":"Edited","rows":[["File","src/breaks.rs, lines 217–285"],["Time","19:56:06–19:56:13, 3 edits"]],"next":"c25"},{"id":"c25","lane":0,"kind":"edit","at":15.367,"flow":10.767,"seq":[29128,29129,29140,29141,29145,29146],"time":"19:56:27","verb":"Edited","code":"src/hook.rs","sub":"3 edits","title":"Edited","rows":[["File","src/hook.rs, lines 1773–2097, 4234–4278, 4281–4346"],["Time","19:56:27–19:56:30, 3 edits"]],"next":"c27"},{"id":"c26","lane":2,"kind":"edit","at":15.742,"flow":11.142,"seq":[29134,29135,29150,29151,29157,29158,29161,29162],"time":"19:56:28","verb":"Edited","code":"src/observer.rs","sub":"4 edits","title":"Edited","rows":[["File","src/observer.rs, lines 10–30, 115–332"],["Time","19:56:28–19:56:32, 4 edits"]],"next":"c29","idle_after":true},{"id":"c27","lane":0,"kind":"edit","at":16.192,"flow":11.592,"seq":[29172,29173],"time":"19:56:45","verb":"Edited","code":"src/dashboard.html","title":"Edited","rows":[["File","src/dashboard.html, lines 254–260"],["Time","19:56:45"]],"next":"c30"},{"id":"c28","lane":1,"kind":"sent","at":16.642,"flow":12.042,"seq":[29178],"time":"19:56:50","verb":"Sent a message","sub":"to #29 renames","title":"Sent a message","rows":[["To","Agent · #29 renames"],["About","src/hook.rs, tests/break_alerts.rs"],["Time","19:56:50"]],"next":"c31"},{"id":"c29","lane":2,"kind":"edit","at":17.092,"flow":12.492,"seq":[29189,29190,29198,29199,29207,29208,29225,29226,29232,29233,29237,29238],"time":"19:57:04","verb":"Edited","code":"src/graph.rs","sub":"6 edits","title":"Edited","rows":[["File","src/graph.rs, lines 45–112, 296–340, 361–560, 1161–1167, 1173–1209"],["Time","19:57:04–19:57:18, 6 edits"]],"next":"c38"},{"id":"c30","lane":0,"kind":"got","at":17.448,"flow":12.848,"seq":[29196],"time":"19:57:04","verb":"Got a message","sub":"with its next prompt","title":"Got a message","rows":[["Time","19:57:04"]],"next":"c32"},{"id":"c31","lane":1,"kind":"held","at":18.898,"flow":13.298,"seq":[29204],"time":"19:57:08","verb":"Write held","code":"tests/break_alerts.rs","sub":"changed since this agent read it","who":"LangSpan","title":"Write held","rows":[["File","tests/break_alerts.rs"],["Time","19:57:08"],["Why","changed since this agent read it"]],"next":"c34"},{"id":"c32","lane":0,"kind":"command","at":22.513,"flow":13.713,"seq":[29212],"time":"19:57:11","verb":"Ran a command","sub":"changed 2 files","title":"Ran a command","rows":[["Changed","crates/langspan-graph/src/lib.rs, crates/langspan-graph/tests/renames.rs"],["Time","19:57:11"]],"next":"c33"},{"id":"c33","lane":0,"kind":"sent","at":22.868,"flow":14.068,"seq":[29221],"time":"19:57:11","verb":"Sent a message","sub":"to #28 signature alerts","title":"Sent a message","rows":[["To","Agent · #28 signature alerts"],["Time","19:57:11"]],"next":"c39","idle_after":true},{"id":"c34","lane":1,"kind":"got","at":23.264,"flow":14.464,"seq":[29224],"time":"19:57:13","verb":"Got a message","sub":"with its next prompt","title":"Got a message","rows":[["Time","19:57:13"]],"next":"c35"},{"id":"c35","lane":1,"kind":"read","at":24.685,"flow":14.885,"seq":[29230],"time":"19:57:16","verb":"Read","code":"tests/break_alerts.rs","title":"Read again","rows":[["File","tests/break_alerts.rs, the current version"],["Time","19:57:16"]],"next":"c36"},{"id":"c36","lane":1,"kind":"saved","at":25.135,"flow":15.335,"seq":[29243,29244],"time":"19:57:22","verb":"Saved after re-reading","code":"tests/break_alerts.rs","title":"Saved after re-reading","rows":[["File","tests/break_alerts.rs, lines 841–915"],["Time","19:57:22"],["Started from","the current file"]],"next":"c37"},{"id":"c37","lane":1,"kind":"held","at":26.585,"flow":15.785,"seq":[29256],"time":"19:57:41","verb":"Write held","code":"src/hook.rs","sub":"changed since this agent read it","who":"LangSpan","title":"Write held","rows":[["File","src/hook.rs"],["Time","19:57:41"],["Why","changed since this agent read it"]],"next":"c40"},{"id":"c38","lane":2,"kind":"edit","at":30.167,"flow":16.167,"seq":[29258,29259,29290,29291],"time":"19:57:43","verb":"Edited","code":"src/graph.rs","sub":"2 edits","title":"Edited","rows":[["File","src/graph.rs, lines 361–569, 742–782"],["Time","19:57:43–19:57:53, 2 edits"]],"next":"c7","next_loop":true,"idle_after":true},{"id":"c39","lane":0,"kind":"edit","at":30.58,"flow":16.58,"seq":[29267,29268],"time":"19:57:45","verb":"Edited","code":"src/graph.rs","title":"Edited","rows":[["File","src/graph.rs, lines 184–276"],["Time","19:57:45"]],"next":"c41"},{"id":"c40","lane":1,"kind":"read","at":30.969,"flow":16.969,"seq":[29274],"time":"19:57:47","verb":"Read","code":"src/hook.rs","title":"Read again","rows":[["File","src/hook.rs, the current version"],["Time","19:57:47"]],"next":"c42"},{"id":"c41","lane":0,"kind":"edit","at":31.402,"flow":17.402,"seq":[29277,29278],"time":"19:57:50","verb":"Edited","code":"src/breaks.rs","title":"Edited","rows":[["File","src/breaks.rs, lines 217–286"],["Time","19:57:50"]],"next":"c1","next_loop":true,"idle_after":true},{"id":"c42","lane":1,"kind":"saved","at":31.805,"flow":17.805,"seq":[29284,29285],"time":"19:57:52","verb":"Saved after re-reading","code":"src/hook.rs","title":"Saved after re-reading","rows":[["File","src/hook.rs, lines 3209–3338"],["Time","19:57:52"],["Started from","the current file"]],"next":"c0","next_loop":true,"idle_after":true}]};
  // END TIMING
  const P = TIMING.pacing, LOOP = TIMING.duration_s, FINAL_T = TIMING.final_s;
  const bezier = ([x1, y1, x2, y2]) => p => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0, hi = 1, u = p;
    for (let i = 0; i < 40; i++) {
      u = (lo + hi) / 2;
      const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3;
      if (x < p) lo = u; else hi = u;
    }
    return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3;
  };
  const easeIn = bezier(P.entrance_curve), easeFrame = bezier(P.framing.ease_curve), easeLift = bezier([0.37, 0, 0.63, 1]);
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ramp = P.camera.ease_ms / 1000 / 2;
  // Flow time: the clock with each stop taken out. Around a stop the speed
  // ramps linearly to zero over `ramp` seconds and back, so the pan eases
  // into and out of each coordination moment.
  function stopped(t, a, b) {
    const r = ramp;
    // Integral of a trapezoid: 0 before a-r, rising to 1 at a, 1 until b, 0 after b+r.
    const up = t <= a - r ? 0 : t < a ? (t - (a - r)) ** 2 / (2 * r) : r / 2;
    const flat = Math.max(0, Math.min(t, b) - a);
    const down = t <= b ? 0 : t < b + r ? (t - b) - (t - b) ** 2 / (2 * r) : r / 2;
    return up + flat + down;
  }
  const STOPS = TIMING.stops_s;
  const flowAt = t => t - STOPS.reduce((s, [a, b]) => s + stopped(t, a, b), 0);
  const FLOW_LOOP = flowAt(LOOP);
  const CARDS = TIMING.cards, WIRES = TIMING.wires, STATUS = TIMING.status;
  const byId = Object.fromEntries(CARDS.map(c => [c.id, c]));
  const FLOW_OF = Object.fromEntries(CARDS.map(c => [c.id, flowAt(c.at)]));

  function frameState(seconds) {
    const t = ((seconds % LOOP) + LOOP) % LOOP;
    const cards = {};
    let newest = null;
    for (const c of CARDS) {
      const k = easeIn(clamp01((t - c.at) * 1000 / P.entrance_ms));
      cards[c.id] = [k, P.entrance_travel_px * (1 - k), 1, 1];
      if (t >= c.at) newest = c.id;
    }
    // Only the current moment's wire draws at full strength: after its stop
    // ends, a wire fades to fade_to over fade_ms.
    const fade = WIRES.map(w => 1 - (1 - P.wire_fade.to) * easeIn(clamp01((t - w.stop[1]) * 1000 / P.wire_fade.ms)));
    const wires = WIRES.map(w => {
      const p = easeIn(clamp01((t - w.at) * 1000 / w.ms));
      if (w.emphasis_at !== undefined) {
        const e = clamp01((t - w.emphasis_at) * 1000 / P.emphasis_ms);
        cards[w.to][2] = 1 + (P.emphasis_scale - 1) * easeLift(Math.sin(Math.PI * e));
      }
      return p;
    });
    for (const c of CARDS) if (c.kind === 'saved') cards[c.id][3] = easeIn(clamp01((t - c.at - P.tint_delay_s) * 1000 / P.tint_ms));
    // Which stop, if any, the camera is holding for, with its 0..1 weight.
    // A held write's stop frames both of its cards: the camera eases out after
    // the held card enters, holds while the wire draws, and eases back before
    // the stop ends.
    let hold = null;
    const F = P.framing, fe = F.ease_ms / 1000;
    for (let i = 0; i < WIRES.length; i++) {
      if (WIRES[i].kind !== 'held') continue;
      const [a, b] = WIRES[i].stop;
      const w = Math.min(easeFrame(clamp01((t - a - F.enter_after_s) / fe)), 1 - easeFrame(clamp01((t - (b - fe)) / fe)));
      if (t >= a && t <= b && w > 0) hold = [i, w];
    }
    let status = STATUS[0];
    for (const s of STATUS) if (t >= s.at) status = s;
    return { t, frame: Math.floor(t * TIMING.fps + 1e-6), flow: flowAt(t), cards, wires, fade, newest, hold, status: [status.agents, status.held] };
  }

  const hero = $('[data-hero-loop]');
  if (hero) {
    const canvas = $('[data-canvas]', hero), world = $('[data-world]', hero), gutter = $('[data-gutter]', hero);
    const layer = $('[data-cards]', hero), wireLayer = $('[data-wires]', hero), labelLayer = $('[data-wire-labels]', hero);
    const countAgents = $('[data-status-agents]', hero), countHeld = $('[data-status-held]', hero);
    const playBtn = $('[data-hero-play]', hero);
    const pop = $('[data-pop]', hero), popBody = $('[data-pop-body]', hero);
    const followBtn = $('[data-cam="follow"]', hero);
    $('[data-static]', hero)?.remove();
    hero.classList.add('is-live');

    /* Layout: read from CSS custom properties, so each breakpoint (and the
       phone cut) sets its own sizes. Card x comes from flow time, then each
       lane is packed so its cards never overlap. */
    let L = null;
    function layout() {
      const cs = getComputedStyle(canvas), n = v => parseFloat(cs.getPropertyValue(v));
      const l = { W: n('--card-w'), H: n('--card-h'), HH: n('--held-h'), row: n('--row-h'), top: n('--row-top'), G: n('--gutter'), gap: n('--card-gap'),
        K: n('--flow-k'), Wc: canvas.clientWidth, Hc: canvas.clientHeight, minText: n('--card-min-text'), narrow: cs.getPropertyValue('--layout').trim() === 'narrow' };
      // Cards keep their order in time across all lanes: each card sits
      // K px per second of flow after the one before it, pushed right only as
      // far as needed to clear the last card in its own lane.
      const x = {}, lastRight = {};
      let prevX = null, prevF = 0;
      for (const c of CARDS) {
        const want = prevX === null ? l.K * FLOW_OF[c.id] : prevX + l.K * (FLOW_OF[c.id] - prevF);
        x[c.id] = lastRight[c.lane] === undefined ? want : Math.max(want, lastRight[c.lane] + l.gap);
        lastRight[c.lane] = x[c.id] + l.W; prevX = x[c.id]; prevF = FLOW_OF[c.id];
      }
      const first = CARDS[0], lastC = CARDS[CARDS.length - 1];
      let period = x[lastC.id] + l.K * (FLOW_LOOP - FLOW_OF[lastC.id] + FLOW_OF[first.id]) - x[first.id];
      for (const lane of TIMING.lanes.keys()) {
        const mine = CARDS.filter(c => c.lane === lane);
        if (mine.length) period = Math.max(period, x[mine[mine.length - 1].id] + l.W + l.gap - x[mine[0].id]);
      }
      l.x = x; l.period = period;
      // Camera keys: when each card enters, it sits at newest_at across the
      // canvas. Between keys the camera moves at a steady speed in flow time.
      const keys = [];
      for (const c of CARDS) {
        const want = x[c.id] + l.W / 2 - P.camera.newest_at * l.Wc;
        keys.push([FLOW_OF[c.id], keys.length ? Math.max(keys[keys.length - 1][1], want) : want]);
      }
      l.keys = keys;
      L = l;
      for (const el of gutter.children) {
        const i = +el.dataset.lane;
        el.style.setProperty('--y', (i * l.row) + 'px');
      }
    }
    const cardY = c => L.top + c.lane * L.row + ((c.kind === 'held' ? L.HH : L.H) < L.row ? 0 : 0);
    const cardH = c => c.kind === 'held' ? L.HH : L.H;

    /* Camera. In the flow the newest work lands at newest_at across the
       canvas; during a coordination moment it holds, and if the wire's far
       end would be off screen it eases back just enough to show both cards. */
    const cam = { mode: 'flow', s: 1, x: 0, y: 0, fs: 1 };
    function flowCamera(st) {
      const k = L.keys, n = k.length, f = st.flow;
      let a, b;
      if (f < k[0][0]) { a = [k[n - 1][0] - FLOW_LOOP, k[n - 1][1] - L.period]; b = k[0]; }
      else if (f >= k[n - 1][0]) { a = k[n - 1]; b = [k[0][0] + FLOW_LOOP, k[0][1] + L.period]; }
      else { let i = 0; while (k[i + 1][0] <= f) i++; a = k[i]; b = k[i + 1]; }
      const base = a[1] + (b[1] - a[1]) * (b[0] > a[0] ? (f - a[0]) / (b[0] - a[0]) : 1);
      // At a flow scale below 1, the newest work stays at the same place across the canvas.
      return base + P.camera.newest_at * L.Wc * (1 - 1 / cam.fs);
    }
    /* How a held write is framed, from the layout alone:
       'both'     both cards fit at a scale that keeps card text at least
                  framing.min_text_px; the wire runs card to card.
       'neighbor' (wide) they don't fit; the wire starts from the source
                  lane's first card in view, marked "earlier".
       'chip'     (narrow) a small source chip beside the held card. */
    function frameFor(i) {
      L.frames = L.frames || {};
      if (L.frames[i]) return L.frames[i];
      const w = WIRES[i], to = byId[w.to], from = w.from ? byId[w.from] : null, F = P.framing, m = F.margin_px;
      const sMin = Math.min(1, F.min_text_px[L.narrow ? 'narrow' : 'wide'] / L.minText);
      const st = frameState(w.stop[0] + F.enter_after_s), keep = cam.fs; cam.fs = 1;
      const base = flowCamera(st); cam.fs = keep;
      let fr = null;
      if (from && L.x[from.id] < L.x[to.id]) {
        const span = L.x[to.id] + L.W - L.x[from.id], s = Math.min(1, (L.Wc - L.G - 2 * m) / span);
        if (s >= sMin) fr = { mode: 'both', s, x: L.x[from.id] - (L.G + m) / s, from: from.id };
      }
      if (!fr) {
        const left = base + (L.G + 8);
        const near = CARDS.filter(c => c.lane === (from ? from.lane : w.from_lane) && c.at <= to.at && L.x[c.id] >= left && L.x[c.id] + L.W <= L.x[to.id]);
        fr = !L.narrow && near.length ? { mode: 'neighbor', s: 1, x: base, from: near[0].id } : { mode: 'chip', s: 1, x: base, from: null };
      }
      return (L.frames[i] = fr);
    }

    // Pools: card buttons, wire paths and labels are reused as they scroll.
    const pool = new Map(), wirePool = new Map(), labelPool = new Map();
    function cardEl(key, c) {
      let el = pool.get(key);
      if (el) return el;
      el = document.createElement('li');
      el.className = 'card ' + c.kind + ' lane-' + 'abcdefghij'[c.lane % 10];
      el.dataset.card = c.id; el.dataset.seq = c.seq.join(' ');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'card-hit'; b.dataset.detailOpen = 'card:' + c.id;
      b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false');
      const add = (tag, cls, text) => { if (!text) return; const e = document.createElement(tag); e.className = cls; e.textContent = text; b.append(e); };
      add('span', 'who', c.who); add('span', 'verb', c.verb); add('code', 'path', c.code && c.code.split('/').slice(-2).join('/').replace(/([/_.])/g, '$1\u200b')); add('span', 'sub', c.sub);
      if (c.code) b.title = c.code;
      el.append(b);
      pool.set(key, el);
      return el;
    }
    const NS = 'http://www.w3.org/2000/svg';
    function wireEl(key, w) {
      let g = wirePool.get(key);
      if (g) return g;
      g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'wire wire-' + w.kind);
      for (const cls of w.kind === 'held' ? ['wire-glow', 'wire-line'] : ['wire-line']) {
        const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); p.setAttribute('pathLength', '1'); g.append(p);
      }
      wirePool.set(key, g);
      return g;
    }
    function labelEl(key, w, i) {
      let b = labelPool.get(key);
      if (b) return b;
      b = document.createElement('button');
      b.type = 'button'; b.className = 'wire-label wire-label-' + w.kind; b.textContent = w.label;
      b.dataset.detailOpen = 'wire:' + i; b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false');
      labelPool.set(key, b);
      return b;
    }

    const chipPool = new Map(), markPool = new Map(), chainPool = new Map();
    function chipEl(key, w, i) {
      let el = chipPool.get(key);
      if (el) return el;
      const to = byId[w.to], lane = TIMING.lanes[w.from_lane];
      el = document.createElement('button');
      el.type = 'button'; el.className = 'source-chip'; el.dataset.detailOpen = 'wire:' + i;
      el.setAttribute('aria-haspopup', 'dialog'); el.setAttribute('aria-expanded', 'false');
      const held = document.createElement('b');
      held.textContent = w.label;
      el.append(held, ' · ' + lane.short + ' edited ' + to.code.split('/').pop() + ' earlier');
      chipPool.set(key, el);
      return el;
    }
    function markEl(key) {
      let el = markPool.get(key);
      if (el) return el;
      el = document.createElement('span');
      el.className = 'wire-earlier'; el.textContent = 'earlier'; el.setAttribute('aria-hidden', 'true');
      markPool.set(key, el);
      return el;
    }
    /* Each lane's chain of work: a line in the lane's color from each card to
       the agent's next card, with small nodes at the card edges. A long idle
       stretch in the log is drawn dashed and lighter. */
    const chainLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chainLayer.setAttribute('class', 'chains');
    wireLayer.prepend(chainLayer);
    function drawChains(st, viewL, viewR, margin) {
      const want = new Set(), y = c => L.top + c.lane * L.row + L.H / 2;
      const nMin = Math.floor((viewL - margin - L.period) / L.period);
      for (let n = nMin; n <= 0; n++) {
        for (const c of CARDS) {
          if (!c.next) continue;
          const nx = byId[c.next], nn = c.next_loop ? n + 1 : n;
          const a = L.x[c.id] + n * L.period + L.W, b = L.x[nx.id] + nn * L.period;
          if (b < viewL - margin || a > viewR + margin) continue;
          const oa = n < 0 ? 1 : st.cards[c.id][0], ob = nn < 0 ? 1 : nn > 0 ? 0 : st.cards[nx.id][0];
          if (oa < 0.001 || ob < 0.001) continue;
          const key = n + ':' + c.id;
          want.add(key);
          let g = chainPool.get(key);
          if (!g) {
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'chain lane-' + 'abcdefghij'[c.lane % 10] + (c.idle_after ? ' idle' : ''));
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'), n1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle'), n2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            n1.setAttribute('r', P.connector.node_px / 2); n2.setAttribute('r', P.connector.node_px / 2);
            g.append(line, n1, n2); chainPool.set(key, g);
          }
          const [line, n1, n2] = g.children, yy = y(c).toFixed(1);
          line.setAttribute('x1', a.toFixed(1)); line.setAttribute('x2', b.toFixed(1)); line.setAttribute('y1', yy); line.setAttribute('y2', yy);
          n1.setAttribute('cx', a.toFixed(1)); n1.setAttribute('cy', yy); n2.setAttribute('cx', b.toFixed(1)); n2.setAttribute('cy', yy);
          g.style.opacity = Math.min(oa, ob).toFixed(3);
          if (g.parentNode !== chainLayer) chainLayer.append(g);
        }
      }
      for (const [key, g] of chainPool) if (!want.has(key)) { g.remove(); chainPool.delete(key); }
    }

    let last = null;
    function renderAt(seconds) {
      if (!L) layout();
      const st = frameState(seconds);
      if (cam.mode === 'flow') {
        cam.s = cam.fs; cam.x = flowCamera(st); cam.y = 0;
        if (st.hold && cam.fs === 1) {
          const fr = frameFor(st.hold[0]), k = st.hold[1];
          cam.s = 1 + (fr.s - 1) * k; cam.x = cam.x + (fr.x - cam.x) * k;
        }
      }
      const s = cam.s, viewL = cam.x, viewR = cam.x + L.Wc / s, margin = L.W * 2;
      // Zooming keeps the first lane at its place under the status line.
      const ty = L.top * (1 - s) + cam.y;
      world.style.transform = 'translate(' + (-cam.x * s).toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
      // The dot grid is part of the plane, so it moves and scales with the work.
      const dot = 18 * s;
      canvas.style.backgroundSize = dot.toFixed(2) + 'px ' + dot.toFixed(2) + 'px';
      canvas.style.backgroundPosition = (((-cam.x * s) % dot) + dot).toFixed(2) + 'px ' + ((ty % dot) + dot).toFixed(2) + 'px';
      canvas.classList.toggle('zoom-compact', s < P.zoom.compact_below && s >= P.zoom.blocks_below);
      canvas.classList.toggle('zoom-blocks', s < P.zoom.blocks_below);
      gutter.style.setProperty('--s', s); gutter.style.setProperty('--dy', cam.y + 'px');
      // Which copies of the loop are on screen: copy 0 plays, earlier copies are settled.
      const want = new Map(), wantW = new Map();
      const nMin = Math.floor((viewL - margin - L.x[CARDS[CARDS.length - 1].id]) / L.period), nMax = Math.floor((viewR + margin) / L.period);
      for (let n = Math.min(0, nMin); n <= Math.min(0, nMax); n++) {
        const off = n * L.period;
        for (const c of CARDS) {
          const x = L.x[c.id] + off;
          if (x + L.W < viewL - margin || x > viewR + margin) continue;
          const [o, y, k, ok] = n < 0 ? [1, 0, 1, 1] : st.cards[c.id];
          if (o < 0.001) continue;
          want.set(n + ':' + c.id, [c, x, o, y, k, ok]);
        }
        WIRES.forEach((w, i) => {
          const p = n < 0 ? 1 : st.wires[i];
          // A held wire's start (its card, chip or marker) shows from the moment the camera frames it.
          if (p < 0.001 && !(n === 0 && st.hold && st.hold[0] === i)) return;
          const to = byId[w.to], from = w.from ? byId[w.from] : null;
          const x2 = L.x[to.id] + off, x1 = from ? L.x[from.id] + off + L.W : x2 - 60;
          if (Math.max(x1, x2) < viewL - margin || Math.min(x1, x2) > viewR + margin) return;
          wantW.set(n + ':' + i, [w, i, p, off]);
        });
      }
      // Cards: place, then drop the ones that left the view.
      const order = [...want.keys()].sort((a, b) => { const [na, ia] = a.split(':'), [nb, ib] = b.split(':'); return na - nb || CARDS.indexOf(byId[ia]) - CARDS.indexOf(byId[ib]); });
      let prev = null;
      for (const key of order) {
        const [c, x, o, y, k, ok] = want.get(key), el = cardEl(key, c);
        el.style.cssText = 'left:' + x.toFixed(1) + 'px;top:' + cardY(c) + 'px;opacity:' + o.toFixed(4) + ';transform:translateY(' + y.toFixed(2) + 'px)' + (k > 1.0001 ? ' scale(' + k.toFixed(4) + ')' : '') + (c.kind === 'saved' ? ';--ok:' + ok.toFixed(4) : '');
        if (el.parentNode !== layer || el.previousElementSibling !== prev) layer.insertBefore(el, prev ? prev.nextSibling : layer.firstChild);
        prev = el;
      }
      for (const [key, el] of pool) if (!want.has(key)) { if (el.contains(document.activeElement)) continue; el.remove(); pool.delete(key); }
      // Wires and their labels.
      // Held and message wires run through the gap between the two lanes and
      // enter each card through its top or bottom edge, so they never cross a
      // card's body. Labels, markers and chips stay fully inside the canvas.
      const keepIn = (el, x, mode, clampIt) => {
        const w = el.offsetWidth, lo = L.G + 4, hi = L.Wc - 4;
        let sx = (x - cam.x) * s, left = mode === 'center' ? sx - w / 2 : sx;
        if (clampIt) { left = Math.max(lo, Math.min(hi - w, left)); sx = mode === 'center' ? left + w / 2 : left; el.style.left = (cam.x + sx / s).toFixed(1) + 'px'; }
        el.style.visibility = left >= lo - 0.5 && left + w <= hi + 0.5 ? 'visible' : 'hidden';
      };
      for (const [key, [w, i, p, off]] of wantW) {
        const g = wireEl(key, w), to = byId[w.to];
        const fr = w.kind === 'held' ? frameFor(i) : { mode: 'both', from: w.from };
        const from = fr.from ? byId[fr.from] : null, srcLane = w.from ? byId[w.from].lane : w.from_lane;
        const current = off === 0 && st.fade[i] > 0.999, alpha = off < 0 ? P.wire_fade.to : st.fade[i];
        const down = to.lane > srcLane, upper = Math.min(srcLane, to.lane);
        const gapY = L.top + upper * L.row + (L.HH + L.row) / 2;
        const tx = L.x[to.id] + off + L.W / 2, ty = down ? cardY(to) : cardY(to) + cardH(to);
        let sx, sy, startsInGap = false;
        if (fr.mode === 'chip') {
          // A small chip in the gap names the earlier change and carries the label.
          const chip = chipEl(key, w, i), cw = Math.min(240, (L.Wc - L.G) * 0.9);
          chip.style.maxWidth = cw.toFixed(0) + 'px';
          chip.style.left = tx.toFixed(1) + 'px'; chip.style.top = gapY.toFixed(1) + 'px';
          chip.style.opacity = (Math.max(clamp01(p * 2), current && st.hold && st.hold[0] === i ? st.hold[1] : 0) * alpha).toFixed(3);
          chip.style.transform = 'translate(-50%,-50%)' + (s < 1 ? ' scale(' + (1 / s).toFixed(3) + ')' : '');
          if (chip.parentNode !== labelLayer) labelLayer.append(chip);
          keepIn(chip, tx, 'center', current);
          sx = parseFloat(chip.style.left); sy = gapY; startsInGap = true;
        } else {
          sx = L.x[from.id] + off + L.W / 2; sy = down ? cardY(from) + cardH(from) : cardY(from);
        }
        // Down (or up) to the gap, along it, then into the target's facing edge.
        const r = 10, v1 = Math.sign(gapY - sy) || 1, v2 = Math.sign(ty - gapY) || 1, h = Math.sign(tx - sx);
        let d = 'M ' + sx.toFixed(1) + ' ' + sy.toFixed(1);
        if (Math.abs(tx - sx) < 2 * r) d += ' C ' + sx.toFixed(1) + ' ' + gapY.toFixed(1) + ', ' + tx.toFixed(1) + ' ' + gapY.toFixed(1) + ', ' + tx.toFixed(1) + ' ' + ty.toFixed(1);
        else {
          if (!startsInGap) d += ' L ' + sx.toFixed(1) + ' ' + (gapY - r * v1).toFixed(1) + ' Q ' + sx.toFixed(1) + ' ' + gapY.toFixed(1) + ' ' + (sx + r * h).toFixed(1) + ' ' + gapY.toFixed(1);
          d += ' L ' + (tx - r * h).toFixed(1) + ' ' + gapY.toFixed(1) + ' Q ' + tx.toFixed(1) + ' ' + gapY.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + (gapY + r * v2).toFixed(1) + ' L ' + tx.toFixed(1) + ' ' + ty.toFixed(1);
        }
        for (const path of g.children) { path.setAttribute('d', d); path.style.strokeDashoffset = (1 - p).toFixed(4); }
        g.dataset.from = from ? from.id : ''; g.dataset.to = to.id; g.dataset.off = off;
        g.style.opacity = alpha.toFixed(3);
        if (g.parentNode !== wireLayer) wireLayer.append(g);
        if (fr.mode === 'neighbor') {
          // The wire starts from a later card in the same lane: mark it "earlier".
          const mk = markEl(key);
          mk.style.left = (sx + 6 / s).toFixed(1) + 'px'; mk.style.top = (sy + (down ? 4 : -20) / s).toFixed(1) + 'px';
          mk.style.opacity = (Math.max(clamp01(p * 2), current && st.hold && st.hold[0] === i ? st.hold[1] : 0) * alpha).toFixed(3);
          mk.style.transform = s < 1 ? 'scale(' + (1 / s).toFixed(3) + ')' : '';
          if (mk.parentNode !== labelLayer) labelLayer.append(mk);
          keepIn(mk, sx + 6 / s, 'left', current);
        }
        if (fr.mode === 'chip') continue;
        const lb = labelEl(key, w, i), lx = Math.abs(tx - sx) < 2 * r ? tx + 40 / s : (sx + tx) / 2;
        lb.style.left = lx.toFixed(1) + 'px'; lb.style.top = gapY.toFixed(1) + 'px';
        // Labels keep their size when the plane is zoomed out.
        lb.style.transform = 'translate(-50%,-50%)' + (s < 1 ? ' scale(' + (1 / s).toFixed(3) + ')' : '');
        lb.style.opacity = (clamp01(p * 2) * alpha).toFixed(3);
        if (lb.parentNode !== labelLayer) labelLayer.append(lb);
        keepIn(lb, lx, 'center', current);
      }
      for (const [key, g] of wirePool) if (!wantW.has(key)) { g.remove(); wirePool.delete(key); }
      for (const pool2 of [chipPool, markPool]) for (const [key, el] of pool2) if (!wantW.has(key) || (pool2 === chipPool ? frameFor(+key.split(':')[1]).mode !== 'chip' : frameFor(+key.split(':')[1]).mode !== 'neighbor')) { el.remove(); pool2.delete(key); }
      drawChains(st, viewL, viewR, margin);
      for (const [key, b] of labelPool) if (!wantW.has(key)) { if (b === document.activeElement) continue; b.remove(); labelPool.delete(key); }
      if (!last || last.status[0] !== st.status[0]) countAgents.textContent = st.status[0] + (st.status[0] === 1 ? ' agent' : ' agents');
      if (!last || last.status[1] !== st.status[1]) countHeld.textContent = st.status[1] + (st.status[1] === 1 ? ' write' : ' writes');
      last = st;
      return st;
    }

    const syncFollow = () => followBtn.setAttribute('aria-pressed', String(cam.mode === 'flow'));
    function freeCamera() { if (cam.mode === 'flow') { cam.mode = 'free'; syncFollow(); } }
    function zoomAt(f, cx = L.Wc / 2, cy = L.Hc / 2) {
      freeCamera();
      const s = Math.max(P.zoom.min, Math.min(P.zoom.max, cam.s * f));
      const wx = cam.x + cx / cam.s;
      cam.y = cy - (cy - cam.y) * s / cam.s; cam.x = wx - cx / s; cam.s = s;
      renderAt(elapsed);
    }
    function pan(dx, dy) { freeCamera(); cam.x -= dx / cam.s; cam.y += dy; renderAt(elapsed); }
    function fit() {
      freeCamera();
      cam.s = Math.max(P.zoom.min, Math.min(1, (L.Wc - L.G - 24) / L.period));
      const st = frameState(elapsed), n0 = Math.floor((L.speed * st.flow) / L.period);
      cam.x = n0 * L.period - (L.G + 12) / cam.s; cam.y = 0;
      renderAt(elapsed);
    }
    function follow() { cam.mode = 'flow'; cam.fs = 1; syncFollow(); renderAt(elapsed); }

    /* The clock. Left alone, the view loops. Any interaction pauses it; it
       resumes from the current beat after IDLE_MS without interaction, or at
       once on Play or Follow newest. A visitor's Pause stays paused. */
    const IDLE_MS = 8000;
    let elapsed = 0, playing = !isStatic(), held = false, visible = !('IntersectionObserver' in window), lastNow = 0, raf = 0, idle = 0;
    const sync = () => { playBtn.textContent = playing ? 'Pause' : 'Play'; playBtn.setAttribute('aria-label', playing ? 'Pause the view' : 'Play the view'); };
    function tick(now) {
      raf = 0;
      if (!playing || !visible || document.hidden) return;
      if (lastNow) elapsed += Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      elapsed %= LOOP;
      renderAt(elapsed);
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!raf && playing && visible && !document.hidden) { lastNow = 0; raf = requestAnimationFrame(tick); } }
    function stop() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; sync(); }
    function resume() { clearTimeout(idle); idle = 0; held = false; closePop(); cam.mode = 'flow'; cam.fs = 1; syncFollow(); playing = true; sync(); start(); }
    function touched() {
      if (isStatic() || held) return;
      if (playing) stop();
      clearTimeout(idle);
      idle = setTimeout(() => { if (!held && !isStatic()) resume(); }, IDLE_MS);
    }
    playBtn.addEventListener('click', () => { if (playing) { held = true; clearTimeout(idle); stop(); } else resume(); });

    $('[data-camera]', hero).hidden = false;
    $('[data-camera]', hero).addEventListener('click', e => {
      const b = e.target.closest('[data-cam]');
      if (!b) return;
      const kind = b.dataset.cam;
      if (kind === 'follow') { if (cam.mode === 'flow') { freeCamera(); touched(); } else { follow(); if (!held && !isStatic()) resume(); } return; }
      touched();
      if (kind === 'in') zoomAt(P.zoom.step);
      else if (kind === 'out') zoomAt(1 / P.zoom.step);
      else fit();
    });
    canvas.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return; // A plain wheel scrolls the page.
      e.preventDefault(); touched();
      const r = canvas.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY / 300), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    const pointers = new Map();
    let drag = null, pinch = null;
    canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('[data-pop]')) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1 }; drag = null; }
      else if (!e.target.closest('button')) drag = { x: e.clientX, y: e.clientY, moved: false };
    });
    canvas.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y) || 1, r = canvas.getBoundingClientRect();
        touched(); zoomAt(d / pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); pinch.d = d; return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      if (!drag.moved) { drag.moved = true; canvas.classList.add('panning'); canvas.setPointerCapture(e.pointerId); }
      touched(); pan(dx, dy); drag.x = e.clientX; drag.y = e.clientY;
    });
    const endPointer = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; if (!pointers.size) { drag = null; canvas.classList.remove('panning'); } };
    canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const step = 48, keys = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (keys[e.key]) { e.preventDefault(); touched(); pan(...keys[e.key]); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); touched(); zoomAt(P.zoom.step); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); touched(); zoomAt(1 / P.zoom.step); }
      else if (e.key === '0') { e.preventDefault(); touched(); fit(); }
      else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); follow(); if (!held && !isStatic()) resume(); }
    });
    canvas.addEventListener('focusin', e => { if (!pop.contains(e.target)) touched(); });
    const relayout = () => { L = null; layout(); renderAt(elapsed); };
    if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(canvas); else addEventListener('resize', relayout);

    /* Details: a click on a card, a wire label or a lane name opens a small
       popover anchored to it, inside the canvas. It never opens on its own. */
    let opener = null;
    function rows(list) {
      const dl = document.createElement('dl');
      for (const [k, v] of list) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
      return dl;
    }
    function details(key) {
      const [type, id] = key.split(':'), kind = document.createElement('p');
      kind.className = 'pop-kind';
      if (type === 'card') {
        const c = byId[id], lane = TIMING.lanes[c.lane];
        kind.textContent = c.title + ' · ' + lane.label;
        const extra = [];
        if (c.kind === 'held') {
          const w = WIRES.find(x => x.to === c.id);
          const after = CARDS.filter(x => x.lane === c.lane && x.at > c.at && (x.kind === 'read' || x.kind === 'saved') && x.code === c.code);
          if (w) extra.push(['Changed by', TIMING.lanes[w.from_lane].label]);
          extra.push(['What LangSpan told the agent', '“… Read each file again, then make the edit against its current content.”']);
          if (after.length) extra.push(['What happened next', after.map(x => x.time + ' · ' + (x.kind === 'read' ? 'read the file again' : 'saved its edit')).join('; ')]);
        }
        return [kind, rows(c.rows.concat(extra))];
      }
      if (type === 'wire') {
        const w = WIRES[+id], to = byId[w.to], from = w.from ? byId[w.from] : null;
        kind.textContent = w.label + ' · from ' + TIMING.lanes[from ? from.lane : w.from_lane].label.replace('Agent · ', '') + ' to ' + TIMING.lanes[to.lane].label.replace('Agent · ', '');
        const list = w.kind === 'held'
          ? [['Why', TIMING.lanes[w.from_lane].label + ' changed ' + to.code + (from ? ' (' + from.time + ')' : '') + ' after ' + TIMING.lanes[to.lane].label + ' last read it.'], ['Held at', to.time]]
          : [['Sent', from.time], ['Got it', to.time + ', with its next prompt']];
        return [kind, rows(list)];
      }
      const lane = TIMING.lanes[+id];
      kind.textContent = lane.label;
      return [kind, rows([['Agent', lane.agent], ['Works in', lane.checkout], ['Branch', lane.branch]])];
    }
    function placePop(anchor) {
      const c = canvas.getBoundingClientRect(), a = anchor.getBoundingClientRect(), m = 8;
      pop.style.left = '0px'; pop.style.top = '0px'; pop.style.maxHeight = (c.height - 2 * m) + 'px';
      const w = pop.offsetWidth, h = pop.offsetHeight;
      let x = a.left - c.left + a.width / 2 - w / 2, y = a.bottom - c.top + 8;
      if (y + h > c.height - m) y = a.top - c.top - 8 - h;
      if (y < m) y = Math.max(m, Math.min(c.height - h - m, a.top - c.top));
      x = Math.max(m, Math.min(c.width - w - m, x));
      pop.style.left = x.toFixed(0) + 'px'; pop.style.top = y.toFixed(0) + 'px';
    }
    function openPop(button) {
      if (opener) opener.setAttribute('aria-expanded', 'false');
      popBody.replaceChildren(...details(button.dataset.detailOpen));
      pop.setAttribute('aria-label', 'Details: ' + button.textContent.replace(/\s+/g, ' ').trim());
      pop.hidden = false; opener = button; button.setAttribute('aria-expanded', 'true');
      placePop(button);
      $('[data-pop-close]', pop).focus({ preventScroll: true });
    }
    function closePop(refocus) {
      if (pop.hidden) return;
      pop.hidden = true;
      if (opener) { opener.setAttribute('aria-expanded', 'false'); if (refocus && opener.isConnected) opener.focus({ preventScroll: true }); }
      opener = null;
    }
    hero.addEventListener('click', e => {
      const b = e.target.closest('[data-detail-open]');
      if (b) { touched(); if (opener === b && !pop.hidden) closePop(true); else openPop(b); }
    });
    $('[data-pop-close]', pop).addEventListener('click', () => { touched(); closePop(true); });
    document.addEventListener('pointerdown', e => { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('[data-detail-open]')) closePop(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { e.preventDefault(); closePop(true); } });

    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.2 }).observe(hero);
    document.addEventListener('visibilitychange', start);
    reduce.addEventListener('change', () => { if (isStatic()) { stop(); elapsed = FINAL_T; renderAt(FINAL_T); } });

    layout();
    elapsed = isStatic() ? FINAL_T : 0;
    renderAt(elapsed);
    sync(); syncFollow(); start();

    // The phone cut in marketing/motion/hero-loop renders this element and
    // fails if its timing differs from timing.json.
    window.LangSpanHero = {
      element: hero, timing: TIMING, renderAt, frameState,
      layout: () => L, camera: () => ({ ...cam }), relayout, frameFor: i => frameFor(i),
      // For films: keep the flow at a given scale (1 is the default view).
      flowScale: s => { cam.mode = 'flow'; cam.fs = s; syncFollow(); },
      clock: () => ({ elapsed, playing, held, visible, running: !!raf, resumeScheduled: !!idle })
    };
  }

  /* ---------- Phone menu and copy buttons ---------- */
  const menu = $('.mobile-nav');
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('pointerdown', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  menu.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });
  all('[data-copy]').forEach(b => {
    b.hidden = false;
    b.addEventListener('click', async () => {
      const value = document.getElementById(b.dataset.copy), status = $('[data-copy-status]');
      try { await navigator.clipboard.writeText(value.textContent.trim()); b.textContent = 'Copied'; status.textContent = 'Command copied.'; }
      catch { const r = document.createRange(); r.selectNodeContents(value); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = 'Selected'; status.textContent = 'Command selected. Copy it with your keyboard.'; }
      setTimeout(() => { b.textContent = 'Copy'; }, 1600);
    });
  });
})();
