"use client";

export function MemberLogoutButton() {
  async function logout() {
    await fetch("/api/members/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button className="button ghost" type="button" onClick={logout}>
      Sair
    </button>
  );
}
