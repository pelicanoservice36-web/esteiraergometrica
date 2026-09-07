# AFFILIATE_IMPLEMENTATION.md

> Documento de handoff para o **Claude Code rodando no VS Code**.
> Produzido por auditoria real do site em produção, leitura do repositório real e pesquisa real
> no Mercado Livre.
> Data da auditoria: **07/09/2026** (America/Sao_Paulo).
> Nada aqui foi inventado. O que não pôde ser confirmado está marcado como **NÃO CONFIRMADO**.
> Leia junto com o `CLAUDE.md` deste repositório — as regras de lá continuam valendo integralmente.

---

## 1. CONTEXTO

### 1.1 Objetivo

Centralizar e controlar os links de afiliado do Mercado Livre, substituindo os três redirects
ad-hoc atuais (`/ml-dream`, `/ml-polimet`, `/ml-polimet-senior`) por uma **fonte única de dados**
+ rotas nomeadas escaláveis:

```
Review → CTA → /go/mercadolivre/<slug> → registro de afiliados → affiliateUrl → Mercado Livre
```

A arquitetura deve permitir adicionar produtos e, futuramente, outros merchants (Amazon, Magalu,
Shopee) **sem editar nenhum `.astro`**.

### 1.2 Estado atual — o problema concreto

**Os três redirects estão quebrados.** Conteúdo real de `public/_redirects`:

```
# Links de afiliado centralizados.
# Trocar a URL de destino aqui atualiza o site inteiro de uma vez.
# 302 = redirecionamento temporário, correto para links comerciais.

/ml-polimet        https://SUBSTITUIR-PELO-SEU-LINK-DE-AFILIADO   302
/ml-polimet-senior https://SUBSTITUIR-PELO-SEU-LINK-DE-AFILIADO   302
/ml-dream          https://SUBSTITUIR-PELO-SEU-LINK-DE-AFILIADO   302
```

O host `substituir-pelo-seu-link-de-afiliado` não existe em DNS. Confirmado navegando nas três
rotas em produção: o browser termina em `https://substituir-pelo-seu-link-de-afiliado/` com erro
de resolução de nome.

**O site tem 13 CTAs de compra e 0% deles funciona.** Nenhuma venda pode ser atribuída.

### 1.3 O que este documento entrega

Links de afiliado **reais, gerados e validados** no painel de Afiliados do Mercado Livre da conta
do Rafael (etiqueta `pelicano`), prontos para entrar na estrutura de dados.

---

## 2. ARQUITETURA ENCONTRADA

### 2.1 Stack — **CONFIRMADO** (lido do repositório real)

| Item | Valor |
|---|---|
| Framework | **Astro `^7.3.1`** (`package.json`) |
| Tipo de projeto | ESM (`"type": "module"`), Node `>=22.12.0` |
| Saída | **estática** — `npm run build` gera HTML em `dist/` |
| `build.format` | **`'file'`** (`astro.config.mjs`) — gera `/reviews/x.html` |
| `site` | **`'https://esteiraergometrica.com'`** (`astro.config.mjs`) |
| Hospedagem | **Cloudflare Pages** (declarado no `CLAUDE.md`; headers de produção `server: cloudflare`, `cf-ray`, `cf-cache-status`) |
| Redirects | arquivo estático **`public/_redirects`** (formato Cloudflare Pages) |
| Headers | arquivo estático **`public/_headers`** |
| JS no cliente | **nenhum** — regra explícita do `CLAUDE.md`, nenhum framework de UI |
| TypeScript | `tsconfig.json` presente; layouts usam `export interface Props` |
| Test runner | **nenhum configurado** |
| Linter | **nenhum configurado** |
| Git | repositório inicializado (`.git/` presente) |

> ⚠️ **Correção importante em relação a suposições comuns:** este **não** é um Worker escrito à
> mão com roteador programático. É um site **estático**. Não existe função de servidor, não existe
> handler de request, não existe lugar para escrever `if (path === '/go/...')` em runtime.
> **Toda a lógica de redirect é resolvida em build time, gerando linhas em `public/_redirects`.**

### 2.2 Estrutura real do repositório

