import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Stage, type LookTokens } from './vendor/stageshow/kit/stage'
import { Window, Prompt } from './vendor/stageshow/kit/window'
import { Code } from './vendor/stageshow/kit/code'
import { StillContext } from './vendor/stageshow/kit/reduced-motion'
import STORY from '../marketing/story.json'
import './capability-explorer.css'

// Shared narrative, illustrative scenes. Never submit commands or contact agents.
const catalog = STORY.capabilityExplorer
type Capability = typeof catalog.scenes[number]
type Beat = Capability['beats'][number]
type Card = Beat['a']
const DURATION = catalog.durationMs
const OFFSETS = catalog.offsetsMs
type Scene = { beat: number }

function SceneWindow({ title, card, compact, side, beat }: { title: string; card: Card; compact: boolean; side: 'a'|'b'; beat: number }) {
  return <Window chrome="terminal" lights="grey" title={title} className={'cx-window cx-window-'+side}>
    <div className="cx-window-content" key={side+'-'+beat}>
      <div className="cx-window-label">{card.label}</div>
      <Prompt path={card.code.startsWith('langspan')?'$':'Work'}><span>{card.code}</span></Prompt>
      <Code className="cx-code" numbers={false} lines={card.lines.map(([textKind,text])=>({text,kind:textKind==='add'?'add':textKind==='del'?'del':undefined}))} />
      <div className="cx-window-foot">{card.foot}</div>
    </div>
  </Window>
}

function SceneLayout({cap,beat,layout,playing}:{cap:Capability;beat:number;layout:string;playing:boolean}){
  const b=cap.beats[beat],compact=layout==='compact'
  const type=cap.layout
  const bridge=type==='remote'?'Git remote, metadata only':type==='source'?'Compare recorded versions':type==='commit'?'Session attribution':type==='integration'?'Check exact tree':'Related work context'
  return <div className="cx-scene" data-layout={layout} data-scenario={type} data-beat={beat} data-playing={playing}>
    <div className="cx-scene-header"><span>{cap.context}</span><span>Illustrated workflow</span></div>
    <SceneWindow title={cap.left} card={b.a} compact={compact} side="a" beat={beat}/>
    <SceneWindow title={cap.right} card={b.b} compact={compact} side="b" beat={beat}/>
    <div className="cx-bridge" aria-hidden="true"><span/><div><img src="assets/brand/langspan-icon-dark.svg" alt="" width="24" height="24"/><b>{bridge}</b></div><span/></div>
    <div className="cx-result" data-tone={b.tone} key={'result-'+beat}><div className="cx-result-icon">{b.tone==='good'?<svg viewBox="0 0 20 20"><path d="m4 10 4 4 8-9"/></svg>:b.tone==='accent'?<svg viewBox="0 0 20 20"><path d="M10 3v9m0 4h.01"/></svg>:<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>}</div><div><span>LangSpan</span><strong>{b.result}</strong><p>{b.event}</p></div></div>
  </div>
}
function CapabilityDemo({cap,tokens,onReady,initialWidth}:{cap:Capability;tokens:LookTokens;onReady:()=>void;initialWidth:number}){
  const host=useRef<HTMLDivElement>(null), stage=useRef<HTMLDivElement>(null)
  const [width,setWidth]=useState(initialWidth)
  const mq=useRef(matchMedia('(prefers-reduced-motion: reduce)'))
  const [reduced,setReduced]=useState(mq.current.matches)
  const forced=new URLSearchParams(location.search).get('motion')==='static'
  const staticMode=forced||reduced
  const [globalPaused,setGlobalPaused]=useState(document.documentElement.dataset.motionPaused==='true')
  const [hidden,setHidden]=useState(document.hidden)
  const [visible,setVisible]=useState(false), [started,setStarted]=useState(false)
  const [paused,setPaused]=useState(false),[finished,setFinished]=useState(staticMode)
  const elapsed=useRef(staticMode?DURATION:0), beatRef=useRef(staticMode?2:0)
  const [beat,setBeat]=useState(beatRef.current)
  const running=started&&visible&&!hidden&&!staticMode&&!globalPaused&&!paused&&!finished
  function setStep(n:number){beatRef.current=n;setBeat(n)}
  useLayoutEffect(()=>{onReady()},[onReady])
  useEffect(()=>{
    const motion=()=>setReduced(mq.current.matches)
    const page=()=>setHidden(document.hidden)
    const global=(e:Event)=>setGlobalPaused(Boolean((e as CustomEvent<{paused:boolean}>).detail?.paused))
    mq.current.addEventListener('change',motion);document.addEventListener('visibilitychange',page);window.addEventListener('langspan:motion',global)
    const io=new IntersectionObserver(([entry])=>{setVisible(entry.isIntersecting);if(entry.intersectionRatio>=.25)setStarted(true)},{threshold:[0,.25]})
    if(stage.current)io.observe(stage.current)
    const ro=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));if(host.current)ro.observe(host.current)
    return ()=>{io.disconnect();ro.disconnect();mq.current.removeEventListener('change',motion);document.removeEventListener('visibilitychange',page);window.removeEventListener('langspan:motion',global)}
  },[])
  useEffect(()=>{if(staticMode){elapsed.current=DURATION;setStep(2);setFinished(true)}},[staticMode])
  useEffect(()=>{
    if(!running)return
    let raf=0,last=performance.now()
    const tick=(now:number)=>{
      elapsed.current=Math.max(0,Math.min(DURATION,elapsed.current+Math.max(0,Math.min(100,now-last))));last=now
      const next=Math.max(0,OFFSETS.findLastIndex(x=>elapsed.current>=x))
      if(next!==beatRef.current)setStep(next)
      if(elapsed.current>=DURATION){setFinished(true);return}
      raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(raf)
  },[running])
  const seek=(n:number)=>{elapsed.current=OFFSETS[n];setStep(n);setFinished(false);setPaused(true)}
  const replay=()=>{elapsed.current=0;setStep(0);setFinished(false);setPaused(false);setStarted(true)}
  const toggle=()=>{if(finished)replay();else{setStarted(true);setPaused(running)}}
  const b=cap.beats[beat]
  const cw=Math.min(620,Math.max(286,width||358))
  return <div className="cx-demo" ref={host} data-capability={cap.id} data-beat={beat} data-playing={running} data-static={staticMode}>
    <div className="cx-heading"><h3>{cap.heading}</h3><p>{cap.summary}</p></div>
    <div className="cx-stage" ref={stage} aria-hidden="true">
      <StillContext.Provider value={!running}>
        <Stage<Scene> width={1100} height={407} compact={{below:840,width:cw,height:633}} controlled={{beat}} poster={{beat}} tokens={tokens} theme="dark" accent="#D87859" fidelity="realistic" className="cx-stageshow">
          {(scene,_rect,layout)=><SceneLayout cap={cap} beat={scene.beat} layout={layout} playing={running}/>}
        </Stage>
      </StillContext.Provider>
    </div>
    <div className="cx-controls"><div className="cx-steps" role="group" aria-label={cap.name+' steps'}>
      {cap.beats.map((item,i)=><button type="button" key={item.label} className="cx-step" aria-pressed={beat===i} onClick={()=>seek(i)}><span className="cx-step-index">0{i+1}</span><span>{item.label}</span><span className="cx-progress" data-complete={i<=beat} aria-hidden="true"/></button>)}
    </div><div className="cx-playback">{staticMode?<span>Motion reduced. Choose any step.</span>:<><button type="button" className="cx-play" disabled={globalPaused} onClick={toggle} aria-label={running?'Pause '+cap.name:finished?'Play again '+cap.name:'Play '+cap.name}>{running?'Pause':finished?'Play again':'Play'}</button><button type="button" className="cx-replay" disabled={globalPaused} onClick={replay} aria-label={'Replay '+cap.name}>Replay</button><span>{globalPaused?'Motion paused':running?'Playing once':finished?'End of illustration':'Paused'}</span></>}</div></div>
    <div className="cx-caption sr-only" aria-live={running?'off':'polite'} aria-atomic="true"><strong>{b.result}</strong><p>{b.event}</p></div>
  </div>
}

