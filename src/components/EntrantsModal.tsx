"use client";

import { useMemo, useRef, useState } from "react";
import { List, Search, X } from "lucide-react";
import styles from "./EntrantsModal.module.css";

type Entrant = { name: string; category: string };

export function EntrantsModal({ entrants, className = "", title = "Lista de inscritos" }: { entrants: Entrant[]; className?: string; title?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const visibleEntrants = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("pt-BR");
    return search ? entrants.filter((entrant) => entrant.name.toLocaleLowerCase("pt-BR").includes(search)) : entrants;
  }, [entrants, query]);

  return <>
    <button type="button" className={`${styles.trigger} ${className}`} onClick={() => { setQuery(""); dialog.current?.showModal(); }}><List size={18} aria-hidden="true" />Ver lista de inscritos<span>{entrants.length}</span></button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="entrants-modal-title" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.modal}>
        <header><div><span className="eyebrow">inscritos no evento</span><h2 id="entrants-modal-title">{title}</h2><p>{entrants.length} {entrants.length === 1 ? "atleta inscrito" : "atletas inscritos"}</p></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Fechar lista de inscritos"><X aria-hidden="true" /></button></header>
        {entrants.length ? <><label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar atleta pelo nome" aria-label="Buscar inscrito por nome" /><span>{visibleEntrants.length} {visibleEntrants.length === 1 ? "resultado" : "resultados"}</span></label>{visibleEntrants.length ? <div className={styles.list} role="region" aria-label="Nomes e categorias dos inscritos" tabIndex={0}><table><thead><tr><th scope="col">Nome</th><th scope="col">Categoria</th></tr></thead><tbody>{visibleEntrants.map((entrant, index) => <tr key={`${entrant.name}-${entrant.category}-${index}`}><td>{entrant.name}</td><td>{entrant.category}</td></tr>)}</tbody></table></div> : <p className={styles.empty}>Nenhum inscrito encontrado para “{query.trim()}”.</p>}</> : <p className={styles.empty}>A lista de inscritos será exibida aqui assim que houver participantes.</p>}
      </div>
    </dialog>
  </>;
}
