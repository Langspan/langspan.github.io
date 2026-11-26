import {chromium} from 'playwright';
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
 const p=await context.newPage();p.on('pageerror',e=>errors.push(width+': '+e.message));
 p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(width+': '+r.status()+' '+r.url());});
 await p.addInitScript(()=>{window.__metrics={cls:0,lcp:0};try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__metrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});}catch{}});
 await p.goto(base+'/',{waitUntil:'networkidle'});await p.waitForTimeout(400);
 assert.ok(await p.locator('h1').isVisible());assert.ok(await p.locator('.hero-actions a[href="#start"]').isVisible());
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'horizontal overflow '+width);
 if(width>=1280){const cta=await p.locator('.hero-actions').boundingBox();assert.ok(cta.y+cta.height<=800,'primary CTA below desktop fold');}
 await p.screenshot({path:out+'/'+width+'-hero.png'});
 perf.push({width,...await p.evaluate(()=>window.__metrics)});
 await p.locator('.hero-actions a[href="#demo"]').click();
 await p.locator('.ls-scene-button').first().waitFor({timeout:15000});
 const scenes=p.locator('.ls-scene-button');
 for(let i=0;i<await scenes.count();i++){await scenes.nth(i).click();assert.equal(await scenes.nth(i).getAttribute('aria-pressed'),'true');if(width===1440||width===390)await p.locator('#coordination-demo').screenshot({path:out+'/'+width+'-demo-'+i+'.png'});}
 const replay=p.getByRole('button',{name:'Replay coordination illustration from the beginning'});await replay.click();
 await p.locator('[data-motion-toggle]').click();assert.equal(await p.locator('html').getAttribute('data-motion-paused'),'true');
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
 await p.addScriptTag({content:axe});const report=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 a11y.push({width,violations:report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 await p.screenshot({path:out+'/'+width+'-full.png',fullPage:true});
 await context.close();
}
for(const opts of [{reducedMotion:'reduce'},{javaScriptEnabled:false}]){
 const p=await browser.newPage({viewport:{width:390,height:844},...opts});
 await p.goto(base+'/#start',{waitUntil:'networkidle'});
 assert.equal(await p.locator('.download-list a').count(),4);
 assert.ok(await p.locator('#panel-claude').isVisible());if(opts.javaScriptEnabled===false)assert.ok(await p.locator('#panel-codex').isVisible());else assert.equal(await p.locator('html').getAttribute('data-motion-paused'),'true');
 await p.goto(base+'/#demo',{waitUntil:'networkidle'});
 if(opts.javaScriptEnabled===false)assert.ok(await p.locator('.demo-fallback').isVisible());else await p.locator('.ls-scene-button').last().waitFor();
 await p.screenshot({path:out+'/'+(opts.javaScriptEnabled===false?'no-js':'reduced-motion')+'.png',fullPage:true});await p.close();
}
await browser.close();
writeFileSync(out+'/accessibility.json',JSON.stringify(a11y,null,2));writeFileSync(out+'/lab-metrics.json',JSON.stringify(perf,null,2));
console.log('Accessibility findings:',JSON.stringify(a11y));console.log('Lab metrics (not field measurements):',JSON.stringify(perf));
assert.deepEqual(errors,[],'browser errors');
assert.deepEqual(a11y.filter(x=>x.violations.length),[],'WCAG scan findings');
console.log('PASS: five widths, demo steps and pause, keyboard tabs, copy, download paths, FAQ, reduced motion, and no-JS fallback.');
