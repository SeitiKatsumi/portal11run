import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade | 11RUN", description: "Como a 11RUN trata dados pessoais em conformidade com a LGPD." };

export default function PrivacyPage() {
  return <>
    <div className="legal-page">
      <section>
        <span className="eyebrow">Privacidade · versão 1.0-2026</span>
        <h1>Política de Privacidade</h1>
        <p>Esta política explica como a 11RUN coleta, utiliza, protege e elimina dados pessoais, inclusive dados de crianças e adolescentes tratados mediante autorização do responsável legal.</p>
        <h2>Dados e finalidades</h2>
        <p>Coletamos apenas os dados necessários para cadastro, autenticação, validação esportiva, ranking, comunicação, premiações, segurança e cumprimento de obrigações legais. Dados sensíveis, documentos, contatos e evidências nunca são exibidos publicamente.</p>
        <h2>Crianças e adolescentes</h2>
        <p>A participação de menores exige consentimento específico e destacado do responsável legal. Evidências e documentos são armazenados em área privada e acessados somente por pessoas autorizadas.</p>
        <h2>Compartilhamento e segurança</h2>
        <p>Os dados podem ser processados por fornecedores essenciais de infraestrutura, sempre com acesso limitado à finalidade contratada. Utilizamos controle de acesso, criptografia, registros de auditoria e proteção de arquivos.</p>
        <h2>Retenção e direitos</h2>
        <p>Os dados são mantidos pelo período necessário à finalidade, defesa de direitos e obrigações legais. O titular ou responsável pode solicitar confirmação, correção, revogação de consentimento, portabilidade ou exclusão, observadas as hipóteses legais de conservação.</p>
        <h2>Contato</h2>
        <p>Solicitações de privacidade podem ser encaminhadas pelos canais institucionais da 11RUN. A identidade do solicitante poderá ser verificada antes do atendimento.</p>
      </section>
    </div>
  </>;
}
