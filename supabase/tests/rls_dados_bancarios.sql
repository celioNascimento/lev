-- Teste de acesso (RLS) das tabelas bancárias. Rode no SQL Editor do Supabase em HOMOLOGAÇÃO.
-- Insere dados falsos, confere quem enxerga o quê e termina com um erro DE PROPÓSITO,
-- que desfaz tudo (nada fica no banco). Esperado na mensagem final:
--   membro_aal2=1 membro_aal1=0 estranho_aal2=0 anon_erro(-2)=-2 escrita_membro=negada: ...

do $$
declare
  v_casa uuid; v_user uuid; v_conexao uuid; v_conta uuid;
  n_aal2 int; n_aal1 int; n_estranho int; n_anon int; escrita text;
begin
  select casa_id, user_id into v_casa, v_user from public.casa_membros limit 1;
  insert into public.conexoes_bancarias (casa_id, pluggy_item_id, apelido) values (v_casa, 'teste-rls', 'teste') returning id into v_conexao;
  insert into public.contas_bancarias (casa_id, conexao_id, pluggy_id, tipo, nome) values (v_casa, v_conexao, 'c1', 'BANK', 'teste') returning id into v_conta;
  insert into public.transacoes_bancarias (casa_id, conta_id, pluggy_id, descricao, valor, tipo, data) values (v_casa, v_conta, 't1', 'teste', 1, 'DEBIT', now());

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n_aal2 from public.transacoes_bancarias;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  select count(*) into n_aal1 from public.transacoes_bancarias;
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n_estranho from public.transacoes_bancarias;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin
    insert into public.transacoes_bancarias (casa_id, conta_id, pluggy_id, descricao, valor, tipo, data) values (v_casa, v_conta, 't2', 'x', 1, 'DEBIT', now());
    escrita := 'PERMITIDA (ruim)';
  exception when others then escrita := 'negada: ' || sqlerrm;
  end;
  execute 'reset role';
  execute 'set local role anon';
  begin
    perform 1 from public.transacoes_bancarias;
    n_anon := -1;
  exception when others then n_anon := -2;
  end;
  execute 'reset role';
  raise exception 'RESULTADO membro_aal2=% membro_aal1=% estranho_aal2=% anon_erro(-2)=% escrita_membro=%', n_aal2, n_aal1, n_estranho, n_anon, escrita;
end
$$;
