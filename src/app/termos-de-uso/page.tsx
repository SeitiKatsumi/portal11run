import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Condições de uso do portal, dos conteúdos e dos materiais oficiais da marca 11Run.",
  alternates: { canonical: "/termos-de-uso" },
  robots: { index: true, follow: true }
};

export default function TermsOfUsePage() {
  return (
    <div className="legal-page privacy-page">
      <section className="privacy-hero">
        <span className="eyebrow">Termos de uso · versão 1.0 — 28/07/2026</span>
        <h1>Termos de Uso</h1>
        <p>
          Estes termos definem as condições para acessar o portal 11Run, utilizar seus serviços e baixar
          materiais oficiais da marca. Ao continuar, você declara ter lido e aceitado estas condições.
        </p>
        <nav className="privacy-jump" aria-label="Navegação dos termos">
          <a href="#portal">Uso do portal</a>
          <a href="#marca">Uso da marca</a>
          <a href="#responsabilidades">Responsabilidades</a>
          <a href="#contato">Contato</a>
        </nav>
      </section>

      <section className="privacy-content">
        <aside className="privacy-summary" aria-label="Resumo dos termos">
          <strong>Em resumo</strong>
          <ul>
            <li>Use o portal e seus conteúdos de forma lícita, segura e respeitosa.</li>
            <li>Não altere, revenda ou sublicencie os arquivos oficiais da 11Run.</li>
            <li>Aplicações comerciais, institucionais ou de co-branding exigem autorização prévia.</li>
            <li>A autorização pode ser limitada, condicionada ou revogada pela 11Run.</li>
          </ul>
        </aside>

        <article>
          <h2 id="portal">1. Escopo e uso do portal</h2>
          <p>
            Estes termos se aplicam ao site 11run.com.br, às áreas públicas e restritas, à loja, aos formulários,
            aos projetos, aos rankings, aos materiais para download e aos demais recursos digitais da 11Run.
            É proibido utilizar o portal para fraude, violação de direitos, tentativa de acesso indevido,
            interferência técnica ou distribuição de conteúdo ilícito.
          </p>

          <h2>2. Contas, cadastros e informações</h2>
          <p>
            O usuário deve fornecer informações verdadeiras, atuais e compatíveis com a finalidade do cadastro.
            Credenciais são pessoais e não devem ser compartilhadas. O responsável legal responde pelos dados e
            autorizações apresentados em nome de crianças e adolescentes.
          </p>

          <h2 id="marca">3. Propriedade intelectual e materiais da marca</h2>
          <p>
            Logotipos, símbolos, nomes, textos, fotografias, vídeos, interfaces, arquivos gráficos e demais
            ativos são protegidos pela legislação aplicável e permanecem de titularidade da 11Run ou de seus
            licenciantes. O download do kit oficial não transfere propriedade nem concede licença irrestrita.
          </p>
          <p>
            Os arquivos podem ser usados somente conforme o Manual da Marca e a finalidade informada. Não é
            permitido deformar, redesenhar, recolorir fora das versões oficiais, vender, registrar, sublicenciar,
            ceder ou utilizar a marca de modo que sugira parceria, patrocínio ou endosso inexistente.
          </p>

          <h2>4. Autorizações especiais e co-branding</h2>
          <p>
            Aplicações em uniformes, produtos, campanhas, eventos, materiais comerciais, imprensa, patrocínios,
            sinalização e peças com outras marcas dependem de autorização expressa. A solicitação poderá ser
            aprovada com condições, prazo, território e finalidade determinados. A 11Run pode solicitar ajustes
            ou revogar a autorização em caso de uso incompatível.
          </p>

          <h2 id="responsabilidades">5. Responsabilidades e disponibilidade</h2>
          <p>
            O usuário responde por suas ações, arquivos enviados e uso dos materiais. A 11Run busca manter o
            portal seguro e disponível, mas poderá realizar manutenções, corrigir informações, suspender recursos
            ou remover conteúdos que violem estes termos. Links e serviços de terceiros seguem regras próprias.
          </p>

          <h2>6. Privacidade e proteção de dados</h2>
          <p>
            O tratamento de dados pessoais segue a{" "}
            <Link href="/politica-de-privacidade">Política de Privacidade e Proteção de Dados</Link>. Ao enviar
            arquivos ou solicitar autorização de marca, o usuário confirma que possui legitimidade para fornecer
            as informações e documentos envolvidos.
          </p>

          <h2>7. Alterações e legislação aplicável</h2>
          <p>
            Estes termos podem ser atualizados para refletir mudanças legais, operacionais ou de produto. A versão
            vigente será publicada nesta página. Aplicam-se as leis brasileiras, preservados os direitos do
            consumidor e as competências legais obrigatórias.
          </p>

          <h2 id="contato">8. Contato</h2>
          <p>
            Dúvidas sobre uso da marca devem ser encaminhadas pelo formulário disponível no{" "}
            <Link href="/institucional/branding#autorizacao">Manual da Marca 11Run</Link>. Questões sobre dados
            pessoais devem utilizar os canais indicados na Política de Privacidade.
          </p>
        </article>
      </section>
    </div>
  );
}
