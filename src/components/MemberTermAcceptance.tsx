"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { onzeFuturoTerm } from "@/lib/onze-futuro-policy";

export function MemberTermAcceptance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/members/term-acceptance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        acceptorName: data.get("acceptorName"),
        acceptorCpf: data.get("acceptorCpf"),
        accepted: data.get("accepted") === "on"
      })
    });
    const result = await response.json() as { ok: boolean; error?: string };
    if (!result.ok) { setError(result.error || "Não foi possível registrar o aceite."); setLoading(false); return; }
    window.location.reload();
  }

  return <main className="members-dashboard member-term-gate">
    <section className="terms-box member-term-card">
      <div className="terms-heading"><ShieldCheck size={28}/><div>
        <span>Atualização obrigatória</span>
        <h1>{onzeFuturoTerm.title}</h1>
        <p>Versão {onzeFuturoTerm.version}. Leia com atenção antes de continuar no painel.</p>
      </div></div>
      <aside>{onzeFuturoTerm.legalNotice}</aside>
      <ol>{onzeFuturoTerm.clauses.map((clause)=><li key={clause}>{clause}</li>)}</ol>
      <form onSubmit={submit}>
        <div className="form-grid"><label><span>Nome completo do responsável</span><input name="acceptorName" required minLength={3}/></label>
        <label><span>CPF do responsável</span><input name="acceptorCpf" inputMode="numeric" placeholder="000.000.000-00" required/></label></div>
        <label className="accept"><input name="accepted" type="checkbox" required/><span>Li, compreendi e aceito integralmente este termo e a <Link href="/politica-de-privacidade" target="_blank">Política de Privacidade</Link>.</span></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="button primary" disabled={loading}>{loading ? <Loader2 className="spin"/> : <ShieldCheck/>}{loading ? "Registrando…" : "Aceitar e acessar o painel"}</button>
      </form>
    </section>
  </main>;
}
