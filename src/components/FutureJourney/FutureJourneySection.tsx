"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Flag,
  HeartHandshake,
  RotateCcw,
  Route,
  Sparkles,
  Target,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./future-journey.module.css";

type ViewMode = "idade" | "instituicao" | "oportunidade";

type JourneyAge = {
  age: number;
  label: string;
  phase: string;
  lead: string;
  support: string;
  opportunities: string[];
  next: string;
  zone: 1 | 2 | 3 | 4;
};

const journey: JourneyAge[] = [
  { age: 10, label: "Base iniciada", phase: "Formação de base", lead: "11Run Futuro", support: "Família e rede multidisciplinar", opportunities: ["Cultura do movimento", "Testes progressivos de 1.000 m", "Circuito 11Run Futuro"], next: "Ampliar repertório motor e experiências seguras.", zone: 1 },
  { age: 11, label: "Primeiras experiências", phase: "Formação de base", lead: "11Run Futuro", support: "Família e profissionais de apoio", opportunities: ["Circuito 11Run Futuro", "Copa Futuro FPA, conforme regulamento", "Orientação familiar"], next: "Participar sem antecipar pressão por resultado.", zone: 1 },
  { age: 12, label: "Vivência competitiva", phase: "Formação de base", lead: "11Run Futuro", support: "Família e rede técnica", opportunities: ["Circuito 11Run Futuro", "Copa Futuro FPA, conforme critérios", "Materiais e acompanhamento da evolução"], next: "Preparar uma transição gradual e individual.", zone: 1 },
  { age: 13, label: "Transição preparada", phase: "Transição acompanhada", lead: "11Run Futuro + IVCL/Orcampi", support: "Família e equipe técnica", opportunities: ["Histórico esportivo organizado", "Conexão com estrutura federada", "Planejamento de continuidade"], next: "Ingressar na estrutura federada quando houver aderência e critérios.", zone: 2 },
  { age: 14, label: "Estrutura federada", phase: "Desenvolvimento federado", lead: "IVCL/Orcampi", support: "11Run em apoio complementar", opportunities: ["Treinamento técnico", "Competições federadas", "Provas Sub-16, conforme regulamento"], next: "Construir regularidade, rotina e histórico homologado.", zone: 3 },
  { age: 15, label: "Histórico em construção", phase: "Desenvolvimento federado", lead: "IVCL/Orcampi", support: "11Run: materiais, conteúdo e visibilidade", opportunities: ["Marcas homologadas", "Maturidade competitiva", "Portfólio esportivo"], next: "Consolidar a trajetória antes de ampliar horizontes.", zone: 3 },
  { age: 16, label: "Escolha de caminhos", phase: "Brasil ou exterior", lead: "Atleta, família e Rede 11Run", support: "IVCL/Orcampi, escola e parceiros", opportunities: ["Ambiente competitivo de alto nível no Brasil", "Preparação acadêmica e esportiva para bolsas", "Portfólio, vídeos, resultados e plano individual"], next: "Escolher o ambiente que melhor sustenta a evolução do atleta.", zone: 4 },
  { age: 17, label: "Caminho em preparação", phase: "Desenvolvimento competitivo", lead: "Rede 11Run e estrutura escolhida", support: "Família, escola e equipe técnica", opportunities: ["Calendário competitivo no Brasil", "Elegibilidade e candidaturas internacionais", "Evolução esportiva e acadêmica acompanhada"], next: "Preparar cada oportunidade sem interromper o desenvolvimento.", zone: 4 },
  { age: 18, label: "Janelas de oportunidade", phase: "Brasil e exterior", lead: "Atleta, família e Rede 11Run", support: "Instituições educacionais e esportivas", opportunities: ["Equipes e centros competitivos no Brasil", "Bolsas compatíveis com o perfil no exterior", "Continuidade esportiva e educacional"], next: "Avaliar onde há o melhor ambiente competitivo e humano.", zone: 4 },
  { age: 19, label: "Continuidade de alto nível", phase: "Projeto esportivo de longo prazo", lead: "Atleta e estrutura escolhida", support: "Rede 11Run e instituições parceiras", opportunities: ["Alto rendimento no Brasil", "Experiência acadêmica e esportiva no exterior", "Novas janelas de desenvolvimento"], next: "Seguir evoluindo no Brasil ou no mundo, com propósito e suporte.", zone: 4 }
];

