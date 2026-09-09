"use client";
import {useEffect,useRef,useState} from 'react';
import {CIRCUIT_TRACK_RULE} from '@/lib/virtual-circuit-schedule';
import styles from './CircuitTrackGuide.module.css';

export function CircuitTrackGuide(){
 const [meters,setMeters]=useState(0);
 const [playing,setPlaying]=useState(false);
 const path=useRef<SVGPathElement>(null);
 const runner=useRef<SVGCircleElement>(null);
 useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setMeters(m=>Math.min(1000,m+4)),40);return()=>clearInterval(timer);},[playing]);
 useEffect(()=>{if(meters===1000)setPlaying(false);if(path.current&&runner.current){const p=path.current.getPointAtLength(path.current.getTotalLength()*(meters%400)/400);runner.current.setAttribute('cx',String(p.x));runner.current.setAttribute('cy',String(p.y));}},[meters]);
 return <div className={styles.guide}>
  <div><span className={styles.kicker}>1.000 metros, sem atalhos</span><h3>Na pista, a distância vem das marcações. Não do GPS.</h3><p>{CIRCUIT_TRACK_RULE}</p><p><strong>Use a largada oficial dos 1.000 m e a linha de chegada da pista.</strong> Confirme essas marcações com o responsável pelo local. Correr 2,5 voltas em uma raia externa não representa a mesma distância.</p></div>
  <figure className={styles.figure}>
   <svg viewBox="0 0 580 320" role="img" aria-label="Pista de 400 metros: duas voltas completas de 400 metros e mais 200 metros até a chegada, totalizando 1.000 metros.">
    <rect x="58" y="48" width="464" height="204" rx="102" fill="none" stroke="currentColor" strokeWidth="2" opacity=".18"/>
    <rect x="70" y="60" width="440" height="180" rx="90" fill="none" stroke="currentColor" strokeWidth="2" opacity=".18"/>
    <path ref={path} d="M 170 230 H 410 A 80 80 0 0 0 410 70 H 170 A 80 80 0 0 0 170 230" fill="none" stroke="#f97316" strokeWidth="4"/>
    <path d="M 275 225 L 285 230 L 275 235 M 305 65 L 295 70 L 305 75" fill="none" stroke="#f97316" strokeWidth="3"/>
    <path d="M170 216 V254 M410 46 V84" stroke="currentColor" strokeWidth="3"/>
    <text x="170" y="279" textAnchor="middle">Largada · 1.000 m</text><text x="410" y="30" textAnchor="middle">Chegada</text>
    <text x="290" y="148" textAnchor="middle" className={styles.distance}>{meters.toLocaleString('pt-BR')} m</text>
    <text x="290" y="176" textAnchor="middle">{meters===1000?'2 voltas e meia completas':meters<400?'1ª volta':meters<800?'2ª volta':'Última meia volta'}</text>
    <circle ref={runner} cx="170" cy="230" r="9" fill="#f97316" stroke="white" strokeWidth="3"/>
   </svg>
   <div className={styles.steps}><span data-done={meters>=400}>1ª volta <b>400 m</b></span><span data-done={meters>=800}>2ª volta <b>+ 400 m</b></span><span data-done={meters===1000}>Meia volta <b>+ 200 m</b></span></div>
   <label className={styles.slider}>Explore o percurso<input type="range" min="0" max="1000" step="4" value={meters} onChange={e=>{setPlaying(false);setMeters(Number(e.target.value));}} aria-valuetext={`${meters} metros de 1.000 metros`}/></label>
   <div className={styles.controls}><button type="button" onClick={()=>{if(meters===1000)setMeters(0);setPlaying(p=>!p);}}>{playing?'Pausar animação':meters===1000?'Rever animação':'Animar 2,5 voltas'}</button><button type="button" onClick={()=>{setPlaying(false);setMeters(0);}}>Reiniciar</button></div>
   <figcaption>Ilustração esquemática da raia 1. A animação explica a distância; não representa o tempo de corrida nem substitui as marcações oficiais.</figcaption>
  </figure>
 </div>;
}
