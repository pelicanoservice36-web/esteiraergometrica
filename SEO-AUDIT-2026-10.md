# SEO-AUDIT-2026-10

Auditoria de SEO técnico, editorial e preparação para AI Search do esteiraergometrica.com. Levantamento feito por leitura direta do código-fonte (`src/pages/`, `src/layouts/`, `src/data/`) e verificação programática (extração de `title`/`description`/`h1`/`path` de todas as páginas, checagem de links internos, cruzamento com `public/sitemap.xml` e `public/robots.txt`). Nenhum arquivo de conteúdo foi alterado para produzir este relatório.

## 1. Resumo executivo

- **50 páginas** no código (`src/pages/**/*.astro`): 19 reviews, 23 guias, home, metodologia, sobre, plano-30-dias, 3 páginas legais e a página de erro 404.
- **Nenhum P0.** Nenhum title, description ou H1 ausente; nenhum título, H1 ou description duplicado entre páginas; nenhum link interno quebrado; canonical, sitemap e robots consistentes.
- **O achado mais importante da auditoria:** 32 das 50 páginas (64%) têm `description` acima de 155 caracteres, o limite que o próprio `CLAUDE.md` do projeto define. Seis delas passam de 220 caracteres, até 301 num caso. Isso é truncado pelo Google no resultado de busca e é o tipo de coisa que afeta CTR diretamente, o mesmo sintoma que já vimos ao vivo no Search Console (`esteira-acima-de-100kg` ficou duas semanas em boa posição com zero clique antes de ajustarmos o title/description).
- Outros três achados estruturais, nenhum deles crítico: ausência de `BreadcrumbList` em todo o site; a contagem "dezenove/19 modelos" escrita à mão em 13 arquivos, sem uma fonte única; e 5 reviews recentes com poucos links internos de entrada.
- Nada neste relatório foi implementado. Tudo abaixo é recomendação para aprovação.

## 2. Inventário completo

| Tipo | Quantidade |
|---|---|
| Review (`/reviews/*`) | 19 |
| Guia (`/guias/*`, exceto marca/comparativo/decisão) | 14 |
| Página de marca (`*-e-boa-marca` + marcas gerais) | 5 |
| Comparativo de produto (`X-ou-Y` entre duas reviews) | 2 |
| Guia de decisão (`X-ou-Y` entre categorias, não produtos) | 2 |
| Home | 1 |
| Metodologia | 1 |
| Institucional (Sobre) | 1 |
| Produto próprio (ebook, `/plano-30-dias`) | 1 |
| Legal (aviso legal, termos, cookies) | 3 |
| Sistema (404) | 1 |
| **Total** | **50** |

`/plano-30-dias` está corretamente fora do sitemap e com `noindex` ativo: o próprio código documenta que isso é intencional enquanto `CHECKOUT_URL` estiver vazio ("Vendas abrem em breve"). Não é um problema, é um produto ainda não lançado.

## 3. P0 — Crítico

**Nenhum problema crítico confirmado.** Não há canonical quebrado, página indisponível, erro técnico grave ou links internos quebrados em massa.

## 4. P1 — Alto

### 4.1 Meta description acima de 155 caracteres (32 páginas)

Tabela completa na seção 7. Resumo por faixa:

| Faixa | Páginas |
|---|---|
| Até 155 (OK) | 18 |
| 156–180 | 15 |
| 181–220 | 11 |
| Acima de 220 | 6 (máximo: 301, em `/reviews/gallant-elite-gee12m28a`) |

Título: só 1 página passa de 60 caracteres, e por pouco: `/guias/esteira-para-corrida-ou-caminhada` com 61. Não é uma categoria de problema à parte, é a mesma causa (texto que cresceu depois de revisões sucessivas sem reconferir o limite).

**Risco se não corrigir:** truncamento no Google, descrição cortada no meio da frase, pior CTR. Já observamos esse exato padrão nesta mesma conta esta semana.

### 4.2 `BreadcrumbList` ausente

Nenhuma página do site declara `BreadcrumbList` em JSON-LD. É aditivo (não muda nada visível, não compete com o design) e ajuda tanto rich results quanto a localização de cada página dentro da hierarquia do site para sistemas de IA.

