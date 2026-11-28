-- Lev: o banco também exige o segundo fator (código do aplicativo autenticador).
-- Só uma sessão com senha + código (aal2) enxerga casas e membros. Assim, mesmo que as
-- barreiras do site falhem, quem só tem a senha não lê nada. Toda tabela futura que usar
-- sou_membro_da_casa(...) nas políticas herda essa exigência.

create or replace function public.sou_membro_da_casa(p_casa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.jwt() ->> 'aal') = 'aal2'
     and exists (
       select 1
         from public.casa_membros m
        where m.casa_id = p_casa_id
          and m.user_id = (select auth.uid())
     );
$$;

drop policy casa_membros_ver_o_meu on public.casa_membros;
create policy casa_membros_ver_o_meu on public.casa_membros
  for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select auth.jwt() ->> 'aal') = 'aal2'
  );
