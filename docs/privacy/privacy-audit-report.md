# Relatório de auditoria de privacidade e proteção digital

Data: 28/07/2026
Escopo: portal 11RUN, código da aplicação, esquema de dados, formulários, APIs, arquivos, integrações e superfícies públicas.
Natureza: revisão técnica e operacional; não substitui parecer jurídico.
## Resultado executivo

O portal possui separação funcional entre páginas públicas, áreas de atleta e administração, mas trata um conjunto amplo de dados pessoais, financeiros e sensíveis — vários deles pertencentes a crianças e adolescentes. A política pública anterior era insuficiente para refletir esse tratamento.

Esta entrega:

- substitui a política curta por uma política completa e navegável;
- inclui crianças e adolescentes, dados de saúde, rankings, loja, pagamentos, chat, arquivos e incidentes;
- adiciona acesso à política no menu institucional, mobile, rodapé, formulários e checkout;
- corrige a URL canônica padrão para `https://11run.com.br`;
- cria parâmetros de ambiente para identidade do controlador e canal de privacidade;
- registra data e versão do consentimento do chat;
- cria o inventário interno de tratamento.

## Evidências técnicas revisadas

- Esquema principal: `data/schema.sql`.
- Persistência e migrações em execução: `src/lib/database.ts`, `src/lib/assistantStore.ts`, `src/lib/store.ts`, `src/lib/support-hub.ts`, `src/lib/virtual-circuit.ts`.
- Cadastros e termos: `src/components/LeadForm.tsx`, `src/components/VirtualCircuitRegistration.tsx`, `src/components/SupportHubForms.tsx`.
- Loja e pagamentos: `src/components/Storefront.tsx`, `src/app/api/store`, `src/lib/store.ts`.
- Área de atleta e administração: `src/app/meu-painel`, `src/app/admin`.
- Rankings públicos: `src/components/VirtualCircuitRanking.tsx` e APIs relacionadas.
- Chat: `src/components/RunAssistant.tsx`, `src/app/api/assistant`, `src/lib/assistantStore.ts`.
- Configuração e segredos: `.env.example`, `Dockerfile`, `docker-compose.yml`, `captain-definition`.

## Fluxos e categorias encontradas

1. Cadastro geral, atleta, responsável e acesso de membro.
2. Inscrição em projetos, bolsas e avaliações.
3. Circuito Virtual: identidade, responsável, autorização, saúde, evidência e ranking.
4. 11Run Futuro/Master: cadastro, perfil, atestado, eventos, marcas e benefícios.
5. Loja: catálogo, carrinho, tamanhos, estoque, entrega/retirada, Stripe e Pix.
6. Doação, patrocínio e voluntariado.
7. Chat com eventual uso de provedor de IA.
8. Administração, exportações, arquivos e trilhas de auditoria.

## Auditoria de exposição pública

### Adequado ou parcialmente adequado

- O ranking do Circuito Virtual exibe nome público, categoria, data, local da marca, tempo e status, sem exibir CPF, contato ou atestado.
- As áreas completas de cadastro e financeiro exigem acesso restrito.
- Documentos do Circuito Virtual possuem rotas próprias e metadados de privacidade.

### Pontos que exigem governança

- Foto, biografia e trajetória de menores precisam de autorização específica por finalidade e canal; um aceite genérico não é suficiente.
- Dados importados como “oficiais” precisam de procedência, trilha de edição e visibilidade no admin.
- Exportações administrativas devem ser revisadas para não incluir CPF, saúde ou contatos sem necessidade funcional.
- O local público deve representar o local da marca/competição, nunca residência ou rotina do menor.
- O nome público precisa permanecer editável e dissociado do nome civil.

## Riscos priorizados

### Prioridade alta

1. **Identidade do controlador incompleta.** Razão social, CNPJ, endereço, canal de privacidade e encarregado não estão confirmados. A página mostra pendência explícita em vez de inventar dados.
2. **Retenção sem prazos aprovados.** O sistema armazena saúde, CPF, documentos, fotos, comprovantes, contatos e conversas, mas não há tabela de prazos juridicamente aprovada.
3. **Governança de menores.** É necessário registrar autorização granular para exposição de imagem, biografia e promoção, além da autorização de participação.
4. **Arquivos sensíveis.** Confirmar isolamento físico/lógico, antimalware, expiração, backups e auditoria de downloads para atestados e documentos.
5. **Credenciais e integrações.** Formalizar rotação, 2FA, cofre de segredos e resposta a incidente para Stripe, Pix, banco, e-mail e IA.

### Prioridade média

1. Criar fluxo autenticado ou verificado para direitos dos titulares.
2. Expirar identificador do chat no navegador e oferecer encerramento/limpeza.
3. Documentar fornecedores, transferências internacionais e contratos de operador.
4. Aplicar mascaramento de CPF, telefone e e-mail em todas as telas administrativas.
5. Definir revisão periódica de acessos, exports e dados públicos.

### Prioridade baixa

1. Criar histórico de versões da política e aviso de alteração material.
2. Adotar painel interno de métricas de privacidade sem expor dados pessoais.
3. Automatizar relatório de retenção, exclusão e solicitações.

## Cookies e tecnologias

Na busca estática atual não foram encontrados pixels publicitários, ferramentas próprias de analytics ou uso direto de `document.cookie`. Há sessão de autenticação e `localStorage` no chat para manter o identificador do atendimento e o primeiro nome. Essa condição deve ser reavaliada após qualquer inclusão de marketing, analytics ou vídeo de terceiros.

## Compartilhamentos e operadores observados

- hospedagem/CapRover e infraestrutura de execução;
- banco SQLite ou PostgreSQL conforme ambiente;
- Stripe para cartão e webhooks;
- provedor/configuração Pix;
- serviços de e-mail transacional;
- provedor de IA quando a função do chat estiver ativada;
- logística/entrega quando aplicável.

Os nomes empresariais, países, contratos, suboperadores e mecanismos de transferência internacional devem ser preenchidos no registro de operadores. **[VALIDAÇÃO JURÍDICA NECESSÁRIA]**

## Plano de adequação recomendado

1. Preencher e validar as variáveis `PRIVACY_*` em produção.
2. Aprovar bases legais e prazos por linha do inventário.
3. Nomear responsáveis por privacidade, segurança, atendimento ao titular e incidentes.
4. Implementar registro granular de imagem/biografia/promoção para menores.
5. Revisar permissões e exports; aplicar mascaramento e menor privilégio.
6. Implantar retenção e exclusão automatizadas, começando por arquivos de saúde e leads inativos.
7. Exercitar resposta a incidente e comunicação à ANPD/titulares.
8. Fazer validação jurídica da política antes de remover os marcadores de pendência.

## Critério de publicação

A página pode ser publicada como transparência operacional, preservando os marcadores de pendência. Ela não deve ser apresentada como versão jurídica definitiva até que identidade do controlador, canal de direitos, encarregado, bases legais, retenção e operadores tenham sido aprovados.
