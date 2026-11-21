# Piloto WordPress — 11RUN

A instalação de teste atende em **https://11run.com.br/global/**. WordPress e MariaDB são apps separados do portal Next.js. Nenhum cadastro, conta, upload privado ou pagamento é copiado. O corte da home não faz parte deste deploy.

## CapRover

1. No servidor **server02**, instale a configuração de [one-click](caprover-one-click.yml) com o nome **11run-wordpress-global**. Conserve a senha da prévia em seu gerenciador de senhas; o usuário da prévia é **previa**. O banco usa outra senha gerada pelo CapRover. Mantenha ambos os apps marcados como não expostos externamente. O banco não recebe portas publicadas.
2. Envie a imagem customizada **ao app do piloto**, nunca ao app do portal. Para upload manual, empacote o commit da branch do piloto com o seguinte comando na raiz. O arquivo raiz `captain-definition` do portal é substituído no pacote pela definição do piloto; não é modificado no repositório.

   ```powershell
   node wordpress-pilot/export-public.mjs
   $pilotArchive = Join-Path ([IO.Path]::GetTempPath()) '11run-wordpress-global.tar'
   tar -cf $pilotArchive -C wordpress-pilot captain-definition
   tar -rf $pilotArchive wordpress-pilot/Dockerfile wordpress-pilot/Dockerfile.dockerignore wordpress-pilot/entrypoint.sh wordpress-pilot/global.conf wordpress-pilot/php.ini wordpress-pilot/seed-home.php wordpress-pilot/theme wordpress-pilot/migration wordpress-pilot/generated public/assets/home/time-2027.webp public/assets/logos/onzerun-menu.png
   tar -tf $pilotArchive
   ```

3. Antes de conectar a rota, publique no portal a exclusão de `/global` do cache do cronômetro contida em `public/sw.js`. Em seguida, salve uma cópia da configuração Nginx do app **onzerunportal** e acrescente [proxy.conf](proxy.conf) ao servidor do domínio `11run.com.br`. Preserve as rotas existentes e não exponha WordPress por outro domínio. Confirme que `/global` redireciona para `/global/`, que `/global/` e `/global/wp-login.php` retornam 401 sem credenciais e que `/api/health` continua a responder pelo portal.
4. Em `/global/wp-admin/install.php`, autentique-se na prévia e conclua o instalador com seu próprio usuário administrador. Use **Português do Brasil** e deixe a visibilidade para mecanismos de busca desativada.
5. Em **Plugins → Adicionar plugin → Enviar plugin**, instale o Elementor e o Elementor Pro oficiais e ative sua licença na conta Elementor. A subpasta pode consumir uma ativação. Nenhum plugin comercial ou credencial é versionado.
6. Em **Ferramentas → Home 11RUN**, clique em **Preparar home**. O instalador importa a foto e o logo públicos, cria uma home editável e menus nativos e não sobrescreve outra home. Use **Editar home com Elementor → contêiner da foto → Estilo → Fundo** para ajustar a foto e o recorte responsivo. Com o Pro, use o Theme Builder para trocar o cabeçalho e o rodapé do tema.

Para reverter a exposição, remova apenas as duas locations adicionadas ao Nginx. Preserve o banco e o volume da prévia. Faça backup separado desses volumes antes de atualizações. Depois da aprovação da home, novos blocos e plugins também serão validados em `/global/` antes da troca no domínio principal.

## Testes

`bash wordpress-pilot/smoke.sh` roda build e teste de integração com WordPress e MariaDB descartáveis, apenas na porta 80 de loopback. O GitHub Actions usa a fixture editorial fora de produção. Para teste local, gere o pacote com `node wordpress-pilot/export-public.mjs` antes de subir a imagem.

## Migração editorial

- **Ferramentas → Migração 11RUN** cria as páginas em lotes sem sobrescrever páginas existentes. HTML editorial fica dentro de contêineres e widgets HTML do Elementor. Cabeçalho e rodapé são dois documentos Elementor compartilhados; o tema usa a localização do Theme Builder ou o mesmo documento como fallback.
- **Cadastros 11RUN** mostra somente envios de teste de `/global/cadastros/`. O painel oficial e os dados existentes permanecem no portal atual.
- **Biblioteca JavaScript** guarda snippets administráveis. Um snippet publicado por usuário com as permissões de administrador e HTML não filtrado é carregado apenas nas páginas públicas do WordPress, depois de `portal.js`. Não replique scripts dentro dos widgets HTML.
- Rankings, calculadoras, cronômetro, inscrições oficiais, pagamentos, sorteio e área de membros continuam no portal, sem copiar cadastros ou habilitar escrita dupla. Imagens do conteúdo importado ainda apontam para os assets públicos do portal; mantenha essas URLs quando fizer a troca da home.
