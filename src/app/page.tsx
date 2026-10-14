import type { Metadata } from "next";
import { getHomeConfig } from "@/lib/home";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "11RUN | Ecossistema de Inteligência aplicada ao fundismo no Brasil",
  description:
    "Conheça o ecossistema 11RUN de inteligência aplicada ao fundismo, formação esportiva e alto rendimento no Brasil.",
  openGraph: {
    title: "11RUN — Ecossistema de Inteligência aplicada ao fundismo no Brasil",
    description: "Projetos que transformam talento em oportunidade.",
    images: ["/assets/home/grupo-11run-pista.webp"]
  }
};

export default function Home() {
  const { settings } = getHomeConfig();
  const useVideo = settings.hero_media_type === "video" && settings.hero_video;

  return (
    <section
      className={`${styles.hero} ${settings.content_alignment === "left" ? styles.alignLeft : ""}`}
      aria-labelledby="home-title"
    >
      <div className={styles.media} aria-hidden="true">
        {useVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={settings.hero_image}
            src={settings.hero_video || undefined}
          />
        ) : (
          <img src={settings.hero_image} alt="" fetchPriority="high" />
        )}
      </div>
      <div
        className={styles.overlay}
        style={{ backgroundColor: `rgb(12 13 13 / ${settings.overlay_strength / 100})` }}
      />

      <div className={styles.content}>
        <div className={styles.intro}>
          {settings.hero_kicker ? <span>{settings.hero_kicker}</span> : null}
          <h1 id="home-title">
            {settings.hero_title || "Ecossistema de Inteligência aplicada ao fundismo no Brasil"}
          </h1>
          {settings.hero_subtitle ? <p>{settings.hero_subtitle}</p> : null}
        </div>

      </div>
    </section>
  );
}
