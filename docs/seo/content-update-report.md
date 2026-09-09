# Relatório de atualização de conteúdo — esteiraergometrica.com

Data: **2026-09-09**. Fase 24 do prompt mestre. Cobre o trabalho executado após a auditoria em
[`content-audit.md`](./content-audit.md) e [`url-preservation-map.md`](./url-preservation-map.md).

---

## 1. Resumo

Os 4 achados da auditoria foram corrigidos, mais um sistema de nota editorial (7 critérios,
com peso declarado) foi criado do zero, a pedido explícito do dono do site, incluindo uma
página de metodologia nova. Nenhuma URL mudou. Nenhum conteúdo foi removido. Nenhum dado
técnico foi inventado — a nota editorial nova reaproveita só especificações já publicadas e
fontadas em cada review; onde a fonte de um dado é fraca (Esteira Cardio), isso é sinalizado
explicitamente na própria conta da nota, não escondido. **Nada foi commitado nem enviado**,
conforme instruído — o repositório está pronto para revisão.

## 2. Páginas atualizadas

| URL | Alterações | Impacto esperado |
|---|---|---|
| `/aviso-legal.html` | Placeholder `[E-MAIL DE CONTATO]` substituído por `pelicanoservice36@gmail.com` (link `mailto:`) | Remove o único ponto de contato quebrado do site — E-E-A-T |
| `/termos-de-uso.html` | idem | idem |
| `/politica-de-cookies.html` | idem | idem |
| `/` (home) | 11 ocorrências de nota por estrela agora dizem explicitamente "no Mercado Livre"; seção "Como avaliamos" expandida de 6 para 7 critérios (novo: Fabricante e garantia), com link para a metodologia completa; caption da tabela comparativa corrigida (já feito em sessão anterior) | Evita confundir nota de comprador com nota do site; melhora E-E-A-T e link interno para a nova página de metodologia |
| `/guias/como-escolher.html` | "três modelos"/"três análises" → "cinco"; lona da Athletic Racer citada como exceção dimensionada para corrida | Guia deixa de subestimar o catálogo real; ganha 1 link interno novo para a Racer |
| `/guias/esteira-para-apartamento.html` | Tabela comparativa ganhou linhas da Cardio e da Athletic Racer; texto de "peso do equipamento" e a conclusão final reescritos para recomendar a Cardio como opção mais leve/barata (era só a Polimet antes); FAQ de "uma pessoa consegue mover sozinha" atualizada com os novos extremos (18 kg a 42,4 kg) | Guia de maior intenção de compra ("apartamento pequeno") agora referencia 5 de 5 produtos do catálogo, não 3 |
| `/reviews/polimet-ep1600.html` | Nota editorial adicionada: **6,9/10** | Padroniza com as outras 4 reviews |
| `/reviews/dream-fitness-dr1600.html` | Nota editorial: **6,5/10** | idem |
| `/reviews/polimet-ep1600-senior.html` | Nota editorial: **6,0/10** | idem |
| `/reviews/esteira-eletrica-dobravel-residencial-cardio.html` | Nota editorial: **6,5/10**, com nota de cautela sobre fonte não verificada | idem |
| `/reviews/athletic-racer.html` | Nota editorial: **8,6/10** | idem |
| `/metodologia.html` **(nova)** | Página nova: os 7 critérios, pesos, faixas de pontuação por critério, e a conta aberta (tabela) para os 5 modelos | Página indexável própria para E-E-A-T/Google Reviews System, hoje inexistente — "como avaliamos" só existia como âncora da home |
| Todas as páginas (via `BaseLayout.astro`) | `og:image` adicionado — reviews usam a foto do próprio produto automaticamente (deduzida do slug), demais páginas usam o poster do vídeo hero como padrão | Preview de compartilhamento em redes sociais/WhatsApp deixa de ser genérico |

## 3. Páginas preservadas (sem alteração de conteúdo)

`/reviews/athletic-racer.html` foi criada nesta mesma sessão, antes desta fase, e só recebeu o
selo de nota — o texto da análise em si não foi tocado por já estar no padrão atual. `/404.html`
não precisou de nenhuma mudança. O corpo de texto das 5 reviews (parágrafos de veredito, seções
técnicas, prós/contras, FAQ) **não foi reescrito** — só recebeu a linha da nota editorial no
topo do veredito. Isso foi deliberado: a auditoria (Fase 2) já havia classificado esse conteúdo
como A — Preservar, por ser denso, datado corretamente e já autocorrigir erros de terceiros.

## 4. URLs alteradas

Nenhuma. Uma URL nova foi criada (`/metodologia.html`), sem substituir nem redirecionar
nenhuma URL existente — consistente com o mapa de preservação da Fase 3.

## 5. Conteúdo removido

Nenhum.

## 6. Problemas encontrados (e como foram corrigidos)

