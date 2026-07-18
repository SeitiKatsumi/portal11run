import { InstitutionalStyles } from "@/components/InstitutionalStyles";
import { MasterOfficialEvents } from "@/components/MasterOfficialEvents";

export default function MasterTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MasterOfficialEvents />
      <InstitutionalStyles />
    </>
  );
}
