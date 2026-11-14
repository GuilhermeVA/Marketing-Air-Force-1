# PBI-016: Estado bloqueado da tela do tênis

| Campo                  | Valor                         |
| ---------------------- | ----------------------------- |
| **Feature**            | [07-tela-do-tenis](README.md) |
| **Data de criação**    | 2026-11-14                    |
| **Última atualização** | 2026-11-14                    |
| **Status**             | A fazer                       |
| **Prioridade**         | Alta                          |
| **Depende de**         | PBI-015                       |

## Descrição

Como cliente, quero abrir um par que ainda não desbloqueei e ver que ele existe, mas sem o significado, para ter vontade de desbloqueá-lo (RF14).

## Contexto

- PRD: na tela do tênis bloqueado, o par segue acinzentado com o cadeado centralizado sobre ele, e as palavras-chave e o texto dão lugar ao aviso "Desbloqueie esse tênis para ver o que ele simboliza" (texto provisório).
- O estado também é indicado por ícone e texto, não só pelo cinza. Não pode parecer erro.
- **Decisão do usuário em 2026-11-14: esconder no servidor.** O cliente perde a leitura direta das colunas `keywords` e `meaning` de `af1_sneakers`; a tela do tênis usa a RPC `af1_get_sneaker_detail(slug)`, que só devolve esses campos quando o usuário desbloqueou o par.
- **Pendente de decisão:** o carrossel do bloqueado mostra todas as imagens em cinza ou só a primeira? Padrão desta PBI: **só a primeira imagem**, em cinza (mais simples e mantém o mistério); trocar se o grupo decidir o contrário.

## Critérios de aceitação

- [ ] Par bloqueado em `/tenis/:slug` mostra a primeira imagem em tons de cinza com cadeado de traço fino centralizado.
- [ ] Etiquetas e texto de significado substituídos pelo aviso "Desbloqueie esse tênis para ver o que ele simboliza".
- [ ] Ícone de cadeado + texto "Bloqueado" visíveis e anunciados por leitores de tela.
- [ ] Chamada para a ação: botão para a raspadinha quando houver uma disponível, ou o horário da próxima.
- [ ] Fundo neutro (sem a cor do par) para reforçar o estado.
- [ ] Palavras-chave e significado de pares bloqueados não chegam ao cliente pela API (nem por leitura direta da tabela, nem pela RPC).

## Testes

- [ ] **Automatizado:** teste de componente: com o par bloqueado, não renderiza etiquetas nem significado; mostra o aviso, o cadeado e o rótulo acessível.
- [ ] **Automatizado (pgTAP):** usuário sem desbloqueio não recebe `meaning`/`keywords` do par.
- [ ] **Manual:** abrir um par bloqueado e um desbloqueado no celular e comparar; inspecionar a resposta da rede para confirmar o que é enviado.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Abordagem alterada com aprovação do usuário: significado escondido no servidor (permissão por coluna + RPC `af1_get_sneaker_detail`), em vez de opcional.
