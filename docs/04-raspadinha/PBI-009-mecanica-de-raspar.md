# PBI-009: Mecânica de raspar e revelação

| Campo                  | Valor                      |
| ---------------------- | -------------------------- |
| **Feature**            | [04-raspadinha](README.md) |
| **Data de criação**    | 2026-11-14                 |
| **Última atualização** | 2026-11-14                 |
| **Status**             | A fazer                    |
| **Prioridade**         | Alta                       |
| **Depende de**         | PBI-008                    |

## Descrição

Como visitante, quero raspar a tela com o dedo e ver o tênis aparecer aos poucos, para ter um momento de surpresa elegante, ou tocar em "Revelar" se não conseguir fazer o gesto (RF03, acessibilidade).

## Contexto

- PRD: canvas 2D com máscara apagada pelo toque, sem biblioteca. Camada "cinza raspadinha" que reage ao toque; na revelação, brilho sutil e fundo "pintado" a partir da cor do tênis.
- O par sorteado já vem da PBI-008 (imagem por baixo do canvas). Ao completar a raspagem, chamar `af1_mark_scratch_revealed` (PBI-007).
- Riscos do PRD:
  - A raspagem pode falhar no Safari do iOS: usar Pointer Events e `touch-action: none` na área, e validar cedo num iPhone real.
  - Celulares simples podem travar: manter 60 fps, limitar o cálculo de porcentagem raspada.
- `prefers-reduced-motion`: versão estática (sem brilho animado; revelação com fade simples).
- A imagem por baixo não pode ser descoberta antes da raspagem só para quem tenta trapacear visualmente. Como o sorteio já está fixado no servidor, isso não muda o resultado (aceitável).

## Critérios de aceitação

- [ ] Componente `ScratchCard` com canvas cobrindo a imagem do par; arrastar o dedo/mouse apaga a cobertura com pincel de borda suave.
- [ ] Ao passar de um limiar raspado (ex.: 55%), a cobertura some com animação, a revelação dispara e `af1_mark_scratch_revealed` é chamada uma única vez.
- [ ] Botão "Revelar" sempre visível e acessível por teclado/leitor de tela, com o mesmo efeito.
- [ ] A página não rola enquanto o usuário raspa; fora da área da raspadinha, a rolagem é normal.
- [ ] Revelação: brilho sutil e fundo que assume o tom suave da cor do par (`--accent`), em 300 a 600 ms; versão estática com `prefers-reduced-motion`.
- [ ] O canvas se ajusta ao tamanho e à densidade de pixels da tela (nítido em telas retina) e ao girar o aparelho.
- [ ] Funciona em Safari iOS e Chrome Android recentes.

## Testes

- [ ] **Automatizado:** teste da função de cálculo de porcentagem raspada (canvas mockado ou função pura sobre `ImageData`).
- [ ] **Automatizado:** teste de componente: clicar em "Revelar" dispara `onReveal` e a RPC uma única vez.
- [ ] **Manual:** raspar num iPhone (Safari) e num Android (Chrome) reais; conferir fluidez, ausência de rolagem acidental e o fundo colorido.
- [ ] **Manual:** ativar "Reduzir movimento" no sistema e conferir a versão estática.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
