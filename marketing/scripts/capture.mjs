import {createRequire} from 'node:module';
const {chromium}=createRequire(new URL('../../review/package.json',import.meta.url))('playwright');
import {mkdirSync,copyFileSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(process.cwd()), work=resolve(process.env.FILM_WORK||'marketing/.work'), media=join(work,'media');mkdirSync(media,{recursive:true});
const s=JSON.parse(readFileSync(join(root,'marketing/story.json'),'utf8'));
const src=join(root,s.evidence.source);
assert.equal(createHash('sha256').update(readFileSync(src)).digest('hex'),s.evidence.sha256,'proof capture changed');
for(const [name,[x,y,w,h]] of Object.entries(s.evidence.crops))execFileSync('ffmpeg',['-v','error','-y','-i',src,'-vf','crop='+w+':'+h+':'+x+':'+y,'-frames:v','1',join(media,'proof-'+name+'.png')]);
for(const m of ['light','dark'])copyFileSync(join(root,'assets/brand/langspan-lockup-'+m+'.svg'),join(media,'logo-'+m+'.svg'));
const b=await chromium.launch({headless:true});
const p=await b.newPage({viewport:{width:1360,height:920},deviceScaleFactor:2,reducedMotion:'reduce'});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8123/?motion=static',{waitUntil:'networkidle'});
await p.locator('.hero-figure').screenshot({path:join(media,'hero.png'),animations:'disabled'});
await p.goto('http://127.0.0.1:8123/demo-src/preview.html?motion=static',{waitUntil:'networkidle'});
const steps=p.locator('.ls-scene-button');await steps.first().waitFor();
for(let i=0;i<s.stageshow.scenes.length;i++){
 await steps.nth(i).click();assert.equal(await steps.nth(i).getAttribute('aria-pressed'),'true');
 await p.waitForTimeout(150);
 await p.locator('.ls-demo-stage').screenshot({path:join(media,'stage-'+i+'.png'),animations:'disabled'});
 if(i===0)await p.locator('.ls-agent-a').screenshot({path:join(media,'agent-a.png'),animations:'disabled'});
 if(i>0)await p.locator('.ls-agent-b').screenshot({path:join(media,'agent-b-'+i+'.png'),animations:'disabled'});
}
await p.close();
const compact=await b.newPage({viewport:{width:580,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
await compact.goto('http://127.0.0.1:8123/demo-src/preview.html?motion=static',{waitUntil:'networkidle'});
for(let i=0;i<s.stageshow.scenes.length;i++){await compact.locator('.ls-scene-button').nth(i).click();await compact.waitForTimeout(150);await compact.locator('.ls-demo-stage').screenshot({path:join(media,'compact-stage-'+i+'.png'),animations:'disabled'});}
await b.close();assert.deepEqual(errors,[]);console.log('Captured current Stageshow UI and exact released dashboard crops at 2x');
