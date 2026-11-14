# PBI-014: Favoritar e ordenar pares

| Campo                  | Valor                  |
| ---------------------- | ---------------------- |
| **Feature**            | [06-closet](README.md) |
| **Data de criação**    | 2026-11-14             |
| **Última atualização** | 2026-11-14             |
| **Status**             | A fazer                |
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

- [ ] Migration adiciona `is_favorite boolean default false` em `af1_unlocks`; RPC ou policy de `update` permite ao usuário alterar **apenas** esse campo nos próprios desbloqueios.
- [ ] Ícone de favorito (traço fino) nos cards desbloqueados e na tela do tênis, com estado acessível (`aria-pressed`).
- [ ] Seletor de ordenação no closet com as 4 opções acima; a escolha é lembrada no aparelho (localStorage com try/catch).
- [ ] Favoritar atualiza a interface na hora (otimista) e desfaz se o servidor falhar.

## Testes

- [ ] **Automatizado:** função de ordenação para as 4 opções.
- [ ] **Automatizado (pgTAP):** usuário só altera `is_favorite` dos próprios desbloqueios e não consegue alterar outros campos.
- [ ] **Manual:** favoritar, recarregar a página e ver o favorito mantido; trocar a ordenação e recarregar.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
