import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mockLatestRelease} from './release-links-check.mjs';
// Home page, revision 2 (langspan.github.io#39): the hero replays a recorded
// slice of LangSpan Live's "Now" view from assets/evidence/hero-slice-2026-11-25.json.
const ORDER=['top','problem','agent-sees','how-it-works','across-computers','verified','start','open-source','questions','for-agents','get-langspan'];
const CARDS=['card-hook','card-observer','card-dash','card-graph-c7','card-tests','card-held','card-graph-late','card-graph','card-read','card-saved'];
const TAG='v0.8.0';
const fixture=JSON.parse(readFileSync(new URL('../assets/evidence/hero-slice-2026-11-25.json',import.meta.url),'utf8'));
const timing=JSON.parse(readFileSync(new URL('../marketing/motion/hero-loop/timing.json',import.meta.url),'utf8'));
const bySeq=new Map(fixture.events.map(e=>[e.seq,e]));
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
// Visible text smaller than 11 px.
const smallText=p=>p.evaluate(()=>{const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const el=w.currentNode.parentElement;if(!w.currentNode.textContent.trim()||!el||el.closest('.sr-only,[hidden]'))continue;const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(!r.width||!r.height||cs.visibility==='hidden')continue;if(parseFloat(cs.fontSize)<11)out.push(el.className+' '+cs.fontSize);}return out;});
const box=(p,card)=>p.locator('[data-card="'+card+'"]').boundingBox();

