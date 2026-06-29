"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, Bot, ClipboardList, Trophy } from "lucide-react";

const adminItems = [
  { href: "/admin/cadastros", label: "Cadastros", icon: ClipboardList },
  { href: "/admin/financeiro", label: "Financeiro", icon: Banknote },
  { href: "/admin/ranking", label: "Ranking", icon: Trophy },
  { href: "/admin/atendimento", label: "Chat e IA", icon: Bot }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Menu do painel administrativo">
      {adminItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link className={active ? "active" : ""} href={item.href} key={item.href}>
            <Icon size={16} strokeWidth={1.7} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