### 4.3 Contagem do catálogo sem fonte única

"Dezenove"/"19 modelos"/"19 esteiras" aparece escrito à mão em 13 arquivos (lista completa na seção 17). Toda vez que um produto novo entra no catálogo (o que já aconteceu várias vezes), alguém precisa lembrar de caçar e trocar o número em 13 lugares. Já corrigimos esse tipo de inconsistência manualmente mais de uma vez nesta conta.

### 4.4 Linkagem interna reforçada para os reviews mais novos

Contagem de links internos de entrada (quantos arquivos em `src/pages` linkam para cada review), do menor para o maior:

| Review | Links de entrada |
|---|---|
| `kht-gts7` | 6 |
| `kht-gts6` | 8 |
| `speedo-tr5` | 8 |
| `antuvi-mesa` | 11 |
| `importway-iwest2x1-10` | 11 |

Os três primeiros são os produtos mais recentes do catálogo; é esperado que tenham menos links ainda, mas é exatamente por isso que valem um reforço deliberado nos guias relacionados (ex.: `esteira-profissional-para-academia`, `melhor-esteira-ergometrica-residencial`, `esteira-por-orcamento`), em vez de esperar o tempo resolver.

## 5. P2 — Médio

- **3 comparativos de alta intenção ainda não existem**: Polimet EP-1600 vs Gallant, Gallant vs Athletic Racer, Athletic Racer vs Speedo TR5. Detalhe na seção 15.
- **4 páginas de marca ainda não existem**: Gallant, Speedo, PodiumFit, WCT. Detalhe na seção 16. `AGUARDANDO APROVAÇÃO`, porque exigem apuração factual nova, não só reorganização de dado existente.
- **`twitter:title`/`twitter:description`/`twitter:image` explícitos não existem.** Hoje o Twitter Card cai de volta para as tags `og:*`, o que é válido, mas um card dedicado dá mais controle sobre como o link aparece quando compartilhado.
- **Melhorias de AI Search pontuais**: ver seção 10.

## 6. P3 — Baixo

- Breadcrumb visual (cosmético, independente do JSON-LD da seção 4.2; só vale a pena se quiser a navegação visível, não é necessário para o ganho de SEO/AI Search).
- Revisão do hero em vídeo da home (ver seção 11; nada confirmado como problema, só um ponto de atenção).
- `404.astro` não declara `noindex` explicitamente. O status HTTP 404 já impede indexação na prática, então isto é defesa redundante de custo bem baixo, não uma correção urgente.

## 7. Auditoria página por página

