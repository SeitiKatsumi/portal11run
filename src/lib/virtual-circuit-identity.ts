import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, cpSync } from 'node:fs';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { normalizePublicName, parseCircuitTime, type CircuitGender, type CircuitSubmissionType } from './virtual-circuit-core.ts';

export type CircuitIdentity = { number: number; public_name: string; category_age: number; gender: CircuitGender; city: string; state: string; review_required: number };
export const nameKey = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
export function migrateCircuitIdentities(db: DatabaseSync, dbPath: string) {
  if (db.prepare("SELECT 1 FROM sqlite_master WHERE name='virtual_circuit_identities'").get()) return;
  const backupDir = path.join(path.dirname(dbPath), 'backups', `circuit-${Date.now()}-${randomUUID()}`);
  mkdirSync(backupDir, { recursive: true });
  db.exec(`VACUUM INTO '${path.join(backupDir, 'before.sqlite').replace(/'/g, "''")}';`);
  const uploads = path.resolve(process.env.VIRTUAL_CIRCUIT_PRIVATE_UPLOAD_DIR || 'data/virtual-circuit-private');
  if (existsSync(uploads)) cpSync(uploads, path.join(backupDir, 'private-uploads'), { recursive: true });
  const before = Object.fromEntries(['virtual_circuit_athletes','virtual_circuit_official_results','virtual_circuit_submissions'].map(table=>[table,Number(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()!.n)]));
  db.exec('BEGIN IMMEDIATE');
  try {
    if (db.prepare("SELECT 1 FROM sqlite_master WHERE name='virtual_circuit_identities'").get()) { db.exec('COMMIT'); return; }
    db.exec(`CREATE TABLE virtual_circuit_identities (
      number INTEGER PRIMARY KEY AUTOINCREMENT, public_name TEXT NOT NULL, category_age INTEGER NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('FEMALE','MALE')), city TEXT NOT NULL, state TEXT NOT NULL,
      review_required INTEGER NOT NULL DEFAULT 0);
      ALTER TABLE virtual_circuit_athletes ADD COLUMN circuit_number INTEGER REFERENCES virtual_circuit_identities(number);
      ALTER TABLE virtual_circuit_official_results ADD COLUMN circuit_number INTEGER REFERENCES virtual_circuit_identities(number);
      CREATE INDEX circuit_official_identity ON virtual_circuit_official_results(circuit_number);
      CREATE INDEX circuit_registered_identity ON virtual_circuit_athletes(circuit_number);
      CREATE TABLE virtual_circuit_batches (key TEXT PRIMARY KEY, payload TEXT NOT NULL, result TEXT NOT NULL);`);
    backfillCircuitIdentities(db);
    const after = {...before, identities:Number(db.prepare('SELECT COUNT(*) AS n FROM virtual_circuit_identities').get()!.n), backupDirectory:backupDir};
    db.prepare("INSERT INTO virtual_circuit_audit_logs(id,entity_type,entity_id,action,actor_id,before_json,after_json,reason,created_at) VALUES(?,'migration','circuit-identities-v1','IDENTITIES_MIGRATED','system:migration',?,?,?,?)").run(randomUUID(),JSON.stringify(before),JSON.stringify(after),'Identidades numéricas criadas sem união automática de nomes.',new Date().toISOString());
    db.exec('COMMIT');
    console.info('[circuit-migration]', JSON.stringify(after));
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}
export function backfillCircuitIdentities(db: DatabaseSync) {
  for (const table of ['virtual_circuit_athletes', 'virtual_circuit_official_results']) {
    const rows = db.prepare(`SELECT id, public_name, category_age, gender, city, state FROM ${table} WHERE circuit_number IS NULL ORDER BY created_at, id`).all() as (CircuitIdentity & {id:string})[];
    for (const row of rows) {
      const number = newCircuitIdentity(db, row, table.endsWith('official_results'));
      db.prepare(`UPDATE ${table} SET circuit_number=? WHERE id=?`).run(number, row.id);
    }
  }
}
export function newCircuitIdentity(db: DatabaseSync, row: Omit<CircuitIdentity, 'number'|'review_required'>, review = false) {
  return Number(db.prepare('INSERT INTO virtual_circuit_identities(public_name,category_age,gender,city,state,review_required) VALUES(?,?,?,?,?,?)')
    .run(row.public_name,row.category_age,row.gender,row.city,row.state,review?1:0).lastInsertRowid);
}
export function findCircuitIdentities(db: DatabaseSync, query = '') {
  const key = nameKey(query);
  return (db.prepare('SELECT * FROM virtual_circuit_identities ORDER BY number').all() as CircuitIdentity[])
    .filter(row => !key || String(row.number) === key || nameKey(row.public_name).startsWith(key));
}
export type CircuitMarkInput = { publicName:string; categoryAge:number; gender:CircuitGender; activityDate:string; time:string; city:string; state:string; competitionName:string; submissionType:CircuitSubmissionType; athleteNumber?:number; confirmNew?:boolean; batchAthlete?:number };
export function validateCircuitMark(input: CircuitMarkInput) {
  if (!Number.isInteger(input.categoryAge) || input.categoryAge<9 || input.categoryAge>13) throw new Error('Categoria deve ter entre 9 e 13 anos.');
  if (!['FEMALE','MALE'].includes(input.gender)) throw new Error('Gênero inválido.');
  if (!['OFFICIAL_COMPETITION','TRACK_400M','OPEN_COURSE'].includes(input.submissionType)) throw new Error('Modalidade inválida.');
  const date = new Date(`${input.activityDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.activityDate) || !Number.isFinite(+date) || date.toISOString().slice(0,10)!==input.activityDate) throw new Error('Data inválida.');
  const publicName=normalizePublicName(String(input.publicName||''));
  if(publicName.length<3 || !input.city?.trim() || !input.competitionName?.trim()) throw new Error('Preencha nome, cidade e competição/teste.');
  if(!/^(?:[A-Z]{2}|--)$/.test(input.state)) throw new Error('UF inválida.');
  if(input.city.length>120 || input.competitionName.length>180) throw new Error('Cidade ou competição muito longa.');
  return {publicName,timeMs:parseCircuitTime(input.time)};
}
export function resolveCircuitIdentity(db:DatabaseSync,input:CircuitMarkInput) {
  if(input.athleteNumber) {
    const row=db.prepare('SELECT * FROM virtual_circuit_identities WHERE number=?').get(input.athleteNumber) as CircuitIdentity|undefined;
    if(!row) throw new Error('Número de atleta inexistente.');
    if(row.category_age!==input.categoryAge || row.gender!==input.gender) throw new Error('Categoria e gênero não correspondem ao atleta selecionado.');
    return row.number;
  }
  if(!input.confirmNew) throw new Error('Selecione o atleta existente ou confirme que é uma nova pessoa.');
  return newCircuitIdentity(db,{public_name:normalizePublicName(input.publicName),category_age:input.categoryAge,gender:input.gender,city:input.city,state:input.state});
}
