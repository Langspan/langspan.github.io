import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mockLatestRelease} from './release-links-check.mjs';
const hashes=['fd8fe10d9253ec1b18c3fce3a1967f12a5e13ba7311b759ee3dcbb58a815ecb9','0dff963c8e9e7599fc7d3dc957e92187346a8debb327b4338f4fa80023315058'];
export async function checkProductFirst(browser,base,out,axe){
 for(const width of [1440,1280,768,390,358]){
  const context=await browser.newContext({viewport:{width,height:width>=768?900:844},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
  const p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await mockLatestRelease(p);
  await p.goto(base+'/?motion=static',{waitUntil:'networkidle'});
  assert.ok(await p.locator('[data-product-first]').isVisible());
  assert.equal(await p.locator('[data-event-title]').innerText(),'Overlapping edit refused');
  assert.equal(await p.locator('[data-play]').isVisible(),false);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
  assert.equal(await p.locator('.mobile-nav').isVisible(),width<=760);
  if(width<=760){await p.locator('.mobile-nav summary').click();assert.equal(await p.locator('.mobile-nav nav a:visible').count(),4);const box=await p.locator('.mobile-nav nav').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);await p.locator('.mobile-nav nav a').first().focus();await p.keyboard.press('Escape');assert.equal(await p.locator('.mobile-nav').getAttribute('open'),null);}
  await p.screenshot({path:out+'/'+width+'-product-first-hero.png'});
  for(let step=0;step<3;step++){await p.locator('[data-step="'+step+'"]').click();assert.equal(await p.evaluate(()=>window.LangSpanProduct.snapshot().step),step);assert.equal(await p.locator('[data-step="'+step+'"]').getAttribute('aria-pressed'),'true');}
  await p.locator('[data-inspect=a]').click();assert.equal(await p.locator('[data-event-title]').innerText(),'Active function hold');
  await p.locator('[data-step="1"]').click();
  await p.locator('[data-open-evidence]').click();
  assert.equal(await p.locator('#agent-evidence').getAttribute('open'),'');
  const records=await p.locator('.record pre code').allTextContents();
  assert.deepEqual(records.map(x=>createHash('sha256').update(x).digest('hex')),hashes);
  await p.locator('#agent-evidence summary').click();
  await p.locator('[data-signature=new]').click();assert.equal(await p.locator('[data-sig-title]').innerText(),'Argument count matches');
  await p.locator('[data-signature=old]').click();assert.equal(await p.locator('[data-sig-title]').innerText(),'Potential call break');
  if(width===1440||width===390)await p.locator('#semantic-awareness').screenshot({path:out+'/'+width+'-product-first-signature.png'});
  await p.locator('.live-media img').evaluate(img=>img.decode());
  assert.equal(await p.locator('.live-media img').evaluate(img=>img.naturalWidth),1440);
  assert.equal(await p.locator('iframe').count(),0,'no eager heavy iframe');
  await p.locator('[data-open-live]').click();
  const live=p.frameLocator('#live-embed iframe');await live.locator('#status-text').getByText('Simulated data',{exact:true}).waitFor();
  assert.equal(await live.locator('#kpis li').count(),7);await live.locator('#demo-prev').click();
  assert.ok((await live.locator('#demo-caption').innerText()).startsWith('Scene 3 of 4'));
  if(width===1440||width===390)await p.locator('#langspan-live').screenshot({path:out+'/'+width+'-product-first-live.png'});
  await p.locator('#live-detail summary').click();
  if(width===1440||width===390){
   await p.locator('#demo summary').click();const tour=p.frameLocator('#tour-embed iframe');
   await tour.locator('.ls-scene-button').last().waitFor({timeout:20000});
   await tour.locator('.ls-scene-button').last().click();
   assert.equal(await tour.locator('#cap-tab-edit-coordination').getAttribute('aria-selected'),'true');
   await p.locator('#demo summary').click();
  }
  await p.locator('[data-copy=setup-command]').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'langspan setup');
  await p.locator('.platform-downloads summary').click();
  assert.equal(await p.locator('[data-release-target]:visible').count(),4);
  await p.locator('.platform-downloads summary').click();
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
  await p.addScriptTag({content:axe});const report=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
  assert.deepEqual(report.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],'homepage accessibility '+width);
  if(width===1440||width===390)await p.screenshot({path:out+'/'+width+'-product-first-full.png',fullPage:true});
  assert.deepEqual(errors,[],'homepage page errors '+width);await context.close();
 }
 const p=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});await mockLatestRelease(p);
 await p.goto(base+'/',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>window.LangSpanProduct.snapshot().running);
 await p.evaluate(()=>window.LangSpanProduct.seek(11.8));await p.locator('[data-play]').click();
 await p.waitForFunction(()=>window.LangSpanProduct.snapshot().step===0,{},{timeout:3000});
 await p.locator('[data-inspect=a]').click();const t=await p.evaluate(()=>window.LangSpanProduct.snapshot().elapsed);
 await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>window.LangSpanProduct.snapshot().elapsed),t);
 await p.goto(base+'/#benchmark');await p.waitForURL('**/technical.html#benchmark');assert.ok(await p.locator('#benchmark').isVisible());
 await p.close();
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await nojs.goto(base+'/',{waitUntil:'domcontentloaded'});assert.ok(await nojs.getByText('Overlapping edit refused',{exact:true}).isVisible());assert.equal(await nojs.locator('[data-step]').first().isDisabled(),true);assert.equal(await nojs.locator('[data-play]').isVisible(),false);await nojs.locator('#agent-evidence summary').click();assert.equal(await nojs.locator('.record:visible').count(),2);await nojs.close();
 console.log('PASS product-first page: five widths, exact records, live demo, real Stageshow, loop, pause, legacy links, installation, reduced motion, no-JS and automated accessibility');
}
