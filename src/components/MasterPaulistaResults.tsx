"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Medal,
  Maximize2,
  Trophy,
  Users,
  X
} from "lucide-react";
import styles from "./MasterPaulistaResults.module.css";

const photos = [
  "40-titb-03805.webp",
  "04-2c1a1201.webp",
  "05-2c1a1551.webp",
  "06-2c1a1555.webp",
  "07-2c1a1650.webp",
  "08-2c1a1659.webp",
  "09-2c1a1780.webp",
  "10-2c1a1781.webp",
  "11-2c1a1792.webp",
  "12-abmcap11-4639.webp",
  "13-abmcap11-4810.webp",
  "14-abmcap11-4957.webp",
  "15-abmcap12-1030.webp",
  "16-abmcap12-1161.webp",
  "17-abmcap12-1232.webp",
  "18-abmcap12-1235.webp",
  "19-abmcap12-422.webp",
  "20-abmcap12-528.webp",
  "22-abmcap12-5372.webp",
  "24-abmcap12-5374.webp",
  "25-luc2-9321.webp",
  "26-luc2-9330.webp",
  "27-luc2-9481.webp",
  "28-luc2-9574.webp",
  "29-luc3-0556.webp",
  "30-luc5-0869.webp",
  "31-luc5-0874.webp",
  "32-luc5-1370.webp",
  "33-luc5-4687.webp",
  "34-luc5-4689.webp",
  "35-tit09164.webp",
  "36-tit09166.webp",
  "37-tit09212.webp",
  "38-tit09222.webp",
  "39-tit09517.webp",
  "01-133233422.webp",
  "02-133233423.webp",
  "03-133233424.webp"
].map((file) => `/assets/11-master/paulista-2026/${file}`);

const athletes = [
  {
    name: "Seiti Katsumi",
    category: "M50",
    summary: "3 ouros",
    events: ["800 m — ouro", "1.500 m — ouro", "5.000 m — ouro"],
    note: "Líder do ranking brasileiro nos 800 m"
  },
  {
    name: "Josimar Aparecido Ribeiro",
    category: "M35",
    summary: "2 ouros · 1 prata",
    events: ["800 m — ouro", "1.500 m — ouro", "5.000 m — prata"],
    note: "Líder do ranking brasileiro"
  },
  {
    name: "Edson Tiburcio Alves",
    category: "M45",
    summary: "2 ouros",
    events: ["1.500 m — ouro", "5.000 m — ouro"]
  },
  {
    name: "Leonardo Alves da Silva",
    category: "M40",
    summary: "1 ouro · 2 bronzes",
    events: ["1.500 m — ouro", "800 m — bronze", "5.000 m — bronze"]
  },
  {
    name: "Edinaldo Machado dos Santos",
    category: "M35",
    summary: "1 bronze",
    events: ["5.000 m — bronze"]
  }
];

const medalTotals = [
  { value: "12", label: "pódios", icon: Trophy },
  { value: "8", label: "medalhas de ouro", icon: Medal },
  { value: "1", label: "medalha de prata", icon: Award },
  { value: "3", label: "medalhas de bronze", icon: Medal }
];

