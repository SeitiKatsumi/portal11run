"use client";

import { Search, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./CircuitUI.module.css";

type Rank = { id:string;position:number;publicName:string;categoryAge:number;gender:string;city:string;state:string;formattedTime:string;activityDate:string;badge:string };
export function CircuitRanking(){
  const [filters,setFilters]=useState({age:"",gender:"",state:"",name:""});
  const [ranking,setRanking]=useState<Rank[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const query=new URLSearchParams(Object.entries(filters).filter(([,value])=>value));setLoading(true);fetch(`/api/circuito-virtual/ranking?${query}`).then(r=>r.json()).then(r=>setRanking(r.ranking||[])).finally(()=>setLoading(false));},[filters]);
  return <div className={styles.ranking}>
    <div className={styles.rankingHeader}><div><span className={styles.eyebrow}>Ranking nacional</span><h2>As melhores marcas do Brasil.</h2><p>Somente a melhor marca aprovada de cada atleta entra na classificação.</p></div><Trophy size={42}/></div>
    <div className={styles.filters}><label><span>Idade</span><select value={filters.age} onChange={e=>setFilters({...filters,age:e.target.value})}><option value="">Todas</option>{[9,10,11,12,13].map(a=><option key={a}>{a}</option>)}</select></label><label><span>Gênero</span><select value={filters.gender} onChange={e=>setFilters({...filters,gender:e.target.value})}><option value="">Todos</option><option value="FEMALE">Feminino</option><option value="MALE">Masculino</option></select></label><label><span>UF</span><input maxLength={2} value={filters.state} onChange={e=>setFilters({...filters,state:e.target.value.toUpperCase()})}/></label><label><span>Atleta</span><div className={styles.search}><Search size={15}/><input value={filters.name} onChange={e=>setFilters({...filters,name:e.target.value})}/></div></label></div>
    <div className={styles.rankTable}><div className={styles.rankHead}><span>#</span><span>Atleta</span><span>Categoria</span><span>Local</span><span>Marca</span><span>Validação</span></div>{loading?<p className={styles.empty}>Carregando ranking…</p>:ranking.length?ranking.map(item=><div className={styles.rankRow} key={item.id}><b>{item.position}</b><strong>{item.publicName}</strong><span>{item.categoryAge} anos · {item.gender==="FEMALE"?"F":"M"}</span><span>{item.city}/{item.state}</span><strong>{item.formattedTime}</strong><em>{item.badge}</em></div>):<p className={styles.empty}>O ranking será publicado assim que as primeiras marcas forem aprovadas.</p>}</div>
  </div>
}
