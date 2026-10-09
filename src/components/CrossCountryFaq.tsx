import { ChevronDown } from "lucide-react";
import { crossCountryFaq } from "@/lib/circuit-categories";
import styles from "./CrossCountryFaq.module.css";

export function CrossCountryFaq() {
  return <div className={styles.faq}>
    <h2>Dúvidas frequentes</h2>
    <p>Horários, inscrição e orientações para o dia da corrida.</p>
    {crossCountryFaq.map((item) => <details key={item.question}>
      <summary>{item.question}<ChevronDown size={18} aria-hidden="true" /></summary>
      <p>{item.answer}{"link" in item ? <><br /><a href={item.link} target="_blank" rel="noopener noreferrer">Como chegar ao IVCL ↗</a></> : null}</p>
    </details>)}
  </div>;
}
