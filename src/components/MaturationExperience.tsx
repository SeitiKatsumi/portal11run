"use client";

import { useState } from "react";
import { ArrowUpRight, BrainCircuit, ChevronDown, CircleCheck, Clock3, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { developmentFactors, faqs, manifesto, scientificReferences } from "@/lib/maturation-content";
import styles from "@/app/institucional/opiniao/mesma-idade-desenvolvimentos-diferentes/page.module.css";

const scenarios = [
  { label: "Atleta A", pace: "maturação mais adiantada", note: "Pode apresentar vantagem física temporária em algumas tarefas." },
  { label: "Atleta B", pace: "maturação intermediária", note: "Pode responder de outro modo ao mesmo estímulo e à mesma prova." },
  { label: "Atleta C", pace: "maturação mais tardia", note: "Pode precisar de mais tempo para expressar capacidades que ainda estão em desenvolvimento." }
] as const;

export function MaturationExperience() {
  const [scenario, setScenario] = useState(0);
  const [month, setMonth] = useState(0);
  const selected = scenarios[scenario];

  return <>
    <section className={styles.question} id="entenda">
      <div><span className={styles.eyebrow}>A pergunta que muda a leitura</span><h2>Mesma idade significa mesmo desenvolvimento?</h2></div>
      <p>Não necessariamente. Duas crianças podem ter a mesma idade cronológica e viver momentos diferentes de crescimento, coordenação, força, experiência e maturação. O cronômetro registra uma marca; ele não explica, sozinho, tudo o que existe por trás dela.</p>
    </section>

    <section className={styles.section} id="diferencas">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Quatro lentes</span><h2>O resultado de hoje precisa de contexto.</h2><p>Crescimento não é sinônimo de maturação, e maturação não é sinônimo de talento.</p></header>
      <div className={styles.factorGrid}>{developmentFactors.map((factor, index) => <article key={factor.title}><span>0{index + 1}</span><h3>{factor.title}</h3><p>{factor.text}</p></article>)}</div>
    </section>

    <section className={styles.section} id="crescimento">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Cenário educativo</span><h2>Três trajetórias. Nenhum rótulo.</h2><p>Os exemplos são fictícios e não representam diagnóstico nem previsão.</p></header>
      <div className={styles.scenarioTabs} role="tablist" aria-label="Cenários fictícios">{scenarios.map((item, index) => <button key={item.label} role="tab" aria-selected={scenario === index} onClick={() => setScenario(index)}>{item.label}</button>)}</div>
      <div className={styles.scenarioPanel} role="tabpanel"><div className={styles.avatar}>{String.fromCharCode(65 + scenario)}</div><div><small>{selected.label} · exemplo fictício</small><h3>{selected.pace}</h3><p>{selected.note}</p></div><strong>O estágio atual não determina o potencial futuro.</strong></div>
      <div className={styles.simulator}>
        <div><span className={styles.eyebrow}>Simulador de idade relativa</span><h3>Alguns meses podem mudar a fotografia.</h3><p>Em uma categoria organizada por ano, mova o controle para comparar uma criança fictícia nascida no início ou no fim do período de corte.</p></div>
        <div className={styles.sliderBox}><label htmlFor="month">Mês fictício de nascimento: <strong>{["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"][month]}</strong></label><input id="month" type="range" min="0" max="11" value={month} onChange={(event) => setMonth(Number(event.target.value))} /><div className={styles.ageMeter}><span style={{ width: `${100 - month * 7.2}%` }} /></div><p>Dentro da mesma categoria anual, esta criança fictícia pode ter até <strong>{11 - month} meses</strong> de diferença para quem nasceu em dezembro. Isso é contexto, não sentença.</p></div>
      </div>
    </section>

    <section className={styles.darkSection} id="talento">
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>Identificação de talentos</span><h2>Uma fotografia pode favorecer quem amadureceu antes.</h2><p>Selecionar apenas pelo resultado atual pode confundir vantagem momentânea com potencial de longo prazo.</p></div>
      <div className={styles.flow}><div><Clock3 /><strong>Marca atual</strong><span>um ponto no tempo</span></div><i>+</i><div><BrainCircuit /><strong>Contexto</strong><span>crescimento, prática e ambiente</span></div><i>=</i><div><Sparkles /><strong>Trajetória</strong><span>acompanhamento contínuo</span></div></div>
      <blockquote>“O resultado de hoje é uma fotografia. O desenvolvimento é um filme.”</blockquote>
    </section>

    <section className={styles.section} id="metodo">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Método 11RUN</span><h2>Alta performance com tempo, cuidado e decisões humanas.</h2></header>
      <div className={styles.methodGrid}>{["Observar a própria evolução", "Cruzar múltiplas informações", "Revisar decisões ao longo do tempo", "Adaptar expectativas e estímulos", "Preservar saúde, escola e infância", "Usar tecnologia apenas como apoio"].map((item) => <article key={item}><CircleCheck /><span>{item}</span></article>)}</div>
      <p className={styles.notice}><ShieldCheck /> Análise de apoio. Requer interpretação humana e não constitui diagnóstico.</p>
    </section>

    <section className={styles.audience} id="familias">
      <article><HeartHandshake /><span className={styles.eyebrow}>Para famílias</span><h2>Acompanhe sem antecipar a pressão.</h2><ul><li>Pergunte sobre a experiência, não apenas sobre o tempo.</li><li>Proteja sono, alimentação, estudo, lazer e vínculos.</li><li>Procure profissionais quando houver dor, desconforto ou dúvida.</li><li>Evite comparar corpos, ritmos e resultados.</li></ul></article>
      <article><BrainCircuit /><span className={styles.eyebrow}>Para treinadores</span><h2>Interprete marcas dentro de uma trajetória.</h2><ul><li>Considere idade relativa, experiência e histórico.</li><li>Observe coordenação durante períodos de crescimento rápido.</li><li>Não use estimativas isoladas para selecionar ou excluir.</li><li>Registre tendências e revise hipóteses com a equipe.</li></ul></article>
    </section>

    <section className={styles.manifesto}><header><span className={styles.eyebrow}>Manifesto de responsabilidade</span><h2>Tecnologia deve ampliar o cuidado — nunca substituir a responsabilidade.</h2></header><div>{manifesto.map((item) => <p key={item}><ShieldCheck /> O 11RUN se compromete a {item}.</p>)}</div></section>

    <section className={styles.section} id="ciencia">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Base científica</span><h2>Ciência do esporte, traduzida sem perder as limitações.</h2><p>Ciência evolui. O conteúdo desta página deve ser revisado periodicamente.</p></header>
      <div className={styles.referenceGrid}>{scientificReferences.map((reference) => <a key={reference.title} href={reference.url} target="_blank" rel="noreferrer"><span>{reference.category} · {reference.year}</span><h3>{reference.title}</h3><p>{reference.summary}</p><small>{reference.authors} · {reference.publication}</small><ArrowUpRight /></a>)}</div>
    </section>

    <section className={styles.section} id="duvidas">
      <header className={styles.sectionHeading}><span className={styles.eyebrow}>Dúvidas frequentes</span><h2>Respostas diretas, sem promessas absolutas.</h2></header>
      <div className={styles.faqList}>{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{String(index + 1).padStart(2,"0")}</span><strong>{question}</strong><ChevronDown /></summary><p>{answer}</p></details>)}</div>
    </section>
  </>;
}
