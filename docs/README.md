# Backlog — MVP "Código de Cor"

**Criado em:** 2026-11-14
**Fonte:** [PRD — Experiência Phygital Nike Air Force 1](https://claude.ai/artifact/CSSTW4V5oHgKbpyuWBMpET)

Escopo: o ciclo completo do MVP (link → raspadinha → cadastro → resgate → cupom → closet → tela do tênis → compartilhamento básico), no celular.

## Ordem sugerida das Features

| #   | Feature                                                               | PBIs              |
| --- | --------------------------------------------------------------------- | ----------------- |
| 01  | [Fundação do projeto](01-fundacao-do-projeto/README.md)               | PBI-001 a PBI-003 |
| 02  | [Catálogo de tênis](02-catalogo-de-tenis/README.md)                   | PBI-004           |
| 03  | [Autenticação](03-autenticacao/README.md)                             | PBI-005 a PBI-006 |
| 04  | [Raspadinha](04-raspadinha/README.md)                                 | PBI-007 a PBI-009 |
| 05  | [Resgate e cupom](05-resgate-e-cupom/README.md)                       | PBI-010 a PBI-012 |
| 06  | [Closet](06-closet/README.md)                                         | PBI-013 a PBI-014 |
| 07  | [Tela do tênis](07-tela-do-tenis/README.md)                           | PBI-015 a PBI-016 |
| 08  | [Compartilhamento e entrega](08-compartilhamento-e-entrega/README.md) | PBI-017 a PBI-018 |

## Fora deste backlog (menor relevância, ficam para depois)

- RF17 Visualizador 3D/360° com troca de cor (S)
- RF18 Montagem de look com roupa social (S)
- RF19 Compartilhar closet/look **como imagem** (S). Só o compartilhamento básico por link entrou (PBI-017)
- RF20 Registro de eventos/métricas de uso, GA4, Clarity e UTM (S)
- RF21 Provador por câmera (C, stretch)
- RNF de resiliência: closet no localStorage com sincronização posterior
- Captcha e limite de criação de sessões anônimas (antifraude extra)
- Cartão físico com QR Code (evolução futura)

## Decisões pendentes do grupo que afetam as PBIs

1. Método de login (link mágico, e-mail e senha ou Google). Afeta a PBI-006.
2. Frequência das raspadinhas (sugestão: 1 por conta por dia). Afeta a PBI-007.
3. Catálogo final de cores, palavras-chave e textos (6 a 8 pares). Afeta a PBI-004; a PBI usa conteúdo de exemplo.
4. Carrossel do tênis bloqueado: todas as imagens em cinza ou só a primeira? Afeta a PBI-016.
5. Valor e validade do cupom (ex.: 15%). Afeta a PBI-010.
