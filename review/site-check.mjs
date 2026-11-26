import {chromium} from 'playwright';
import {checkExperience} from './experience-check.mjs';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const base=process.env.SITE_URL||'http://127.0.0.1:8123';
const out='review-output';mkdirSync(out,{recursive:true});
const axe=readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const browser=await chromium.launch({headless:true});
const errors=[],a11y=[],perf=[];
for(const width of [1440,1280,768,390,358]){
 const context=await browser.newContext({viewport:{width,height:width>768?900:844},permissions:['clipboard-read','clipboard-write']});
 const p=await context.newPage();p.on('pageerror',e=>{errors.push(width+': '+e.message);console.error('Page error',width,e.message)});p.on('console',m=>{if(m.type()==='error')console.error('Browser console',width,m.text())});
 p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(width+': '+r.status()+' '+r.url());});
 await p.addInitScript(()=>{window.__metrics={cls:0,lcp:0};try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__metrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});}catch{}});
 await p.goto(base+'/',{waitUntil:'networkidle'});await p.waitForTimeout(400);
 assert.ok(await p.locator('h1').isVisible());assert.ok(await p.locator('.hero-actions a[href="#start"]').isVisible());
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'horizontal overflow '+width);
 if(width>=1280){const cta=await p.locator('.hero-actions').boundingBox();if(cta.y+cta.height>800){await p.screenshot({path:out+'/'+width+'-hero-fold-failure.png'});console.error('CTA bounds',width,cta);}assert.ok(cta.y+cta.height<=800,'primary CTA below desktop fold');}
 const scale=p.locator('[data-parallel-scale]');
 await scale.locator('[data-scale-count="10"]').waitFor();
 for(const count of [2,6,10]){
  await scale.locator('[data-scale-count="'+count+'"]').click();
  assert.equal(await scale.getAttribute('data-count'),String(count));
  assert.equal(await scale.locator('[data-scale-slot]:visible').count(),count);
  assert.equal(await scale.locator('[data-scale-total]').innerText(),String(count));
 }
 for(let step=0;step<3;step++){await scale.locator('[data-scale-step="'+step+'"]').click();assert.equal(await scale.getAttribute('data-phase'),String(step));if(width===1440||width===390)await scale.screenshot({path:out+'/'+width+'-scale-'+step+'.png'});}
 if(width===1440){
  await p.evaluate(()=>window.LangSpanParallel.seek(12,10));
  await scale.locator('[data-scale-play]').click();
  await p.waitForFunction(()=>document.querySelector('[data-parallel-scale]').dataset.phase==='1',{},{timeout:9500});
  await scale.locator('[data-scale-play]').click();
  const phase=await scale.getAttribute('data-phase'), elapsed=await p.evaluate(()=>window.LangSpanParallel.snapshot().scale.elapsedMs);
  await p.waitForTimeout(900);
  assert.equal(await scale.getAttribute('data-phase'),phase,'scale pause');
  assert.equal(await p.evaluate(()=>window.LangSpanParallel.snapshot().scale.elapsedMs),elapsed,'pause freezes actual clock');
 }
 await scale.locator('[data-scale-count="10"]').click();
 await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(150);
 await p.screenshot({path:out+'/'+width+'-hero.png'});
 const semantic=p.locator('[data-semantic-story]');
 await semantic.scrollIntoViewIfNeeded();
 for(let step=0;step<3;step++){
  await semantic.locator('[data-sem-step="'+step+'"]').click();
  assert.equal(await semantic.getAttribute('data-phase'),String(step));
  assert.equal(await semantic.locator('[data-semantic-beat]:visible').count(),1);
  if(width===1440||width===390)await semantic.screenshot({path:out+'/'+width+'-semantic-'+step+'.png'});
 }
 await p.addScriptTag({content:axe});
 const semanticAxe=await p.evaluate(()=>axe.run(document.querySelector('[data-semantic-story]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 a11y.push({width,scene:'semantic',violations:semanticAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 assert.equal(await p.locator('[data-positioning-contrast] dt').count(),3);
 assert.ok(await p.locator('[data-positioning-contrast]').isVisible());
 assert.equal(await p.locator('.evidence-next a[href$="/issues/172"]').count(),1);
 assert.equal(await p.locator('.evidence-next a[href$="/issues/171"]').count(),1);
 const sourceMap=p.locator('#semantic-awareness');
 await sourceMap.locator('[data-source-awareness]').scrollIntoViewIfNeeded();
 assert.ok(await sourceMap.getByRole('heading',{name:'Different files. Connected work.'}).isVisible());
 assert.ok(await sourceMap.locator('.source-advisory-status').getByText('Advisory context · no edit refusal').isVisible());
 assert.equal(await sourceMap.locator('a[href*="/blob/v0.1.0/"]').count(),2);
 assert.equal(await sourceMap.locator('a[href$="/issues/29"]').count(),1);
 assert.equal(await sourceMap.locator('a[href$="/issues/44"]').count(),1);
 assert.equal(await p.locator('[data-semantic-layer] h4').count(),2);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'source-awareness overflow '+width);
 if(width===1440||width===390)await sourceMap.screenshot({path:out+'/'+width+'-source-awareness.png',animations:'disabled'});
 const sourceAxe=await p.evaluate(()=>axe.run(document.querySelector('#semantic-awareness'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 a11y.push({width,scene:'source-awareness',violations:sourceAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 await p.locator('#research').screenshot({path:out+'/'+width+'-research.png'});
 await p.locator('#workflow').screenshot({path:out+'/'+width+'-mechanism.png'});
 await p.locator('#capabilities').screenshot({path:out+'/'+width+'-architecture.png'});
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'new story overflow '+width);
 perf.push({width,...await p.evaluate(()=>window.__metrics)});
 await p.locator('.hero-actions a[href="#demo"]').click();
 await p.locator('#cap-tab-peer-briefings').waitFor({timeout:15000});
 assert.equal(await p.locator('[data-cap-tab]').count(),6);
 await p.locator('#cap-tab-peer-briefings').focus();
 await p.keyboard.press('ArrowRight');
 assert.equal(await p.locator('#cap-tab-edit-coordination').getAttribute('aria-selected'),'true');
 const capIds=['peer-briefings','source-awareness','commit-ownership','team-awareness','integration-checks'];
 for(const id of capIds){
  await p.locator('#cap-tab-'+id).click();
  const panel=p.locator('#'+id), scene=panel.locator('.cx-demo');
  try{await scene.waitFor({timeout:20000});}catch(e){console.error('Scene mount failed',width,id,await p.locator('[data-capability-explorer]').evaluate(el=>({active:el.dataset.active,load:el.dataset.loadState,mounted:el.dataset.cxMounted,scenes:[...el.querySelectorAll('[data-cap-scene]')].map(x=>({...x.dataset}))})));await p.screenshot({path:out+'/'+width+'-mount-failure.png',fullPage:true});throw e;}
  assert.ok(await panel.isVisible());
  assert.equal(await p.locator('[data-cap-panel]:visible').count(),1);
  const steps=scene.locator('.cx-step');
  assert.equal(await steps.count(),3);
  for(let i=0;i<3;i++){
   await steps.nth(i).click();
   assert.equal(await scene.getAttribute('data-beat'),String(i));
   assert.equal(await steps.nth(i).getAttribute('aria-pressed'),'true');
   if(width===1440||width===390)await panel.screenshot({path:out+'/'+width+'-cap-'+id+'-'+i+'.png'});
  }
  const replay=scene.locator('.cx-replay');await replay.click();
  assert.equal(await scene.getAttribute('data-beat'),'0');
  await steps.last().click();
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'explorer overflow '+id+' '+width);
  await p.addScriptTag({content:axe});
  const result=await p.evaluate(()=>axe.run(document.querySelector('[data-capability-explorer]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
  a11y.push({width,capability:id,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 }
 await p.locator('#cap-tab-peer-briefings').click();
 if(width===1440){
  const peer=p.locator('#peer-briefings .cx-demo');
  await peer.locator('.cx-stage').scrollIntoViewIfNeeded();await peer.locator('.cx-replay').click();
  await p.waitForFunction(()=>document.querySelector('#peer-briefings .cx-demo')?.dataset.beat==='1',{},{timeout:8500});
  await peer.locator('.cx-play').click();
  const frozen=await peer.getAttribute('data-beat');await p.waitForTimeout(900);
  assert.equal(await peer.getAttribute('data-beat'),frozen,'Pause freezes scene clock');
  await peer.locator('.cx-replay').click();
  await p.locator('#cap-tab-source-awareness').click();
  await p.waitForFunction(()=>document.querySelector('#peer-briefings .cx-demo')?.dataset.playing==='false');
 }
 await p.locator('#cap-tab-peer-briefings').click();
 await p.locator('#cap-tab-peer-briefings').focus();await p.keyboard.press('End');
 assert.equal(await p.locator('#cap-tab-integration-checks').getAttribute('aria-selected'),'true');
 await p.locator('#cap-tab-edit-coordination').click();
 await p.locator('.ls-scene-button').first().waitFor({timeout:15000});
 const scenes=p.locator('.ls-scene-button');
 for(let i=0;i<await scenes.count();i++){await scenes.nth(i).click();assert.equal(await scenes.nth(i).getAttribute('aria-pressed'),'true');if(width===1440||width===390)await p.locator('#coordination-demo').screenshot({path:out+'/'+width+'-demo-'+i+'.png'});}
 const replay=p.getByRole('button',{name:'Replay coordination illustration from the beginning'});await replay.click();
 await p.locator('[data-motion-toggle]').click();assert.equal(await p.locator('html').getAttribute('data-motion-paused'),'true');
 await p.locator('#film').scrollIntoViewIfNeeded();
 const film=p.locator('.launch-film'),v=film.locator('video');
 assert.equal(await v.getAttribute('autoplay'),null,'no autoplay');assert.equal(await v.getAttribute('preload'),'none');
 assert.equal(await film.getAttribute('open'),null,'film initially closed');
 await film.locator('summary').click();assert.ok(await v.isVisible());
 if(width===1440||width===390){
  await v.evaluate(e=>{e.preload='metadata';e.load();});
  await p.waitForFunction(()=>document.querySelector('.launch-film video').readyState>=1,{},{timeout:15000});
  assert.ok(Math.abs(await v.evaluate(e=>e.duration)-33)<.1,'launch duration');
  await v.evaluate(async e=>{e.muted=true;await e.play();});
  await p.waitForFunction(()=>document.querySelector('.launch-film video').currentTime>0.1,{},{timeout:10000});
  await v.evaluate(e=>e.pause());
  await p.locator('#film').screenshot({path:out+'/'+width+'-launch-film.png'});
 }
 await film.locator('summary').click();
 await p.locator('#evidence').scrollIntoViewIfNeeded();
 await p.locator('.dashboard-proof').scrollIntoViewIfNeeded();
 assert.equal(await p.locator('.proof-crop img').count(),2);
 for(const img of await p.locator('.proof-crop img').all()){
   await img.evaluate(img=>img.decode());
   assert.equal(await img.evaluate(img=>img.naturalWidth),2560,'original dashboard proof loaded');
   assert.equal(await img.evaluate(img=>img.naturalHeight),2394,'original capture height');
 }
 assert.equal(await p.getByRole('link',{name:'Full dashboard capture'}).getAttribute('href'),'assets/evidence/dashboard-v0.1.0.png');
 assert.ok(await p.locator('.dashboard-proof').getByText('Scripted hook events, no live model invoked.',{exact:false}).isVisible());
 await p.locator('.dashboard-proof').screenshot({path:out+'/'+width+'-dashboard-proof.png'});
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'proof overflow '+width);
 await p.locator('#evidence').screenshot({path:out+'/'+width+'-evidence.png'});
 await p.locator('#start').scrollIntoViewIfNeeded();
 assert.equal(await p.locator('.download-list a').count(),4);
 const urls=await p.locator('.download-list a').evaluateAll(links=>links.map(a=>a.href));
 for(const target of ['aarch64-apple-darwin','x86_64-apple-darwin','aarch64-unknown-linux-gnu','x86_64-unknown-linux-gnu'])assert.ok(urls.some(u=>u.endsWith('langspan-v0.1.0-'+target+'.tar.gz')));
 await p.locator('#tab-claude').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#tab-codex').getAttribute('aria-selected'),'true');assert.ok(await p.locator('#panel-codex').isVisible());
 await p.locator('[data-copy=daemon-command]').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'langspan daemon');
 await p.locator('#start').screenshot({path:out+'/'+width+'-setup.png'});
 await p.locator('.faq-list summary').last().click();assert.equal(await p.locator('.faq-list details').last().getAttribute('open'),'');
 await checkExperience(p,width,out);
 await p.addScriptTag({content:axe});const report=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 a11y.push({width,violations:report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 await p.screenshot({path:out+'/'+width+'-full.png',fullPage:true});
 await context.close();
}
for(const opts of [{reducedMotion:'reduce'},{javaScriptEnabled:false}]){
 const p=await browser.newPage({viewport:{width:390,height:844},...opts});
 await p.goto(base+'/#start',{waitUntil:'networkidle'});
 assert.equal(await p.locator('[data-scale-slot]:visible').count(),10);
 assert.ok(await p.locator('#semantic-awareness .source-advisory').isVisible());
 if(opts.reducedMotion==='reduce'){
  assert.equal(await p.locator('#semantic-awareness .source-advisory').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(await p.locator('[data-lx-play]').isVisible(),false);
 }
 if(opts.javaScriptEnabled===false){assert.equal(await p.locator('[data-lx-arm]:visible').count(),0);assert.equal(await p.locator('.lx-lane:visible').count(),3);assert.equal(await p.locator('[data-semantic-beat]:visible').count(),3);assert.equal(await p.locator('[data-scale-controls]:visible').count(),0);}
 else {assert.equal(await p.locator('[data-parallel-scale]').getAttribute('data-phase'),'2');assert.equal(await p.locator('[data-semantic-story]').getAttribute('data-phase'),'1');assert.equal(await p.locator('[data-semantic-beat]:visible').count(),1);}
 assert.equal(await p.locator('.download-list a').count(),4);
 assert.ok(await p.locator('#panel-claude').isVisible());if(opts.javaScriptEnabled===false)assert.ok(await p.locator('#panel-codex').isVisible());else assert.equal(await p.locator('html').getAttribute('data-motion-paused'),'true');
 await p.goto(base+'/#demo',{waitUntil:'networkidle'});
 if(opts.javaScriptEnabled===false){assert.ok(await p.locator('.demo-fallback').isVisible());assert.equal(await p.locator('.cap-fallback:visible').count(),5);assert.ok(await p.locator('#team-awareness .cap-fallback').isVisible());}
 else{await p.locator('#peer-briefings .cx-demo').waitFor();assert.equal(await p.locator('#peer-briefings .cx-demo').getAttribute('data-beat'),'2');await p.locator('#cap-tab-edit-coordination').click();await p.locator('.ls-scene-button').last().waitFor();}

 await p.screenshot({path:out+'/'+(opts.javaScriptEnabled===false?'no-js':'reduced-motion')+'.png',fullPage:true});await p.close();
}
const deep=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
await deep.goto(base+'/#commit-ownership',{waitUntil:'networkidle'});await deep.locator('#commit-ownership .cx-demo').waitFor();
assert.equal(await deep.locator('#cap-tab-commit-ownership').getAttribute('aria-selected'),'true');assert.equal(await deep.locator('#commit-ownership .cx-demo').getAttribute('data-beat'),'2');await deep.close();
await browser.close();
writeFileSync(out+'/accessibility.json',JSON.stringify(a11y,null,2));writeFileSync(out+'/lab-metrics.json',JSON.stringify(perf,null,2));
console.log('Accessibility findings:',JSON.stringify(a11y));console.log('Lab metrics (not field measurements):',JSON.stringify(perf));
assert.deepEqual(errors,[],'browser errors');
assert.deepEqual(a11y.filter(x=>x.violations.length),[],'WCAG scan findings');
console.log('PASS: five widths, demo steps and pause, keyboard tabs, copy, download paths, FAQ, reduced motion, and no-JS fallback.');
