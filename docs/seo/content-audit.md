# Auditoria de conteúdo — esteiraergometrica.com

Data da auditoria: **2026-09-09**
Escopo: Fase 1 (mapeamento) + Fase 2 (inventário e classificação) do prompt mestre de
atualização de conteúdo. **Nenhum conteúdo foi alterado para produzir este documento.**

---

## Fase 1 — Mapeamento do projeto

### Stack e build

- **Framework**: [Astro](https://astro.build) `^7.3.1`, output estático (`output: "static"`,
  implícito por não haver `output: 'server'`), Node `>=22.12.0`.
- **`astro.config.mjs`**: `site: 'https://esteiraergometrica.com'`, `build.format: 'file'`
  (preserva URLs `.html` em vez de gerar `/rota/index.html`).
- **Sem framework de UI no cliente** — nenhum React/Vue/Svelte/Alpine. Os únicos `<script>`
  no HTML publicado são: o snippet do Google Analytics (`is:inline`, em `BaseLayout.astro`) e
  a lógica do banner de cookies (`is:inline`, também em `BaseLayout.astro`, mais um pequeno
  script em `politica-de-cookies.astro` para reabrir o banner).
- **Sem test runner, sem linter formal.** A verificação de qualidade do projeto é
  `scripts/check-affiliates.mjs` (Node puro, 31 checagens — ver seção "Sistema de afiliados"
  abaixo), rodado via `npm run check`.
- **Dependências de produção**: só `astro`. Nenhuma dependência de terceiros além do próprio
  framework — reduz superfície de ataque e de manutenção.
- **`node_modules_temp_check/`** existe na raiz do projeto, fora de `.gitignore` — parece
  resíduo de uma verificação anterior (não gerado por nenhum script do projeto). Não afeta o
  build; não removido nesta auditoria por não ser mandato desta fase (só mapear).

### Estrutura de diretórios

```
src/
  layouts/
    BaseLayout.astro      <head>, <Header>, <Footer>, banner de cookies, GA4 — toda página passa por aqui
    ReviewLayout.astro    + lead-section, ficha técnica (.ficha), CTA de compra, usado pelas 5 reviews
    ArticleLayout.astro   + lead-section, sem ficha — usado pelos 2 guias e pelas 3 páginas legais
  components/
    Header.astro, Footer.astro, Logo.astro
  data/
    affiliates.mjs        registro único de links de afiliado (ver seção dedicada abaixo)
  pages/
    index.astro            home — comparativo, featured pick, grid de reviews, "como avaliamos", guias
    reviews/*.astro         5 arquivos, 1 por produto
    guias/*.astro           2 arquivos
    404.astro               página de erro (adicionada nesta sessão, 2026-09-09)
    aviso-legal.astro · termos-de-uso.astro · politica-de-cookies.astro
  styles.css                folha única, importada só pelo BaseLayout
scripts/
  gen-redirects.mjs         gera public/_redirects a partir de affiliates.mjs (roda no prebuild)
  check-affiliates.mjs      31 verificações, cobre registro + páginas + _redirects + dist/ publicado
public/
  assets/images/            5 fotos de produto, .webp, uma por review, nomeadas pelo slug
  _redirects                GERADO — não editar à mão
  _headers                  cache + X-Robots-Tag para /go/*
  robots.txt                Disallow: /go/ e /ml-, referencia o sitemap
  sitemap.xml                MANTIDO À MÃO — 11 URLs (ver inventário abaixo)
docs/                        (novo, criado nesta auditoria)
```

Não existe pasta `content/` do Content Collections do Astro — todo o conteúdo editorial mora
diretamente no frontmatter/corpo de cada `.astro` em `src/pages/`. Não existe CMS, banco de
dados, nem arquivo JSON/Markdown separado para dados de produto além de `affiliates.mjs` (que
guarda só o link comercial, não a ficha técnica — a ficha vive em cada página de review).

### Sistema de SEO

- **Canonical**: gerado automaticamente em `BaseLayout.astro` via
  `new URL(path, Astro.site)` — cada página passa sua própria prop `path`. Verificado nesta
  sessão: cada review tem canonical único e correto (não há duplicação nem apontamento para a
  home). Não há como uma página esquecer o canonical, porque ele não é opcional no `Props`.
