import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mockLatestRelease} from './release-links-check.mjs';
// Home page, revision 2 (langspan.github.io#39). The hero is LangSpan Live's
// "Now" view flowing over a recorded slice: assets/evidence/hero-slice.json,
// turned into a clock by marketing/scripts/build-hero-timeline.py.
const ORDER=['top','problem','agent-sees','how-it-works','across-computers','verified','start','open-source','questions','for-agents','get-langspan'];
const TAG='v0.8.0';
const fixture=JSON.parse(readFileSync(new URL('../assets/evidence/hero-slice.json',import.meta.url),'utf8'));
const timing=JSON.parse(readFileSync(new URL('../marketing/motion/hero-loop/timing.json',import.meta.url),'utf8'));
const bySeq=new Map(fixture.events.map(e=>[e.seq,e]));
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
// Visible text smaller than 11 px.
const smallText=p=>p.evaluate(()=>{const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const el=w.currentNode.parentElement;if(!w.currentNode.textContent.trim()||!el||el.closest('.sr-only,[hidden],template'))continue;const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(!r.width||!r.height||cs.visibility==='hidden')continue;if(parseFloat(cs.fontSize)<11)out.push(el.className+' '+cs.fontSize);}return out;});
// The hero's cards and wire labels that are on screen: inside the canvas and
// right of the pinned lane names.
const onScreen=hero=>hero.evaluate(h=>{const c=h.querySelector('[data-canvas]'),cr=c.getBoundingClientRect(),g=parseFloat(getComputedStyle(c).getPropertyValue('--gutter'));
 return [...h.querySelectorAll('[data-cards] .card,[data-wire-labels] .wire-label,[data-wire-labels] .source-chip')].map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.card||e.textContent,seq:e.dataset.seq||'',x:r.left,y:r.top,r:r.right,b:r.bottom,o:+getComputedStyle(e).opacity,size:Math.min(...[...e.querySelectorAll('*')].filter(n=>[...n.childNodes].some(x=>x.nodeType===3&&x.textContent.trim())&&getComputedStyle(n).visibility!=='hidden').map(n=>parseFloat(getComputedStyle(n).fontSize)),parseFloat(getComputedStyle(e).fontSize))};}).filter(r=>r.o>0.99&&r.x>=cr.left+g&&r.r<=cr.right&&r.y>=cr.top&&r.b<=cr.bottom);});
const overlaps=list=>{const o=[];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j];if(a.x<b.r-1&&b.x<a.r-1&&a.y<b.b-1&&b.y<a.b-1)o.push(a.id+' x '+b.id);}return o;};

