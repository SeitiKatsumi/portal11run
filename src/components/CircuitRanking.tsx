"use client";

import { Banknote, Footprints, Search, Shirt, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./CircuitUI.module.css";

type Period = "total" | "monthly" | "quarterly";
type Rank = { id:string;position:number;categoryPosition:number;publicName:string;categoryAge:number;gender:string;city:string;state:string;formattedTime:string;activityDate:string;badge:string };

const monthOptions = [
  ["2026-07", "Julho de 2026"],
  ["2026-08", "Agosto de 2026"],
  ["2026-09", "Setembro de 2026"],
  ["2026-10", "Outubro de 2026"],
  ["2026-11", "Novembro de 2026"],
  ["2026-12", "Dezembro de 2026"]
] as const;

const quarterOptions = [
  ["2026-07-01|2026-09-30", "1º ciclo · 01/07 a 30/09"],
  ["2026-10-01|2026-12-15", "2º ciclo · 01/10 a 15/12"]
] as const;

function periodDates(period: Period, selection: string) {
  if (period === "total") return {};
  if (period === "quarterly") {
    const [start, end] = selection.split("|");
    return { start, end };
  }
  const [year, month] = selection.split("-").map(Number);
  const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { start: `${selection}-01`, end: `${selection}-${String(endDay).padStart(2, "0")}` };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T12:00:00Z`));
}

function PrizeIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return <span className={styles.prizeIcon} data-tooltip={label} aria-label={label} tabIndex={0}>{children}</span>;
}

function CurrentPrizes({ period, position }: { period: Period; position: number }) {
  const prizes: Array<{ label: string; icon: React.ReactNode }> = [];
  if (period === "monthly" && position === 1) {
    prizes.push({ label: "Até o momento, está ganhando uma camiseta 11Run neste mês.", icon: <Shirt size={16} /> });
  }
  if (period === "quarterly") {
    if (position === 1) prizes.push({ label: "Até o momento, está ganhando um par de tênis neste ciclo.", icon: <Footprints size={16} /> });
    if (position <= 3) prizes.push({ label: "Até o momento, está ganhando uma camiseta 11Run neste ciclo.", icon: <Shirt size={16} /> });
  }
  if (period === "total") {
    if (position === 1) {
      prizes.push({ label: "Até o momento, está ganhando R$ 500,00 como líder da categoria.", icon: <Banknote size={16} /> });
      prizes.push({ label: "Até o momento, está ganhando um par de tênis.", icon: <Footprints size={16} /> });
      prizes.push({ label: "Até o momento, está ganhando o Troféu 11Run.", icon: <Trophy size={16} /> });
    }
    if (position <= 10) prizes.push({ label: "Até o momento, está entre os dez ganhadores de camiseta 11Run.", icon: <Shirt size={16} /> });
  }
  return <div className={styles.prizeIcons}>{prizes.map(prize => <PrizeIcon key={prize.label} label={prize.label}>{prize.icon}</PrizeIcon>)}</div>;
}

export function CircuitRanking(){
  const [filters,setFilters]=useState({age:"",gender:"",state:"",name:""});
  const [period,setPeriod]=useState<Period>("total");
  const [periodSelection,setPeriodSelection]=useState("2026-07");
  const [ranking,setRanking]=useState<Rank[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    const dates=periodDates(period,periodSelection);
    const query=new URLSearchParams(Object.entries({...filters,...dates}).filter(([,value])=>value));
    setLoading(true);
    fetch(`/api/circuito-virtual/ranking?${query}`).then(r=>r.json()).then(r=>setRanking(r.ranking||[])).finally(()=>setLoading(false));
  },[filters,period,periodSelection]);

  function selectPeriod(nextPeriod: Period) {
    setPeriod(nextPeriod);
    setPeriodSelection(nextPeriod === "quarterly" ? quarterOptions[0][0] : monthOptions[0][0]);
  }

  return <div className={styles.ranking}>
    <div className={styles.rankingHeader}><div><span className={styles.eyebrow}>Ranking nacional</span><h2>As melhores marcas do Brasil.</h2><p>Somente a melhor marca aprovada de cada atleta entra na classificação.</p></div><Trophy size={42}/></div>
    <div className={styles.periodBar}>
      <div className={styles.periodTabs} aria-label="Período do ranking">
        <button type="button" className={period==="monthly"?styles.selectedPeriod:""} onClick={()=>selectPeriod("monthly")}>Mensal</button>
        <button type="button" className={period==="quarterly"?styles.selectedPeriod:""} onClick={()=>selectPeriod("quarterly")}>Trimestral</button>
        <button type="button" className={period==="total"?styles.selectedPeriod:""} onClick={()=>selectPeriod("total")}>Total da edição</button>
      </div>
      {period !== "total" && <label className={styles.periodSelect}><span>{period==="monthly"?"Mês":"Ciclo"}</span><select value={periodSelection} onChange={e=>setPeriodSelection(e.target.value)}>{(period==="monthly"?monthOptions:quarterOptions).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>}
    </div>
    <div className={styles.filters}><label><span>Idade</span><select value={filters.age} onChange={e=>setFilters({...filters,age:e.target.value})}><option value="">Todas</option>{[9,10,11,12,13].map(a=><option key={a}>{a}</option>)}</select></label><label><span>Gênero</span><select value={filters.gender} onChange={e=>setFilters({...filters,gender:e.target.value})}><option value="">Todos</option><option value="FEMALE">Feminino</option><option value="MALE">Masculino</option></select></label><label><span>UF</span><input maxLength={2} value={filters.state} onChange={e=>setFilters({...filters,state:e.target.value.toUpperCase()})}/></label><label><span>Atleta</span><div className={styles.search}><Search size={15}/><input value={filters.name} onChange={e=>setFilters({...filters,name:e.target.value})}/></div></label></div>
    <p className={styles.rankingHint}>Os ícones mostram a premiação que cada atleta estaria conquistando se o ranking terminasse hoje.</p>
    <div className={styles.rankTable}><div className={styles.rankHead}><span>#</span><span>Atleta</span><span>Categoria</span><span>Data</span><span>Local</span><span>Marca</span><span>Premiação atual</span><span>Validação</span></div>{loading?<p className={styles.empty}>Carregando ranking…</p>:ranking.length?ranking.map(item=><div className={styles.rankRow} key={item.id}><b>{item.categoryPosition}</b><strong>{item.publicName}</strong><span>{item.categoryAge} anos · {item.gender==="FEMALE"?"F":"M"}</span><time dateTime={item.activityDate}>{formatDate(item.activityDate)}</time><span>{item.city}/{item.state}</span><strong>{item.formattedTime}</strong><CurrentPrizes period={period} position={item.categoryPosition}/><em>{item.badge}</em></div>):<p className={styles.empty}>O ranking será publicado assim que as primeiras marcas forem aprovadas neste período.</p>}</div>
  </div>
}
