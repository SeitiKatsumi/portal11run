import { AdminNav } from "@/components/AdminNav";
import type { ReactNode } from "react";
import styles from "./admin-shell.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <AdminNav />
        <div className={styles.workspace}>{children}</div>
      </div>
    </div>
  );
}
