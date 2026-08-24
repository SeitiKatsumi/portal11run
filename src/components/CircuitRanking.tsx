"use client";

import { Award, BadgeCheck, Banknote, Footprints, Search, Shirt, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { CIRCUIT_CATEGORY_AGES, circuitCategoryLabel, circuitCategoryName } from "@/lib/virtual-circuit-category";
import {
  CIRCUIT_ABSOLUTE,
  CIRCUIT_BIMONTHS,
  CIRCUIT_MONTHS,
  circuitPeriodStatus,
  circuitPrizesForPosition,
  type CircuitPeriodDefinition,
  type CircuitPrize,
  type CircuitRankingPeriod
} from "@/lib/virtual-circuit-schedule";
import styles from "./CircuitUI.module.css";

export type CircuitRankingItem = { id:string;position:number;categoryPosition:number;publicName:string;categoryAge:number;gender:string;city:string;state:string;formattedTime:string;activityDate:string;badge:string };

const prizeDetails: Record<CircuitPrize, { label: string; icon: React.ReactNode }> = {
  cash: { label: "R$ 500,00 para o líder da categoria", icon: <Banknote size={16} /> },
  shoes: { label: "Um par de tênis", icon: <Footprints size={16} /> },
  shirt: { label: "Camiseta 11Run", icon: <Shirt size={16} /> },
  trophy: { label: "Troféu 11Run", icon: <Trophy size={16} /> },
  "physical-certificate": { label: "Certificado físico", icon: <Award size={16} /> },
  "digital-certificate": { label: "Certificado digital", icon: <BadgeCheck size={16} /> },
  "future-opportunity": { label: "Elegível para avaliação de oportunidade no 11Run Futuro", icon: <Sparkles size={16} /> }
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T12:00:00Z`));
}

function formatLocation(city: string, state: string) {
  if (/[,]\s*Brasil$/i.test(city)) return city;
  return state && state !== "--" ? `${city}/${state}` : city;
}

function selectedPeriod(period: CircuitRankingPeriod, selection: string): CircuitPeriodDefinition {
  if (period === "absolute") return CIRCUIT_ABSOLUTE;
  const options = period === "monthly" ? CIRCUIT_MONTHS : CIRCUIT_BIMONTHS;
  return options.find((option) => option.id === selection) ?? options[0];
}

function PrizeIcon({ prize }: { prize: CircuitPrize }) {
  const details = prizeDetails[prize];
  return <span className={styles.prizeIcon} data-tooltip={details.label} aria-label={details.label} tabIndex={0}>{details.icon}</span>;
}

function CurrentPrizes({ period, position, categoryAge }: { period: CircuitRankingPeriod; position: number; categoryAge: number }) {
  const prizes = circuitPrizesForPosition(period, position, categoryAge);
  return <div className={styles.prizeIcons} aria-label="Premiação provisória cumulativa">{prizes.map((prize) => <PrizeIcon key={prize} prize={prize} />)}</div>;
}

export function CircuitRanking({ initialRanking = [] }: { initialRanking?: CircuitRankingItem[] }) {
  const [filters,setFilters]=useState({age:"",gender:"",state:"",name:""});
  const [period,setPeriod]=useState<CircuitRankingPeriod>("absolute");
  const [periodSelection,setPeriodSelection]=useState(CIRCUIT_MONTHS[0].id);
  const [ranking,setRanking]=useState<CircuitRankingItem[]>(initialRanking);
  const [loading,setLoading]=useState(false);
  const activePeriod = selectedPeriod(period, periodSelection);

  useEffect(()=>{
    const query=new URLSearchParams(Object.entries({ ...filters, start: activePeriod.start, end: activePeriod.end }).filter(([,value])=>value));
    setLoading(true);
    fetch(`/api/circuito-virtual/ranking?${query}`, { cache: "no-store" })
      .then((response)=>response.json())
      .then((response)=>setRanking(response.ranking||[]))
      .finally(()=>setLoading(false));
  },[filters,activePeriod.start,activePeriod.end]);

  function selectPeriod(nextPeriod: CircuitRankingPeriod) {
    setPeriod(nextPeriod);
    if (nextPeriod === "monthly") setPeriodSelection(CIRCUIT_MONTHS[0].id);
    if (nextPeriod === "bimonthly") setPeriodSelection(CIRCUIT_BIMONTHS[0].id);
  }

  const periodOptions = period === "monthly" ? CIRCUIT_MONTHS : CIRCUIT_BIMONTHS;

  return <div className={styles.ranking}>
    <div className={styles.rankingHeader}><div><span className={styles.eyebrow}>Ranking nacional</span><h2>As melhores marcas do Brasil.</h2><p>Somente a melhor marca validada de cada atleta entra na classificação da categoria e do gênero correspondentes.</p></div><Trophy size={42}/></div>
    <div className={styles.periodBar}>
      <div className={styles.periodTabs} aria-label="Período do ranking">
        <button type="button" className={period==="monthly"?styles.selectedPeriod:""} onClick={()=>selectPeriod("monthly")}>Mensal</button>
        <button type="button" className={period==="bimonthly"?styles.selectedPeriod:""} onClick={()=>selectPeriod("bimonthly")}>Bimestral</button>
        <button type="button" className={period==="absolute"?styles.selectedPeriod:""} onClick={()=>selectPeriod("absolute")}>Ranking absoluto</button>
      </div>
      {period !== "absolute" && <label className={styles.periodSelect}><span>{period==="monthly"?"Mês":"Bimestre"}</span><select value={periodSelection} onChange={event=>setPeriodSelection(event.target.value)}>{periodOptions.map((option)=><option key={option.id} value={option.id}>{option.label}</option>)}</select></label>}
    </div>
    <div className={styles.periodSummary}>
      <span>{circuitPeriodStatus(activePeriod)}</span>
      <div><strong>{activePeriod.label}</strong><small>{activePeriod.shortLabel} · classificação provisória até a homologação</small></div>
    </div>
    <div className={styles.filters}><label><span>Categoria</span><select value={filters.age} onChange={event=>setFilters({...filters,age:event.target.value})}><option value="">Todas as categorias</option>{CIRCUIT_CATEGORY_AGES.map(age=><option key={age} value={age}>{circuitCategoryLabel(age)}</option>)}</select></label><label><span>Gênero</span><select value={filters.gender} onChange={event=>setFilters({...filters,gender:event.target.value})}><option value="">Todos</option><option value="FEMALE">Feminino</option><option value="MALE">Masculino</option></select></label><label><span>UF</span><input maxLength={2} value={filters.state} onChange={event=>setFilters({...filters,state:event.target.value.toUpperCase()})}/></label><label><span>Atleta</span><div className={styles.search}><Search size={15}/><input value={filters.name} onChange={event=>setFilters({...filters,name:event.target.value})}/></div></label></div>
    <p className={styles.rankingHint}>Os ícones mostram as premiações cumulativas que cada atleta conquistaria se o período terminasse hoje.</p>
    <div className={styles.rankTable}><div className={styles.rankHead}><span>#</span><span>Atleta</span><span>Categoria</span><span>Data</span><span>Local</span><span>Marca</span><span>Premiação atual</span><span>Validação</span></div>{loading?<p className={styles.empty}>Carregando ranking…</p>:ranking.length?ranking.map(item=><div className={styles.rankRow} key={item.id}><b className={styles.rankPosition}>{item.categoryPosition}</b><strong className={styles.rankName}>{item.publicName}<small className={styles.rankMobileCategory}>{circuitCategoryName(item.categoryAge)} · {item.categoryAge} anos · {item.gender==="FEMALE"?"F":"M"}</small></strong><span className={styles.rankCategory} title={circuitCategoryLabel(item.categoryAge)}>{circuitCategoryName(item.categoryAge)} · {item.categoryAge} anos · {item.gender==="FEMALE"?"F":"M"}</span><time className={styles.rankDate} dateTime={item.activityDate}>{formatDate(item.activityDate)}</time><span className={styles.rankLocation}>{formatLocation(item.city, item.state)}</span><strong className={styles.rankTime}><span className={styles.rankTimeLabel}>Marca</span>{item.formattedTime}</strong><CurrentPrizes period={period} position={item.categoryPosition} categoryAge={item.categoryAge}/><em className={styles.rankBadge}>{item.badge}</em></div>):<p className={styles.empty}>Ainda não há marcas validadas para este período.</p>}</div>
  </div>;
}