- **Placeholder de contato em produção** (achado #2 da auditoria) — corrigido com o e-mail
  confirmado explicitamente pelo dono do site.
- **Guias com contagem de produtos desatualizada** (achado #1) — corrigido, ver seção 2.
- **Nota de comprador sem atribuição clara** (achado #3) — corrigido, ver seção 2.
- **Ausência de página de Metodologia e de sistema de nota editorial** (achado #4, parte 1) —
  corrigido: nova página + nota em 0 a 10 aplicada às 5 reviews, com o cálculo público.
- **Ausência de `og:image`** (achado #4, parte 2) — corrigido de forma automática/escalável
  (reviews puxam a própria foto do produto pelo slug, sem precisar editar prop por prop).

## 7. Problemas que NÃO foram corrigidos

Sendo direto, para não esconder nada:

- **A nota "custo-benefício" da metodologia é qualitativa, não uma fórmula fixa por faixa**,
  diferente dos outros seis critérios. Isso foi uma decisão deliberada (ver a própria página de
  metodologia, seção "Custo-benefício") porque "vale o preço" não é redutível a uma faixa
  numérica sem também considerar o que o produto entrega — mas é o critério com menos rigor
  matemático dos sete, e alguém auditando de novo pode legitimamente discordar da nota atribuída
  a cada modelo nesse critério específico.
- **A nota da Esteira Cardio usa dois valores (motor 2,5 HP, peso 150 kg) que vêm só do próprio
  anúncio do vendedor**, sem fabricante para confirmar de forma independente — isso já é
  penalizado no critério de confiabilidade (nota 3,0, a mais baixa do comparativo) e sinalizado
  com asterisco na tabela da metodologia, mas o número em si continua sendo o único disponível,
  não uma medição própria.
- **`node_modules_temp_check/`** segue existindo na raiz do projeto (fora do controle desta
  sessão de conteúdo) — não é gerado por nenhum script do repositório, provavelmente resíduo de
  uma verificação manual anterior. Não removido por estar fora do escopo desta tarefa.
- **`og:image` do site (páginas não-review) usa o poster do vídeo hero (1280×720, proporção
  16:9)**, não a proporção 1200×630 (1,91:1) recomendada pelo Facebook/LinkedIn para preview
  perfeito — funciona, mas pode cortar levemente nas bordas em algumas plataformas. Não gerei
  uma imagem nova especificamente para isso.
- **Nenhum schema novo foi adicionado** (`BreadcrumbList`, `Organization`, `WebSite`,
  `ItemList`) — a auditoria original apontou a ausência deles como oportunidade, mas não estava
  nos 4 achados que você pediu para corrigir nesta rodada.

## 8. Próximas oportunidades

- Adicionar `BreadcrumbList` e `Organization` ao JSON-LD de todas as páginas — potencial de
  rich result no Google sem risco, já que não envolve inventar dado nenhum.
- Considerar gerar uma imagem 1200×630 dedicada para `og:image` das páginas não-review (home,
  guias, metodologia), em vez de reaproveitar o poster do vídeo.
- Revisitar a nota de "custo-benefício" no próximo ciclo de atualização de preço mensal
  (já previsto em `README.md`), já que preço muda e a nota qualitativa depende dele.
- Nenhuma nova review nem novo guia foi criado nesta rodada, por instrução explícita do prompt
  mestre ("não quero criar dezenas de novos artigos") — o próximo passo de conteúdo, se
  desejado, seria decidir entre expandir o catálogo (6º produto) ou aprofundar SEO/conversão do
  que já existe, como o próprio `CLAUDE.md` já registra.

---

## Fase 25 — Git

```
 M CLAUDE.md
 M public/sitemap.xml
 M src/components/Footer.astro
 M src/layouts/BaseLayout.astro
 M src/layouts/ReviewLayout.astro
 M src/pages/aviso-legal.astro
 M src/pages/guias/como-escolher.astro
 M src/pages/guias/esteira-para-apartamento.astro
 M src/pages/index.astro
 M src/pages/politica-de-cookies.astro
 M src/pages/reviews/athletic-racer.astro
 M src/pages/reviews/dream-fitness-dr1600.astro
 M src/pages/reviews/esteira-eletrica-dobravel-residencial-cardio.astro
 M src/pages/reviews/polimet-ep1600-senior.astro
 M src/pages/reviews/polimet-ep1600.astro
 M src/pages/termos-de-uso.astro
 M src/styles.css
?? docs/
?? src/pages/metodologia.astro
```

15 arquivos modificados, 2 novos (a pasta `docs/` com os 3 documentos desta auditoria, e
`src/pages/metodologia.astro`). `npm run build` e `npm run check` passam limpos (13 páginas,
31 verificações). **Nenhum `git add`, `git commit` ou `git push` foi executado** — o projeto
está como está, pronto para você revisar e decidir quando publicar.
