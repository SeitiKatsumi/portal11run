"use client";

import { FileCheck2, LoaderCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function MemberMedicalCertificate({ initialName }: { initialName?: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState(initialName ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setLoading(true);
    setMessage("");
    const form = new FormData();
    form.set("certificate", file);
    const response = await fetch("/api/members/medical-certificate", { method: "POST", body: form });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(result.error ?? "Não foi possível enviar o atestado.");
      return;
    }
    setFileName(result.fileName);
    setMessage("Atestado recebido e armazenado com acesso restrito.");
    router.refresh();
  }

  return (
    <section className="member-medical-upload">
      <div>
        {fileName ? <FileCheck2 size={22} /> : <Upload size={22} />}
        <span>
          <strong>Atestado de aptidão médica</strong>
          <small>{fileName || "PDF, JPG ou PNG · até 10 MB · arquivo privado"}</small>
        </span>
      </div>
      <button className="button secondary" type="button" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />}
        {fileName ? "Substituir atestado" : "Enviar atestado"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png"
        hidden
        onChange={(event) => upload(event.target.files?.[0])}
      />
      {message ? <small className="member-upload-message" role="status">{message}</small> : null}
    </section>
  );
}