| URL | Tipo | Keyword / intenção principal | Problema | Prioridade | Status |
|---|---|---|---|---|---|
| `/404` | Sistema | Essa página não existe | - | - | OK |
| `/aviso-legal` | Legal | Aviso legal | - | - | OK |
| `/guias/athletic-e-boa-marca` | Página de marca | Athletic é uma boa marca de esteira? | description com 165 caracteres | P1 | Ajustar |
| `/guias/como-comecar-a-usar-a-esteira` | Guia | Como começar a usar a esteira | - | - | OK |
| `/guias/como-comprar-esteira-com-seguranca` | Guia | Como comprar esteira ergométrica com segurança | description com 181 caracteres | P1 | Ajustar |
| `/guias/como-escolher` | Guia | Como escolher uma esteira ergométrica | - | - | OK |
| `/guias/dream-fitness-dr1600-ou-athletic-racer` | Comparativo | Dream Fitness DR-1600 ou Athletic Racer | - | - | OK |
| `/guias/dream-fitness-e-boa-marca` | Página de marca | Dream Fitness é uma boa marca de esteira? | description com 175 caracteres | P1 | Ajustar |
| `/guias/esteira-acima-de-100kg` | Guia | Esteira para quem pesa mais de 100 kg | - | - | OK (ajustado em título/description nesta semana) |
| `/guias/esteira-dobravel` | Guia | Esteira dobrável | description com 176 caracteres | P1 | Ajustar |
| `/guias/esteira-ou-rua-bike-ou-eliptico` | Guia de decisão | Esteira, rua, bike ou elíptico | description com 183 caracteres | P1 | Ajustar |
| `/guias/esteira-para-apartamento` | Guia | Esteira para apartamento pequeno | - | - | OK |
| `/guias/esteira-para-corrida-ou-caminhada` | Guia de decisão | Melhor esteira para caminhada ou corrida? | description com 222 caracteres; title com 61 | P1 | Ajustar |
| `/guias/esteira-para-emagrecer` | Guia | Esteira ajuda a perder peso? | description com 193 caracteres | P1 | Ajustar |
| `/guias/esteira-para-idosos` | Guia | Esteira ergométrica para idosos | description com 193 caracteres | P1 | Ajustar |
| `/guias/esteira-por-orcamento` | Guia | Qual esteira comprar por faixa de orçamento | description com 159 caracteres | P1 | Ajustar |
| `/guias/esteira-profissional-para-academia` | Guia | Esteira profissional para academia | - | - | OK |
| `/guias/esteira-silenciosa` | Guia | Esteira silenciosa | description com 192 caracteres | P1 | Ajustar |
| `/guias/kikos-e-boa-marca` | Página de marca | Kikos é uma boa marca de esteira? | description com 210 caracteres | P1 | Ajustar |
| `/guias/melhor-esteira-custo-beneficio` | Guia | Melhor esteira custo-benefício | - | - | OK |
| `/guias/melhor-esteira-ergometrica-residencial` | Guia (pilar) | Melhor esteira residencial | description com 186 caracteres | P1 | Ajustar |
| `/guias/melhores-marcas-de-esteira` | Página de marca | Melhores marcas de esteira ergométrica | description com 181 caracteres | P1 | Ajustar |
| `/guias/o-que-e-uma-esteira-ergometrica` | Guia | O que é uma esteira ergométrica | - | - | OK |
| `/guias/polimet-e-boa-marca` | Página de marca | Polimet é uma boa marca de esteira? | description com 188 caracteres | P1 | Ajustar |
| `/guias/polimet-ep1600-ou-dream-fitness-dr1600` | Comparativo | Polimet EP-1600 ou Dream Fitness DR-1600 | description com 208 caracteres | P1 | Ajustar |
| `/` | Home | Melhor esteira ergométrica (comparativo geral) | description com 207 caracteres | P1 | Ajustar |
| `/metodologia` | Metodologia | Como a nota editorial é calculada | description com 167 caracteres | P1 | Ajustar |
| `/plano-30-dias` | Produto (ebook) | Plano de treino de 30 dias | - | - | OK (noindex intencional, produto não lançado) |
| `/politica-de-cookies` | Legal | Política de cookies | - | - | OK |
| `/reviews/antuvi-mesa` | Review | Antuvi é boa? | - | - | OK |
| `/reviews/athletic-racer` | Review | Athletic Racer 16 km/h é boa? | description com 163 caracteres | P1 | Ajustar |
| `/reviews/dream-fitness-dr1600` | Review | Dream Fitness DR-1600 é boa? | - | - | OK |
| `/reviews/esteira-eletrica-dobravel-residencial-cardio` | Review | Esteira dobrável de R$ 640 é boa? | description com 181 caracteres | P1 | Ajustar |
| `/reviews/gallant-elite-gee12m25a` | Review | Gallant Elite GEE12M25A é boa? | description com 274 caracteres | P1 | Ajustar |
| `/reviews/gallant-elite-gee12m28a` | Review | Gallant Elite GEE12M28A é boa? | description com 301 caracteres | P1 | Ajustar |
| `/reviews/gallant-elite-gee13m29a` | Review | Gallant Elite GEE13M29A é boa? | description com 249 caracteres | P1 | Ajustar |
| `/reviews/health-herald-lcd` | Review | Health Herald SP0501 é boa? | description com 198 caracteres | P1 | Ajustar |
| `/reviews/importway-iwest2x1-10` | Review | Importway IWEST2X1-10 é boa? | description com 215 caracteres; poucos links de entrada | P1 | Ajustar |
| `/reviews/kht-gts6` | Review | KHT GTS-6 é boa? | description com 188 caracteres; poucos links de entrada | P1 | Ajustar |
| `/reviews/kht-gts7` | Review | KHT GTS-7 é boa? | description com 169 caracteres; poucos links de entrada | P1 | Ajustar |
| `/reviews/podiumfit-x300` | Review | PodiumFit X300 é boa? | description com 237 caracteres | P1 | Ajustar |
| `/reviews/polimet-ep1600-senior` | Review | Polimet EP-1600 Sênior é boa? | - | - | OK |
| `/reviews/polimet-ep1600` | Review | Polimet EP-1600 é boa? | - | - | OK |
| `/reviews/qbuen-150kg` | Review | QBuen AT-1271 é boa? | - | - | OK |
| `/reviews/redfin-150kg` | Review | Redfin Ideal DL-227 é boa? | description com 189 caracteres | P1 | Ajustar |
| `/reviews/speedo-tr5` | Review | Speedo TR5 é boa? | description com 166 caracteres; poucos links de entrada | P1 | Ajustar |
| `/reviews/strive-25hp-16kmh` | Review | Strive TM16 é boa? | description com 196 caracteres | P1 | Ajustar |
| `/reviews/wct-fitness-esteira` | Review | WCT Fitness é boa? | description com 228 caracteres | P1 | Ajustar |
| `/sobre` | Institucional | Quem escreve o site | description com 190 caracteres | P1 | Ajustar |
| `/termos-de-uso` | Legal | Termos de uso | - | - | OK |

