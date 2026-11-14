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

## Banco de dados (Supabase)

O schema fica versionado em `supabase/migrations/` e é aplicado com a Supabase CLI, instalada como dependência do projeto (use `npx supabase ...`).

**Convenção:** todo objeto da aplicação usa o prefixo `af1_` (tabelas, funções, views, policies) e os buckets do Storage usam `af1-`.

Configuração inicial (uma vez por máquina):

```bash
npx supabase login                                     # abre o navegador para autenticar
npx supabase link --project-ref lotkxzqrloyqeyaooabp   # pede a senha do banco
```

Uso no dia a dia:

| Comando                             | O que faz                                                   |
| ----------------------------------- | ----------------------------------------------------------- |
| `npx supabase migration new <nome>` | Cria um arquivo de migration vazio                          |
| `npm run db:push`                   | Aplica as migrations pendentes no projeto remoto            |
| `npm run db:types`                  | Regera `src/lib/database.types.ts` a partir do banco remoto |

O cliente do front fica em `src/lib/supabase.ts` e usa apenas a URL e a chave **publishable** (públicas). A `service_role`/secret key nunca vai para o front nem para o repositório.

> **Atenção, plano gratuito:** o Supabase pausa projetos gratuitos após 1 semana sem uso. Use o projeto com regularidade e confira no painel, na véspera de apresentações, se ele está ativo (um projeto pausado pode ser retomado em _Project Settings_).

## Autenticação (Supabase Auth)

O visitante entra numa **sessão anônima** automaticamente e raspa sem cadastro. No cadastro (e-mail e senha), essa sessão vira uma conta com o mesmo id, levando o prêmio junto. Não há confirmação por e-mail.

Configuração obrigatória no painel do Supabase (o `supabase/config.toml` já reflete isso no ambiente local):

| Onde                                                                     | O que                                      |
| ------------------------------------------------------------------------ | ------------------------------------------ |
| _Authentication → Sign In / Providers → Allow anonymous sign-ins_        | Ligado                                     |
| _Authentication → Sign In / Providers → Email → Confirm email_           | Desligado                                  |
| _Authentication → Sign In / Providers → Email → Minimum password length_ | 8                                          |
| _Authentication → URL Configuration → Site URL_                          | `https://marketing-air-force-1.vercel.app` |

> Não use `supabase config push` neste projeto sem revisar `npx supabase config diff`: o `config.toml` local também declara valores de pool, MFA e storage diferentes do remoto.

Para testar localmente contra o Supabase local (Docker):

```bash
npx supabase start
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key exibida pelo start> npm run dev
```
