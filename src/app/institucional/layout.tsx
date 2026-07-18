import type { ReactNode } from "react";
import { InstitutionalStyles } from "@/components/InstitutionalStyles";
import { InstitutionalResponsiveStyles } from "@/components/InstitutionalResponsiveStyles";

export default function InstitutionalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <InstitutionalStyles />
      <InstitutionalResponsiveStyles />
      {children}
    </>
  );
}
