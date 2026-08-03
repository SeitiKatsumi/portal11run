import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, Gauge, ShieldCheck } from "lucide-react";
import { adminNavigationGroups } from "@/lib/admin-navigation";
import styles from "./admin-overview.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Visão geral | Admin 11RUN", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className={styles.overview}>
      <section className={styles.hero}>
        <div>
          <span className="eyebrow">Painel administrativo</span>
          <h1>Central de operação 11RUN.</h1>
          <p>Encontre rapidamente cadastros, projetos, apoios, finanças e conteúdo. Cada módulo preserva suas ferramentas e histórico de trabalho.</p>
        </div>
        <div className={styles.heroActions}>
          <Link className={styles.primary} href="/admin/cadastros">Abrir cadastros <ArrowUpRight size={16} /></Link>
          <Link className={styles.secondary} href="/">Ver portal <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className={styles.principles} aria-label="Características do painel">
        <article><Gauge /><div><strong>Acesso direto</strong><span>Todos os módulos em uma navegação única.</span></div></article>
        <article><Database /><div><strong>Dados centralizados</strong><span>Operações conectadas ao mesmo portal.</span></div></article>
        <article><ShieldCheck /><div><strong>Área protegida</strong><span>Conteúdo restrito à equipe administrativa.</span></div></article>
      </section>

      <section className={styles.groups} aria-label="Módulos administrativos">
        {adminNavigationGroups.filter((group) => group.label !== "Principal").map((group) => (
          <section className={styles.group} key={group.label}>
            <header className={styles.groupHeader}><h2>{group.label}</h2><span>{group.items.length} módulos</span></header>
            <div className={styles.grid}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className={styles.card} href={item.href} key={item.href}>
                    <span className={styles.cardIcon}><Icon size={19} /></span>
                    <span className={styles.cardCopy}><strong>{item.label}</strong><span>{item.description}</span></span>
                    <ArrowUpRight size={16} />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
