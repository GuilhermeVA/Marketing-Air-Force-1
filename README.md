# Código de Cor — Experiência Phygital Air Force 1

Projeto acadêmico de Marketing Digital: uma raspadinha digital que revela um Air Force 1 colorido, um closet para colecionar os pares e um cupom para usar na loja. Campanha simulada, sem vínculo oficial com a Nike.

- Backlog (Features e PBIs): [docs/](docs/README.md)
- Stack: React + Vite + TypeScript, Tailwind CSS, React Router, Supabase, Vercel

## Requisitos

- Node.js 20 ou superior (testado com Node 24)
- npm

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a chave publishable do Supabase
npm run dev                  # http://localhost:5173
```

## Scripts

| Comando                           | O que faz                                        |
| --------------------------------- | ------------------------------------------------ |
| `npm run dev`                     | Servidor de desenvolvimento                      |
| `npm run build`                   | Checagem de tipos + build de produção em `dist/` |
| `npm run preview`                 | Serve o build localmente                         |
| `npm run lint`                    | Lint com oxlint                                  |
| `npm run format` / `format:check` | Formata / confere a formatação com Prettier      |
| `npm test`                        | Testes (Vitest + Testing Library)                |

## Publicação (Vercel)

O deploy é automático: cada push na branch `main` publica uma nova versão na Vercel, que está conectada ao repositório do GitHub.

1. Na Vercel, _Add New → Project_ e importe este repositório (o preset **Vite** é detectado sozinho).
2. Em _Settings → Environment Variables_, cadastre as mesmas variáveis do `.env.example`.
3. O `vercel.json` reescreve todas as rotas para `index.html`, então links diretos como `/closet` funcionam.
