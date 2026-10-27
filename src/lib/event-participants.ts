export type EventParticipant = {
  name: string;
  birth_date: string;
  gender: "Feminino" | "Masculino" | "Não informar";
  school_year?: "1" | "2" | "3" | "4" | "5" | null;
};

export function parseParticipantList(text: string): EventParticipant[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length || lines.length > 500) throw new Error("Cole entre 1 e 500 alunos, um por linha.");
  return lines.map((line, index) => {
    const [name, birth, gender, extra] = line.split(/[;\t]/).map((value) => value.trim());
    const match = birth?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const birthDate = match ? `${match[3]}-${match[2]}-${match[1]}` : birth;
    const date = new Date(`${birthDate}T12:00:00Z`);
    const normalizedGender = gender?.toLocaleLowerCase("pt-BR") ?? "";
    const genders: Record<string, EventParticipant["gender"]> = { f: "Feminino", feminino: "Feminino", m: "Masculino", masculino: "Masculino", "não informar": "Não informar", "nao informar": "Não informar" };
    if (!name || name.length < 2 || name.length > 120 || extra !== undefined || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate ?? "") || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate || !Object.hasOwn(genders, normalizedGender)) {
      throw new Error(`Confira a linha ${index + 1}: use nome; DD/MM/AAAA; F, M ou Não informar.`);
    }
    return { name, birth_date: birthDate, gender: genders[normalizedGender] };
  });
}
