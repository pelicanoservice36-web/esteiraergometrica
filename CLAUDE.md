# CLAUDE.md

Contexto para agentes trabalhando neste repositório. Leia antes de qualquer alteração.

## O que é

Site especialista em ajudar o brasileiro a escolher uma esteira ergométrica. Hospedado no
Cloudflare Pages, monetizado por links de afiliado (Mercado Livre). Domínio expirado
readquirido, com autoridade residual — PA 23 / DA 11 na data de retomada.

Construído em [Astro](https://astro.build) desde 2026-09-07 (migrado de HTML/CSS puro).
`npm run build` gera HTML estático em `dist/` — **sem framework de UI no cliente**: nenhum
React, Vue ou JS de interatividade é enviado ao navegador. O que mudou foi só a forma de
montar o HTML (layouts + componentes reaproveitáveis em vez de copiar `<header>`/`<footer>`
em cada arquivo); o resultado publicado continua sendo a mesma coisa que sempre foi: HTML e
CSS simples, rápido, fácil de manter. Ver README.md para comandos e deploy.

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
    BaseLayout.astro        Head, Header, Footer — toda página passa por aqui
    ReviewLayout.astro      + lead-section, ficha técnica, botão de compra, JSON-LD Product
    ArticleLayout.astro     Para guias e páginas legais (lead-section, sem ficha técnica)
  components/
    Header.astro · Footer.astro
  pages/
    index.astro              Home com tabela comparativa
    reviews/*.astro          Uma análise por arquivo, usa ReviewLayout
    guias/*.astro            Usa ArticleLayout
    metodologia.astro         Critérios, pesos e a conta aberta da nota editorial de cada review
    aviso-legal.astro · termos-de-uso.astro · politica-de-cookies.astro
  styles.css                 Folha de estilo única, importada pelo BaseLayout
public/
  assets/images/             Fotos de produto (de anúncio verificado, self-hosted)
  _redirects                 Links de afiliado centralizados
  _headers                   Cache e cabeçalhos de segurança
  robots.txt · sitemap.xml   Copiados como estão para dist/ — sitemap é mantido à mão
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
automaticamente — não precisa repetir isso por página. Se o site ganhar cadastro, formulário
ou analytics com cookie no futuro, atualize `politica-de-cookies.astro` — hoje ela afirma
explicitamente que não há cookie de rastreamento próprio, e isso deixaria de ser verdade.

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

Ordem definida por análise de SERP, da menor para a maior dificuldade:

1. Polimet EP-1600 — publicada
2. Polimet EP-1600 Sênior — publicada
3. Dream Fitness DR-1600 — publicada
4. Guia: esteira para apartamento pequeno — publicado
5. Guia: como escolher uma esteira — publicado
6. Esteira Elétrica Dobrável Residencial Cardio (sem marca) — publicada
7. Athletic Racer 16km/h — publicada

Todos os itens da fila original já estão publicados. Próximo passo é decidir a próxima
frente (novo modelo, ou aprofundar SEO/conversão do que já existe) antes de continuar
gerando conteúdo novo — ver "Não gerar análises em lote" abaixo.

## O que não fazer

- Não adicionar framework de UI no cliente (React, Vue, Svelte, Alpine etc.) — o site deve
  continuar sendo HTML estático puro no navegador, sem JS de interatividade
- Não usar localStorage ou qualquer armazenamento de navegador
- Não criar arquivo CSS adicional — tudo em `src/styles.css`
- Não gerar análises em lote; o texto é o produto do site
- Não copiar descrição de anúncio do Mercado Livre para dentro da página
- Não commitar sem rodar `npm run build` antes
