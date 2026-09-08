import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Play, Pause, RotateCcw, Volume2,
  VolumeX, Trophy, Coins, Shield, MapPin, ExternalLink, Footprints } from 'lucide-react';
import { Button } from '../components/ui/button';
import { mountGame } from './scene';
import type { Engine, ViewState } from './scene';
import type { Action } from './core';

const initial: ViewState = {phase:'ready',score:0,coins:0,distance:0,speed:16,shield:false,section:'Main courtyard',hit:null};
function savedBest() { try {const n=Number(localStorage.getItem('sliit-rush-best'));return Number.isFinite(n)?Math.max(0,n):0;}catch{return 0;} }
const format = (n: number) => n.toLocaleString('en-US');
export default function App() {
  const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null);
  const [view,setView]=useState(initial),[best,setBest]=useState(savedBest),[ready,setReady]=useState(false);
  const [error,setError]=useState(''),[muted,setMuted]=useState(true);
  useEffect(()=>{
    if(!host.current)return;
    try{engine.current=mountGame(host.current,setView);setReady(true);}
    catch{setError('The 3D game could not start. Enable hardware acceleration in your browser, then reload to try again.');}
    return()=>{engine.current?.dispose();engine.current=null;};
  },[]);
  useEffect(()=>{
    if(view.phase==='over'&&view.score>best){setBest(view.score);try{localStorage.setItem('sliit-rush-best',String(view.score));}catch{/* The run works without storage. */}}
  },[view.phase,view.score,best]);
  function start(){engine.current?.start();(document.activeElement as HTMLElement)?.blur();}
  function pause(){engine.current?.pause();(document.activeElement as HTMLElement)?.blur();}
  function command(a:Action){engine.current?.command(a);(document.activeElement as HTMLElement)?.blur();}
  function mute(){const next=!muted;setMuted(next);engine.current?.mute(next);(document.activeElement as HTMLElement)?.blur();}
  const running=view.phase==='playing',overlay=view.phase!=='playing';
  return <main className={`game-shell phase-${view.phase}`}>
    <header className="topbar">
      <a className="brand" href="./" aria-label="SLIIT Campus Rush home">
        <span className="logo-wrap"><img src="./sliit-logo.png" alt="SLIIT" /></span>
        <span><strong>CAMPUS <em>RUSH</em></strong><small>SLIIT MALABE</small></span>
      </a>
      <div className="top-actions">
        <span className="personal-best"><Trophy size={17}/><span>BEST <b>{format(best)}</b></span></span>
        <Button className="icon-button" onClick={mute} aria-label={muted?'Turn sound on':'Mute sound'} aria-pressed={!muted}>{muted?<VolumeX size={19}/>:<Volume2 size={19}/>}</Button>
        {(running||view.phase==='paused')&&<Button className="icon-button" onClick={pause} aria-label={running?'Pause game':'Resume game'}>{running?<Pause size={20}/>:<Play size={20}/>}</Button>}
      </div>
    </header>
    <section className="playfield" aria-label="Campus runner game">
      <div className="canvas-host" ref={host}/>
      <div className="vignette"/>
      {view.phase!=='ready'&&<div className="hud" aria-label="Current run">
        <div className="score-panel"><small>SCORE</small><strong>{format(view.score)}</strong><span>{format(view.distance)} m</span></div>
        <div className="right-hud"><div className="coin-panel"><Coins size={23}/><strong>{view.coins}</strong></div>
          <div className={`shield-panel ${view.shield?'active':''}`}><Shield size={17}/>{view.shield?'Shield ready':'Collect a shield'}</div>
        </div>
      </div>}
      <div className="location-pill"><MapPin size={14}/><span>{view.section}</span><i/></div>
      {overlay&&<div className={`overlay ${view.phase==='ready'?'start-overlay':''}`}>
        {view.phase==='ready'&&<div className="start-card">
          <span className="eyebrow"><span/> THE CAMPUS IS YOUR COURSE</span>
          <h1>SLIIT{' '}<br/><em>CAMPUS{' '}<br/>RUSH.</em></h1>
          <p>Run the campus. Beat your best.</p>
          <Button className="primary-button" onClick={start} disabled={!ready||!!error}><Play size={22} fill="currentColor"/>{ready?'LET’S RUN':'LOADING CAMPUS…'}<ArrowRight size={22}/></Button>
          <div className="obstacle-guide"><span><i className="orange"/>Jump barriers</span><span><i className="blue"/>Slide under signs</span><span><i className="red"/>Dodge crates</span></div>
          <div className="keys"><span><kbd>←</kbd><kbd>→</kbd> Move</span><span><kbd>↑</kbd> Jump</span><span><kbd>↓</kbd> Slide</span></div>
          <span className="touch-tip">On a phone? Swipe to move, jump, and slide.</span>
        </div>}
        {view.phase==='paused'&&<div className="result-card"><span className="eyebrow">TAKE A BREATHER</span><h2>Run paused.</h2><p>Your next lecture can wait.</p><Button className="primary-button" onClick={pause}><Play size={20} fill="currentColor"/>KEEP RUNNING</Button><Button className="secondary-button" onClick={start}><RotateCcw size={17}/>Start a fresh run</Button><small>Press P or Esc to resume</small></div>}
        {view.phase==='over'&&<div className="result-card" role="status">
          <span className="eyebrow">{view.score>=best&&view.score>0?'PERSONAL BEST!':'ONE MORE RUN?'}</span>
          <h2>What a rush.</h2><div className="final-score">{format(view.score)}<small>POINTS</small></div>
          <div className="run-stats"><span><Footprints size={19}/><b>{format(view.distance)} m</b></span><span><Coins size={20}/><b>{view.coins} coins</b></span></div>
          <p className="hit-tip">{view.hit==='barrier'?'Jump over the orange barriers.':view.hit==='arch'?'Slide under the blue signs.':'Switch lanes to dodge the crates.'}</p>
          <Button className="primary-button" onClick={start}><RotateCcw size={21}/>RUN AGAIN<ArrowRight size={21}/></Button><small>Your best score stays on this device.</small>
        </div>}
      </div>}
      {error&&<div className="error-card" role="alert"><h2>Let’s get you running.</h2><p>{error}</p><Button className="primary-button" onClick={()=>location.reload()}>TRY AGAIN</Button></div>}
      {running&&<>
        <div className="speed-indicator"><span>PACE</span><div><i style={{width:`${30+(view.speed-16)/14*70}%`}}/></div><b>{(view.speed/16).toFixed(1)}×</b></div>
        <div className="touch-controls" aria-label="Runner controls">
          <Button className="control-button" onClick={()=>command('left')} aria-label="Move left"><ArrowLeft/><span>LEFT</span></Button>
          <Button className="control-button jump-button" onClick={()=>command('jump')} aria-label="Jump"><ArrowUp/><span>JUMP</span></Button>
          <Button className="control-button" onClick={()=>command('slide')} aria-label="Slide"><ArrowDown/><span>SLIDE</span></Button>
          <Button className="control-button" onClick={()=>command('right')} aria-label="Move right"><ArrowRight/><span>RIGHT</span></Button>
        </div>
      </>}
      {view.phase==='ready'&&<div className="course-label"><span>01 / MALABE</span><strong>Your campus.<br/>A whole new pace.</strong><i/></div>}
    </section>
    <footer className="bottom-bar"><span>Created by <b>Manuka Rashen</b></span><a href="https://manuka-rashen.github.io/sliit-campus-explorer/" target="_blank" rel="noreferrer">Explore the campus<ExternalLink size={13}/></a><span className="fan-note">Independent campus game</span></footer>
  </main>;
}
