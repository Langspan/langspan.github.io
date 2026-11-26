// ChanMeng product-card kit, installed at the pinned upstream revision by CI.
// Follow the existing Stageshow scenario, not literal CLI output or a live run.
// One story and one set of words feed both cards: the wide README card
// (1300 x 360) and the compact phone card (520 x 640), each in light and
// dark, each with a motionless still.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kit from './lib/index.cjs';
const {card,panel,createTimeline,createGlyphSet}=kit;
const here=dirname(fileURLToPath(import.meta.url)), root=join(here,'../..');
const story=JSON.parse(readFileSync(join(root,'marketing/story.json'),'utf8'));
const source=readFileSync(join(root,'demo-src/README.md'),'utf8');
const demo=readFileSync(join(root,'demo-src/CoordinationDemo.tsx'),'utf8');
const site=readFileSync(join(root,'index.html'),'utf8');

// The words on both cards. Each must still exist in the source it comes from.
const COPY={
 stageLabel:'Shared checkout',
 stageNote:'Illustrated local workflow',
 a:{agent:'Agent A',task:'Session refresh'},
 b:{agent:'Agent B',task:'Refresh test coverage'},
 hold:'Admitted, holding the file',
 refused:'Overlapping edit refused',
 admitted:'Admitted, different file',
 result:'Overlap caught. Separate work continues.',
 headline:story.identity,
 sub:'Agents choose their next action.',
};
for(const s of ['src/auth/session.ts','tests/session.test.ts','B independently chooses']) {
 if(!source.includes(s)) throw Error('Stageshow narrative changed: '+s);
}
for(const s of [COPY.a.task,COPY.b.task,COPY.admitted]) {
 if(!demo.includes(s)) throw Error('Stageshow scene wording changed: '+s);
}
for(const s of [COPY.stageLabel,'overlapping edit denied.',COPY.admitted,COPY.sub,COPY.a.task,COPY.b.task]) {
 if(!site.includes(s)) throw Error('Website illustration changed: '+s);
}

const font=(family,weight)=>join(here,'node_modules','@fontsource',family,'files',family+'-latin-'+weight+'-normal.woff');
const fonts={display:font('inter',600),sans:font('inter',400),sansBold:font('inter',600),mono:font('ibm-plex-mono',400)};
const title='LangSpan: in a shared checkout Agent A holds src/auth/session.ts, Agent B’s overlapping request is refused, and B independently chooses tests/session.test.ts.';
const rect=(x,y,w,h,rx,fill,stroke)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'"'+(stroke?' stroke="'+stroke+'"':'')+'/>';
const out=join(root,'assets/product');mkdirSync(out,{recursive:true});
const timing=story.readme;
const ink='#F4F3EF',muted='#C6C2B8',ground='#151513',surface='#232320',line='#484640',coral='#D87859';

// Both agent windows and the closing line, on one timeline. `windows` gives
// each window's top-left corner; every card shares the window's inner layout.
function scene(glyphs,tl,{w,h,a,b,result}){
 const text=(s,x,y,fill,size,font,anchor='start')=>glyphs.text(s,{x,y,fill,size,font,anchor});
 const group=(attrs,inner)=>'<g '+attrs+'>'+inner+'</g>';
 const reveal=(t,inner)=>group(tl.on(t,{fade:.3}).attrs,inner);
 const transient=(t0,t1,inner)=>group(tl.span(t0,t1,{fade:.25}).attrs,inner);
 const window=({x,y},agent,task)=>rect(x,y,w,h,10,surface,line)+
   '<path d="M'+x+' '+(y+46)+'h'+w+'" stroke="'+line+'"/>'+
   text(agent,x+20,y+29,ink,18,'sansBold')+text(task,x+20,y+75,muted,15,'sans');
 const file=({x,y},s)=>rect(x+20,y+91,w-40,40,5,ground,line)+text(s,x+32,y+116,ink,15,'mono');
 const state=({x,y},s,color)=>text(s,x+20,y+163,color,15,'sansBold');
 return '<g class="'+tl.dip()+'">'+
  window(a,COPY.a.agent,COPY.a.task)+
  file(a,story.files.shared)+
  reveal(timing.hold,state(a,COPY.hold,ink))+
  window(b,COPY.b.agent,COPY.b.task)+
  transient(0,timing.redirect,file(b,story.files.shared))+
  transient(timing.deny,timing.redirect,state(b,COPY.refused,coral))+
  reveal(timing.request,file(b,story.files.independent))+
  reveal(timing.admit,state(b,COPY.admitted,ink))+
  reveal(timing.admit,text(COPY.result,result.x,result.y,muted,16,'sansBold'))+
  '</g>';
}

