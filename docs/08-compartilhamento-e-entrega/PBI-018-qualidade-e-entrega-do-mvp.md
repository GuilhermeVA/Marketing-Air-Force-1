# PBI-018: Qualidade e checklist de entrega do MVP

| Campo                  | Valor                                      |
| ---------------------- | ------------------------------------------ |
| **Feature**            | [08-compartilhamento-e-entrega](README.md) |
| **Data de criação**    | 2026-11-14                                 |
| **Última atualização** | 2026-11-14                                 |
| **Status**             | A fazer                                    |
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

- [ ] Teste ponta a ponta automatizado (Playwright, viewport de celular) do caminho feliz: abrir link → raspar/"Revelar" → cadastrar (com o e-mail simulado/mockado no ambiente de teste) → cupom → closet → tela do tênis.
- [ ] Lighthouse mobile da URL publicada ≥ 90 em Performance e Acessibilidade, com LCP ≤ 2,5 s (relatório salvo em `docs/08-compartilhamento-e-entrega/lighthouse/`).
- [ ] Fluxo completo executado num iPhone (Safari) e num Android (Chrome) reais, incluindo um aparelho de entrada, sem travamentos perceptíveis.
- [ ] Navegação completa só por teclado no desktop e checagem com leitor de tela (VoiceOver ou TalkBack) nas telas principais.
- [ ] `prefers-reduced-motion` conferido em todas as telas com animação.
- [ ] Script SQL `supabase/scripts/apagar-dados-usuarios.sql` documentado (apaga raspadinhas, desbloqueios, cupons, perfis e usuários), **não executado**.
- [ ] Checklist de apresentação no README: acessar o Supabase na véspera (evitar pausa), confirmar limites vigentes de Vercel e Supabase, conferir variáveis de ambiente e redirect URLs do Auth.
- [ ] Nenhum erro no console nas telas principais.

## Testes

- [ ] **Automatizado:** suíte Playwright do caminho feliz rodando com `npm run test:e2e`.
- [ ] **Automatizado:** `npm run lint`, `npm test` e `supabase test db` passando.
- [ ] **Manual:** roteiro dos dispositivos reais e do Lighthouse acima, com resultado registrado no log desta PBI.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
