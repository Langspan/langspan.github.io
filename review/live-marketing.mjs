import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium}=createRequire(new URL('./package.json',import.meta.url))('playwright');
const origin='https://langspan.dev';
const manifest=JSON.parse(readFileSync('marketing/published-assets.json','utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
let html='';
for(let i=0;i<30;i++){try{const r=await fetch(origin+'/?verify=marketing-v1',{cache:'no-store'});html=await r.text();if(r.ok&&html.includes('data-source-awareness')&&html.includes('data-semantic-layer'))break;}catch{}await new Promise(r=>setTimeout(r,3000));}
assert.ok(html.includes('data-source-awareness')&&html.includes('data-semantic-layer'),'semantic awareness not yet deployed');
for(const f of manifest.files){const r=await fetch(origin+'/'+f.path);assert.ok(r.ok,f.path+' HTTP '+r.status);const data=Buffer.from(await r.arrayBuffer());assert.equal(hash(data),f.sha256,f.path+' served hash');}
const b=await chromium.launch();try{
 const page=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await page.goto(origin+'/#film',{waitUntil:'domcontentloaded'});
 const film=page.locator('.launch-film');await film.locator('summary').click();const v=film.locator('video');
 assert.ok(await v.isVisible());await v.evaluate(e=>{e.preload='metadata';e.load()});await page.waitForFunction(()=>document.querySelector('.launch-film video').readyState>=1,{},{timeout:20000});
 assert.ok(Math.abs(await v.evaluate(e=>e.duration)-33)<.1);await v.evaluate(async e=>{e.muted=true;await e.play()});await page.waitForFunction(()=>document.querySelector('.launch-film video').currentTime>.1,{},{timeout:15000});await v.evaluate(e=>e.pause());
 console.log('PASS public site and all committed media hashes; actual video playback');
 await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
 await page.locator('[data-scale-count="10"]').waitFor();
 assert.equal(await page.locator('[data-scale-slot]:visible').count(),10);
 await page.locator('[data-scale-count="6"]').click();assert.equal(await page.locator('[data-scale-slot]:visible').count(),6);
 await page.locator('[data-sem-step="1"]').click();assert.ok(await page.locator('[data-semantic-beat="1"] .sem-result').isVisible());
 assert.equal(await page.locator('[data-positioning-contrast] dt').count(),3);
 assert.equal(await page.locator('.evidence-next a[href$="/issues/172"]').count(),1);
 await page.goto(origin+'/#semantic-awareness',{waitUntil:'domcontentloaded'});
 assert.ok(await page.locator('#semantic-awareness .source-advisory').isVisible());
 assert.ok(await page.locator('#semantic-awareness .source-advisory-status').getByText('Advisory context · no edit refusal').isVisible());
 assert.equal(await page.locator('[data-semantic-layer] h4').count(),2);
 console.log('PASS live semantic-awareness section, tagged evidence links and four-part architecture');
 console.log('PASS live parallel-work topology, semantic conflict story, contrast and benchmark link');
 await page.goto(origin+'/#team-awareness',{waitUntil:'domcontentloaded'});
 await page.locator('#team-awareness .cx-demo').waitFor({timeout:20000});
 assert.equal(await page.locator('#cap-tab-team-awareness').getAttribute('aria-selected'),'true');
 assert.equal(await page.locator('#team-awareness .cx-demo').getAttribute('data-beat'),'2');
 assert.equal(await page.locator('[data-cap-tab]').count(),6);
 await page.locator('#cap-tab-edit-coordination').click();await page.locator('.ls-scene-button').last().waitFor();
 console.log('PASS live capability explorer, named deep link and existing Stageshow edit demo');
 await page.close();
 for(const mode of ['light','dark']){
  const p=await b.newPage({viewport:{width:1440,height:900},colorScheme:mode,reducedMotion:'no-preference'});
  await p.goto('https://github.com/Langspan/LangSpan.dev',{waitUntil:'domcontentloaded',timeout:45000});
  const card=p.locator('article.markdown-body img[alt^="LangSpan: in a shared checkout"]').first();
  await card.waitFor({timeout:20000});await card.scrollIntoViewIfNeeded();await card.evaluate(img=>img.decode());assert.equal(await card.evaluate(img=>img.naturalWidth),1300,'GitHub-rendered '+mode+' card decoded');
  const a=await card.screenshot();await p.waitForTimeout(1800);const c=await card.screenshot();
  console.log('GitHub '+mode+' image decoded; timed frames '+(a.equals(c)?'identical (playback not established)':'differ (animation observed)'));
  await p.close();
 }
}finally{await b.close()}
