import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { circuitEvolution, type RankableSubmission } from '../src/lib/virtual-circuit-core.ts';
import { migrateCircuitIdentities, backfillCircuitIdentities, findCircuitIdentities } from '../src/lib/virtual-circuit-identity.ts';
const dir=mkdtempSync(path.join(tmpdir(),'circuit-identity-'));
process.env.SQLITE_PATH=path.join(dir,'app.sqlite');
process.env.VIRTUAL_CIRCUIT_PRIVATE_UPLOAD_DIR=path.join(dir,'uploads');
const circuit=await import('../src/lib/virtual-circuit.ts');
const input={publicName:'Ána Teste',categoryAge:10,gender:'FEMALE' as const,city:'Itatiba',state:'SP',competitionName:'Teste',submissionType:'TRACK_400M' as const,activityDate:'2026-09-01',time:'05:00.00',confirmNew:true,actor:'test'};
function mark(id:string,date:string,ms:number,athlete='1'):RankableSubmission{return {id,athleteId:athlete,publicName:'Ana',categoryAge:10,gender:'FEMALE',city:'Itatiba',state:'SP',activityDate:date,timeMs:ms,type:'TRACK_400M',badge:'Pista'};}
test('evolução usa melhor marca do primeiro dia e melhor posterior; mantém pioras e empates',()=>{
 const result=circuitEvolution([mark('a','2026-09-01',310000),mark('b','2026-09-01',300000),mark('c','2026-09-02',270000),mark('d','2026-09-03',280000)]);
 assert.equal(result[0].percent,10);assert.equal(result[0].history.length,4);assert.equal(result[0].bestDate,'2026-09-02');
 assert.equal(circuitEvolution([mark('a','2026-09-01',300000)])[0].percent,null);
 assert.equal(circuitEvolution([mark('a','2026-09-01',300000),mark('b','2026-09-02',310000)])[0].percent,0);
 assert.equal(circuitEvolution([mark('a','2026-09-01',300000),mark('b','2026-09-01',270000)])[0].percent,null);
 const tied=circuitEvolution([mark('1','2026-09-01',300000,'2'),mark('2','2026-09-02',270000,'2'),mark('3','2026-09-01',300000,'1'),mark('4','2026-09-02',270000,'1')]);assert.equal(tied[0].athleteNumber,1);
});
test('migração preserva registros e é repetível, com backup antes das colunas novas',()=>{
 const filename=path.join(dir,'legacy.sqlite');const db=new DatabaseSync(filename);db.exec(readFileSync('data/schema.sql','utf8'));db.exec('PRAGMA foreign_keys=OFF');
 db.prepare("INSERT INTO virtual_circuit_official_results(id,edition_id,public_name,category_age,gender,activity_date,time_ms,city,state,competition_name,created_at,updated_at) VALUES('old','edition','Ana',10,'FEMALE','2026-04-25',300000,'Itatiba','SP','Teste','old','old')").run();
 const before=db.prepare('SELECT * FROM virtual_circuit_official_results').get();
 migrateCircuitIdentities(db,filename);migrateCircuitIdentities(db,filename);backfillCircuitIdentities(db);
 const after=db.prepare('SELECT * FROM virtual_circuit_official_results').get()!;assert.ok(after.circuit_number);delete after.circuit_number;assert.deepEqual(after,before);
 assert.equal(db.prepare('SELECT count(*) AS n FROM virtual_circuit_identities').get()!.n,1);
 assert.ok(readdirSync(path.join(dir,'backups')).length);assert.equal(db.prepare('PRAGMA integrity_check').get()!.integrity_check,'ok');db.close();
});
test('homônimos permanecem separados; vínculo explícito reúne histórico, duplicatas são rejeitadas',()=>{
 const first=circuit.createCircuitAdminOfficialResult(input) as {id:string;circuit_number:number};
 const sameName=circuit.createCircuitAdminOfficialResult({...input,time:'06:00.00'}) as {id:string;circuit_number:number};assert.notEqual(first.circuit_number,sameName.circuit_number);
 assert.ok(findCircuitIdentities(circuit.getCircuitDatabase(),'ana').length>=2);
 const second=circuit.createCircuitAdminOfficialResult({...input,athleteNumber:first.circuit_number,activityDate:'2026-09-02',time:'04:30.00'}) as {id:string};
 assert.equal(circuitEvolution(circuit.listCircuitRanking({name:'Ána Teste',allMarks:true})).find(a=>a.athleteNumber===first.circuit_number)?.percent,10);
 assert.throws(()=>circuit.createCircuitAdminOfficialResult({...input,athleteNumber:first.circuit_number}),/já está/);
 assert.throws(()=>circuit.createCircuitAdminOfficialResult({...input,confirmNew:false}),/Selecione/);
 circuit.linkCircuitMark({id:second.id,source:'official',athleteNumber:sameName.circuit_number,actor:'test'});
 assert.equal(circuit.listCircuitAthletes().find(a=>a.number===sameName.circuit_number)?.count,2);
 circuit.linkCircuitMark({id:second.id,source:'official',athleteNumber:first.circuit_number,actor:'test'});
 circuit.setCircuitAdminOfficialResultVisibility({id:second.id,visible:false,actor:'test'});
 circuit.updateCircuitAdminOfficialResult({...input,id:second.id,time:'04:29.00'});
 const stored=circuit.getCircuitDatabase().prepare('SELECT * FROM virtual_circuit_official_results WHERE id=?').get(second.id)!;
 assert.equal(stored.status,'HIDDEN');assert.equal(stored.submission_type,'TRACK_400M');assert.equal(stored.validation_badge,'Pista 400m');
 assert.equal(circuitEvolution(circuit.listCircuitRanking({name:'Ána Teste',allMarks:true})).find(a=>a.athleteNumber===first.circuit_number)?.percent,null);
});
test('lote salva todas as linhas, vincula linhas entre si, repete sem duplicar e desfaz falha',()=>{
 const rows=[{...input,publicName:'Lote Teste'},{...input,publicName:'Lote Teste',batchAthlete:0,activityDate:'2026-09-02',time:'04:30.00'}];
 const key=randomUUID();const saved=circuit.createCircuitBatch(rows,key,'test');assert.equal(saved.length,2);assert.equal(saved[0].circuit_number,saved[1].circuit_number);
 assert.deepEqual(circuit.createCircuitBatch(rows,key,'test'),saved);
 const count=()=>circuit.getCircuitDatabase().prepare('SELECT count(*) AS n FROM virtual_circuit_official_results').get()!.n;
 const before=count();assert.throws(()=>circuit.createCircuitBatch([{...input,publicName:'Rollback'}, {...input,time:'inválido'}],randomUUID(),'test'),/Linha 2/);assert.equal(count(),before);
 assert.equal(circuit.listCircuitAthletes('Rollback').length,0);
 assert.throws(()=>circuit.createCircuitBatch([{...input,activityDate:'2026-02-31'}],randomUUID(),'test'),/Data inválida/);
});
test('limites de datas filtram classificação sem alterar histórico',()=>{
 const rows=['2026-07-31','2026-08-01','2026-11-14','2026-11-15'].map((activityDate,i)=>({...input,publicName:`Data Limite ${i}`,activityDate}));
 circuit.createCircuitBatch(rows,randomUUID(),'test');assert.equal(circuit.listCircuitRanking({name:'Data Limite'}).length,2);assert.equal(circuit.listCircuitRanking({name:'Data Limite',includeOutsideEdition:true}).length,4);
});

