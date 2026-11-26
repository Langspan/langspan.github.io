import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Stage } from './vendor/stageshow/kit/stage'
import { Window, Prompt } from './vendor/stageshow/kit/window'
import { Code } from './vendor/stageshow/kit/code'
import { Roll } from './vendor/stageshow/kit/motion/Roll'
import { Collapse } from './vendor/stageshow/kit/motion/Collapse'
import { StillContext } from './vendor/stageshow/kit/reduced-motion'
import './coordination-demo.css'
import STORY from '../marketing/story.json'
import { mountCapabilityScenes } from './CapabilityExplorer'

// An authored, local-coordination illustration. This is not a terminal
// recording, a CLI transcript, a filesystem lock, or an autonomous planner.
// Four causal beats follow the real same-checkout admission boundary.
const SCENES = STORY.stageshow.scenes
const OFFSETS = STORY.stageshow.offsetsMs
const DURATION = STORY.stageshow.durationMs
type Scene = { beat: number }
type MotionWindow = { langspanMotionPaused?: boolean }

export const brandTokens = {
  '--ss-font': 'var(--sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)', '--ss-mono': '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  '--ss-canvas': '#151513', '--ss-surface': '#242422', '--ss-chrome': '#242422',
  '--ss-text': '#bab8b0', '--ss-text-strong': '#f4f3ef', '--ss-text-faint': '#9e9b93',
  '--ss-line': '#3f3e39', '--ss-line-faint': '#34332f', '--ss-accent': '#d87859',
  '--ss-accent-2': '#d87859', '--ss-term-bg': '#22221f', '--ss-term-dim': '#aaa79e',
  '--ss-term-path': '#c0bcb0', '--ss-term-sigil': '#d87859', '--ss-term-ok': '#b9c9ab',
  '--ss-term-err': '#e79a80', '--ss-success-text': '#c4d7b3', '--ss-success-soft': '#2c3428',
  '--ss-danger-text': '#e89c82', '--ss-danger-soft': '#3d2e27',
  '--ss-shadow-window': '0 0 0 1px #44433d, 0 18px 36px -18px #0008',
  '--ss-radius-window': '12px',
} as const

function AgentA({ compact }: { compact: boolean }) {
  return <Window chrome="terminal" lights="grey" title="Agent A · session 01" className="ls-terminal ls-agent-a">
    <div className="ls-intent"><span>Working on</span><strong>Session refresh</strong></div>
    <Prompt path="Edit"><span>{STORY.files.shared}</span></Prompt>
    <Code className="ls-diff" numbers={!compact} start={42} lines={[
      { text: 'return session;', kind: 'del' },
      { text: 'return refreshSession(session);', kind: 'add' },
    ]} />
    <div className="ls-a-status"><span className="ls-status-mark" aria-hidden>✓</span><span>Admitted <span className="ls-dim">· active in this checkout</span></span></div>
    <div className="ls-host-note">Host permissions still apply.</div>
  </Window>
}

function AgentB({ beat, compact }: { beat: number; compact: boolean }) {
  return <Window chrome="terminal" lights="grey" title="Agent B · session 02" className="ls-terminal ls-agent-b" data-beat={beat}>
    <div className="ls-intent"><span>Working on</span><strong>Refresh test coverage</strong></div>
    <div className="ls-b-start" aria-hidden={beat !== 0} data-visible={beat === 0}>
      <Prompt path="Next"><span>Edit session refresh</span></Prompt>
      <div className="ls-pending-copy">A separate agent. The same checkout.</div>
      <div className="ls-pending-label">Ready to request an edit</div>
    </div>
    <div className="ls-b-events" data-visible={beat >= 1} aria-hidden={beat < 1}>
      <div className="ls-denied-request">
        <Prompt path="Edit"><span>{STORY.files.shared}</span></Prompt>
        <div className="ls-denial"><span className="ls-denial-bar" aria-hidden /><div><strong>Overlapping edit denied</strong><span>Agent A currently holds this file.</span></div></div>
      </div>
      <Collapse open={beat >= 2} reveal="drop" className="ls-next-request">
        <div className="ls-agent-choice">Agent B chooses another task</div>
        <Prompt path="Edit"><span>{STORY.files.independent}</span></Prompt>
        <div className="ls-test-result" data-visible={beat === 3} aria-hidden={beat < 3}>
          <Code numbers={false} lines={[{ text: compact ? 'it("refreshes sessions", …)' : 'it("refreshes an expired session", …)', kind: 'add' }]} />
          <div className="ls-admitted"><span className="ls-status-mark" aria-hidden>✓</span><Roll variant="fade">{beat === 3 ? 'Admitted · different file' : 'New request'}</Roll></div>
        </div>
      </Collapse>
    </div>
  </Window>
}

