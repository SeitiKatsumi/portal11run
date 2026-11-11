"use client";

import Link from "next/link";
import Image from "next/image";
import { Camera, CameraOff, CloudDownload, Eraser, Keyboard, Loader2, Play, Radio, RefreshCw, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./CompetitionTimer.module.css";

type Race = { id: string; title: string; categories: string[]; distance_m: number; status: string; started_device_epoch_ms: number | null; device_id: string | null };
type Entry = { id: string; race_id: string; name: string; category: string; gender: string; bib_number: number | null };
type State = { races: Race[]; entries: Entry[] };
type QueueItem = { clientEventId: string; raceId: string; bibNumber: number; elapsedMs: number; capturedAt: string; deviceId: string };
type Arrival = { id: string; bib: string; name: string; category: string; elapsedMs: number; pending: boolean };
type StoredRace = { key: string; raceId: string; status: string; startedEpoch: number | null; deviceId: string; race: Race; entries: Entry[] };

const DB_NAME = "11run-timing";
const DB_VERSION = 1;

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("queue")) database.createObjectStore("queue", { keyPath: "clientEventId" });
      if (!database.objectStoreNames.contains("meta")) database.createObjectStore("meta", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut(store: "queue" | "meta", value: QueueItem | StoredRace) {
  const database = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  database.close();
}

async function idbGet<T>(store: "queue" | "meta", key: IDBValidKey) {
  const database = await openDb();
  const value = await new Promise<T | undefined>((resolve, reject) => {
    const request = database.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return value;
}

async function idbAll<T>(store: "queue" | "meta") {
  const database = await openDb();
  const values = await new Promise<T[]>((resolve, reject) => {
    const request = database.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return values;
}

async function idbDelete(store: "queue" | "meta", key: IDBValidKey) {
  const database = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  database.close();
}

async function clearLocalData() {
  const database = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction(["queue", "meta"], "readwrite");
    tx.objectStore("queue").clear();
    tx.objectStore("meta").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  database.close();
}

function formatClock(value: number) {
  const totalSeconds = Math.floor(Math.max(0, value) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatResult(value: number) {
  const centiseconds = Math.round(value / 10);
  const seconds = Math.floor(centiseconds / 100);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}.${String(centiseconds % 100).padStart(2, "0")}`;
}

function beep() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.12);
  } catch { /* vibração e cartão continuam como confirmação */ }
}

export function CompetitionTimer({ raceId }: { raceId: string }) {
  const [data, setData] = useState<State>({ races: [], entries: [] });
  const [online, setOnline] = useState(true);
  const [prepared, setPrepared] = useState(false);
  const [status, setStatus] = useState("READY");
  const [startedEpoch, setStartedEpoch] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [pending, setPending] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [manualBib, setManualBib] = useState("");
  const [message, setMessage] = useState("Prepare este celular antes de armar a largada.");
  const [tone, setTone] = useState<"neutral" | "success" | "error">("neutral");
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanControls = useRef<{ stop(): void } | null>(null);
  const lastScan = useRef<{ value: string; at: number }>({ value: "", at: 0 });
  const deviceId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const existing = localStorage.getItem("11run-timing-device");
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem("11run-timing-device", created);
    return created;
  }, []);
  const race = data.races.find((item) => item.id === raceId);
  const entries = data.entries.filter((entry) => entry.race_id === raceId && entry.bib_number !== null);
  const elapsed = startedEpoch ? Math.max(0, now - startedEpoch) : 0;

  const saveSnapshot = useCallback(async (nextStatus = status, nextStartedEpoch = startedEpoch) => {
    if (!race || !deviceId) return;
    await idbPut("meta", { key: `race:${raceId}`, raceId, status: nextStatus, startedEpoch: nextStartedEpoch, deviceId, race, entries });
    setPrepared(true);
  }, [deviceId, entries, race, raceId, startedEpoch, status]);

  const refreshPending = useCallback(async () => {
    const queue = await idbAll<QueueItem>("queue");
    setPending(queue.filter((item) => item.raceId === raceId).length);
  }, [raceId]);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/competitions", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível carregar a largada.");
      setData(json);
      const found = (json.races as Race[]).find((item) => item.id === raceId);
      if (!found) throw new Error("Bateria não encontrada.");
      setStatus(found.status);
      if (found.started_device_epoch_ms) setStartedEpoch(found.started_device_epoch_ms);
      setOnline(true);
      return json as State;
    } catch (error) {
      setOnline(false);
      const stored = await idbGet<StoredRace>("meta", `race:${raceId}`);
      if (!stored) throw error;
      setData({ races: [stored.race], entries: stored.entries });
      setStatus(stored.status);
      setStartedEpoch(stored.startedEpoch);
      setPrepared(true);
      return { races: [stored.race], entries: stored.entries };
    }
  }, [raceId]);

  const sync = useCallback(async () => {
    if (!navigator.onLine || !deviceId) return;
    const stored = await idbGet<StoredRace>("meta", `race:${raceId}`);
    try {
      if (stored?.status === "ARMED") {
        await fetch("/api/admin/competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "arm", raceId, deviceId }) });
      }
      if (stored?.status === "RUNNING" && stored.startedEpoch) {
        await fetch("/api/admin/competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "arm", raceId, deviceId }) });
        const startResponse = await fetch("/api/admin/competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", raceId, deviceId, deviceEpochMs: stored.startedEpoch }) });
        if (!startResponse.ok) {
          const startJson = await startResponse.json();
          if (!String(startJson.error).includes("Arme a largada")) throw new Error(startJson.error);
        }
      }
      const all = (await idbAll<QueueItem>("queue")).filter((item) => item.raceId === raceId);
      if (!all.length) { setOnline(true); return; }
      const response = await fetch("/api/admin/competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sync", raceId, items: all }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha na sincronização.");
      const rejected = new Map((json.result.rejected as Array<{ clientEventId: string; error: string }>).map((item) => [item.clientEventId, item.error]));
      for (const item of all) {
        if (!rejected.has(item.clientEventId)) await idbDelete("queue", item.clientEventId);
      }
      if (rejected.size) setMessage([...rejected.values()][0]);
      await refreshPending();
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [deviceId, raceId, refreshPending]);

  useEffect(() => {
    setOnline(navigator.onLine);
    Promise.all([load(), refreshPending(), idbGet<StoredRace>("meta", `race:${raceId}`)]).then(([, , stored]) => setPrepared(Boolean(stored))).catch((error) => { setTone("error"); setMessage(error instanceof Error ? error.message : "Não foi possível carregar."); }).finally(() => setLoading(false));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const onlineHandler = () => { setOnline(true); sync(); };
    const offlineHandler = () => setOnline(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    const syncInterval = window.setInterval(sync, 4000);
    return () => { window.removeEventListener("online", onlineHandler); window.removeEventListener("offline", offlineHandler); window.clearInterval(syncInterval); };
  }, [load, raceId, refreshPending, sync]);

  useEffect(() => {
    if (!startedEpoch) return;
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, [startedEpoch]);

  useEffect(() => () => scanControls.current?.stop(), []);

  async function prepare() {
    setBusy("prepare");
    try {
      await load();
      await saveSnapshot(status, startedEpoch);
      setTone("success"); setMessage(`${entries.length} atletas e a bateria foram salvos neste celular.`);
    } catch (error) { setTone("error"); setMessage(error instanceof Error ? error.message : "Não foi possível preparar."); }
    finally { setBusy(""); }
  }

  async function postAction(action: "arm" | "start", payload: Record<string, unknown> = {}) {
    const response = await fetch("/api/admin/competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, raceId, deviceId, ...payload }) });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Não foi possível atualizar a largada.");
    setData(json);
  }

  async function arm() {
    if (!prepared) { setTone("error"); setMessage("Use Preparar celular antes de armar a largada."); return; }
    setBusy("arm");
    try {
      if (navigator.onLine) await postAction("arm");
      setStatus("ARMED");
      await saveSnapshot("ARMED", null);
      setTone("success"); setMessage("Largada armada. Confira a bateria e toque em Iniciar agora no disparo.");
    } catch (error) { setTone("error"); setMessage(error instanceof Error ? error.message : "Não foi possível armar."); }
    finally { setBusy(""); }
  }

  async function start() {
    const epoch = Date.now();
    setBusy("start");
    try {
      if (navigator.onLine) await postAction("start", { deviceEpochMs: epoch });
      setStartedEpoch(epoch); setNow(epoch); setStatus("RUNNING");
      await saveSnapshot("RUNNING", epoch);
      setTone("success"); setMessage("Largada iniciada. Ative a câmera e registre cada chegada.");
    } catch (error) { setTone("error"); setMessage(error instanceof Error ? error.message : "Não foi possível iniciar."); }
    finally { setBusy(""); }
  }

  async function capture(raw: string) {
    const digits = raw.trim().match(/\b(\d{1,4})\b/)?.[1];
    if (!digits || status !== "RUNNING" || !startedEpoch) return;
    const bibNumber = Number(digits);
    const duplicate = arrivals.some((item) => Number(item.bib) === bibNumber);
    const entry = entries.find((item) => item.bib_number === bibNumber);
    if (duplicate) { setTone("error"); setMessage(`O número ${digits.padStart(4, "0")} já foi registrado neste celular.`); return; }
    if (!entry) { setTone("error"); setMessage(`Número ${digits.padStart(4, "0")} inexistente ou de outra bateria.`); return; }
    const capturedAt = new Date().toISOString();
    const elapsedMs = Date.now() - startedEpoch;
    const item: QueueItem = { clientEventId: crypto.randomUUID(), raceId, bibNumber, elapsedMs, capturedAt, deviceId };
    await idbPut("queue", item);
    setArrivals((current) => [{ id: item.clientEventId, bib: digits.padStart(4, "0"), name: entry.name, category: entry.category, elapsedMs, pending: true }, ...current].slice(0, 12));
    await refreshPending();
    beep(); navigator.vibrate?.(120);
    setTone("success"); setMessage(`${digits.padStart(4, "0")} · ${entry.name} · ${entry.category} · ${formatResult(elapsedMs)} registrado.`);
    setManualBib("");
    await sync();
  }

  async function startCamera() {
    if (!window.isSecureContext) { setTone("error"); setMessage("A câmera exige conexão HTTPS."); return; }
    setBusy("camera");
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 80, delayBetweenScanSuccess: 600 });
      if (!videoRef.current) return;
      scanControls.current = await reader.decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, videoRef.current, (result) => {
        if (!result) return;
        const value = result.getText();
        const moment = Date.now();
        if (lastScan.current.value === value && moment - lastScan.current.at < 1800) return;
        lastScan.current = { value, at: moment };
        capture(value);
      });
      setCameraOn(true); setTone("neutral"); setMessage("Câmera ativa. Enquadre um QR por vez dentro da marcação.");
    } catch (error) { setTone("error"); setMessage(error instanceof Error ? `Câmera indisponível: ${error.message}` : "Não foi possível abrir a câmera."); }
    finally { setBusy(""); }
  }

  function stopCamera() { scanControls.current?.stop(); scanControls.current = null; setCameraOn(false); }

  async function erase() {
    if (!window.confirm("Limpar bateria e chegadas pendentes salvas neste celular?")) return;
    stopCamera(); await clearLocalData(); setPrepared(false); setPending(0); setArrivals([]); setMessage("Dados locais removidos.");
  }

  if (loading) return <div id="timing-app" className={styles.page}><div className={styles.shell}><section className={styles.panel}><Loader2 className="spin" /> Carregando operação…</section></div></div>;

  return <div id="timing-app" className={styles.page}><div className={styles.shell}>
    <header className={styles.topbar}><Image src="/assets/logos/onzerun-menu.png" alt="11RUN" width={120} height={50} priority /><Link href="/admin/cross-country">Voltar ao painel</Link></header>
    <section className={`${styles.panel} ${styles.hero}`}>
      <span className="eyebrow">operação da prova · celular oficial</span><h1>{race?.title ?? "Largada"}</h1><p>{race?.categories.join(" · ")} · {race?.distance_m.toLocaleString("pt-BR")} m · {entries.length} atletas numerados</p>
      <div className={styles.statusRow}><span className={styles.pill} data-online={online}><span>{online ? <Wifi size={13} /> : <WifiOff size={13} />}</span>{online ? "Online" : "Offline"}</span><span className={styles.pill}><Radio size={13} />{status === "RUNNING" ? "Ao vivo" : status === "ARMED" ? "Armada" : status === "HOMOLOGATED" ? "Homologada" : "Preparação"}</span><span className={styles.pill}><RefreshCw size={13} />{pending} pendente(s)</span></div>
    </section>
    <section className={styles.panel}>
      <div className={styles.clock}>{formatClock(elapsed)}<small>tempo total da bateria</small></div>
      <div className={styles.controls}>
        <button className={styles.button} type="button" disabled={Boolean(busy) || status === "RUNNING" || status === "HOMOLOGATED"} onClick={prepare}>{busy === "prepare" ? <Loader2 className="spin" size={18} /> : <CloudDownload size={18} />}Preparar celular</button>
        {status === "READY" ? <button className={`${styles.button} ${styles.buttonPrimary}`} type="button" disabled={Boolean(busy) || !prepared} onClick={arm}>{busy === "arm" ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}Armar largada</button> : null}
        {status === "ARMED" ? <button className={`${styles.button} ${styles.buttonLive}`} type="button" disabled={Boolean(busy)} onClick={start}>{busy === "start" ? <Loader2 className="spin" size={18} /> : <Play size={18} />}Iniciar agora</button> : null}
        {status === "RUNNING" && !cameraOn ? <button className={`${styles.button} ${styles.buttonPrimary}`} type="button" disabled={Boolean(busy)} onClick={startCamera}>{busy === "camera" ? <Loader2 className="spin" size={18} /> : <Camera size={18} />}Ativar câmera</button> : null}
        {cameraOn ? <button className={styles.button} type="button" onClick={stopCamera}><CameraOff size={18} />Desligar câmera</button> : null}
      </div>
      <div className={styles.camera}>{cameraOn ? <><video ref={videoRef} muted playsInline /><span className={styles.scanLine} /></> : <div className={styles.cameraEmpty}><div><Camera size={32} /><p>A câmera traseira aparecerá aqui durante a prova.</p></div></div>}</div>
      <form className={styles.manual} onSubmit={(event) => { event.preventDefault(); capture(manualBib); }}><input inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} value={manualBib} onChange={(event) => setManualBib(event.target.value.replace(/\D/g, ""))} placeholder="Número manual · ex.: 0042" aria-label="Número da pulseira" /><button className={styles.button} type="submit" disabled={status !== "RUNNING" || !manualBib}><Keyboard size={18} />Registrar manualmente</button></form>
      <p className={styles.notice} data-tone={tone} role={tone === "error" ? "alert" : "status"}>{message}</p>
    </section>
    <section className={styles.panel}><span className="eyebrow">últimas chegadas neste celular</span><div className={styles.arrivals}>{arrivals.map((arrival) => <article className={styles.arrival} key={arrival.id}><b>{arrival.bib}</b><span><strong>{arrival.name}</strong><br /><small>{arrival.category}</small></span><time>{formatResult(arrival.elapsedMs)}</time></article>)}{!arrivals.length ? <p className={styles.muted}>As chegadas aparecem aqui imediatamente após cada leitura.</p> : null}</div><div className={styles.footerActions}><button type="button" onClick={sync}><RefreshCw size={14} /> Sincronizar agora</button><button type="button" onClick={erase}><Eraser size={14} /> Limpar dados locais</button></div></section>
  </div></div>;
}
