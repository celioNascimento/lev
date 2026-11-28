-- Lev: base de acesso. Cada pessoa (login do Supabase Auth) pertence a uma casa,
-- e todo dado financeiro futuro será ligado a uma casa e protegido por RLS.
-- Cadastro público fica desligado no painel; as contas são criadas pelo dono.

create table public.casas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criada_em timestamptz not null default now()
);

create table public.casa_membros (
  casa_id uuid not null references public.casas (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (casa_id, user_id)
);

create index casa_membros_user_id_idx on public.casa_membros (user_id);

alter table public.casas enable row level security;
alter table public.casa_membros enable row level security;

-- Diz se quem está logado pertence à casa. SECURITY DEFINER para poder ler casa_membros
-- dentro de políticas de outras tabelas sem recursão. search_path vazio por segurança.
create function public.sou_membro_da_casa(p_casa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.casa_membros m
     where m.casa_id = p_casa_id
       and m.user_id = (select auth.uid())
  );
$$;

revoke all on function public.sou_membro_da_casa(uuid) from public, anon;
grant execute on function public.sou_membro_da_casa(uuid) to authenticated;

-- Só leitura para quem está logado; criar, alterar e apagar casas e membros
-- só pelo painel/SQL do dono (sem política de escrita = escrita negada).
revoke all on public.casas from anon, authenticated;
revoke all on public.casa_membros from anon, authenticated;
grant select on public.casas to authenticated;
grant select on public.casa_membros to authenticated;

create policy casas_ver_as_minhas on public.casas
  for select to authenticated
  using (public.sou_membro_da_casa(id));

create policy casa_membros_ver_o_meu on public.casa_membros
  for select to authenticated
  using (user_id = (select auth.uid()));
