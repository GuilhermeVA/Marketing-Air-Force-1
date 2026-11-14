# Feature: Raspadinha

**Criada em:** 2026-11-14

## Objetivo

Entregar a porta de entrada da campanha: o link abre direto na raspadinha digital, o servidor controla a disponibilidade e sorteia o par entre os ainda bloqueados, e o cliente raspa com o dedo (ou toca em "Revelar") para descobrir o tênis. O resultado fica reservado à sessão e nunca é decidido no celular.

## PBIs

| ID                                                  | Título                                | Status  | Depende de       |
| --------------------------------------------------- | ------------------------------------- | ------- | ---------------- |
| [PBI-007](PBI-007-regras-de-sorteio-no-servidor.md) | Disponibilidade e sorteio no servidor | Concluída | PBI-004, PBI-005 |
| [PBI-008](PBI-008-tela-de-entrada.md)               | Tela de entrada e disponibilidade     | Em andamento | PBI-007, PBI-003 |
| [PBI-009](PBI-009-mecanica-de-raspar.md)            | Mecânica de raspar e revelação        | A fazer | PBI-008          |
