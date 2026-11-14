# PBI-007: Disponibilidade e sorteio no servidor

| Campo                  | Valor                      |
| ---------------------- | -------------------------- |
| **Feature**            | [04-raspadinha](README.md) |
| **Data de criação**    | 2026-11-14                 |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Alta                       |
| **Depende de**         | PBI-004, PBI-005           |

## Descrição

Como organizador da campanha, quero que a disponibilidade e o sorteio sejam decididos no servidor, para que o cliente não consiga "raspar de novo" e trocar de cor (RF02, RF03, RF04).

## Contexto

- Regras do PRD:
  - Sessão anônima: direito a **uma** raspadinha.
  - Conta cadastrada: **uma por dia** (a confirmar).
  - Sem raspadinha disponível: informar quando a próxima libera.
- Sorteio entre os pares **ainda bloqueados** do usuário, ponderado por `draw_weight` (PBI-004). Se todos estiverem desbloqueados, informar o cliente.
- Status da raspadinha: `livre` (sorteada, ainda não raspada), `revelada` (raspada, aguardando resgate), `resgatada` (associada à conta, PBI-010).
- Reserva: se o usuário tem uma raspadinha `livre` ou `revelada`, a função devolve **a mesma** (idempotente). É isso que permite reabrir o link e ver o mesmo prêmio.
- Esta PBI cria a tabela `af1_unlocks` (desbloqueios por usuário), necessária para o sorteio excluir os pares já desbloqueados. A escrita nela é feita pela função de resgate (PBI-010).
- "Dia" calculado no fuso `America/Sao_Paulo`.
- **Pendente de decisão:** frequência para contas. Deixar o limite configurável (ex.: tabela `af1_settings` ou constante na função) com o padrão 1 por dia.

## Critérios de aceitação

- [x] Migration cria `af1_scratches` (`id`, `user_id` → `auth.users`, `sneaker_id`, `status`, `created_at`, `revealed_at`, `redeemed_at`, `coupon_id` nulo) com índice por `user_id`.
- [x] Migration cria `af1_unlocks` (`user_id`, `sneaker_id`, `scratch_id`, `unlocked_at`, PK `user_id + sneaker_id`), com RLS: o usuário só lê os próprios desbloqueios.
- [x] RLS: o usuário só lê as próprias raspadinhas; nenhuma escrita direta pelo cliente (só via funções).
- [x] Função RPC `af1_get_or_create_scratch()` (`security definer`, usa `auth.uid()`) que retorna um destes estados:
  - [x] `available`: raspadinha `livre`/`revelada` existente ou recém-sorteada, com os dados do par.
  - [x] `unavailable`: sem direito no momento, com `next_available_at` (contas) ou indicação de que é preciso cadastrar (anônimos que já usaram).
  - [x] `all_unlocked`: todos os pares ativos já desbloqueados.
- [x] O sorteio respeita os pesos e nunca escolhe um par já desbloqueado pelo usuário.
- [x] Chamadas repetidas ou concorrentes não criam duas raspadinhas para o mesmo usuário (trava por usuário ou constraint).
- [x] Função RPC `af1_mark_scratch_revealed(scratch_id)` muda `livre` → `revelada` e grava `revealed_at`; só funciona para o dono.
- [x] O par sorteado só é enviado ao cliente pela função (não há como listar o sorteio de outra pessoa).

## Testes

- [x] **Automatizado (pgTAP):** anônimo recebe 1 raspadinha; a segunda chamada devolve a mesma; depois de resgatada, retorna `unavailable`.
- [x] **Automatizado (pgTAP):** conta com raspadinha resgatada hoje recebe `unavailable` com `next_available_at` = meia-noite seguinte em São Paulo; amanhã recebe nova.
- [x] **Automatizado (pgTAP):** usuário com todos menos um par desbloqueado sempre sorteia o par restante; com todos desbloqueados, recebe `all_unlocked`.
- [x] **Automatizado (pgTAP):** usuário B não consegue chamar `af1_mark_scratch_revealed` numa raspadinha do usuário A.
- [x] **Automatizado:** teste estatístico simples (ex.: 1.000 sorteios num banco de teste) confirmando que o par raro sai bem menos que os comuns.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: migration `af1_raspadinha` com `af1_settings` (`scratches_per_day` = 1, editável pelo painel), `af1_unlocks`, `af1_scratches` (índice único: no máximo uma pendente por usuário) com RLS de leitura própria, sorteio ponderado interno `af1_draw_sneaker`, RPCs `af1_get_or_create_scratch()` (trava por usuário com advisory lock; estados `available`, `unavailable` com `reason` `signup_required` ou `daily_limit` e `next_available_at`, e `all_unlocked`) e `af1_mark_scratch_revealed(id)` (idempotente). A resposta traz nome, cor e a primeira imagem do par, sem o texto de significado. Aplicada no banco remoto; tipos regerados.
  - Arquivos: `supabase/migrations/20261114230000_af1_raspadinha.sql`, `supabase/tests/database/af1_raspadinha.test.sql`, `src/lib/database.types.ts`
  - Testes: pgTAP 17/17 (reserva, revelação idempotente, isolamento entre usuários, sorteio interno e inserção direta bloqueados ao cliente, anônimo que já usou, limite diário com virada à meia-noite de São Paulo, só pares bloqueados, coleção completa, raridade em 3000 sorteios).
  - Observações: a concorrência é garantida pelo advisory lock e pelo índice único de pendentes; não houve teste com chamadas paralelas reais.