function write(name,svg){
 if(Buffer.byteLength(svg)>300*1024)throw Error(name+' exceeds 300 KiB');
 writeFileSync(join(out,name+'.svg'),svg);
 writeFileSync(join(out,name+'-still.svg'),svg.replace(/<style>[\s\S]*?<\/style>/,'<style>*{animation:none!important}</style>'));
}

for(const mode of ['light','dark']){
 const dark=mode==='dark';
 const theme={panel:dark?'#151513':'#F4F3EF',text:dark?'#F4F3EF':'#151513',muted:dark?'#C6C2B8':'#3F3E44',soft:dark?'#C6C2B8':'#3F3E44',accent:'#D87859'};
 const logo=readFileSync(join(root,'assets/brand/langspan-lockup-'+mode+'.svg'),'utf8').trim();
 if(!logo.includes('viewBox="0 0 288 80"')) throw Error('Wordmark dimensions changed');

 // Wide card: the kit's identity panel beside the two windows, side by side.
 {
  const glyphs=createGlyphSet(fonts);
  const tl=createTimeline({duration:timing.duration,prefix:'ls'});
  const stage=rect(500,0,800,360,0,ground)+
   glyphs.text(COPY.stageLabel,{x:528,y:36,fill:muted,size:14,font:'sans'})+
   glyphs.text(COPY.stageNote,{x:1256,y:36,fill:muted,size:13,font:'sans',anchor:'end'})+
   scene(glyphs,tl,{w:352,h:200,a:{x:528,y:62},b:{x:904,y:62},result:{x:528,y:312}});
  const panelSvg=panel(glyphs,{theme,eyebrow:'LOCAL COORDINATION',wordmark:'<g transform="scale(.82)">'+logo+'</g>',headline:COPY.headline,headlineSize:23,sub:COPY.sub});
  write('langspan-card-'+mode,card({title,css:tl.css(),defs:glyphs.defs(),panelSvg,stageSvg:stage,loop:timing.duration}));
 }

 // Compact card: the same story and words, stacked for a phone-width README.
 {
  const W=520,H=640,top=148,h=182;
  const glyphs=createGlyphSet(fonts);
  const tl=createTimeline({duration:timing.duration,prefix:'lc'});
  const a={x:24,y:top+52}, b={x:24,y:top+52+h+14};
  const body=rect(0,0,W,H,0,theme.panel)+
   '<g transform="translate(32 28) scale(.7)">'+logo+'</g>'+
   glyphs.text(COPY.headline,{x:32,y:118,fill:theme.text,size:26,font:'display'})+
   rect(0,top,W,H-top,0,ground)+
   glyphs.text(COPY.stageLabel,{x:24,y:top+32,fill:muted,size:14,font:'sans'})+
   glyphs.text(COPY.stageNote,{x:W-24,y:top+32,fill:muted,size:13,font:'sans',anchor:'end'})+
   scene(glyphs,tl,{w:W-48,h,a,b,result:{x:24,y:H-22}});
  const compact=card({title,css:tl.css(),defs:glyphs.defs(),body,loop:timing.duration,width:W,height:H});
  write('langspan-card-compact-'+mode,compact);
  // Older README and profile links name this file; keep it as the light compact card.
  if(!dark)writeFileSync(join(out,'langspan-overview-compact.svg'),compact);
 }
}
