# PBI-003: Design system base mobile-first

| Campo                  | Valor                               |
| ---------------------- | ----------------------------------- |
| **Feature**            | [01-fundacao-do-projeto](README.md) |
| **Data de criação**    | 2026-11-14                          |
| **Última atualização** | 2026-11-14                          |
| **Status**             | A fazer                             |
| **Prioridade**         | Alta                                |
| **Depende de**         | PBI-001                             |

## Descrição

Como cliente executivo, quero uma interface sóbria, elegante e limpa, em que toda a cor venha do tênis, para sentir que a experiência combina com o meu estilo.

Criar os tokens visuais, as fontes, o layout base e os componentes primitivos usados por todas as telas.

## Contexto

- Direção criativa do PRD: luxo discreto, muito espaço em branco, grade rigorosa, linhas finas, cantos discretos, sem ícones decorativos.
- Paleta: base neutra (off-white quente, grafite, preto) e uma única cor de destaque por vez, a do tênis ativo. O fundo assume um tom suave dessa cor, então o destaque precisa ser uma variável CSS dinâmica (ex.: `--accent`).
- Tipografia: serifada nos títulos (Playfair Display ou Cormorant) e Inter no texto, via Google Fonts.
- Movimento: 300 a 600 ms, curvas suaves, só `transform`/`opacity`, respeitando `prefers-reduced-motion`.
- Mobile first: a partir de 360 px, alvos de toque de pelo menos 44 px, uso com uma mão. Acessibilidade WCAG AA e foco visível.
- Pendente de decisão: o protótipo do Figma do grupo pode ajustar os valores. Os tokens devem ficar centralizados para facilitar a troca.

## Critérios de aceitação

- [ ] Tokens no tema do Tailwind/CSS: cores neutras, `--accent` dinâmico, tipografia, espaçamentos, raios e durações/curvas de animação.
- [ ] Fontes carregadas do Google Fonts com `display=swap` e `preconnect`.
- [ ] Componentes base: `Button` (primário/secundário, mínimo 44 px de altura, estado de foco visível), `Layout` de tela mobile (largura máxima, gutters) e `Spinner`/estado de carregamento discreto.
- [ ] Hook `useReducedMotion` (ou o do Motion) disponível e usado como padrão nas animações dos componentes base.
- [ ] Função utilitária para aplicar a cor do tênis ativo ao fundo (tom suave derivado de `--accent`).
- [ ] Contraste do texto sobre os fundos neutros atende WCAG AA.
- [ ] Layout sem rolagem horizontal em 360 px.

## Testes

- [ ] **Automatizado:** testes do `Button` (renderiza, dispara `onClick`, fica desabilitado com `disabled`).
- [ ] **Automatizado:** teste da função que gera o tom suave a partir de uma cor hex.
- [ ] **Manual:** página temporária de amostra (`/dev/ui`, só em desenvolvimento) conferida em 360 px e no celular, com o modo de movimento reduzido do sistema ligado e desligado.
- [ ] **Manual:** conferir o contraste com uma ferramenta (ex.: DevTools → Accessibility).

## Log de implementação

- 2026-11-14 — PBI criada.
