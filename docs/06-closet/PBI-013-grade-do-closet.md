# PBI-013: Grade do closet com bloqueados e desbloqueados

| Campo                  | Valor                  |
| ---------------------- | ---------------------- |
| **Feature**            | [06-closet](README.md) |
| **Data de criação**    | 2026-11-14             |
| **Última atualização** | 2026-11-14             |
| **Status**             | A fazer                |
| **Prioridade**         | Alta                   |
| **Depende de**         | PBI-004, PBI-010       |

## Descrição

Como cliente, quero ver no meu closet todos os pares da coleção, sabendo quais já desbloqueei e quais faltam, para querer completar a coleção (RF08, RF14 na grade, RF15).

## Contexto

- Tela 4 do PRD: "Closet". Vitrine de todos os pares; cards em cascata (stagger) e hover 3D leve.
- Estado de cada par = catálogo (PBI-004) cruzado com `af1_unlocks` do usuário (PBI-007/PBI-010).
- Bloqueado na grade: acinzentado, cadeado de traço fino desenhado no centro, **continua clicável** (abre a tela do tênis no estado bloqueado, PBI-016). Não pode parecer erro nem tela vazia. Indicar também por ícone e texto (acessibilidade), não só pelo cinza.
- Usuário anônimo sem resgate vê todos bloqueados e um convite para raspar/cadastrar.
- Favoritar e ordenar ficam na PBI-014.

## Critérios de aceitação

- [ ] Rota `/closet` lista todos os pares ativos, em grade de 2 colunas em 360 px, com foto grande e nome.
- [ ] Pares desbloqueados aparecem em cor; bloqueados em tons de cinza, com cadeado centralizado e rótulo acessível (ex.: `aria-label="Dourado, bloqueado"` e texto "Bloqueado" visível).
- [ ] Contador de progresso discreto (ex.: "2 de 6 pares").
- [ ] Tocar em qualquer card (bloqueado ou não) navega para `/tenis/:slug`.
- [ ] Animação de entrada em cascata (respeitando `prefers-reduced-motion`); só `transform`/`opacity`.
- [ ] Atalhos para a raspadinha (com o estado de disponibilidade) e para o cupom, se existir.
- [ ] Imagens com lazy load e dimensões reservadas (sem salto de layout).

## Testes

- [ ] **Automatizado:** teste de componente com catálogo de 6 pares e 2 desbloqueados: 2 em cor, 4 com cadeado e rótulo "bloqueado"; clique navega para o slug correto.
- [ ] **Automatizado:** função pura que cruza catálogo e desbloqueios.
- [ ] **Manual:** no celular, conferir a grade, o progresso e a navegação; com "Reduzir movimento", conferir que a cascata é desativada.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
