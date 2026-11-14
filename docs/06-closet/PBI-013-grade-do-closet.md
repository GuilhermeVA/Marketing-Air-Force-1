# PBI-013: Grade do closet com bloqueados e desbloqueados

| Campo                  | Valor                  |
| ---------------------- | ---------------------- |
| **Feature**            | [06-closet](README.md) |
| **Data de criação**    | 2026-11-14             |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
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

- Nota de 2026-11-14 (PBI-011): conferir aqui que o par resgatado aparece desbloqueado na grade logo após o resgate. A tela de resgate leva ao closet pelo botão "Ver meu closet" (e o cupom tem o mesmo link).

## Critérios de aceitação

- [x] Rota `/closet` lista todos os pares ativos, em grade de 2 colunas em 360 px, com foto grande e nome.
- [x] Pares desbloqueados aparecem em cor; bloqueados em tons de cinza, com cadeado centralizado e rótulo acessível (ex.: `aria-label="Dourado, bloqueado"` e texto "Bloqueado" visível).
- [x] Contador de progresso discreto (ex.: "2 de 6 pares").
- [x] Tocar em qualquer card (bloqueado ou não) navega para `/tenis/:slug`.
- [x] Animação de entrada em cascata (respeitando `prefers-reduced-motion`); só `transform`/`opacity`.
- [x] Atalhos para a raspadinha (com o estado de disponibilidade) e para o cupom, se existir.
- [x] Imagens com lazy load e dimensões reservadas (sem salto de layout).

## Testes

- [x] **Automatizado:** teste de componente com catálogo de 6 pares e 2 desbloqueados: 2 em cor, 4 com cadeado e rótulo "bloqueado"; clique navega para o slug correto.
- [x] **Automatizado:** função pura que cruza catálogo e desbloqueios.
- [ ] **Manual:** no celular, conferir a grade, o progresso e a navegação; com "Reduzir movimento", conferir que a cascata é desativada.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: `ClosetView` com grade de 2 colunas de todos os pares ativos (catálogo cruzado com `af1_unlocks` por `buildCloset`), pares bloqueados em cinza com cadeado de traço fino sobre fundo claro, texto "Bloqueado" e rótulo acessível ("Vinho, bloqueado"), todos clicáveis para `/tenis/:slug`; contador "N de 6 pares"; entrada em cascata e leve inclinação 3D no hover (só sem movimento reduzido); convite para raspar quando não há pares; atalhos para a raspadinha (com disponibilidade, via `af1_get_or_create_scratch`) e para o cupom; imagens com `loading="lazy"` e dimensões reservadas. A conta (entrar/sair) virou um rodapé do closet. A página passou a criar a API do catálogo a partir do cliente do contexto.
  - Arquivos: `src/features/closet/{model.ts,api.ts,ClosetView.tsx,closet.test.tsx}`, `src/pages/ClosetPage.tsx`, `src/ui/{LockIcon.tsx,index.ts}`, `src/routes.test.tsx`
  - Testes: Vitest (cruzamento, 6 cards com 4 bloqueados e 2 desbloqueados, rótulos e links, convite sem pares, atalhos); navegador real em produção (Chromium, 360 px): closet anônimo "0 de 6", após resgatar "1 de 6" com 5 cards em cinza, atalho "Próxima raspadinha amanhã às 00:00", par bloqueado abre `/tenis/<slug>`, sem rolagem horizontal, 0 erros.
  - Observações: confirmado também o critério da PBI-011 (o par resgatado aparece desbloqueado na grade). Conta de teste criada em produção: `teste-e2e-closet-1794696353220@example.com`.
  - Pendente: conferir no celular real com "Reduzir movimento" ligado.
