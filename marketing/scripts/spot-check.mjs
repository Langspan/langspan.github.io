import {createRequire} from 'node:module';
const {chromium}=createRequire(new URL('../../review/package.json',import.meta.url))('playwright');
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=process.cwd(),work=resolve(process.env.FILM_WORK||'marketing/.work'),format=process.argv[2]||'launch',spec=JSON.parse(readFileSync(join(work,'plan-'+format+'.json'),'utf8'));const story=JSON.parse(readFileSync('marketing/story.json','utf8'));
const dest=resolve('marketing/exports/'+format);mkdirSync(dest,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:spec.w,height:spec.h},deviceScaleFactor:2});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(pathToFileURL(join(work,'beats.html')).href+'?format='+format);await p.evaluate(()=>window.READY);
let t=0;for(const [key,d] of story.film.plans[format].beats){
 const at=t+d/2;await p.evaluate(x=>window.seek(x),at);
 const before=await p.locator('.scene.active').innerText();
 // Seek backwards and forwards, not just sequential playback.
 await p.evaluate(x=>window.seek(x),0);await p.evaluate(x=>window.seek(x),at);
 assert.equal(await p.locator('.scene.active').innerText(),before,'stateful seek '+key);
 const overflow=await p.locator('.scene.active').evaluate(el=>{const v=el.getBoundingClientRect();return [...el.querySelectorAll('.top,.copy,.body,.headline,.art,.footer')].filter(x=>x.getClientRects().length).map(x=>({name:x.className,b:x.getBoundingClientRect()})).filter(x=>x.b.left<v.left-1||x.b.right>v.right+1||x.b.top<v.top-1||x.b.bottom>v.bottom+1).map(x=>x.name);});
 assert.deepEqual(overflow,[],'clipped composition '+key+' '+format);
 if((format==='walkthrough'||format==='vertical')&&story.film.scenes[key].kind==='workflow'){const src=await p.locator('.scene.active .art img').getAttribute('src');assert.ok(src.includes(format==='vertical'?'compact-stage-':'media/stage-'),'format-specific actual Stageshow framing');}
 await p.screenshot({path:join(dest,'scene-'+key+'.png')});t+=d;
}
assert.deepEqual(errors,[],'render page errors');if(format==='launch'){
 const p2=await b.newPage({viewport:{width:600,height:315},deviceScaleFactor:2});
 await p2.goto(pathToFileURL(join(work,'social-preview.html')).href);
 await p2.evaluate(()=>Promise.all([...document.images].map(x=>x.decode())));
 await p2.screenshot({path:join(dest,'social-preview.png')});await p2.close();
}
await b.close();
console.log('PASS deterministic scene review '+format);