// The fixture: privacy and traceability. Runs without a browser.
function checkFixture(){
 const text=JSON.stringify(fixture);
 for(const banned of [/claude-code\.[0-9a-f]{8}/,/"session_id"/,/"digest"/,/"text"/,/\/Users\//,/\/home\//,/"lsd-/,/lsh1-/,/message_id/])
  assert.ok(!banned.test(text),'fixture contains '+banned);
 const allowed=['seq','type','lane','time','time_from_previous_event','paths','lines','tool','result','origin','reason','held_by_change_from','to','acknowledges'];
 assert.ok(fixture.events.every(e=>Object.keys(e).every(k=>allowed.includes(k))),'fixture keeps only the listed fields');
 assert.ok(!fixture.events.some(e=>e.type==='session_prompted'),'fixture keeps no prompts');
 assert.deepEqual(Object.keys(fixture.lanes),['Agent · #29 renames','Agent · #28 signature alerts','Agent · worktree signatures']);
 assert.deepEqual(timing.lanes.map(l=>l.label),Object.keys(fixture.lanes),'lanes come from the fixture');
 // Every seq the clock draws is in the fixture.
 for(const c of timing.cards)for(const s of c.seq)assert.ok(bySeq.has(s),'card '+c.id+' cites seq '+s+', which is not in the fixture');
 for(const w of timing.wires)for(const s of w.seq)assert.ok(bySeq.has(s),'wire cites seq '+s);
 assert.deepEqual(timing.wires.filter(w=>w.kind==='held').map(w=>w.seq[0]),[28584,29204,29256],'the three held writes');
 assert.deepEqual(timing.wires.filter(w=>w.kind==='message').map(w=>w.seq),[[29178,29196],[29221,29224]],'the two messages');
 // A held write is followed in its lane by a read and a save of the same file.
 for(const w of timing.wires.filter(w=>w.kind==='held')){
  const held=timing.cards.find(c=>c.id===w.to),after=timing.cards.filter(c=>c.lane===held.lane&&c.at>held.at&&c.code===held.code);
  assert.ok(after.some(c=>c.kind==='read')&&after.some(c=>c.kind==='saved'),'held '+held.code+' is re-read and saved');
 }
 // Order is kept: card times in the clock follow the log.
 const real=timing.cards.map(c=>c.time);assert.deepEqual(real,[...real].sort(),'cards keep the order of the log');
 // Pacing: a new card every gap_min_s to gap_max_s, plus the declared stops.
 for(let i=1;i<timing.cards.length;i++){const gap=timing.cards[i].at-timing.cards[i-1].at,stop=timing.stops_s.filter(([a])=>a>=timing.cards[i-1].at&&a<timing.cards[i].at).reduce((s,[a,b])=>s+b-a,0);assert.ok(gap-stop>=timing.pacing.gap_min_s-0.001&&gap-stop<=timing.pacing.gap_max_s+0.001,'gap before '+timing.cards[i].id+': '+gap);}
 assert.ok(timing.duration_s>=30&&timing.duration_s<=40,'loop length '+timing.duration_s);
 // No stretch without a coordination moment (a hold, a save turning green or a message) lasts longer than 15 s, across the seam too.
 const moments=timing.stops_s.map(([a])=>a).sort((a,b)=>a-b),gaps=moments.map((m,i)=>i?m-moments[i-1]:m+timing.duration_s-moments[moments.length-1]);
 assert.ok(Math.max(...gaps)<=15,'longest stretch between coordination moments: '+Math.max(...gaps).toFixed(1)+' s');
}

export async function checkProductFirst(browser,base,out,axe){
 checkFixture();
 const finalStatus=timing.status.filter(s=>s.at<=timing.final_s).pop();
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
   // Hero: reduced motion starts paused on the first held moment, in the flow.
   const hero=p.locator('[data-hero-loop]');
   assert.deepEqual(await p.evaluate(()=>{const c=window.LangSpanHero.clock();return [c.playing,c.elapsed];}),[false,timing.final_s]);
   assert.equal((await hero.locator('.live-agents').textContent()).trim(),'3 agents');
   assert.equal(await hero.locator('.lane-name').count(),timing.lanes.length,'one lane name per lane in the fixture');
   assert.equal((await hero.locator('.live-status').textContent()).replace(/\s+/g,' ').trim(),`${finalStatus.agents} agents working · ${finalStatus.held} ${finalStatus.held===1?'write':'writes'} held in the last 10 min`);
   assert.equal(await hero.locator('[data-static]').count(),0,'the no-JavaScript still is replaced');
   assert.equal(await hero.locator('[data-pop]').isVisible(),false,'no details panel opens on its own');
   assert.equal(await hero.locator('figcaption, .live-foot, [class*=legend]').count(),0,'no narration and no legend');
   const shown=await onScreen(hero);
   assert.ok(shown.length>=2,'cards on screen at '+width);
   assert.ok(shown.some(r=>r.id.startsWith('Held')),'the first Held wire is on screen at '+width);
   for(const r of shown)if(r.seq)assert.ok(r.seq.split(' ').every(s=>bySeq.has(+s)),'card cites the fixture');
   assert.deepEqual(overlaps(shown),[],'overlap at '+width);
   if(width<=760)assert.ok(shown.every(r=>r.size>=12),'hero text under 12 px at '+width);
   assert.ok(await hero.locator('[data-cards] li').count()<=150,'card elements stay bounded');
   const tools=hero.locator('[data-camera] button');// Pause, +, −, Fit, Follow newest
   assert.equal(await tools.count(),5);
   if(width<1280)for(const b of await tools.all()){const r=await b.boundingBox();assert.ok(r.width>=44&&r.height>=44,'camera control at least 44 px');}
   assert.equal(await hero.locator('[data-hero-play]').textContent(),'Play');
   // The page carries no dates and no Recorded or replay wording.
   const visible=await p.locator('body').innerText();
   assert.ok(!/\b20\d\d\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d|\bas of\b|recorded|replay/i.test(visible.replace(/arXiv \d{4}\.\d+/g,'')),'no dates, as-of, recorded or replay wording');
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
    if(width===1440||width===390)await checkCanvas(p,hero,width);
    await p.addScriptTag({content:axe});const report=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
    assert.deepEqual(report.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],'homepage accessibility '+width);
   }
   if(width===1440||width===390)await p.screenshot({path:out+'/'+width+'-'+colorScheme+'-home-full.png',fullPage:true});
   assert.deepEqual(errors,[],'homepage errors '+width+' '+colorScheme);await context.close();
  }
 }
 await checkMotion(browser,base);
 await checkPauseResume(browser,base);
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await nojs.goto(base+'/',{waitUntil:'domcontentloaded'});
 assert.ok(await nojs.locator('[data-static] .card').count()>=2,'no-JS shows a still of the first held moment');
 assert.equal(await nojs.locator('[data-pop]').isVisible(),false,'no-JS keeps the details closed');
 assert.equal(await nojs.locator('[data-camera]').isVisible(),false);
 assert.equal(await nojs.locator('[data-copy]:visible').count(),0);
 await nojs.close();
 console.log('PASS home page: fixture provenance, privacy, order and pacing; five widths, light and dark; section order; hero flow, wires on screen, no overlaps, bounded cards, frame time; details popover, keyboard, drag; pause and resume; loop seam; proof hidden; hosts; reduced motion; no-JS; automated accessibility');
}

