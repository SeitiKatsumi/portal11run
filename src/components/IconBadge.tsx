import type { LucideIcon } from "lucide-react";

export function IconBadge({ icon: Icon, label }: { icon: LucideIcon; label?: string }) {
  return (
    <span className="icon-badge" aria-label={label}>
      <Icon size={18} strokeWidth={1.8} />
    </span>
  );
}
