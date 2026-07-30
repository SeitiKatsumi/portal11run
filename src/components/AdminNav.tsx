"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, Bot, CalendarDays, ClipboardList, Globe2, HandHeart, Handshake, Home, Palette, ShoppingBag, Trophy } from "lucide-react";

const adminItems = [
  { href: "/admin/home", label: "Home", icon: Home },
  { href: "/admin/cadastros", label: "Cadastros", icon: ClipboardList },
  { href: "/admin/apoios", label: "Patrocínios e apoios", icon: HandHeart },
  { href: "/admin/patrocinadores", label: "Patrocinadores", icon: Handshake },
  { href: "/admin/financeiro", label: "Financeiro", icon: Banknote },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/ranking", label: "Ranking", icon: Trophy },
  { href: "/admin/circuito-virtual", label: "Circuito Virtual", icon: Globe2 },
  { href: "/admin/referencias-japao", label: "Referências Japão", icon: Globe2 },
  { href: "/admin/loja", label: "Loja e pedidos", icon: ShoppingBag },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/atendimento", label: "Chat e IA", icon: Bot },
  { href: "/admin/alex-lopes", label: "Alex Lopes", icon: Bot }
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
