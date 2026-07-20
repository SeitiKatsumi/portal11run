"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const familyPhotos = [
  {
    src: "/assets/trajetoria-seiti/familia/luhan-podio-paulista.webp",
    alt: "Luhan no pódio do Campeonato Paulista de Atletismo",
    caption: "Luhan no pódio do Campeonato Paulista de Atletismo."
  },
  {
    src: "/assets/trajetoria-seiti/familia/luhan-medalha.webp",
    alt: "Luhan exibindo uma medalha conquistada no atletismo",
    caption: "Cada conquista reforça uma história construída com constância."
  },
  {
    src: "/assets/trajetoria-seiti/familia/luhan-orcampi-com-alex.webp",
    alt: "Luhan ao lado de Seiti e do treinador Alex Lopes na pista do IVCL/Orcampi",
    caption: "Luhan, Seiti e Alex Lopes: formação, acompanhamento e confiança."
  },
  {
    src: "/assets/trajetoria-seiti/familia/aime-orcampi.webp",
    alt: "Aimê segurando seu novo tênis diante dos símbolos do IVCL/Orcampi",
    caption: "Aimê inicia sua própria caminhada acompanhada pelo IVCL/Orcampi."
  },
  {
    src: "/assets/trajetoria-seiti/familia/luhan-na-pista.webp",
    alt: "Luhan competindo em uma prova de pista",
    caption: "Da base para a pista: evolução que se confirma em cada prova."
  },
  {
    src: "/assets/trajetoria-seiti/familia/luhan-ivcl.webp",
    alt: "Luhan ao lado de um treinador do Instituto Vanderlei Cordeiro de Lima",
    caption: "Uma rede de pessoas que ajuda a transformar potencial em trajetória."
  }
] as const;

export function SeitiFamilySlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + familyPhotos.length) % familyPhotos.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % familyPhotos.length);
  }

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(showNext, 5500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <figure
      className="seiti-story-media seiti-family-slider"
      aria-roledescription="carrossel"
      aria-label="Registros de Luhan e Aimê no IVCL/Orcampi"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        if (start !== null && end !== undefined && Math.abs(start - end) > 45) {
          if (start > end) showNext();
          else showPrevious();
        }
        touchStart.current = null;
        setPaused(false);
      }}
    >
      <div className="seiti-family-slider-viewport">
        {familyPhotos.map((photo, index) => (
          <img
            className={index === activeIndex ? "is-active" : ""}
            src={photo.src}
            alt={index === activeIndex ? photo.alt : ""}
            aria-hidden={index !== activeIndex}
            loading={index === 0 ? "eager" : "lazy"}
            key={photo.src}
          />
        ))}

        <div className="seiti-family-slider-controls">
          <button type="button" onClick={showPrevious} aria-label="Mostrar foto anterior">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <span aria-live="polite">{activeIndex + 1} / {familyPhotos.length}</span>
          <button type="button" onClick={showNext} aria-label="Mostrar próxima foto">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <figcaption>{familyPhotos[activeIndex].caption}</figcaption>
      <div className="seiti-family-slider-dots" aria-label="Escolher uma foto">
        {familyPhotos.map((photo, index) => (
          <button
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`Mostrar foto ${index + 1}: ${photo.alt}`}
            aria-current={index === activeIndex ? "true" : undefined}
            key={photo.src}
          />
        ))}
      </div>
    </figure>
  );
}
