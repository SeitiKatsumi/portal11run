# Desafios 11RUN

Módulo gamificado integrado ao painel do atleta (`/meu-painel`) e à administração (`/admin/desafios`). O Score 11RUN mede engajamento, nunca talento esportivo, e não reduz ajuda de custo.

## Fluxos

- Escolar: upload privado, consentimento, OCR/visão via OpenAI Responses API com JSON Schema, normalização 0–10 e revisão humana.
- Assiduidade: planilha privada, percentual em passos de 10%, correção e aprovação administrativa.
- Evolução: somente testes válidos de 1.000 m do próprio atleta, com melhor marca, tendência e evolução percentual.
- Ideias: moderação, respostas, ciclo configurável e ranking anonimizado apenas de ideias validadas.
- Benefícios: a análise cria somente uma sugestão. A projeção do atleta só considera benefícios aprovados em uma segunda decisão administrativa.

## Segurança e privacidade

- Arquivos são validados por MIME, assinatura, tamanho e conteúdo ativo conhecido.
- Metadados JPEG/PNG são removidos antes do armazenamento.
- O conteúdo é criptografado com AES-256-GCM e salvo fora de `public/`.
- Downloads exigem sessão do titular ou autenticação administrativa, usam IDs não enumeráveis, `no-store`, `nosniff` e CSP restritiva.
- Consentimentos, acessos, análises, decisões, valores anteriores/novos, justificativas e IP são auditados.
- O ranking de ideias exibe apenas primeiro nome e inicial; notas escolares nunca aparecem publicamente.

## Configuração

Defina no ambiente de produção:

```env
CHALLENGE_DATA_KEY=segredo-aleatorio-exclusivo-com-no-minimo-32-caracteres
CHALLENGE_PRIVATE_UPLOAD_DIR=data/private/member-challenges
OPENAI_DOCUMENT_MODEL=
```

Quando `OPENAI_DOCUMENT_MODEL` estiver vazio, o sistema reutiliza o modelo configurado no painel. A chave OpenAI também reutiliza a configuração central. Se a IA falhar ou estiver indisponível, a entrega permanece acessível para revisão humana.

As faixas escolares, faixas de assiduidade, pesos do score, limite acumulado, confiança mínima da IA, retenção, limite semanal e ciclo de ideias são editáveis na aba Configurações.

## Operação

1. O atleta envia uma entrega.
2. O sistema valida, criptografa e registra o arquivo.
3. No desafio escolar, a IA produz uma leitura estruturada e assistiva.
4. Um administrador revisa, corrige e decide sobre a entrega.
5. Uma sugestão de benefício é criada sem alterar o financeiro.
6. Um administrador aprova ou rejeita o benefício e define a vigência.
7. O atleta recebe notificação interna e visualiza a projeção.

Use a exportação CSV da administração para relatórios operacionais. A tabela de auditoria preserva o histórico das ações relevantes.
