# Visão do Lev

## O que é
Um site de gestão da casa para o Célio e a esposa. Hoje é só dos dois; no futuro pode se integrar ao PQF (Procuro Quem Faça). É uma plataforma web instalável no celular (PWA), com a lógica separada da interface para virar app depois, se fizer sentido.

## Princípio
Sem números e dados que ninguém entende. Mostrar só informação relevante para decidir e cuidar da casa, em linguagem simples. Conduzir a pessoa pela mão: tudo simples e intuitivo.

## Ferramentas
1. **Contas e movimentações** (começamos por aqui). Conexão com o banco via Pluggy (Meu Pluggy).
2. **Planejar uma obra ou compra.** Exemplo: reforma do banheiro, com itens (piso, azulejo...), cada um com link, preço e descrição.
3. **Cuidar do veículo.** Abastecimento, troca de óleo, pneus e outros gastos.

## Decisões
- Projeto separado do PQF: repositório, organização Supabase ("Lev - gestão pessoal") e projeto Vercel próprios, para isolar custos e cotas.
- Homologação antes de produção. Migration em produção só com autorização explícita.
- Testes automatizados de preferência.

## Pluggy: o que já sabemos
- Uso pessoal: Meu Pluggy (meu.pluggy.ai). Cada pessoa conecta o próprio banco lá e o app recebe a autorização.
- Itens do Meu Pluggy não são atualizados pela API; a atualização é automática, uma vez por dia.
- O teste gratuito dura 14 dias, com até 20 contas. A regra depois do teste ainda não está confirmada.
- O plano comercial é caro para uso pessoal. A integração futura com o PQF exigirá outro arranjo.
- Client ID e Client Secret só como variáveis de ambiente de servidor.

## Em aberto
- O nome Lev não conflita com o assistente pessoal de IA (Jarvis) usado antes?
- Vercel: conta separada ou a mesma do PQF (as cotas do plano Hobby são por conta).
- Esposa: uma casa compartilhada com dois logins, ou duas contas separadas?
- Primeira tela de verdade depois da conexão com o banco: o que mostrar primeiro?
