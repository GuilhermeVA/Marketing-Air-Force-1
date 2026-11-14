# PBI-001: Setup do app React e deploy na Vercel

| Campo                  | Valor                               |
| ---------------------- | ----------------------------------- |
| **Feature**            | [01-fundacao-do-projeto](README.md) |
| **Data de criação**    | 2026-11-14                          |
| **Última atualização** | 2026-11-14 |
| **Status**             | Em andamento |
| **Prioridade**         | Alta                                |
| **Depende de**         | —                                   |

## Descrição

Como grupo, queremos um projeto React publicado num link público desde o primeiro dia, para desenvolver e testar no celular continuamente.

Criar o app com Vite + React + TypeScript, Tailwind CSS e React Router, com as rotas principais vazias, e configurar o deploy automático na Vercel a partir do GitHub.

## Contexto

- O PRD define a stack: React, Vite, TypeScript, Tailwind CSS, React Router, Motion; hospedagem na Vercel (plano Hobby, uso não comercial, sem recursos de equipe).
- O repositório ainda não existe (a pasta do projeto só tem `docs/` e `CLAUDE.md`).
- Rotas previstas no MVP: `/` (entrada/raspadinha), `/cupom`, `/closet`, `/tenis/:slug`, `/privacidade`.
- O app é uma SPA estática; o deploy na Vercel precisa de rewrite de todas as rotas para `index.html` (`vercel.json`).
- Pendente de decisão: quem do grupo é o dono da conta Vercel/GitHub.

## Critérios de aceitação

- [x] O projeto roda localmente com `npm run dev` e compila sem erros com `npm run build`.
- [x] TypeScript em modo `strict`, ESLint e Prettier configurados; `npm run lint` passa.
- [x] Tailwind CSS funcionando (uma classe utilitária aplicada aparece no navegador).
- [x] React Router com as rotas `/`, `/cupom`, `/closet`, `/tenis/:slug` e `/privacidade`, cada uma com um placeholder, e uma página 404.
- [ ] `vercel.json` com rewrite de SPA: acessar diretamente `/closet` na URL publicada não dá 404.
- [ ] Deploy automático na Vercel a cada push na branch principal, com URL pública HTTPS.
- [x] `.env.example` documenta as variáveis de ambiente esperadas (sem valores reais) e `.env*` está no `.gitignore`.
- [x] `README.md` na raiz explica como instalar, rodar e publicar.

## Testes

- [x] **Automatizado:** Vitest + React Testing Library configurados, com um teste de fumaça que renderiza o app e verifica que a rota `/` carrega.
- [ ] **Manual:** abrir a URL da Vercel no celular e navegar pelas 5 rotas digitando-as direto na barra de endereço.
- [ ] **Manual:** fazer um push com uma mudança visível e confirmar que a URL publicada é atualizada.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: app Vite 8 + React 19 + TypeScript 7 (strict), Tailwind CSS v4 (plugin do Vite), React Router 8 com as rotas placeholder e 404, `vercel.json` com rewrite de SPA, `.env.example`, README e primeiro push para o GitHub (`main`).
  - Arquivos: `package.json`, `vite.config.ts`, `tsconfig.*.json`, `index.html`, `src/main.tsx`, `src/routes.tsx`, `src/pages/*.tsx`, `src/routes.test.tsx`, `src/test/setup.ts`, `vercel.json`, `.env.example`, `.gitignore`, `.gitattributes`, `.prettierrc.json`, `.prettierignore`, `README.md`
  - Testes: `npm run build` ok; `npm run lint` ok (0 avisos); `npm test` 6/6 passando; `npm run format:check` ok; `npm run dev` respondeu 200 em `/closet`.
  - Observações: o template atual do Vite traz **oxlint** no lugar do ESLint; mantido (mais rápido, mesmo objetivo) junto com o Prettier. A variável da chave do Supabase foi nomeada `VITE_SUPABASE_PUBLISHABLE_KEY` (o Supabase agora usa chaves "publishable" no lugar da "anon"). `docs/` e `CLAUDE.md` ficaram fora do Prettier.
  - Pendente: importar o repositório na Vercel (ação do usuário) e então conferir o deploy automático, o rewrite em produção e os testes manuais no celular.
