# PBI-006: Cadastro, login e consentimento LGPD

| Campo                  | Valor                        |
| ---------------------- | ---------------------------- |
| **Feature**            | [03-autenticacao](README.md) |
| **Data de criação**    | 2026-11-14                   |
| **Última atualização** | 2026-11-14 |
| **Status**             | Concluída |
| **Prioridade**         | Alta                         |
| **Depende de**         | PBI-005, PBI-003             |

## Descrição

Como cliente que acabou de revelar um prêmio, quero criar minha conta ou entrar de forma rápida e entendendo como meus dados serão usados, para guardar o tênis no meu closet (RF05, RF06, RF10).

## Contexto

- **Método de login (decisão do usuário em 2026-11-14): e-mail e senha, sem confirmação de e-mail.** O envio padrão do Supabase só entrega para membros da equipe do projeto e tem limite de poucos e-mails por hora, o que inviabilizaria o link mágico no piloto. Com a confirmação desligada ("Confirm email" off), o cadastro é instantâneo e não depende de e-mail. Contrapartida aceita: o e-mail não é verificado e não há recuperação de senha por e-mail.
- O cadastro converte a sessão anônima em permanente mantendo o mesmo `user.id` (o prêmio reservado acompanha o cliente), com `updateUser({ email, password })`.
- Cliente que **já tem conta** e está num navegador novo faz login normal; nesse caso a sessão anônima atual é descartada e a reserva dela não é transferida (limitação aceita; a raspadinha pendente do anônimo fica sem resgate).
- LGPD: coletar o mínimo (e-mail e apelido), consentimento explícito **antes** de coletar qualquer dado, nenhum dado sensível, apagar os dados ao fim da disciplina.
- Configuração no painel do Supabase: desligar "Confirm email" e definir a Site URL como a URL da Vercel.
- O formulário fica na rota `/entrar` (`?modo=cadastro|login&voltar=<rota>`), chamada pela tela de revelação (PBI-011), e volta para a rota de origem ao concluir. Não há saída do app.

## Critérios de aceitação

- [x] Formulário de cadastro com apelido, e-mail e senha (mínimo de 8 caracteres), e checkbox de consentimento (não marcado por padrão) com link para `/privacidade`; o envio fica bloqueado sem o consentimento.
- [x] Página `/privacidade` com o termo: quais dados são coletados, finalidade acadêmica, campanha simulada e prazo de exclusão.
- [x] Usuário anônimo que se cadastra mantém o mesmo `user.id`, sem etapa de confirmação por e-mail.
- [x] Opção "Já tenho conta" faz login com e-mail e senha.
- [x] Tabela `af1_profiles` (`id` = `auth.users.id`, `nickname`, `consent_at`, `created_at`) com RLS: cada usuário lê e edita só o próprio perfil; `consent_at` gravado no cadastro.
- [x] Depois do cadastro ou login, o usuário volta à rota de onde veio (parâmetro `voltar`, aceitando só caminhos internos).
- [x] Ação de sair (logout) disponível no closet.
- [x] Mensagens de erro claras (e-mail inválido, senha curta, e-mail já cadastrado, e-mail ou senha incorretos, falha de rede).

## Testes

- [x] **Automatizado:** testes do formulário (botão desabilitado sem consentimento, validação de e-mail, chamada correta ao método de conversão para usuário anônimo).
- [x] **Automatizado:** teste SQL de RLS de `af1_profiles` (usuário A não lê o perfil do usuário B).
- [ ] **Manual:** fluxo completo no celular: abrir anônimo → cadastrar → confirmar que o id do usuário em Authentication → Users é o mesmo do anônimo e que ele deixou de ser anônimo.
- [x] **Manual:** login de conta existente em outro navegador.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
- 2026-11-14 — Abordagem alterada com aprovação do usuário: login por e-mail e senha, sem confirmação de e-mail, no lugar do link mágico (o envio padrão do Supabase não entrega para usuários de fora da equipe). Critérios de confirmação e redirect por e-mail substituídos pelo retorno via parâmetro `voltar`.
- 2026-11-14 — Início da implementação.
- 2026-11-14 — Implementado: migration `af1_profiles` (apelido de 1 a 40 caracteres e `consent_at`; RLS: cada conta lê, cria e altera só o próprio perfil, sessão anônima não cria perfil, `consent_at` não pode ser alterado, sem exclusão pelo cliente), aplicada no banco remoto. `createAuthApi` com `signUp` (converte a sessão anônima via `updateUser({ email, password })`, renova o token e grava o perfil), `signIn`, `signOut`, validação e tradução de erros. Rota `/entrar` (`modo=cadastro|login`, `voltar` aceitando só caminhos internos), componente `TextField` no design system, termo em `/privacidade` e botão "Sair" no closet.
  - Arquivos: `supabase/migrations/20261114220000_af1_profiles.sql`, `supabase/tests/database/af1_profiles.test.sql`, `src/features/auth/{api.ts,api.test.ts,AuthForm.tsx,AuthForm.test.tsx}`, `src/pages/{AuthPage,PrivacyPage,ClosetPage}.tsx`, `src/ui/TextField.tsx`, `src/routes.tsx`, `src/lib/database.types.ts`, `README.md`
  - Testes: Vitest 57/57 (23 novos: validação, conversão anônima, perfil, erros, `safeReturnPath` e formulário); pgTAP 11/11 nos perfis; navegador real (Playwright, 360 px) contra o Supabase local: botão bloqueado sem consentimento, cadastro manteve o mesmo id e deixou de ser anônimo, perfil gravado com consentimento, e-mail repetido e senha errada com mensagens claras, login em outro navegador com o mesmo id, "Sair" gerou nova sessão anônima, `voltar` externo ignorado, 0 erros de página.
  - Observações: depois de `updateUser` é preciso renovar o token (`refreshSession`) para o banco enxergar `is_anonymous=false`. Login de conta existente descarta a sessão anônima do navegador (limitação já prevista). Configurações de Auth não foram aplicadas com `supabase config push` porque o diff incluía mudanças indesejadas (pool, MFA, storage, Site URL local).
  - Pendente: no painel do Supabase, desligar "Confirm email", mínimo de senha 8 e Site URL da Vercel (ver README); depois, fazer o push e o teste manual no celular em produção.
- 2026-11-14 — Concluída: configurações do painel aplicadas pelo usuário (confirmação de e-mail desligada, Site URL). Em produção (Playwright): cadastro manteve o id da sessão anônima e deixou de ser anônimo; login em outro navegador com o mesmo id; 0 erros. Conta de teste criada: `teste-e2e-1794694258084@example.com`.
  - Observação: o mínimo de 8 caracteres **não está ativo no servidor** (senha de 7 foi aceita via API, criando `teste-senha-curta@example.com` e `teste-senha-curta2@example.com`); o formulário do app já exige 8. Ajustar "Minimum password length" no painel e apagar as 3 contas de teste.
  - Pendente: teste manual num celular real.
