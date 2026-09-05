# esteiraergometrica.com

Site estático. Sem build, sem dependências — o que está no repositório é o que vai pro ar.

## Estrutura

```
/
├── index.html                      Homepage com tabela comparativa
├── reviews/
│   └── polimet-ep1600.html         Template de review (duplicar para cada modelo)
├── assets/
│   └── style.css                   Folha de estilo única
├── _redirects                      Links de afiliado
├── _headers                        Cache e segurança
├── robots.txt
└── sitemap.xml
```

## Deploy no Cloudflare Pages

1. Suba a pasta para um repositório no GitHub.
2. No painel da Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecione o repositório. Configuração de build:
   - Framework preset: **None**
   - Build command: **deixar em branco**
   - Build output directory: **/**
4. Deploy. A partir daí, todo `git push` publica automaticamente.
5. **Custom domains → Set up a custom domain →** `esteiraergometrica.com`.

O SSL é emitido automaticamente em poucos minutos.

## Links de afiliado

Todos os links passam por `_redirects`. No HTML você escreve `/ml-polimet`; o Cloudflare
redireciona para o destino real. Quando o link do Mercado Livre mudar, você altera em um
lugar só, e não em cada página.

Os links de compra levam `rel="sponsored nofollow"` — exigência do Google para links pagos.
Sem isso o site fica exposto a penalização manual.

## Antes de publicar qualquer página

- [ ] Substituir todo `[VERIFICAR]` e `[  ]` por especificação real, conferida na página
      do fabricante ou na ficha do produto na loja. Nunca estime especificação técnica.
- [ ] Substituir `[DATA]` pela data real de publicação.
- [ ] Substituir as duas URLs em `_redirects` pelos seus links de afiliado.
- [ ] Conferir se o preço no HTML bate com o preço atual na loja.
- [ ] Rodar a URL no Rich Results Test do Google para validar o JSON-LD.

## Depois do primeiro deploy

- [ ] Registrar a propriedade no Google Search Console e enviar o sitemap.
- [ ] Instalar analytics. O Cloudflare Web Analytics é gratuito, não usa cookie e
      dispensa banner de consentimento — mais simples que o GA4 para um site assim.
- [ ] Marcar cliques nos botões de compra como evento, para saber a taxa de clique real.

## Manutenção de preço

Os preços estão escritos direto no HTML em três lugares por review: a ficha técnica, a
tabela comparativa e o JSON-LD. Preço desatualizado é o erro que mais destrói confiança
num site de comparação. Enquanto o volume for baixo, atualize manualmente uma vez por mês.
Quando passar de cinco ou seis modelos, vale automatizar via Apify.
