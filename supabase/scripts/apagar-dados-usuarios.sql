-- =============================================================================
-- Limpeza de dados de usuários (LGPD) — Código de Cor
-- NÃO roda automaticamente. Cole no SQL Editor do painel do Supabase e execute
-- APENAS a seção desejada. Apagar um usuário em auth.users apaga em cascata o
-- perfil, as raspadinhas, os desbloqueios e o cupom dele (tabelas af1_*).
-- O catálogo (af1_sneakers, imagens) e as configurações não são afetados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A) Só as contas de teste criadas durante o desenvolvimento.
--    Confira a lista antes (primeira consulta) e depois rode o delete.
-- -----------------------------------------------------------------------------
select id, email, created_at
from auth.users
where email like 'teste-%@example.com' or email like 'e2e-%@example.com'
order by created_at;

-- delete from auth.users
-- where email like 'teste-%@example.com' or email like 'e2e-%@example.com';

-- -----------------------------------------------------------------------------
-- B) Fim da disciplina: apaga TODOS os usuários (cadastrados e anônimos) e,
--    com eles, todos os dados de clientes. Irreversível.
--    Alternativa ainda mais simples: excluir o projeto inteiro no painel.
-- -----------------------------------------------------------------------------
-- select count(*) as usuarios, count(*) filter (where is_anonymous) as anonimos from auth.users;
-- delete from auth.users;

-- Conferência depois da limpeza (tudo deve dar 0 no caso B):
-- select
--   (select count(*) from public.af1_profiles)  as perfis,
--   (select count(*) from public.af1_scratches) as raspadinhas,
--   (select count(*) from public.af1_unlocks)   as desbloqueios,
--   (select count(*) from public.af1_coupons)   as cupons;
