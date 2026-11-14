# PBI-010: Função de resgate e emissão do cupom

| Campo                  | Valor                           |
| ---------------------- | ------------------------------- |
| **Feature**            | [05-resgate-e-cupom](README.md) |
| **Data de criação**    | 2026-11-14                      |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Alta                            |
| **Depende de**         | PBI-007, PBI-006                |

## Descrição

Como cliente cadastrado, quero que meu prêmio revelado seja resgatado na minha conta, desbloqueando o par no closet e me dando o cupom, sem que isso possa ser fraudado pelo navegador (RF05, RF09, RF15).

## Contexto

- Regra do PRD: 1 raspadinha, 1 resgate, vinculados a uma conta. O resgate desbloqueia o par sorteado; os demais seguem bloqueados.
- O resgate exige conta **permanente**: usuário anônimo recebe erro e a UI pede cadastro (PBI-011). No Supabase, o JWT tem a claim `is_anonymous`.
- Cupom fictício, formato `AF1-XXXX`, emitido **só no primeiro resgate da conta**, com validade e valor definidos pelo grupo.
- Valor e validade do cupom (decisão do usuário em 2026-11-14): **10% de desconto, validade de 10 dias**, configuráveis em `af1_settings` sem alterar o código.
- Antifraude básico: validação e marcação como resgatado no servidor, dentro de uma transação.
- Usa as tabelas `af1_scratches` e `af1_unlocks` da PBI-007.

## Critérios de aceitação

- [x] Migration cria `af1_coupons` (`id`, `user_id` único, `code` único, `discount_percent`, `expires_at`, `created_at`) com RLS: o usuário só lê o próprio cupom.
- [x] Função RPC `af1_redeem_scratch(scratch_id)` (`security definer`) que, numa transação:
  - [x] rejeita usuário anônimo, raspadinha de outro usuário ou raspadinha que não está `revelada` (ou `livre`, se o cliente usou "Revelar" sem a marcação ter chegado), com erros identificáveis;
  - [x] insere em `af1_unlocks` o par sorteado;
  - [x] muda a raspadinha para `resgatada` com `redeemed_at`;
  - [x] se o usuário ainda não tem cupom, gera um código `AF1-XXXX` único (sem caracteres ambíguos como 0/O, 1/I) e o associa à raspadinha;
  - [x] retorna o par desbloqueado e o cupom (novo ou `null` se já existia).
- [x] Chamar `af1_redeem_scratch` duas vezes na mesma raspadinha não duplica desbloqueio nem cupom (idempotente; a segunda chamada retorna o mesmo resultado).

## Testes

- [x] **Automatizado (pgTAP):** primeiro resgate gera desbloqueio e cupom no formato `^AF1-[A-HJ-NP-Z2-9]{4}$`; segundo resgate (outro dia) gera só desbloqueio.
- [x] **Automatizado (pgTAP):** anônimo recebe erro; usuário B não resgata raspadinha de A; resgate repetido é idempotente.
- [x] **Automatizado (pgTAP):** RLS de `af1_coupons` (A não lê o cupom de B).

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: migration `af1_resgate` com `af1_coupons` (um por conta, código único `AF1-XXXX` validado por regex, RLS de leitura própria), configurações `coupon_discount_percent` = 10 e `coupon_valid_days` = 10 em `af1_settings`, gerador interno de código sem 0/O/1/I e RPC `af1_redeem_scratch(id)` (exige conta permanente, trava por usuário, aceita raspadinha `livre` ou `revelada`, desbloqueia o par, emite o cupom só no primeiro resgate com até 10 tentativas em caso de código repetido, idempotente). Aplicada no banco remoto; tipos regerados.
  - Arquivos: `supabase/migrations/20261115000000_af1_resgate.sql`, `supabase/tests/database/af1_resgate.test.sql`, `src/lib/database.types.ts`
  - Testes: pgTAP 14/14 (formato, desconto e validade do cupom, desbloqueio, idempotência, segundo resgate sem cupom, isolamento entre usuários, anônimo bloqueado, gerador inacessível ao cliente); suíte completa de banco 58/58, estável em 3 execuções.
  - Observações: o teste estatístico da PBI-007 tinha uma falha de construção (o sorteio era reavaliado ou avaliado uma única vez conforme o plano da consulta); corrigido. A distribuição real medida em 6000 sorteios bate com os pesos.
