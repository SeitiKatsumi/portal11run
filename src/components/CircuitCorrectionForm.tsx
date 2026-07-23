"use client";

import { useState } from "react";

export function CircuitCorrectionForm({submissionId}:{submissionId:string}){
  const [message,setMessage]=useState("");const [status,setStatus]=useState("");const [busy,setBusy]=useState(false);
  async function send(){setBusy(true);setStatus("");const response=await fetch(`/api/circuito-virtual/corrections/${submissionId}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})});const result=await response.json();setBusy(false);setStatus(response.ok?result.message:result.error);if(response.ok)setMessage("");}
  return <div className="circuit-correction"><label>Resposta à comissão<textarea rows={3} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Explique a correção ou informe os novos dados."/></label><button type="button" onClick={send} disabled={busy||message.trim().length<5}>{busy?"Enviando…":"Enviar correção"}</button>{status?<small>{status}</small>:null}</div>
}
