import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';import {resolve,join} from 'node:path';import assert from 'node:assert/strict';
const root=process.cwd(),work=resolve(process.env.FILM_WORK||'marketing/.work');mkdirSync(work,{recursive:true});const story=JSON.parse(readFileSync('marketing/story.json','utf8'));
writeFileSync(join(work,'story-data.js'),'const STORY = '+JSON.stringify(story)+';\n');
copyFileSync('marketing/film/beats.html',join(work,'beats.html'));
copyFileSync('marketing/film/social-preview.html',join(work,'social-preview.html'));
for(const [name,s] of Object.entries(story.film.plans)){
 const duration=s.beats.reduce((a,b)=>a+b[1],0);assert.ok(name==='launch'?duration>=30&&duration<=45:name==='walkthrough'?duration<=15:duration>=15&&duration<=20);
 const plan={name,w:s.w,h:s.h,page:'beats.html',mode:'plain',xf:0,slow:1,q:{format:name},clips:[{id:'story',beat:'film',dur:duration}]};
 writeFileSync(join(work,'plan-'+name+'.json'),JSON.stringify(plan,null,2)+'\n');
 let cursor=0;const timestamp=t=>new Date(Math.round(t*1000)).toISOString().slice(11,23);let vtt='WEBVTT\n\n';
 for(const [key,seconds] of s.beats){const scene=story.film.scenes[key];vtt+=timestamp(cursor)+' --> '+timestamp(cursor+seconds)+'\n'+scene.title.replaceAll('\\n',' ')+' '+scene.body+'\n\n';cursor+=seconds;}
 writeFileSync(join(work,name+'.vtt'),vtt);
}