// The fixture: privacy and traceability. Runs without a browser.
function checkFixture(){
 const text=JSON.stringify(fixture);
 for(const banned of [/claude-code\.[0-9a-f]{8}/,/"session_id"/,/"digest"/,/"text"/,/\/Users\//,/\/home\//,/"lsd-/,/lsh1-/])
  assert.ok(!banned.test(text),'fixture contains '+banned);
 assert.ok(fixture.events.every(e=>Object.keys(e).every(k=>['seq','type','lane','time','paths','lines','tool','origin','held_by_change_from','to'].includes(k))),'fixture keeps only the listed fields');
 assert.ok(!fixture.events.some(e=>e.type==='session_prompted'),'fixture keeps no prompts');
 assert.deepEqual([...new Set(fixture.events.map(e=>e.lane))].sort(),['Agent · #28 signature alerts','Agent · #29 renames','Agent · worktree signatures']);
 assert.deepEqual([fixture.repository,fixture.branch],['LangSpan.dev','dogfood/rename-safety']);
 assert.ok(Object.keys(fixture.lanes).length===3&&Object.values(fixture.lanes).every(l=>l.branch&&l.checkout));
 // Every seq the timing draws is in the fixture.
 for(const e of timing.events)for(const s of e.seq||[])assert.ok(bySeq.has(s),'timing cites seq '+s+', which is not in the fixture');
 const refused=fixture.events.filter(e=>e.type==='write_refused');
 assert.equal(refused.length,3,'three writes held in the 10 minutes before 19:57:52');
 assert.ok(refused.every(e=>e.time>='2026-11-25T19:47:52'&&e.time<='2026-11-25T19:57:52'));
 const held=bySeq.get(29256);
 assert.deepEqual([held.type,held.lane,held.held_by_change_from,held.paths[0],held.time.slice(11,19)],['write_refused','Agent · #28 signature alerts','Agent · #29 renames','src/hook.rs','19:57:41']);
 assert.equal(bySeq.get(29274).time.slice(11,19),'19:57:47');
 assert.equal(bySeq.get(29285).time.slice(11,19),'19:57:52');
 const edits=[29129,29141,29146].map(s=>bySeq.get(s));
 assert.ok(edits.every(e=>e.tool==='Edit'&&e.paths[0]==='src/hook.rs'&&e.lane==='Agent · #29 renames'));
 assert.deepEqual([edits[0].time.slice(11,19),edits[2].time.slice(11,19)],['19:56:27','19:56:30']);
}

export async function checkProductFirst(browser,base,out,axe){
 checkFixture();
 for(const width of [1440,1280,768,390,358]){
  for(const colorScheme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:width>=768?900:844},colorScheme,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
   const p=await context.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await mockLatestRelease(p,TAG);
   await p.goto(base+'/?motion=static',{waitUntil:'networkidle'});
   assert.equal((await p.locator('h1').innerText()).replace(/\s+/g,' ').trim(),'Your agents. On the same page.');
   assert.deepEqual(await p.locator('main > section').evaluateAll(s=>s.map(x=>x.id)),ORDER);
   assert.equal(await overflow(p),false,'overflow '+width+' '+colorScheme);
   assert.deepEqual(await smallText(p),[],'text under 11 px at '+width+' '+colorScheme);
   assert.equal(await p.locator('[data-release-version]').first().textContent(),TAG);
   // Hero: reduced motion shows the final state of the recorded slice.
   const hero=p.locator('[data-hero-loop]');
   assert.equal(await p.evaluate(()=>window.LangSpanHero.clock().playing),false);
   assert.equal(await hero.locator('.live-tag').count(),0,'no caption on the hero');
   assert.equal((await hero.locator('.live-agents').textContent()).trim(),'3 agents');
   assert.equal(await hero.locator('.live-bar code').textContent(),fixture.branch);
   for(const [lane,info] of Object.entries(fixture.lanes))assert.ok(await hero.locator('.lane-head',{hasText:lane}).isVisible(),lane);
   for(const c of CARDS)assert.ok(await hero.locator('[data-card="'+c+'"]').isVisible(),c+' visible');
   assert.equal(await hero.locator('.wire-label:visible').count(),1);
   assert.equal(await hero.locator('.wire-label').textContent(),'Held');
   assert.equal(await hero.locator('[data-pop]').isVisible(),false,'no details panel opens on its own');
   assert.equal(await hero.locator('figcaption, .live-foot').count(),0,'no narration under the hero');
   // Hero text stays at least 12 px on narrow screens (11 px elsewhere).
   if(width<=760)assert.deepEqual(await hero.evaluate(h=>[...h.querySelectorAll('[data-canvas] *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&getComputedStyle(e).display!=='none'&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.className+' '+getComputedStyle(e).fontSize)),[],'hero text under 12 px at '+width);
   assert.equal((await hero.locator('.live-status').textContent()).trim(),'3 agents working · 3 writes held in the last 10 min');
   assert.equal(await hero.locator('[class*=legend]').count(),0,'no legend');
   // Each drawn card cites fixture events, and its file pill names a path from them.
   for(const c of CARDS){
    const seqs=(await hero.locator('[data-card="'+c+'"]').getAttribute('data-seq')).split(' ').map(Number);
    assert.ok(seqs.every(s=>bySeq.has(s)),c+' cites a seq that is not in the fixture');
    const paths=seqs.flatMap(s=>bySeq.get(s).paths||[]);
    for(const pill of (await hero.locator('[data-card="'+c+'"] code').allTextContents()).flatMap(t=>t.split(', ')))
     assert.ok(paths.some(x=>x.endsWith(pill)),c+' shows '+pill+', which its events do not name');
   }
   // Layout: time runs left to right at 1280 px and up, top to bottom below.
   const [hook,graph,held,saved]=await Promise.all(['card-hook','card-graph','card-held','card-saved'].map(c=>box(p,c)));
   if(width>=1280)assert.ok(graph.x>hook.x&&saved.x>held.x&&held.y>hook.y,'horizontal timeline '+width);
   else assert.ok(graph.y>hook.y&&saved.y>held.y&&held.x>hook.x,'vertical timeline '+width);
   // No two cards, lane heads or the Held label overlap.
   assert.deepEqual(await hero.evaluate(h=>{const b=[...h.querySelectorAll('[data-card],.wire-label,.lane-head')].filter(e=>getComputedStyle(e).display!=='none').map(e=>[e.dataset.card||e.className,e.getBoundingClientRect()]);const o=[];for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++){const a=b[i][1],c=b[j][1];if(a.left<c.right-1&&c.left<a.right-1&&a.top<c.bottom-1&&c.top<a.bottom-1)o.push(b[i][0]+' x '+b[j][0]);}return o;}),[],'overlap at '+width);
   const tools=hero.locator('[data-camera] button');// Pause, +, −, Fit, Follow newest
   assert.equal(await tools.count(),5);
   if(width<1280)for(const b of await tools.all()){const r=await b.boundingBox();assert.ok(r.width>=44&&r.height>=44,'camera control at least 44 px');}
   assert.equal(await hero.locator('[data-camera] [data-hero-play]').textContent(),'Play');
   // The page carries no dates and no Recorded or replay wording.
   const visible=await p.locator('body').innerText();
   assert.ok(!/\b20\d\d\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d|\bas of\b|recorded|replay/i.test(visible.replace(/arXiv \d{4}\.\d+/g,'')),'no dates, as-of, recorded or replay wording');
   // No placeholders: the proof section waits for benchmark numbers (#495), and nothing says pending or coming soon.
   assert.equal(await p.locator('#proof').count(),0,'proof section hidden until the benchmark publishes');
   const body=await p.locator('main').innerText();
   assert.ok(!/pending|recording needed|coming soon|coming in the next release/i.test(body),'no placeholder wording');
   assert.equal((body.match(/Coming next/g)||[]).length,1,'one Coming next line');
   assert.equal(await p.locator('#agent-sees .scene').count(),5);
   // Hosts match the product README.
   const hosts=await p.locator('#verified tbody tr').evaluateAll(r=>r.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
   assert.deepEqual(hosts.map(h=>h.split(' ').slice(0,2).join(' ')),['Claude Code','Codex Tested','Antigravity Tested','Cursor Built','Other agents']);
   assert.match(hosts[0],/^Claude Code Tested on real sessions/);
   assert.match(hosts[2],/Tested on a real session \(Antigravity CLI 1\.5\.14\)/);
   assert.match(hosts[3],/not yet tested on a real session/);
   assert.equal(await p.locator('#questions .faq h3').count(),8);
   assert.equal(await p.locator('.mobile-nav').isVisible(),width<=760);
   if(width<=760){await p.locator('.mobile-nav summary').click();assert.equal(await p.locator('.mobile-nav nav a:visible').count(),5);const b=await p.locator('.mobile-nav nav').boundingBox();assert.ok(b.x>=0&&b.x+b.width<=width+1);await p.locator('.mobile-nav nav a').first().focus();await p.keyboard.press('Escape');assert.equal(await p.locator('.mobile-nav').getAttribute('open'),null);}
   if(colorScheme==='light'){
    await p.locator('[data-copy=setup-command]').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'langspan setup');
    await p.locator('[data-copy=install-hero]').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'curl -fsSL https://github.com/Langspan/LangSpan.dev/releases/latest/download/install.sh | sh');
    // Camera: zoom changes the view, Fit restores it, Follow newest toggles.
    const world=hero.locator('[data-world]'),fitT=await world.evaluate(e=>e.style.transform);
    await hero.locator('[data-cam=in]').click();assert.notEqual(await world.evaluate(e=>e.style.transform),fitT,'zoom in');
    assert.equal(await hero.locator('[data-cam=follow]').getAttribute('aria-pressed'),'true','Follow newest starts on');
    await hero.locator('[data-cam=fit]').click();assert.equal(await world.evaluate(e=>e.style.transform),fitT,'Fit restores the view');
    assert.equal(await hero.locator('[data-cam=follow]').getAttribute('aria-pressed'),'false');
    await hero.locator('[data-cam=follow]').click();assert.equal(await hero.locator('[data-cam=follow]').getAttribute('aria-pressed'),'true');
    if(width===1440||width===390)await checkCanvas(p,hero,width);
    await p.addScriptTag({content:axe});const report=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
    assert.deepEqual(report.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],'homepage accessibility '+width);
   }
   if(width===1440||width===390)await p.screenshot({path:out+'/'+width+'-'+colorScheme+'-home-full.png',fullPage:true});
   assert.deepEqual(errors,[],'homepage errors '+width+' '+colorScheme);await context.close();
  }
 }
 // Motion: one renderAt(t), the timing contract, pause, legacy links.
 const p=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});await mockLatestRelease(p,TAG);
 await p.goto(base+'/',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>window.LangSpanHero.clock().running);
 const contract=await p.evaluate(()=>({id:window.LangSpanHero.element.id,timing:window.LangSpanHero.timing,renderAt:typeof window.LangSpanHero.renderAt}));
 assert.equal(contract.id,'edit-coordination');assert.equal(contract.renderAt,'function');
 for(const k of ['events','holds_s','easing','fps','duration_s','frames','loops_before_stop','final_s'])assert.deepEqual(contract.timing[k],timing[k],'hero timing '+k+' equals timing.json');
 for(const t of timing.phone_cut.seek_samples_s){const a=await p.evaluate(t=>JSON.stringify(window.LangSpanHero.frameState(t)),t);await p.evaluate(()=>window.LangSpanHero.frameState(7.7));assert.equal(await p.evaluate(t=>JSON.stringify(window.LangSpanHero.frameState(t)),t),a,'seek parity '+t);}
 assert.ok(await p.evaluate(()=>{const a=window.LangSpanHero.frameState(0),b=window.LangSpanHero.frameState(12);for(const s of [a,b]){delete s.t;delete s.frame;}return JSON.stringify(a)===JSON.stringify(b);}),'loop seam');
 const empty=await p.evaluate(()=>window.LangSpanHero.frameState(0.2));
 assert.ok(Object.values(empty.cards).every(([o])=>o===0)&&empty.wire===0,'the first frame shows lanes only');
 // Each beat's state at its time in timing.json, read back from renderAt.
 const beat=t=>p.evaluate(t=>window.LangSpanHero.frameState(t),t);
 const b1=await beat(1),b4=await beat(4),b48=await beat(4.8),b6=await beat(6),b75=await beat(7.5),b10=await beat(10);
 assert.ok(b1.cards['card-hook'][0]===1&&b1.cards['card-held'][0]===0&&b1.wire===0,'t=1: early cards, no hold yet');
 assert.ok(b4.cards['card-held'][0]===1&&b4.wire>0.9&&b4.cards['card-read'][0]===0,'t=4: held card and wire');
 assert.ok(b48.cards['card-held'][2]===1&&b48.wire===1,'t=4.8: emphasis over, held card rests');
 assert.ok((await beat(4.575)).cards['card-held'][2]>1.02&&(await beat(4.575)).cards['card-held'][2]<=1.03,'emphasis peaks at 1.03');
 assert.ok(b6.cards['card-read'][0]===1&&b6.cards['card-saved'][0]===0,'t=6: read, not yet saved');
 assert.ok(b75.cards['card-saved'][0]===1&&b75.saved===1,'t=7.5: saved and green');
 assert.ok(Object.values(b10.cards).every(([o])=>o===1)&&b10.wire===1,'t=10: settled');
 assert.equal(timing.final_s,10);
 await p.locator('[data-hero-play]').click();assert.equal(await p.locator('[data-hero-play]').innerText(),'Play');
 const t=await p.evaluate(()=>window.LangSpanHero.clock().elapsed);await p.waitForTimeout(300);
 assert.equal(await p.evaluate(()=>window.LangSpanHero.clock().elapsed),t,'pause freezes the clock');
 await p.locator('[data-hero-play]').click();assert.equal(await p.locator('[data-hero-play]').innerText(),'Pause');
 await p.goto(base+'/#benchmark');await p.waitForURL('**/technical.html#benchmark');assert.ok(await p.locator('#benchmark').isVisible());
 await p.goto(base+'/#langspan-live');await p.waitForURL('**/technical.html#langspan-live');
 await p.close();
 // The view loops without stopping; the page clock is fast-forwarded.
 const q=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});await mockLatestRelease(q,TAG);
 await q.clock.install();await q.goto(base+'/',{waitUntil:'networkidle'});
 for(let i=0;i<520;i++)await q.clock.runFor(100);
 assert.equal(await q.evaluate(()=>window.LangSpanHero.clock().playing),true,'loops without stopping');
 assert.ok(await q.evaluate(()=>window.LangSpanHero.clock().elapsed<12),'the clock wraps at the loop length');
 assert.equal(await q.locator('[data-hero-play]').innerText(),'Pause');
 await q.close();
 await checkPauseResume(browser,base);
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await nojs.goto(base+'/',{waitUntil:'domcontentloaded'});
 for(const c of CARDS)assert.ok(await nojs.locator('[data-card="'+c+'"]').isVisible(),'no-JS shows '+c);
 assert.equal(await nojs.locator('[data-pop]').isVisible(),false,'no-JS keeps the details closed');
 assert.equal(await nojs.locator('[data-camera]').isVisible(),false);
 assert.equal(await nojs.locator('[data-copy]:visible').count(),0);
 await nojs.close();
 console.log('PASS home page: fixture provenance and privacy, five widths, light and dark, section order, hero final state, layouts, camera, details popover, keyboard, pause and resume, beats, proof hidden until the benchmark publishes, hosts, loop contract, pause, continuous loop, no dates, reduced motion, no-JS and automated accessibility');
}

