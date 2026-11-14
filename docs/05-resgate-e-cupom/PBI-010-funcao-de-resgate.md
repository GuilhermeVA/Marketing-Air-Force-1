# PBI-010: Função de resgate e emissão do cupom

| Campo                  | Valor                           |
| ---------------------- | ------------------------------- |
| **Feature**            | [05-resgate-e-cupom](README.md) |
| **Data de criação**    | 2026-11-14                      |
| **Última atualização** | 2026-11-14                      |
| **Status**             | A fazer                         |
| **Prioridade**         | Alta                            |
| **Depende de**         | PBI-007, PBI-006                |

## Descrição

Como cliente cadastrado, quero que meu prêmio revelado seja resgatado na minha conta, desbloqueando o par no closet e me dando o cupom, sem que isso possa ser fraudado pelo navegador (RF05, RF09, RF15).

## Contexto

- Regra do PRD: 1 raspadinha, 1 resgate, vinculados a uma conta. O resgate desbloqueia o par sorteado; os demais seguem bloqueados.
- O resgate exige conta **permanente**: usuário anônimo recebe erro e a UI pede cadastro (PBI-011). No Supabase, o JWT tem a claim `is_anonymous`.
- Cupom fictício, formato `AF1-XXXX`, emitido **só no primeiro resgate da conta**, com validade e valor definidos pelo grupo.
- **Pendente de decisão:** valor e validade do cupom. Padrão sugerido: 15% de desconto, validade de 30 dias, configuráveis sem alterar o código (ex.: tabela `af1_settings`).
- Antifraude básico: validação e marcação como resgatado no servidor, dentro de uma transação.
- Usa as tabelas `af1_scratches` e `af1_unlocks` da PBI-007.

## Critérios de aceitação

- [ ] Migration cria `af1_coupons` (`id`, `user_id` único, `code` único, `discount_percent`, `expires_at`, `created_at`) com RLS: o usuário só lê o próprio cupom.
- [ ] Função RPC `af1_redeem_scratch(scratch_id)` (`security definer`) que, numa transação:
  - [ ] rejeita usuário anônimo, raspadinha de outro usuário ou raspadinha que não está `revelada` (ou `livre`, se o cliente usou "Revelar" sem a marcação ter chegado), com erros identificáveis;
  - [ ] insere em `af1_unlocks` o par sorteado;
  - [ ] muda a raspadinha para `resgatada` com `redeemed_at`;
  - [ ] se o usuário ainda não tem cupom, gera um código `AF1-XXXX` único (sem caracteres ambíguos como 0/O, 1/I) e o associa à raspadinha;
  - [ ] retorna o par desbloqueado e o cupom (novo ou `null` se já existia).
- [ ] Chamar `af1_redeem_scratch` duas vezes na mesma raspadinha não duplica desbloqueio nem cupom (idempotente; a segunda chamada retorna o mesmo resultado).

## Testes

- [ ] **Automatizado (pgTAP):** primeiro resgate gera desbloqueio e cupom no formato `^AF1-[A-HJ-NP-Z2-9]{4}$`; segundo resgate (outro dia) gera só desbloqueio.
- [ ] **Automatizado (pgTAP):** anônimo recebe erro; usuário B não resgata raspadinha de A; resgate repetido é idempotente.
- [ ] **Automatizado (pgTAP):** RLS de `af1_coupons` (A não lê o cupom de B).

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
