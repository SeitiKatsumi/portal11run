export const formatCircuitAthleteNumber = (number: number) => `Nº ${String(number).padStart(3, '0')}`;
export const circuitMarkProgress = (baseline: number, time: number) => (baseline - time) / baseline * 100;
