# Lev – gestão pessoal: passagem para a próxima conversa

Atualizada em 2026-11-27. Substitui a doc "passagem para a primeira conversa" (que está defasada).
Cole este arquivo na primeira mensagem da nova conversa (de preferência num Project "Lev" no Claude).

## O que é
Site de gestão financeira da casa, só para o Célio e a esposa (por ora). Web, instalável como app (PWA). Pode se integrar ao PQF no futuro.
Princípio: sem números que ninguém entende; só o relevante, em linguagem simples; conduzir o usuário pela mão.

## Ferramentas planejadas
1. Conexão com o banco (Pluggy / Meu Pluggy). É a próxima.
2. Planejamento (ex.: reforma do banheiro, com itens: link, preço, descrição).
3. Cuidado do veículo (combustível, óleo, pneus).

## Regras de trabalho do Célio
- Consultar a documentação. Tirar todas as dúvidas antes de propor solução.
- Português simples; arquivos completos em vez de diffs parciais; separar serviços (banco), hooks (estado) e componentes (tela).
- Testes automatizados sempre. Ficamos só na **homologação** por ora (não existe produção do Lev).
- Migration só com "pode aplicar" explícito. Perguntar "pode empurrar?" antes de qualquer push. Quem faz merge é o Célio.
- Nunca pedir nem aceitar segredos no chat. Memória em português.
- Commits terminam com as linhas `Co-Authored-By` e `Claude-Session` indicadas pelo sistema.

## Estado atual (o que existe)
- Repositório `celioNascimento/lev` (hoje **público**; o Célio precisa torná-lo privado). Branch `claude/login-e-casas`, PR #1 para `main`. Clone local de trabalho: `/home/claude/lev` (pode não existir na nova sessão; clonar de novo).
- Stack: Next.js 16 (App Router, `cacheComponents`; leitura de sessão só dentro de `<Suspense>`; `proxy.ts` no lugar de middleware), React 19, TypeScript, Tailwind 4, Vitest + Testing Library, Playwright (E2E), `@supabase/ssr`, `otpauth` (só testes).
- Supabase: organização "Lev - gestão pessoal" (`cyfznvnowonrebflsboc`), projeto `lev-homologacao` (`wnljqnsixssvyeochnud`). Plano grátis.
  - Tabelas: `casas`, `casa_membros` (RLS ligado; função `sou_membro_da_casa`). Casa "Casa" com os dois membros (celio.gih@gmail.com e celio_ne@hotmail.com). Usuário de teste `user_teste@user.invalid` (não é membro).
  - Migrations aplicadas: `casas_e_membros`.
  - **Migration NÃO aplicada**: `supabase/migrations/20261128010000_exigir_segundo_fator_no_banco.sql` (exige aal2 no banco). Aplicar só com "pode aplicar", e **só depois** de os dois terem cadastrado o aparelho e entrado uma vez com o código, senão ninguém enxerga a casa.
- Vercel: projeto `lev` importado pelo Célio no painel (time `celionascimentos-projects`, Hobby, mesma cota do PQF). O MCP da Vercel não enxerga esse projeto nem cria projetos (403).
  - Variáveis necessárias (Production/Preview/Development): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; depois `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` (só servidor). Valores `NEXT_PUBLIC_*` entram no build: mudou, faça Redeploy.
- Login com e-mail e senha (cadastro fechado), tela elegante, PWA com ícones, logo.
- **Segundo fator (TOTP) a cada entrada**, 2 aparelhos por pessoa (código em `b32f129`, commitado; ver "Empurrado?" abaixo).
  - Fluxo: sem login → `/entrar`; senha ok sem aparelho → `/seguranca/configurar`; senha ok com aparelho → `/verificar`; senha + código → tudo abre. Regras em `lib/auth/rotas.ts`; `proxy.ts` aplica.
  - Aviso na tela inicial enquanto houver menos de 2 aparelhos.
- 65 testes unitários passando; lint, tipos e build ok. E2E: os testes sem login passam; os com Supabase só rodam na máquina do Célio (o ambiente do Claude não alcança o Supabase).

