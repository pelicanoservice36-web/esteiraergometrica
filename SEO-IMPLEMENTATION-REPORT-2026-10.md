# SEO-IMPLEMENTATION-REPORT-2026-10

Implementação do Estágio 3 referente a `SEO-AUDIT-2026-10.md`. Escopo: só os 4 itens que o próprio relatório listou como "implementação recomendada imediatamente após aprovação" (seção 19, bloco 1). Os itens de P2/P3 (comparativos novos, páginas de marca, twitter tags, breadcrumb visual, revisão do hero) continuam `AGUARDANDO APROVAÇÃO` e não foram tocados.

## ALTERADO

- 25 páginas (reviews e guias) com `description` acima de 155 caracteres, reescritas para caber no limite, sem mudar nenhum dado.
- `src/pages/guias/esteira-para-corrida-ou-caminhada.astro`: título de 61 → 54 caracteres.
- `src/layouts/BaseLayout.astro`: adiciona `BreadcrumbList` (JSON-LD) a toda página exceto a home.
- `src/pages/guias/melhor-esteira-ergometrica-residencial.astro`: `title`/`h1`/`description`/`ogDescription`/`headline` passam a usar `TOTAL_MODELOS` em vez do número `19` solto.
- `src/pages/guias/esteira-por-orcamento.astro`: Speedo TR5, KHT GTS-6 e KHT GTS-7 (já citados em texto corrido) ganharam link real para a review de cada um; corrige "dezoito" → "dezenove" e completa a menção à KHT GTS-7 que faltava no parágrafo de disclosure.
- `src/pages/guias/kikos-e-boa-marca.astro`: corrige, na description, uma contagem desatualizada ("outros 16 do catálogo" → "outros do catálogo", já que o número certo hoje é dezenove).

## CRIADO

- `src/data/catalog.mjs`: fonte única da contagem do catálogo (`TOTAL_MODELOS = 19`, `TOTAL_MODELOS_EXTENSO = 'dezenove'`), com um comentário listando os 12 arquivos que ainda têm o número escrito à mão em texto corrido, como checklist para a próxima vez que o catálogo mudar de tamanho.

## NÃO ALTERADO

- As 18 páginas que o `SEO-AUDIT-2026-10.md` já marcava `STATUS: OK`.
- `src/data/affiliates.mjs`, `public/_redirects`, `scripts/check-affiliates.mjs`, `public/sitemap.xml`, `public/robots.txt`: nada tocado.
- `esteira-profissional-para-academia.astro`: avaliado para reforço de link à KHT GTS-7, mas não alterado (ver seção Pendências).
- Nenhuma nota editorial, preço ou ficha técnica mudou em nenhuma página.
- Os ~40 usos de "dezenove"/"19 modelos" em texto corrido nos outros 12 arquivos listados em `catalog.mjs`: continuam literais, de propósito (ver seção Pendências).

## CORREÇÕES

Duas contagens de catálogo desatualizadas, encontradas durante a implementação, fora do escopo original do item 3 porque usavam palavras diferentes das que a auditoria buscou:
- `guias/kikos-e-boa-marca.astro`: "16" → removido (agora "do catálogo", sem número desatualizado).
- `guias/esteira-por-orcamento.astro`: "dezoito" → "dezenove".

## INTERNAL LINKS

- `kht-gts7`: 6 → 7 páginas de origem distintas.
- `kht-gts6` e `speedo-tr5`: 8 → 9 páginas de origem distintas cada.
- Os 3 novos links partem de texto que já citava os produtos pelo nome; nenhuma frase foi inventada para caber um link.

## SCHEMA

- `BreadcrumbList` adicionado a 49 das 50 páginas (todas exceto a home). Dois níveis (Início → página atual), sem "Reviews"/"Guias" como nível intermediário porque essas rotas não existem como página navegável.
- Nenhum schema novo inventado: `Product`, `Review`, `AggregateRating`, `FAQPage` etc. permanecem como estavam.

## AI SEARCH

- As descriptions mais curtas tendem a aparecer completas em superfícies de busca e compartilhamento (Google, redes sociais, cards de assistentes de IA que usam meta tags), em vez de cortadas no meio da frase.
- O `BreadcrumbList` dá a cada página um sinal explícito de onde ela está na hierarquia do site, o que ajuda tanto rich results quanto sistemas que tentam entender a estrutura do conteúdo.

## TESTES

