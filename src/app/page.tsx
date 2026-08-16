import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  Flag,
  Globe2,
  GraduationCap,
  Lightbulb,
  ListChecks,
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
  title: "11RUN | Ecossistema de Inteligência aplicada ao fundismo no Brasil",
  description:
    "Conheça o ecossistema 11RUN de inteligência aplicada ao fundismo, formação esportiva e alto rendimento no Brasil.",
  openGraph: {
    title: "11RUN — Ecossistema de Inteligência aplicada ao fundismo no Brasil",
    description: "Projetos que transformam talento em oportunidade.",
    images: ["/assets/home/ayla-trofeus-hero.webp"]
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

const referenceCtas = [
  { name: "Rankings", description: "Brasil e referências internacionais", href: "/referencias/ranking-brasil", icon: BarChart3 },
  { name: "Resultados", description: "Competições e rankings estaduais", href: "/referencias/resultados/estaduais-sub-16", icon: ListChecks },
  { name: "Calculadoras", description: "Pace, fórmulas e chance olímpica", href: "/referencias/calculadoras/chance-olimpica", icon: Calculator },
  { name: "Reflexões", description: "Ciência, formação e desenvolvimento", href: "/referencias/analises/o-fundo-comeca-na-infancia", icon: Lightbulb }
];

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
          <h1 id="home-title">
            {settings.hero_title || "Ecossistema de Inteligência aplicada ao fundismo no Brasil"}
          </h1>
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
        <nav className={styles.referenceGrid} aria-label="Referências 11RUN">
          {referenceCtas.map((item, index) => {
            const Icon = item.icon;
            return <Link className={`${styles.projectCard} ${styles.referenceCard}`} href={item.href} key={item.name} style={{ animationDelay: `${260 + index * 55}ms` }}><span className={styles.projectIcon}><Icon size={22} strokeWidth={1.55} /></span><span className={styles.projectText}><strong>{item.name}</strong><small>{item.description}</small></span><ArrowUpRight size={18} /></Link>;
          })}
        </nav>
      </div>
    </section>
  );
}
