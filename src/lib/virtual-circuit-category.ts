export const CIRCUIT_EDITION_YEAR = 2026;
export const CIRCUIT_CATEGORY_AGES = [9, 10, 11, 12, 13] as const;

export function circuitCategoryName(age: number) {
  return `Sub ${age + 1}`;
}

export function circuitCategoryBirthYear(age: number) {
  return CIRCUIT_EDITION_YEAR - age;
}

export function circuitCategoryLabel(age: number) {
  return `${circuitCategoryName(age)} · ${age} anos em ${CIRCUIT_EDITION_YEAR} · nascidos em ${circuitCategoryBirthYear(age)}`;
}
