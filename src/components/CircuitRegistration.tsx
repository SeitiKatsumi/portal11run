"use client";

import { Check, ChevronLeft, ChevronRight, FileCheck2, FileHeart, Info, LoaderCircle, LockKeyhole, Send, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./CircuitUI.module.css";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const consentItems = [
  ["LEGAL_GUARDIAN", "Declaro ser pai, mãe, tutor ou responsável legal pelo atleta."],
  ["BRAZILIAN_NATIONALITY", "Declaro que o atleta possui nacionalidade brasileira, residindo no Brasil ou no exterior."],
  ["DATA_TRUE", "Confirmo que os dados fornecidos são verdadeiros."],
  ["PARTICIPATION", "Autorizo a participação do atleta no Circuito Virtual 11Run."],
  ["DATA_PROCESSING", "Autorizo o tratamento dos dados para inscrição, validação, ranking e premiação."],
  ["RANKING_PUBLICATION", "Autorizo a publicação do nome público, cidade, estado, categoria e marca."],
  ["REGULATIONS", "Li e aceito o regulamento da edição."],
  ["ACTIVITY_AUTHENTICITY", "Declaro que a atividade foi realizada pelo atleta cadastrado."],
  ["PUBLIC_EVIDENCE", "Confirmo que os links permanecerão públicos durante a análise."]
  ,["HEALTH_DATA_PROCESSING", "Autorizo, de forma específica e destacada, o tratamento privado do atestado e dos dados de saúde estritamente necessários à segurança e validação da participação."]
  ,["HEALTH_RISK_ACKNOWLEDGMENT", "Declaro que informei corretamente a condição de saúde do atleta, seguirei orientação médica e interromperei a atividade diante de sintomas. Reconheço os riscos inerentes à corrida antes, durante e após a atividade, sem excluir responsabilidades previstas em lei."]
] as const;

type FormState = Record<string, string | boolean>;

const initial: FormState = {
  athleteState: "SP", gender: "FEMALE", guardianRelationship: "Mãe", type: "OFFICIAL_COMPETITION",
  activityState: "SP", mediaPromotion: false, medicalMethod: "MEDICAL_CERTIFICATE", medicalCommitment: false
};

function category(birthDate: string) {
  const year = Number(birthDate.slice(0, 4));
  const age = 2026 - year;
  return age >= 9 && age <= 13 ? `${age} anos` : "Fora das categorias desta edição";
}

