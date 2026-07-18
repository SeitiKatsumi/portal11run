import type { ReactNode } from "react";

import { InstitutionalResponsiveStyles } from "@/components/InstitutionalResponsiveStyles";

export default function ElevenMasterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <InstitutionalResponsiveStyles />
      {children}
    </>
  );
}
