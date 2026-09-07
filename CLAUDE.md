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
    aviso-legal.astro · termos-de-uso.astro · politica-de-cookies.astro
  styles.css                 Folha de estilo única, importada pelo BaseLayout
public/
  assets/images/             Fotos de produto (de anúncio verificado, self-hosted)
  _redirects                 Links de afiliado centralizados
  _headers                   Cache e cabeçalhos de segurança
  robots.txt · sitemap.xml   Copiados como estão para dist/ — sitemap é mantido à mão
astro.config.mjs             build.format: 'file' preserva as URLs .html existentes
```

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
3. Veredito
4. Para quem faz sentido
5. Para quem **não** faz sentido
6. Seções técnicas específicas do produto
7. Pontos fortes e limitações
8. Onde comprar e por quanto
9. Perguntas frequentes
10. Disclosure de afiliado

A seção "para quem não faz sentido" é obrigatória e não é decorativa. Análise que só
elogia lê como anúncio e não converte.

Nas perguntas frequentes, responda na primeira frase, sem rodeio — são candidatas a
featured snippet do Google.

## Links de afiliado

Todos passam por `public/_redirects`. No `.astro` escreva o caminho curto (`/ml-polimet`),
nunca a URL da loja. Trocar o destino em um lugar atualiza o site inteiro.

Todo link de compra leva `rel="sponsored nofollow"`. Não é opcional: é exigência do
Google para link pago, e a ausência expõe o site a ação manual.

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
