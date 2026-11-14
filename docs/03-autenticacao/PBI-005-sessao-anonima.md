# PBI-005: Sessão anônima automática

| Campo                  | Valor                        |
| ---------------------- | ---------------------------- |
| **Feature**            | [03-autenticacao](README.md) |
| **Data de criação**    | 2026-11-14                   |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Alta                         |
| **Depende de**         | PBI-002                      |

## Descrição

Como visitante que abriu o link, quero raspar sem precisar criar conta, para não ter atrito antes de ver o prêmio (RF01, RF03).

Ao abrir o app sem sessão, criar uma sessão anônima do Supabase Auth; ao reabrir no mesmo navegador, reutilizar a mesma sessão.

## Contexto

- O PRD propõe o login anônimo do Supabase (`supabase.auth.signInAnonymously()`): a raspadinha roda numa sessão temporária e, no cadastro, a sessão vira conta permanente com o mesmo `id` (PBI-006).
- A sessão fica persistida no `localStorage` pelo próprio supabase-js. Se o cliente limpar os dados do navegador, a sessão anônima se perde (aceito pelo PRD).
- O login anônimo precisa ser habilitado em Authentication → Providers no painel.
- Captcha e limite de sessões anônimas foram deixados fora do MVP (menor relevância); registrar como evolução.

## Critérios de aceitação

- [x] Login anônimo habilitado no projeto Supabase (documentado no README).
- [x] `AuthProvider` (contexto React) que, na inicialização, recupera a sessão existente ou chama `signInAnonymously()` se não houver nenhuma.
- [x] O contexto expõe `user`, `isAnonymous`, `loading` e reage a `onAuthStateChange`.
- [x] As telas só fazem chamadas ao banco depois que a sessão está pronta (sem condição de corrida no primeiro carregamento).
- [x] Reabrir o link no mesmo navegador mantém o mesmo `user.id`.
- [x] Falha ao criar a sessão mostra mensagem amigável com opção de tentar de novo.

## Testes

- [x] **Automatizado:** testes do `AuthProvider` com Supabase mockado: cria sessão anônima quando não há sessão; reutiliza quando há; expõe `isAnonymous` corretamente; trata erro.
- [x] **Manual:** abrir o link numa aba anônima do navegador, conferir o usuário anônimo criado em Authentication → Users, recarregar e confirmar o mesmo id.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: `AuthProvider` (recupera a sessão persistida ou cria uma anônima; reage a `onAuthStateChange`; após "Sair" cria nova sessão anônima; `retry` em caso de erro), `ensureSession` com chamada única por cliente (o StrictMode não duplica usuários), `useAuth` e o layout `RequireSession` (carregamento discreto ou erro com "Tentar de novo") envolvendo `/`, `/cupom`, `/closet`, `/tenis/:slug` e `/entrar`. `/privacidade` e a 404 não dependem de sessão. Login anônimo ligado no `config.toml` local e documentado no README.
  - Arquivos: `src/features/auth/{AuthProvider.tsx,context.ts,session.ts,RequireSession.tsx,index.ts,AuthProvider.test.tsx}`, `src/test/fakeAuthClient.ts`, `src/main.tsx`, `src/routes.tsx`, `src/routes.test.tsx`, `supabase/config.toml`, `README.md`
  - Testes: 6 testes do provider e do `RequireSession` passando; navegador real contra o Supabase local: sessão anônima criada, mesmo id após recarregar, outro navegador com outro id, uma única sessão anônima por navegador mesmo em StrictMode, 0 erros.
  - Observações: o metadado `app = 'af1'` não foi usado (o projeto é exclusivo). O login anônimo está **desligado** no projeto remoto (`anonymous_provider_disabled`), então o código desta PBI foi commitado mas não enviado, para não quebrar o site publicado.
  - Pendente: ligar "Allow anonymous sign-ins" no painel; depois, push e teste manual em produção.
- 2026-11-14 — Concluída: login anônimo ligado no painel pelo usuário; código publicado. Em produção (Playwright), o visitante recebe sessão anônima sem erros.