Raiz do projeto: `…\BlogEsteiraErgometrica\EsteiraErgometricaBlog\site\`

```
astro.config.mjs          site + build.format: 'file'
package.json              astro ^7.3.1, scripts dev/build/preview
tsconfig.json
CLAUDE.md                 memória do projeto — LEIA, as regras valem
README.md
.gitignore                node_modules/ dist/ .astro/ *.log
public/
  _redirects              ← os 3 links de afiliado quebrados
  _headers                X-Content-Type-Options, Referrer-Policy, cache de /assets/*
  robots.txt              User-agent:* / Allow:/ / Sitemap: …esteiraergometrica.com/sitemap.xml
  sitemap.xml             mantido À MÃO (9 URLs)
  favicon.svg
  assets/                 imagens
  video/
src/
  styles.css              folha única (31 KB)
  layouts/
    BaseLayout.astro      head, canonical, og, JSON-LD, Header, Footer
    ReviewLayout.astro    ficha técnica + CTA (prop buyHref) + slot
    ArticleLayout.astro   guias e páginas legais
  components/
    Header.astro  Footer.astro  Logo.astro
  pages/
    index.astro                              7 CTAs inline
    reviews/dream-fitness-dr1600.astro       buyHref + 1 CTA inline
    reviews/polimet-ep1600.astro             buyHref + 1 CTA inline
    reviews/polimet-ep1600-senior.astro      buyHref + 1 CTA inline
    guias/como-escolher.astro                0 CTAs
    guias/esteira-para-apartamento.astro     0 CTAs
    aviso-legal.astro  termos-de-uso.astro  politica-de-cookies.astro
```

> ℹ️ Existe também `…\Desktop\EsteiraErgometricaBlog\` — versão **antiga**, pré-migração para
> Astro, com apenas a review da Polimet. **Não é o projeto ativo. Ignorar.**

### 2.3 Onde os CTAs vivem — localização exata

**`src/layouts/ReviewLayout.astro`** — CTA principal, um por review, via prop:

```astro
<a class="buy" href={buyHref} rel="sponsored nofollow" target="_blank">{buyLabel}</a>
```

`buyLabel` tem default `'Ver preço no Mercado Livre'`.

**`src/pages/reviews/dream-fitness-dr1600.astro`**
- linha 41: `buyHref="/ml-dream"`
- linha 151: `<a class="buy" href="/ml-dream" rel="sponsored nofollow" target="_blank">Ver preço no Mercado Livre</a>`

(As outras duas reviews seguem exatamente o mesmo padrão com `/ml-polimet` e `/ml-polimet-senior`.)

**`src/pages/index.astro`** — 7 CTAs inline:

| Linha | href | classe |
|---|---|---|
| 97 | `/ml-polimet` | `mini-cta` (tabela comparativa) |
| 116 | `/ml-dream` | `mini-cta` |
| 135 | `/ml-polimet-senior` | `mini-cta` |
| 165 | `/ml-polimet` | `btn btn-primary` |
| 192 | `/ml-polimet` | `btn btn-primary btn-block` |
| 209 | `/ml-dream` | `btn btn-primary btn-block` |
| 226 | `/ml-polimet-senior` | `btn btn-primary btn-block` |

**Total: 13 CTAs.** Distribuição: `/ml-dream` ×4, `/ml-polimet` ×5, `/ml-polimet-senior` ×4.
Confere exatamente com a contagem feita no site em produção.

Nenhum CTA em `guias/`, nas páginas legais, no `Header` ou no `Footer`.

### 2.4 Como canonical e og:url são gerados

`src/layouts/BaseLayout.astro`:

```astro
const canonicalURL = new URL(path, Astro.site);
...
<link rel="canonical" href={canonicalURL}>
<meta property="og:url" content={canonicalURL}>
```

Ou seja: **canonical e og:url de todo o site saem de uma única variável** — `site` em
`astro.config.mjs`, combinada com a prop `path` de cada página (ex.:
`path="/reviews/dream-fitness-dr1600.html"`). Isso é relevante para o §11.

### 2.5 Comportamento de roteamento em produção (testado)

| Path | Resultado |
|---|---|
| `/reviews/dream-fitness-dr1600` | `200` |
| `/reviews/dream-fitness-dr1600.html` | redirect → versão sem `.html` |
| `/ml-dream`, `/ml-polimet`, `/ml-polimet-senior` | redirect 302 → host placeholder |
| `/ml-inexistente` | `404` ✅ (não há splat `/ml-*` → **sem open redirect hoje**) |
| `/go/mercadolivre/dream-fitness-dr1600` | `404` (rota ainda não existe) |
| `/pagina-que-nao-existe` | `404` ✅ |
| `/robots.txt`, `/sitemap.xml` | `200` |

O comportamento `.html → sem extensão` é o padrão do Cloudflare Pages com `build.format: 'file'`:
o `dist/reviews/x.html` é servido em `/reviews/x` e a URL com `.html` é redirecionada.

### 2.6 Inventário de páginas

| # | Path servido | Arquivo fonte | CTAs |
|---|---|---|---|
| 1 | `/` | `src/pages/index.astro` | **7** |
| 2 | `/reviews/dream-fitness-dr1600` | `.../reviews/dream-fitness-dr1600.astro` | **2** |
| 3 | `/reviews/polimet-ep1600` | `.../reviews/polimet-ep1600.astro` | **2** |
| 4 | `/reviews/polimet-ep1600-senior` | `.../reviews/polimet-ep1600-senior.astro` | **2** |
| 5 | `/guias/como-escolher` | `.../guias/como-escolher.astro` | 0 ⚠️ |
| 6 | `/guias/esteira-para-apartamento` | `.../guias/esteira-para-apartamento.astro` | 0 ⚠️ |
| 7 | `/aviso-legal` | `src/pages/aviso-legal.astro` | 0 |
| 8 | `/termos-de-uso` | `src/pages/termos-de-uso.astro` | 0 |
| 9 | `/politica-de-cookies` | `src/pages/politica-de-cookies.astro` | 0 |

Nenhum link para Amazon, Magalu, Americanas, Shopee ou qualquer outro marketplace.
Nenhuma URL de loja hardcoded em `.astro` — a regra do `CLAUDE.md` ("no `.astro` escreva o
caminho curto, nunca a URL da loja") **está sendo cumprida**.

### 2.7 Dados estruturados existentes (NÃO REMOVER)

Cada review passa `jsonLd` ao `BaseLayout`, que emite
`<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />`.

Valores reais em produção:

- DR-1600 → `Product` / `AggregateOffer` / `lowPrice 1939.00` / `highPrice 2199.00` / `offerCount 2`
- EP-1600 Sênior → `lowPrice 1579.00` / `highPrice 1699.00` / `offerCount 4`

### 2.8 Arquivos de configuração de borda

`public/_headers`:

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://esteiraergometrica.com/sitemap.xml
```

Sem `Disallow` para as rotas de redirect. **Precisa mudar (ver §11).**

---

## 3. PRODUTOS ENCONTRADOS

### 3.1 Dream Fitness DR-1600

```
Produto:            Esteira ergométrica Dream Fitness DR-1600
Marca:              Dream Fitness
Modelo:             DR-1600 / DR 1600
Slug:               dream-fitness-dr1600
Arquivo:            src/pages/reviews/dream-fitness-dr1600.astro
URL da review:      /reviews/dream-fitness-dr1600
Título da página:   Dream Fitness DR-1600 é boa? Análise, preço e reclamações
Preço exibido:      R$ 1.939 – R$ 2.199
Rota atual (CTA):   /ml-dream  (QUEBRADA)
Marketplace:        Mercado Livre
URL do anúncio:     https://www.mercadolivre.com.br/esteira-eletrica-dream-fitness-dr-1600-110v220v-dobravel-preto-127220v/p/MLB14733597
ID do anúncio:      MLB14733597  (página de CATÁLOGO/PDP)
Vendedor:           Loja oficial Dream Fitness (buy box em 07/09/2026)
Preço atual:        R$ 1.939,03 (melhor preço) | R$ 2.199,00 (12x sem juros Mercado Pago)
                    De R$ 3.035,88 — 36% OFF
Disponibilidade:    Estoque disponível — +10 mil vendidos — 4.6 ⭐ (2.029 avaliações)
Correspondência:    EXATA
Nível de confiança: ALTO (99%)
```

**Especificações — review vs. ficha do anúncio:**

| Spec | Review do site | Ficha técnica ML (MLB14733597) | Bate? |
|---|---|---|---|
| Potência | 1,6 HP | `Potência: 1,6 hp` | ✅ |
| Velocidade máx. | 9 km/h | `Velocidade máxima: 9 km/h` | ✅ |
| Superfície | 33 × 100 cm | `1 m × 33 cm` | ✅ |
| Peso máx. suportado | 110 kg | `110 kg` | ✅ |
| Peso do equipamento | ~25,6 kg | `25,65 kg` | ✅ |
| Dobrável | sim | `É dobrável: Sim` | ✅ |
| Amortecimento | sim (6 amortecedores) | `Com amortecimento: Sim` | ✅ |
| Voltagem | bivolt | `127/220V` | ✅ |
| Inclinação | 2 níveis manuais | não listado na ficha | ⚠️ não contradiz |
| Faixa de preço | R$ 1.939 – 2.199 | R$ 1.939,03 / R$ 2.199,00 | ✅ **casamento exato** |

A faixa da review reproduz exatamente os dois preços exibidos hoje nesse anúncio (melhor preço vs.
parcelamento sem juros) — evidência forte de que é o anúncio de origem.

---

### 3.2 Polimet EP-1600

```
Produto:            Esteira ergométrica Polimet EP-1600
Marca:              Polimet (também vendida sob a marca "Poli Sports")
Modelo:             EP-1600
Slug:               polimet-ep1600
Arquivo:            src/pages/reviews/polimet-ep1600.astro
URL da review:      /reviews/polimet-ep1600
Preço exibido:      R$ 1.449 – R$ 1.599 (review cita âncora irreal de R$ 2.447)
Rota atual (CTA):   /ml-polimet  (QUEBRADA)
URL do anúncio:     https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-polimet-dobravel-residencial-5-funcoes-ep-1600-preto/p/MLB65492201
ID do anúncio:      MLB65492201  (CATÁLOGO/PDP)
Vendedor:           REDE Marketplace (loja oficial Polimet)
Preço atual:        R$ 1.599,00 — de R$ 2.447,88 — 34% OFF — 12x R$ 133,25 sem juros
Disponibilidade:    Estoque disponível — 5.0 ⭐ — +5 vendidos
Correspondência:    EXATA
Nível de confiança: ALTO (95%)
```

**Por que este anúncio e não outro** — dois candidatos avaliados:

| Candidato | Marca na ficha | Vendedor | Preço | Inclinação | Vendas | Decisão |
|---|---|---|---|---|---|---|
| **MLB65492201** | **Polimet** | REDE Marketplace | **R$ 1.599** (de **R$ 2.447,88**) | `1 posição, manual` | +5 | ✅ **PRIMÁRIO** |
| MLB36882419 | Poli Sports | DGS COMERCIO | R$ 1.538 | não listada | +1000, 4.5⭐ | 🔸 alternativa |

Critério: a review afirma marca **Polimet**, cita literalmente a âncora **R$ 2.447** e descreve
**1 nível fixo de inclinação**. Os três batem com MLB65492201 e **apenas** com ele. MLB36882419 é
o mesmo equipamento sob a marca Poli Sports — serve de fallback, mas não é o anúncio descrito.

**Especificações — review vs. ficha (MLB65492201):**

| Spec | Review do site | Ficha técnica ML | Bate? |
|---|---|---|---|
| Potência | 1,6 HP (DC) | `1,6 hp` | ✅ |
| Velocidade máx. | 9 km/h | `9 km/h` | ✅ |
| Superfície | 33 × 100 cm | `1 m × 33 cm` | ✅ |
| Peso máx. suportado | 110 kg | `110 kg` | ✅ |
| Dimensões montada | 125 × 50 × 130 cm | `1.25 m x 50 cm x 1.3 m` | ✅ |
| Peso do equipamento | 24 kg | `24 kg` | ✅ |
| Inclinação | 1 nível fixo (4,05° ≈ 7%) | `1 posição / manual` | ✅ |
| Voltagem | 127/220V seleção manual | `127/220V` | ✅ |
| Programas | 5 funções | `5 programas` | ✅ |
| Preço | R$ 1.449 – 1.599 / âncora 2.447 | R$ 1.599 / de R$ 2.447,88 | ✅ **exato** |

---

### 3.3 Polimet EP-1600 Sênior

```
Produto:            Esteira ergométrica Polimet EP-1600 Sênior
Marca:              Polimet / Poli Sports
Modelo:             EP-1600 Sênior
Slug:               polimet-ep1600-senior
Arquivo:            src/pages/reviews/polimet-ep1600-senior.astro
URL da review:      /reviews/polimet-ep1600-senior
Preço exibido:      R$ 1.579 – R$ 1.699
Rota atual (CTA):   /ml-polimet-senior  (QUEBRADA)
URL do anúncio:     https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-residencial-ep-1600-senior-16hp-poli-sports/p/MLB20620342
ID do anúncio:      MLB20620342  (CATÁLOGO/PDP)
Vendedor:           DGS COMERCIO — Loja oficial REDE Marketplace
Preço atual:        R$ 1.649,00
Disponibilidade:    Estoque disponível — +500 vendidos — 4.7 ⭐
Correspondência:    EXATA
Nível de confiança: ALTO (95%)
```

**Por que este anúncio e não outro:**

| Candidato | Marca | Vendedor | Preço | Dentro da faixa (1.579–1.699)? | Decisão |
|---|---|---|---|---|---|
| **MLB20620342** | Poli Sports | DGS COMERCIO | **R$ 1.649** | ✅ sim | ✅ **PRIMÁRIO** |
| MLB63437712 | Polimet | fithome1 | R$ 2.021 | ❌ 19% acima do teto | ❌ descartado |

**Especificações — review vs. ficha (MLB20620342):**

| Spec | Review do site | Ficha técnica ML | Bate? |
|---|---|---|---|
| Modelo | EP-1600 Sênior | `Modelo: EP-1600 Sênior` | ✅ |
| Potência | 1,6 HP | `1,6 hp` | ✅ |
| Velocidade máx. | 9 km/h | `9 km/h` | ✅ |
| Peso máx. suportado | 110 kg | `110 kg` | ✅ |
| Dimensões montada | 125 × 50 × 130 cm | `1.25 m x 50 cm x 1.3 m` | ✅ |
| Superfície | — | `95 cm × 33 cm` (5 cm menor que a padrão) | ℹ️ diferença real |
| **Dobra?** | "indício de que **não**" | **`É dobrável: Não`** | ✅ **confirma a review** |
| Amortecimento | — | `Com amortecimento: Sim` | ℹ️ |
| Preço | R$ 1.579 – 1.699 | R$ 1.649 | ✅ dentro da faixa |

> 📌 **Achado editorial:** a review levanta como *indício* que a Sênior não dobra. A ficha técnica
> oficial confirma: **`É dobrável: Não`**. Vale promover de "indício" a fato, citando a ficha.
> Tarefa **editorial**, fora do escopo desta implementação — anotar no backlog.

---

## 4. LINKS ATUAIS DO MERCADO LIVRE ENCONTRADOS NO SITE

Nenhum link direto para `mercadolivre.com.br` existe em `src/`. Os 13 CTAs apontam para rotas
internas, resolvidas em `public/_redirects`:

| Rota interna | Destino em `_redirects` | Estado |
|---|---|---|
| `/ml-dream` | `https://SUBSTITUIR-PELO-SEU-LINK-DE-AFILIADO` (302) | ❌ **QUEBRADO — DNS inexistente** |
| `/ml-polimet` | `https://SUBSTITUIR-PELO-SEU-LINK-DE-AFILIADO` (302) | ❌ **QUEBRADO** |
| `/ml-polimet-senior` | `https://SUBSTITUIR-PELO-SEU-LINK-DE-AFILIADO` (302) | ❌ **QUEBRADO** |

Nenhum link duplicado com destinos divergentes. Nenhum produto com link "errado" — todos estão
igualmente quebrados.

---

## 5. LINKS DE AFILIADO — GERADOS E VALIDADOS

Gerados em **07/09/2026** no painel de Afiliados do Mercado Livre da conta do Rafael, via
**Barra de afiliados → "Compartilhar" → modal "Gerar link / ID de produto"**.
Etiqueta de rastreamento: **`pelicano`**.

| Slug | Anúncio ML | `affiliateUrl` | ID de produto (afiliado) | Ganhos |
|---|---|---|---|---|
| `dream-fitness-dr1600` | MLB14733597 | `https://meli.la/2J8ihmd` | `HAPWBH-9U6G` | **16%** |
| `polimet-ep1600` | MLB65492201 | `https://meli.la/1epCpV7` | `HAPWBH-48VM` | **16%** |
| `polimet-ep1600-senior` | MLB20620342 | `https://meli.la/1tSuqej` | `HAPWBH-U2C9` | **16%** |

### 5.1 Validação executada

`https://meli.la/2J8ihmd` foi aberto e seguido até o destino final. Expandiu para:

```
https://www.mercadolivre.com.br/social/rmt
  ?matt_word=pelicano
  &matt_tool=78086568
  &forceInApp=true
  &ref=<token cifrado, opaco, ~200 chars>
```

A página exibiu corretamente **"Esteira Elétrica Dream Fitness Dr 1600 110v/220v Dobrável Preto
127/220v — R$ 1.939 — 36% OFF"** com botão "Ir para produto". ✅ Produto certo, atribuição presente.

### 5.2 Anatomia do link (decisivo para a arquitetura)

| Parâmetro | Valor | Significado |
|---|---|---|
| `matt_word` | `pelicano` | **etiqueta de rastreamento** — aparece na dimensão "Etiquetas de rastreamento" do dashboard de Métricas |
| `matt_tool` | `78086568` | identificador da ferramenta de geração |
| `forceInApp` | `true` | força abertura no app ML quando instalado |
| `ref` | token cifrado opaco | payload com produto + afiliado. **Não é derivável nem construível.** |

> ⚠️ Como `ref` é um token cifrado gerado pelo servidor do Mercado Livre, **é impossível montar um
> link de afiliado por concatenação de string**. Não existe `url + "?aff=pelicano"`. Cada link
> precisa ser gerado no painel e **armazenado** — exatamente o que a estrutura do §7 faz.

### 5.3 Interstitial de "Perfil Social" — **NÃO CONFIRMADO**

O link caiu numa página intermediária de Perfil Social ("Recomenda Produto") com botão "Ir para
produto", e não direto na PDP. É consistente com o item 1.6 dos Termos.

**Não foi confirmado** se um visitante **deslogado** vê o mesmo interstitial, ou se ele aparece só
porque a sessão de teste estava logada como o próprio afiliado.

**Como confirmar** (Rafael, 30 segundos): abrir `https://meli.la/2J8ihmd` em **janela anônima**.
Se o interstitial aparecer para o público geral, há um clique extra de custo de conversão — mas
**não existe formato alternativo de link** oferecido pela barra; o modal expõe só o `meli.la` e o
ID de produto.

---

## 6. PRODUTOS SEM LINK / GAPS

| Item | Situação | Ação |
|---|---|---|
| `/guias/como-escolher` | 0 CTAs | Guia de compra sem monetização. **Não implementar agora** — decisão editorial. Backlog. |
| `/guias/esteira-para-apartamento` | 0 CTAs | Idem. |
| Cadastro do site como "Mídia" no ML | **PENDENTE — BLOQUEANTE COMERCIAL** | §6.1 |
| Domínio `esteiraergometrica.com` | não resolve | §11.1 |

### 6.1 ⚠️ BLOQUEANTE: o site precisa estar cadastrado como Mídia no Mercado Livre

**Item 1.3 dos Termos** (`mercadolivre.com.br/ajuda/30228`), texto oficial:

> "Serão consideradas Mídias para os fins do Programa, as mídias sociais, sites e blogs pessoais
> **informados pelo Afiliado ao Mercado Livre antes do seu início no Programa**, sendo que,
> **qualquer divulgação em outro site e/ou mídia diversa, não será considerada para fins de
> participação no Programa e não gerará pagamentos de resultados.**"

No painel visitado em 07/09/2026, o **Perfil de afiliado** (`/afiliados/perfil`, nome "Recomenda
Produto") estava com **nenhum site ou rede cadastrada** — TikTok, Instagram, YouTube, Facebook, X
e "Otra red" todos vazios.

**Ação para o Rafael:** cadastrar o site em `Afiliados e criadores → Perfil de afiliado →
Otra red → Adicionar`. Enquanto isso não for feito, **a comissão pode não ser paga mesmo com os
links funcionando**.

---

## 7. ESTRUTURA DE DADOS

### 7.1 Fonte única de verdade

Criar **`src/data/affiliates.ts`** (TypeScript, coerente com o `tsconfig.json` e com as
`export interface Props` já usadas nos layouts). Schema obrigatório:

```ts
export type LinkMode = 'redirect' | 'direct';

export interface Merchant {
  label: string;
  allowedHosts: string[];
}

export interface AffiliateProduct {
  merchant: string;
  title: string;
  listingId: string;
  productUrl: string;
  affiliateUrl: string;
  affiliateProductId?: string;
  trackingTag?: string;
  enabled: boolean;
  verifiedAt: string;
  notes?: string;
}

export const linkMode: LinkMode = 'redirect';

export const merchants: Record<string, Merchant> = {
  mercadolivre: {
    label: 'Mercado Livre',
    allowedHosts: [
      'meli.la',
      'www.mercadolivre.com.br',
      'mercadolivre.com.br',
      'produto.mercadolivre.com.br',
    ],
  },
};

export const products: Record<string, AffiliateProduct> = {
  'dream-fitness-dr1600': {
    merchant: 'mercadolivre',
    title: 'Dream Fitness DR-1600',
    listingId: 'MLB14733597',
    productUrl: 'https://www.mercadolivre.com.br/esteira-eletrica-dream-fitness-dr-1600-110v220v-dobravel-preto-127220v/p/MLB14733597',
    affiliateUrl: 'https://meli.la/2J8ihmd',
    affiliateProductId: 'HAPWBH-9U6G',
    trackingTag: 'pelicano',
    enabled: true,
    verifiedAt: '2026-09-07',
    notes: 'Catálogo/PDP. Loja oficial Dream Fitness. Specs batem 100% com a review.',
  },
  'polimet-ep1600': {
    merchant: 'mercadolivre',
    title: 'Polimet EP-1600',
    listingId: 'MLB65492201',
    productUrl: 'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-polimet-dobravel-residencial-5-funcoes-ep-1600-preto/p/MLB65492201',
    affiliateUrl: 'https://meli.la/1epCpV7',
    affiliateProductId: 'HAPWBH-48VM',
    trackingTag: 'pelicano',
    enabled: true,
    verifiedAt: '2026-09-07',
    notes: 'Marca Polimet, REDE Marketplace. Alternativa Poli Sports: MLB36882419 (sem link gerado).',
  },
  'polimet-ep1600-senior': {
    merchant: 'mercadolivre',
    title: 'Polimet EP-1600 Sênior',
    listingId: 'MLB20620342',
    productUrl: 'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-residencial-ep-1600-senior-16hp-poli-sports/p/MLB20620342',
    affiliateUrl: 'https://meli.la/1tSuqej',
    affiliateProductId: 'HAPWBH-U2C9',
    trackingTag: 'pelicano',
    enabled: true,
    verifiedAt: '2026-09-07',
    notes: "Ficha confirma 'É dobrável: Não', validando a hipótese da review.",
  },
};
```

### 7.2 Helper de CTA (o que os `.astro` importam)

No mesmo arquivo:

```ts
/** Devolve o href que o CTA deve usar. Lança em build se o slug não existir. */
export function buyHref(slug: string): string {
  const p = products[slug];
  if (!p) throw new Error(`[affiliates] slug desconhecido: ${slug}`);
  if (!p.enabled) throw new Error(`[affiliates] slug desabilitado usado em CTA: ${slug}`);
  assertAllowed(p);                       // valida host em build time
  return linkMode === 'direct'
    ? p.affiliateUrl
    : `/go/${p.merchant}/${slug}`;
}
```

**Lançar erro em build time é intencional:** um slug errado quebra `npm run build`, não a
produção. É o equivalente estático do 404 dinâmico.

### 7.3 Regras do schema

- A chave (slug) **deve** casar com o nome do arquivo em `src/pages/reviews/`.
  Validar com `^[a-z0-9][a-z0-9-]{0,63}$`.
- `affiliateUrl` obrigatório quando `enabled: true`.
- `productUrl` — URL não-afiliada, guardada para auditoria e regeração futura do link.
- `enabled: false` — o produto some do `_redirects` gerado (a rota passa a 404 naturalmente) e
  qualquer CTA que o referencie quebra o build. Correto: link morto nunca vai ao ar.
- `verifiedAt` — data da última conferência de preço/disponibilidade.
- **Nenhum segredo, token, Client ID ou Client Secret.** Não há nenhum neste projeto e não deve
  passar a haver. Links `meli.la` são públicos por natureza.

---

## 8. ROTAS

### 8.1 Como as rotas nascem neste projeto

O site é **estático**. Não há roteador em runtime. A rota `/go/mercadolivre/<slug>` vira
**uma linha em `public/_redirects`**, e essas linhas são **geradas a partir de
`src/data/affiliates.ts`** — nunca escritas à mão.

Resultado esperado do arquivo gerado:

```
# GERADO AUTOMATICAMENTE por scripts/gen-redirects.mjs — NÃO EDITE À MÃO.
# Fonte: src/data/affiliates.ts  ·  Gerado em: <data>
# 302 = redirecionamento temporário, correto para links comerciais.