- **Meta title/description**: por página, via props `title`/`description` do layout. Não há
  auditoria de comprimento automatizada (title até 60 caracteres e description até 155 é regra
  do `CLAUDE.md`, mas não é verificada por script).
- **Open Graph**: `og:type`, `og:title`, `og:description`, `og:url` gerados no `BaseLayout`.
  Não há `og:image` configurado em nenhuma página — toda página publicada usa o preview padrão
  do navegador/rede social (sem imagem customizada). **Gap real**: um card de compartilhamento
  sem imagem tende a converter pior em redes sociais e WhatsApp.
- **JSON-LD**: presente em todas as 5 reviews (`Product` + `AggregateOffer`) e nos 2 guias
  (`Article`). Não há `BreadcrumbList`, `Organization`, `WebSite` ou `ItemList` em nenhuma
  página. Nenhum schema usa `aggregateRating` ou `Review` — ou seja, os dados estruturados são
  honestos (não inventam nota nem review), mas também não aproveitam o potencial de rich
  result que schemas adicionais dariam.
- **Sitemap**: `public/sitemap.xml`, mantido à mão, 11 URLs (home + 5 reviews + 2 guias + 3
  legais). Todas as URLs do sitemap batem com páginas reais existentes — nenhuma órfã, nenhuma
  ausente. Prioridades: home 1.0, reviews 0.9, guias 0.7, legais 0.1.
- **Robots.txt**: bloqueia só `/go/` (redirect de afiliado) e `/ml-` (rota legada), com
  `Sitemap:` apontando para o XML acima. Não bloqueia nada que devesse ser indexado.
- **404**: existia como página em branco (`Content-Length: 0`) até esta sessão — corrigida
  em 2026-09-09 (`src/pages/404.astro`, já publicado).

### Sistema de afiliados

Fonte única: `src/data/affiliates.mjs`. Nenhuma URL de loja aparece fora desse arquivo (regra
verificada por `check-affiliates.mjs`, teste T19). `buyHref(slug)` resolve para
`/go/<merchant>/<slug>`, que `public/_redirects` (gerado, nunca editado à mão) redireciona
(302) para o link real. Allowlist de host por igualdade exata — recusa
`evilmercadolivre.com.br` e `?u=meli.la`, os dois erros clássicos de open redirect (testes
T08–T12b). 5 produtos cadastrados, todos `enabled: true`, todos com `affiliateUrl` real
validado. `npm run check` roda 31 verificações e todas passam no estado atual do repositório.

### Analytics e consentimento

Google Analytics 4 (`G-F3SC734W1X`), carregado com Consent Mode v2 — `analytics_storage`
negado por padrão, liberado só após aceite explícito no banner. Banner redesenhado nesta
sessão (2026-09-09) como cartão flutuante, testado com Playwright (aceite esconde o banner e
grava a escolha; nenhum erro de console). Nenhum pixel de Ads, nenhum remarketing, nenhuma
ferramenta além do GA4.

### Imagens

5 fotos de produto (`.webp`, self-hosted, uma por review, nomeada pelo slug), todas com
`width`/`height` explícitos e `loading="lazy"` nos usos em grid/comparativo (evita layout
shift). `alt=""` nas miniaturas de 44×44 da tabela comparativa (correto — o nome do produto já
aparece em texto ao lado, imagem é redundante para leitor de tela) e `alt` descritivo nos usos
maiores (200×200 no grid, 220×220 no featured pick). Nenhuma imagem quebrada encontrada.
Favicon: `/favicon.svg`, presente e referenciado.

### Domínio e deploy

Custom domain `esteiraergometrica.com` ativo (corrigido em sessão anterior, 2026-09-09), DNS
via Cloudflare, deploy automático a cada `git push` para `main`. Fora do escopo desta auditoria
de conteúdo — nenhuma alteração de DNS/Cloudflare/Hostinger foi feita ou é necessária aqui.

---

## Fase 2 — Inventário de conteúdo

