# Feature: Resgate e cupom

**Criada em:** 2026-11-14

## Objetivo

Transformar o prêmio revelado em resgate: o cliente se cadastra (ou já está logado), o servidor desbloqueia o par na conta dele e emite o cupom fictício no primeiro resgate. O cupom é o elo físico da campanha phygital (uso na loja).

## PBIs

| ID                                                     | Título                               | Status  | Depende de       |
| ------------------------------------------------------ | ------------------------------------ | ------- | ---------------- |
| [PBI-010](PBI-010-funcao-de-resgate.md)                | Função de resgate e emissão do cupom | Concluída | PBI-007, PBI-006 |
| [PBI-011](PBI-011-fluxo-revelacao-cadastro-resgate.md) | Fluxo revelação → cadastro → resgate | Concluída | PBI-009, PBI-010 |
| [PBI-012](PBI-012-tela-do-cupom.md)                    | Tela do cupom                        | Concluída | PBI-011          |
