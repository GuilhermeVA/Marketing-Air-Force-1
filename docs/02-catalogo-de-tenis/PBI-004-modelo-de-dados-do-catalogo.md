# PBI-004: Modelo de dados e seed do catálogo

| Campo                  | Valor                             |
| ---------------------- | --------------------------------- |
| **Feature**            | [02-catalogo-de-tenis](README.md) |
| **Data de criação**    | 2026-11-14                        |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Alta                              |
| **Depende de**         | PBI-002                           |

## Descrição

Como grupo, queremos cadastrar e editar cores, imagens, palavras-chave e textos de cada tênis direto no Supabase, para trocar o conteúdo sem alterar o código (RF16).

## Contexto

- Campos exigidos pelo PRD: nome e cor, várias imagens (carrossel), palavras-chave (lista curta), texto de significado e um peso de raridade para o sorteio (sutis mais comuns, vibrantes intermediárias, uma "rara" com chance baixa; percentuais ajustáveis).
- O estado bloqueado/desbloqueado é **por usuário** e fica em outra tabela (`af1_unlocks`, criada na PBI-007). O catálogo é público e somente leitura para o cliente.
- Imagens: bucket público no Supabase Storage, em WebP/AVIF. Imagens oficiais da marca devem ser evitadas (usar renders ou ilustrações próprias); no MVP, usar placeholders.
- A edição pelo grupo é feita no Table Editor do painel do Supabase. Não há painel administrativo no MVP.
- Pendente de decisão: catálogo final (sugestão de 6 a 8 pares). Esta PBI entrega um seed de exemplo com 6 pares (ex.: Dourado, com as palavras "riqueza" e "prosperidade") que o grupo substitui depois.

## Critérios de aceitação

- [x] Migration cria a tabela `af1_sneakers` com: `id`, `slug` (único), `name`, `color_name`, `color_hex`, `keywords text[]`, `meaning text`, `rarity` (`comum`/`intermediaria`/`rara`), `draw_weight` (inteiro > 0), `sort_order`, `active boolean`, `created_at`.
- [x] Tabela `af1_sneaker_images` (`id`, `sneaker_id`, `url`, `alt`, `position`), ou coluna equivalente ordenável, com texto alternativo obrigatório.
- [x] RLS habilitado: `select` liberado para `anon` e `authenticated` apenas em `active = true`; nenhum `insert`/`update`/`delete` pelo cliente.
- [x] Bucket `af1-sneakers` no Storage com leitura pública.
- [x] Seed (`supabase/seed.sql`) com 6 pares de exemplo, cada um com pelo menos 3 imagens placeholder, palavras-chave e texto.
- [x] Função de acesso no front (`src/features/catalog/api.ts`) que lista o catálogo ordenado e busca um par por `slug`, com tipos gerados.
- [x] Documento curto em `docs/02-catalogo-de-tenis/como-editar-o-catalogo.md` explicando ao grupo como editar pelo painel.

## Testes

- [x] **Automatizado:** teste SQL (pgTAP via `supabase test db`) que confirma que `anon` lê só pares ativos e não consegue inserir nem atualizar.
- [x] **Automatizado:** teste da função de API com o cliente Supabase mockado (lista ordenada e busca por slug inexistente retorna `null`).
- [ ] **Manual:** alterar o texto de um par no Table Editor e ver a mudança refletida no app sem novo deploy.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: migration `af1_catalogo` com `af1_sneakers` e `af1_sneaker_images` (restrições de formato para slug, cor, raridade, peso e alt), RLS somente leitura de pares ativos para `anon`/`authenticated` e bucket público `af1-sneakers` (limite de 2 MB, só imagens). Seed idempotente com 6 pares de exemplo (azul-marinho, verde-musgo, vinho, laranja, vermelho e dourado raro) e 3 ilustrações SVG genéricas por par em `public/placeholders/`. Camada `createCatalogApi` (`listSneakers`, `getSneakerBySlug`) e guia de edição para o grupo. Migration e seed aplicados no banco remoto; tipos regerados.
  - Arquivos: `supabase/migrations/20261114210000_af1_catalogo.sql`, `supabase/seed.sql`, `supabase/tests/database/af1_catalogo.test.sql`, `public/placeholders/*.svg`, `src/features/catalog/{api.ts,api.test.ts,index.ts}`, `src/lib/database.types.ts`, `package.json` (scripts `db:start`, `db:stop`, `db:reset`, `db:test`), `docs/02-catalogo-de-tenis/como-editar-o-catalogo.md`
  - Testes: pgTAP 16/16 no banco local (integridade, leitura só de ativos, escrita bloqueada para anon e authenticated, bucket público); Vitest 28/28 (5 novos da API com cliente falso); build e lint ok. No banco remoto, com a chave publishable: lista os 6 pares em ordem com 3 imagens cada; insert e update anônimos negados (401/42501); URL pública do bucket responde "Object not found" (bucket existe e é público).
  - Observações: os placeholders ficam no próprio app (`/placeholders/...`) em vez do bucket, para não precisar de upload; o bucket fica pronto para as imagens finais. O conteúdo do catálogo é público pela API, inclusive o significado de pares que o usuário ainda não desbloqueou (ver PBI-016).
  - Pendente: o teste manual (editar no Table Editor e ver no app) depende das telas que exibem o catálogo; será feito na PBI-015.
