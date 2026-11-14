# PBI-014: Favoritar e ordenar pares

| Campo                  | Valor                  |
| ---------------------- | ---------------------- |
| **Feature**            | [06-closet](README.md) |
| **Data de criação**    | 2026-11-14             |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Média                  |
| **Depende de**         | PBI-013                |

## Descrição

Como cliente, quero favoritar meus pares preferidos e ordenar o closet, para organizar a coleção do meu jeito (RF08).

## Contexto

- Parte do RF08 (M no PRD). Prioridade "Média" dentro do MVP: é a última da Feature e pode ser cortada se o prazo apertar, sem quebrar o ciclo principal.
- Só pares **desbloqueados** podem ser favoritados.
- Favoritos ficam no banco (`af1_unlocks.is_favorite`) para acompanhar a conta; dão base aos "dados próprios" citados no plano de marketing (cores preferidas).
- Ordenações sugeridas: padrão do catálogo, favoritos primeiro, desbloqueados primeiro, mais recentes.

## Critérios de aceitação

- [x] Migration adiciona `is_favorite boolean default false` em `af1_unlocks`; RPC ou policy de `update` permite ao usuário alterar **apenas** esse campo nos próprios desbloqueios.
- [x] Ícone de favorito (traço fino) nos cards desbloqueados e na tela do tênis, com estado acessível (`aria-pressed`).
- [x] Seletor de ordenação no closet com as 4 opções acima; a escolha é lembrada no aparelho (localStorage com try/catch).
- [x] Favoritar atualiza a interface na hora (otimista) e desfaz se o servidor falhar.

## Testes

- [x] **Automatizado:** função de ordenação para as 4 opções.
- [x] **Automatizado (pgTAP):** usuário só altera `is_favorite` dos próprios desbloqueios e não consegue alterar outros campos.
- [x] **Manual:** favoritar, recarregar a página e ver o favorito mantido; trocar a ordenação e recarregar.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: migration `af1_favoritos` (`is_favorite` em `af1_unlocks`, permissão de update só nessa coluna e só nos próprios desbloqueios), `setFavorite` na API do closet, botão de coração (traço fino, `aria-pressed`) nos cards desbloqueados com atualização otimista e reversão em caso de erro, seletor "Ordenar" (Coleção, Favoritos primeiro, Desbloqueados primeiro, Mais recentes) lembrado no aparelho com `localStorage` protegido por try/catch. Aplicada no banco remoto; tipos regerados.
  - Arquivos: `supabase/migrations/20261115010000_af1_favoritos.sql`, `supabase/tests/database/af1_favoritos.test.sql`, `src/features/closet/{api.ts,model.ts,ClosetView.tsx,closet.test.tsx}`, `src/lib/database.types.ts`
  - Testes: pgTAP 5/5 (favorita o próprio, não alcança o de outro, não altera data nem par, não apaga) e suíte de banco 63/63; Vitest 91/91 (6 novos: 4 ordenações, lista original preservada, favoritar, reverter em erro, sem botão em bloqueados, ordenação lembrada); navegador real em produção: favorito e ordenação mantidos após recarregar a página.
  - Observações: o favorito na tela do tênis ficou para a PBI-015 (nota adicionada lá), pois a tela ainda não existe.
