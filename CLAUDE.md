# Marketing-AP2 — Experiência Phygital Air Force 1 ("Código de Cor")

Projeto acadêmico de Marketing Digital (campanha simulada, sem vínculo oficial com a Nike).
PRD de referência: https://claude.ai/artifact/CSSTW4V5oHgKbpyuWBMpET

Stack: React + Vite + TypeScript, Tailwind CSS, React Router, Motion, Supabase (Postgres, Auth, Storage), Vercel (Hobby). Custo zero.

## Infraestrutura

- Repositório: https://github.com/GuilhermeVA/Marketing-Air-Force-1
- Supabase: projeto `lotkxzqrloyqeyaooabp` (https://lotkxzqrloyqeyaooabp.supabase.co), região us-east-1. As chaves ficam em `.env.local` e nas variáveis de ambiente da Vercel, nunca no código.
- Vercel: https://marketing-air-force-1.vercel.app (deploy automático a cada push na `main`). Variáveis cadastradas manualmente, sem a integração Supabase do Marketplace.

## Convenções do banco

O projeto Supabase é exclusivo desta aplicação. Mesmo assim, para deixar claro o que pertence a ela:

- Todo objeto da aplicação usa o prefixo `af1_` (tabelas, funções/RPCs, views, policies, triggers, índices) e os buckets do Storage usam `af1-`. Sempre em minúsculas.

## Documentação de PBIs

Pasta de Features: docs
Cada Feature é uma subpasta com um `README.md`; cada PBI é um arquivo `PBI-NNN-slug.md` dentro da Feature.