/go/mercadolivre/dream-fitness-dr1600    https://meli.la/2J8ihmd    302
/go/mercadolivre/polimet-ep1600          https://meli.la/1epCpV7    302
/go/mercadolivre/polimet-ep1600-senior   https://meli.la/1tSuqej    302

# Rotas legadas — mantidas para links externos antigos.
/ml-dream           /go/mercadolivre/dream-fitness-dr1600     301
/ml-polimet         /go/mercadolivre/polimet-ep1600           301
/ml-polimet-senior  /go/mercadolivre/polimet-ep1600-senior    301
```

### 8.2 Mecanismo de geração — escolher **uma** abordagem

O Claude Code deve verificar qual funciona na versão de Astro instalada e escolher. Ordem de
preferência:

| Opção | Como | Prós | Contras |
|---|---|---|---|
| **A (recomendada)** | script `scripts/gen-redirects.mjs`, chamado por `"prebuild"` no `package.json`, que escreve `public/_redirects` | simples, sem plugin, funciona em qualquer versão; `dev` e `build` veem o mesmo arquivo | arquivo gerado fica versionado em `public/` |
| B | hook `astro:build:done` em `astro.config.mjs`, escrevendo `dist/_redirects` | nada gerado dentro de `public/` | não existe durante `astro dev` |

Se escolher **A**, o `prebuild` roda automaticamente antes de `npm run build`.
Se escolher **B**, é obrigatório documentar que `_redirects` não existe em `astro dev`.

⚠️ **`src/pages/_redirects.ts` NÃO funciona** — Astro exclui do roteamento qualquer arquivo em
`src/pages/` começando com `_`. Não tentar.

### 8.3 Validações que o gerador **deve** executar (falhar o build se violadas)

Como as linhas são estáticas, a validação sai do runtime e vai para o build:

1. Slug casa com `^[a-z0-9][a-z0-9-]{0,63}$`.
2. `merchant` existe em `merchants`.
3. `new URL(affiliateUrl)` não lança.
4. `protocol === 'https:'`.
5. `hostname.toLowerCase()` está em `merchants[merchant].allowedHosts` por **igualdade exata**.
6. Nenhum slug duplicado.
7. Todo produto `enabled` tem `affiliateUrl` não-vazio.

Qualquer violação → `process.exit(1)` com mensagem clara. Link inválido nunca chega ao `dist/`.

### 8.4 Regras de forma

- ✅ Redirect de produto: **302**. Redirect legado: **301**.
- ❌ **Proibido usar splat ou placeholder**: nada de `/go/mercadolivre/* https://... 302`, nada de
  `/go/:merchant/:slug`. Uma linha explícita por produto. Splat reintroduziria a superfície de
  open redirect que hoje não existe.
- ❌ Não criar `/go` ou `/go/mercadolivre` como página. Sem regra, o Cloudflare Pages devolve 404
  sozinho — que é o comportamento desejado.
- ❌ Não criar página HTML intersticial ("redirecionando…"). Redirect é HTTP puro, sem JS —
  regra do `CLAUDE.md` sobre não enviar JS ao cliente vale aqui também.
- ✅ Manter as três rotas legadas. Qualquer outro `/ml-*` continua 404 — não criar splat `/ml-*`.

### 8.5 CTAs — substituição

Trocar os hrefs literais por chamadas ao helper, para que a fonte única valha também no HTML:

**`src/pages/reviews/dream-fitness-dr1600.astro`**

```astro
---
import { buyHref } from '../../data/affiliates';
const href = buyHref('dream-fitness-dr1600');
---
<ReviewLayout ... buyHref={href} ... >
  ...
  <p style="margin-top:2.5rem"><a class="buy" href={href} rel="sponsored nofollow" target="_blank">Ver preço no Mercado Livre</a></p>
```

**`src/pages/index.astro`** — importar o helper uma vez no frontmatter e usar nas 7 ocorrências.

Mapeamento:

| De | Para |
|---|---|
| `/ml-dream` | `buyHref('dream-fitness-dr1600')` → `/go/mercadolivre/dream-fitness-dr1600` |
| `/ml-polimet` | `buyHref('polimet-ep1600')` → `/go/mercadolivre/polimet-ep1600` |
| `/ml-polimet-senior` | `buyHref('polimet-ep1600-senior')` → `/go/mercadolivre/polimet-ep1600-senior` |

**Só o href muda.** Preservar `class="buy"` / `class="mini-cta"` / `class="btn btn-primary…"`,
`rel="sponsored nofollow"`, `target="_blank"` e o texto visível de cada botão.

Se algum CTA tiver `target="_blank"` sem `noopener`, **adicionar** ao `rel` existente
(`rel="sponsored nofollow noopener"`). É a única melhoria de markup autorizada.

> 📎 Ao terminar, **atualizar a seção "Links de afiliado" do `CLAUDE.md`**: a instrução hoje diz
> "no `.astro` escreva o caminho curto (`/ml-polimet`)". Passa a ser: "no `.astro` use
> `buyHref('<slug>')` de `src/data/affiliates.ts`; nunca escreva caminho nem URL de loja à mão".

---

## 9. ARQUIVOS

```
CRIAR:
  src/data/affiliates.ts        registro único + helper buyHref() (schema do §7)
  scripts/gen-redirects.mjs     gerador de public/_redirects a partir do registro (§8.2 opção A)
  AFFILIATE_IMPLEMENTATION.md   este documento, na raiz do repo

MODIFICAR:
  package.json                  adicionar "prebuild": "node scripts/gen-redirects.mjs"
  public/_redirects             passa a ser GERADO (cabeçalho de aviso obrigatório)
  public/robots.txt             adicionar Disallow: /go/  e  Disallow: /ml-
  public/_headers               tentar bloco /go/* com X-Robots-Tag (verificar — ver §11.3)
  src/pages/index.astro         7 CTAs → buyHref()
  src/pages/reviews/dream-fitness-dr1600.astro        buyHref prop + 1 CTA inline
  src/pages/reviews/polimet-ep1600.astro              idem
  src/pages/reviews/polimet-ep1600-senior.astro       idem
  CLAUDE.md                     atualizar a seção "Links de afiliado"

NÃO MODIFICAR:
  astro.config.mjs              (exceto a decisão de `site` do §11.1, SE autorizada)
  src/layouts/BaseLayout.astro  canonical, og, JSON-LD — não tocar
  src/layouts/ReviewLayout.astro  markup do CTA já está correto; só o valor de buyHref muda
  src/layouts/ArticleLayout.astro
  src/components/*.astro
  src/styles.css                nenhuma mudança visual nesta task
  public/sitemap.xml            as rotas /go/ NÃO entram no sitemap
  src/pages/guias/*.astro       (0 CTAs hoje — é decisão editorial, não desta task)
  src/pages/aviso-legal.astro · termos-de-uso.astro · politica-de-cookies.astro
  qualquer conteúdo editorial, preço, especificação ou JSON-LD
```

---

## 10. REGRAS DE IMPLEMENTAÇÃO

1. **Ler `CLAUDE.md` primeiro.** As regras de lá continuam valendo — em especial: nunca inventar
   dado técnico, preço é faixa, nenhum JS de interatividade no cliente, nenhum CSS novo, rodar
   `npm run build` antes de commitar.
2. **Confirmar tudo do §2 no repositório real** antes de editar. Se algo divergir, reportar.
3. **Uma fonte de verdade.** Nenhum link de afiliado hardcoded em `.astro`, em `_redirects` ou em
   qualquer outro lugar além de `src/data/affiliates.ts`.
4. **Sem dependências novas.** O gerador usa apenas `node:fs` e `node:path`. Se precisar ler o
   `.ts` a partir do `.mjs`, prefira: (a) exportar os dados também como JSON gerado, ou
   (b) manter o registro em `.ts` e o gerador importar via `tsx`/`astro`… — **se qualquer
   alternativa exigir dependência, PERGUNTE antes.** Uma saída sem dependência é manter o registro
   em `src/data/affiliates.mjs` e um `affiliates.ts` fino que reexporta com tipos. Decidir e
   justificar.
5. **Sem variáveis de ambiente, sem secrets.**
6. **Sem telemetria, pixel ou analytics** — a `politica-de-cookies.astro` afirma hoje que não há
   cookie de rastreamento próprio, e isso não pode deixar de ser verdade.
7. **Preservar o 404 atual** para rotas desconhecidas.
8. **Não tocar em conteúdo editorial.**
9. **Idempotência.** Rodar duas vezes não pode duplicar linhas em `_redirects` nem CTAs.
10. **Confirmar antes de operações destrutivas:** apagar arquivos em massa, alterar
    `astro.config.mjs`, mexer em DNS ou configuração do Cloudflare Pages, alterar `sitemap.xml`,
    remover rotas, fazer deploy, qualquer comando irreversível.
11. **Não parar em "implementado".** Ciclo obrigatório:
    ANALISAR → PLANEJAR → IMPLEMENTAR → TESTAR → ENCONTRAR ERROS → CORRIGIR → TESTAR → BUILD →
    AUDITORIA FINAL.
12. **Varredura final:** `grep -rn "ml-dream\|ml-polimet\|SUBSTITUIR-PELO-SEU-LINK" src/ public/`
    → zero ocorrências fora do mapa legado gerado.

---

## 11. SEO

### 11.1 ⚠️ ACHADO CRÍTICO PRÉ-EXISTENTE (não causado por esta task)

`astro.config.mjs` declara:

```js
site: 'https://esteiraergometrica.com',
```

`BaseLayout.astro` deriva **canonical e og:url de todas as 9 páginas** dessa constante. O
`public/sitemap.xml` e o `public/robots.txt` também apontam para o mesmo domínio.

**`esteiraergometrica.com` não resolve em DNS** (confirmado em 07/09/2026 por fetch e navegação).
Rafael confirmou: **domínio ainda não configurado**. O `CLAUDE.md` registra que é um domínio
expirado readquirido, com autoridade residual (PA 23 / DA 11) — o que torna a configuração dele
ainda mais valiosa e o problema mais urgente.

Enquanto isso durar, o site diz ao Google "a versão oficial está em outro endereço" — e esse
endereço está morto.

Dois caminhos, e **a escolha é do Rafael**:

| Opção | O que fazer | Quando faz sentido |
|---|---|---|
| **A — configurar o domínio** (recomendada) | apontar `esteiraergometrica.com` para o projeto no Cloudflare Pages | domínio já registrado, lançamento iminente — preserva a autoridade residual |
| **B — canonical temporário** | trocar `site` em `astro.config.mjs` para o host `.workers.dev` e ajustar `sitemap.xml` + `robots.txt` | se o domínio ainda vai demorar |

> ⛔ O Claude Code **NÃO deve executar nenhuma das duas por conta própria.** Reportar o achado,
> apresentar as opções e **aguardar decisão explícita**. É uma linha de código, mas é uma decisão
> de negócio com impacto direto na indexação.

### 11.2 Achado secundário: canonical aponta para URL que redireciona

`build.format: 'file'` gera `dist/reviews/x.html`, e as páginas passam `path=".../x.html"` — então
o canonical é `https://esteiraergometrica.com/reviews/dream-fitness-dr1600.html`. Mas o Cloudflare
Pages serve o conteúdo em `/reviews/dream-fitness-dr1600` e **redireciona** a versão `.html` para
ela. Canonical apontando para URL de redirect é sinal fraco. Os links internos entre reviews
também usam `.html` e gastam um hop de crawl.

Corrigir envolveria mexer em `build.format` ou nas props `path` — **mudança de URL, com risco real
para um domínio com autoridade residual**. Fora do escopo. **Reportar, não corrigir.**

### 11.3 Regras não-negociáveis desta implementação

- ❌ Não alterar nenhuma URL existente de review, guia ou página legal.
- ❌ Não alterar `<title>`, `description`, `ogTitle`, `ogDescription` de nenhuma página.
- ❌ Não alterar `BaseLayout.astro` (canonical / og / JSON-LD).
- ❌ Não alterar nenhum objeto `jsonLd`.
- ❌ Não adicionar `/go/` ao `public/sitemap.xml` (mantido à mão — deve continuar com 9 URLs).
- ❌ Não criar página indexável para `/go/`.
- ✅ Manter `rel="sponsored nofollow"` em todos os 13 CTAs — exigência do Google e regra explícita
  do `CLAUDE.md`.
- ✅ `public/robots.txt` passa a ser:

  ```
  User-agent: *
  Allow: /
  Disallow: /go/
  Disallow: /ml-

  Sitemap: https://esteiraergometrica.com/sitemap.xml
  ```

  (a linha `Sitemap:` só muda se a opção B do §11.1 for autorizada)

- ⚠️ **`X-Robots-Tag` em `_headers` — verificar, não assumir.** Adicionar ao `public/_headers`:

  ```
  /go/*
    X-Robots-Tag: noindex, nofollow
    Cache-Control: no-store
  ```

  **NÃO CONFIRMADO** se o Cloudflare Pages aplica regras de `_headers` a respostas geradas por
  `_redirects`. Verificar com `curl -I` no preview. Se não aplicar, **não insistir**: o
  `Disallow` do `robots.txt` é o controle efetivo, e um 302 não é indexado na prática. Registrar o
  resultado do teste no relatório final.

- ✅ **Core Web Vitals:** a mudança não adiciona JS, CSS, fonte nem request. O HTML final difere
  apenas no valor de 13 atributos `href`. LCP/CLS/INP não devem mudar. Confirmar no Lighthouse.

---

## 12. SEGURANÇA

### 12.1 Conformidade com os Termos do Programa — leia antes de codar

`mercadolivre.com.br/ajuda/30228`, **item 1.8 — "Manipulação de Links Especiais"**:

> "O Afiliado não poderá utilizar qualquer serviço de corte **'shorteners'**, edição ou
> modificação dos Links Especiais, bem como incluir algum botão, hiperlink ou qualquer outra
> ferramenta **de modo que não fique claro que os Links Especiais estão relacionados ao Site e
> Domínio do Mercado Livre**."

**Item 1.10 — "Cookies"**:

> "O Afiliado somente definirá cookies se os Links Especiais ou as Ferramentas de Atribuição forem
> **visíveis** nas Mídias e a Pessoa usuária clicar **voluntária e conscientemente**. O uso de
> camadas, add-ons, iFrames, pop-up, pop-under, site-under, anúncios que automaticamente
> redirecionem a Pessoa usuária para o Site sem o envolvimento ou ação da Pessoa usuária, queda de
> cookies, tecnologia de pós-visualização […] são estritamente proibidos."

**Leitura honesta do risco:** uma rota `/go/` própria não é encurtador de terceiros e não modifica
o Link Especial — ele vai intacto no `Location`. Mas uma leitura estrita do 1.8 poderia enquadrar
qualquer camada intermediária. O site **já usa esse padrão hoje** (`/ml-*`), então a implementação
não introduz risco novo — mas o risco existe e o Rafael precisa saber.

**Mitigações obrigatórias:**

| # | Mitigação | Por quê |
|---|---|---|
| M1 | CTA das reviews mantém "Mercado Livre" no texto | deixa claro o destino (1.8) |
| M2 | Adicionar `title="Ir para o anúncio no Mercado Livre"` nos 7 CTAs da home, cujo texto é só "Ver melhor preço" | esses são os mais expostos ao 1.8 |
| M3 | Redirect de produto **302**, nunca 301 | não é cacheado permanentemente; link revogável |
| M4 | Redirect só em resposta a clique humano — sem `<meta refresh>`, sem redirect automático, sem iframe | 1.10 |
| M5 | Manter a disclosure de afiliado visível (já existe em `/aviso-legal` e na seção 10 do padrão editorial) | 1.10 + boa prática |
| M6 | Nenhum cookie próprio | 1.10 — e a `politica-de-cookies.astro` afirma que não há |
| M7 | `affiliateUrl` repassado **byte a byte**, sem encurtar, mascarar ou acrescentar parâmetro | 1.8 |

**Flag de escape (implementar):** `linkMode` no registro:

- `'redirect'` (padrão) — CTA aponta para `/go/mercadolivre/<slug>`;
- `'direct'` — `buyHref()` devolve o `affiliateUrl`, injetado direto no `href`.

Assim, risco zero na cláusula 1.8 é **uma linha de config**, não um refactor. Implementar as duas
modalidades; deixar `'redirect'` ativo.

### 12.2 Open redirect

Neste projeto a superfície é **estruturalmente zero**, e precisa continuar assim:

- ✅ Os destinos são **linhas estáticas** em `_redirects`. Não há input do usuário em lugar nenhum.
- ❌ **NUNCA** usar splat/placeholder (`/go/mercadolivre/*`, `/go/:merchant/:slug`) — isso
  reintroduziria destino derivado de input.
- ❌ **NUNCA** usar `:splat` na URL de destino.
- ✅ A allowlist é aplicada **em build time** pelo gerador (§8.3), com **igualdade exata** de
  hostname:

  ```js
  const host = new URL(p.affiliateUrl).hostname.toLowerCase();
  if (!allowedHosts.includes(host)) fail(`host não permitido: ${host}`);
  ```

- ❌ **PROIBIDO** `host.endsWith('mercadolivre.com.br')` — `evilmercadolivre.com.br` passaria.
- ❌ **PROIBIDO** `url.includes('meli.la')` — `https://evil.com/?x=meli.la` passaria.
- ✅ Exigir `protocol === 'https:'`.
- ✅ `new URL()` que lance → build falha, link não vai ao ar.

### 12.3 Demais requisitos

- Nenhum token, Client ID ou Client Secret existe — e nenhum deve ser introduzido.
- Nenhum dado pessoal do visitante é coletado, logado ou armazenado.
- Slug inexistente, desabilitado ou inválido: build falha (se usado em CTA) ou a rota simplesmente
  não existe em `_redirects` e o Pages devolve 404. Nunca um redirect para lugar errado.
- `Cache-Control: no-store` na resposta `/go/*` — para que trocar um link tenha efeito imediato.
  Sujeito à mesma verificação do §11.3.

---

## 13. TESTES

Não existe test runner configurado. **Não adicionar dependência sem perguntar.**
Abordagem padrão: um script de verificação em Node puro, `scripts/check-affiliates.mjs`, rodado
por `npm run check`. Se preferir `node --test` (nativo, sem dependência), também serve.

### 13.1 Validação do registro (roda no gerador e/ou no check)

| # | Cenário | Esperado |
|---|---|---|
| T01 | Todo slug casa com `^[a-z0-9][a-z0-9-]{0,63}$` | ok |
| T02 | Nenhum slug duplicado | ok |
| T03 | Todo `merchant` existe em `merchants` | ok |
| T04 | Todo produto `enabled` tem `affiliateUrl` não-vazio | ok |
| T05 | Todo `affiliateUrl` é URL válida | ok |
| T06 | Todo `affiliateUrl` usa `https:` | ok |
| T07 | Todo host está na allowlist por igualdade exata | ok |
| T08 | `affiliateUrl` com `https://evil.com/x` | **build falha** |
| T09 | Host que *termina* com domínio permitido (`https://evilmeli.la/x`) | **build falha** |
| T10 | Host que *contém* domínio permitido (`https://evil.com/?u=meli.la`) | **build falha** |
| T11 | `http://meli.la/x` | **build falha** |
| T12 | `affiliateUrl` não-parseável | **build falha**, sem stack trace feio |
| T13 | `buyHref('slug-inexistente')` | **lança**, build falha |
| T14 | `buyHref` de produto `enabled:false` | **lança**, build falha |

### 13.2 Integridade entre registro e páginas

| # | Verificação |
|---|---|
| T15 | Todo slug do registro tem `src/pages/reviews/<slug>.astro` correspondente |
| T16 | Toda review com CTA tem slug no registro |
| T17 | Nenhuma string `SUBSTITUIR-PELO-SEU-LINK` sobrou no repositório |
| T18 | Nenhum `href="/ml-` sobrou em `src/` |
| T19 | Nenhuma URL `meli.la` aparece em `src/pages/` ou `src/layouts/` (só em `src/data/`) |

### 13.3 `_redirects` gerado

| # | Verificação |
|---|---|
| T20 | Contém exatamente 3 linhas `/go/mercadolivre/…` com destino 302 correto |
| T21 | Contém exatamente 3 linhas legadas `/ml-*` com 301 para as rotas novas |
| T22 | **Nenhuma linha contém `*` ou `:splat`** |
| T23 | Cabeçalho "GERADO AUTOMATICAMENTE" presente |
| T24 | Rodar o gerador duas vezes produz arquivo idêntico (idempotência) |

### 13.4 Build e HTML de saída

| # | Verificação |
|---|---|
| T25 | `npm run build` termina sem erro |
| T26 | `dist/` contém as 9 páginas |
| T27 | `dist/_redirects` presente e igual ao gerado |
| T28 | Contagem de CTAs em `dist/`: **13** (nem mais, nem menos) |
| T29 | Distribuição em `dist/`: `dream-fitness-dr1600` ×4, `polimet-ep1600` ×5, `polimet-ep1600-senior` ×4 |
| T30 | Todo CTA em `dist/` tem `rel` contendo `sponsored` e `nofollow` |
| T31 | Todo CTA com `target="_blank"` tem `noopener` no `rel` |
| T32 | Texto visível de cada CTA inalterado |
| T33 | Zero CTAs apontando para `/ml-*` em `dist/` |
| T34 | Cada `<link rel="canonical">` em `dist/` idêntico ao baseline |
| T35 | Cada `<title>` e `<meta name="description">` em `dist/` idêntico ao baseline |
| T36 | Cada bloco `application/ld+json` presente e JSON válido, idêntico ao baseline |
| T37 | `dist/sitemap.xml` com 9 URLs, zero `/go/` |
| T38 | `dist/robots.txt` com os dois `Disallow` |

### 13.5 Comportamento HTTP (`npm run preview` ou `wrangler pages dev dist`)

> ⚠️ `astro preview` **não interpreta `_redirects`** — ele é um servidor estático do Astro, não o
> Cloudflare Pages. Para testar redirects de verdade use `npx wrangler pages dev dist`. Se
> `wrangler` não estiver instalado, **não instalar sem perguntar** — nesse caso, validar o
> conteúdo do arquivo `_redirects` (§13.3) e deixar o teste HTTP para o preview do Cloudflare
> após o deploy.

| # | Verificação |
|---|---|
| T39 | `/go/mercadolivre/dream-fitness-dr1600` → 302 → `https://meli.la/2J8ihmd` |
| T40 | `/go/mercadolivre/polimet-ep1600` → 302 → `https://meli.la/1epCpV7` |
| T41 | `/go/mercadolivre/polimet-ep1600-senior` → 302 → `https://meli.la/1tSuqej` |
| T42 | `/go/mercadolivre/nao-existe` → 404 |
| T43 | `/go/amazon/dream-fitness-dr1600` → 404 |
| T44 | `/go/` e `/go/mercadolivre` → 404 |
| T45 | `/ml-dream` → 301 → `/go/mercadolivre/dream-fitness-dr1600` |
| T46 | `/ml-qualquer-coisa` → 404 |
| T47 | `?url=https://evil.com` na rota `/go/` → destino continua o do registro |
| T48 | As 9 páginas → 200 |
| T49 | `/reviews/*.html` → ainda redireciona para a versão sem extensão |
| T50 | `X-Robots-Tag` na resposta 302: presente ou ausente — **registrar o resultado**, não forçar |

---

## 14. VALIDAÇÃO

Executar **na ordem**.

### 14.1 Baseline (ANTES de qualquer alteração)

```bash
npm install
npm run build
cp -r dist ../dist-baseline
```

O baseline é o que torna possível provar, com `diff`, que canonical, title, description e JSON-LD
não mudaram.

### 14.2 Build e verificação

```bash
npm run check      # se criado — validação do registro (§13.1)
npm run build      # deve terminar limpo; o prebuild gera public/_redirects
```

Sem linter nem typecheck configurados no projeto. **Não adicionar** — se quiser sanidade de
tipos, `npx astro check` só se já estiver disponível; caso contrário, perguntar.

### 14.3 Diff contra o baseline (o teste mais importante de SEO)

```bash
diff -r ../dist-baseline dist | head -80
```

As **únicas** diferenças aceitáveis:

- valores de `href` nos 13 CTAs;
- eventual acréscimo de `noopener` em `rel`;
- eventual acréscimo de `title=` nos CTAs da home (mitigação M2);
- `_redirects`, `robots.txt` e `_headers`.

**Qualquer diferença em canonical, title, description, og:*, JSON-LD ou sitemap é um bug.**

### 14.4 Conteúdo do `_redirects` gerado

```bash
cat dist/_redirects
grep -c '\*'      dist/_redirects   # deve ser 0
grep -c ':splat'  dist/_redirects   # deve ser 0
grep -c 'meli.la' dist/_redirects   # deve ser 3
```

### 14.5 HTTP (com `wrangler pages dev`, se disponível)

```bash
npx wrangler pages dev dist --port 8788
```

```bash
for s in dream-fitness-dr1600 polimet-ep1600 polimet-ep1600-senior; do
  printf '%s -> ' "$s"
  curl -sSI "http://localhost:8788/go/mercadolivre/$s" | grep -iE '^(HTTP|location)' | tr '\n' ' '
  echo
done

for bad in /go/mercadolivre/nao-existe /go/amazon/dream-fitness-dr1600 /go/ /go/mercadolivre /ml-qualquer-coisa; do
  printf '%s -> ' "$bad"
  curl -sSo /dev/null -w '%{http_code}\n' "http://localhost:8788$bad"
done

curl -sSI 'http://localhost:8788/go/mercadolivre/dream-fitness-dr1600?url=https://evil.com' | grep -i location
curl -sSI  http://localhost:8788/ml-dream | grep -iE '^(HTTP|location)'
curl -sSI  http://localhost:8788/go/mercadolivre/dream-fitness-dr1600 | grep -i 'x-robots-tag\|cache-control'
```

Leitura esperada: `302` nas três rotas de produto com `location` exatamente
`https://meli.la/2J8ihmd`, `https://meli.la/1epCpV7`, `https://meli.la/1tSuqej`; `404` em todos os
casos ruins; `301` nas legadas; destino inalterado com `?url=`.

### 14.6 Páginas

```bash
for p in / /reviews/dream-fitness-dr1600 /reviews/polimet-ep1600 /reviews/polimet-ep1600-senior \
         /guias/como-escolher /guias/esteira-para-apartamento /aviso-legal /termos-de-uso \
         /politica-de-cookies; do
  printf '%s -> ' "$p"
  curl -sSo /dev/null -w '%{http_code}\n' "http://localhost:8788$p"
done
# esperado: 200 nas nove
```

### 14.7 Links de afiliado (manual — só o Rafael)

Em **janela anônima**, clicando no CTA a partir do site:

| Slug | Deve chegar em | Confere? |
|---|---|---|
| `dream-fitness-dr1600` | anúncio Dream Fitness DR-1600 (MLB14733597) | ☐ |
| `polimet-ep1600` | anúncio Polimet EP-1600 (MLB65492201) | ☐ |
| `polimet-ep1600-senior` | anúncio EP-1600 Sênior (MLB20620342) | ☐ |

E confirmar que a URL final carrega `matt_word=pelicano`.

### 14.8 Varredura final

```bash
grep -rn "SUBSTITUIR-PELO-SEU-LINK" . --exclude-dir=node_modules --exclude-dir=.git   # 0
grep -rn 'href="/ml-' src/                                                            # 0
grep -rn "meli.la" src/pages src/layouts src/components                               # 0
grep -rn "meli.la" src/data                                                           # 3
```

### 14.9 Lighthouse

Rodar mobile e desktop em `/reviews/dream-fitness-dr1600`, antes e depois. LCP, CLS e INP não
podem piorar.

### 14.10 Produção

Após deploy (**pedir confirmação antes**), repetir §14.5 e §14.6 contra
`https://esteiraergometrica.pelicanoservice36.workers.dev/`, e §14.7 manualmente em mobile e
desktop.

---

## APÊNDICE A — Programa de Afiliados do Mercado Livre: o que pode e o que não pode ser automatizado

| Pergunta | Resposta | Confiança |
|---|---|---|
| Existe API pública oficial para gerar links de afiliado? | **Não.** Nenhum endpoint documentado. A geração acontece exclusivamente pela Barra de afiliados na interface web. | ALTA |
| A API pública do ML (`api.mercadolibre.com`) serve? | Serve para **dados de produto** (título, preço, specs, disponibilidade) — não para gerar Link Especial. | ALTA |
| Dá para montar o link por concatenação? | **Não.** O parâmetro `ref` é token cifrado gerado pelo servidor. | ALTA — verificado no link real |
| Existem "APIs de afiliado ML" de terceiros? | Sim, no GitHub e comerciais. Funcionam por **cookies de sessão / endpoints internos não documentados**. | ALTA |
| São seguras de usar? | **Não recomendado.** Item 1.9 proíbe "software client-side para distribuição de links" e "qualquer outro método automatizado, artificial ou fraudulento". A seção de exclusões cita "uso indevido de Softwares, APIs, robôs ou Extensões". Risco: suspensão ou exclusão da conta. | ALTA |
| Geração em massa? | Só manual, um produto por vez. Sem lote oficial. | ALTA |
| Janela de atribuição | **24 horas corridas** entre clique e conclusão da compra (item 1.6). Lives: 7 dias com lock-in no add-to-cart (1.6.1). | ALTA |
| Comissão | **16%** exibida na barra para os três produtos em 07/09/2026. A tabela "poderá ser modificada a qualquer tempo" (item 3.1). | ALTA (na data) |
| Ganho em produto diferente | Sim — página oficial: "Se alguém entrar pelo seu link e comprar outro produto, você também ganha." | ALTA |
| Site pode ser Mídia? | Sim — "mídias sociais, **sites e blogs pessoais**" (1.3), **desde que informados ao ML**. | ALTA |
| Anúncio pago em buscador vale? | **Não.** Item 1.3.1 exclui Google/Bing search e shopping. Orgânico e mídia paga em redes cadastradas valem. | ALTA |
| Encurtador próprio é permitido? | **Não** para encurtadores de terceiros; camada própria é área cinzenta (1.8). Ver §12.1. | MÉDIA — leitura de cláusula |
| Redirect automático sem clique? | **Proibido** (1.10). Só clique voluntário e consciente. | ALTA |
| Links expiram? | Sem prazo declarado nos Termos. Mas o item 10.3 obriga a cessar o uso ao sair do programa, e anúncios saem do ar sozinhos. | MÉDIA |
| Múltiplas contas | Proibido — uma conta ativa por afiliado (1.2.1). | ALTA |
| Etiquetas de rastreamento | Nativas (`matt_word`), com dimensão própria no dashboard de Métricas. Etiqueta atual: `pelicano`. | ALTA |

### O que **pode** ser automatizado com segurança

1. ✅ Servir e rotear links já gerados (as linhas `/go/` em `_redirects`).
2. ✅ Armazenar, versionar e auditar os links num arquivo de dados.
3. ✅ Validar em build time que cada `affiliateUrl` está bem formado e no host permitido.
4. ✅ Ligar/desligar produtos por flag.
5. ✅ Monitorar preço e disponibilidade via API pública do ML (`/items/MLBxxxx`) para manter os
   preços das reviews atualizados — leitura de dado público, não geração de link.
6. ✅ Usar etiquetas (`matt_word`) diferentes por canal para segmentar métricas.

### O que **não** deve ser automatizado

1. ❌ Gerar Link Especial via script, cookie de sessão ou endpoint interno.
2. ❌ Usar bibliotecas de terceiros que reimplementam a "API de afiliados".
3. ❌ Qualquer redirect que dispare sem ação do visitante.
4. ❌ Simular cliques, impressões ou conversões.

---

## APÊNDICE B — Ações do Rafael (fora do escopo do Claude Code)

| # | Ação | Urgência | Onde |
|---|---|---|---|
| B1 | Cadastrar o site como Mídia no perfil de afiliado | 🔴 **BLOQUEANTE** — sem isso a comissão pode não ser paga | ML → Afiliados e criadores → Perfil de afiliado → "Otra red" → Adicionar |
| B2 | Decidir §11.1: configurar `esteiraergometrica.com` **ou** apontar `site` para workers.dev | 🔴 **CRÍTICO** para SEO — domínio tem autoridade residual (PA 23 / DA 11) | Cloudflare Pages / `astro.config.mjs` |
| B3 | Validar em janela anônima se o `meli.la` cai no produto ou num interstitial | 🟡 afeta conversão | qualquer navegador |
| B4 | Decidir `linkMode`: `'redirect'` (padrão) ou `'direct'` (risco zero na cláusula 1.8) | 🟡 | decisão de negócio |
| B5 | Confirmar se a conta ML precisa de validação ("Termine de validar sua conta" apareceu no painel) | 🟡 | painel ML |
| B6 | Considerar CTAs nos dois guias (hoje com 0 links) | 🟢 receita | editorial |
| B7 | Atualizar a review da Sênior: "indício de que não dobra" → confirmado pela ficha técnica | 🟢 qualidade | editorial |

---

## APÊNDICE C — Fontes

1. Site em produção — `https://esteiraergometrica.pelicanoservice36.workers.dev/` (07/09/2026)
2. Repositório real — `…\BlogEsteiraErgometrica\EsteiraErgometricaBlog\site\` (leitura de
   `package.json`, `astro.config.mjs`, `CLAUDE.md`, `public/_redirects`, `public/_headers`,
   `public/robots.txt`, `src/layouts/BaseLayout.astro`, `src/layouts/ReviewLayout.astro`,
   `src/pages/index.astro`, `src/pages/reviews/dream-fitness-dr1600.astro`)
3. Páginas de catálogo do Mercado Livre: MLB14733597, MLB65492201, MLB20620342, MLB36882419,
   MLB63437712 (07/09/2026)
4. [Termos e Condições do Programa de afiliados e criadores](https://www.mercadolivre.com.br/ajuda/30228)
5. [Afiliados e Criadores — página oficial do Programa](https://www.mercadolivre.com.br/l/afiliados-home)
6. Painel de Afiliados: `/afiliados/dashboard`, `/afiliados/tools`, `/afiliados/perfil` (07/09/2026)
7. [Reclame Aqui — "Programa de afiliados do Mercado Livre não tem uma API"](https://www.reclameaqui.com.br/mercado-livre/programa-de-afiliados-do-mercado-livre-nao-tem-uma-api_-lfESpIamuDGm2ro/) (18/12/2024, encerrada como não resolvida em 11/04/2025)
