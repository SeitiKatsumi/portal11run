import { InstitutionalStyles } from "@/components/InstitutionalStyles";

export default function MasterTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstitutionalStyles />
    </>
  );
}
