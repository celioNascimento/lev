-- Lev: dados vindos do Pluggy (Meu Pluggy). Somente a casa dona enxerga (RLS + segundo fator,
-- pela função sou_membro_da_casa). Leitura só para quem está logado; a escrita é feita
-- apenas pelo servidor (sync), com a chave de serviço, que ignora RLS.
-- Nada aqui guarda senha, Client Secret ou número completo de conta.
-- Valores em reais com 2 casas; datas em timestamptz (o Pluggy manda data e hora).

create table public.conexoes_bancarias (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references public.casas (id) on delete cascade,
  pluggy_item_id text not null unique,
  apelido text not null,
  status text,
  autorizacao_expira_em timestamptz,
  ultima_leitura_em timestamptz,
  criada_em timestamptz not null default now()
);

create table public.contas_bancarias (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references public.casas (id) on delete cascade,
  conexao_id uuid not null references public.conexoes_bancarias (id) on delete cascade,
  pluggy_id text not null,
  tipo text not null,                 -- BANK ou CREDIT
  subtipo text,
  nome text not null,
  final_numero text,                  -- só os 4 últimos dígitos
  saldo numeric(16, 2) not null default 0,
  moeda text not null default 'BRL',
  limite_credito numeric(16, 2),
  limite_disponivel numeric(16, 2),
  fechamento_fatura date,
  vencimento_fatura date,
  atualizada_em timestamptz not null default now(),
  unique (conexao_id, pluggy_id)
);

create table public.transacoes_bancarias (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references public.casas (id) on delete cascade,
  conta_id uuid not null references public.contas_bancarias (id) on delete cascade,
  pluggy_id text not null,
  descricao text not null,
  valor numeric(16, 2) not null,      -- como o Pluggy manda; o sentido está em "tipo"
  tipo text not null,                 -- DEBIT ou CREDIT
  data timestamptz not null,
  categoria text,
  status text,
  atualizada_em timestamptz not null default now(),
  unique (conta_id, pluggy_id)
);

create table public.faturas_cartao (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references public.casas (id) on delete cascade,
  conta_id uuid not null references public.contas_bancarias (id) on delete cascade,
  pluggy_id text not null,
  vencimento date not null,
  fechamento date,
  valor_total numeric(16, 2) not null,
  pagamento_minimo numeric(16, 2),
  moeda text not null default 'BRL',
  atualizada_em timestamptz not null default now(),
  unique (conta_id, pluggy_id)
);

create table public.investimentos (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null references public.casas (id) on delete cascade,
  conexao_id uuid not null references public.conexoes_bancarias (id) on delete cascade,
  pluggy_id text not null,
  nome text not null,
  tipo text not null,
  subtipo text,
  saldo numeric(16, 2) not null default 0,
  valor_aplicado numeric(16, 2),
  lucro numeric(16, 2),
  emissor text,
  data_referencia timestamptz,
  moeda text not null default 'BRL',
  atualizado_em timestamptz not null default now(),
  unique (conexao_id, pluggy_id)
);

-- Índices nas chaves usadas por política e por telas.
create index conexoes_bancarias_casa_id_idx on public.conexoes_bancarias (casa_id);
create index contas_bancarias_casa_id_idx on public.contas_bancarias (casa_id);
create index transacoes_bancarias_casa_data_idx on public.transacoes_bancarias (casa_id, data desc);
create index transacoes_bancarias_conta_data_idx on public.transacoes_bancarias (conta_id, data desc);
create index faturas_cartao_casa_id_idx on public.faturas_cartao (casa_id);
create index faturas_cartao_conta_id_idx on public.faturas_cartao (conta_id);
create index investimentos_casa_id_idx on public.investimentos (casa_id);
create index investimentos_conexao_id_idx on public.investimentos (conexao_id);

-- RLS + permissões: leitura só para membros logados (com segundo fator); sem política de
-- escrita, então escrita por usuários é negada.
do $$
declare
  t text;
begin
  foreach t in array array[
    'conexoes_bancarias', 'contas_bancarias', 'transacoes_bancarias',
    'faturas_cartao', 'investimentos'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.sou_membro_da_casa(casa_id))',
      t || '_ver_da_minha_casa', t
    );
  end loop;
end
$$;
