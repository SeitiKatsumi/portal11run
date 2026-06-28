"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

export function MemberLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/members/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password")
      })
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Não foi possível entrar.");
      return;
    }
    window.location.href = "/meu-painel";
  }

  return (
    <form className="member-login-form" onSubmit={onSubmit}>
      <label>
        <span>Usuário</span>
        <input name="username" autoComplete="username" required />
      </label>
      <label>
        <span>Senha</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button primary" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar no dashboard"}
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
