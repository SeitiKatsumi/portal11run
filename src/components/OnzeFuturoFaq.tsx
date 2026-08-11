"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarRange,
  ChevronDown,
  ClipboardList,
  Gamepad2,
  LayoutDashboard,
  Search,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { onzeFuturoFaqGroups } from "@/lib/onze-futuro-faq";
import styles from "./OnzeFuturoFaq.module.css";

const groupIcons = {
  projeto: CalendarRange,
  cadastro: ClipboardList,
  rede: UsersRound,
  painel: LayoutDashboard,
  gamificacao: Gamepad2,
  permanencia: BookOpenCheck,
  "estudos-rotina": BookOpenCheck,
  privacidade: ShieldCheck
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function OnzeFuturoFaq() {
  const [activeGroup, setActiveGroup] = useState("todos");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalize(deferredQuery);

  const filteredGroups = useMemo(
    () =>
      onzeFuturoFaqGroups
        .filter((group) => activeGroup === "todos" || group.id === activeGroup)
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            normalize(`${item.question} ${item.answer.join(" ")} ${group.title} ${group.description}`).includes(
              normalizedQuery
            )
          )
        }))
        .filter((group) => group.items.length > 0),
    [activeGroup, normalizedQuery]
  );

  const resultCount = filteredGroups.reduce((total, group) => total + group.items.length, 0);

  return (
    <section className={`futuro-section ${styles.section}`} id="faq" aria-labelledby="onze-futuro-faq-title">
      <header className={styles.header}>
        <div>
          <span className="eyebrow">central de orientação</span>
          <h2 id="onze-futuro-faq-title">Super FAQ do Onze Futuro</h2>
          <p>
            Uma referência para atletas, pais, responsáveis, treinadores, escolas e profissionais que acompanham a
            formação — do primeiro cadastro ao uso completo do painel.
          </p>
        </div>
        <div className={styles.audiences} aria-label="Públicos atendidos pela FAQ">
          {[
            "Atletas",
            "Famílias",
            "Treinadores",
            "Escolas",
            "Projetos",
            "Equipe multidisciplinar"
          ].map((audience) => (
            <span key={audience}>{audience}</span>
          ))}
        </div>
      </header>

      <aside className={styles.cycle} aria-label="Regra de continuidade do projeto">
        <div className={styles.cycleIcon}>
          <CalendarRange aria-hidden="true" />
        </div>
        <div>
          <span>Regra essencial do ciclo</span>
          <h3>Projeto piloto 2026–2029, com permanência acompanhada — não automática.</h3>
          <p>
            Família e 11RUN podem solicitar a desvinculação a qualquer tempo. Contratempos, saúde, escola, questões
            familiares, mudanças de rotina ou treinador, segurança e desalinhamentos de objetivos, sonhos,
            expectativas, comportamento ou contexto de desempenho são avaliados com diálogo, privacidade e respeito
            ao melhor interesse da criança.
          </p>
        </div>
        <div className={styles.cycleStats} aria-label="Resumo da FAQ">
          <span>
            <strong>{onzeFuturoFaqGroups.reduce((total, group) => total + group.items.length, 0)}</strong>
            respostas
          </span>
          <span>
            <strong>4</strong>
            módulos gamificados
          </span>
        </div>
      </aside>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Buscar na FAQ</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busque por painel, boletim, treinador, saída, privacidade…"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca">
              Limpar
            </button>
          ) : null}
        </label>

        <div className={styles.filters} aria-label="Filtrar perguntas por assunto">
          <button
            type="button"
            className={activeGroup === "todos" ? styles.activeFilter : undefined}
            aria-pressed={activeGroup === "todos"}
            onClick={() => setActiveGroup("todos")}
          >
            Todos
          </button>
          {onzeFuturoFaqGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={activeGroup === group.id ? styles.activeFilter : undefined}
              aria-pressed={activeGroup === group.id}
              onClick={() => setActiveGroup(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
        <p className={styles.results} role="status" aria-live="polite">
          {resultCount} {resultCount === 1 ? "resposta encontrada" : "respostas encontradas"}
        </p>
      </div>

      {resultCount ? (
        <div className={styles.groups}>
          {filteredGroups.map((group) => {
            const Icon = groupIcons[group.id as keyof typeof groupIcons] ?? BookOpenCheck;
            return (
              <article className={styles.group} key={group.id}>
                <header>
                  <span className={styles.groupIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <span>{group.label}</span>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                </header>
                <div className={styles.questions}>
                  {group.items.map((item) => (
                    <details key={item.id} className={styles.question}>
                      <summary>
                        <span>{item.question}</span>
                        <ChevronDown size={19} aria-hidden="true" />
                      </summary>
                      <div>
                        {item.answer.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <Search aria-hidden="true" />
          <h3>Nenhuma resposta encontrada</h3>
          <p>Tente outro termo ou volte para a visualização de todos os assuntos.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveGroup("todos");
            }}
          >
            Ver todas as perguntas
          </button>
        </div>
      )}

      <footer className={styles.resources}>
        <div>
          <span className="eyebrow">documentos relacionados</span>
          <h3>Consulte a regra completa antes de enviar o cadastro.</h3>
          <p>A FAQ orienta. Os termos aceitos, políticas, diretrizes e regulamentos formalizam cada relação.</p>
        </div>
        <nav aria-label="Documentos e acessos do Onze Futuro">
          <Link href="/politica-de-privacidade">
            Política de Privacidade <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/termos-de-uso">
            Termos de Uso <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/institucional/diretrizes-aos-atletas">
            Diretrizes aos Atletas <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/meu-painel">
            Acessar o painel <ArrowUpRight aria-hidden="true" />
          </Link>
        </nav>
      </footer>
    </section>
  );
}
