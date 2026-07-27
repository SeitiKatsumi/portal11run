"use client";

import { Camera, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

export function MemberProfilePhoto({ initialUrl, athleteName }: { initialUrl?: string | null; athleteName: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(initialUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadPhoto(file?: File) {
    if (!file) return;
    setLoading(true);
    setMessage("");
    const form = new FormData();
    form.set("photo", file);
    const response = await fetch("/api/members/profile-photo", { method: "POST", body: form });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(result.error ?? "Não foi possível enviar a foto.");
      return;
    }
    setPhotoUrl(result.photoUrl);
    setMessage("Foto atualizada.");
  }

  return (
    <div className="member-profile-photo">
      <button type="button" onClick={() => inputRef.current?.click()} aria-label="Adicionar ou alterar foto de perfil">
        {photoUrl ? <img src={photoUrl} alt={`Foto de perfil de ${athleteName}`} /> : <Camera size={28} />}
        <span>{loading ? <LoaderCircle className="spin" size={16} /> : <Camera size={16} />} Foto de perfil</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => uploadPhoto(event.target.files?.[0])}
      />
      {message ? <small role="status">{message}</small> : null}
    </div>
  );
}
