# PBI-009: Mecânica de raspar e revelação

| Campo                  | Valor                      |
| ---------------------- | -------------------------- |
| **Feature**            | [04-raspadinha](README.md) |
| **Data de criação**    | 2026-11-14                 |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
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

- [x] Componente `ScratchCard` com canvas cobrindo a imagem do par; arrastar o dedo/mouse apaga a cobertura com pincel de borda suave.
- [x] Ao passar de um limiar raspado (ex.: 55%), a cobertura some com animação, a revelação dispara e `af1_mark_scratch_revealed` é chamada uma única vez.
- [x] Botão "Revelar" sempre visível e acessível por teclado/leitor de tela, com o mesmo efeito.
- [x] A página não rola enquanto o usuário raspa; fora da área da raspadinha, a rolagem é normal.
- [x] Revelação: brilho sutil e fundo que assume o tom suave da cor do par (`--accent`), em 300 a 600 ms; versão estática com `prefers-reduced-motion`.
- [x] O canvas se ajusta ao tamanho e à densidade de pixels da tela (nítido em telas retina) e ao girar o aparelho.
- [x] Funciona em Safari iOS e Chrome Android recentes.

## Testes

- [x] **Automatizado:** teste da função de cálculo de porcentagem raspada (canvas mockado ou função pura sobre `ImageData`).
- [x] **Automatizado:** teste de componente: clicar em "Revelar" dispara `onReveal` e a RPC uma única vez.
- [x] **Manual:** raspar num iPhone (Safari) e num Android (Chrome) reais; conferir fluidez, ausência de rolagem acidental e o fundo colorido.
- [x] **Manual:** ativar "Reduzir movimento" no sistema e conferir a versão estática.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Implementado: `ScratchCard` em canvas 2D (cobertura "cinza raspadinha" com linhas finas e "Raspe aqui"; pincel de 26 px com Pointer Events e `touch-action: none`; progresso medido no máximo uma vez por quadro; limiar de 55%; densidade de pixels limitada a 2x; redesenho ao redimensionar), botão "Revelar" com o mesmo efeito, brilho radial na cor do par e fundo no tom suave (`applyAccent`), versão estática com movimento reduzido. O texto alternativo da imagem só aparece depois da revelação.
  - Arquivos: `src/features/scratch/{ScratchCard.tsx,scratchMath.ts}`
  - Testes: unitários de `computeClearedRatio` e do botão "Revelar" (dispara uma vez e some); navegador real em produção com Chromium e WebKit (motor do Safari): raspar com o ponteiro não revela no começo e revela ao passar do limiar, a página não rola durante a raspagem, fundo assume o tom do par, reabrir mostra o mesmo prêmio, botão "Revelar" com movimento reduzido.
  - Observações: um bug encontrado no teste real foi corrigido: o pincel herdava o `strokeStyle` translúcido da cobertura e apagava só 18% por passada. WebKit no desktop não reproduz todos os detalhes do Safari no iPhone (gestos de toque, barra de endereço), por isso o teste em aparelho real continua recomendado.
  - Pendente: raspar com o dedo num iPhone e num Android reais.
- 2026-11-14 — Teste manual no celular feito pelo usuário: funcionou.
