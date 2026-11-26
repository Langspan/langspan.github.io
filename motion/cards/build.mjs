// ChanMeng product-card kit, installed at the pinned upstream revision by CI.
// Follow the existing Stageshow scenario, not literal CLI output or a live run.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kit from './lib/index.cjs';
const {card,panel,createTimeline,createGlyphSet}=kit;
const here=dirname(fileURLToPath(import.meta.url)), root=join(here,'../..');
const story=JSON.parse(readFileSync(join(root,'marketing/story.json'),'utf8'));
const source=readFileSync(join(root,'demo-src/README.md'),'utf8');
const site=readFileSync(join(root,'index.html'),'utf8');
for(const s of ['src/auth/session.ts','tests/session.test.ts','B independently chooses']) {
 if(!source.includes(s)) throw Error('Stageshow narrative changed: '+s);
}
for(const s of ['Shared checkout','Overlapping edit caught.','Admitted · different file','Agents choose their next action.']) {
 if(!site.includes(s)) throw Error('Website illustration changed: '+s);
}
const font=(family,weight)=>join(here,'node_modules','@fontsource',family,'files',family+'-latin-'+weight+'-normal.woff');
const glyphs=createGlyphSet({display:font('inter',600),sans:font('inter',400),sansBold:font('inter',600),mono:font('ibm-plex-mono',400)});
const title='LangSpan: in a shared checkout Agent A holds src/auth/session.ts, Agent B’s overlapping request is refused, and B independently chooses tests/session.test.ts.';
const text=(s,x,y,fill,size=18,font='sans',anchor='start')=>glyphs.text(s,{x,y,fill,size,font,anchor});
const rect=(x,y,w,h,rx,fill,stroke)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'"'+(stroke?' stroke="'+stroke+'"':'')+'/>';
const out=join(root,'assets/product');mkdirSync(out,{recursive:true});
for(const mode of ['light','dark']){
 const dark=mode==='dark';
 const theme={panel:dark?'#151513':'#F4F3EF',text:dark?'#F4F3EF':'#151513',muted:dark?'#C6C2B8':'#3F3E44',soft:dark?'#C6C2B8':'#3F3E44',accent:'#D87859'};
 const logo=readFileSync(join(root,'assets/brand/langspan-lockup-'+mode+'.svg'),'utf8').trim();
 if(!logo.includes('viewBox="0 0 288 80"')) throw Error('Wordmark dimensions changed');
 const mark='<g transform="scale(.82)">'+logo+'</g>';
 const timing=story.readme;
 const tl=createTimeline({duration:timing.duration,prefix:'ls'});
 const group=(attrs,inner)=>'<g '+attrs+'>'+inner+'</g>';
 const reveal=(t,inner)=>group(tl.on(t,{fade:.3}).attrs,inner);
 const transient=(a,b,inner)=>group(tl.span(a,b,{fade:.25}).attrs,inner);
 const ink='#F4F3EF',muted='#C6C2B8',ground='#151513',surface='#232320',line='#484640',coral='#D87859';
 const w=352, ax=528,bx=904,y=62,h=226;
 const window=(x,agent,task)=>rect(x,y,w,h,10,surface,line)+
   '<path d="M'+x+' 108h'+w+'" stroke="'+line+'"/>'+
   text(agent,x+20,91,ink,18,'sansBold')+text(task,x+20,137,muted,15);
 const file=(x,y,s)=>rect(x,y,w-40,40,5,ground,line)+text(s,x+12,y+25,ink,15,'mono');
 const state=(x,y,s,color)=>'<circle cx="'+(x+5)+'" cy="'+(y-6)+'" r="4" fill="'+color+'"/>'+text(s,x+18,y,color,15,'sansBold');
 const stage=
  rect(500,0,800,360,0,ground)+text('SHARED CHECKOUT',528,35,muted,13,'mono')+
  text('Illustrated local workflow',1256,35,muted,13,'sans','end')+
  '<g class="'+tl.dip()+'">'+
  window(ax,'Agent A','Update session refresh')+
  file(ax+20,153,story.files.shared)+
  reveal(timing.hold,state(ax+20,225,'Admitted · active hold',ink))+
  window(bx,'Agent B','Extend session coverage')+
  transient(0,timing.redirect,file(bx+20,153,story.files.shared))+
  transient(timing.deny,timing.redirect,state(bx+20,225,'Overlapping edit refused',coral))+
  reveal(timing.request,file(bx+20,153,story.files.independent))+
  reveal(timing.admit,state(bx+20,225,'Admitted · different file',ink))+
  reveal(timing.admit,text('Overlap caught. Separate work continues.',528,325,muted,16,'sansBold'))+
  '</g>';
 const panelSvg=panel(glyphs,{theme,eyebrow:'LOCAL COORDINATION',wordmark:mark,headline:story.identity,headlineSize:23,sub:'Agents choose their next action.'});
 const svg=card({title,css:tl.css(),defs:glyphs.defs(),panelSvg,stageSvg:stage,loop:timing.duration});
 if(Buffer.byteLength(svg)>300*1024)throw Error('Card exceeds 300 KiB');
 writeFileSync(join(out,'langspan-card-'+mode+'.svg'),svg);
 writeFileSync(join(out,'langspan-card-'+mode+'-still.svg'),svg.replace(/<style>[\s\S]*?<\/style>/,'<style>*{animation:none!important}</style>'));
}