const responsibilities = [
  { title: "11Run", ages: "10–19", text: "Base, circuito, materiais, apoio institucional, conteúdo, visibilidade e preparação para oportunidades." },
  { title: "IVCL/Orcampi", ages: "13–15", text: "Treinamento, direção técnica, planejamento, competições federadas e condução esportiva do atleta." },
  { title: "Família e atleta", ages: "10–19", text: "Rotina, escola, compromisso, segurança, suporte emocional, documentos e decisões de continuidade." }
];

const opportunityGroups = [
  { title: "Base", ages: "10–13", text: "Circuito 11Run Futuro, testes de 1.000 m e experiências compatíveis com a idade." },
  { title: "Estrutura federada", ages: "13–15", text: "Competições, marcas homologadas e construção de histórico sob condução técnica do IVCL/Orcampi." },
  { title: "Brasil ou exterior", ages: "16–19", text: "Continuidade em um ambiente competitivo no Brasil ou preparação acadêmica e esportiva para bolsas no exterior, conforme o perfil e os objetivos do atleta." }
];

const ecosystem = [
  ["Família", "Rotina, segurança, suporte emocional e continuidade."],
  ["11Run Futuro", "Base, experiências, materiais, monitoramento e conexão de caminhos."],
  ["Treinadores", "Orientação técnica coerente com a fase do atleta."],
  ["IVCL/Orcampi", "Formação técnica, treinamento e participação federada."],
  ["Escola", "Desenvolvimento acadêmico e organização da rotina."],
  ["Rede multidisciplinar", "Apoio especializado quando necessário e disponível."],
  ["Competições", "Experiências esportivas conforme idade, critérios e regulamentos."],
  ["Apoiadores", "Recursos e conexões que fortalecem o ecossistema."],
  ["Instituições internacionais", "Processos acadêmicos e esportivos conforme perfil e elegibilidade."]
] as const;

