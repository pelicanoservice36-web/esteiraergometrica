# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Contexto para agentes trabalhando neste repositório. Leia antes de qualquer alteração.

## O que é

Site especialista em ajudar o brasileiro a escolher uma esteira ergométrica. Hospedado no
Cloudflare Pages, monetizado por links de afiliado (Mercado Livre). Domínio expirado
readquirido, com autoridade residual — PA 23 / DA 11 na data de retomada.

Construído em [Astro](https://astro.build) desde 2026-09-07 (migrado de HTML/CSS puro).
`npm run build` gera HTML estático em `dist/` — **sem framework de UI no cliente**: nenhum
React, Vue ou bundle de JS é enviado ao navegador. O único JS publicado são pequenos
`<script is:inline>` em vanilla JS, cada um com um propósito pontual (ver "JS no cliente"
abaixo). Ver README.md para deploy.

## Comandos

```
npm run dev         # localhost:4321, hot reload
npm run build       # prebuild regenera public/_redirects, depois astro build → dist/
npm run preview     # serve dist/ para conferir o build de produção
npm run check       # verificação de afiliados (registro, páginas, _redirects, e dist/ se existir)
npm run redirects   # regenera public/_redirects avulso
```

Não há test runner nem linter. A verificação do projeto é `npm run build` (falha se um slug
de afiliado não existir) seguido de `npm run check` — rode os dois antes de commitar.
Node >= 22.12.

## JS no cliente

Todo script é `is:inline`, sem dependência, e degrada sem JS:

- `BaseLayout.astro`: Google Analytics (gtag, `G-F3SC734W1X`) com Consent Mode — o consentimento
  padrão é `denied`, a biblioteca só carrega após a primeira interação ou 7s (por causa de
  TBT/PageSpeed; o comentário no arquivo explica por que não `requestIdleCallback`), evento
  `affiliate_click` delegado em todo `a[href^="/go/"]`, e o banner de cookies.
- `ReviewLayout.astro`: CTA fixo no mobile via `IntersectionObserver`.
- `Header.astro`: estado de scroll do header transparente.
- `politica-de-cookies.astro`: botão para reabrir o banner.

A escolha do banner fica em `localStorage['cookie-consent']` — é a **única** exceção à regra
de não usar armazenamento de navegador. Qualquer mudança em analytics/cookies exige atualizar
`politica-de-cookies.astro`, que descreve os cookies `_ga` e o banner.

## Regra número um: nunca invente dado técnico

Toda especificação publicada precisa vir da ficha do fabricante ou de anúncio de varejo
verificado, e a fonte precisa ser conferida antes de escrever. Se o dado não foi
confirmado, deixe `[VERIFICAR]` no lugar. Publicar HP, tamanho de lona ou peso máximo
estimado destrói a única coisa que este site tem a oferecer.

O mesmo vale para medições: não publique decibéis, temperatura de motor ou testes de
carga. Não temos laboratório. Quando um dado não existir, diga que não existe — essa
honestidade é o diferencial editorial frente aos concorrentes que inventam números.

## Regra número dois: preço é faixa, não número

Preços variam entre vendedores e mudam em semanas. Escreva sempre como faixa com mês de
referência ("R$ 1.449 a 1.599, em setembro de 2026"). O único lugar com valor único é o
JSON-LD (prop `jsonLd` do layout), que usa `AggregateOffer` com `lowPrice` e `highPrice`.

Nunca reproduza o preço "de R$ X" riscado dos anúncios. É âncora de marketing, não preço
praticado.

Cuidado com referência cruzada: quando uma review cita o preço de *outro* modelo em prosa
(ex: a EP-1600 padrão menciona a faixa da Sênior), atualizar um dos dois sem o outro cria
uma inconsistência que já aconteceu uma vez neste repositório. Ao mudar um preço, busque o
valor antigo em todo o `src/` antes de considerar a tarefa concluída.

## Estrutura

```
src/
  layouts/
    BaseLayout.astro        Head (meta, OG, canonical, gtag, banner de cookies), Header, Footer
    ReviewLayout.astro      + lead-section, ficha técnica, botão de compra, JSON-LD Product
    ArticleLayout.astro     Para guias e páginas legais (lead-section, sem ficha técnica)
    LandingLayout.astro     Páginas de oferta para tráfego pago: mesmo <head>, SEM Header/Footer
                            (única saída é o CTA), noindex por padrão
  components/
    Header.astro · Footer.astro · Logo.astro
  data/
    affiliates.mjs          Registro único de links de afiliado (ver seção abaixo)
    catalog.mjs             TOTAL_MODELOS — contagem do catálogo (ver "Contagem de modelos")
  pages/
    index.astro              Home com tabela comparativa
    reviews/*.astro          Uma análise por arquivo, usa ReviewLayout
    guias/*.astro            Usa ArticleLayout (inclui comparativos "X ou Y" e "marca é boa?")
    oferta/*.astro           Usa LandingLayout — não entra no sitemap (noindex)
    metodologia.astro         Critérios, pesos e a conta aberta da nota editorial de cada review
    sobre.astro · plano-30-dias.astro · 404.astro
    aviso-legal.astro · termos-de-uso.astro · politica-de-cookies.astro
  styles.css                 Folha de estilo única, inline no <head> de cada página (inlineStylesheets: 'always')
scripts/
  gen-redirects.mjs          Gera public/_redirects a partir de affiliates.mjs (roda no prebuild)
  check-affiliates.mjs       `npm run check`, Node puro
public/
  assets/images/             Fotos de produto (de anúncio verificado, self-hosted)
  _redirects                 GERADO por scripts/gen-redirects.mjs — não editar à mão
  _headers                   Cache e cabeçalhos de segurança
  robots.txt · sitemap.xml   Copiados como estão para dist/ — sitemap é mantido à mão
  llms.txt                   Resumo do site para buscadores de IA — mantido à mão
astro.config.mjs             build.format: 'file' gera arquivos .html no dist/ — necessário porque o Cloudflare resolve /rota como /rota.html sem redirect extra; URL pública e canonical NÃO usam .html, ver nota abaixo
```

**Sobre `.html` (importante, causa confusão fácil — corrigido em 2026-09-09):** o Cloudflare
serve `dist/reviews/foo.html` tanto em `/reviews/foo.html` (200) quanto em `/reviews/foo`
(200), mas **redireciona (307) `/reviews/foo.html` → `/reviews/foo`** — é o `html_handling`
padrão do Cloudflare Workers Static Assets, não uma configuração deste repositório. Por isso
toda URL pública, canonical, `path` de layout, entrada de `sitemap.xml` e link interno deste
site usa a forma **sem** `.html`, mesmo o build continuando a gerar arquivos `.html` em
`dist/`. Nunca escreva `path="/reviews/algo.html"` nem `href="/algo.html"` — isso cria um
redirect 307 desnecessário e um canonical que aponta para uma URL que não é a final.
As três páginas legais (`aviso-legal.astro`, `termos-de-uso.astro`, `politica-de-cookies.astro`)
são linkadas no rodapé (`.foot-nav`, dentro de `Footer.astro`) de toda página do site
automaticamente — não precisa repetir isso por página.

### Contagem de modelos

O número de modelos do catálogo ("vinte e um modelos") aparece em texto corrido em ~15
páginas. `src/data/catalog.mjs` guarda `TOTAL_MODELOS`/`TOTAL_MODELOS_EXTENSO`, mas só
`guias/melhor-esteira-ergometrica-residencial.astro` importa a constante; o resto está
escrito à mão (lista no comentário do arquivo). Ao adicionar ou remover uma review, atualize
a constante e busque a contagem antiga por extenso e em algarismo em `src/pages` e
`public/llms.txt`.

Ao criar uma análise nova: crie `src/pages/reviews/nome-do-modelo.astro` importando
`ReviewLayout`, e use `polimet-ep1600.astro` como referência de tom, profundidade e de quais
props preencher — não como base para copiar e editar às cegas. Rode `npm run build` antes de
commitar; se o build falhar, a página não vai para o ar.

## Padrão editorial das análises

A ordem é fixa e não deve ser alterada. As três primeiras entradas são responsabilidade do
`ReviewLayout` (props `h1`, `standfirst`, `updated`, `fichaItems`); o resto é conteúdo dentro
do `<slot />`:

1. Título, standfirst, data
2. Ficha técnica (`.ficha`) — antes de qualquer texto corrido
3. Veredito, com a nota editorial logo abaixo do `<h2>` (ver "Nota editorial" abaixo)
4. Para quem faz sentido
5. Para quem **não** faz sentido
6. Seções técnicas específicas do produto
7. Pontos fortes e limitações
8. Onde comprar e por quanto
9. Perguntas frequentes
10. Disclosure de afiliado

A seção "para quem não faz sentido" é obrigatória e não é decorativa. Análise que só
elogia lê como anúncio e não converte.

### Nota editorial

Toda review tem uma nota de 0 a 10 (`<p class="edit-score">`, ver markup nas reviews
existentes), logo abaixo do `<h2>Veredito</h2>` e antes do primeiro parágrafo. A nota segue os
sete critérios e pesos documentados em `src/pages/metodologia.astro` (motor, lona, peso
suportado, velocidade, praticidade, custo-benefício, confiabilidade do fabricante/garantia) —
ao publicar um produto novo, calcule a nota pelas mesmas faixas e **atualize a tabela de
`metodologia.astro`** com a linha do novo modelo. Nunca é a mesma coisa que a nota de estrelas
do Mercado Livre (essa é "avaliação de comprador", sempre rotulada "no Mercado Livre" onde
aparece — nunca deixe essa atribuição implícita).

Nas perguntas frequentes, responda na primeira frase, sem rodeio — são candidatas a
featured snippet do Google.

## Links de afiliado

A fonte única é **`src/data/affiliates.mjs`**. Nenhuma URL de loja pode aparecer em `.astro`,
em `public/_redirects` ou em qualquer outro lugar.

No `.astro`, importe o helper e chame pelo slug — nunca escreva o caminho à mão:

```astro
---
import { buyHref } from '../../data/affiliates.mjs';
const buyUrl = buyHref('polimet-ep1600');
---
<a class="buy" href={buyUrl} rel="sponsored nofollow noopener" target="_blank">Ver preço no Mercado Livre</a>
```

`buyHref()` **lança** se o slug não existir ou estiver desabilitado, e valida o host antes
de devolver. Slug errado quebra `npm run build` em vez de publicar um link morto.

**`public/_redirects` é GERADO — não edite à mão.** `scripts/gen-redirects.mjs` roda sozinho
no `prebuild`; para regenerar avulso, `npm run redirects`. O gerador recusa host fora da
allowlist, protocolo diferente de https e qualquer curinga. `npm run check` roda a
verificação completa (registro, páginas, `_redirects` e, se `dist/` existir, o HTML
publicado).

Para adicionar um produto: gerar o link no Mercado Livre (Barra de afiliados →
"Compartilhar"), acrescentar a entrada em `src/data/affiliates.mjs` e rodar `npm run build`.
Nada mais. O link **não** pode ser montado por concatenação — o parâmetro `ref` é um token
cifrado gerado pelo servidor do ML.

`linkMode` no registro alterna entre `'redirect'` (padrão, CTA aponta para `/go/…`) e
`'direct'` (CTA recebe o link do ML direto, sem camada intermediária). Contexto da escolha
em `AFFILIATE_IMPLEMENTATION.md` §12.1.

Todo link de compra leva `rel="sponsored nofollow"`. Não é opcional: é exigência do
Google para link pago, e a ausência expõe o site a ação manual. Com `target="_blank"`,
acrescente `noopener`. Quando o texto do botão não disser "Mercado Livre" (os CTAs da home
dizem só "Ver melhor preço"), use `title="Ir para o anúncio no Mercado Livre"` — os Termos do
Programa exigem que fique claro para onde o link leva.

⚠️ O site só recebe comissão por tráfego vindo de **Mídias cadastradas** no perfil de
afiliado do Mercado Livre (cláusula 1.3 dos Termos). Confirme que o domínio está cadastrado
lá antes de contar com receita.

## SEO

- Um `<h1>` por página
- `title` até 60 caracteres, `description` até 155 (props do layout)
- `canonical` absoluto em toda página — gerado automaticamente pelo `BaseLayout` a partir
  da prop `path` e de `site` em `astro.config.mjs`; não hardcode a URL
- JSON-LD `Product` com `AggregateOffer` em toda review — validar no Rich Results Test
  antes de publicar
- Adicionar toda página nova ao `public/sitemap.xml`

## Prioridade de conteúdo

A fila original (EP-1600, EP-1600 Sênior, DR-1600, Cardio, Athletic Racer e os guias de
apartamento e de como escolher) está toda publicada; o catálogo hoje tem 21 reviews e ~30
guias. Antes de gerar conteúdo novo, decida a frente (novo modelo, ou SEO/conversão do que já
existe). Auditorias e relatórios de SEO anteriores estão em `SEO-AUDIT-2026-10.md`,
`SEO-IMPLEMENTATION-REPORT-2026-10.md` e `docs/seo/`.

## O que não fazer

- Não adicionar framework de UI no cliente (React, Vue, Svelte, Alpine etc.) — o site deve
  continuar sendo HTML estático, com no máximo scripts inline pontuais como os listados em
  "JS no cliente"
- Não usar localStorage ou qualquer armazenamento de navegador além do `cookie-consent`
- Não criar arquivo CSS adicional — tudo em `src/styles.css`
- Não gerar análises em lote; o texto é o produto do site
- Não copiar descrição de anúncio do Mercado Livre para dentro da página
- Não commitar sem rodar `npm run build` antes
