# PBI-015: Tela do tênis desbloqueado com carrossel

| Campo                  | Valor                         |
| ---------------------- | ----------------------------- |
| **Feature**            | [07-tela-do-tenis](README.md) |
| **Data de criação**    | 2026-11-14                    |
| **Última atualização** | 2026-11-14 |
| **Status**             | Em andamento |
| **Prioridade**         | Alta                          |
| **Depende de**         | PBI-013                       |

## Descrição

Como cliente, quero abrir um par que desbloqueei e ver fotos bonitas dele, o que a cor simboliza e por quê, para ter um motivo pessoal para usá-lo (RF11, RF12, RF13).

## Contexto

- Tela 5 do PRD: "Detalhe do par".
  - No topo, carrossel animado estilo e-commerce: deslize, indicadores, miniaturas, transição suave e zoom ao toque.
  - Abaixo, palavras-chave em destaque como etiquetas, que surgem em sequência.
  - Em seguida, o texto de significado.
  - Ações: voltar ao closet e compartilhar (o compartilhar é da PBI-017; aqui fica o espaço/botão).
- Todo o conteúdo vem do banco (PBI-004); nada fixo no código.
- PRD sugere componente próprio com Motion ou biblioteca leve (ex.: Embla). Recomendação: **Embla** (leve, acessível, gestos prontos) + Motion para as transições; carregado sob demanda (lazy) para não pesar o JS inicial.
- O fundo assume o tom suave da cor do par (`--accent`, PBI-003).
- Acessibilidade: carrossel funciona por gestos, setas e teclado; imagens com `alt`.

- Nota de 2026-11-14: o teste manual da PBI-004 (editar um par no Table Editor e ver a mudança no app sem novo deploy) ficou para esta PBI, que é a primeira a exibir o significado. Use `catalogApi.getSneakerBySlug` de `src/features/catalog`.

- Nota de 2026-11-14 (PBI-014): incluir também o botão de favorito na tela do tênis desbloqueado, reaproveitando `createClosetApi(client).setFavorite` e o mesmo ícone de coração do closet (`src/features/closet/ClosetView.tsx`).

## Critérios de aceitação

- [ ] Rota `/tenis/:slug` carrega o par pelo slug; slug inexistente mostra "Par não encontrado" com volta ao closet.
- [ ] Carrossel com deslize por toque, setas (botões de 44 px), teclado (←/→), indicadores e miniaturas clicáveis sincronizados.
- [ ] Zoom ao toque/duplo toque na imagem ativa, com forma clara de sair do zoom.
- [ ] Palavras-chave como etiquetas, com entrada em sequência (stagger), e texto de significado abaixo.
- [ ] Fundo da tela no tom da cor do par.
- [ ] Botão "Voltar ao closet" e espaço reservado para o botão de compartilhar.
- [ ] Imagens além da primeira com lazy load; a primeira com prioridade (boa para o LCP).
- [ ] Animações em 300 a 600 ms e versão estática em `prefers-reduced-motion`.

## Testes

- [ ] **Automatizado:** teste de componente: renderiza nome, etiquetas e texto do par mockado; seta "próxima" e tecla → avançam o slide; clique em miniatura vai para o slide certo; slug inexistente mostra o estado de não encontrado.
- [ ] **Manual:** no celular, deslizar, tocar nas miniaturas, dar zoom e voltar; no desktop, navegar só com o teclado.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Início da implementação.