## Lições que custaram caro
1. No navegador, o Next só embute `process.env.NEXT_PUBLIC_X` escrito por extenso. Ler por objeto intermediário devolve `undefined` (foi o bug do login). `lib/supabase/client.ts` cita as variáveis literalmente e há teste de regressão.
2. Em `lib/supabase/server.ts`, chamar `await cookies()` ANTES de checar variáveis, senão o build falha sem env vars.
3. Playwright: usar `form p[role="alert"]` (o anunciador de rotas do Next também tem role alert) e `getByLabel(..., {exact:true})`.
4. `execute_sql` do Supabase devolve só o resultado da última instrução.
5. Download do navegador do Playwright é bloqueado no ambiente: usar `E2E_CHROME_PATH=/usr/bin/google-chrome`.
6. Push: `git -c push.negotiate=true push origin <branch>`; o GitHub App do Claude precisa ter acesso ao repo.

## Pendências do Célio
- [ ] Confirmar no Supabase (`lev-homologacao` → Authentication → Multi-Factor) que o TOTP está ligado para cadastro e verificação.
- [ ] Conferir no Vercel que as variáveis valem para Production, Preview e Development.
- [ ] Tornar o repositório `lev` privado.
- [ ] Fazer o merge do PR #1 (depois de testar o fluxo do código no Preview).
- [ ] Cadastrar o aparelho na conta de teste, guardar a chave em texto como `E2E_TOTP_SECRET` e rodar o E2E completo (`E2E_EMAIL`, `E2E_SENHA`, `E2E_TOTP_SECRET`).
- [ ] Exportar os dados de tempos em tempos (plano grátis provavelmente sem backup automático).
- [ ] Pluggy: salvar Client ID e Secret direto nas variáveis da Vercel (nunca no chat).

## Próximos passos (em ordem)
1. Testar no Preview: entrar, cadastrar aparelho, sair, entrar com código; cadastrar o 2º aparelho. Corrigir o que aparecer.
2. Com "pode aplicar", aplicar a migration `exigir_segundo_fator_no_banco` e rodar `get_advisors`.
3. **Tela do banco (Pluggy)**:
   - Fatos verificados (doc oficial "Meu Pluggy"): uso pessoal gratuito, sem vencer com o teste; até 5 conexões; sem uso comercial; só dados do próprio titular.
   - Dúvida em aberto: os dados da esposa. Perguntar a meu-suporte@pluggy.ai, do e-mail da conta Meu Pluggy (posso redigir).
   - Caminho: conectar os bancos em meu.pluggy.ai → no dashboard da Pluggy (mesma conta), Applications → Demo → Connect Account → escolher **MeuPluggy** (não o banco) → copiar o `itemId`.
   - A API não lista itens (`GET /v2/items` indisponível). O app guarda o `itemId` informado pela pessoa.
   - Os dados atualizam sozinhos a cada 24 h, sem atualização manual. A autorização vale 1 ano (`consentExpiresAt`); vencida, as leituras voltam vazias e o item fica com `LOGIN_ERROR` / `USER_AUTHORIZATION_EXPIRED`.
   - Mostrar na tela "atualizado há X" e aviso de autorização perto de vencer, em linguagem simples.
   - Chamadas à Pluggy só no servidor; dados protegidos por RLS (casa + aal2). Cuidado: o MeuPluggy traz dados reais mesmo em homologação.
4. Depois: planejamento (itens com link/preço) e veículo.

## Empurrado?
O commit `b32f129` (segundo fator) estava só local no momento em que esta doc foi escrita; o push é feito logo em seguida. Confirmar com `git log origin/claude/login-e-casas`.

## Instruções sugeridas para o Project "Lev"
- Sempre consulte a documentação para seguir o direcionamento do projeto.
- Conduza o usuário pela mão: tudo simples e intuitivo.
- Sinalize quando for necessário iniciar uma nova conversa, já preparando doc e arquivos.
- Prefira testes automatizados. Trabalhe em homologação.
- Tire todas as dúvidas antes de oferecer uma solução.
- Nunca aplique migration nem mexa em dados reais sem "pode aplicar". Pergunte "pode empurrar?" antes de push. Quem faz merge é o dono.
- Nunca peça nem aceite segredos no chat.
