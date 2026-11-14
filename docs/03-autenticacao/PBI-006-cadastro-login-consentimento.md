# PBI-006: Cadastro, login e consentimento LGPD

| Campo                  | Valor                        |
| ---------------------- | ---------------------------- |
| **Feature**            | [03-autenticacao](README.md) |
| **Data de criação**    | 2026-11-14                   |
| **Última atualização** | 2026-11-14                   |
| **Status**             | A fazer                      |
| **Prioridade**         | Alta                         |
| **Depende de**         | PBI-005, PBI-003             |

## Descrição

Como cliente que acabou de revelar um prêmio, quero criar minha conta ou entrar de forma rápida e entendendo como meus dados serão usados, para guardar o tênis no meu closet (RF05, RF06, RF10).

## Contexto

- O cadastro converte a sessão anônima em permanente mantendo o mesmo `user.id` (o prêmio reservado acompanha o cliente). No supabase-js: `updateUser({ email })` para e-mail, que envia confirmação, ou `linkIdentity({ provider: 'google' })` para Google, que exige "manual linking" habilitado.
- Cliente que **já tem conta** e está num navegador novo faz login normal; nesse caso a sessão anônima atual é descartada e a reserva dela não é transferida (limitação aceita; a raspadinha pendente do anônimo fica sem resgate).
- LGPD: coletar o mínimo (e-mail e apelido), consentimento explícito **antes** de coletar qualquer dado, nenhum dado sensível, apagar os dados ao fim da disciplina.
- Configurar no Supabase a Site URL com a URL da Vercel e as Redirect URLs (local e Vercel), e passar `emailRedirectTo` explícito no envio.
- O envio de e-mails padrão do Supabase tem limite baixo por hora. O grupo aceitou esse limite por ser um projeto acadêmico com pouco volume; se os e-mails pararem de chegar no piloto, essa é a causa provável (solução: SMTP próprio gratuito).
- **Pendente de decisão:** método de login. Recomendação para o MVP: **e-mail com link mágico** (sem senha, sem configuração de OAuth). Google pode ser adicionado depois. Se o grupo escolher outro método, ajustar esta PBI antes de implementar.
- O app é chamado pela tela de revelação (PBI-011) como um painel/modal ou rota `/entrar`, com retorno ao fluxo depois da confirmação.

## Critérios de aceitação

- [ ] Formulário de cadastro com apelido e e-mail, e checkbox de consentimento (não marcado por padrão) com link para `/privacidade`; o envio fica bloqueado sem o consentimento.
- [ ] Página `/privacidade` com o termo: quais dados são coletados, finalidade acadêmica, campanha simulada e prazo de exclusão.
- [ ] Usuário anônimo que se cadastra mantém o mesmo `user.id` depois de confirmar o e-mail.
- [ ] Opção "Já tenho conta" faz login com o mesmo método.
- [ ] Tabela `af1_profiles` (`id` = `auth.users.id`, `nickname`, `consent_at`, `created_at`) com RLS: cada usuário lê e edita só o próprio perfil; `consent_at` gravado no cadastro.
- [ ] Depois da confirmação, o usuário volta ao app no ponto do fluxo em que estava (redirect configurado nas URLs permitidas do Supabase, incluindo a URL da Vercel).
- [ ] Ação de sair (logout) disponível no closet.
- [ ] Mensagens de erro claras (e-mail inválido, link expirado, falha de envio).

## Testes

- [ ] **Automatizado:** testes do formulário (botão desabilitado sem consentimento, validação de e-mail, chamada correta ao método de conversão para usuário anônimo).
- [ ] **Automatizado:** teste SQL de RLS de `af1_profiles` (usuário A não lê o perfil do usuário B).
- [ ] **Manual:** fluxo completo no celular: abrir anônimo → cadastrar → abrir o link do e-mail → confirmar que o id do usuário em Authentication → Users é o mesmo do anônimo.
- [ ] **Manual:** login de conta existente em outro navegador.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
- 2026-11-14 — Atualizada: o projeto Supabase passou a ser exclusivo desta aplicação; removidas as ressalvas de projeto compartilhado (prefixo `af1_` mantido).
