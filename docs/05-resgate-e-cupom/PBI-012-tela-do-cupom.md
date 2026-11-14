# PBI-012: Tela do cupom

| Campo                  | Valor                           |
| ---------------------- | ------------------------------- |
| **Feature**            | [05-resgate-e-cupom](README.md) |
| **Data de criação**    | 2026-11-14                      |
| **Última atualização** | 2026-11-14                      |
| **Status**             | A fazer                         |
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

- [ ] Rota `/cupom` mostra código, desconto, validade (data formatada em pt-BR) e aviso de campanha simulada.
- [ ] Botão "Copiar código" copia para a área de transferência e confirma visualmente ("Copiado"), com fallback se a Clipboard API falhar.
- [ ] Botão "Salvar como imagem" gera um PNG legível do ticket (código, desconto, validade) e baixa ou abre o compartilhamento de arquivo do sistema.
- [ ] Usuário sem cupom que acessa `/cupom` vê mensagem e atalho para a raspadinha.
- [ ] Animação do ticket (300 a 600 ms) com versão estática em `prefers-reduced-motion`.
- [ ] Atalho para o closet e acesso ao cupom a partir do closet.

## Testes

- [ ] **Automatizado:** teste de componente: renderiza código e validade; "Copiar" chama `navigator.clipboard.writeText` com o código; estado sem cupom.
- [ ] **Manual:** em iOS e Android, copiar o código e colar em outro app; salvar a imagem e conferir que fica legível na galeria.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