// Popover, keyboard, drag and focus order on the canvas.
async function checkCanvas(p,hero,width){
 const canvas=hero.locator('[data-canvas]'),pop=hero.locator('[data-pop]'),world=hero.locator('[data-world]');
 const inside=async()=>{const c=await canvas.boundingBox(),b=await pop.boundingBox();return b.x>=c.x-0.5&&b.y>=c.y-0.5&&b.x+b.width<=c.x+c.width+0.5&&b.y+b.height<=c.y+c.height+0.5;};
 const visibleIn=async sel=>{for(const el of await hero.locator(sel).all()){const b=await el.boundingBox(),c=await canvas.boundingBox(),g=width>760?200:84;if(b&&b.x>c.x+g&&b.x+b.width<c.x+c.width)return el;}return null;};
 const visibleCard=async kind=>{for(const el of await hero.locator('[data-cards] .card'+(kind?'.'+kind:'')+' .card-hit').all()){const b=await el.boundingBox(),c=await canvas.boundingBox(),g=width>760?200:84;if(b&&b.x>c.x+g&&b.x+b.width<c.x+c.width)return el;}return null;};
 for(const [what,get,close] of [
  ['a card',()=>visibleCard(''),'escape'],
  ['the held card',()=>visibleCard('held'),'outside'],
  ['the Held wire',()=>visibleIn('.wire-label-held, .source-chip'),'button'],
  ['a lane name',async()=>hero.locator('.lane-name').first(),'button']]){
  const opener=await get();assert.ok(opener,what+' is on screen');
  await opener.click();
  assert.ok(await pop.isVisible(),what+' opens details');
  assert.ok(await inside(),what+' details stay inside the canvas at '+width);
  const area=await pop.boundingBox(),c=await canvas.boundingBox();
  assert.ok(area.width*area.height<0.6*c.width*c.height,what+' details cover less than 60 percent of the canvas');
  const text=await pop.innerText();
  if(what==='the held card')for(const w of ['Changed by','What LangSpan told the agent','What happened next'])assert.ok(text.includes(w),'held details name '+w);
  if(what==='a lane name')assert.ok(text.includes('Branch'),'lane details name the branch');
  for(const t of text.match(/\b\d\d:\d\d:\d\d\b/g)||[])assert.ok(fixture.events.some(e=>e.time.startsWith(t)),'details time '+t+' is in the fixture');
  if(close==='escape'){await p.keyboard.press('Escape');assert.equal(await pop.isVisible(),false,'Escape closes');}
  else if(close==='outside'){await p.locator('h1').click();assert.equal(await pop.isVisible(),false,'a click outside closes');}
  else{await hero.locator('[data-pop-close]').click();assert.equal(await pop.isVisible(),false,'the close button closes');}
 }
 // Tab moves through the cards in time order, and Enter opens details.
 const first=await visibleCard('');await first.focus();
 const order=await hero.evaluate(h=>[...h.querySelectorAll('[data-cards] .card-hit')].map(b=>b.dataset.detailOpen));
 const now=await p.evaluate(()=>document.activeElement.dataset.detailOpen);await p.keyboard.press('Tab');
 assert.equal(await p.evaluate(()=>document.activeElement.dataset.detailOpen),order[order.indexOf(now)+1],'Tab moves to the next card in time');
 await p.keyboard.press('Enter');assert.ok(await pop.isVisible(),'Enter opens details');await p.keyboard.press('Escape');
 // Keys on the canvas: + zooms, arrows pan, 0 fits all work, L follows.
 await canvas.focus();const start=await world.evaluate(e=>e.style.transform);
 await p.keyboard.press('+');const zoomed=await world.evaluate(e=>e.style.transform);assert.notEqual(zoomed,start,'+ zooms');
 await p.keyboard.press('ArrowLeft');assert.notEqual(await world.evaluate(e=>e.style.transform),zoomed,'arrow pans');
 await p.keyboard.press('0');const fitted=await p.evaluate(()=>window.LangSpanHero.camera());assert.ok(fitted.s<1,'0 fits the whole loop');
 assert.equal(await hero.locator('[data-cam=follow]').getAttribute('aria-pressed'),'false');
 await p.keyboard.press('l');assert.equal(await hero.locator('[data-cam=follow]').getAttribute('aria-pressed'),'true','L follows');
 assert.equal((await p.evaluate(()=>window.LangSpanHero.camera())).s,1,'following returns to full size');
 // Drag pans.
 const c=await canvas.boundingBox(),from={x:c.x+c.width-12,y:c.y+c.height-12};
 await p.mouse.move(from.x,from.y);await p.mouse.down();await p.mouse.move(from.x-60,from.y-10,{steps:4});await p.mouse.up();
 assert.equal(await hero.locator('[data-cam=follow]').getAttribute('aria-pressed'),'false','drag leaves the flow');
 await hero.locator('[data-cam=follow]').click();
}