| URL | Tipo | Título atual (`<title>`) | H1 atual | Produto/tema | Estado |
|---|---|---|---|---|---|
| `/` | Home | Esteira Ergométrica: qual comprar em 2026 — comparativo e análises | Qual esteira ergométrica comprar para usar em casa? | Geral | **B — Atualizar** |
| `/reviews/polimet-ep1600.html` | Review | Polimet EP-1600 é boa? Análise honesta, preço e para quem vale | Polimet EP-1600 é boa? | Polimet EP-1600 | **A — Preservar** (conteúdo já profundo e datado corretamente) |
| `/reviews/polimet-ep1600-senior.html` | Review | Polimet EP-1600 Sênior é boa? Análise, preço e diferenças | Polimet EP-1600 Sênior é boa? | Polimet EP-1600 Sênior | **A — Preservar** |
| `/reviews/dream-fitness-dr1600.html` | Review | Dream Fitness DR-1600 é boa? Análise, preço e reclamações | Dream Fitness DR-1600 é boa? | Dream Fitness DR-1600 | **A — Preservar** |
| `/reviews/esteira-eletrica-dobravel-residencial-cardio.html` | Review | Esteira Dobrável Cardio de R$ 640 vale a pena? Análise | Esteira elétrica dobrável de R$ 640: vale a pena por ser tão barata? | Cardio (sem marca) | **A — Preservar** |
| `/reviews/athletic-racer.html` | Review | Athletic Racer 16km/h é boa? Análise, ficha técnica e para quem vale | Athletic Racer 16 km/h é boa? | Athletic Racer | **A — Preservar** (publicada nesta sessão, já no padrão atual) |
| `/guias/como-escolher.html` | Guia | Como escolher uma esteira ergométrica para casa | Como escolher uma esteira ergométrica | Guia de compra | **B — Atualizar** (refs desatualizadas, ver achado #1) |
| `/guias/esteira-para-apartamento.html` | Guia | Esteira para apartamento pequeno: guia de compra 2026 | Esteira para apartamento pequeno | Guia de compra | **B — Atualizar** (tabela incompleta, ver achado #1) |
| `/aviso-legal.html` | Legal | Aviso legal | Aviso legal | Institucional | **B — Atualizar** (placeholder, ver achado #2) |
| `/termos-de-uso.html` | Legal | Termos de uso | Termos de uso | Institucional | **B — Atualizar** (placeholder, ver achado #2) |
| `/politica-de-cookies.html` | Legal | Política de cookies | Política de cookies | Institucional | **B — Atualizar** (placeholder, ver achado #2) |
| `/404.html` | Utilitária | Página não encontrada — esteiraergometrica.com | Essa página não existe | — | **A — Preservar** (nova, já no padrão atual) |

Nenhuma página foi classificada como **C — Expandir**, **D — Reestruturar**, **E — Consolidar**
ou **F — Remover**. Não há conteúdo duplicado ou redundante no site: cada review cobre um
produto distinto, e os dois guias têm escopos claramente diferentes (critério de compra vs.
espaço/apartamento). O padrão editorial (veredito → para quem sim → para quem não → seções
técnicas → prós/contras → preço → FAQ → disclosure) já é aplicado de forma consistente nas 5
reviews, incluindo autocorreção de erros de terceiros (ex.: "16 HP" vs. 1,6 HP real na
EP-1600; "26 programas" vs. 19 reais na Athletic Racer) — isso já é E-E-A-T forte e não deveria
ser reescrito, só mantido e expandido para as páginas que ainda não têm esse nível de detalhe.

### Achados que sustentam as classificações "B — Atualizar"

**Achado #1 — Guias citam contagem de produtos desatualizada.**
Ambos os guias foram escritos quando existiam 3 reviews e hoje existem 5:
- `como-escolher.astro` linha 32: *"Os três modelos que já analisamos têm 33 × 100 cm"* — não
  é mais verdade; a Cardio tem 48×90 cm e a Athletic Racer tem 40×126,5 cm.
- `como-escolher.astro` linha 41: *"Nas três análises que já publicamos..."*
- `esteira-para-apartamento.astro` linha 46: a tabela "Comparando o que já analisamos para uso
  em apartamento" lista só 3 modelos (Polimet EP-1600, Dream Fitness, Polimet Sênior) e não
  inclui a Cardio (18 kg, a mais leve/portátil do catálogo — encaixe óbvio para esse guia
  especificamente) nem a Athletic Racer (73×177×131 cm, 42,4 kg — contraponto útil de "o que
  NÃO é ideal para apartamento pequeno", relevante justamente por contraste).
- `index.astro` — a home já foi atualizada nesta sessão (comparativo e grid já têm os 5
  produtos); é só o texto em prosa dos dois guias que ficou para trás.

Impacto: baixo risco de erro factual grave (os números continuam corretos onde aparecem, só a
contagem de "modelos já analisados" está errada), mas é exatamente o tipo de inconsistência que
um leitor atento nota e que reduz confiança — e é uma oportunidade perdida de link interno para
a Cardio e para a Racer a partir de páginas com tráfego de intenção de compra.

**Achado #2 — Placeholder `[E-MAIL DE CONTATO]` nas 3 páginas legais.**
`aviso-legal.astro:42`, `termos-de-uso.astro:39`, `politica-de-cookies.astro:37` — as três
terminam com `Dúvidas sobre [isto]: [E-MAIL DE CONTATO].`, literalmente sem e-mail nenhum.
Nenhum outro placeholder (`[INSIRA...]`, `[NOME]`, `TODO`, `FIXME`) foi encontrado em nenhum
lugar do `src/`. Isso é o único placeholder real do projeto — mas está em produção, em 3
páginas, e é exatamente o tipo de furo que a Fase 19 do prompt mestre pede para caçar
especificamente. **Requer decisão do dono**: qual e-mail publicar (não vou inventar um).

**Achado #3 — Avaliações de comprador exibidas sem atribuição clara ao Mercado Livre.**
Na home, das 11 ocorrências de nota por estrelas, só 1 (a seção "featured pick", linha 208)
diz explicitamente "no Mercado Livre". As outras 10 — a tabela comparativa e os 5 cards do grid
de reviews — mostram só `★★★★★ 4,5 (530 avaliações)`, sem indicar a origem. Um leitor pode
razoavelmente entender isso como nota editorial do próprio site, quando na verdade é a nota de
comprador do anúncio no Mercado Livre. **Não é um problema de dado estruturado** — nenhum
JSON-LD do site usa `aggregateRating` ou `Review`, então não há risco de rich snippet enganoso
no Google — é um problema de clareza no HTML visível, que a Fase 8 do prompt mestre pede para
corrigir especificamente ("não apresente como se fosse avaliação do site"). Correção proposta:
adicionar "no Mercado Livre" (ou abreviação equivalente) nas 10 ocorrências, e considerar se o
site quer desenvolver uma nota editorial própria e separada (Fase 9 do prompt mestre — hoje o
site não tem nenhum sistema de nota numérica autoral, só o "Veredito" em texto corrido).

**Achado #4 — Não existe página de Metodologia nem `og:image`.**
"Como avaliamos" existe só como seção da home (`#como-avaliamos`), não como página própria
indexável/linkável separadamente. Não há página "Sobre" com identificação de quem escreve —
hoje o JSON-LD usa só `Organization` como autor, nunca uma pessoa nomeada, e o rodapé não cita
nenhum responsável editorial. Isso é uma decisão de baixo risco tomada implicitamente (o site
não afirma ter testado fisicamente nenhum produto, o que é honesto), mas é uma lacuna real de
E-E-A-T se o objetivo é aparecer no Google Reviews System, que valoriza autoria e metodologia
explícitas e citáveis. Também não há `og:image` em nenhuma página — compartilhamento em redes
sociais cai no preview genérico do navegador.

---

## O que este documento NÃO cobre (por ser fora do escopo de conteúdo)

DNS, Cloudflare, Hostinger, domínio, build/deploy pipeline — nada disso foi tocado ou precisa
ser tocado para o trabalho de atualização de conteúdo descrito no prompt mestre.

## Próximo passo

Aguardando aprovação para a Fase 3 (mapa de preservação de URL — adiantado abaixo, já que é
puramente documental) e para as fases de edição em si (4 em diante), que só devem começar após
revisão deste relatório, conforme instruído.
