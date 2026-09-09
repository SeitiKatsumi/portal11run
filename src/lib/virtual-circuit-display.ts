export const formatCircuitAthleteNumber = (number: number) => `Nº ${String(number).padStart(3, '0')}`;
export const circuitMarkProgress = (baseline: number, time: number) => (baseline - time) / baseline * 100;
export const circuitActivityLabel = (type?: string) => ({OFFICIAL_COMPETITION:'Competição oficial',TRACK_400M:'Teste em pista de 400 m',OPEN_COURSE:'Percurso aberto'}[type || ''] || 'Modalidade não informada');