// The untouched loop: timing contract, seek parity, seam, wires on screen while they draw, frame time.
async function checkMotion(browser,base){
 for(const width of [1440,390]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await mockLatestRelease(p,TAG);
  await p.goto(base+'/?motion=static',{waitUntil:'networkidle'});
  const contract=await p.evaluate(()=>({id:window.LangSpanHero.element.id,timing:window.LangSpanHero.timing}));
  assert.equal(contract.id,'edit-coordination');
  for(const k of ['cards','wires','stops_s','status','pacing','duration_s','fps','final_s','lanes'])assert.deepEqual(contract.timing[k],timing[k],'hero timing '+k+' equals timing.json');
  for(const t of timing.phone_cut.seek_samples_s){const a=await p.evaluate(t=>JSON.stringify(window.LangSpanHero.frameState(t)),t);await p.evaluate(()=>window.LangSpanHero.frameState(7.7));assert.equal(await p.evaluate(t=>JSON.stringify(window.LangSpanHero.frameState(t)),t),a,'seek parity '+t);}
  // The seam: the camera at the end of the loop flows into the start, one loop's width on.
  const seam=await p.evaluate(L=>{const H=window.LangSpanHero,f=1/30;H.renderAt(L-f);const a=H.camera().x;H.renderAt(0);const b=H.camera().x;H.renderAt(f);const c=H.camera().x;return {a,b,c,period:H.layout().period};},timing.duration_s);
  const step=seam.c-seam.b,jump=seam.b+seam.period-seam.a;
  assert.ok(Math.abs(jump-step)<=Math.max(2,step*1.5),'the camera flows across the seam ('+jump.toFixed(1)+' px against '+step.toFixed(1)+' px per frame)');
  // Each held wire, while it draws: the held card is on screen, and so is
  // what the wire starts from — the source card when both fit (the camera
  // frames them), else the source lane's nearest card in view marked
  // "earlier", or a source chip. No wire starts from a bare lane edge.
  // Text stays readable while the camera frames: 10 px wide, 12 px narrow.
  for(const [i,w] of timing.wires.entries()){
   for(const t of [w.at,w.at+w.ms/2000,w.at+w.ms/1000]){
    const r=await p.evaluate(([t,i,w])=>{const H=window.LangSpanHero,h=H.element;H.renderAt(t);const c=h.querySelector('[data-canvas]'),cr=c.getBoundingClientRect(),g=parseFloat(getComputedStyle(c).getPropertyValue('--gutter'));
     const onScreen=e=>{if(!e)return false;const b=e.getBoundingClientRect();return b.left>=cr.left+g-1&&b.right<=cr.right+1&&b.top>=cr.top-1&&b.bottom<=cr.bottom+1&&+getComputedStyle(e).opacity>0.5;};
     const card=id=>[...h.querySelectorAll('[data-cards] .card')].find(x=>x.dataset.card===id&&+getComputedStyle(x).opacity>0.5&&onScreen(x));
     const f=w.kind==='held'?H.frameFor(i):{mode:'both',from:w.from};
     const scale=H.camera().s;let min=99;for(const e of h.querySelectorAll('[data-cards] .card *')){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;if(!onScreen(e.closest('.card')))continue;min=Math.min(min,parseFloat(getComputedStyle(e).fontSize)*scale);}
     const start=f.mode==='chip'?[...h.querySelectorAll('.source-chip')].some(onScreen):!!card(f.from);
     const marked=f.mode!=='neighbor'||[...h.querySelectorAll('.wire-earlier')].some(e=>+getComputedStyle(e).opacity>0.4);
     return {to:!!card(w.to),start,marked,mode:f.mode,min};},[t,i,w]);
    assert.ok(r.to,`${w.label} wire at ${t.toFixed(2)} s: the held or answering card is on screen at ${width}`);
    assert.ok(r.start,`${w.label} wire at ${t.toFixed(2)} s: its start (${r.mode}) is on screen at ${width}`);
    assert.ok(r.marked,`${w.label} wire at ${t.toFixed(2)} s: a wire from a later card is marked "earlier"`);
    assert.ok(r.min>=(width>760?10:12)-0.01,`card text ${r.min.toFixed(1)} px while framing at ${width}`);
   }
  }
  // Lane chains: every two consecutive cards of an agent on screen are joined.
  for(const t of [6,16,24,30]){
   const missing=await p.evaluate(t=>{const H=window.LangSpanHero,h=H.element,L=H.layout();H.renderAt(t);
    const lines=[...h.querySelectorAll('.chains .chain line')].map(l=>[+l.getAttribute('x1'),+l.getAttribute('x2')]);
    const cards=[...h.querySelectorAll('[data-cards] .card')].filter(c=>+getComputedStyle(c).opacity>0.99).map(c=>({id:c.dataset.card,x:parseFloat(c.style.left)}));
    const out=[];for(const c of cards){const d=H.timing.cards.find(x=>x.id===c.id);if(!d.next||d.next_loop)continue;const n=cards.find(x=>x.id===d.next&&x.x>c.x);if(!n)continue;
     if(!lines.some(([a,b])=>Math.abs(a-(c.x+L.W))<0.6&&Math.abs(b-n.x)<0.6))out.push(c.id+'→'+n.id);}return out;},t);
   assert.deepEqual(missing,[],'lane chain missing at '+t+' s at '+width);
  }
  // Frame time: renderAt plus the style and layout it causes, over two seconds of frames, at full size and zoomed out.
  const ms=await p.evaluate(()=>{const H=window.LangSpanHero,run=()=>{const t0=performance.now();for(let i=0;i<120;i++){H.renderAt(20+i/60);H.element.querySelector('[data-cards]').getBoundingClientRect();document.body.offsetHeight;}return (performance.now()-t0)/120;};const a=run();for(let i=0;i<4;i++)document.querySelector('[data-cam="out"]').click();const b=run();return [a,b];});
  assert.ok(ms[0]<8&&ms[1]<8,'renderAt takes '+ms.map(x=>x.toFixed(2)).join(' and ')+' ms per frame at '+width);
  console.log('Frame time at '+width+': '+ms.map(x=>x.toFixed(2)+' ms').join(' at full size, ')+' zoomed out');
  await p.close();
 }
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 await p.goto(base+'/#benchmark');await p.waitForURL('**/technical.html#benchmark');assert.ok(await p.locator('#benchmark').isVisible());
 await p.goto(base+'/#langspan-live');await p.waitForURL('**/technical.html#langspan-live');
 await p.close();
}

