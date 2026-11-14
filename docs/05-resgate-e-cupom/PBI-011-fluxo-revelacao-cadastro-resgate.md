# PBI-011: Fluxo revelação → cadastro → resgate

| Campo                  | Valor                           |
| ---------------------- | ------------------------------- |
| **Feature**            | [05-resgate-e-cupom](README.md) |
| **Data de criação**    | 2026-11-14                      |
| **Última atualização** | 2026-11-14                      |
| **Status**             | A fazer                         |
| **Prioridade**         | Alta                            |
| **Depende de**         | PBI-009, PBI-010                |

## Descrição

Como cliente que acabou de revelar o tênis, quero ver o prêmio e ser convidado a cadastrar para guardá-lo, e, se eu fechar a aba, encontrar o mesmo prêmio ao reabrir o link (RF04, RF05, RF07).

## Contexto

- PRD: o cadastro só é pedido quando o prêmio aparece. Mostrar o prêmio **antes** de pedir o cadastro reduz o abandono (risco "Alto" no PRD).
- Retomada: o prêmio fica reservado à sessão; reabrir o link no mesmo navegador leva de volta a esta etapa (estado `revelada` da PBI-008).
- O fluxo de confirmação por e-mail (PBI-006) sai do app e volta por redirect: ao voltar já como conta permanente, o resgate deve acontecer automaticamente.
- **Inclui o RF07** (prioridade S): cliente já logado que raspa é resgatado direto, sem passos extras. Entrou no MVP porque as contas têm uma raspadinha por dia (RF02, M), então esse caminho acontece em todo uso recorrente e não tem alternativa.

- Nota de 2026-11-14: o login passou a ser por e-mail e senha, sem confirmação (PBI-006). Não há mais saída do app por e-mail: o cadastro acontece em `/entrar?modo=cadastro&voltar=/` e volta direto, já como conta permanente. Onde esta PBI fala em "confirmar o e-mail" ou "abrir o link do e-mail", leia "concluir o cadastro".

## Critérios de aceitação

- [ ] Depois da revelação, a tela mostra o par (nome, cor, imagem) e a chamada para cadastrar/entrar e guardar no closet.
- [ ] Usuário anônimo: o cadastro (PBI-006) abre a partir dessa tela; ao concluir e voltar ao app, `af1_redeem_scratch` é chamado automaticamente e o cliente segue para o cupom (primeiro resgate) ou para o closet.
- [ ] Usuário já logado (conta permanente): `af1_redeem_scratch` é chamado logo após a revelação, sem pedir nada (RF07).
- [ ] Fechar a aba depois de revelar e reabrir o link no mesmo navegador mostra o mesmo prêmio e o convite para cadastrar.
- [ ] Erros do resgate (rede, raspadinha inválida) aparecem com mensagem clara e opção de tentar de novo; o prêmio não se perde.
- [ ] Depois do resgate, o par aparece desbloqueado no closet.

## Testes

- [ ] **Automatizado:** testes de componente/fluxo com Supabase mockado para três casos: anônimo → cadastro → resgate; logado → resgate direto; reabertura com raspadinha `revelada`.
- [ ] **Manual:** no celular, aba anônima: raspar, fechar a aba, reabrir o link, cadastrar, confirmar o e-mail e conferir cupom e par desbloqueado.
- [ ] **Manual:** já logado, no dia seguinte (ou com o limite reduzido no banco de teste), raspar e ser levado direto ao closet com o novo par.

## Log de implementação

- 2026-11-14 — PBI criada.
- 2026-11-14 — Atualizada: tabelas, funções e bucket com o prefixo `af1_`/`af1-` (o projeto Supabase é compartilhado com outros projetos).
