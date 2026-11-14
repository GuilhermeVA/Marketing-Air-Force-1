# PBI-002: Integração com Supabase e migrations

| Campo                  | Valor                               |
| ---------------------- | ----------------------------------- |
| **Feature**            | [01-fundacao-do-projeto](README.md) |
| **Data de criação**    | 2026-11-14                          |
| **Última atualização** | 2026-11-14                          |
| **Status**             | A fazer                             |
| **Prioridade**         | Alta                                |
| **Depende de**         | PBI-001                             |

## Descrição

Como grupo, queremos o projeto Supabase criado e conectado ao front, com o schema versionado em migrations, para que o banco seja reproduzível e revisável no repositório.

## Contexto

- O Supabase concentra a lógica de servidor do MVP: catálogo, raspadinhas, desbloqueios, cupons, Auth (incluindo sessão anônima) e RLS.
- Plano gratuito: o projeto pausa após 1 semana sem uso. Precisa ser usado com regularidade e conferido na véspera da apresentação.
- Usar a Supabase CLI (`supabase/migrations/`) para versionar o schema; as PBIs seguintes adicionam suas migrations.
- **Projeto Supabase exclusivo** (decisão de 2026-11-14): o projeto `lotkxzqrloyqeyaooabp` é dedicado a esta aplicação. Mesmo assim, todo objeto usa o prefixo `af1_` (tabelas, funções, views, policies, triggers) ou `af1-` (buckets do Storage), em minúsculas, para deixar claro o que pertence à aplicação e permitir compartilhar o banco no futuro sem retrabalho.
- As chaves públicas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) vão no `.env` local e nas variáveis de ambiente da Vercel. A service role key nunca vai para o front.

## Critérios de aceitação

- [ ] Projeto Supabase criado (região mais próxima do Brasil disponível no plano gratuito).
- [ ] Pasta `supabase/` inicializada no repositório com a CLI, com `config.toml` e `migrations/`.
- [ ] Cliente único do Supabase em `src/lib/supabase.ts`, tipado com os tipos gerados (`supabase gen types`), lendo as variáveis `VITE_*`.
- [ ] Variáveis configuradas na Vercel; o build publicado consegue se conectar ao Supabase.
- [ ] Script `npm run db:types` para regerar os tipos.
- [ ] README documenta como aplicar as migrations e o aviso sobre a pausa do plano gratuito.

## Testes

- [ ] **Automatizado:** teste que garante que `src/lib/supabase.ts` lança erro claro quando as variáveis de ambiente estão ausentes.
- [ ] **Manual:** na URL publicada, abrir o console e confirmar uma chamada bem-sucedida ao Supabase (ex.: `supabase.auth.getSession()` sem erro).

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