// Left alone the view flows; an interaction pauses it, and it resumes after 8 s, or at once on Follow newest or Play.
async function checkPauseResume(browser,base){
 for(const width of [1440,390]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});await mockLatestRelease(p,TAG);
  await p.clock.install();await p.goto(base+'/',{waitUntil:'networkidle'});await p.clock.runFor(3000);
  const clock=()=>p.evaluate(()=>window.LangSpanHero.clock());
  assert.equal((await clock()).playing,true,'plays when untouched');
  await p.locator('[data-cards] .card-hit').last().click({force:true});
  assert.equal((await clock()).playing,false,'a click pauses');assert.equal(await p.locator('[data-hero-play]').innerText(),'Play','the control shows Play');
  const at=(await clock()).elapsed;await p.clock.runFor(7000);assert.equal((await clock()).elapsed,at,'stays paused for 7 s');
  await p.clock.runFor(1500);assert.equal((await clock()).playing,true,'resumes after 8 s');
  assert.equal(await p.locator('[data-pop]').isVisible(),false,'resuming closes the details');
  await p.locator('[data-cam=in]').click();assert.equal((await clock()).playing,false,'zoom pauses');
  await p.locator('[data-cam=follow]').click();assert.equal((await clock()).playing,true,'Follow newest resumes at once');
  await p.locator('[data-hero-play]').click();assert.equal((await clock()).playing,false,'Pause pauses');
  await p.clock.runFor(9000);assert.equal((await clock()).playing,false,'a visitor Pause stays paused');
  await p.locator('[data-hero-play]').click();assert.equal((await clock()).playing,true,'Play resumes');
  for(let i=0;i<600;i++)await p.clock.runFor(100);
  assert.equal((await clock()).playing,true,'loops without stopping');assert.ok((await clock()).elapsed<timing.duration_s);
  await p.close();
 }
 const r=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await mockLatestRelease(r,TAG);
 await r.goto(base+'/',{waitUntil:'networkidle'});
 const g=await r.evaluate(()=>{const c=document.querySelector('[data-canvas]');return c.getBoundingClientRect().left+parseFloat(getComputedStyle(c).getPropertyValue('--gutter'));});
 for(const el of await r.locator('.wire-label-held, .source-chip').all()){const b=await el.boundingBox();if(b&&b.x>g){await el.click();break;}}assert.ok(await r.locator('[data-pop]').isVisible(),'reduced motion stays interactive');
 assert.equal(await r.evaluate(()=>window.LangSpanHero.clock().playing),false,'reduced motion never resumes');
 await r.close();
}