Nenhuma linha foi marcada como problema por similaridade de palavra-chave sozinha. As páginas com título parecido (ex.: os quatro "X é uma boa marca?", ou os guias de decisão "X ou Y") têm intenção e conteúdo diferentes entre si; isso é tratado na seção 8, não aqui.

## 8. Internal linking

- O padrão "Leia também" já existe em **todas** as 19 reviews e 23 guias. Não é um ponto de partida do zero, é um reforço pontual.
- Nenhum link interno quebrado encontrado. A varredura programática de todos os `href="/..."` em `src/pages`, `src/components` e `src/layouts` contra as rotas reais achou só 3 ocorrências fora do conjunto de páginas, e as três são arquivos estáticos (`/favicon.svg`, `/fonts/manrope-latin.woff2`, `/video/esteiraergometricahead-poster.webp`), não links para páginas inexistentes.
- Reforçar links de entrada para `kht-gts7`, `kht-gts6` e `speedo-tr5` principalmente a partir de `esteira-profissional-para-academia`, `melhor-esteira-ergometrica-residencial` e `esteira-por-orcamento`, que já falam desses produtos em texto corrido.
- Nenhuma página órfã de verdade encontrada (toda página tem pelo menos um link de entrada); a diferença é só de volume entre as mais novas e as mais antigas.

## 9. Schema

**Existente e consistente:**
`Product`, `Review`, `AggregateRating`, `AggregateOffer`, `Brand` (19 cada, uma por review), `Article` (guias), `FAQPage`/`Question`/`Answer` (maioria das páginas), `ProfilePage` + `Organization` (uma vez, em `/sobre`).

**Ausente:**
- `BreadcrumbList`: **P1**, ausente em 100% das páginas.
- `WebSite`/`SearchAction`: **não necessário** hoje, porque o site não tem busca interna.

Nenhum schema inventado encontrado (sem `AggregateRating` falso, sem preço inventado, sem disponibilidade inventada): isso já foi auditado manualmente várias vezes nesta conta e os números batem com as fichas técnicas reais.

## 10. AI Search

