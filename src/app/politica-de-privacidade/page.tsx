import type { Metadata } from "next";
import Link from "next/link";
import { privacyController, privacyPendingLabel } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados",
  description:
    "Saiba como a 11RUN trata dados pessoais, dados de saúde e informações de crianças e adolescentes em conformidade com a LGPD.",
  alternates: { canonical: "/politica-de-privacidade" },
  robots: { index: true, follow: true }
};

const notConfigured = (value: string | null) => value ?? privacyPendingLabel;

export default function PrivacyPage() {
  return (
    <div className="legal-page privacy-page">
      <section className="privacy-hero">
        <span className="eyebrow">Privacidade · LGPD · versão 2.0 — 28/07/2026</span>
        <h1>Política de Privacidade e Proteção de Dados</h1>
        <p>
          Esta política explica, em linguagem clara, como a 11RUN trata dados pessoais em seu portal, projetos,
          áreas restritas, rankings, eventos, loja e canais de relacionamento. A proteção de crianças e
          adolescentes e o melhor interesse desses titulares orientam todas as decisões descritas aqui.
        </p>
        <nav className="privacy-jump" aria-label="Navegação da política">
          <a href="#dados">Dados e finalidades</a>
          <a href="#menores">Crianças e adolescentes</a>
          <a href="#direitos">Seus direitos</a>
          <a href="#contato">Contato</a>
        </nav>
      </section>

      <section className="privacy-content">
        <aside className="privacy-summary" aria-label="Resumo de privacidade">
          <strong>Compromissos essenciais</strong>
          <ul>
            <li>Coletar apenas o necessário para finalidades informadas.</li>
            <li>Manter documentos, CPF, contatos e saúde fora de áreas públicas.</li>
            <li>Usar nome público distinto do nome civil quando solicitado.</li>
            <li>Dar aos responsáveis meios para revisar consentimentos e exposição pública.</li>
          </ul>
        </aside>

        <article>
          <h2>1. Escopo e identificação do controlador</h2>
          <p>
            Esta política se aplica ao site 11run.com.br e aos módulos 11Run Futuro, Circuito Virtual 11Run,
            Circuito 11Run 2027, 11Run Master, Bolsas, área de membros, administração, eventos, loja, doações,
            patrocínios, voluntariado, chat e demais formulários digitais da 11RUN.
          </p>
          <dl className="privacy-controller">
            <div><dt>Razão social</dt><dd>{notConfigured(privacyController.legalName)}</dd></div>
            <div><dt>Nome de operação</dt><dd>{privacyController.tradeName}</dd></div>
            <div><dt>CNPJ</dt><dd>{notConfigured(privacyController.cnpj)}</dd></div>
            <div><dt>Endereço</dt><dd>{notConfigured(privacyController.address)}</dd></div>
            <div><dt>Canal de privacidade</dt><dd>{notConfigured(privacyController.email)}</dd></div>
            <div><dt>WhatsApp de privacidade</dt><dd>{notConfigured(privacyController.whatsapp)}</dd></div>
            <div><dt>Encarregado/DPO</dt><dd>{notConfigured(privacyController.dpoName)}</dd></div>
          </dl>
          <p className="privacy-pending">
            Os campos marcados como “{privacyPendingLabel}” dependem de confirmação administrativa antes da
            publicação jurídica definitiva. [VALIDAÇÃO JURÍDICA NECESSÁRIA]
          </p>

          <h2>2. Conceitos importantes</h2>
          <p>
            <strong>Dado pessoal</strong> é a informação relacionada a uma pessoa identificada ou identificável.
            <strong> Dado sensível</strong> inclui informações de saúde e biometria. <strong>Tratamento</strong> é
            qualquer operação com dados, como coleta, consulta, armazenamento, compartilhamento ou exclusão.
            <strong> Titular</strong> é a pessoa a quem os dados se referem. <strong>Responsável legal</strong> é
            quem representa a criança ou o adolescente nos atos que exigem autorização.
          </p>

          <h2>3. Princípios adotados</h2>
          <p>
            Observamos finalidade, adequação, necessidade, livre acesso, qualidade, transparência, segurança,
            prevenção, não discriminação e responsabilização. Para menores, o melhor interesse prevalece em
            qualquer hipótese de tratamento.
          </p>

          <h2 id="dados">4. Dados tratados, finalidades e bases legais</h2>
          <div className="privacy-table-wrap">
            <table>
              <thead><tr><th>Contexto</th><th>Dados principais</th><th>Finalidade</th><th>Base sugerida</th></tr></thead>
              <tbody>
                <tr><td>Cadastros e membros</td><td>Identificação, contato, cidade, acesso e perfil</td><td>Operar conta, projetos e atendimento</td><td>Contrato/procedimentos preliminares; consentimento quando aplicável</td></tr>
                <tr><td>Atletas e responsáveis</td><td>Nome civil e público, nascimento, CPF do responsável, vínculos e autorizações</td><td>Elegibilidade, segurança, comunicação e prestação de contas</td><td>Consentimento específico; proteção da vida; obrigação legal [VALIDAÇÃO JURÍDICA NECESSÁRIA]</td></tr>
                <tr><td>Saúde</td><td>Atestados e declarações de aptidão</td><td>Segurança e aptidão para atividades</td><td>Consentimento específico e destacado; proteção da vida [VALIDAÇÃO JURÍDICA NECESSÁRIA]</td></tr>
                <tr><td>Marcas e ranking</td><td>Nome público, idade/categoria, gênero esportivo, tempo, data, prova e local da marca</td><td>Validar resultados e publicar classificação</td><td>Consentimento; execução do projeto; legítimo interesse sujeito ao melhor interesse</td></tr>
                <tr><td>Eventos</td><td>Inscrição, presença, resultado, observações e projeto</td><td>Organizar agenda, provas, testes e histórico</td><td>Contrato/procedimentos preliminares; consentimento</td></tr>
                <tr><td>Financeiro e benefícios</td><td>Lançamentos, itens, valores, comprovantes e status</td><td>Gestão financeira, transparência e defesa de direitos</td><td>Contrato; obrigação legal; exercício regular de direitos</td></tr>
                <tr><td>Loja, Stripe e Pix</td><td>Pedido, produtos, tamanho, entrega/retirada, pagamento e identificadores da transação</td><td>Processar compra, pagamento, entrega e suporte</td><td>Execução de contrato; obrigação legal</td></tr>
                <tr><td>Apoio e relacionamento</td><td>Contato, organização, proposta, mensagens e arquivos enviados</td><td>Patrocínio, doação, voluntariado, leads e chat</td><td>Consentimento; procedimentos preliminares</td></tr>
                <tr><td>Segurança digital</td><td>Logs técnicos, sessão, IP quando registrado e trilhas de auditoria</td><td>Prevenir fraude, manter disponibilidade e investigar incidentes</td><td>Legítimo interesse; obrigação legal; exercício regular de direitos</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            A base legal concreta deve ser confirmada por operação e documentada no registro interno de tratamento.
            Consentimento não é utilizado como justificativa genérica quando outra hipótese for mais adequada.
          </p>

          <h2 id="menores">5. Crianças e adolescentes</h2>
          <p>
            Os projetos que envolvem menores exigem identificação e autorização verificável do responsável legal,
            informação destacada sobre a finalidade e possibilidade de revogação. A 11RUN evita decisões que possam
            causar exposição, constrangimento, discriminação ou prejuízo ao desenvolvimento do menor.
          </p>
          <h3>5.1 O que pode aparecer publicamente</h3>
          <p>
            Apenas informações necessárias ao projeto, como nome público escolhido, idade ou categoria, gênero
            esportivo, tempo, data, local da marca e modalidade. Nome civil completo, foto, biografia, depoimento ou
            trajetória somente serão publicados com autorização específica e registrável do responsável.
          </p>
          <h3>5.2 O que nunca deve aparecer publicamente</h3>
          <p>
            CPF, documentos, telefone, e-mail, endereço, escola, contato do responsável, atestado ou dado de saúde,
            data de nascimento completa, credenciais, histórico interno, dados financeiros, links privados e
            localização residencial ou rotineira precisa.
          </p>
          <p>
            O responsável pode solicitar correção, substituição do nome público, retirada de imagem ou interrupção
            da exposição pública. Isso não obriga a apagar registros cuja conservação seja legalmente necessária.
          </p>

          <h2>6. Compartilhamento e operadores</h2>
          <p>
            Dados são compartilhados somente quando necessário com infraestrutura de hospedagem e banco de dados,
            processamento de pagamentos (como Stripe e prestadores Pix), e-mail transacional, armazenamento,
            fornecedores de tecnologia e autoridades competentes. Cada fornecedor deve receber apenas os dados
            compatíveis com sua função. Não vendemos dados pessoais.
          </p>
          <p>
            Serviços externos podem tratar dados fora do Brasil. Nesses casos, a 11RUN deve verificar mecanismos
            adequados de transferência internacional, contratos, finalidade e nível de proteção.
            [VALIDAÇÃO JURÍDICA NECESSÁRIA]
          </p>

          <h2>7. Retenção e descarte</h2>
          <p>
            Os dados são mantidos somente durante a relação com o titular e pelo prazo necessário à finalidade,
            cumprimento de obrigações, prevenção a fraude e defesa de direitos. Atestados e arquivos sensíveis devem
            ter prazos reduzidos e revisão periódica. Após o prazo aplicável, são eliminados ou anonimizados de forma
            segura. Os prazos específicos constam do inventário interno e ainda exigem aprovação jurídica.
          </p>

          <h2>8. Segurança e controle de acesso</h2>
          <p>
            Aplicamos separação entre áreas públicas e privadas, autenticação, perfis de acesso, criptografia de
            campos sensíveis quando implementada, hashes de confirmação, trilhas de auditoria, validação de arquivos
            e backups. Nenhum sistema é infalível; as medidas são revistas conforme o risco e a evolução técnica.
          </p>

          <h2 id="direitos">9. Direitos dos titulares</h2>
          <p>
            O titular ou responsável pode pedir confirmação e acesso, correção, informação sobre compartilhamento,
            anonimização, bloqueio ou eliminação quando cabível, portabilidade conforme regulamentação, revisão de
            decisões automatizadas, oposição, revogação do consentimento e informação sobre as consequências da
            recusa. A identidade e a representação legal poderão ser verificadas antes da resposta.
          </p>
          <p>
            Solicitações simplificadas serão respondidas de imediato quando possível; pedidos completos observarão
            os prazos legais. Se a solicitação não puder ser atendida, a justificativa e a hipótese de conservação
            serão informadas.
          </p>

          <h2>10. Cookies, armazenamento local e tecnologias</h2>
          <p>
            O portal usa cookies e tecnologias estritamente necessárias para sessão, segurança e funcionamento.
            O chat armazena no navegador um identificador e o primeiro nome do atendimento para preservar a conversa.
            Na auditoria atual não foram identificados pixels publicitários ou ferramentas próprias de analytics.
            Caso tecnologias opcionais sejam adicionadas, haverá informação e mecanismo de escolha antes da ativação.
          </p>

          <h2>11. Decisões automatizadas</h2>
          <p>
            Rankings podem ordenar marcas por regras objetivas, mas validações, elegibilidade sensível e medidas que
            afetem direitos não devem depender exclusivamente de decisão automatizada sem possibilidade de revisão
            humana.
          </p>

          <h2>12. Incidentes de segurança</h2>
          <p>
            Suspeitas são registradas, contidas e avaliadas conforme natureza dos dados, titulares afetados e risco.
            Quando houver risco ou dano relevante, o controlador comunicará a ANPD e os titulares nos prazos
            aplicáveis, documentando medidas de contenção e prevenção.
          </p>

          <h2>13. Atualizações</h2>
          <p>
            Esta política poderá mudar para refletir novos módulos, fornecedores ou normas. Alterações relevantes
            serão destacadas no portal e, quando necessário, comunicadas diretamente. Novos consentimentos serão
            solicitados quando a mudança não for compatível com a autorização anterior.
          </p>

          <h2 id="contato">14. Contato e reclamações</h2>
          <p>
            Canal de privacidade: <strong>{notConfigured(privacyController.email)}</strong>. WhatsApp:{" "}
            <strong>{notConfigured(privacyController.whatsapp)}</strong>. Após tentar o atendimento pelo controlador,
            o titular também pode apresentar petição à Autoridade Nacional de Proteção de Dados.
          </p>
          <div className="privacy-sources">
            <strong>Referências oficiais</strong>
            <Link href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank">
              Lei nº 13.709/2018 — LGPD
            </Link>
            <Link href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1" target="_blank">
              ANPD — Titular de dados
            </Link>
            <Link href="https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes" target="_blank">
              ANPD — Crianças, adolescentes e melhor interesse
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