function SharedWork({ beat }: { beat: number }) {
  return <div className="ls-shared-work">
    <div className="ls-shared-title"><img src="assets/brand/langspan-icon-dark.svg" alt="" width="24" height="24" /><span>LangSpan</span><span className="ls-shared-scope">shared work context</span></div>
    <div className="ls-work-files">
      <div className="ls-work-file"><span className="ls-owner">A</span><code>{STORY.files.shared}</code><span className="ls-file-state">held</span></div>
      <div className="ls-work-file ls-second-file" data-visible={beat >= 2} aria-hidden={beat < 2}><span className="ls-owner ls-owner-b">B</span><code>{STORY.files.independent}</code><span className="ls-file-state"><Roll variant="fade">{beat === 3 ? 'admitted' : 'requested'}</Roll></span></div>
    </div>
  </div>
}

function Demo({ onReady, initialWidth }: { onReady: () => void; initialWidth: number }) {
  const host = useRef<HTMLDivElement>(null)
  const stageArea = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(initialWidth)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const queryStatic = new URLSearchParams(window.location.search).get('motion') === 'static'
  const staticMode = reduced || queryStatic
  const elapsed = useRef(staticMode ? DURATION : 0)
  const [beat, setBeat] = useState(staticMode ? 3 : 0)
  const beatRef = useRef(beat)
  const [finished, setFinished] = useState(staticMode)
  const [started, setStarted] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [pagePaused, setPagePaused] = useState(() => document.documentElement.dataset.motionPaused === 'true' || (window as unknown as MotionWindow).langspanMotionPaused === true)
  const [inView, setInView] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)
  const running = started && inView && !hidden && !staticMode && !userPaused && !pagePaused && !finished

  useLayoutEffect(() => { onReady() }, [onReady])
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(mq.matches)
    mq.addEventListener('change', change)
    const onVisibility = () => setHidden(document.hidden)
    const onGlobal = (event: Event) => setPagePaused(Boolean((event as CustomEvent<{ paused: boolean }>).detail?.paused))
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('langspan:motion', onGlobal)
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
      if (entry.intersectionRatio >= 0.35) setStarted(true)
    }, { threshold: [0, 0.35] })
    if (stageArea.current) io.observe(stageArea.current)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    if (host.current) ro.observe(host.current)
    return () => {
      mq.removeEventListener('change', change)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('langspan:motion', onGlobal)
      io.disconnect(); ro.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!staticMode) return
    elapsed.current = DURATION
    beatRef.current = 3
    setBeat(3); setFinished(true)
  }, [staticMode])

  useEffect(() => {
    if (!running) return
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      elapsed.current = Math.max(0, Math.min(DURATION, elapsed.current + Math.max(0, Math.min(now - previous, 100))))
      previous = now
      const next = Math.max(0, OFFSETS.findLastIndex(at => elapsed.current >= at))
      if (next !== beatRef.current) { beatRef.current = next; setBeat(next) }
      if (elapsed.current >= DURATION) { elapsed.current = 0; beatRef.current = 0; setBeat(0); frame = requestAnimationFrame(tick); return }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])

  // Freeze existing CSS/WAAPI transitions as well as the story clock. A
  // manual seek is a deliberate still; it does not restart autoplay.
  useLayoutEffect(() => {
    const animations = stageArea.current?.getAnimations({ subtree: true }) ?? []
    animations.forEach(animation => {
      if (!running) animation.pause()
      else if (animation.playState === 'paused') animation.play()
    })
  }, [running, beat])

  const seek = (next: number) => {
    elapsed.current = OFFSETS[next]
    beatRef.current = next
    setBeat(next); setFinished(false); setUserPaused(true)
  }
  const replay = () => {
    elapsed.current = 0; beatRef.current = 0
    setBeat(0); setFinished(false); setStarted(true); setUserPaused(false)
  }
  const togglePlayback = () => {
    if (finished) return replay()
    setStarted(true); setUserPaused(running)
  }

  const compactWidth = Math.min(620, Math.max(286, width))
  const snapshot = { beat }
  const showStill = staticMode || userPaused || pagePaused || finished
  return <div ref={host} className="ls-coordination" data-playing={running} data-static={staticMode} data-paused={!running}>
    <div className="ls-demo-topline"><span>One checkout. Two independent sessions.</span><span>Authored illustration</span></div>
    <div ref={stageArea} className="ls-demo-stage" aria-hidden="true">
      <StillContext.Provider value={showStill}>
        <Stage<Scene> width={1100} height={550} compact={{ below: 840, width: compactWidth, height: 710 }} controlled={snapshot} poster={snapshot} theme="dark" tokens={brandTokens} accent="#D87859" fidelity="realistic" className="ls-scene">
          {(scene, _rect, layout) => <div className="ls-scene-content" data-beat={scene.beat} data-layout={layout}>
            <div className="ls-checkout-label"><span className="ls-checkout-path">~/shared-checkout</span><span>Local coordination</span></div>
            <AgentA compact={layout === 'compact'} />
            <AgentB beat={scene.beat} compact={layout === 'compact'} />
            <div className="ls-connections" aria-hidden><span /><span /></div>
            <SharedWork beat={scene.beat} />
          </div>}
        </Stage>
      </StillContext.Provider>
    </div>
    <div className="ls-demo-controls">
      <div className="ls-scene-buttons" role="group" aria-label="Choose a step in the coordination illustration">
        {SCENES.map((scene, index) => <button type="button" key={scene.label} className="ls-scene-button" aria-pressed={beat === index} onClick={() => seek(index)}><span className="ls-step-number">0{index + 1}</span><span>{scene.label}</span><span className="ls-step-line" aria-hidden data-complete={beat >= index} /></button>)}
      </div>
      <div className="ls-playback">
        {staticMode ? <span className="ls-static-playback">Motion reduced · choose any step</span> : <>
          <button type="button" className="ls-play-button" onClick={togglePlayback} disabled={pagePaused} aria-label={running ? 'Pause coordination illustration' : finished ? 'Replay coordination illustration' : 'Play coordination illustration'}>{running ? 'Pause' : finished ? 'Play again' : 'Play'}</button>
          <button type="button" className="ls-replay-button" onClick={replay} disabled={pagePaused} aria-label="Replay coordination illustration from the beginning">Replay</button>
          <span className="ls-playback-state">{pagePaused ? 'Motion paused' : running ? 'Looping' : finished ? 'End of illustration' : 'Paused'}</span>
        </>}
      </div>
    </div>
    <div className="ls-demo-caption" aria-live={running ? 'off' : 'polite'} aria-atomic="true"><strong>{SCENES[beat].title}</strong><p>{SCENES[beat].description}</p></div>
    <p className="ls-demo-boundary">Illustrated workflow, not a recording. LangSpan answers coordination requests; agents choose their next action.</p>
  </div>
}

class DemoBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error:Error) { console.error('LangSpan edit scene:',error.message); this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

function mountOriginal() {
  const target = document.getElementById('coordination-demo')
  if (!target || target.dataset.demoMounted || !('ResizeObserver' in window) || !('IntersectionObserver' in window)) return
  const fallbacks = Array.from(target.children) as HTMLElement[]
  const mountPoint = document.createElement('div')
  mountPoint.className = 'ls-demo-mount'
  mountPoint.style.cssText = 'position:absolute;inset:0;visibility:hidden;pointer-events:none'
  target.append(mountPoint)
  let ready = false
  const originalStyles = fallbacks.map(element => element.style.display)
  const restore = () => {
    mountPoint.hidden = true
    fallbacks.forEach((element, index) => { element.hidden = false; element.style.display = originalStyles[index] })
    delete target.dataset.demoReady
  }
  const onReady = () => {
    if (ready) return
    ready = true
    fallbacks.forEach(element => { element.hidden = true; element.style.display = 'none' })
    mountPoint.removeAttribute('style')
    target.dataset.demoReady = 'true'
  }
  try {
    const root = createRoot(mountPoint, { onUncaughtError: restore })
    root.render(<DemoBoundary onError={restore}><Demo onReady={onReady} initialWidth={target.clientWidth || 1100} /></DemoBoundary>)
    target.dataset.demoMounted = 'true'
  } catch { restore() }
}

function mount() {
  mountCapabilityScenes(brandTokens)
  const explorer=document.querySelector<HTMLElement>('[data-capability-explorer]')
  if(!explorer){mountOriginal();return}
  const showOriginal=()=>{if(explorer.dataset.active==='edit-coordination')mountOriginal()}
  window.addEventListener('langspan:capability',showOriginal)
  new MutationObserver(showOriginal).observe(explorer,{attributes:true,attributeFilter:['data-active']})
  showOriginal()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true })
else mount()
