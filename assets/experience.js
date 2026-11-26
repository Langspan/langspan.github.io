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
      worktree:['Linked worktrees','On main, not released','In-flight signature notice','A related exported signature changed in another worktree, before it was pushed.','See interface changes across checkouts.','On main, briefings can include relevant uncommitted exported signatures from linked worktrees. Each checkout keeps its own edit domain.','Illustrated behavior from the source build, not an observed agent response or a v0.1.0 capability.','https://github.com/Langspan/LangSpan.dev/pull/180'],
      remote:['Two machines','Activity metadata only','Current boundary: activity metadata','Opt-in Git publications carry branch and file activity, not symbol signatures.','Investigate cross-machine semantic context.','A separate design would need to evaluate relevance, latency, privacy and opt-in metadata. It would not provide distributed edit locks.','No cross-machine symbol notice or automatic repair is claimed.','https://github.com/Langspan/LangSpan.dev/blob/main/docs/adr/0006-remote-awareness-through-git-refs.md']
    };
    const keys=['scope-label','scope-status','sem-title','sem-message','scope-heading','scope-body','scope-boundary'];
    bind(sem,'[data-lx-scope]',b=>{const k=b.dataset.lxScope;pressed(sem,'[data-lx-scope]','lxScope',k);keys.forEach((key,i)=>put(sem,'[data-lx-'+key+']',data[k][i]));const link=$('[data-lx-scope-link]',sem);link.href=data[k][7];link.textContent=k==='remote'?'Read the remote architecture':k==='worktree'?'Read the implementation':'See semantic roadmap';settle($('.lx-notice',sem));});
    show(sem,'.lx-controls');
  }
  const arch=$('[data-lx-architecture]');
  if(arch){
    const diagram=$('.arch-diagram',arch), machines=$$('.arch-machine',arch), cores=machines.map(m=>$('.arch-core',m));
    const lines=$('.arch-lines',diagram), git=$('.arch-git',diagram), shared=$('.arch-shared',diagram);
    const defaults={titles:machines.map(m=>m.firstElementChild.textContent),locals:machines.map(m=>$('.arch-local',m).textContent),git:$('.arch-git span',diagram).textContent,small:$('.arch-git small',diagram).textContent};
    const states={
      local:['One checkout. Shared coordination.','One coordinator can compare supported writes against active local holds and recorded source versions.','Local activity and scoped source notices','No remote publication without opt-in','Local supported operations only; host permissions remain in charge.','Shared checkout','Peer session','Same checkout','Same local edit domain','Local working tree','Git + configured checks'],
      worktree:['Linked worktrees. Separate edit domains.','A local coordinator can brief sessions about activity in related worktrees, while each checkout retains its own edit domain.','Related branch and file activity','Interface notices stay in one physical checkout in v0.1.0','Local holds do not lock a separate worktree.','Worktree A','Worktree B','Local edit domain A','Local edit domain B','Common Git repository','Shared work metadata'],
      remote:['Separate coordinators. Shared awareness.','Each machine has its own coordinator. Opt-in Git metadata gives the other session related work context, without remote locks.','Branch and file activity','Source contents, local holds and SQLite state','Remote awareness is advisory; host permissions remain authoritative.',...defaults.titles,...defaults.locals,defaults.git,defaults.small]
    };
    function connect(){
      if(lines.hasAttribute('hidden'))return;
      const r=lines.getBoundingClientRect();if(!r.width)return;
      const xs=machines.map(m=>{const b=m.getBoundingClientRect();return 400*(b.left+b.width/2-r.left)/r.width});
      $('path',lines).setAttribute('d','M'+xs[0]+' 0V16Q'+xs[0]+' 30 '+(xs[0]+14)+' 30H200V60M'+xs[1]+' 0V16Q'+xs[1]+' 30 '+(xs[1]-14)+' 30H200');
    }
    function choose(k){
      const s=states[k],local=k==='local',remote=k==='remote';
      pressed(arch,'[data-lx-arch]','lxArch',k);
      ['title','description','shared','private','authority'].forEach((v,i)=>put(arch,'[data-lx-arch-'+v+']',s[i]));
      machines.forEach((m,i)=>{m.firstElementChild.textContent=s[5+i];$('.arch-local',m).textContent=s[7+i];});
      machines[1].hidden=local;cores.forEach((el,i)=>el.hidden=!(remote||(local&&i===0)));
      // SVG elements do not reflect the HTMLElement.hidden property.
      lines.toggleAttribute('hidden',local);git.hidden=!remote;shared.hidden=k!=='worktree';
      diagram.dataset.scope=k;
      if(remote)$('path',lines).setAttribute('stroke-dasharray','5 4');else $('path',lines).removeAttribute('stroke-dasharray');
      put(diagram,'.arch-caption',s[0]);diagram.setAttribute('aria-label',s[0]+' '+s[1]);connect();
    }
    bind(arch,'[data-lx-arch]',b=>choose(b.dataset.lxArch));show(arch,'.lx-controls');choose('remote');
    if('ResizeObserver'in window)new ResizeObserver(connect).observe(diagram);

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
      rename:['Rename parse_config to load_config','shelf/config.py','Add a feature using the parser','shelf/features/*.py','Require the renamed parser, updated callers, working new features and passing combined tests.','rename_vs_new_caller'],
      contradiction:['Set an export batch to 100','shelf/export.py','Set a listing page to 10','shelf/ui.py','Both functions must use their required values. Preserve the conflicting shared default and pass the combined tests.','contradictory_defaults']
    };
    const arms={
      worktrees:['Isolated clones','Each agent receives its own task in a separate Git clone with no remote. No peer context or LangSpan hooks. The runner retains the arm name worktrees.'],
      awareness_only:['Awareness only','Each agent receives its peers’ task text in the prompt. No remote or LangSpan hooks are added.'],
      langspan:['LangSpan, coordination enabled','One coordinator per clone shares task lines and file activity through Git. The oracle judges the combined result; no cross-clone edit hold or semantic notice is assumed.']
    };
    const beats=[
      ['Seed identical tasks.','Start each condition from the same repository revision, task set, agent versions and permission settings.','Seeded inputs'],
      ['Execute independently.','Each condition uses its specified coordination mechanism. Record agent decisions without assuming they respond to a notice.','Agent execution'],
      ['Integrate and check.','Combine the changes under the same rules and run the same functional oracle. An ordinary clean merge is not sufficient.','Combined checks'],
      ['Publish every outcome.','Retain successes, failures, timeouts, model versions and the seeded task assignment. Compare outcomes only after valid runs.','Outcome record']
    ];
    const metrics={
      correctness:['Combined correctness','Count runs whose integrated tree satisfies the same functional oracle.','Report successful runs, total runs and uncertainty intervals.'],
      semantic:['Semantic conflicts','Record incompatible calls or lost requirements in the combined result.','Inspect the oracle’s conflict details; a clean Git merge is not enough.'],
      duplicate:['Duplicate work','Record duplicated implementation work identified by the task oracle.','These are fixture-specific observations, not a measure of engineering time saved.'],
      time:['Elapsed time','Record elapsed time, including unsuccessful or incomplete trials.','Retain incomplete and timed-out runs; do not silently discard them.'],
      tokens:['Token consumption','Record usage only where the host reports it.','Unavailable token counts remain unknown.'],
      interruptions:['Interruptions','Record agent stops, questions, permission denials and LangSpan refusals.','Inspect what happened after a refusal or notice.']
    };
    let count=2,family='rename',arm='langspan',beat=3,metric='correctness',elapsed=12000,running=false,raf=0,last=0;
    const play=$('[data-lx-play]',exp), trace=$('.lx-trace',exp),progress=$('[data-lx-progress]',exp);
    const ms=12000;
    const manifest=()=>({status:'not_run',sessions_per_arm:count,task_family:families[family][5],conditions:Object.keys(arms),starting_commit:null,agent_versions:null,seed:null,oracle:families[family][4],results:null});
    function updateManifest(){put(section,'[data-lx-manifest]',JSON.stringify(manifest(),null,2))}
    function renderArm(){pressed(exp,'[data-lx-arm]','lxArm',arm);$$('[data-lx-lane]',exp).forEach(l=>l.dataset.selected=String(l.dataset.lxLane===arm));put(exp,'[data-lx-arm-title]',arms[arm][0]);put(exp,'[data-lx-arm-body]',arms[arm][1]);const a=families[family];put(exp,'[data-lx-context]',arm==='worktrees'?'Your task: '+a[2]+'.':arm==='awareness_only'?'Peer A task: '+a[0]+'. Your task: '+a[2]+'.':'Related peer task: '+a[0]+'.');}
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
