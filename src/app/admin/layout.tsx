import { AdminNav } from "@/components/AdminNav";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-page">
      <AdminNav />
      {children}
    </div>
  );
}