| Tipo de página | Avaliação | Por quê |
|---|---|---|
| Metodologia | Excelente | Critérios e pesos explícitos, conta aberta por produto, fácil de citar como fonte de "como a nota foi calculada" |
| Review | Bom | Ficha técnica tabulada, nota com fonte, distinção clara entre especificação anunciada e confirmada, FAQ respondendo na primeira frase. Ponto a melhorar: descriptions longas (seção 4.1) tornam o resumo que aparece fora da página (SERP, compartilhamento) menos limpo, mesmo que o conteúdo em si seja forte |
| Guia | Bom | A maioria tem resposta direta no início (`standfirst`) e compara dados reais entre produtos; mesma ressalva de description |
| Comparativo de produto | Bom, mas incompleto | Os 2 existentes seguem bem o padrão; faltam 3 pares de alta intenção (seção 15) |
| Página de marca | Bom, mas incompleta | 4 marcas com review publicada (Gallant, Speedo, PodiumFit, WCT) não têm página "é boa marca?" dedicada para responder a essa pergunta específica |
| Home | Bom | Tabela comparativa de todos os modelos, mas a description mais longa do site (207 caracteres) |

Não avaliei nem vou avaliar "posição no ChatGPT" ou equivalente: nenhum desses sistemas publica um ranking fixo e verificável, então isso seria inventar um dado, o que a regra número um do projeto proíbe.

## 11. Performance

Não fiz benchmark (não há Lighthouse/CrUX conectado nesta sessão; qualquer número aqui seria inventado). Only o que é verificável direto no código:

- Nenhuma diretiva `client:` em todo o projeto: zero hidratação de framework, consistente com o que o `CLAUDE.md` promete (HTML/CSS estático).
- A home tem um `<video>` de hero com `poster` em WebP e um `<img loading="lazy">` como fallback. Não há evidência de que isso seja um problema de LCP real sem medir, então: **STATUS: OK / monitorar**, não um problema confirmado.
- 100% dos `<img>` do projeto têm `alt`. Sem pendência aqui.

## 12. Canonical

Gerado centralizadamente em `src/layouts/BaseLayout.astro` a partir da prop `path` e de `site` em `astro.config.mjs`, igual em toda página (nenhuma URL hardcoded encontrada fora desse mecanismo). Sem problema de trailing slash, http/https ou www/non-www identificado no código (o projeto já documenta a regra de nunca usar `.html` nas URLs públicas, e nenhuma página viola isso).

## 13. Sitemap

`public/sitemap.xml`: 48 URLs, todas correspondendo a páginas reais. A única página de conteúdo fora do sitemap é `/plano-30-dias`, de forma intencional (seção 2). Nenhuma URL fantasma (sitemap apontando para rota que não existe no código).

## 14. Robots

`public/robots.txt`: permite tudo, bloqueia só `/go/` e `/ml-` (rotas de redirect de afiliado, sem conteúdo próprio, corretamente não indexáveis). Referencia o sitemap. Nenhuma página importante bloqueada.

## 15. Comparativos recomendados

Registrados como oportunidade, nenhum criado.

| Par | As duas reviews existem? | Dado suficiente nas duas? | Intenção | URL sugerida | Risco de canibalização | Prioridade |
|---|---|---|---|---|---|---|
| Polimet EP-1600 vs Gallant Elite | Sim (Polimet EP-1600; Gallant tem 3 variantes: GEE12M25A, GEE12M28A, GEE13M29A) | Sim, ficha completa nas duas pontas | Comparar entrada vs faixa intermediária com inclinação | `/guias/polimet-ep1600-ou-gallant-elite` | Baixo: a Polimet já é comparada com a Dream Fitness; esta seria uma segunda comparação com intenção diferente (inclinação, não preço de entrada) | P2 |
| Gallant Elite vs Athletic Racer | Sim | Sim | Comparar inclinação/praticidade vs motor para corrida | `/guias/gallant-elite-ou-athletic-racer` | Baixo | P2 |
| Athletic Racer vs Speedo TR5 | Sim | Sim (ambos com motor/lona para corrida documentados) | Decidir entre os dois produtos de corrida do catálogo | `/guias/athletic-racer-ou-speedo-tr5` | Baixo, a intenção ("qual pra correr") ainda não tem uma página dedicada só pra esse confronto | P2 |

Nenhum dos três precisa de dado novo: a informação já existe nas reviews correspondentes. O trabalho é de montagem e redação, não de apuração.

## 16. Páginas de marca recomendadas

