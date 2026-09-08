import { NextResponse } from 'next/server';
import { listCircuitAthletes, linkCircuitMark, updateCircuitIdentity } from '@/lib/virtual-circuit';
export const runtime='nodejs';
export async function GET(request:Request) { return NextResponse.json({athletes:listCircuitAthletes(new URL(request.url).searchParams.get('q')||'')}); }
export async function PATCH(request:Request) {
 try { const body=await request.json(); const actor=`admin:${process.env.ADMIN_USER||'admin'}`;
 if(body.action==='profile') updateCircuitIdentity({...body,number:Number(body.number),categoryAge:Number(body.categoryAge),actor});
 else linkCircuitMark({id:String(body.id),source:String(body.source),athleteNumber:Number(body.athleteNumber),actor});
 return NextResponse.json({ok:true});
 } catch(e) {return NextResponse.json({error:e instanceof Error?e.message:'Falha ao vincular.'},{status:400});}
}