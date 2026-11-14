# PBI-017: Compartilhamento básico e Open Graph

| Campo                  | Valor                                      |
| ---------------------- | ------------------------------------------ |
| **Feature**            | [08-compartilhamento-e-entrega](README.md) |
| **Data de criação**    | 2026-11-14                                 |
| **Última atualização** | 2026-11-14                                 |
| **Status**             | A fazer                                    |
| **Prioridade**         | Média                                      |
| **Depende de**         | PBI-013, PBI-015                           |

## Descrição

Como cliente, quero compartilhar a campanha com amigos e colegas num toque, com uma prévia elegante no WhatsApp e no LinkedIn, para que eles também raspem a deles.

## Contexto

- O escopo MVP do PRD cita "compartilhamento básico". O RF19 completo (closet/look como **imagem**, prioridade S) ficou fora deste backlog.
- Web Share API (`navigator.share`) no celular; fallback de copiar o link no desktop ou quando não houver suporte.
- Pontos de compartilhamento: closet e tela do tênis (espaço reservado na PBI-015). O link compartilhado é o da campanha (`/`), com `utm_source=share` para medição futura.
- Open Graph: como o app é uma SPA estática na Vercel, as metatags são fixas no `index.html` (os robôs do WhatsApp/LinkedIn não executam JS). Prévias por par ficam fora do MVP.
- A imagem OG (1200×630) deve seguir a identidade visual; usar uma arte própria, não imagem oficial da marca.

## Critérios de aceitação

- [ ] Botão "Compartilhar" no closet e na tela do tênis; no celular abre o menu nativo com título, texto curto (tom de voz da campanha) e URL.
- [ ] Sem Web Share API: copia o link e confirma "Link copiado".
- [ ] Cancelar o menu nativo não mostra erro.
- [ ] `index.html` com `og:title`, `og:description`, `og:image` (URL absoluta), `og:url`, `og:type`, `twitter:card=summary_large_image`, `theme-color` e favicon.
- [ ] Imagem OG 1200×630 em `public/`, com menos de 300 KB.

## Testes

- [ ] **Automatizado:** teste do helper de compartilhamento: usa `navigator.share` quando existe; cai no clipboard quando não existe; ignora `AbortError`.
- [ ] **Manual:** compartilhar pelo WhatsApp no celular e conferir a prévia; validar no LinkedIn Post Inspector.

## Log de implementação

- 2026-11-14 — PBI criada.
