"use client";

import { FileHeart, LoaderCircle } from "lucide-react";
import { useState } from "react";
import styles from "./CircuitUI.module.css";

export function CircuitMedicalCertificateUpload({ submissionId }: { submissionId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  async function send(file?: File) {
    if (!file) return;
    if (!consent) {
      setMessage("Confirme a autorização de tratamento do atestado antes de selecionar o arquivo.");
      return;
    }
    setBusy(true);
    setMessage("");
    const form = new FormData();
    form.set("file", file);
    form.set("purpose", "MEDICAL_CERTIFICATE");
    form.set("website", "");
    const upload = await fetch("/api/circuito-virtual/upload", { method: "POST", body: form });
    const uploaded = await upload.json();
    if (!upload.ok) {
      setBusy(false);
      return setMessage(uploaded.error || "Falha no envio do arquivo.");
    }
    const response = await fetch("/api/circuito-virtual/medical-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, fileId: uploaded.fileId, healthDataConsent: consent })
    });
    const result = await response.json();
    setBusy(false);
    setMessage(result.message || result.error);
    if (response.ok) window.location.reload();
  }

  return (
    <div className={styles.medicalLaterUpload}>
      <label className={styles.medicalConsent}>
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>Autorizo o tratamento restrito do atestado médico para verificar a aptidão esportiva do atleta.</span>
      </label>
      <label>
        {busy ? <LoaderCircle className={styles.spin} size={18} /> : <FileHeart size={18} />}
        <span><strong>Enviar atestado agora</strong><small>PDF, JPG ou PNG · até 10 MB · acesso restrito</small></span>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => void send(event.target.files?.[0])} disabled={busy || !consent} />
      </label>
      {message ? <em>{message}</em> : null}
    </div>
  );
}
