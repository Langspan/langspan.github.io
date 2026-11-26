/* Deterministic, browser-only LangSpan experience. No agent or benchmark is invoked. */
(() => {
  'use strict';
  const $=(q,el=document)=>el.querySelector(q), $$=(q,el=document)=>[...el.querySelectorAll(q)];
  const put=(el,q,s)=>{const node=$(q,el);if(node)node.textContent=s;};
  const show=(el,q)=>$$(q,el).forEach(n=>n.hidden=false);
  const pressed=(el,q,key,value)=>$$(q,el).forEach(n=>n.setAttribute('aria-pressed',String(n.dataset[key]===String(value))));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const isStatic=()=>reduced.matches||new URLSearchParams(location.search).get('motion')==='static';
  const paused=()=>document.documentElement.dataset.motionPaused==='true'||isStatic();
  // Reuse the site's pinned Motion mini for a short, caused state transition.
  function settle(el){if(!el||paused()||!window.Motion?.animate)return;try{window.Motion.animate(el,{opacity:[.84,1],transform:['translateY(3px)','translateY(0px)']},{duration:.18,ease:[.2,0,0,1]});}catch{}}
  function bind(el,selector,fn){$$(selector,el).forEach(b=>b.addEventListener('click',()=>fn(b)));}
  const sem=$('[data-lx-semantic]');
  if(sem){
    const data={
      local:['One checkout','Available in v0.1.0','Local argument-count notice','Possible call break: priceWithTax now takes two arguments. Inspect billing.ts.','Relevant context, not an edit refusal.','Supported Claude Code and Codex writes can receive this advisory with the tool result. Name matching does not resolve types or imports, and the agent chooses how to respond.','The illustrated caller has not been automatically repaired.','https://github.com/Langspan/LangSpan.dev/issues/29'],
      worktree:['Linked worktrees','Planned in #44','Proposed in-flight signature notice','A related exported signature changed in another worktree, before it was pushed.','Share symbol context across checkouts.','Today, linked worktrees share file activity rather than interface notices. #44 proposes bounded advisory context for relevant uncommitted signatures.','Planned behavior, not a released capability or an observed agent response.','https://github.com/Langspan/LangSpan.dev/issues/44'],
      remote:['Two machines','Exploratory, not in #44','Current boundary: activity metadata','Opt-in Git publications carry branch and file activity, not symbol signatures.','Investigate cross-machine semantic context.','A separate design would need to evaluate relevance, latency, privacy and opt-in metadata. It would not provide distributed edit locks.','No cross-machine symbol notice or automatic repair is claimed.','https://github.com/Langspan/LangSpan.dev/blob/main/docs/adr/0006-remote-awareness-through-git-refs.md']
    };
    const keys=['scope-label','scope-status','sem-title','sem-message','scope-heading','scope-body','scope-boundary'];
    bind(sem,'[data-lx-scope]',b=>{const k=b.dataset.lxScope;pressed(sem,'[data-lx-scope]','lxScope',k);keys.forEach((key,i)=>put(sem,'[data-lx-'+key+']',data[k][i]));const link=$('[data-lx-scope-link]',sem);link.href=data[k][7];link.textContent=k==='remote'?'Read the remote architecture':'See semantic roadmap';settle($('.lx-notice',sem));});
    show(sem,'.lx-controls');
  }
  const arch=$('[data-lx-architecture]');
  if(arch){
    const diagram=$('.arch-diagram',arch), machines=$$('.arch-machine',arch), cores=$$('.arch-core',arch);
    const defaults={label:diagram.getAttribute('aria-label'),titles:machines.map(m=>m.firstElementChild.textContent),locals:machines.map(m=>$('.arch-local',m).textContent),core:$('.arch-core small',machines[0]).textContent,git:$('.arch-git span',diagram).textContent,small:$('.arch-git small',diagram).textContent};
    const states={
      local:['One checkout. Shared coordination.','One coordinator can compare supported writes against active local holds and recorded source versions.','Local activity and scoped source notices','No remote publication without opt-in','Local supported operations only; host permissions remain in charge.','Shared checkout','Peer session','Same checkout','Same local edit domain','Local working tree','Git + configured checks'],
      worktree:['Linked worktrees. Separate edit domains.','A local coordinator can brief sessions about activity in related worktrees, while each checkout retains its own edit domain.','Related branch and file activity','Interface notices stay in one physical checkout in v0.1.0','Local holds do not lock a separate worktree.','Worktree A','Worktree B','Local edit domain A','Local edit domain B','Common Git repository','Shared work metadata'],
      remote:['Separate coordinators. Shared awareness.','Each machine has its own coordinator. Opt-in Git metadata gives the other session related work context, without remote locks.','Branch and file activity','Source contents, local holds and SQLite state','Remote awareness is advisory; host permissions remain authoritative.',...defaults.titles,...defaults.locals,defaults.git,defaults.small]
    };
    function choose(k){const s=states[k];pressed(arch,'[data-lx-arch]','lxArch',k);['title','description','shared','private','authority'].forEach((v,i)=>put(arch,'[data-lx-arch-'+v+']',s[i]));machines.forEach((m,i)=>{m.firstElementChild.textContent=s[5+i];$('.arch-local',m).textContent=s[7+i]});machines[1].hidden=k==='local';cores[1].hidden=k!=='remote';diagram.dataset.scope=k;$('.arch-lines',diagram).hidden=k==='local';put(diagram,'.arch-git span',s[9]);put(diagram,'.arch-git small',s[10]);put(diagram,'.arch-caption',s[0]);diagram.setAttribute('aria-label',s[0]+' '+s[1]);settle(diagram);}
    bind(arch,'[data-lx-arch]',b=>choose(b.dataset.lxArch));show(arch,'.lx-controls');choose('remote');
  }
  const proof=$('[data-lx-evidence]');
  if(proof){
    const records=$$('.evidence-item',proof), data={
      host:[0,'Supported overlap refusal and stale-source retry were observed in a real Codex session.','Less rework, fewer interventions or faster team delivery compared with another condition.'],
      remote:[1,'Published activity reached real Claude Code and Codex sessions on two machines.','A change of approach caused by the briefing, or a reduction in repair and manual relay.'],
      fixture:[2,'The reproducible scripted scenario exercises local holds, Git metadata and combined-tree check evidence.','A live model response or comparative improvement in team outcomes.']
    };
    function select(k){pressed(proof,'[data-lx-proof]','lxProof',k);records.forEach((r,i)=>r.hidden=i!==data[k][0]);put(proof,'[data-lx-proof-yes]',data[k][1]);put(proof,'[data-lx-proof-no]',data[k][2]);settle($('.lx-proof-inspector',proof));}
    bind(proof,'[data-lx-proof]',b=>select(b.dataset.lxProof));show(proof,'.lx-controls');select('host');
  }
  const exp=$('[data-lx-experiment]');
  if(exp){
    const section=$('#benchmark');
    const families={
      interface:['Change the pricing signature','billing.ts','Add a checkout caller','checkout.ts','Run the same functional tests on each combined tree. Verify that the changed interface and caller agree.','interface_change'],
      rename:['Rename parse_config','config.py','Add a caller of parse_config','cli.py','Check that both tasks are represented and every call uses a valid exported name in the combined tree.','rename_vs_new_caller'],
      contradiction:['Require one behavior','policy.py','Require an incompatible behavior','policy.py','Accept a reconciled result or an explicit contradiction report, according to the seeded task oracle.','contradictory_requirements'],
      duplicate:['Implement the seeded task','feature.ts','Pick up the same seeded task','feature.ts','Verify the task is implemented correctly; record duplicated implementation work separately.','duplicate_pickup'],
      overlap:['Update the first region','session.ts','Update a separate region','session.ts','Verify that both intended changes survive integration and the same functional tests pass.','same_file_concurrent_edits']
    };
    const arms={
      worktrees:['Worktrees alone','Each agent receives its task and isolated checkout. No peer context or LangSpan hooks are added.'],
      awareness_only:['Awareness only','Each agent receives a fixed description of peers and tasks. No LangSpan hooks, holds or refusals are enabled.'],
      langspan:['LangSpan, coordination enabled','Supply relevant briefings and scoped coordination. The same integration oracle judges the result; no success is assumed.']
    };
    const beats=[
      ['Seed identical tasks.','Start each condition from the same repository revision, task set, agent versions and permission settings.','Seeded inputs'],
      ['Execute independently.','Each condition uses its specified coordination mechanism. Record agent decisions without assuming they respond to a notice.','Agent execution'],
      ['Integrate and check.','Combine the changes under the same rules and run the same functional oracle. An ordinary clean merge is not sufficient.','Combined checks'],
      ['Publish every outcome.','Retain successes, failures, timeouts, model versions and exact starting commits. Compare outcomes only after real runs.','Outcome record']
    ];
    const metrics={
      correctness:['Combined correctness','Count runs whose integrated tree satisfies the same functional oracle.','Report successful runs, total runs and uncertainty intervals.'],
      repair:['Corrective work','Count corrective edits and effort caused by incompatible or duplicated work. Exclude planned iteration.','Requires reviewed evidence of why each correction was necessary.'],
      relay:['Manual relay','Count human messages that copy task state or changes between agent sessions.','Keep decisions, design discussion and ordinary review separate.'],
      time:['Elapsed time','Measure time to a working integrated result under comparable conditions.','Retain incomplete and timed-out runs; do not silently discard them.'],
      tokens:['Token consumption','Record usage only where the host reports it.','Unavailable token counts remain unknown.'],
      interruptions:['Interruptions','Record human questions, stops and unnecessary blocks separately.','Inspect what happened after a refusal or notice.']
    };
    let count=2,family='interface',arm='langspan',beat=3,metric='correctness',elapsed=12000,running=false,raf=0,last=0;
    const play=$('[data-lx-play]',exp), trace=$('.lx-trace',exp),progress=$('[data-lx-progress]',exp);
    const ms=12000;
    const manifest=()=>({status:'not_run',sessions_per_arm:count,task_family:families[family][5],conditions:Object.keys(arms),starting_commit:null,agent_versions:null,seed:null,oracle:families[family][4],results:null});
    function updateManifest(){put(section,'[data-lx-manifest]',JSON.stringify(manifest(),null,2))}
    function renderArm(){pressed(exp,'[data-lx-arm]','lxArm',arm);$$('[data-lx-lane]',exp).forEach(l=>l.dataset.selected=String(l.dataset.lxLane===arm));put(exp,'[data-lx-arm-title]',arms[arm][0]);put(exp,'[data-lx-arm-body]',arms[arm][1]);const a=families[family];put(exp,'[data-lx-context]',arm==='worktrees'?'Your task: '+a[2]+'.':arm==='awareness_only'?'Peer A task: '+a[0]+'. Your task: '+a[2]+'.':'Related peer activity: '+a[1]+'. Inspect related work before editing.');}
    function renderConfig(){const a=families[family];pressed(exp,'[data-lx-n]','lxN',count);put(exp,'[data-lx-count]',count+' sessions / arm');['task-a','file-a','task-b','file-b','oracle'].forEach((k,i)=>put(exp,'[data-lx-'+k+']',a[i]));$('[data-lx-other]',exp).hidden=count===2;put(exp,'[data-lx-other-count]',(count-2)+' further sessions');$$('[data-lx-agents]',exp).forEach(el=>{el.replaceChildren(...Array.from({length:count},(_,i)=>{const n=document.createElement('span');n.textContent=String.fromCharCode(65+i);return n;}))});renderArm();updateManifest();}
    function setBeat(n){beat=n;exp.dataset.beat=String(n);pressed(exp,'[data-lx-beat]','lxBeat',n);put(exp,'[data-lx-beat-title]',beats[n][0]);put(exp,'[data-lx-beat-body]',beats[n][1]);$$('[data-lx-lane-phase]',exp).forEach(x=>x.textContent=beats[n][2]);}
    function draw(t){elapsed=Math.min(ms,Math.max(0,t));const next=Math.min(3,Math.floor(elapsed/3000));if(next!==beat)setBeat(next);progress.style.transform='scaleX('+(elapsed/ms)+')';trace.style.strokeDashoffset=String(1-Math.min(1,elapsed/3000));}
    function stop(){running=false;cancelAnimationFrame(raf);play.textContent=elapsed>=ms?'Replay protocol':'Play protocol';}
    function tick(now){if(!running)return;if(paused()||document.hidden){stop();return;}draw(elapsed+Math.min(100,Math.max(0,now-last)));last=now;if(elapsed>=ms){stop();return;}raf=requestAnimationFrame(tick);}
    function start(){if(isStatic()||paused())return;if(elapsed>=ms)draw(0);running=true;last=performance.now();play.textContent='Pause protocol';raf=requestAnimationFrame(tick);}
    bind(exp,'[data-lx-n]',b=>{count=Number(b.dataset.lxN);renderConfig();});
    $('[data-lx-family]',exp).addEventListener('change',e=>{family=e.target.value;renderConfig();});
    bind(exp,'[data-lx-arm]',b=>{arm=b.dataset.lxArm;renderArm();});
    bind(exp,'[data-lx-beat]',b=>{stop();draw(Number(b.dataset.lxBeat)*3000);play.textContent='Play protocol';});
    play.addEventListener('click',()=>running?stop():start());
    function motion(){play.hidden=isStatic();play.disabled=paused();if(paused())stop();}
    addEventListener('langspan:motion',motion);reduced.addEventListener('change',motion);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
    if('IntersectionObserver'in window)new IntersectionObserver(([entry])=>{if(!entry.isIntersecting&&running)stop()}).observe(exp);
    bind(section,'[data-lx-metric]',b=>{metric=b.dataset.lxMetric;pressed(section,'[data-lx-metric]','lxMetric',metric);['title','definition','note'].forEach((k,i)=>put(section,'[data-lx-metric-'+k+']',metrics[metric][i]));settle($('.lx-metric-detail',section));});
    show(section,'[data-lx-enhance], [data-lx-arm], .lx-metric-controls');
    renderConfig();setBeat(3);draw(ms);stop();motion();
    window.LangSpanBenchmark={seek(seconds){stop();draw(seconds*1000);},snapshot(){return{count,family,arm,beat,metric,elapsed,running,manifest:manifest()}}};
  }
  const install=$('[data-lx-install]');
  if(install){
    const hosts=$$('[data-lx-host]',install),confirm=$('[data-lx-confirm]',install),result=$('[data-lx-setup-result]',install);
    const update=()=>{const names=hosts.filter(x=>x.checked).map(x=>x.dataset.lxHost);put(install,'[data-lx-host-summary]',names.length?'Connect '+names.join(' and '):'Select at least one host.');confirm.disabled=names.length===0;result.hidden=true;};
    hosts.forEach(x=>x.addEventListener('change',update));
    confirm.addEventListener('click',()=>{result.hidden=false;settle(result);});
    show(install,'[data-lx-enhance], [data-lx-confirm]');update();
  }
})();
