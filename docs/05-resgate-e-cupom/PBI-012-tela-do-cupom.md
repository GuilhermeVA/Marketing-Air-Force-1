# PBI-012: Tela do cupom

| Campo                  | Valor                           |
| ---------------------- | ------------------------------- |
| **Feature**            | [05-resgate-e-cupom](README.md) |
| **Data de criação**    | 2026-11-14                      |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Alta                            |
| **Depende de**         | PBI-011                         |

## Descrição

Como cliente que fez o primeiro resgate, quero ver meu cupom com código e validade, e poder copiá-lo ou salvá-lo como imagem, para usar na loja (RF09).

## Contexto

- Tela 3 do PRD: "Cupom". Mostra o desconto e o código; animação de ticket que se destaca com efeito de brilho (sóbrio, sem confete).
- Cupom fictício (campanha simulada). A tela deve deixar isso claro discretamente (ex.: "Campanha acadêmica, cupom simulado").
- O cupom continua acessível depois (rota `/cupom` e atalho no closet), lido de `af1_coupons` (PBI-010).
- "Salvar como imagem": gerar PNG no próprio navegador (ex.: desenhar o ticket num canvas ou usar `html-to-image`) e baixar ou abrir o menu de compartilhamento do sistema com o arquivo.

## Critérios de aceitação

- [x] Rota `/cupom` mostra código, desconto, validade (data formatada em pt-BR) e aviso de campanha simulada.
- [x] Botão "Copiar código" copia para a área de transferência e confirma visualmente ("Copiado"), com fallback se a Clipboard API falhar.
- [x] Botão "Salvar como imagem" gera um PNG legível do ticket (código, desconto, validade) e baixa ou abre o compartilhamento de arquivo do sistema.
- [x] Usuário sem cupom que acessa `/cupom` vê mensagem e atalho para a raspadinha.
- [x] Animação do ticket (300 a 600 ms) com versão estática em `prefers-reduced-motion`.
- [x] Atalho para o closet e acesso ao cupom a partir do closet.

## Testes

- [x] **Automatizado:** teste de componente: renderiza código e validade; "Copiar" chama `navigator.clipboard.writeText` com o código; estado sem cupom.
- [ ] **Manual:** em iOS e Android, copiar o código e colar em outro app; salvar a imagem e conferir que fica legível na galeria.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: `createCouponApi.getMyCoupon` (lê `af1_coupons`, filtrado pelo RLS), `CouponView` com ticket animado (entrada suave e brilho que atravessa uma vez; o Motion respeita o movimento reduzido), código selecionável, desconto, validade em pt-BR e estado "expirado", aviso de campanha simulada, "Copiar código" (Clipboard API com alternativa por `execCommand`), "Salvar como imagem" (ticket desenhado em canvas 1080×1350, compartilhado como arquivo no celular quando suportado, senão baixado), estado sem cupom e erro com nova tentativa. Link "Meu cupom" no closet para contas.
  - Arquivos: `src/features/coupon/{api.ts,CouponView.tsx,ticketImage.ts,coupon.test.tsx}`, `src/pages/{CouponPage,ClosetPage}.tsx`, `src/test/fakeAuthClient.ts`, `src/routes.test.tsx`
  - Testes: Vitest, 5 novos (dados do cupom e aviso, copiar, sem cupom, erro, expirado); total 81/81. Navegador real em produção (Chromium e WebKit): código, 10% e validade de 10 dias exibidos; copiar coloca o código na área de transferência; imagem PNG gerada e baixada, conferida visualmente.
  - Observações: a imagem é gerada com canvas próprio, sem a biblioteca `html-to-image` citada como opção.
  - Pendente: copiar e salvar a imagem num iPhone e num Android reais.
