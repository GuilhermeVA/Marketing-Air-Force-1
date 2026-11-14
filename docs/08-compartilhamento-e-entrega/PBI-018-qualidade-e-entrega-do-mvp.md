# PBI-018: Qualidade e checklist de entrega do MVP

| Campo                  | Valor                                      |
| ---------------------- | ------------------------------------------ |
| **Feature**            | [08-compartilhamento-e-entrega](README.md) |
| **Data de criação**    | 2026-11-14                                 |
| **Última atualização** | 2026-11-14 |
| **Status**             | Em andamento |
| **Prioridade**         | Alta                                       |
| **Depende de**         | PBI-001 a PBI-017                          |

## Descrição

Como grupo, queremos verificar o MVP de ponta a ponta contra as metas não funcionais do PRD, para chegar ao teste piloto e à apresentação sem surpresas.

## Contexto

- Metas do PRD: Lighthouse mobile ≥ 90 e LCP ≤ 2,5 s em 4G; 60 fps em celulares intermediários; WCAG AA; Safari iOS e Chrome Android recentes; custo R$ 0.
- Critério de escopo do MVP: "fluxo completo funciona no celular".
- Riscos a conferir: o Supabase gratuito pausa após 1 semana sem uso; limites dos planos mudam; o Hobby da Vercel é só para uso não comercial.
- LGPD: apagar os dados ao fim da disciplina. Esta PBI deixa pronto um script de limpeza, mas não o executa.
- Como o projeto Supabase é exclusivo desta aplicação, ao fim da disciplina também é possível simplesmente excluir o projeto inteiro no painel; o script fica como alternativa para apagar só os dados mantendo a estrutura.
- Nota de 2026-11-14: o bundle inicial já passa de 500 kB (155 kB gzip) com supabase-js e Motion; avaliar divisão de código por rota para a meta de LCP. `@playwright/test` e o Chromium já estão instalados (PBI-003). O Supabase está em us-east-1, o que acrescenta latência nas chamadas.
- Nota de 2026-11-14: com login por e-mail e senha sem confirmação (PBI-006), o teste ponta a ponta não precisa simular e-mail.
- Esta PBI corrige problemas pequenos encontrados; problemas grandes viram novas PBIs.

## Critérios de aceitação

- [x] Teste ponta a ponta automatizado (Playwright, viewport de celular) do caminho feliz: abrir link → raspar/"Revelar" → cadastrar (com o e-mail simulado/mockado no ambiente de teste) → cupom → closet → tela do tênis.
- [ ] Lighthouse mobile da URL publicada ≥ 90 em Performance e Acessibilidade, com LCP ≤ 2,5 s (relatório salvo em `docs/08-compartilhamento-e-entrega/lighthouse/`).
- [ ] Fluxo completo executado num iPhone (Safari) e num Android (Chrome) reais, incluindo um aparelho de entrada, sem travamentos perceptíveis.
- [ ] Navegação completa só por teclado no desktop e checagem com leitor de tela (VoiceOver ou TalkBack) nas telas principais.
- [ ] `prefers-reduced-motion` conferido em todas as telas com animação.
- [x] Script SQL `supabase/scripts/apagar-dados-usuarios.sql` documentado (apaga raspadinhas, desbloqueios, cupons, perfis e usuários), **não executado**.
- [x] Checklist de apresentação no README: acessar o Supabase na véspera (evitar pausa), confirmar limites vigentes de Vercel e Supabase, conferir variáveis de ambiente e redirect URLs do Auth.
- [x] Nenhum erro no console nas telas principais.

## Testes

- [x] **Automatizado:** suíte Playwright do caminho feliz rodando com `npm run test:e2e`.
- [x] **Automatizado:** `npm run lint`, `npm test` e `supabase test db` passando.
- [ ] **Manual:** roteiro dos dispositivos reais e do Lighthouse acima, com resultado registrado no log desta PBI.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado:
  - Desempenho: fontes servidas pelo próprio site (Inter via Fontsource; Playfair 500 com endereço fixo e `preload`), `preconnect` ao Supabase, animações do Motion carregadas sob demanda (`LazyMotion`), telas além da inicial em chunks próprios (`route.lazy`), estrutura da tela inicial no próprio HTML (pinta antes do JavaScript; removida em outras rotas), imagem do prêmio invisível sob a cobertura até a raspagem começar e `robots.txt`.
  - Suíte Playwright (`npm run test:e2e`, tela Pixel 7, Supabase local): fluxo completo do link ao tênis desbloqueado e bloqueado, revelar só com teclado, rota aberta direto sem a estrutura da inicial; todos verificam 0 erros de página/console no fluxo principal.
  - `supabase/scripts/apagar-dados-usuarios.sql` (seção A: contas de teste; seção B: todos os usuários) — **não executado**. Checklist de apresentação e seção de testes no README.
  - Arquivos: `index.html`, `src/main.tsx`, `src/index.css`, `src/routes.tsx`, `src/pages/RouteLoading.tsx`, `src/features/auth/RequireSession.tsx`, `src/features/scratch/{HomeShell.tsx,ScratchHome.tsx,ScratchCard.tsx}`, `src/ui/motionFeatures.ts` e componentes com `m.*`, `public/{robots.txt,fonts/}`, `playwright.config.ts`, `tests/e2e/fluxo-completo.spec.ts`, `supabase/scripts/apagar-dados-usuarios.sql`, `README.md`, `vite.config.ts`, `tsconfig.node.json`, `docs/08-compartilhamento-e-entrega/lighthouse/*.html`
  - Testes: Vitest 104/104, pgTAP 72/72, Playwright 3/3, build, lint e formatação ok. Lighthouse mobile em produção (relatórios salvos): Acessibilidade, Boas práticas e SEO 100 em todas as páginas; Performance 93–96 em `/closet`, `/tenis` e `/cupom` e 75–95 em `/` (o TBT medido oscilou de 80 a 2237 ms entre execuções idênticas nesta máquina; o perfil com CPU 4x mais lenta mostrou só 3 tarefas longas, ~140 ms de bloqueio); LCP simulado de 2,4 a 2,8 s (era 3,5 s). LCP real medido no navegador: 0,44 s (o título).
  - Observações: a meta de LCP ≤ 2,5 s no Lighthouse **não foi atingida de forma estável**. O que resta é o peso do supabase-js (inclui Realtime e Storage, que o app não usa) e a latência até us-east-1 (cada chamada ~600 ms daqui). Próximos passos possíveis: cliente enxuto só com Auth e PostgREST, ou projeto Supabase em São Paulo.
  - Pendente (manual, usuário): fluxo completo num iPhone e num Android (incluindo um aparelho de entrada), leitor de tela (VoiceOver/TalkBack), conferência de "Reduzir movimento" em todas as telas, prévia do link no WhatsApp e no LinkedIn.
