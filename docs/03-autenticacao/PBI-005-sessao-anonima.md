# PBI-005: Sessão anônima automática

| Campo                  | Valor                        |
| ---------------------- | ---------------------------- |
| **Feature**            | [03-autenticacao](README.md) |
| **Data de criação**    | 2026-11-14                   |
| **Última atualização** | 2026-11-14                   |
| **Status**             | A fazer                      |
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

- [ ] Login anônimo habilitado no projeto Supabase (documentado no README).
- [ ] `AuthProvider` (contexto React) que, na inicialização, recupera a sessão existente ou chama `signInAnonymously()` se não houver nenhuma.
- [ ] O contexto expõe `user`, `isAnonymous`, `loading` e reage a `onAuthStateChange`.
- [ ] As telas só fazem chamadas ao banco depois que a sessão está pronta (sem condição de corrida no primeiro carregamento).
- [ ] Reabrir o link no mesmo navegador mantém o mesmo `user.id`.
- [ ] Falha ao criar a sessão mostra mensagem amigável com opção de tentar de novo.

## Testes

- [ ] **Automatizado:** testes do `AuthProvider` com Supabase mockado: cria sessão anônima quando não há sessão; reutiliza quando há; expõe `isAnonymous` corretamente; trata erro.
- [ ] **Manual:** abrir o link numa aba anônima do navegador, conferir o usuário anônimo criado em Authentication → Users, recarregar e confirmar o mesmo id.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
