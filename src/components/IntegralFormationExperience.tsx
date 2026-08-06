"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, CalendarDays, Check, ChevronDown, ExternalLink, GraduationCap, HeartHandshake, Printer, Route, Scale, School, Share2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { autonomySteps, decisionScenarios, formationFaq, formationPillars, formationReferences, integralManifesto } from "@/lib/formation-integral-content";
import styles from "@/app/referencias/analises/formacao-integral-do-atleta/page.module.css";

const week = [
  ["Seg", "Escola", "Treino leve"], ["Ter", "Escola + prova", "Recuperação"], ["Qua", "Escola", "Treino de pista"],
  ["Qui", "Estudo orientado", "Força"], ["Sex", "Escola", "Treino técnico"], ["Sáb", "Competição", "Convívio"], ["Dom", "Descanso", "Planejamento"]
] as const;

function track(name: string) {
  window.dispatchEvent(new CustomEvent("11run:analytics", { detail: { event: name } }));
}

export function IntegralFormationExperience() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(2);
  const [scenario, setScenario] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [filter, setFilter] = useState("Todos");
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(formationReferences.flatMap((item) => item.category)))], []);
  const references = filter === "Todos" ? formationReferences : formationReferences.filter((item) => item.category.includes(filter as never));

  useEffect(() => {
    track("analysis_formation_view");
    const fired = new Set<number>();
    const onScroll = () => {
      const root = document.documentElement;
      const value = Math.min(100, Math.round((root.scrollTop / Math.max(1, root.scrollHeight - root.clientHeight)) * 100));
      setProgress(value);
      [25, 50, 75, 90].forEach((point) => { if (value >= point && !fired.has(point)) { fired.add(point); track(`analysis_reading_${point}`); } });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const currentScenario = decisionScenarios[scenario];
  return <>
    <div className={styles.readingProgress} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

    <section className={styles.intro} id="introducao">
      <div><span className={styles.eyebrow}>A pergunta central</span><h2>Que tipo de atleta estamos formando?</h2></div>
      <div><p>Um atleta jovem não deve ser formado apenas para executar uma planilha, obedecer a comandos ou produzir resultados. Precisa aprender a compreender o processo, comunicar sensações, avaliar informações e construir caminhos.</p><strong>Um atleta capaz de correr, aprender, compreender, comunicar e decidir — dentro e fora das pistas.</strong></div>
    </section>

    <section className={styles.section} id="formacao">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Formação integral</span><h2>O visível e o invisível se desenvolvem juntos.</h2><p>Tempo, técnica e força aparecem no resultado. Conhecimento, identidade, vínculos, segurança e capacidade de decisão sustentam a trajetória.</p></header>
      <div className={styles.pillarGrid}>{formationPillars.map((pillar, index) => <article key={pillar.title}><span>0{index + 1}</span><h3>{pillar.title}</h3><p>{pillar.text}</p></article>)}</div>
      <div className={styles.pathDiagram} role="img" aria-label="A trajetória esportiva e a trajetória educacional convergem em uma formação integral"><div><Route /><strong>Trajetória esportiva</strong><span>treino · competição · recuperação</span></div><i /><div className={styles.pathCenter}><Sparkles /><strong>Formação integral</strong><span>uma trajetória, múltiplas dimensões</span></div><i /><div><GraduationCap /><strong>Trajetória educacional</strong><span>estudo · pensamento · projeto de vida</span></div></div>
    </section>

    <section className={styles.section} id="autonomia">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Autonomia estruturada</span><h2>Ter voz não significa caminhar sem direção.</h2><p>Autonomia cresce com explicação, escolhas proporcionais à idade, limites claros e adultos que assumem responsabilidade.</p></header>
      <div className={styles.autonomyLayout}><div className={styles.ladder} role="tablist" aria-label="Etapas de desenvolvimento da autonomia">{autonomySteps.map(([title], index) => <button key={title} role="tab" aria-selected={step === index} onClick={() => { setStep(index); track("analysis_autonomy_ladder_interaction"); }}><span>{index + 1}</span>{title}</button>)}</div><article className={styles.ladderPanel} role="tabpanel"><ShieldCheck /><span>Etapa {step + 1} de {autonomySteps.length}</span><h3>{autonomySteps[step][0]}</h3><p>{autonomySteps[step][1]}</p><small>A progressão não é uma prova, um score nem uma avaliação de personalidade.</small></article></div>
    </section>

    <section className={styles.section} id="pensamento-critico">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Pensamento crítico</span><h2>Informação também precisa de treino.</h2><p>Antes de transformar um vídeo, uma resposta de IA ou uma recomendação em conduta, o atleta precisa aprender a pausar e verificar.</p></header>
      <div className={styles.criticalGrid}>{[["Fonte", "Quem produziu e com qual qualificação?"], ["Evidência", "A afirmação mostra dados ou apenas convicção?"], ["Contexto", "Serve para esta idade, condição e objetivo?"], ["Interesse", "Há venda, patrocínio ou conflito envolvido?"], ["Risco", "Pode afetar saúde, proteção ou antidopagem?"], ["Decisão humana", "Quem precisa participar antes de agir?"]].map(([title,text]) => <article key={title}><BrainCircuit /><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className={styles.decisionLab}><div><span className={styles.eyebrow}>Laboratório de decisões · dados fictícios</span><h3>{currentScenario.title}</h3><p>{currentScenario.prompt}</p><div className={styles.scenarioNav}>{decisionScenarios.map((_, index) => <button key={index} aria-label={`Abrir cenário ${index + 1}`} aria-current={scenario === index ? "step" : undefined} onClick={() => { setScenario(index); setChoice(null); track("analysis_decision_scenario_start"); }}>{index + 1}</button>)}</div></div><div className={styles.choices}>{currentScenario.choices.map((item, index) => <button key={item} data-state={choice === null ? "idle" : index === currentScenario.answer ? "correct" : choice === index ? "incorrect" : "idle"} onClick={() => { setChoice(index); track("analysis_decision_scenario_complete"); }}><span>{String.fromCharCode(65 + index)}</span>{item}{choice !== null && index === currentScenario.answer ? <Check /> : null}</button>)}{choice !== null ? <p>{currentScenario.feedback}</p> : null}</div></div>
    </section>

    <section className={styles.section} id="dupla-carreira">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Dupla carreira</span><h2>Educação não é o plano B de quem “não deu certo”.</h2><p>Esporte e escola criam demandas simultâneas. Conciliá-las exige planejamento, comunicação e suporte — não apenas disciplina individual.</p></header>
      <div className={styles.calendar}><header><CalendarDays /><div><strong>Uma semana possível</strong><span>Exemplo educativo. Nenhum dado real é coletado ou armazenado.</span></div></header><div>{week.map(([day, education, sport]) => <article key={day}><strong>{day}</strong><span><School />{education}</span><span><Route />{sport}</span></article>)}</div></div>
      <p className={styles.legalNotice}><Scale /> O plano brasileiro de dupla carreira propõe adaptações e metas, mas isso não significa que ensino remoto, remarcação de avaliações ou flexibilidade estejam automaticamente disponíveis em todas as escolas.</p>
    </section>

    <section className={styles.section} id="brasil">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Contexto brasileiro</span><h2>No fundismo de base, distância também é logística.</h2></header>
      <div className={styles.brazilGrid}>{[["Deslocamento", "Treinos, escolas e competições podem estar em cidades diferentes."], ["Calendários", "Provas importantes e avaliações escolares nem sempre conversam."], ["Recursos", "Transporte, alimentação, conectividade e material afetam a permanência."], ["Rede de apoio", "Nenhum atleta deve depender de uma única pessoa para sustentar toda a trajetória."]].map(([title,text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className={styles.section} id="responsabilidades">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Responsabilidade compartilhada</span><h2>Autonomia não transfere aos jovens o peso do sistema.</h2></header>
      <div className={styles.roles}>{[[Users,"Atleta","Comunicar, aprender e participar conforme a idade."],[HeartHandshake,"Família","Escutar, proteger e coordenar expectativas."],[Route,"Treinador","Ensinar, explicar e criar um ambiente seguro."],[BookOpen,"Escola","Dialogar e buscar soluções possíveis sem reduzir a exigência educacional."],[ShieldCheck,"Projeto","Definir governança, proteção, privacidade e revisão humana."]].map(([Icon,title,text]) => { const RoleIcon = Icon as typeof Users; return <article key={String(title)}><RoleIcon /><h3>{String(title)}</h3><p>{String(text)}</p></article>; })}</div>
    </section>

    <section className={styles.method} id="metodo"><div><span className={styles.eyebrow}>Método conceitual 11RUN</span><h2>Correr. Compreender. Comunicar. Construir.</h2><p>O acompanhamento deve conectar trajetória esportiva, educação, proteção e projeto de vida sem criar score humano, prever carreira ou substituir profissionais.</p></div><ol>{["Observar contexto e evolução", "Explicar com linguagem acessível", "Escutar atleta, família e equipe", "Planejar esporte e educação", "Revisar decisões humanas", "Proteger dados e direitos"].map((item,index)=><li key={item}><span>0{index+1}</span>{item}</li>)}</ol></section>

    <section className={styles.voice}><ShieldCheck /><div><span className={styles.eyebrow}>Voz e proteção</span><h2>Ter voz também é uma forma de proteção.</h2></div><p>O atleta pode fazer perguntas, dizer que não entendeu, comunicar dor ou medo, procurar outro adulto, pedir a participação dos responsáveis e interromper uma situação insegura. Um canal formal só deve existir quando houver governança real para recebimento, confidencialidade, escalonamento e resposta.</p></section>

    <section className={styles.manifesto}>{integralManifesto.map((line) => <p key={line}>{line}</p>)}<strong>Não queremos formar apenas quem corre mais rápido hoje. Queremos formar pessoas capazes de compreender, sustentar e transformar a própria trajetória.</strong></section>

    <section className={styles.section} id="ciencia">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Evidências e limitações</span><h2>O que a ciência permite afirmar — e o que ainda não permite.</h2></header>
      <div className={styles.evidenceGrid}><article><strong>Há sustentação para afirmar que</strong>{["o desenvolvimento é multidimensional", "suporte social e institucional importa", "esporte e educação geram demandas simultâneas", "autonomia pode existir com regras", "jovens atletas precisam de proteção centrada em direitos"].map(item=><p key={item}><Check />{item}</p>)}</article><article><strong>Não há sustentação para afirmar que</strong>{["autonomia sempre melhora desempenho", "dupla carreira elimina sofrimento", "um modelo funciona igualmente em todo contexto", "uma plataforma prevê o futuro", "uma nota mede formação integral"].map(item=><p key={item}><span>×</span>{item}</p>)}</article></div>
      <header className={styles.libraryHeader}><div><span className={styles.eyebrow}>Biblioteca científica</span><h3>Fontes abertas para leitura e revisão.</h3></div><button onClick={() => { print(); track("analysis_print"); }}><Printer /> Imprimir análise</button></header>
      <div className={styles.filters} aria-label="Filtrar referências">{categories.map((category) => <button key={category} aria-pressed={filter === category} onClick={() => { setFilter(category); track("analysis_reference_filter"); }}>{category}</button>)}</div>
      <div className={styles.referenceGrid}>{references.map((reference) => <a key={reference.id} href={reference.url} target="_blank" rel="noreferrer" onClick={() => track("analysis_reference_open")}><span>{reference.type} · {reference.year}</span><h3>{reference.title}</h3><p>{reference.summary}</p><small><strong>Limitação:</strong> {reference.limitations}</small><footer>{reference.institution}<ExternalLink /></footer></a>)}</div>
    </section>

    <section className={styles.section} id="duvidas"><header className={styles.sectionHeading}><span className={styles.eyebrow}>Dúvidas frequentes</span><h2>Respostas diretas, sem promessas automáticas.</h2></header><div className={styles.faqList}>{formationFaq.map(([question,answer],index)=><details key={question} onToggle={(event)=>{if(event.currentTarget.open)track("analysis_faq_open")}}><summary><span>{String(index+1).padStart(2,"0")}</span><strong>{question}</strong><ChevronDown /></summary><p>{answer}</p></details>)}</div></section>

    <section className={styles.related}><div><span className={styles.eyebrow}>Leia também</span><h2>Mesma idade. Desenvolvimentos diferentes.</h2><p>Entenda por que atletas da mesma idade podem estar em momentos biológicos distintos e por que o desempenho atual não determina sozinho o potencial futuro.</p></div><Link href="/institucional/opiniao/mesma-idade-desenvolvimentos-diferentes" onClick={()=>track("analysis_related_article_click")}>Ler análise <ArrowRight /></Link></section>

    <section className={styles.finalCta}><GraduationCap /><span className={styles.eyebrow}>Formação e futuro</span><h2>Formar um atleta é prepará-lo para correr — e para construir os próprios caminhos.</h2><p>O resultado esportivo é parte da trajetória. Educação, consciência, proteção e autonomia ajudam a torná-la mais sustentável, compreendida e humana.</p><div><Link href="/onze-futuro" onClick={()=>track("analysis_onze_futuro_click")}>Conheça o Onze Futuro <ArrowRight /></Link><Link href="/cadastro/onze-futuro" onClick={()=>track("analysis_athlete_registration_click")}>Cadastre um atleta</Link><Link href="/apoie" onClick={()=>track("analysis_support_project_click")}>Apoie a formação integral</Link><button onClick={async()=>{track("analysis_share"); if(navigator.share) await navigator.share({title:document.title,url:location.href}); else await navigator.clipboard.writeText(location.href)}}><Share2 /> Compartilhar</button></div></section>
  </>;
}
