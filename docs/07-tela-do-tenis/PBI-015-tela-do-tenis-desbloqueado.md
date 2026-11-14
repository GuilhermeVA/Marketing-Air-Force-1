# PBI-015: Tela do tênis desbloqueado com carrossel

| Campo                  | Valor                         |
| ---------------------- | ----------------------------- |
| **Feature**            | [07-tela-do-tenis](README.md) |
| **Data de criação**    | 2026-11-14                    |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
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

- [x] Rota `/tenis/:slug` carrega o par pelo slug; slug inexistente mostra "Par não encontrado" com volta ao closet.
- [x] Carrossel com deslize por toque, setas (botões de 44 px), teclado (←/→), indicadores e miniaturas clicáveis sincronizados.
- [x] Zoom ao toque/duplo toque na imagem ativa, com forma clara de sair do zoom.
- [x] Palavras-chave como etiquetas, com entrada em sequência (stagger), e texto de significado abaixo.
- [x] Fundo da tela no tom da cor do par.
- [x] Botão "Voltar ao closet" e espaço reservado para o botão de compartilhar.
- [x] Imagens além da primeira com lazy load; a primeira com prioridade (boa para o LCP).
- [x] Animações em 300 a 600 ms e versão estática em `prefers-reduced-motion`.

## Testes

- [x] **Automatizado:** teste de componente: renderiza nome, etiquetas e texto do par mockado; seta "próxima" e tecla → avançam o slide; clique em miniatura vai para o slide certo; slug inexistente mostra o estado de não encontrado.
- [x] **Manual:** no celular, deslizar, tocar nas miniaturas, dar zoom e voltar; no desktop, navegar só com o teclado.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: RPC `af1_get_sneaker_detail(slug)` (par, imagens, desbloqueio, favorito e, só se desbloqueado, palavras-chave e significado) e `SneakerDetailView`: link "‹ Closet", carrossel Embla carregado sob demanda (chunk próprio de 8,9 kB gzip) com deslize, setas de 44 px, teclado (←/→), indicadores, miniaturas sincronizadas e zoom (toque abre a imagem ampliada em tela cheia com pinça liberada; "Fechar" e Esc saem), primeira imagem com prioridade e as demais com lazy load; etiquetas com entrada em sequência, texto de significado, fundo no tom da cor do par e botão de favorito (nota da PBI-014). O botão de compartilhar tem um espaço reservado (`shareSlot`) para a PBI-017. `HeartIcon` movido para o design system.
  - Arquivos: `supabase/migrations/20261115020000_af1_detalhe_tenis.sql`, `supabase/tests/database/af1_detalhe_tenis.test.sql`, `src/features/sneaker/{api.ts,Carousel.tsx,SneakerDetailView.tsx,sneaker.test.tsx}`, `src/pages/SneakerPage.tsx`, `src/ui/{HeartIcon.tsx,index.ts}`, `src/features/closet/ClosetView.tsx`, `src/test/fakeAuthClient.ts`, `src/routes.test.tsx`, `src/lib/database.types.ts`
  - Testes: pgTAP 9/9 (suíte de banco 72/72); Vitest 99/99 (8 novos: dados, carrossel por setas, teclado e miniaturas, zoom com Esc, favoritar, não encontrado); navegador real em produção (Chromium e WebKit): etiquetas e significado exibidos, miniatura leva à imagem 3, zoom abre e fecha com Esc, 0 erros; no Supabase local, um arraste em ritmo realista levou à imagem 2, e a edição do significado no banco apareceu ao recarregar.
  - Observações: o arraste rápido do script automatizado não troca de imagem (o gesto sintético é rápido demais); com ritmo realista funciona. Contas de teste criadas em produção: `teste-e2e-tenis-1794697333416@example.com` e `teste-e2e-tenis-1794697347781@example.com`.
  - Pendente: deslizar e dar zoom com o dedo num celular real.
