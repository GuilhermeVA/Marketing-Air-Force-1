# PBI-016: Estado bloqueado da tela do tênis

| Campo                  | Valor                         |
| ---------------------- | ----------------------------- |
| **Feature**            | [07-tela-do-tenis](README.md) |
| **Data de criação**    | 2026-11-14                    |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
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

- [x] Par bloqueado em `/tenis/:slug` mostra a primeira imagem em tons de cinza com cadeado de traço fino centralizado.
- [x] Etiquetas e texto de significado substituídos pelo aviso "Desbloqueie esse tênis para ver o que ele simboliza".
- [x] Ícone de cadeado + texto "Bloqueado" visíveis e anunciados por leitores de tela.
- [x] Chamada para a ação: botão para a raspadinha quando houver uma disponível, ou o horário da próxima.
- [x] Fundo neutro (sem a cor do par) para reforçar o estado.
- [x] Palavras-chave e significado de pares bloqueados não chegam ao cliente pela API (nem por leitura direta da tabela, nem pela RPC).

## Testes

- [x] **Automatizado:** teste de componente: com o par bloqueado, não renderiza etiquetas nem significado; mostra o aviso, o cadeado e o rótulo acessível.
- [x] **Automatizado (pgTAP):** usuário sem desbloqueio não recebe `meaning`/`keywords` do par.
- [x] **Manual:** abrir um par bloqueado e um desbloqueado no celular e comparar; inspecionar a resposta da rede para confirmar o que é enviado.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Abordagem alterada com aprovação do usuário: significado escondido no servidor (permissão por coluna + RPC `af1_get_sneaker_detail`), em vez de opcional.
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: estado bloqueado da tela do tênis (só a primeira imagem, em cinza, com cadeado de traço fino sobre fundo claro; "Bloqueado" com ícone no cabeçalho; aviso "Desbloqueie esse tênis para ver o que ele simboliza."; botão "Ir para a raspadinha" quando há uma disponível ou o horário da próxima; fundo neutro; sem favorito nem carrossel). No servidor: o cliente perdeu a leitura direta de `keywords`, `meaning` e `draw_weight` de `af1_sneakers` (permissão por coluna), e a RPC de detalhe devolve esses campos nulos para pares bloqueados; a API do catálogo deixou de pedir essas colunas.
  - Arquivos: os da PBI-015, mais `src/features/catalog/{api.ts,api.test.ts}` e `src/features/closet/closet.test.tsx`
  - Testes: pgTAP (leitura direta de `meaning` e `keywords` negada, colunas públicas legíveis, bloqueado sem significado, desbloqueado com significado); Vitest (aviso, cadeado e rótulo, sem etiquetas, sem favorito, sem carrossel, chamada para a raspadinha); navegador real em produção (Chromium e WebKit): a resposta da API para o par bloqueado traz `meaning` e `keywords` nulos e nenhuma outra resposta contém o texto; leitura direta de `meaning` pela API REST responde 42501.
  - Observações: decisão do carrossel bloqueado mantida no padrão (só a primeira imagem). O `draw_weight` também deixou de ser público, já que o cliente não precisa dele.
