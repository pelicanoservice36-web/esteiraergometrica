# CLAUDE.md

Contexto para agentes trabalhando neste repositório. Leia antes de qualquer alteração.

## O que é

Site estático de análises de esteiras ergométricas para o mercado brasileiro, hospedado
no Cloudflare Pages. Monetização por links de afiliado (Mercado Livre). Domínio expirado
readquirido, com autoridade residual — PA 23 / DA 11 na data de retomada.

Sem build step. Sem framework. HTML e CSS escritos à mão. Isso é intencional: o site
precisa carregar rápido e ser trivial de manter por anos.

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
JSON-LD, que usa `AggregateOffer` com `lowPrice` e `highPrice`.

Nunca reproduza o preço "de R$ X" riscado dos anúncios. É âncora de marketing, não preço
praticado.

## Estrutura

```
index.html                          Home com tabela comparativa
reviews/
  _template-review.html             Template em branco — duplicar para novas análises
  polimet-ep1600.html               Análise publicada (referência de padrão e tom)
assets/style.css                    Folha de estilo única
_redirects                          Links de afiliado centralizados
_headers                            Cache e cabeçalhos de segurança
robots.txt · sitemap.xml
```

Ao criar uma análise nova: duplique `_template-review.html`, não a `polimet-ep1600.html`.
Use a EP-1600 como referência de tom e profundidade, não como base para copiar e editar.

## Padrão editorial das análises

A ordem é fixa e não deve ser alterada:

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

Todos passam por `_redirects`. No HTML escreva o caminho curto (`/ml-polimet`), nunca a
URL da loja. Trocar o destino em um lugar atualiza o site inteiro.

Todo link de compra leva `rel="sponsored nofollow"`. Não é opcional: é exigência do
Google para link pago, e a ausência expõe o site a ação manual.

## SEO

- Um `<h1>` por página
- `<title>` até 60 caracteres, `meta description` até 155
- `canonical` absoluto em toda página
- JSON-LD `Product` com `AggregateOffer` — validar no Rich Results Test antes de publicar
- Adicionar toda página nova ao `sitemap.xml`

## Prioridade de conteúdo

Ordem definida por análise de SERP, da menor para a maior dificuldade:

1. Polimet EP-1600 — publicada
2. Polimet EP-1600 Sênior — produto distinto, praticamente sem cobertura na concorrência
3. Dream Fitness DR-1600
4. Guia: esteira para apartamento pequeno
5. Guia: como escolher uma esteira

## O que não fazer

- Não adicionar framework, bundler ou dependência npm
- Não usar localStorage ou qualquer armazenamento de navegador
- Não criar arquivo CSS adicional — tudo em `assets/style.css`
- Não gerar análises em lote; o texto é o produto do site
- Não copiar descrição de anúncio do Mercado Livre para dentro da página
