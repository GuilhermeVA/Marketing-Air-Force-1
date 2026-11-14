# PBI-001: Setup do app React e deploy na Vercel

| Campo                  | Valor                               |
| ---------------------- | ----------------------------------- |
| **Feature**            | [01-fundacao-do-projeto](README.md) |
| **Data de criação**    | 2026-11-14                          |
| **Última atualização** | 2026-11-14                          |
| **Status**             | Em andamento                        |
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

- [ ] O projeto roda localmente com `npm run dev` e compila sem erros com `npm run build`.
- [ ] TypeScript em modo `strict`, ESLint e Prettier configurados; `npm run lint` passa.
- [ ] Tailwind CSS funcionando (uma classe utilitária aplicada aparece no navegador).
- [ ] React Router com as rotas `/`, `/cupom`, `/closet`, `/tenis/:slug` e `/privacidade`, cada uma com um placeholder, e uma página 404.
- [ ] `vercel.json` com rewrite de SPA: acessar diretamente `/closet` na URL publicada não dá 404.
- [ ] Deploy automático na Vercel a cada push na branch principal, com URL pública HTTPS.
- [ ] `.env.example` documenta as variáveis de ambiente esperadas (sem valores reais) e `.env*` está no `.gitignore`.
- [ ] `README.md` na raiz explica como instalar, rodar e publicar.

## Testes

- [ ] **Automatizado:** Vitest + React Testing Library configurados, com um teste de fumaça que renderiza o app e verifica que a rota `/` carrega.
- [ ] **Manual:** abrir a URL da Vercel no celular e navegar pelas 5 rotas digitando-as direto na barra de endereço.
- [ ] **Manual:** fazer um push com uma mudança visível e confirmar que a URL publicada é atualizada.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Início da implementação.