export function CircuitRegistration({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(initial);
  const [fileId, setFileId] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [medicalFileId, setMedicalFileId] = useState("");
  const [medicalFileName, setMedicalFileName] = useState("");
  const [medicalUploading, setMedicalUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const set = (key: string, value: string | boolean) => setData((current) => ({ ...current, [key]: value }));
  const athleteCategory = useMemo(() => category(String(data.athleteBirthDate ?? "")), [data.athleteBirthDate]);

  async function uploadDocument(file?: File) {
    if (!file) return;
    setUploading(true); setMessage(null);
    const body = new FormData(); body.set("file", file); body.set("purpose", "ATHLETE_DOCUMENT"); body.set("website", "");
    const response = await fetch("/api/circuito-virtual/upload", { method: "POST", body });
    const result = await response.json();
    setUploading(false);
    if (!response.ok) return setMessage({ type: "error", text: result.error || "Falha no upload." });
    setFileId(result.fileId); setFileName(result.fileName);
  }

  async function uploadMedicalCertificate(file?: File) {
    if (!file) return;
    setMedicalUploading(true); setMessage(null);
    const body = new FormData();
    body.set("file", file);
    body.set("purpose", "MEDICAL_CERTIFICATE");
    body.set("website", "");
    const response = await fetch("/api/circuito-virtual/upload", { method: "POST", body });
    const result = await response.json();
    setMedicalUploading(false);
    if (!response.ok) return setMessage({ type: "error", text: result.error || "Falha no upload do atestado." });
    setMedicalFileId(result.fileId);
    setMedicalFileName(result.fileName);
  }

  function validateStep() {
    const required: Record<number, string[]> = {
      1: ["athleteFullName","athletePublicName","athleteCpf","athleteBirthDate","athleteCity","athleteState","gender"],
      2: ["guardianFullName","guardianCpf","guardianRelationship","guardianEmail","guardianPhone","guardianBirthDate"],
      3: ["type"],
      4: ["activityDate","activityTime","activityCity","activityState"],
      5: consentItems.map(([key]) => key)
    };
    if (required[step]?.some((key) => !data[key])) {
      setMessage({ type: "error", text: "Preencha todos os campos obrigatórios desta etapa." }); return false;
    }
    if (step === 1 && !fileId) { setMessage({ type: "error", text: "Envie o documento comprobatório do atleta." }); return false; }
    if (step === 2) {
      if (!data.medicalGuardianCpf) {
        setMessage({ type: "error", text: "Confirme o CPF do responsável na seção de aptidão médica." }); return false;
      }
      if (data.medicalMethod === "MEDICAL_CERTIFICATE" && !medicalFileId) {
        setMessage({ type: "error", text: "Envie o atestado médico ou selecione o compromisso de envio posterior." }); return false;
      }
      if (data.medicalMethod === "GUARDIAN_COMMITMENT" && data.medicalCommitment !== true) {
        setMessage({ type: "error", text: "Aceite o compromisso formal de envio posterior do atestado." }); return false;
      }
    }
    if (step === 4) {
      const activityDate = String(data.activityDate ?? "");
      if (activityDate > endDate) {
        setMessage({ type: "error", text: "A atividade deve ter sido realizada até 15/12/2026." }); return false;
      }
      if (data.type === "OFFICIAL_COMPETITION" && (!data.competitionName || !data.organizer || !data.officialResultUrl)) {
        setMessage({ type: "error", text: "Informe competição, entidade e resultado oficial." }); return false;
      }
      if (data.type === "TRACK_400M" && (!data.trackName || !data.videoUrl)) {
        setMessage({ type: "error", text: "Informe a pista e o vídeo público." }); return false;
      }
      if (data.type === "OPEN_COURSE" && (!data.videoUrl || !data.stravaUrl)) {
        setMessage({ type: "error", text: "Informe o vídeo e a atividade pública no Strava." }); return false;
      }
    }
    setMessage(null); return true;
  }

  function next() { if (validateStep()) setStep((value) => Math.min(6, value + 1)); }

  async function submit() {
    setSending(true); setMessage(null);
    const evidence =
      data.type === "OFFICIAL_COMPETITION"
        ? [{ type: "OFFICIAL_RESULT", url: data.officialResultUrl }]
        : data.type === "TRACK_400M"
          ? [{ type: "VIDEO", url: data.videoUrl }]
          : [{ type: "VIDEO", url: data.videoUrl }, { type: "STRAVA", url: data.stravaUrl }];
    const payload = {
      website: "",
      athlete: {
        fullName: data.athleteFullName, publicName: data.athletePublicName, cpf: data.athleteCpf,
        birthDate: data.athleteBirthDate, city: data.athleteCity, state: data.athleteState,
        gender: data.gender, documentFileId: fileId
      },
      guardian: {
        fullName: data.guardianFullName, cpf: data.guardianCpf, relationship: data.guardianRelationship,
        email: data.guardianEmail, phone: data.guardianPhone, birthDate: data.guardianBirthDate
      },
      medical: {
        method: data.medicalMethod,
        certificateFileId: medicalFileId || undefined,
        guardianCpfConfirmation: data.medicalGuardianCpf,
        commitmentAccepted: data.medicalCommitment === true
      },
      coach: data.coachName ? {
        fullName: data.coachName, cpf: data.coachCpf, cref: data.coachCref, crefState: data.coachCrefState,
        organization: data.coachOrganization, email: data.coachEmail, phone: data.coachPhone
      } : undefined,
      submission: {
        type: data.type, activityDate: data.activityDate, time: data.activityTime,
        city: data.activityCity, state: data.activityState,
        details: {
          competitionName: data.competitionName || null, organizer: data.organizer || null,
          heatNumber: data.heatNumber || null, trackName: data.trackName || null,
          laps: data.type === "TRACK_400M" ? 2.5 : null, notes: data.activityNotes || null
        },
        evidence
      },
      consents: Object.fromEntries([...consentItems.map(([key]) => [key, data[key] === true]), ["MEDIA_PROMOTION", data.mediaPromotion === true]]),
      meta: {}
    };
    const response = await fetch("/api/circuito-virtual/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    const result = await response.json(); setSending(false);
    if (!response.ok) return setMessage({ type: "error", text: result.error || "Não foi possível enviar." });
    setMessage({ type: "success", text: result.message });
  }

  return (
    <div className={styles.registration}>
      <div className={styles.formIntro}>
        <span className={styles.eyebrow}>Inscrição segura</span>
        <h2>Registre uma atividade.</h2>
        <p>As informações sensíveis e o documento ficam privados. Apenas os dados autorizados aparecem no ranking.</p>
      </div>
      <div className={styles.formCard}>
        <div className={styles.progress} aria-label={`Etapa ${step} de 6`}>
          {[1,2,3,4,5,6].map((item) => <span key={item} className={item <= step ? styles.active : ""}>{item < step ? <Check size={13} /> : item}</span>)}
        </div>
        <div className={styles.stepLabel}>Etapa {step} de 6</div>
        {step === 1 && <StepAthlete data={data} set={set} category={athleteCategory} uploadDocument={uploadDocument} uploading={uploading} fileName={fileName} />}
        {step === 2 && <StepGuardian data={data} set={set} uploadMedicalCertificate={uploadMedicalCertificate} medicalUploading={medicalUploading} medicalFileName={medicalFileName} />}
        {step === 3 && <StepType data={data} set={set} />}
        {step === 4 && <StepActivity data={data} set={set} startDate={startDate} endDate={endDate} />}
        {step === 5 && <StepConsents data={data} set={set} />}
        {step === 6 && <Review data={data} category={athleteCategory} fileName={fileName} medicalFileName={medicalFileName} startDate={startDate} />}
        {message && <div className={message.type === "error" ? styles.error : styles.success} role="status">{message.text}</div>}
        <div className={styles.formActions}>
          {step > 1 && <button type="button" className={styles.back} onClick={() => { setMessage(null); setStep((value) => value - 1); }}><ChevronLeft size={17}/>Voltar</button>}
          {step < 6 ? <button type="button" className={styles.next} onClick={next}>Continuar<ChevronRight size={17}/></button>
            : <button type="button" className={styles.next} onClick={submit} disabled={sending}>{sending ? <LoaderCircle className={styles.spin} size={18}/> : <Send size={17}/>}Enviar atividade</button>}
        </div>
      </div>
    </div>
  );
}

type StepProps = { data: FormState; set: (key: string, value: string | boolean) => void };
const Input = ({ label, name, data, set, type = "text", required = true, placeholder, min, max }: StepProps & { label: string; name: string; type?: string; required?: boolean; placeholder?: string; min?: string; max?: string }) =>
  <label><span>{label}{required && " *"}</span><input type={type} value={String(data[name] ?? "")} onChange={(e) => set(name, e.target.value)} required={required} placeholder={placeholder} min={min} max={max}/></label>;
const SelectState = ({ label, name, data, set }: StepProps & { label: string; name: string }) =>
  <label><span>{label} *</span><select value={String(data[name] ?? "SP")} onChange={(e) => set(name, e.target.value)}>{UFS.map((uf) => <option key={uf}>{uf}</option>)}</select></label>;

function StepAthlete({ data,set,category,uploadDocument,uploading,fileName }: StepProps & { category:string; uploadDocument:(f?:File)=>void; uploading:boolean; fileName:string }) {
  return <div><h3>Identificação do atleta</h3><div className={styles.fieldGrid}>
    <Input label="Nome completo civil" name="athleteFullName" data={data} set={set}/>
    <Input label="Nome público no ranking" name="athletePublicName" data={data} set={set}/>
    <Input label="CPF do atleta" name="athleteCpf" data={data} set={set} placeholder="000.000.000-00"/>
    <Input label="Data de nascimento" name="athleteBirthDate" data={data} set={set} type="date"/>
    <Input label="Cidade" name="athleteCity" data={data} set={set}/><SelectState label="Estado" name="athleteState" data={data} set={set}/>
    <label><span>Gênero esportivo *</span><select value={String(data.gender)} onChange={(e)=>set("gender",e.target.value)}><option value="FEMALE">Feminino</option><option value="MALE">Masculino</option></select></label>
    <div className={styles.categoryBox}><span>Categoria calculada</span><strong>{category}</strong></div>
  </div><label className={styles.upload}><LockKeyhole/><span><strong>Documento comprobatório *</strong><small>PDF, JPG ou PNG · até 10 MB · armazenamento privado</small></span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e)=>uploadDocument(e.target.files?.[0])}/><b>{uploading ? "Enviando..." : fileName || "Escolher arquivo"}</b></label></div>;
}
function StepGuardian({data,set,uploadMedicalCertificate,medicalUploading,medicalFileName}:StepProps & { uploadMedicalCertificate:(f?:File)=>void; medicalUploading:boolean; medicalFileName:string }){return <div><h3>Responsável legal e aptidão médica</h3><div className={styles.fieldGrid}><Input label="Nome completo" name="guardianFullName" data={data} set={set}/><Input label="CPF" name="guardianCpf" data={data} set={set}/><Input label="Relação com o atleta" name="guardianRelationship" data={data} set={set}/><Input label="Data de nascimento" name="guardianBirthDate" data={data} set={set} type="date"/><Input label="E-mail" name="guardianEmail" data={data} set={set} type="email"/><Input label="WhatsApp" name="guardianPhone" data={data} set={set}/></div>
  <div className={styles.medicalSection}>
    <div className={styles.medicalHeading}><FileHeart/><div><strong>Atestado médico obrigatório</strong><span>Escolha como comprovar a aptidão do atleta.</span></div></div>
    <div className={styles.medicalChoices}>
      <button type="button" className={data.medicalMethod==="MEDICAL_CERTIFICATE"?styles.selected:""} onClick={()=>set("medicalMethod","MEDICAL_CERTIFICATE")}><strong>Enviar agora</strong><span>Atestado legível, com identificação do atleta, assinatura e CRM do médico.</span></button>
      <button type="button" className={data.medicalMethod==="GUARDIAN_COMMITMENT"?styles.selected:""} onClick={()=>set("medicalMethod","GUARDIAN_COMMITMENT")}><strong>Enviar depois</strong><span>Assine o compromisso. A marca não será homologada antes do envio.</span></button>
    </div>
    {data.medicalMethod==="MEDICAL_CERTIFICATE" ? <label className={styles.upload}><LockKeyhole/><span><strong>Atestado médico *</strong><small>PDF, JPG ou PNG · até 10 MB · acesso restrito</small></span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e)=>uploadMedicalCertificate(e.target.files?.[0])}/><b>{medicalUploading?"Enviando...":medicalFileName||"Escolher arquivo"}</b></label> :
      <label className={styles.commitment}><input type="checkbox" checked={data.medicalCommitment===true} onChange={(e)=>set("medicalCommitment",e.target.checked)}/><span><strong>Compromisso formal de envio posterior *</strong> Como responsável legal, comprometo-me a enviar o atestado. Estou ciente de que a inscrição é condicionada e a marca não poderá ser homologada, premiada ou publicada como aprovada antes do recebimento.</span></label>}
    <div className={styles.cpfConfirmation}><Input label="Confirme o CPF do responsável para assinar" name="medicalGuardianCpf" data={data} set={set} placeholder="000.000.000-00"/></div>
    <div className={styles.safetyNotice}><ShieldAlert/><span>A corrida envolve riscos inerentes. O responsável deve seguir orientação médica, garantir preparação adequada e interromper a atividade diante de dor, mal-estar ou qualquer sinal de alerta.</span></div>
  </div>
  <details className={styles.optional}><summary>Adicionar treinador ou responsável técnico (opcional)</summary><div className={styles.fieldGrid}><Input label="Nome" name="coachName" data={data} set={set} required={false}/><Input label="CPF" name="coachCpf" data={data} set={set} required={false}/><Input label="CREF" name="coachCref" data={data} set={set} required={false}/><Input label="Estado do CREF" name="coachCrefState" data={data} set={set} required={false}/><Input label="Clube, escola ou assessoria" name="coachOrganization" data={data} set={set} required={false}/><Input label="E-mail" name="coachEmail" data={data} set={set} type="email" required={false}/></div></details></div>}
