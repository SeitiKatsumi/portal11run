"use client";

import { Save, Settings2 } from "lucide-react";
import { useState } from "react";
import styles from "./CircuitEditionSettings.module.css";

type Edition = {
  start_date:string;end_date:string;hero_image:string|null;
  settings:Record<string,string|number>;regulations:string[][];faq:string[][];
};
const toLines=(items:string[][])=>items.map(([title,text])=>`${title} | ${text}`).join("\n");
const fromLines=(value:string)=>value.split("\n").map(line=>{const index=line.indexOf("|");return index>0?[line.slice(0,index).trim(),line.slice(index+1).trim()]:[]}).filter(item=>item.length===2&&item[0]&&item[1]) as string[][];

export function CircuitEditionSettings({initialEdition}:{initialEdition:Edition}){
  const [open,setOpen]=useState(false);const [startDate,setStart]=useState(initialEdition.start_date);const [endDate,setEnd]=useState(initialEdition.end_date);const [hero,setHero]=useState(initialEdition.hero_image||"");const [tolerance,setTolerance]=useState(String(initialEdition.settings.elevationToleranceMeters||2));const [regulations,setRegulations]=useState(toLines(initialEdition.regulations));const [faq,setFaq]=useState(toLines(initialEdition.faq));const [message,setMessage]=useState("");
  async function save(){setMessage("Salvando…");const response=await fetch("/api/admin/circuito-virtual/edition",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({startDate,endDate,heroImage:hero,regulations:fromLines(regulations),faq:fromLines(faq),settings:{...initialEdition.settings,elevationToleranceMeters:Number(tolerance)}})});const result=await response.json();setMessage(response.ok?"Configurações salvas.":result.error||"Falha ao salvar.");}
  return <section className={`admin-panel ${styles.settings}`}><button className={styles.trigger} onClick={()=>setOpen(value=>!value)}><Settings2 size={18}/><span><strong>Configuração da edição 2026</strong><small>Datas, imagem, altimetria, regulamento e FAQ</small></span><b>{open?"Fechar":"Editar"}</b></button>{open&&<div className={styles.body}><div className={styles.grid}><label>Início<input type="date" value={startDate} onChange={e=>setStart(e.target.value)}/></label><label>Encerramento<input type="date" value={endDate} onChange={e=>setEnd(e.target.value)}/></label><label>Imagem do hero<input value={hero} onChange={e=>setHero(e.target.value)} placeholder="/assets/onze-futuro-hero.jpg"/></label><label>Tolerância de altimetria (m)<input type="number" min="0" max="20" value={tolerance} onChange={e=>setTolerance(e.target.value)}/></label></div><label>Regulamento <small>Uma regra por linha no formato Título | Texto</small><textarea rows={12} value={regulations} onChange={e=>setRegulations(e.target.value)}/></label><label>FAQ <small>Uma pergunta por linha no formato Pergunta | Resposta</small><textarea rows={10} value={faq} onChange={e=>setFaq(e.target.value)}/></label><div className={styles.footer}>{message&&<span>{message}</span>}<button onClick={save}><Save size={16}/>Salvar edição</button></div></div>}</section>
}
