import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Flag,
  Globe2,
  GraduationCap,
  Medal,
  Route,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon
} from "lucide-react";
import { getHomeConfig } from "@/lib/home";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "11RUN | Performance, formação e oportunidades na corrida",
  description:
    "Entre no ecossistema 11RUN e conheça projetos de formação, performance, circuito, atletas master, bolsas e oportunidades.",
  openGraph: {
    title: "11RUN — O futuro da corrida começa aqui",
    description: "Projetos que transformam talento em oportunidade.",
    images: ["/assets/home/ayla-podcast-hero.webp"]
  }
};

const icons: Record<string, LucideIcon> = {
  BarChart3,
  Flag,
  Globe2,
  GraduationCap,
  Medal,
  Route,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users
};

export default function Home() {
  const { settings, projects } = getHomeConfig();
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
          <h1 id="home-title">{settings.hero_title || "O futuro da corrida começa aqui."}</h1>
          {settings.hero_subtitle ? <p>{settings.hero_subtitle}</p> : null}
        </div>

        <nav className={styles.projectGrid} aria-label="Projetos 11RUN">
          {projects.map((project, index) => {
            const Icon = icons[project.icon] || Sparkles;
            return (
              <Link
                className={styles.projectCard}
                href={project.href}
                key={project.id}
                style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
              >
                <span className={styles.projectIcon}><Icon size={22} strokeWidth={1.55} /></span>
                <span className={styles.projectText}>
                  <strong>{project.name}</strong>
                  {project.description ? <small>{project.description}</small> : null}
                </span>
                <ArrowUpRight size={18} />
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
