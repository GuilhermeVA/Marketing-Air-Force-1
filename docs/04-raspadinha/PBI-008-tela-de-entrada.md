# PBI-008: Tela de entrada e disponibilidade

| Campo                  | Valor                      |
| ---------------------- | -------------------------- |
| **Feature**            | [04-raspadinha](README.md) |
| **Data de criação**    | 2026-11-14                 |
| **Última atualização** | 2026-11-14 |
| **Status**             | Em andamento |
| **Prioridade**         | Alta                       |
| **Depende de**         | PBI-007, PBI-003           |

## Descrição

Como visitante, quero abrir o link e cair direto na raspadinha, sem instalar nada, e, se já tiver usado a minha, saber quando a próxima libera (RF01, RF02).

## Contexto

- Tela 1 do PRD: "Entrada". Recebe o visitante, verifica a disponibilidade e convida a raspar. Tom de voz confiante e discreto (ex.: "Sua próxima reunião merece um pouco de código de cor").
- Consome `af1_get_or_create_scratch()` (PBI-007) depois que a sessão está pronta (PBI-005).
- Estados da tela:
  - `available` com status `livre`: mostra a raspadinha (PBI-009).
  - `available` com status `revelada`: pula direto para o prêmio revelado e o convite para cadastrar (retomada, PBI-011).
  - `unavailable`: contagem/horário da próxima liberação e atalho para o closet; para anônimos que já usaram, convite para cadastrar.
  - `all_unlocked`: mensagem de coleção completa e atalho para o closet.
- Textos provisórios; o grupo pode trocá-los depois.

## Critérios de aceitação

- [ ] A rota `/` mostra um estado de carregamento discreto e depois um dos quatro estados acima, de acordo com a resposta do servidor.
- [ ] No estado `unavailable` de conta, o horário da próxima raspadinha aparece em formato local (ex.: "Sua próxima raspadinha libera amanhã às 00:00") e se atualiza quando o horário chega.
- [ ] Erro de rede mostra mensagem amigável e botão "Tentar de novo".
- [ ] Parâmetros UTM da URL são preservados na navegação (não quebram a rota), mesmo sem medição neste MVP.
- [ ] Layout segue o design system (PBI-003) e funciona em 360 px sem rolagem horizontal.

## Testes

- [ ] **Automatizado:** testes de componente para os quatro estados e o estado de erro, com a RPC mockada.
- [ ] **Manual:** no celular, abrir o link novo (aba anônima), raspar e resgatar, depois reabrir o link e ver o estado `unavailable`.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Início da implementação.