class SceneBoundary extends Component<{children:ReactNode;restore:()=>void},{failed:boolean}>{
  state={failed:false}
  static getDerivedStateFromError(){return{failed:true}}
  componentDidCatch(error:Error){console.error('LangSpan capability scene:',error.message);this.props.restore()}
  render(){return this.state.failed?null:this.props.children}
}
export function mountCapabilityScenes(tokens:LookTokens){
 const explorer=document.querySelector<HTMLElement>('[data-capability-explorer]')
 if(!explorer||explorer.dataset.cxMounted||!('ResizeObserver'in window)||!('IntersectionObserver'in window))return
 explorer.dataset.cxMounted='true'
 function show(id:string){
   const target=explorer!.querySelector<HTMLElement>('[data-cap-scene="'+CSS.escape(id)+'"]')
   if(!target||target.dataset.cxMounted)return
   const cap=catalog.scenes.find(c=>c.id===id&&c.layout!=='original')
   if(!cap||cap.beats.length!==3)return
   target.dataset.cxMounted='true'
   const fallback=target.querySelector<HTMLElement>('.cap-fallback'), mount=document.createElement('div')
   mount.hidden=true;target.append(mount)
   const restore=()=>{mount.hidden=true;if(fallback)fallback.hidden=false;target.dataset.cxError='true';delete target.dataset.cxReady}
   const onReady=()=>{mount.hidden=false;if(fallback)fallback.hidden=true;target.dataset.cxReady='true'}
   try{createRoot(mount,{onUncaughtError:restore}).render(<SceneBoundary restore={restore}><CapabilityDemo cap={cap} tokens={tokens} onReady={onReady} initialWidth={target.clientWidth||1100}/></SceneBoundary>)}catch{restore()}
 }
 const showActive=()=>show(explorer.dataset.active||'peer-briefings')
 window.addEventListener('langspan:capability',showActive)
 new MutationObserver(showActive).observe(explorer,{attributes:true,attributeFilter:['data-active']})
 showActive()
}
