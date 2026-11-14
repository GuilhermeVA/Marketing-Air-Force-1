# PBI-002: Integração com Supabase e migrations

| Campo                  | Valor                               |
| ---------------------- | ----------------------------------- |
| **Feature**            | [01-fundacao-do-projeto](README.md) |
| **Data de criação**    | 2026-11-14                          |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Alta                                |
| **Depende de**         | PBI-001                             |

## Descrição

Como grupo, queremos o projeto Supabase criado e conectado ao front, com o schema versionado em migrations, para que o banco seja reproduzível e revisável no repositório.

## Contexto

- O Supabase concentra a lógica de servidor do MVP: catálogo, raspadinhas, desbloqueios, cupons, Auth (incluindo sessão anônima) e RLS.
- Plano gratuito: o projeto pausa após 1 semana sem uso. Precisa ser usado com regularidade e conferido na véspera da apresentação.
- Usar a Supabase CLI (`supabase/migrations/`) para versionar o schema; as PBIs seguintes adicionam suas migrations.
- **Projeto Supabase exclusivo** (decisão de 2026-11-14): o projeto `lotkxzqrloyqeyaooabp` é dedicado a esta aplicação. Mesmo assim, todo objeto usa o prefixo `af1_` (tabelas, funções, views, policies, triggers) ou `af1-` (buckets do Storage), em minúsculas, para deixar claro o que pertence à aplicação e permitir compartilhar o banco no futuro sem retrabalho.
- As chaves públicas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) vão no `.env` local e nas variáveis de ambiente da Vercel. A service role key nunca vai para o front.

## Critérios de aceitação

- [x] Projeto Supabase criado (região mais próxima do Brasil disponível no plano gratuito). *Criado em us-east-1; mantido por decisão do usuário em 2026-11-14.*
- [x] Pasta `supabase/` inicializada no repositório com a CLI, com `config.toml` e `migrations/`.
- [x] Cliente único do Supabase em `src/lib/supabase.ts`, tipado com os tipos gerados (`npm run db:types`), lendo as variáveis `VITE_*`.
- [x] Variáveis configuradas na Vercel; o build publicado consegue se conectar ao Supabase.
- [x] Script `npm run db:types` para regerar os tipos.
- [x] README documenta como aplicar as migrations e o aviso sobre a pausa do plano gratuito.

## Testes

- [x] **Automatizado:** teste que garante que `src/lib/supabase.ts` lança erro claro quando as variáveis de ambiente estão ausentes.
- [x] **Manual:** na URL publicada, abrir o console e confirmar uma chamada bem-sucedida ao Supabase (ex.: `supabase.auth.getSession()` sem erro).

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado (parcial): Supabase CLI v3 como dependência de dev, `supabase/` inicializada (`config.toml` com `project_id` próprio e URLs locais do Vite, `migrations/`), cliente único em `src/lib/supabase.ts` com validação das variáveis em `src/lib/env.ts`, scripts `db:types` e `db:push`, `.env.local` preenchido (fora do Git) e seção do banco no README.
  - Arquivos: `supabase/config.toml`, `supabase/.gitignore`, `supabase/migrations/.gitkeep`, `src/lib/supabase.ts`, `src/lib/env.ts`, `src/lib/env.test.ts`, `src/lib/database.types.ts`, `package.json`, `README.md`, `.prettierignore`
  - Testes: `src/lib/env.test.ts` 3/3 passando; build e lint ok; chamada a `GET /auth/v1/settings` do projeto com a chave publishable respondeu 200 (URL e chave válidas).
  - Observações: variável renomeada para `VITE_SUPABASE_PUBLISHABLE_KEY` (o Supabase usa chaves "publishable" no lugar da "anon"). Na CLI v3 a geração remota de tipos usa `--remote` (não `--linked`). `database.types.ts` é um placeholder até a primeira geração, pois ainda não há tabelas.
  - Pendente (ações do usuário): `npx supabase login` e `npx supabase link --project-ref lotkxzqrloyqeyaooabp`; cadastrar as variáveis na Vercel; depois disso, rodar `npm run db:types` e conferir a conexão na URL publicada. Região do projeto não verificada.
- 2026-11-14 — Implementado (conclusão): usuário fez `supabase login`; projeto já linkado. Tipos gerados com `npm run db:types` (schema `public` ainda vazio). Cliente importado em `src/main.tsx` para falhar cedo se faltar variável. Variáveis cadastradas na Vercel pelo usuário (sem a integração do Marketplace).
  - Arquivos: `src/lib/database.types.ts`, `src/main.tsx`, `CLAUDE.md`
  - Testes: bundle publicado contém a URL e a chave publishable; Playwright na URL de produção renderizou 4 rotas sem erros no console; `fetch` ao `GET /auth/v1/settings` a partir do domínio da Vercel retornou 200 (CORS ok).
  - Observações: projeto está em **us-east-1**, não em São Paulo; mantido com aprovação do usuário (latência extra de ~100–150 ms aceita). O bundle passou de 500 kB (155 kB gzip) com o supabase-js e o Motion. Avaliar divisão de código na PBI-018 por causa da meta de LCP.
