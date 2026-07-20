"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

type Props = { label?: string };

const fieldGroups = [
  {
    title: "Dados pessoais e de saúde",
    fields: [
      ["fullName", "Nome completo", "text", true],
      ["birthDate", "Data de nascimento", "date", true],
      ["cityState", "Cidade e estado onde reside", "text", true],
      ["profession", "Profissão", "text", false],
      ["height", "Altura", "text", false],
      ["weight", "Peso", "text", false],
      ["healthConditions", "Possui algum problema de saúde?", "text", false],
      ["medications", "Toma algum remédio? Quais?", "text", false],
      ["checkup", "Realizou check-up nos últimos 12 meses?", "text", false],
      ["allergies", "Tem alguma alergia?", "text", false],
      ["supplements", "Toma algum suplemento alimentar? Quais?", "text", false],
      ["injuries", "Já teve alguma lesão?", "text", false],
      ["nutrition", "Como considera sua alimentação? Tem algum vício?", "text", false],
    ],
  },
  {
    title: "Histórico esportivo",
    fields: [
      ["otherActivities", "Outras atividades: frequência, dias, horários e há quanto tempo", "textarea", false],
      ["howHeard", "Como conheceu a metodologia do Professor Alex Lopes?", "text", false],
      ["runningExperience", "Há quanto tempo pratica corrida?", "text", false],
      ["currentRoutine", "Quantos dias por semana corre e quais dias?", "text", false],
      ["desiredRoutine", "Quantos dias por semana gostaria de treinar?", "text", false],
      ["trainingPeriod", "Você treina de manhã ou à noite?", "text", false],
      ["raceTest", "Já realizou teste de corrida? Quando e qual tempo?", "text", false],
      ["previousCoach", "Já teve treinador presencial ou online? Nome e período", "text", false],
      ["coachChangeReason", "Por qual motivo está trocando de treinador?", "text", false],
      ["recentResults", "Melhores resultados nas provas em 2024/2025", "textarea", false],
      ["goals", "Objetivos deste ano e do próximo; prova-alvo e data", "textarea", false],
      ["weeklyVolume", "Maior volume semanal e melhor treino deste ano", "textarea", false],
      ["longTermGoals", "Objetivos de longo prazo com a corrida", "textarea", false],
      ["trainingDetails", "Descreva seu treino dia a dia: volumes, intensidades e pausas", "textarea", false],
      ["trainingRoutes", "Quais percursos tem para treinar?", "textarea", false],
      ["instagram", "Instagram", "text", false],
      ["email", "E-mail", "email", true],
      ["motivation", "O que motiva você a treinar e o que não gosta de fazer?", "textarea", false],
      ["trainingPreference", "Prefere treinos mais diversificados ou mais parecidos?", "text", false],
      ["aboutYou", "Fale mais sobre você", "textarea", false],
    ],
  },
] as const;

export function AlexLopesApplication({ label = "Treine com o Alex" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    if (open) window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/alex-lopes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!response.ok) {
      setNotice("Não foi possível enviar agora. Revise os campos obrigatórios e tente novamente.");
      return;
    }
    event.currentTarget.reset();
    setNotice("Recebemos seu formulário. O Professor Alex Lopes e sua equipe entrarão em contato.");
  }

  const modal = open ? (
        <div className="alex-modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="alex-modal" role="dialog" aria-modal="true" aria-labelledby="alex-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="alex-close" aria-label="Fechar formulário" type="button" onClick={() => setOpen(false)}><X size={20} /></button>
            <p className="eyebrow">TIME ALEX LOPES</p>
            <h2 id="alex-form-title">Avaliação para treinamento</h2>
            <p className="alex-intro">Preencha com cuidado. As respostas ajudam a montar uma orientação segura, individual e compatível com seus objetivos.</p>
            {notice ? <p className="alex-notice"><CheckCircle2 size={18} />{notice}</p> : null}
            <form className="alex-form" onSubmit={submit}>
              {fieldGroups.map((group) => (
                <fieldset key={group.title} className="alex-fieldset">
                  <legend>{group.title}</legend>
                  <div className="alex-field-grid">
                    {group.fields.map(([name, labelText, type, required]) => (
                      <label key={name} className={type === "textarea" ? "alex-field alex-field-wide" : "alex-field"}>
                        <span>{labelText}{required ? " *" : ""}</span>
                        {type === "textarea" ? <textarea name={name} required={required} rows={4} /> : <input name={name} type={type} required={required} />}
                      </label>
                    ))}
                  </div>
                  {group.title === "Histórico esportivo" ? (
                    <label className="alex-field alex-field-wide">
                      <span>Áudio opcional sobre a rotina de treinos</span>
                      <input name="trainingAudio" type="file" accept="audio/*" />
                    </label>
                  ) : null}
                </fieldset>
              ))}
              <fieldset className="alex-fieldset">
                <legend>Termos de participação</legend>
                <p className="alex-welcome"><strong>BEM-VINDO AO TIME!</strong> O resultado da corrida não se faz em um dia, uma semana ou um mês. Com treino consistente, perseverança, respeito aos limites do corpo e equilíbrio entre trabalho, família e corrida, a evolução aparece. Conte com o Professor Alex: o sucesso do atleta também é o sucesso do treinador e amigo.</p>
                <div className="alex-consents">
                  <label><input required name="methodologyConsent" type="checkbox" value="sim" /> Concordo em seguir a metodologia do Alex Lopes e em não divulgar ou compartilhar os treinos com terceiros. *</label>
                  <label><input name="socialConsent" type="checkbox" value="sim" /> Aceito ser marcado e repostado nas redes sociais como incentivo a outros corredores.</label>
                  <label><input name="teamProfileConsent" type="checkbox" value="sim" /> Aceito que meu perfil seja apresentado como atleta do Time Alex Lopes nas redes sociais.</label>
                </div>
              </fieldset>
              <button className="button button-primary" disabled={saving} type="submit">{saving ? "Enviando..." : "Enviar avaliação"}</button>
            </form>
          </section>
        </div>
      ) : null;

  return (
    <>
      <button className="button button-primary" type="button" onClick={() => setOpen(true)}>{label}</button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
