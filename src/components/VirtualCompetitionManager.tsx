"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Plus, UserPlus } from "lucide-react";
import { CompetitionAdmin } from "./CompetitionAdmin";
import styles from "./VirtualCompetitionManager.module.css";

type Edition = { id: string; title: string; event_date: string; location: string; status: string };
type ApiState = { editions: Edition[]; selectedId: string | null };

export function VirtualCompetitionManager() {
  const [data, setData] = useState<ApiState>({ editions: [], selectedId: null });
  const [selectedId, setSelectedId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [edition, setEdition] = useState({ title: "", location: "", eventDate: new Date().toISOString().slice(0, 10) });
  const [athlete, setAthlete] = useState({ name: "", age: "9", gender: "", city: "" });

  async function load(competitionId?: string) {
    const query = competitionId ? `?competition_id=${encodeURIComponent(competitionId)}` : "";
    const response = await fetch(`/api/admin/virtual-competitions${query}`, { cache: "no-store" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Não foi possível carregar as edições.");
    setData(json);
    setSelectedId(json.selectedId ?? "");
  }

  useEffect(() => { load().catch((caught) => setError(caught.message)); }, []);

  async function submit(action: "create_edition" | "register_athlete", payload: Record<string, unknown>) {
    setBusy(action); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/admin/virtual-competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível salvar.");
      setData(json); setSelectedId(json.selectedId ?? ""); setRefreshKey((value) => value + 1);
      if (action === "create_edition") {
        setEdition((current) => ({ ...current, title: "", location: "" }));
        setSuccess("Edição criada. Agora cadastre os atletas que chegaram ao local.");
      } else {
        setAthlete((current) => ({ ...current, name: "", city: "" }));
        setSuccess(`${json.result.name} cadastrado como ${json.result.category}, número ${json.result.bib}.`);
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível salvar."); }
    finally { setBusy(""); }
  }

  const selected = data.editions.find((item) => item.id === selectedId);

  return <div className={styles.stack}>
    <section className={styles.hero}>
      <span className="eyebrow">desafio virtual · competição presencial</span>
      <h1>Edições rápidas, resultados na hora.</h1>
      <p>Crie a edição, cadastre quem chegou e use a mesma largada com classificação automática por categoria e gênero.</p>
    </section>

    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    {success ? <p className={styles.success} role="status">{success}</p> : null}

    <section className={styles.setup} aria-labelledby="new-edition-title">
      <header><div><span className="eyebrow">1 · edição</span><h2 id="new-edition-title">Onde e quando será a disputa?</h2></div></header>
      <form onSubmit={(event) => { event.preventDefault(); submit("create_edition", edition); }} className={styles.formGrid}>
        <label className={styles.wide}>Nome da edição<input required maxLength={120} value={edition.title} onChange={(event) => setEdition({ ...edition, title: event.target.value })} placeholder="Ex.: Desafio Virtual Campinas · Novembro" /></label>
        <label><MapPin size={15} />Local<input required maxLength={160} value={edition.location} onChange={(event) => setEdition({ ...edition, location: event.target.value })} placeholder="Cidade, pista ou evento" /></label>
        <label><CalendarDays size={15} />Data<input required type="date" value={edition.eventDate} onChange={(event) => setEdition({ ...edition, eventDate: event.target.value })} /></label>
        <button type="submit" disabled={Boolean(busy)}><Plus size={17} />Criar edição</button>
      </form>
    </section>

    {data.editions.length ? <section className={styles.setup} aria-labelledby="athlete-title">
      <header className={styles.editionHeader}><div><span className="eyebrow">2 · cadastro no local</span><h2 id="athlete-title">Cadastre e numere o atleta.</h2></div><label>Edição<select value={selectedId} onChange={(event) => { const id = event.target.value; setSelectedId(id); load(id).catch((caught) => setError(caught.message)); }}>{data.editions.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.event_date.split("-").reverse().join("/")}</option>)}</select></label></header>
      {selected ? <p className={styles.editionMeta}><MapPin size={15} />{selected.location}<CalendarDays size={15} />{selected.event_date.split("-").reverse().join("/")}</p> : null}
      <form onSubmit={(event) => { event.preventDefault(); submit("register_athlete", { competitionId: selectedId, ...athlete }); }} className={styles.formGrid}>
        <label className={styles.wide}>Nome completo<input required maxLength={120} value={athlete.name} onChange={(event) => setAthlete({ ...athlete, name: event.target.value })} placeholder="Nome do atleta" /></label>
        <label>Idade / categoria<select value={athlete.age} onChange={(event) => setAthlete({ ...athlete, age: event.target.value })}>{[9, 10, 11, 12, 13].map((age) => <option key={age} value={age}>{age} anos · Sub {age + 1}</option>)}</select></label>
        <label>Gênero esportivo<select required value={athlete.gender} onChange={(event) => setAthlete({ ...athlete, gender: event.target.value })}><option value="">Selecione</option><option>Feminino</option><option>Masculino</option></select></label>
        <label>Cidade (opcional)<input maxLength={120} value={athlete.city} onChange={(event) => setAthlete({ ...athlete, city: event.target.value })} placeholder="Usa o local da edição se vazio" /></label>
        <button type="submit" disabled={Boolean(busy) || !selectedId}><UserPlus size={17} />Cadastrar atleta</button>
      </form>
    </section> : null}

    {selectedId ? <CompetitionAdmin key={`${selectedId}-${refreshKey}`} competitionId={selectedId} mode="virtual" /> : <section className={styles.empty}><h2>Crie a primeira edição.</h2><p>A operação da largada aparecerá aqui.</p></section>}
  </div>;
}
