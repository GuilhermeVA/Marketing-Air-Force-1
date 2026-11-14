# Feature: Autenticação

**Criada em:** 2026-11-14

## Objetivo

Permitir que o cliente raspe sem login (sessão anônima) e só se cadastre quando o prêmio aparece, convertendo a sessão anônima em conta permanente com o mesmo id, para que o prêmio reservado acompanhe o cliente. Inclui o consentimento LGPD.

## PBIs

| ID                                                 | Título                               | Status  | Depende de       |
| -------------------------------------------------- | ------------------------------------ | ------- | ---------------- |
| [PBI-005](PBI-005-sessao-anonima.md)               | Sessão anônima automática            | Em andamento | PBI-002          |
| [PBI-006](PBI-006-cadastro-login-consentimento.md) | Cadastro, login e consentimento LGPD | Em andamento | PBI-005, PBI-003 |
