import { ChevronDown } from "lucide-react";
import { crossCountryFaq } from "@/lib/circuit-categories";
import styles from "./CrossCountryFaq.module.css";

export function CrossCountryFaq() {
  return <div className={styles.faq}>
    <h2>Dúvidas frequentes</h2>
    <p>Horários, inscrição e orientações para o dia da corrida.</p>
    {crossCountryFaq.map(({ question, answer }) => <details key={question}>
      <summary>{question}<ChevronDown size={18} aria-hidden="true" /></summary>
      <p>{answer}</p>
    </details>)}
  </div>;
}
