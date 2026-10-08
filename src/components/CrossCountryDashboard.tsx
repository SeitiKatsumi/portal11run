"use client";

import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, MapPin, Users } from "lucide-react";
import { crossCountryDashboard, type AthleteCount } from "@/lib/cross-country-dashboard";
import styles from "./CrossCountryDashboard.module.css";

type Props = {
  leads: Parameters<typeof crossCountryDashboard>[0];
  selectedStatus: string;
  hasSearch: boolean;
};

function CountChart({ title, items, total, color, scroll }: { title: string; items: AthleteCount[]; total: number; color: string; scroll?: boolean }) {
  const largest = Math.max(1, ...items.map((item) => item.count));
  return <section className={styles.chart} aria-label={title}>
    <h3>{title}</h3>
    <p>Quantidade de atletas</p>
    <ul className={scroll ? styles.cityList : styles.bars} tabIndex={scroll && items.length > 6 ? 0 : undefined} aria-label={scroll ? "Cidades, ordenadas por quantidade de atletas" : undefined}>
      {items.map((item) => <li key={item.label}>
        <div className={styles.barLabel}><span>{item.label}</span><span><strong>{item.count}</strong><small>{total ? Math.round(item.count / total * 100) : 0}%</small></span></div>
        <div className={styles.track} aria-hidden="true"><div style={{ width: `${item.count / largest * 100}%`, backgroundColor: color }} /></div>
      </li>)}
    </ul>
  </section>;
}

export function CrossCountryDashboard({ leads, selectedStatus, hasSearch }: Props) {
  const [scope, setScope] = useState("stage");
  const data = useMemo(() => crossCountryDashboard(scope === "all" ? leads : leads.filter((lead) => lead.pipeline_status === selectedStatus)), [leads, scope, selectedStatus]);
  return <section className={styles.dashboard} aria-label="Dashboard das inscrições">
    <div className={styles.header}>
      <div><span className={styles.eyebrow}><BarChart3 size={16} aria-hidden="true" /> Visão das inscrições</span><h2>Atletas em números</h2><p>{scope === "all" ? "Todas as etapas, incluindo declinados" : `Etapa: ${selectedStatus}`}{hasSearch ? " · Busca aplicada" : ""}. Cada inscrição representa um atleta.</p></div>
      <label className={styles.scope}>Exibir no dashboard<select value={scope} onChange={(event) => setScope(event.target.value)}><option value="stage">Etapa selecionada · {selectedStatus}</option><option value="all">Todas as etapas</option></select></label>
    </div>
    <div className={styles.metrics} aria-live="polite">
      <div><Users size={20} aria-hidden="true" /><span>Atletas no recorte<strong>{data.total}</strong></span></div>
      <div><CheckCircle2 size={20} aria-hidden="true" /><span>Inscrições aceitas<strong>{data.accepted}</strong></span></div>
      <div><MapPin size={20} aria-hidden="true" /><span>Cidades informadas<strong>{data.cityCount}</strong></span></div>
    </div>
    {data.total === 0 ? <p className={styles.empty} role="status">Nenhum atleta neste recorte. Altere a busca, a etapa ou selecione todas as etapas.</p> : <div className={styles.charts}>
      <CountChart title="Por categoria" items={data.categories} total={data.total} color="#28614b" />
      <CountChart title="Por gênero" items={data.genders} total={data.total} color="#397b91" />
      <CountChart title="Por cidade" items={data.cities} total={data.total} color="#b95c20" scroll />
    </div>}
  </section>;
}