// Popover, keyboard, drag and focus order on the canvas.
async function checkCanvas(p,hero,width){
 const canvas=hero.locator('[data-canvas]'),pop=hero.locator('[data-pop]'),world=hero.locator('[data-world]');
 const inside=async()=>{const c=await canvas.boundingBox(),b=await pop.boundingBox();return b.x>=c.x-0.5&&b.y>=c.y-0.5&&b.x+b.width<=c.x+c.width+0.5&&b.y+b.height<=c.y+c.height+0.5;};
 for(const key of ['card-hook','card-held','card-saved','card-graph-late','wire']){
  const opener=hero.locator('[data-detail-open="'+key+'"]');
  await opener.click();
  assert.ok(await pop.isVisible(),key+' opens details');
  assert.ok(await inside(),key+' details stay inside the canvas at '+width);
  const area=await pop.boundingBox(),c=await canvas.boundingBox();
  assert.ok(area.width*area.height<0.6*c.width*c.height,key+' details cover less than 60 percent of the canvas');
  assert.equal(await opener.getAttribute('aria-expanded'),'true');
  if(key==='card-held'){const t=await pop.innerText();for(const w of ['What changed','What LangSpan told the agent','What happened next','src/hook.rs','19:57:41'])assert.ok(t.includes(w),'held details name '+w);}
  if(key==='card-hook')assert.ok((await pop.innerText()).includes('1773–2097'),'details name the lines');
  if(key==='card-hook'){await p.keyboard.press('Escape');assert.equal(await pop.isVisible(),false,'Escape closes');assert.equal(await p.evaluate(()=>document.activeElement.dataset.detailOpen),'card-hook','focus returns to the card');}
  else if(key==='card-saved'){await p.locator('h1').click();assert.equal(await pop.isVisible(),false,'a click outside closes');}
  else{await hero.locator('[data-pop-close]').click();assert.equal(await pop.isVisible(),false,'the close button closes');}
 }
 // Each line, time and range in the details comes from the fixture.
 const lines=new Set(fixture.events.flatMap(e=>(e.lines||[]).map(([a,b])=>a+'–'+b)));
 const times=new Set(fixture.events.filter(e=>e.time).map(e=>e.time.slice(11,19)));
 for(const tpl of await hero.locator('template[data-detail]').evaluateAll(t=>t.map(x=>x.innerHTML))){
  for(const t of tpl.match(/\b\d\d:\d\d:\d\d\b/g)||[])assert.ok(times.has(t),'details time '+t+' is in the fixture');
  for(const r of tpl.replace(/\d\d:\d\d:\d\d(–\d\d)?/g,'').match(/\b\d+–\d+\b/g)||[])if(!r.includes(':'))assert.ok([...lines].some(l=>{const [a,b]=l.split('–').map(Number),[x,y]=r.split('–').map(Number);return x>=a&&y<=b||lines.has(r)||(x<=a&&y>=b);}),'details range '+r+' comes from the fixture');
 }
 // Tab moves through the cards oldest first, and Enter opens details.
 await hero.locator('[data-detail-open="card-hook"]').focus();await p.keyboard.press('Tab');
 assert.equal(await p.evaluate(()=>document.activeElement.dataset.detailOpen),'card-observer','Tab order follows the cards at '+width+': '+await p.evaluate(()=>document.activeElement.outerHTML.slice(0,90)));
 await p.keyboard.press('Enter');assert.ok(await pop.isVisible(),'Enter opens details');await p.keyboard.press('Escape');
 // Keys on the canvas: + zooms, arrows pan, 0 fits, L follows.
 await canvas.focus();const fit=await world.evaluate(e=>e.style.transform);
 await p.keyboard.press('+');const zoomed=await world.evaluate(e=>e.style.transform);assert.notEqual(zoomed,fit,'+ zooms');
 await p.keyboard.press('ArrowLeft');assert.notEqual(await world.evaluate(e=>e.style.transform),zoomed,'arrow pans');
 await p.keyboard.press('0');assert.equal(await world.evaluate(e=>e.style.transform),fit,'0 fits');
 await p.keyboard.press('l');assert.equal(await hero.locator('[data-cam=follow]').getAttribute('aria-pressed'),'true','L follows');
 // Drag pans.
 const c=await canvas.boundingBox(),from={x:c.x+c.width-20,y:c.y+c.height-20};
 await p.mouse.move(from.x,from.y);await p.mouse.down();await p.mouse.move(from.x-60,from.y-10,{steps:4});await p.mouse.up();
 assert.notEqual(await world.evaluate(e=>e.style.transform),fit,'drag pans');
 await hero.locator('[data-cam=fit]').click();
}