function StepType({data,set}:StepProps){return <div><h3>Como esta marca foi obtida?</h3><div className={styles.typeCards}>{[["OFFICIAL_COMPETITION","Competição oficial","Resultado público de federação ou organização."],["TRACK_400M","Pista oficial de 400m","Teste de 2,5 voltas com vídeo público."],["OPEN_COURSE","Percurso aberto","Atividade no Strava, vídeo e altimetria."]].map(([value,title,text])=><button type="button" key={value} className={data.type===value?styles.selected:""} onClick={()=>set("type",value)}><FileCheck2/><strong>{title}</strong><span>{text}</span></button>)}</div></div>}
function StepActivity({data,set,startDate,endDate}:StepProps & { startDate:string; endDate:string }){
  const activityDate = String(data.activityDate ?? "");
  const willAdjust = Boolean(activityDate && activityDate < startDate);
  return <div>
    <h3>Resultado e comprovações</h3>
    <div className={styles.dateNotice} role="note">
      <Info size={18}/>
      <span><strong>Inscrições abertas.</strong> Atividades anteriores a 1º de agosto serão registradas como 01/08/2026.</span>
    </div>
    {willAdjust && <div className={styles.dateAdjustment} role="status">A data informada será considerada como 01/08/2026 no ranking.</div>}
    <div className={styles.fieldGrid}><Input label="Data da atividade" name="activityDate" data={data} set={set} type="date" max={endDate}/><Input label="Tempo (MM:SS.CC)" name="activityTime" data={data} set={set} placeholder="03:42.18"/><Input label="Cidade" name="activityCity" data={data} set={set}/><SelectState label="Estado" name="activityState" data={data} set={set}/>{data.type==="OFFICIAL_COMPETITION"&&<><Input label="Nome da competição" name="competitionName" data={data} set={set}/><Input label="Entidade organizadora" name="organizer" data={data} set={set}/><Input label="Link do resultado oficial" name="officialResultUrl" data={data} set={set} type="url"/><Input label="Prova ou bateria" name="heatNumber" data={data} set={set} required={false}/></>}{data.type==="TRACK_400M"&&<><Input label="Nome da pista" name="trackName" data={data} set={set}/><Input label="Vídeo público (YouTube ou Instagram)" name="videoUrl" data={data} set={set} type="url"/></>}{data.type==="OPEN_COURSE"&&<><Input label="Vídeo público" name="videoUrl" data={data} set={set} type="url"/><Input label="Atividade pública no Strava" name="stravaUrl" data={data} set={set} type="url"/></>}</div><label><span>Observações</span><textarea value={String(data.activityNotes??"")} onChange={(e)=>set("activityNotes",e.target.value)} rows={3}/></label>
  </div>
}
function StepConsents({data,set}:StepProps){return <div><h3>Regulamento e consentimentos</h3><p className={styles.hint}>Cada aceite é registrado com versão, data, IP e navegador.</p><div className={styles.consents}>{consentItems.map(([key,text])=><label key={key}><input type="checkbox" checked={data[key]===true} onChange={(e)=>set(key,e.target.checked)}/><span>{text}</span></label>)}<label className={styles.optionalConsent}><input type="checkbox" checked={data.mediaPromotion===true} onChange={(e)=>set("mediaPromotion",e.target.checked)}/><span><strong>Opcional:</strong> autorizo o uso de imagens e vídeos em comunicações institucionais da 11Run.</span></label></div><a className={styles.regulationLink} href="#regulamento">Ler regulamento completo</a></div>}
function Review({data,category,fileName,medicalFileName,startDate}:{data:FormState;category:string;fileName:string;medicalFileName:string;startDate:string}){
  const submittedDate = String(data.activityDate ?? "");
  const activityDate = submittedDate && submittedDate < startDate ? startDate : submittedDate;
  return <div><h3>Revise antes de enviar</h3><div className={styles.review}><article><span>Atleta</span><strong>{String(data.athletePublicName)}</strong><small>{category} · {String(data.athleteCity)}/{String(data.athleteState)}</small></article><article><span>Responsável</span><strong>{String(data.guardianFullName)}</strong><small>{String(data.guardianEmail)}</small></article><article><span>Atividade</span><strong>{String(data.activityTime)} nos 1.000 m</strong><small>{activityDate} · {String(data.activityCity)}/{String(data.activityState)}</small>{activityDate !== submittedDate && <small className={styles.adjustedDate}>Data ajustada para o início oficial da edição.</small>}</article><article><span>Documento</span><strong>{fileName}</strong><small>Privado e acessível somente à comissão.</small></article><article><span>Aptidão médica</span><strong>{data.medicalMethod==="MEDICAL_CERTIFICATE" ? medicalFileName : "Compromisso de envio posterior"}</strong><small>{data.medicalMethod==="MEDICAL_CERTIFICATE" ? "Atestado recebido em armazenamento privado." : "A marca ficará condicionada até o envio do atestado."}</small></article></div></div>
}
