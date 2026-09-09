# esteiraergometrica.com

Site em [Astro](https://astro.build), gerando HTML estático em build (sem client JS, sem
frameworks de UI). `npm run build` gera tudo em `dist/` — é isso que vai pro ar, não o
repositório em si.

## Estrutura

```
/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro        Head, header, footer — toda página passa por aqui
│   │   ├── ReviewLayout.astro      + ficha técnica, JSON-LD Product, botão de compra
│   │   └── ArticleLayout.astro     Para guias e páginas legais (sem ficha técnica)
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── pages/
│   │   ├── index.astro             Home com tabela comparativa
│   │   ├── reviews/*.astro         Uma análise por arquivo
│   │   ├── guias/*.astro
│   │   └── {aviso-legal,termos-de-uso,politica-de-cookies}.astro
│   └── styles.css                  Folha de estilo única
├── public/
│   ├── assets/images/              Fotos de produto (self-hosted, de anúncio verificado)
│   ├── _redirects                  Links de afiliado
│   ├── _headers                    Cache e segurança
│   ├── robots.txt
│   └── sitemap.xml                 Mantido manualmente — ver CLAUDE.md
├── astro.config.mjs                build.format: 'file' — ver nota no CLAUDE.md sobre por que as URLs públicas não usam .html mesmo assim
└── package.json
```

Arquivos em `public/` são copiados como estão para `dist/` — é assim que `_redirects`,
`_headers`, `robots.txt`, `sitemap.xml` e as imagens continuam funcionando exatamente como
antes da migração para Astro.

## Rodando localmente

```
npm install
npm run dev       # localhost:4321, com hot reload
npm run build     # gera dist/
npm run preview   # serve dist/ localmente, para conferir o build de produção
```

## Deploy no Cloudflare Pages

1. Suba a pasta para um repositório no GitHub.
2. No painel da Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecione o repositório. Configuração de build:
   - Framework preset: **Astro**
   - Build command: **`npm run build`**
   - Build output directory: **`dist`**
4. Deploy. A partir daí, todo `git push` publica automaticamente.
5. **Custom domains → Set up a custom domain →** `esteiraergometrica.com`.

Se o projeto Cloudflare Pages já existia com a configuração antiga (Framework preset: None,
build command em branco, output `/`), é preciso editar essas três configurações no painel —
elas não mudam sozinhas com o push.

O SSL é emitido automaticamente em poucos minutos.

## Links de afiliado

Todos os links passam por `_redirects` (em `public/`). No `.astro` você escreve
`/ml-polimet`; o Cloudflare redireciona para o destino real. Quando o link do Mercado Livre
mudar, você altera em um lugar só, e não em cada página.

Os links de compra levam `rel="sponsored nofollow"` — exigência do Google para links pagos.
Sem isso o site fica exposto a penalização manual.

## Antes de publicar uma análise nova

- [ ] Nenhum dado técnico estimado — tudo vem da ficha do fabricante ou de anúncio de
      varejo verificado. Deixe `[VERIFICAR]` explícito no que não foi confirmado.
- [ ] Preço como faixa, com mês de referência, e igual nos três lugares: `fichaItems`,
      tabela comparativa (se aplicável) e `jsonLd.offers`.
- [ ] `path` no layout bate com a URL real da página, e a página nova entra em
      `public/sitemap.xml`.
- [ ] `npm run build` sem erro antes de commitar.
- [ ] Rodar a URL publicada no Rich Results Test do Google para validar o JSON-LD.

## Depois do primeiro deploy

- [ ] Registrar a propriedade no Google Search Console e enviar o sitemap.
- [ ] Instalar analytics. O Cloudflare Web Analytics é gratuito, não usa cookie e
      dispensa banner de consentimento — mais simples que o GA4 para um site assim. Se
      isso mudar, atualizar `politica-de-cookies.astro` também.
- [ ] Marcar cliques nos botões de compra como evento, para saber a taxa de clique real.

## Manutenção de preço

Cada review guarda o preço em dois lugares: as `fichaItems` (o que aparece na página) e o
`jsonLd.offers` (`lowPrice`/`highPrice`/`offerCount`, para dados estruturados). Reviews que
citam o preço de outro modelo em prosa (ex: a comparação Sênior × padrão) também precisam
ser atualizadas juntas — é fácil esquecer essas referências cruzadas. Preço desatualizado é
o erro que mais destrói confiança num site de comparação. Enquanto o volume for baixo,
atualize manualmente uma vez por mês, usando o actor de Mercado Livre no Apify para
confirmar preço real de vendedores com histórico de venda (não anúncio de revenda com
âncora inflada).
