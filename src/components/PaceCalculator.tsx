"use client";

import { Activity, Gauge, RotateCcw, Route, Timer, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { calculatePace, formatClock, parseClock, passageDistances, timeAtDistance } from "@/lib/pace-calculator";
import styles from "@/app/referencias/calculadoras/pace/pace.module.css";

const presets = [800, 1000, 1500, 3000, 5000, 10000, 21097.5, 42195];
const names: Record<number, string> = { 21097.5: "Meia maratona", 42195: "Maratona" };

export function PaceCalculator() {
  const [mode, setMode] = useState<"time" | "pace">("time");
  const [distance, setDistance] = useState(5000);
  const [time, setTime] = useState("15:00");
  const [pace, setPace] = useState("3:00");
  const [track, setTrack] = useState(400);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingDistance = Number(params.get("distancia"));
    const incomingTime = params.get("tempo");
    if (Number.isFinite(incomingDistance) && incomingDistance >= 50 && incomingDistance <= 100000 && incomingTime && parseClock(incomingTime) > 0) {
      setDistance(incomingDistance); setTime(incomingTime); setMode("time");
    }
  }, []);

  const result = useMemo(() => {
    const secondsPerKm = mode === "time" ? calculatePace(distance, parseClock(time))?.secondsPerKm ?? 0 : parseClock(pace);
    const totalSeconds = timeAtDistance(secondsPerKm, distance);
    return { secondsPerKm, totalSeconds, metrics: calculatePace(distance, totalSeconds) };
  }, [distance, mode, pace, time]);
  const valid = result.secondsPerKm > 0 && distance > 0;
  const splits = passageDistances.filter((meters) => meters <= distance);
  const fullLaps = Math.floor(distance / track);
  const remainder = distance - fullLaps * track;

  return <>
    <section className={styles.calculator} aria-label="Calculadora de pace e tempo">
      <div className={styles.modeSwitch} role="group" aria-label="O que deseja calcular?">
        <button className={mode === "time" ? styles.active : ""} onClick={() => setMode("time")}>Tenho tempo final</button>
        <button className={mode === "pace" ? styles.active : ""} onClick={() => setMode("pace")}>Tenho ritmo por km</button>
      </div>
      <div className={styles.inputs}>
        <label><span>Distância-alvo</span><div><input type="number" min="50" step="50" value={distance} onChange={(e) => setDistance(Number(e.target.value))}/><b>m</b></div></label>
        {mode === "time" ? <label><span>Tempo final</span><input inputMode="decimal" value={time} onChange={(e) => setTime(e.target.value)} placeholder="15:00"/><small>hh:mm:ss ou mm:ss</small></label> : <label><span>Ritmo desejado</span><input inputMode="decimal" value={pace} onChange={(e) => setPace(e.target.value)} placeholder="3:00"/><small>min/km</small></label>}
        <label><span>Tamanho da pista</span><div><select value={track} onChange={(e) => setTrack(Number(e.target.value))} aria-label="Tamanho da pista" style={{width:"100%",height:58,padding:"0 16px",border:"1px solid var(--line)",borderRadius:16,background:"var(--bg)",color:"var(--text)",font:"500 1.05rem/1 inherit",cursor:"pointer"}}><option value={400}>400 m · pista padrão</option><option value={200}>200 m</option><option value={100}>100 m</option></select></div><small>Escolha somente entre 400, 200 ou 100 metros.</small></label>
      </div>
      <div className={styles.presets}>{presets.map((item) => <button key={item} onClick={() => setDistance(item)} className={distance === item ? styles.selected : ""}>{names[item] ?? `${item.toLocaleString("pt-BR")} m`}</button>)}</div>
      <div className={styles.results}>
        <article><Timer/><span>Tempo projetado</span><strong>{valid ? formatClock(result.totalSeconds, true) : "—"}</strong><small>para {distance.toLocaleString("pt-BR")} m</small></article>
        <article><Activity/><span>Ritmo médio</span><strong>{valid ? formatClock(result.secondsPerKm) : "—"}</strong><small>min/km</small></article>
        <article><Gauge/><span>Velocidade média</span><strong>{valid ? result.metrics?.speedKmh.toFixed(2).replace(".", ",") : "—"}</strong><small>km/h</small></article>
        <article><Zap/><span>Ritmo por milha</span><strong>{valid ? formatClock(result.metrics?.secondsPerMile ?? 0) : "—"}</strong><small>min/milha</small></article>
      </div>
    </section>

    <section className={styles.section}>
      <header><div><span>Parciais acumuladas</span><h2>Onde o relógio deve marcar.</h2></div><p>Tempos ideais em ritmo constante. Na prática, vento, curva, terreno e estratégia podem alterar pequenas passagens.</p></header>
      <div className={styles.splitGrid}>{splits.map((meters) => <article key={meters}><span>{meters.toLocaleString("pt-BR")} m</span><strong>{valid ? formatClock(timeAtDistance(result.secondsPerKm, meters), true) : "—"}</strong><small>{Math.round(meters / track * 100) / 100} volta{meters / track === 1 ? "" : "s"}</small></article>)}</div>
    </section>

    <section className={styles.trackSection}>
      <div className={styles.trackCopy}><span>Plano de pista</span><h2>{distance.toLocaleString("pt-BR")} m em {valid ? formatClock(result.totalSeconds, true) : "—"}</h2><p>Em uma pista de {track} m, são {fullLaps} voltas completas{remainder ? ` e mais ${remainder.toLocaleString("pt-BR")} m` : ""}. A referência por volta é <strong>{valid ? formatClock(timeAtDistance(result.secondsPerKm, track), true) : "—"}</strong>.</p><div><Route/><span>Por 100 m<strong>{valid ? formatClock(timeAtDistance(result.secondsPerKm, 100), true) : "—"}</strong></span><RotateCcw/><span>Por volta<strong>{valid ? formatClock(timeAtDistance(result.secondsPerKm, track), true) : "—"}</strong></span></div></div>
      <div className={styles.laps}>{Array.from({length: Math.min(fullLaps, 30)}, (_, i) => i + 1).map((lap) => <article key={lap}><span>Volta {lap}</span><strong>{formatClock(timeAtDistance(result.secondsPerKm, lap * track), true)}</strong><small>parcial {formatClock(timeAtDistance(result.secondsPerKm, track), true)}</small></article>)}{remainder ? <article className={styles.final}><span>Trecho final · {remainder} m</span><strong>{formatClock(result.totalSeconds, true)}</strong><small>chegada</small></article> : null}</div>
    </section>
  </>;
}
