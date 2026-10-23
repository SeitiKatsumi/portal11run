import assert from "node:assert/strict";
import test from "node:test";
import { parseParticipantList } from "../src/lib/event-participants.ts";

test("importa alunos de planilha ou lista com ponto e vírgula", () => {
  assert.deepEqual(parseParticipantList("Ana Silva; 12/03/2015; F\n\nJoão Santos\t2016-08-20\tMasculino"), [
    { name: "Ana Silva", birth_date: "2015-03-12", gender: "Feminino" },
    { name: "João Santos", birth_date: "2016-08-20", gender: "Masculino" }
  ]);
});
test("recusa datas inexistentes, colunas inválidas e listas acima do limite", () => {
  for (const input of ["", "Ana; 31/02/2015; F", "Ana; 12/03/2015; X", "Ana;12/03/2015;constructor", "Ana;12/03/2015;__proto__", "A;12/03/2015;F", "Ana;12/03/2015;F;extra", Array(501).fill("Ana;12/03/2015;F").join("\n")]) {
    assert.throws(() => parseParticipantList(input));
  }
});