Registradas como oportunidade. `AGUARDANDO APROVAÇÃO` porque, diferente dos comparativos, a pergunta "[marca] é confiável/boa marca?" normalmente pede uma apuração própria (histórico da empresa, reclamações, tempo de mercado), não só reorganizar dado de ficha técnica.

| Marca | Reviews já publicadas da marca | Página "é boa marca?" existe? |
|---|---|---|
| Gallant | GEE12M25A, GEE12M28A, GEE13M29A (3) | Não |
| Speedo | TR5 (1) | Não |
| PodiumFit | X300 (1) | Não |
| WCT | WCT Fitness Esteira (1) | Não |

Gallant é a candidata mais forte (3 produtos já analisados dão bastante material próprio para citar sem pesquisa externa pesada); as outras três têm só 1 review cada, então a página de marca dependeria mais de apuração nova.

## 17. Consistência do catálogo

"Dezenove"/"19 modelos"/"19 esteiras" aparece hardcoded em texto corrido nestes 13 arquivos:

```
src/pages/index.astro
src/pages/metodologia.astro
src/pages/guias/como-comprar-esteira-com-seguranca.astro
src/pages/guias/como-escolher.astro
src/pages/guias/esteira-acima-de-100kg.astro
src/pages/guias/esteira-dobravel.astro
src/pages/guias/esteira-para-corrida-ou-caminhada.astro
src/pages/guias/esteira-silenciosa.astro
src/pages/guias/kikos-e-boa-marca.astro
src/pages/guias/melhor-esteira-custo-beneficio.astro
src/pages/guias/melhor-esteira-ergometrica-residencial.astro
src/pages/guias/melhores-marcas-de-esteira.astro
src/pages/guias/o-que-e-uma-esteira-ergometrica.astro
```

Não há nenhuma constante central (ao contrário de `src/data/affiliates.mjs`, que já centraliza os links de afiliado). Recomendação: uma constante pequena, no mesmo espírito de `affiliates.mjs`, exportando o total atual e/ou a lista de slugs, para ser importada nesses 13 lugares em vez de escrita à mão. Risco de não corrigir: a cada produto novo, alguém precisa lembrar de caçar e trocar o número nos 13 arquivos à mão, o que já gerou inconsistência real nesta conta antes.

## 18. Riscos

**Risco alto:**
- Alterar URLs existentes.
- Reescrever páginas que já estão marcadas `STATUS: OK` na seção 7.
- Criar conteúdo duplicado entre comparativos novos e guias de decisão existentes.
- Criar schema artificial (nota, avaliação, preço ou disponibilidade inventados).
- Alterar qualquer link de afiliado fora de `src/data/affiliates.mjs` + `buyHref()`.

**Risco médio:**
- Criar os 3 comparativos sem reconferir se a ficha de cada review ainda está atualizada (preços mudam).
- Criar páginas de marca sem pesquisa factual real sobre a empresa (histórico, reclamações).

## 19. Ordem recomendada de implementação

### Implementação recomendada imediatamente após aprovação (P1, sem conteúdo novo)
1. Encurtar as 32 descriptions acima de 155 caracteres (edição pontual, sem mudar dado nenhum).
2. Adicionar `BreadcrumbList` via JSON-LD em `BaseLayout.astro` (invisível, sem mudança de design).
3. Centralizar a contagem do catálogo numa constante e atualizar os 13 arquivos para usá-la.
4. Reforçar links internos para `kht-gts7`, `kht-gts6` e `speedo-tr5` nos 3 guias citados na seção 8.

### Implementação mediante aprovação específica (P2/P3, conteúdo novo)
5. Os 3 comparativos da seção 15.
6. As páginas de marca da seção 16 (Gallant primeiro, se aprovado).
7. `twitter:title`/`description`/`image` explícitos.
8. Breadcrumb visual e revisão do hero de vídeo, se desejado.

### Não mexer
Todas as 18 páginas marcadas `STATUS: OK` na seção 7, o sistema de afiliados (`affiliates.mjs`/`buyHref`/`check-affiliates.mjs`), o canonical, o robots e o sitemap.
