"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import styles from "./MasterTeamSlider.module.css";

const team = [
  ["01-time.webp", "Time 11RUN"],
  ["02-tatiele-carvalho.webp", "Tatiele Carvalho"],
  ["03-silvano-lima-pinto.webp", "Silvano Lima Pinto"],
  ["04-seiti-katsumi.webp", "Seiti Katsumi"],
  ["05-josimar-aparecido-ribeiro.webp", "Josimar Aparecido Ribeiro"],
  ["06-robson-alvarenga.webp", "Robson Alvarenga"],
  ["07-leandro-cordeiro-marcelino.webp", "Leandro Cordeiro Marcelino"],
  ["08-ana-paula-pandolfi-soares.webp", "Ana Paula Pandolfi Soares"],
  ["09-vanessa-fernanda-padilha.webp", "Vanessa Fernanda Padilha"]
] as const;

const assetPath = "/assets/11-master/trofeu-brasil-2026/time";

export function MasterTeamSlider() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const next = (index + team.length) % team.length;
    const slide = viewportRef.current?.querySelectorAll<HTMLElement>("[data-slide]")[next];
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActive(next);
  };

  const syncActive = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slides = [...viewport.querySelectorAll<HTMLElement>("[data-slide]")];
    const closest = slides.reduce(
      (best, slide, index) =>
        Math.abs(slide.offsetLeft - viewport.scrollLeft) < best.distance
          ? { index, distance: Math.abs(slide.offsetLeft - viewport.scrollLeft) }
          : best,
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );
    setActive(closest.index);
  };

  return (
    <section className={styles.section} aria-labelledby="master-team-title">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Time confirmado · Troféu Brasil 2026</span>
          <h2 id="master-team-title">As feras que representarão a 11RUN em Porto Alegre.</h2>
        </div>
        <p>De 18 a 20 de setembro, atletas de diferentes categorias entram na pista pelo time 11RUN.</p>
        <div className={styles.controls}>
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Card anterior">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Próximo card">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div
        ref={viewportRef}
        className={styles.viewport}
        onScroll={syncActive}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") goTo(active - 1);
          if (event.key === "ArrowRight") goTo(active + 1);
        }}
        role="region"
        aria-label="Cards do time do Troféu Brasil"
        tabIndex={0}
      >
        <div className={styles.track}>
          {team.map(([file, name], index) => (
            <figure className={styles.card} data-slide key={file}>
              <Image
                src={`${assetPath}/${file}`}
                alt={`${name} no time 11RUN para o Troféu Brasil Master 2026`}
                width={1080}
                height={1350}
                sizes="(max-width: 640px) 82vw, (max-width: 900px) 44vw, 30vw"
                priority={index === 0}
              />
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className={styles.dots} aria-label="Selecionar card">
        {team.map(([, name], index) => (
          <button
            type="button"
            key={name}
            className={index === active ? styles.activeDot : undefined}
            onClick={() => goTo(index)}
            aria-label={`Ver ${name}`}
            aria-current={index === active ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
