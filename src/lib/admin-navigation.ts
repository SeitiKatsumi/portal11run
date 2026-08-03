import {
  Banknote,
  Bot,
  CalendarDays,
  ClipboardList,
  Footprints,
  Gamepad2,
  Globe2,
  Handshake,
  HeartHandshake,
  Inbox,
  Languages,
  LayoutDashboard,
  Palette,
  PanelsTopLeft,
  ShoppingBag,
  Trophy,
  UserRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

export const adminNavigationGroups: AdminNavigationGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin", label: "Visão geral", description: "Central de acesso às operações do portal.", icon: LayoutDashboard },
      { href: "/admin/home", label: "Página inicial", description: "Edite o conteúdo e os projetos da home.", icon: PanelsTopLeft }
    ]
  },
  {
    label: "Operação",
    items: [
      { href: "/admin/cadastros", label: "Cadastros", description: "Acompanhe inscrições e acessos dos atletas.", icon: ClipboardList },
      { href: "/admin/desafios", label: "Desafios", description: "Valide entregas, benefícios e conquistas.", icon: Gamepad2 },
      { href: "/admin/circuito-virtual", label: "Circuito Virtual", description: "Gerencie ranking, inscrições e regulamento.", icon: Globe2 },
      { href: "/admin/eventos", label: "Eventos", description: "Organize a agenda vinculada aos atletas.", icon: CalendarDays },
      { href: "/admin/ranking", label: "Ranking", description: "Cadastre e revise marcas esportivas.", icon: Trophy }
    ]
  },
  {
    label: "Relacionamento",
    items: [
      { href: "/admin/apoios", label: "Patrocínios e apoios", description: "Centralize contatos e oportunidades de apoio.", icon: HeartHandshake },
      { href: "/admin/apoiadores", label: "Interessados em apoiar", description: "Acompanhe os contatos recebidos pelo portal.", icon: Inbox },
      { href: "/admin/patrocinadores", label: "Patrocinadores", description: "Gerencie marcas, categorias e exibição.", icon: Handshake }
    ]
  },
  {
    label: "Gestão",
    items: [
      { href: "/admin/financeiro", label: "Financeiro", description: "Controle entradas, saídas e benefícios.", icon: Banknote },
      { href: "/admin/loja", label: "Loja e pedidos", description: "Gerencie produtos, estoque e pedidos.", icon: ShoppingBag }
    ]
  },
  {
    label: "Conteúdo e canais",
    items: [
      { href: "/admin/branding", label: "Branding", description: "Acompanhe solicitações de materiais da marca.", icon: Palette },
      { href: "/admin/referencias-japao", label: "Referências Japão", description: "Revise a base internacional japonesa.", icon: Languages },
      { href: "/admin/trajetoria-seiti", label: "Trajetória Seiti", description: "Visualize e revise a narrativa esportiva.", icon: Footprints },
      { href: "/admin/alex-lopes", label: "Alex Lopes", description: "Acompanhe solicitações de avaliação técnica.", icon: UserRound },
      { href: "/admin/atendimento", label: "Chat e IA", description: "Configure atendimento e respostas assistidas.", icon: Bot }
    ]
  }
];

export const adminNavigationItems = adminNavigationGroups.flatMap((group) => group.items);
