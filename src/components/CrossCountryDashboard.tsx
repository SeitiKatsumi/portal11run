"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, CheckCircle2, ChevronRight, MapPin, Users, X } from "lucide-react";
import { crossCountryDashboard, type AthleteCount } from "@/lib/cross-country-dashboard";
import { crossCountryBirthRule, crossCountryCategoryBirthRange } from "@/lib/circuit-categories";
import styles from "./CrossCountryDashboard.module.css";

type Props = {
  leads: Parameters<typeof crossCountryDashboard>[0];
  selectedStatus: string;
  hasSearch: boolean;
};

function CountChart({ title, items, total, color, scroll, onSelect }: { title: string; items: AthleteCount[]; total: number; color: string; scroll?: boolean; onSelect?: (category: string) => void }) {
  const largest = Math.max(1, ...items.map((item) => item.count));
  return <section className={styles.chart} aria-label={title}>
    <h3>{title}</h3>
    <p>{onSelect ? "Clique na categoria para ver os inscritos" : "Quantidade de atletas"}</p>
    <ul className={scroll ? styles.cityList : styles.bars} tabIndex={scroll && items.length > 6 ? 0 : undefined} aria-label={scroll ? "Cidades, ordenadas por quantidade de atletas" : undefined}>
      {items.map((item) => {
        const bar = <>
        <div className={styles.barLabel}><span>{item.label}{onSelect ? <ChevronRight size={14} aria-hidden="true" /> : null}</span><span><strong>{item.count}</strong><small>{total ? Math.round(item.count / total * 100) : 0}%</small></span></div>
        {onSelect && crossCountryCategoryBirthRange(item.label) ? <span className={styles.birthRange}>Nascimento: {crossCountryCategoryBirthRange(item.label)}</span> : null}
        <div className={styles.track} aria-hidden="true"><div style={{ width: `${item.count / largest * 100}%`, backgroundColor: color }} /></div>
        </>;
        return <li key={item.label}>{onSelect ? <button type="button" className={styles.categoryButton} onClick={() => onSelect(item.label)} aria-haspopup="dialog" aria-label={`${item.label}: ${item.count} inscritos. Ver por gênero`}>{bar}</button> : bar}</li>;
      })}
    </ul>
  </section>;
}

export function CrossCountryDashboard({ leads, selectedStatus, hasSearch }: Props) {
  const [scope, setScope] = useState("stage");
  const [category, setCategory] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const data = useMemo(() => crossCountryDashboard(scope === "all" ? leads : leads.filter((lead) => lead.pipeline_status === selectedStatus)), [leads, scope, selectedStatus]);
  const athletes = data.athletes.filter((athlete) => athlete.category === category);
  const genderGroups = ["Masculino", "Feminino", ...(athletes.some((athlete) => athlete.gender === "Não informado") ? ["Não informado"] : [])];
  useEffect(() => {
    if (category === null) return;
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, [category]);
  return <section className={styles.dashboard} aria-label="Dashboard das inscrições">
    <div className={styles.header}>
      <div><span className={styles.eyebrow}><BarChart3 size={16} aria-hidden="true" /> Visão das inscrições</span><h2>Atletas em números</h2><p>{scope === "all" ? "Todas as etapas, incluindo declinados" : `Etapa: ${selectedStatus}`}{hasSearch ? " · Busca aplicada" : ""}. Cada inscrição representa um atleta.</p></div>
      <label className={styles.scope}>Exibir no dashboard<select value={scope} onChange={(event) => setScope(event.target.value)}><option value="stage">Etapa selecionada · {selectedStatus}</option><option value="all">Todas as etapas</option></select></label>
    </div>
    <p className={styles.birthRule}>{crossCountryBirthRule}</p>
    <div className={styles.metrics} aria-live="polite">
      <div><Users size={20} aria-hidden="true" /><span>Atletas no recorte<strong>{data.total}</strong></span></div>
      <div><CheckCircle2 size={20} aria-hidden="true" /><span>Inscrições aceitas<strong>{data.accepted}</strong></span></div>
      <div><MapPin size={20} aria-hidden="true" /><span>Cidades informadas<strong>{data.cityCount}</strong></span></div>
    </div>
    {data.total === 0 ? <p className={styles.empty} role="status">Nenhum atleta neste recorte. Altere a busca, a etapa ou selecione todas as etapas.</p> : <div className={styles.charts}>
      <CountChart title="Por categoria" items={data.categories} total={data.total} color="#28614b" onSelect={setCategory} />
      <CountChart title="Por gênero" items={data.genders} total={data.total} color="#397b91" />
      <CountChart title="Por cidade" items={data.cities} total={data.total} color="#b95c20" scroll />
    </div>}
    <dialog ref={dialogRef} className={styles.modal} aria-labelledby="category-modal-title" aria-describedby="category-modal-description" onCancel={() => setCategory(null)} onClose={() => setCategory(null)} onClick={(event) => { if (event.target === event.currentTarget) setCategory(null); }}>
      <div className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <div><span className={styles.eyebrow}>Inscritos por categoria</span><h2 id="category-modal-title">{category}</h2><p id="category-modal-description">{athletes.length} inscritos · {scope === "all" ? "Todas as etapas, incluindo declinados" : `Etapa: ${selectedStatus}`}{hasSearch ? " · Busca aplicada" : ""}</p></div>
          <button type="button" className={styles.closeButton} onClick={() => setCategory(null)} aria-label="Fechar inscritos"><X size={22} aria-hidden="true" /></button>
        </header>
        {category && crossCountryCategoryBirthRange(category) ? <p className={styles.birthRule}><strong>Nascimento: {crossCountryCategoryBirthRange(category)}.</strong> {crossCountryBirthRule}</p> : null}
        <div className={styles.genderGroups}>
          {genderGroups.map((gender) => {
            const group = athletes.filter((athlete) => athlete.gender === gender);
            return <section className={styles.genderGroup} key={gender} aria-label={gender === "Não informado" ? "Gênero não informado" : gender}>
              <h3>{gender === "Não informado" ? "Gênero não informado" : gender}<span>{group.length}</span></h3>
              {group.length ? <ol>{group.map((athlete) => <li key={athlete.id}><strong>{athlete.name}</strong><small>{athlete.city === "Não informado" ? "Cidade não informada" : athlete.city}</small></li>)}</ol> : <p className={styles.groupEmpty}>Nenhum inscrito neste grupo.</p>}
            </section>;
          })}
        </div>
      </div>
    </dialog>
  </section>;
}
