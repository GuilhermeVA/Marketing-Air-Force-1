# Como editar o catálogo de tênis

O app lê o catálogo direto do Supabase. Ao alterar algo no painel, a mudança aparece no app no próximo carregamento da página, **sem novo deploy**.

O catálogo atual é **conteúdo de exemplo**: 6 pares com textos e ilustrações provisórios. Troque tudo quando o grupo fechar as cores.

## Onde editar

1. Entre em [supabase.com/dashboard](https://supabase.com/dashboard) e abra o projeto.
2. No menu lateral, vá em **Table Editor**.
3. Use as tabelas:
   - `af1_sneakers`: os pares (um por linha).
   - `af1_sneaker_images`: as imagens do carrossel de cada par.

## Campos de `af1_sneakers`

| Campo | O que é | Regras |
|-------|---------|--------|
| `slug` | Identificador na URL (`/tenis/dourado`) | Minúsculas, números e hífens. Evite mudar depois de divulgar links. |
| `name` | Nome exibido (ex.: "Air Force 1 Dourado") | Obrigatório |
| `color_name` | Nome da cor (ex.: "Dourado") | Obrigatório |
| `color_hex` | Cor de destaque da tela | Formato `#rrggbb`, ex.: `#c9a227` |
| `keywords` | Palavras-chave do que a cor simboliza | Lista curta (2 a 3), ex.: `{Riqueza,Prosperidade}` |
| `meaning` | Texto que explica a relação entre as palavras e o tênis | 2 a 3 frases |
| `rarity` | Raridade | `comum`, `intermediaria` ou `rara` |
| `draw_weight` | Peso no sorteio da raspadinha: quanto maior, mais comum | Número inteiro maior que 0. Ex.: comuns 30, intermediárias 15, rara 5 |
| `sort_order` | Ordem no closet (menor primeiro) | Número inteiro |
| `active` | Se o par aparece no app e entra no sorteio | Desmarque para esconder um par sem apagá-lo |

**Chance de cada par no sorteio:** é o `draw_weight` dele dividido pela soma dos pesos dos pares ainda bloqueados. Com os pesos de exemplo (30, 30, 25, 15, 15, 5 = 120), o Dourado sai em cerca de 4% dos sorteios iniciais.

## Imagens

Cada par deve ter de 3 a 5 imagens em `af1_sneaker_images`:

| Campo | O que é |
|-------|---------|
| `sneaker_id` | O par a que a imagem pertence (escolha na lista) |
| `url` | Endereço da imagem |
| `alt` | Descrição da imagem para leitores de tela. **Obrigatório.** Ex.: "Air Force 1 Dourado, vista lateral" |
| `position` | Ordem no carrossel (1 = primeira). Não pode repetir no mesmo par |

Para usar imagens próprias:

1. No menu lateral, vá em **Storage** e abra o bucket `af1-sneakers`.
2. Envie a imagem. Use **WebP** ou **AVIF**, com até 2 MB (o ideal é menos de 200 KB), largura de 1200 a 1600 px e uma proporção igual para todas.
3. Clique na imagem enviada, depois em **Get URL**, e copie a URL pública.
4. Cole essa URL no campo `url` da linha correspondente em `af1_sneaker_images`.

Use renders ou ilustrações próprias. Evite fotos oficiais da marca, porque a campanha é acadêmica e simulada.

## Cuidados

- Apagar um par apaga também as imagens dele. Para esconder um par, prefira desmarcar `active`.
- O app não tem tela de administração: todas as edições são feitas pelo painel.
- O arquivo `supabase/seed.sql` serve só para popular um banco novo. Ele **não** sobrescreve edições feitas no painel.