export function MasterPaulistaResults() {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const move = (direction: number) => {
    setActive((current) => (current + direction + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen]);

  const activeAlt = active === 0
    ? "Equipe OnzeRun Master reunida com as medalhas do Campeonato Paulista de 2026"
    : `Atleta da OnzeRun Master em prova no Campeonato Paulista de 2026, foto ${active + 1}`;

  return (
    <section className={styles.section} id="paulista" aria-labelledby="paulista-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Estreia histórica · 2026</span>
          <h2 id="paulista-title">A primeira competição da OnzeRun Master já entrou para a história.</h2>
        </div>
        <p>
          No 68º Campeonato Paulista de Atletismo Master, a equipe estreou com resultados expressivos
          e uma identidade construída com união, cuidado e paixão pelo esporte.
        </p>
      </div>

      <div className={styles.metrics} aria-label="Resumo de medalhas">
        {medalTotals.map(({ value, label, icon: Icon }, index) => (
          <article key={label} className={index === 0 ? styles.metricPrimary : undefined}>
            <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      <div className={styles.galleryBlock}>
        <div className={styles.galleryCopy}>
          <span className={styles.eyebrow}>Álbum do Paulista</span>
          <h3>Resultados que ficam. Histórias que continuam.</h3>
          <p>
            Acompanhe os momentos da estreia: a concentração antes da largada, a entrega na pista
            e a celebração de uma equipe que corre e vence junta.
          </p>
          <div className={styles.galleryControls}>
            <button type="button" onClick={() => move(-1)} aria-label="Foto anterior">
              <ChevronLeft size={20} />
            </button>
            <span aria-live="polite">{String(active + 1).padStart(2, "0")} / {photos.length}</span>
            <button type="button" onClick={() => move(1)} aria-label="Próxima foto">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className={styles.gallery}>
          <button
            className={styles.mainPhoto}
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Ampliar foto selecionada"
          >
            <img src={photos[active]} alt={activeAlt} fetchPriority={active === 0 ? "high" : "auto"} />
            <span><Maximize2 size={16} /> Ampliar</span>
          </button>
          <div className={styles.thumbnails} role="list" aria-label="Selecionar foto do álbum">
            {photos.map((photo, index) => (
              <button
                key={photo}
                type="button"
                role="listitem"
                className={index === active ? styles.thumbnailActive : undefined}
                onClick={() => setActive(index)}
                aria-label={`Mostrar foto ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
              >
                <img src={photo} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.resultsIntro}>
        <span className={styles.eyebrow}>Resultados por atleta</span>
        <h3>Cinco atletas. Doze pódios. Uma conquista coletiva.</h3>
      </div>

      <div className={styles.athleteGrid}>
        {athletes.map((athlete) => (
          <article key={athlete.name} className={styles.athleteCard}>
            <header>
              <span>{athlete.category}</span>
              <strong>{athlete.summary}</strong>
            </header>
            <h4>{athlete.name}</h4>
            <ul>
              {athlete.events.map((event) => <li key={event}>{event}</li>)}
            </ul>
            {athlete.note && <p><Award size={15} /> {athlete.note}</p>}
          </article>
        ))}
      </div>

      <div className={styles.storyGrid}>
        <article>
          <Users size={24} aria-hidden="true" />
          <span className={styles.eyebrow}>O maior resultado</span>
          <h3>Uma equipe que vence junta.</h3>
          <p>
            Cada medalha teve seu valor, mas o maior resultado foi ver a equipe unida na organização,
            nos horários, no aquecimento e na torcida. Na OnzeRun, quando um atleta vence, todos vencem juntos.
          </p>
        </article>
        <article>
          <Trophy size={24} aria-hidden="true" />
          <span className={styles.eyebrow}>Cultura OnzeRun</span>
          <h3>Família, parceria e paixão pelo atletismo.</h3>
          <p>
            A imagem após a vitória de Seiti Katsumi nos 1.500 metros, com Aimê ao lado da equipe,
            traduz o espírito que queremos preservar em cada treino, viagem e competição.
          </p>
        </article>
      </div>

      <div className={styles.recruiting}>
        <div>
          <span className={styles.eyebrow}>Novos atletas master</span>
          <h3>Tem nível para disputar as primeiras posições e se identifica com essa cultura?</h3>
          <p>
            Buscamos atletas de Itatiba e região com foco em provas de fundo, potencial competitivo,
            respeito, companheirismo e presença. Uma equipe forte se constrói com resultado e com valores.
          </p>
        </div>
        <Link href="/cadastro/11-master" className={styles.cta}>
          Quero fazer parte <ArrowRight size={18} />
        </Link>
      </div>

      {lightboxOpen && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Álbum ampliado">
          <button className={styles.close} type="button" onClick={() => setLightboxOpen(false)} aria-label="Fechar álbum">
            <X size={22} />
          </button>
          <button className={styles.lightboxPrevious} type="button" onClick={() => move(-1)} aria-label="Foto anterior">
            <ChevronLeft size={28} />
          </button>
          <img src={photos[active]} alt={activeAlt} />
          <button className={styles.lightboxNext} type="button" onClick={() => move(1)} aria-label="Próxima foto">
            <ChevronRight size={28} />
          </button>
          <span className={styles.lightboxCount}>{active + 1} / {photos.length}</span>
        </div>
      )}
    </section>
  );
}
