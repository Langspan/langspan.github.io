import assert from 'node:assert/strict';
import {mockLatestRelease} from './release-links-check.mjs';
const EVIDENCE='https://github.com/Langspan/LangSpan.dev/blob/e35aed3/docs/evidence/codex-real-host/README.md#2-a-conflicting-edit';
const REFUSAL='Command blocked by PreToolUse hook: LangSpan coordination conflict.';
const ORDER=['top','semantic-awareness','agent-sees','start','langspan-live','verified','questions','deeper'];
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
// Visible text smaller than 11 px, outside closed disclosures.
const smallText=p=>p.evaluate(()=>{const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const el=w.currentNode.parentElement;if(!w.currentNode.textContent.trim()||!el||el.closest('.sr-only,[hidden]'))continue;const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(!r.width||!r.height||cs.visibility==='hidden')continue;if(parseFloat(cs.fontSize)<11)out.push(el.className+' '+cs.fontSize);}return out;});

export async function checkProductFirst(browser,base,out,axe){
 for(const width of [1440,1280,768,390,358]){
  for(const colorScheme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:width>=768?900:844},colorScheme,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
   const p=await context.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await mockLatestRelease(p);
   await p.goto(base+'/?motion=static',{waitUntil:'networkidle'});
   assert.equal((await p.locator('h1').textContent()).replace(/\s+/g,' ').trim(),'Your agents. On the same page.');
   // Layered order: Get started comes before LangSpan Live; the page stops at eight sections.
   assert.deepEqual(await p.locator('main > section').evaluateAll(s=>s.map(x=>x.id)),ORDER);
   assert.equal(await overflow(p),false,'overflow '+width+' '+colorScheme);
   assert.deepEqual(await smallText(p),[],'text under 11 px at '+width+' '+colorScheme);
   // Decision 9: no install command in the hero until an install script exists.
   assert.equal(await p.locator('#top pre, #top [data-copy]').count(),0);
   assert.equal(await p.locator('.facts li').count(),4);
   // Reduced motion: the loop holds on the recorded refusal.
   const hero=p.locator('[data-hero-loop]');
   assert.equal(await p.evaluate(()=>window.LangSpanHero.clock().playing),false);
   assert.ok(await hero.locator('[data-card="1"]').isVisible());
   assert.equal(await hero.locator('[data-card="1"] code').innerText(),REFUSAL);
   assert.equal(await hero.locator('[data-card="1"] a.chip-rec').getAttribute('href'),EVIDENCE);
   assert.equal(await hero.locator('[data-card="2"] .chip-ill').count(),1);
   if(width<480){
    assert.equal(await hero.locator('.hl-tabs').isVisible(),false);assert.ok(await hero.locator('.hl-dots').isVisible());
    const card=await hero.locator('[data-card="1"]').boundingBox(),rows=await hero.locator('.hl-rows').boundingBox(),panel=await hero.boundingBox();
    assert.ok(card.y<rows.y,'message card above the rows under 480 px');
    assert.ok(panel.height<=400,'hero panel height '+panel.height);
    const code=await p.locator('.code-card pre').first().evaluate(e=>({size:parseFloat(getComputedStyle(e).fontSize),wrap:getComputedStyle(e).whiteSpace}));
    assert.deepEqual(code,{size:13,wrap:'pre'},'interface example stacks with 13 px code');
   }
   if(width===390){const line=await hero.locator('[data-card="1"] code').boundingBox();assert.ok(line.y<=780,'refusal line at y '+line.y);}
   for(let step=0;step<3;step++){
    await hero.locator('[data-seek="'+step+'"]:visible').click();
    assert.equal(await hero.locator('[data-seek="'+step+'"]:visible').getAttribute('aria-pressed'),'true');
    assert.ok(await hero.locator('[data-card="'+step+'"]').isVisible());
   }
   // Live: the full capture on wide screens, 1:1 crops under 600 px.
   assert.equal(await p.locator('.live-full').isVisible(),width>600);
   assert.equal(await p.locator('.live-crops').isVisible(),width<=600);
   assert.equal(await p.locator('#langspan-live figcaption .chip-sim').count(),1);
   if(width<=600)for(const img of await p.locator('.live-crops img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());assert.equal(await img.evaluate(i=>i.naturalWidth),await img.evaluate(i=>+i.getAttribute('width')),'crop is a 1:1 capture');}
   assert.equal(await p.locator('.mobile-nav').isVisible(),width<=760);
   if(width<=760){await p.locator('.mobile-nav summary').click();assert.equal(await p.locator('.mobile-nav nav a:visible').count(),6);const box=await p.locator('.mobile-nav nav').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);await p.locator('.mobile-nav nav a').first().focus();await p.keyboard.press('Escape');assert.equal(await p.locator('.mobile-nav').getAttribute('open'),null);}
   if(colorScheme==='light'){
    await p.locator('[data-signature=new]').click();assert.equal(await p.locator('[data-sig-title]').innerText(),'Argument count matches');
    await p.locator('[data-signature=old]').click();assert.equal(await p.locator('[data-sig-title]').innerText(),'Potential call break');
    await p.locator('[data-copy=setup-command]').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),(await p.locator('#setup-command').textContent()).trim());
    assert.equal(await p.locator('[data-release-target]:visible').count(),4);
    // Questions: panels open independently.
    const faq=p.locator('#questions details');assert.equal(await faq.count(),6);
    await faq.nth(0).locator('summary').click();await faq.nth(5).locator('summary').click();
    assert.equal(await p.locator('#questions details[open]').count(),2);
    assert.equal(await p.locator('#deeper .deeper a').count(),4);
    assert.equal(await p.locator('iframe').count(),0,'no eager iframe');
    if(width===1440||width===390){
     await p.locator('#demo summary').click();const tour=p.frameLocator('#tour-embed iframe');
     await tour.locator('.ls-scene-button').last().waitFor({timeout:20000});
     await p.locator('#demo summary').click();await p.waitForFunction(()=>!document.querySelector('iframe'),{},{timeout:3000});
    }
    await p.addScriptTag({content:axe});const report=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
    assert.deepEqual(report.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],'homepage accessibility '+width);
   }
   if(width===1440||width===390)await p.screenshot({path:out+'/'+width+'-'+colorScheme+'-home-full.png',fullPage:true});
   assert.deepEqual(errors,[],'homepage errors '+width+' '+colorScheme);await context.close();
  }
 }
 // Motion: one renderAt(t), the timing contract, pause, legacy links.
 const p=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});await mockLatestRelease(p);
 await p.goto(base+'/',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>window.LangSpanHero.clock().running);
 const hero=await p.evaluate(()=>({id:window.LangSpanHero.element.id,events:window.LangSpanHero.timing.events.length,fps:window.LangSpanHero.timing.fps,duration:window.LangSpanHero.timing.duration_s,renderAt:typeof window.LangSpanHero.renderAt}));
 assert.deepEqual(hero,{id:'edit-coordination',events:10,fps:30,duration:10,renderAt:'function'});
 for(const t of [0.5,2.5,5.5,8.5]){const a=await p.evaluate(t=>JSON.stringify(window.LangSpanHero.frameState(t)),t);await p.evaluate(()=>window.LangSpanHero.frameState(7.7));assert.equal(await p.evaluate(t=>JSON.stringify(window.LangSpanHero.frameState(t)),t),a,'seek parity '+t);}
 assert.ok(await p.evaluate(()=>JSON.stringify(window.LangSpanHero.frameState(0).layers)===JSON.stringify(window.LangSpanHero.frameState(10).layers)),'loop seam');
 await p.locator('[data-hero-play]').click();assert.equal(await p.locator('[data-hero-play]').innerText(),'Play loop');
 const t=await p.evaluate(()=>window.LangSpanHero.clock().elapsed);await p.waitForTimeout(300);
 assert.equal(await p.evaluate(()=>window.LangSpanHero.clock().elapsed),t,'pause freezes the clock');
 await p.locator('[data-hero-play]').click();assert.equal(await p.locator('[data-hero-play]').innerText(),'Pause loop');
 await p.goto(base+'/#benchmark');await p.waitForURL('**/technical.html#benchmark');assert.ok(await p.locator('#benchmark').isVisible());
 await p.goto(base+'/#hosts');await p.waitForURL('**/technical.html#hosts');
 await p.close();
 // Three loops, then the refusal frame and Replay. The page clock is fast-forwarded.
 const q=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});await mockLatestRelease(q);
 await q.clock.install();await q.goto(base+'/',{waitUntil:'networkidle'});
 for(let i=0;i<400;i++)await q.clock.runFor(100);
 assert.deepEqual(await q.evaluate(()=>{const c=window.LangSpanHero.clock();return {playing:c.playing,finished:c.finished};}),{playing:false,finished:true});
 assert.equal(await q.locator('[data-hero-play]').innerText(),'Replay');
 assert.ok(await q.locator('[data-card="1"]').isVisible(),'holds on the refusal');
 await q.close();
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await nojs.goto(base+'/',{waitUntil:'domcontentloaded'});
 assert.ok(await nojs.locator('[data-card="1"]').isVisible(),'no-JS shows the refusal frame');
 assert.equal(await nojs.locator('.hl-tabs').isVisible(),false);assert.equal(await nojs.locator('[data-signature]').first().isDisabled(),true);
 await nojs.close();
 console.log('PASS home page: five widths, light and dark, layered order, hero loop contract, pause, three loops, reduced motion, phone crops, questions, legacy links, no-JS and automated accessibility');
}
