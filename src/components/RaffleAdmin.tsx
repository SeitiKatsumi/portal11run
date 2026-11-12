"use client";

import { Gift, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { RafflePrize, RaffleStats } from "@/lib/raffle";
import styles from "@/app/admin/sorteio/raffle-admin.module.css";

export function RaffleAdmin({ initialPrizes, initialStats }: { initialPrizes: RafflePrize[]; initialStats: RaffleStats }) {
  const [prizes, setPrizes] = useState(initialPrizes);
  const [stats, setStats] = useState(initialStats);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/sorteio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data.entries())) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível cadastrar o prêmio.");
      setPrizes(json.prizes); setStats(json.stats); form.reset();
      setMessage("Prêmio cadastrado e associado a um número aleatório.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível cadastrar o prêmio."); }
    finally { setBusy(false); }
  }

  async function remove(prize: RafflePrize) {
    if (!window.confirm(`Remover o prêmio “${prize.name}” do sorteio?`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/sorteio?id=${encodeURIComponent(prize.id)}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível remover o prêmio.");
      setPrizes(json.prizes); setStats(json.stats); setMessage("Prêmio removido.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível remover o prêmio."); }
    finally { setBusy(false); }
  }

  return <section className={`${styles.panel} admin-panel`}>
    <header className={styles.header}><div><span className="eyebrow">roleta surpresa</span><h1>Sorteio e premiações</h1><p>Cadastre cada prêmio. O sistema escolhe um número livre entre 0001 e 1000 e mantém essa associação em segredo na página pública.</p></div><a href="/sorteio" target="_blank" rel="noreferrer">Abrir roleta</a></header>
    <div className={styles.metrics}><article><strong>{stats.prizes}</strong><span>prêmios cadastrados</span></article><article><strong>{stats.claimed}</strong><span>prêmios entregues</span></article><article><strong>{stats.plays}</strong><span>números participantes</span></article></div>
    {message ? <p className={styles.success} role="status">{message}</p> : null}{error ? <p className={styles.error} role="alert">{error}</p> : null}
    <form className={styles.form} onSubmit={submit}><label><span>Nome do prêmio</span><input name="name" required maxLength={100} placeholder="Ex.: 1 camiseta 11RUN" /></label><label><span>Descrição para o vencedor</span><input name="description" maxLength={220} placeholder="Ex.: Retire com a equipe no evento" /></label><button type="submit" disabled={busy}><Plus size={17} />Cadastrar e sortear número</button></form>
    <div className={styles.list}>{prizes.length ? prizes.map((prize) => <article key={prize.id}><span className={styles.icon}><Gift size={19} /></span><div><strong>{prize.name}</strong><p>{prize.description || "Sem descrição adicional."}</p></div><span className={styles.number}>{String(prize.winning_number).padStart(4, "0")}</span><span className={`${styles.badge} ${prize.claimed_at ? styles.claimed : ""}`}>{prize.claimed_at ? "Entregue" : "Escondido"}</span><button type="button" onClick={() => remove(prize)} disabled={busy || Boolean(prize.claimed_at)} aria-label={`Remover ${prize.name}`}><Trash2 size={17} /></button></article>) : <p className={styles.empty}>Nenhum prêmio cadastrado. A roleta já funciona, mas nenhum número será premiado até o primeiro cadastro.</p>}</div>
  </section>;
}
