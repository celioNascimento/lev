# Lev

Gestão da casa, de um jeito simples. Hoje é de uso pessoal (duas pessoas). A visão e as regras do produto estão em [`docs/visao.md`](docs/visao.md).

Stack: Next.js (App Router), TypeScript, Tailwind, Supabase e Vercel. O site é instalável no celular (PWA).

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com os valores do painel do Supabase
npm run dev                  # http://localhost:3000
```

## Publicar na Vercel

Cadastre em *Settings → Environment Variables* (marque Production, Preview e Development):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Sem elas o build passa, mas o site responde erro em todas as telas. Depois de cadastrar ou mudar uma variável, faça um novo deploy (*Redeploy*), porque elas são embutidas no momento do build. Segredos (Pluggy) NÃO levam o prefixo `NEXT_PUBLIC_`.

## Testes

```bash
npm run lint
npm run typecheck
npm run test:run             # unidade e componentes (Vitest)
npm run test:e2e             # ponta a ponta (Playwright); sobe o site sozinho
E2E_BASE_URL=https://seu-endereco npm run test:e2e   # contra um site já publicado
```

## Organização do código

- `app/`: telas e rotas.
- `components/`: peças de interface, sem acesso a banco.
- `hooks/`: estado e comportamento das telas.
- `services/`: consultas ao banco e a serviços externos.
- `lib/`: utilitários e configuração (`lib/supabase/` tem os clientes).
- `tests/e2e/`: testes ponta a ponta.

## Segurança

- Segredos (Pluggy, chaves de serviço) só em variáveis de ambiente do servidor, nunca em código, no navegador ou no chat.
- `.env*` não é versionado; só `.env.example`, sem valores.
- O acesso aos dados será protegido por RLS no Supabase.