- `npm run build`: passou, 50 páginas, em cada uma das 4 rodadas de edição.
- `npm run check`: passou, 31 verificações, sem mudança no número de verificações.
- Extração programática de `title`/`description`/`h1`/`path` de todas as 50 páginas: 0 ausente, 0 duplicado, 0 description acima de 155, 0 title acima de 60 (a única pendência, `melhor-esteira-ergometrica-residencial.astro`, é falso positivo do meu próprio script de auditoria, que só reconhece `title="..."` literal e não viu o novo `title={...}` dinâmico; o HTML gerado foi conferido à mão e está correto).
- Varredura de links internos quebrados: 0 encontrados (as 3 ocorrências fora do conjunto de rotas continuam sendo arquivos estáticos em `BaseLayout.astro`, não páginas).
- `git status --short` confirmado limpo entre cada commit, nenhum arquivo fora do escopo de cada item foi tocado.

## Estágio 4 (aprovado pelo usuário: "faça 3 comparativos de produto, as 4 páginas de marca, as tags de Twitter explícitas, o breadcrumb visual")

### CRIADO

- `src/pages/guias/polimet-ep1600-ou-gallant-elite.astro`, `gallant-elite-ou-athletic-racer.astro`, `athletic-racer-ou-speedo-tr5.astro`: os 3 comparativos da seção 15 do `SEO-AUDIT-2026-10.md`, montados só com dado já publicado nas reviews e na metodologia, sem ficha nova.
- `src/pages/guias/gallant-e-boa-marca.astro`, `speedo-e-boa-marca.astro`, `podiumfit-e-boa-marca.astro`, `wct-fitness-e-boa-marca.astro`: as 4 páginas de marca da seção 16, no mesmo padrão de `athletic-e-boa-marca.astro`/`dream-fitness-e-boa-marca.astro` (baseadas só no que já verificamos nas reviews, sem pesquisa institucional nova).

### ALTERADO

- `src/layouts/BaseLayout.astro`: `twitter:title`/`twitter:description`/`twitter:image` explícitos (antes só caíam no fallback do Open Graph); breadcrumb visual (Início → página atual) em toda página exceto a home, reaproveitando o `BreadcrumbList` já existente.
- `src/styles.css`: nova classe `.breadcrumbs`, usando só variáveis de cor/fonte que já existiam.
- `src/pages/guias/melhores-marcas-de-esteira.astro`: 13 → 14 marcas na tabela; Gallant, WCT Fitness e PodiumFit (antes só texto) agora linkam para a página de marca própria; nova linha e seção da Speedo; removida a frase "ainda sem página própria" sobre a Gallant, que ficaria desatualizada.
- 6 reviews (as 3 Gallant, Speedo, PodiumFit, WCT) e 3 reviews adicionais (Polimet EP-1600, Athletic Racer, e as duas Gallant envolvidas nos comparativos) ganharam links de "Leia também" para as páginas de marca e os comparativos novos.
- `public/sitemap.xml`: as 7 URLs novas adicionadas.

### TESTES

- `npm run build`: passou em cada uma das 3 rodadas (57 páginas ao final, de 50).
- `npm run check`: passou, 31 verificações, sem mudança.
- Cruzamento sitemap × rotas: 55/55 (as 2 páginas com `noindex` próprio, `/404` e `/plano-30-dias`, continuam fora, de propósito).
- Varredura de título/description/H1 duplicado: 0 em todas as rodadas.
- Varredura de link interno quebrado: 0 em todas as rodadas (as 3 ocorrências de sempre continuam sendo assets estáticos em `BaseLayout.astro`).

## PENDÊNCIAS

1. **Revisão do hero em vídeo da home**: não foi pedida nesta rodada, continua em aberto.
2. **Link à KHT GTS-7 em `esteira-profissional-para-academia.astro`**: avaliado e descartado. A GTS-7 tem motor DC, não AC, e o guia é especificamente sobre equipamento com motor AC; forçar esse link contrariaria a própria tese do texto. Sem lugar editorialmente honesto para ele ali.
3. **Os ~40 usos de "dezenove"/"19 modelos" em texto corrido** nos 12 arquivos listados no comentário de `src/data/catalog.mjs`: continuam literais. Convertê-los todos para usar a constante seria a refatoração grande que o próprio pedido de auditoria pede para evitar fora de necessidade real; ficam documentados como checklist para a próxima mudança de tamanho do catálogo.
