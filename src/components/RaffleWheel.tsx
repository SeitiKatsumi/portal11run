"use client";

import { Gift, RotateCw, Sparkles, TicketCheck } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { RaffleStats } from "@/lib/raffle";
import styles from "@/app/sorteio/sorteio.module.css";

type DrawResult = { number: string; won: boolean; prize: { name: string; description: string } | null };

export function RaffleWheel({ initialStats }: { initialStats: RaffleStats }) {
  const [number, setNumber] = useState("");
  const [phase, setPhase] = useState<"idle" | "checking" | "spinning" | "result">("idle");
  const [result, setResult] = useState<DrawResult | null>(null);
  const [stats, setStats] = useState(initialStats);
  const [error, setError] = useState("");
  const [turn, setTurn] = useState(1440);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function draw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(number) || Number(number) < 1 || Number(number) > 1000) {
      setError("Digite um número válido entre 0001 e 1000.");
      return;
    }
    setPhase("checking");
    try {
      const response = await fetch("/api/sorteio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível realizar o sorteio.");
      setResult(json.result);
      setStats(json.stats);
      setTurn(1440 + Math.floor(Math.random() * 330));
      setPhase("spinning");
      timer.current = setTimeout(() => setPhase("result"), 3300);
    } catch (caught) {
      setPhase("idle");
      setError(caught instanceof Error ? caught.message : "Não foi possível realizar o sorteio.");
    }
  }

  function again() {
    setNumber("");
    setResult(null);
    setError("");
    setPhase("idle");
  }

  const busy = phase === "checking" || phase === "spinning";

  return (
    <section className={styles.experience} aria-labelledby="raffle-title">
      <div className={styles.copy}>
        <span className="eyebrow"><Sparkles size={14} /> experiência surpresa 11RUN</span>
        <h1 id="raffle-title">Seu número.<br />Sua surpresa.</h1>
        <p>Digite os quatro números da sua pulseira. Cada número participa uma única vez e pode revelar um prêmio especial.</p>
        <div className={styles.rules}>
          <span><TicketCheck size={18} /> Válido de 0001 a 1000</span>
          <span><RotateCw size={18} /> Uma tentativa por número</span>
          <span><Gift size={18} /> Prêmios definidos antes do giro</span>
        </div>
      </div>

      <div className={styles.game}>
        <div className={styles.pointer} aria-hidden="true" />
        <div className={`${styles.wheel} ${phase === "spinning" ? styles.spinning : ""}`} key={`${phase}-${turn}`} style={{ "--wheel-turn": `${turn}deg` } as CSSProperties} aria-hidden="true">
          <svg viewBox="0 0 120 120" role="img" aria-label="Roleta de prêmios">
            {Array.from({ length: 12 }, (_, index) => (
              <circle key={index} cx="60" cy="60" r="48" pathLength="12" fill="none" stroke={index % 2 ? "#292929" : "#ed6509"} strokeWidth="48" strokeDasharray="0.92 11.08" strokeDashoffset={-index} />
            ))}
            <circle cx="60" cy="60" r="24" fill="#fff" stroke="#d9d9d5" strokeWidth="1" />
          </svg>
          <span className={styles.wheelHub}><Gift size={34} strokeWidth={1.5} /></span>
        </div>

        {phase === "result" && result ? (
          <div className={`${styles.result} ${result.won ? styles.winner : ""}`} aria-live="polite">
            <span>{result.won ? "Você ganhou!" : "Número revelado"}</span>
            <strong>{result.won ? result.prize?.name : "Não foi desta vez"}</strong>
            <p>{result.won ? result.prize?.description || "Apresente esta tela à equipe 11RUN para retirar seu prêmio." : "Continue correndo com a gente. Novas surpresas virão."}</p>
            <small>Número {result.number}</small>
            <button type="button" onClick={again}>Sortear outro número</button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={draw}>
            <label htmlFor="raffle-number">Número da pulseira</label>
            <input id="raffle-number" value={number} onChange={(event) => setNumber(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="off" placeholder="0001" maxLength={4} disabled={busy} aria-describedby="raffle-help" />
            <small id="raffle-help">Use exatamente quatro dígitos.</small>
            <button type="submit" disabled={busy}>{phase === "checking" ? "Validando número…" : phase === "spinning" ? "Girando…" : "Girar a roleta"}</button>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
          </form>
        )}
      </div>

      <footer className={styles.status} aria-label="Status do sorteio">
        <span><strong>{stats.plays}</strong> números já participaram</span>
        <span><strong>{stats.prizes - stats.claimed}</strong> prêmios ainda escondidos</span>
      </footer>
    </section>
  );
}