const playbackAges = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export function FutureJourneySection() {
  const reduceMotion = useReducedMotion();
  const [selectedAge, setSelectedAge] = useState(12);
  const [mode, setMode] = useState<ViewMode>("idade");
  const [playbackOpen, setPlaybackOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [ecosystemItem, setEcosystemItem] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const current = useMemo(
    () => journey.find((item) => item.age === selectedAge) ?? journey[0],
    [selectedAge]
  );

  useEffect(() => {
    if (!playing || reduceMotion) return;
    const timer = window.setInterval(() => {
      setPlaybackIndex((index) => {
        if (index >= playbackAges.length - 1) {
          setPlaying(false);
          return index;
        }
        const next = index + 1;
        setSelectedAge(playbackAges[next]);
        return next;
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [playing, reduceMotion]);

  function startJourney() {
    setPlaybackIndex(0);
    setSelectedAge(10);
    setPlaybackOpen(true);
    setPlaying(!reduceMotion);
  }

  function movePlayback(delta: number) {
    setPlaying(false);
    setPlaybackIndex((index) => {
      const next = Math.min(playbackAges.length - 1, Math.max(0, index + delta));
      setSelectedAge(playbackAges[next]);
      return next;
    });
  }

  function selectAge(age: number) {
    setSelectedAge(age);
    const checkpoint = trackRef.current?.querySelector<HTMLElement>(`[data-age="${age}"]`);
    checkpoint?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  }

  function moveAge(delta: number) {
    const index = journey.findIndex((item) => item.age === selectedAge);
    const next = journey[Math.min(journey.length - 1, Math.max(0, index + delta))];
    if (next) selectAge(next.age);
  }

  return (
    <section className={styles.section} aria-labelledby="future-journey-title">
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Jornada 11Run Futuro</span>
          <h2 id="future-journey-title">Dos 10 aos 19 anos, cada etapa prepara a próxima.</h2>
          <p>Uma jornada estruturada entre formação de base, competição, transição federada e oportunidades internacionais.</p>
        </div>
        <div className={styles.metric}>
          <strong>10</strong>
          <span>anos de visão de futuro</span>
          <button type="button" onClick={startJourney}>
            <CirclePlay size={18} aria-hidden="true" />
            Explorar a jornada
          </button>
        </div>
      </div>

      <div className={styles.modeTabs} role="tablist" aria-label="Visualização da jornada">
        {([
          ["idade", "Ver por idade"],
          ["instituicao", "Ver por instituição"],
          ["oportunidade", "Ver por oportunidade"]
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            className={mode === value ? styles.activeTab : ""}
            onClick={() => setMode(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "idade" ? (
          <motion.div
            key="age-view"
            className={styles.journeyGrid}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          >
            <div className={styles.timelinePanel}>
              <div className={styles.timelineHeader}>
                <div>
                  <span className={styles.timelineKicker}>Linha do tempo</span>
                  <strong>Selecione uma idade</strong>
                </div>
                <div className={styles.timelineControls}>
                  <button type="button" aria-label="Idade anterior" disabled={selectedAge === 10} onClick={() => moveAge(-1)}>
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <span aria-live="polite">{selectedAge} de 19 anos</span>
                  <button type="button" aria-label="Próxima idade" disabled={selectedAge === 19} onClick={() => moveAge(1)}>
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div ref={trackRef} className={styles.track} aria-label="Idades da jornada de 10 a 19 anos">
                <div className={styles.trackLine} aria-hidden="true" />
                {journey.map((item) => (
                  <button
                    key={item.age}
                    data-age={item.age}
                    type="button"
                    aria-current={selectedAge === item.age ? "step" : undefined}
                    aria-label={`${item.age} anos: ${item.label}`}
                    className={`${styles.checkpoint} ${styles[`zone${item.zone}`]} ${selectedAge === item.age ? styles.activeCheckpoint : ""}`}
                    onClick={() => selectAge(item.age)}
                  >
                    <span>{item.age}</span>
                    <small>{item.label}</small>
                  </button>
                ))}
              </div>
              <div className={styles.timelineHint} aria-hidden="true">
                <span>Deslize para explorar</span>
                <ArrowRight size={15} />
              </div>
            </div>
            <JourneyDetail current={current} />
          </motion.div>
        ) : (
          <motion.div
            key={mode}
            className={styles.cardsView}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          >
            {(mode === "instituicao" ? responsibilities : opportunityGroups).map((item) => (
              <article key={item.title}>
                {mode === "instituicao" ? <Building2 aria-hidden="true" /> : <Target aria-hidden="true" />}
                <span>{item.ages}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className={styles.coreMessage}>
        A 11Run constrói a base, conecta o atleta à estrutura federada e prepara caminhos para o futuro.
      </p>

      <div className={styles.flow} aria-label="Fluxo institucional da jornada">
        {["11Run Futuro", "Base 10–13", "Transição acompanhada", "IVCL/Orcampi", "Desenvolvimento federado", "Escolha aos 16+", "Brasil ou exterior"].map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => selectAge(index < 2 ? 11 : index < 5 ? 14 : 17)}
          >
            <span>{item}</span>
            {index < 6 && <ArrowRight size={15} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div className={styles.progressBlock}>
        <div>
          <span className={styles.eyebrow}>Evolução conceitual</span>
          <h3>Uma construção progressiva, sem atalhos.</h3>
          <p>Repertório esportivo, experiência competitiva, histórico de resultados e possibilidades futuras se desenvolvem em ritmos individuais.</p>
        </div>
        <div className={styles.progressChart} role="img" aria-label={`Etapa conceitual selecionada: ${current.label}, aos ${current.age} anos`}>
          <svg viewBox="0 0 660 210" aria-hidden="true">
            <path d="M30 174 C120 170 120 142 210 138 S320 102 390 96 S500 60 630 34" />
            {journey.map((item, index) => {
              const x = 30 + index * 66.5;
              const y = 174 - index * 15;
              return <circle key={item.age} cx={x} cy={y} r={selectedAge === item.age ? 8 : 4} />;
            })}
          </svg>
          <div className={styles.progressLabels}>
            <span>Inicial</span>
            <span>Em desenvolvimento</span>
            <span>Em consolidação</span>
            <span>Preparado para novas oportunidades</span>
          </div>
        </div>
        <small>Representação conceitual da jornada. A evolução real varia de acordo com cada atleta.</small>
      </div>

      <div className={styles.ecosystem}>
        <div className={styles.ecosystemIntro}>
          <span className={styles.eyebrow}>Rede de desenvolvimento</span>
          <h3>Quem acompanha o atleta?</h3>
          <p>O desenvolvimento não acontece isoladamente. Selecione um integrante da rede para entender seu papel.</p>
          <div className={styles.ecosystemDetail}>
            <strong>{ecosystem[ecosystemItem][0]}</strong>
            <span>{ecosystem[ecosystemItem][1]}</span>
          </div>
        </div>
        <div className={styles.radial} aria-label="Rede que acompanha o atleta">
          <div className={styles.athlete}><Users aria-hidden="true" /><span>Atleta</span></div>
          {ecosystem.map(([title], index) => (
            <button
              key={title}
              type="button"
              className={`${styles.radialItem} ${styles[`radial${index + 1}`]} ${ecosystemItem === index ? styles.activeRadial : ""}`}
              aria-pressed={ecosystemItem === index}
              onClick={() => setEcosystemItem(index)}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.finalCta}>
        <div>
          <span className={styles.eyebrow}>Visão de longo prazo</span>
          <h3>Não acompanhamos apenas uma temporada. Construímos caminhos.</h3>
          <p>A jornada começa na base, continua na estrutura federada e, a partir dos 16 anos, apoia a escolha entre um ambiente competitivo no Brasil ou oportunidades acadêmicas e esportivas no exterior.</p>
          <div className={styles.indicators}>
            <span><strong>10–13</strong> Formação de base</span>
            <span><strong>13–15</strong> Transição e desenvolvimento federado</span>
            <span><strong>16–19</strong> Alto nível no Brasil ou bolsas no exterior</span>
          </div>
        </div>
        <div className={styles.ctaActions}>
          <Link href="#inscricao">Cadastrar um atleta <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link href="/apoie-o-projeto">Apoiar esta jornada <HeartHandshake size={17} aria-hidden="true" /></Link>
        </div>
      </div>

      <ol className={styles.srOnly}>
        {journey.map((item) => <li key={item.age}>{item.age} anos: {item.label}. {item.phase}. Responsável principal: {item.lead}.</li>)}
      </ol>

      <AnimatePresence>
        {playbackOpen && (
          <motion.div
            className={styles.playbackBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="Jornada completa"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className={styles.playback} initial={reduceMotion ? false : { scale: 0.97 }} animate={{ scale: 1 }}>
              <button className={styles.close} type="button" aria-label="Fechar jornada" onClick={() => { setPlaybackOpen(false); setPlaying(false); }}>
                <X aria-hidden="true" />
              </button>
              <span className={styles.eyebrow}>Etapa {playbackIndex + 1} de 10</span>
              <strong>{current.age} anos</strong>
              <h3>{current.label}</h3>
              <p>{current.phase} · {current.lead}</p>
              <div className={styles.playbackProgress}>
                {playbackAges.map((age, index) => <span key={age} className={index <= playbackIndex ? styles.done : ""} />)}
              </div>
              <div className={styles.playbackControls}>
                <button type="button" onClick={() => movePlayback(-1)} disabled={playbackIndex === 0}><ChevronLeft aria-hidden="true" /> Voltar</button>
                <button type="button" onClick={() => setPlaying((value) => !value)}>
                  {playing ? <CirclePause aria-hidden="true" /> : <CirclePlay aria-hidden="true" />}
                  {playing ? "Pausar" : "Continuar"}
                </button>
                <button type="button" onClick={() => movePlayback(1)} disabled={playbackIndex === 9}>Avançar <ChevronRight aria-hidden="true" /></button>
                <button type="button" onClick={() => { setPlaybackIndex(0); setSelectedAge(10); setPlaying(false); }}><RotateCcw aria-hidden="true" /> Reiniciar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function JourneyDetail({ current }: { current: JourneyAge }) {
  return (
    <article className={styles.detail} aria-live="polite">
      <div className={styles.detailTop}>
        <span>{current.age} anos</span>
        <Route aria-hidden="true" />
      </div>
      <h3>{current.label}</h3>
      <p className={styles.phase}>{current.phase}</p>
      <dl>
        <div><dt>Condução principal</dt><dd>{current.lead}</dd></div>
        <div><dt>Rede de apoio</dt><dd>{current.support}</dd></div>
      </dl>
      <h4>Possibilidades nesta etapa</h4>
      <ul>{current.opportunities.map((item) => <li key={item}><Sparkles size={14} aria-hidden="true" />{item}</li>)}</ul>
      <div className={styles.nextStep}><Flag size={17} aria-hidden="true" /><span><small>Próxima conexão</small>{current.next}</span></div>
    </article>
  );
}