test('reiniciar aplicação não sobrescreve edições de marcas carregadas pelo seed', async()=>{
 const {execFileSync}=await import('node:child_process');const db=circuit.getCircuitDatabase();
 const row=db.prepare("SELECT id FROM virtual_circuit_official_results WHERE id LIKE 'official-%' LIMIT 1").get()!;
 db.prepare("UPDATE virtual_circuit_official_results SET competition_name='Edição preservada',activity_date='2026-04-25',status='HIDDEN' WHERE id=?").run(row.id);
 execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',"import {getCircuitDatabase} from './src/lib/virtual-circuit.ts';getCircuitDatabase().close();"],{env:process.env,stdio:'pipe'});
 const after=db.prepare('SELECT competition_name,activity_date,status FROM virtual_circuit_official_results WHERE id=?').get(row.id)!;
 assert.equal(after.competition_name,'Edição preservada');assert.equal(after.activity_date,'2026-04-25');assert.equal(after.status,'HIDDEN');
});
import { formatCircuitAthleteNumber, circuitMarkProgress } from '../src/lib/virtual-circuit-display.ts';

test('exibição numérica e gráfico sobem com melhora sem ocultar pioras',()=>{
 assert.equal(formatCircuitAthleteNumber(1),'Nº 001');
 assert.equal(formatCircuitAthleteNumber(1024),'Nº 1024');
 assert.equal(circuitMarkProgress(300000,300000),0);
 assert.equal(circuitMarkProgress(300000,270000),10);
 assert.equal(circuitMarkProgress(300000,330000),-10);
});

test('últimos participantes usam inclusão aprovada, com identidade única, independente da data e do melhor tempo',()=>{
 const db=circuit.getCircuitDatabase();
 const first=circuit.createCircuitAdminOfficialResult({...input,publicName:'Recente Primeiro',activityDate:'2027-01-01'}) as {id:string;circuit_number:number};
 const second=circuit.createCircuitAdminOfficialResult({...input,publicName:'Recente Segundo',activityDate:'2026-08-01'}) as {id:string;circuit_number:number};
 const slower=circuit.createCircuitAdminOfficialResult({...input,publicName:'Recente Primeiro',athleteNumber:first.circuit_number,activityDate:'2026-08-02',time:'06:00.00'}) as {id:string};
 const hidden=circuit.createCircuitAdminOfficialResult({...input,publicName:'Recente Oculto'}) as {id:string};
 const update=db.prepare('UPDATE virtual_circuit_official_results SET created_at=?,updated_at=? WHERE id=?');
 update.run('2099-01-01T00:00:00Z','2099-12-31T00:00:00Z',first.id);
 update.run('2099-01-02T00:00:00Z','2099-01-02T00:00:00Z',second.id);
 update.run('2099-01-03T00:00:00Z','2099-01-03T00:00:00Z',slower.id);
 update.run('2099-01-04T00:00:00Z','2099-01-04T00:00:00Z',hidden.id);
 circuit.setCircuitAdminOfficialResultVisibility({id:hidden.id,visible:false,actor:'test'});
 const recent=circuit.listLatestCircuitParticipants();
 assert.deepEqual(recent.slice(0,2).map(a=>a.athleteNumber),[first.circuit_number,second.circuit_number]);
 assert.equal(new Set(recent.map(a=>a.athleteNumber)).size,recent.length);
 assert.ok(!recent.some(a=>a.publicName==='Recente Oculto'));
});
