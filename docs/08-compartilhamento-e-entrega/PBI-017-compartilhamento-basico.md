# PBI-017: Compartilhamento básico e Open Graph

| Campo                  | Valor                                      |
| ---------------------- | ------------------------------------------ |
| **Feature**            | [08-compartilhamento-e-entrega](README.md) |
| **Data de criação**    | 2026-11-14                                 |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
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

- [x] Botão "Compartilhar" no closet e na tela do tênis; no celular abre o menu nativo com título, texto curto (tom de voz da campanha) e URL.
- [x] Sem Web Share API: copia o link e confirma "Link copiado".
- [x] Cancelar o menu nativo não mostra erro.
- [x] `index.html` com `og:title`, `og:description`, `og:image` (URL absoluta), `og:url`, `og:type`, `twitter:card=summary_large_image`, `theme-color` e favicon.
- [x] Imagem OG 1200×630 em `public/`, com menos de 300 KB.

## Testes

- [x] **Automatizado:** teste do helper de compartilhamento: usa `navigator.share` quando existe; cai no clipboard quando não existe; ignora `AbortError`.
- [ ] **Manual:** compartilhar pelo WhatsApp no celular e conferir a prévia; validar no LinkedIn Post Inspector.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: `shareCampaign` (menu nativo com Web Share API; sem ela, copia o link; cancelar não é erro) e `ShareButton` no closet e na tela do tênis desbloqueado (no espaço reservado da PBI-015), cada um com um texto curto próprio. O link compartilhado é `/` com `utm_source=share&utm_medium=social&utm_campaign=codigo-de-cor`. Metatags `description`, Open Graph (tipo, locale, site, título, descrição, URL, imagem absoluta com dimensões e texto alternativo) e Twitter `summary_large_image`. Imagem de prévia própria 1200×630 (50 kB) e favicon da campanha no lugar do logo do Vite.
  - Arquivos: `src/features/share/{share.ts,ShareButton.tsx,share.test.ts}`, `src/features/closet/ClosetView.tsx`, `src/pages/SneakerPage.tsx`, `index.html`, `public/{og-image.png,favicon.svg}`
  - Testes: Vitest 5 novos (104/104); em produção: metatags presentes no HTML de qualquer rota, `og-image.png` responde 200 (image/png, 50 kB) e o favicon 200; no Chromium sem Web Share API o botão copia o link com UTM e mostra "Link copiado"; com Web Share API simulada, o menu recebe título, texto e URL e o cancelamento não mostra erro; 0 erros na página.
  - Observações: a imagem de prévia foi gerada a partir da ilustração placeholder do Dourado; trocar quando houver a arte final.
  - Pendente: conferir a prévia ao colar o link no WhatsApp e no LinkedIn Post Inspector.
