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
  <div><span className={styles.kicker}>1.000 metros, sem atalhos</span><h3>Na pista, a distância vem das marcações. Não do GPS.</h3><p>{CIRCUIT_TRACK_RULE}</p><p><strong>Largue na marca dos 200 m da raia 1 e termine na linha de chegada da reta dos 100 m. Corra sempre na raia 1.</strong> Confirme essas marcações com o responsável pelo local. Correr 2,5 voltas em uma raia externa não representa a mesma distância.</p></div>
  <figure className={styles.figure}>
   <svg viewBox="0 0 780 530" role="img" aria-label="Pista de 400 metros com oito raias. Largada na marca dos 200 metros da raia 1, sentido anti-horário, chegada ao final da reta dos 100 metros após duas voltas e meia, totalizando 1.000 metros.">
    {/* Nine boundaries form eight lanes; the orange path stays inside lane one. */}
    {Array.from({length:9},(_,i)=>{const radius=110+i*12;return <rect data-lane-boundary={i} key={i} x={230-radius} y={240-radius} width={300+2*radius} height={2*radius} rx={radius} fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".28"/>;})}
    {/* Sprint chute extends before the bend tangent and beyond the common finish. */}
    {Array.from({length:9},(_,i)=><path key={i} d={`M 198 ${350+i*12} H 650`} fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".28"/>)}
    <path d="M 198 350 V 446 M 650 350 V 446" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".28"/>
    <path ref={path} d="M 230 124 A 116 116 0 0 0 230 356 H 530 A 116 116 0 0 0 530 124 H 230" fill="none" stroke="#f97316" strokeWidth="4"/>
    <path d="M 350 119 L 340 124 L 350 129 M 390 351 L 400 356 L 390 361 M 119 235 L 114 245 L 109 235" fill="none" stroke="#f97316" strokeWidth="3"/>
    <path d="M 230 112 V 136" stroke="#f97316" strokeWidth="4"/>
    <path d="M 530 348 V 448" stroke="currentColor" strokeWidth="3"/>
    <path d="M 230 104 V 60 H 290" fill="none" stroke="#f97316" strokeWidth="1.5"/>
    <text x="298" y="58" className={styles.trackLabel}>Largada · 200 m / raia 1</text>
    <text x="380" y="225" textAnchor="middle" className={styles.distance}>{meters.toLocaleString('pt-BR')} m</text>
    <text x="380" y="254" textAnchor="middle">{meters===1000?'2 voltas e meia completas':meters<400?'1ª volta':meters<800?'2ª volta':'Última meia volta'}</text>
    <text x="380" y="291" textAnchor="middle" className={styles.laneLabel}>RAIA 1 · siga a linha laranja</text>
    {Array.from({length:8},(_,i)=><text data-lane-number={i+1} key={i} x="551" y={360+i*12} className={styles.laneNumber}>{i+1}</text>)}
    <path d="M 198 458 V 469 H 530 V 458 M 204 465 L 198 469 L 204 473 M 524 465 L 530 469 L 524 473" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <text x="350" y="493" textAnchor="middle" className={styles.trackLabel}>Reta dos 100 m</text>
    <text x="535" y="514" className={styles.trackLabel}>Chegada oficial</text>
    <path d="M 535 498 L 530 477" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle ref={runner} cx="230" cy="124" r="7" fill="#f97316" stroke="white" strokeWidth="3"/>
   </svg>
   <p className={styles.laneNotice}><strong>8 raias. Corra somente na raia 1.</strong> A extensão da reta dos 100 m serve como referência visual; a animação percorre o oval.</p>
   <div className={styles.steps}><span data-done={meters>=400}>1ª volta <b>400 m</b></span><span data-done={meters>=800}>2ª volta <b>+ 400 m</b></span><span data-done={meters===1000}>Meia volta <b>+ 200 m</b></span></div>
   <label className={styles.slider}>Explore o percurso<input type="range" min="0" max="1000" step="4" value={meters} onChange={e=>{setPlaying(false);setMeters(Number(e.target.value));}} aria-valuetext={`${meters} metros de 1.000 metros`}/></label>
   <div className={styles.controls}><button type="button" onClick={()=>{if(meters===1000)setMeters(0);setPlaying(p=>!p);}}>{playing?'Pausar animação':meters===1000?'Rever animação':'Animar 2,5 voltas'}</button><button type="button" onClick={()=>{setPlaying(false);setMeters(0);}}>Reiniciar</button></div>
   <figcaption>Ilustração esquemática de oito raias, com a raia 1 destacada. A animação explica a distância; não representa o tempo de corrida nem substitui as marcações oficiais.</figcaption>
  </figure>
 </div>;
}