// Left alone the view loops; an interaction pauses it, and it resumes after 8 s, or at once on Follow newest or Play.
async function checkPauseResume(browser,base){
 for(const width of [1440,390]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});await mockLatestRelease(p,TAG);
  await p.clock.install();await p.goto(base+'/',{waitUntil:'networkidle'});await p.clock.runFor(500);
  const clock=()=>p.evaluate(()=>window.LangSpanHero.clock());
  assert.equal((await clock()).playing,true,'plays when untouched');
  await p.locator('[data-detail-open="card-hook"]').click({force:true});
  assert.equal((await clock()).playing,false,'a click pauses');assert.equal(await p.locator('[data-hero-play]').innerText(),'Play','the control shows Play');
  const at=(await clock()).elapsed;await p.clock.runFor(7000);assert.equal((await clock()).elapsed,at,'stays paused for 7 s');
  await p.clock.runFor(1500);assert.equal((await clock()).playing,true,'resumes after 8 s');
  assert.equal(await p.locator('[data-pop]').isVisible(),false,'resuming closes the details');
  await p.locator('[data-cam=in]').click();assert.equal((await clock()).playing,false,'zoom pauses');
  await p.locator('[data-cam=follow]').click();await p.locator('[data-cam=follow]').click();assert.equal((await clock()).playing,true,'Follow newest resumes at once');
  await p.locator('[data-hero-play]').click();assert.equal((await clock()).playing,false,'Pause pauses');
  await p.clock.runFor(9000);assert.equal((await clock()).playing,false,'a visitor Pause stays paused');
  await p.locator('[data-hero-play]').click();assert.equal((await clock()).playing,true,'Play resumes');
  await p.close();
 }
 // Reduced motion: paused on the settled frame, and still interactive.
 const r=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await mockLatestRelease(r,TAG);
 await r.goto(base+'/',{waitUntil:'networkidle'});
 assert.deepEqual(await r.evaluate(()=>{const c=window.LangSpanHero.clock();return [c.playing,c.elapsed];}),[false,10]);
 await r.locator('[data-detail-open="card-held"]').click();assert.ok(await r.locator('[data-pop]').isVisible());
 assert.equal(await r.evaluate(()=>window.LangSpanHero.clock().playing),false,'reduced motion never resumes');
 await r.close();
}
