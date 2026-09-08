import { validateCircuitMark } from '@/lib/virtual-circuit-identity';
import { NextResponse } from 'next/server';
import { createCircuitBatch } from '@/lib/virtual-circuit';
export const runtime='nodejs';
export async function POST(request:Request) {
 try {const body=await request.json();
 if(body.preview) {
  if(!Array.isArray(body.rows)||!body.rows.length||body.rows.length>500) throw new Error('Lote inválido (máximo 500 linhas).');
  const errors:Record<number,string>={};
  body.rows.forEach((row:Parameters<typeof validateCircuitMark>[0],i:number)=>{try{validateCircuitMark(row);if(!row.athleteNumber&&!row.confirmNew&&row.batchAthlete===undefined)throw new Error('Confirme o vínculo ou uma nova pessoa.');}catch(e){errors[i]=e instanceof Error?e.message:'Linha inválida.';}});
  return NextResponse.json({errors});
 }
 return NextResponse.json({ok:true,results:createCircuitBatch(body.rows,body.key,`admin:${process.env.ADMIN_USER||'admin'}`)},{status:201});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha no lote.'},{status:400});}
}