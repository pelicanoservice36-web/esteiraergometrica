# Mapa de preservação de URL — esteiraergometrica.com

Data: **2026-09-09**. Fase 3 do prompt mestre de atualização de conteúdo.

## Decisão

**Nenhuma URL precisa mudar.** Todas as 12 URLs publicadas (11 do sitemap + `/404.html`, que
não entra em sitemap por natureza) permanecem exatamente como estão. Não há slug malformado,
não há duplicidade de rota, não há conteúdo que precise ser fundido a outro em uma URL
diferente. Como o site é jovem (Astro migrado em 2026-09-07, domínio próprio ativo desde
2026-09-09) e cada URL já corresponde a exatamente um produto/tema sem sobreposição, o risco de
qualquer redesenho de URL é só perda de autoridade acumulada, sem ganho compensador.

| URL atual | URL futura | Ação | Motivo |
|---|---|---|---|
| `/` | `/` | Manter | — |
| `/reviews/polimet-ep1600.html` | mesma | Manter | Produto único, slug já descritivo |
| `/reviews/polimet-ep1600-senior.html` | mesma | Manter | idem |
| `/reviews/dream-fitness-dr1600.html` | mesma | Manter | idem |
| `/reviews/esteira-eletrica-dobravel-residencial-cardio.html` | mesma | Manter | Slug longo, mas descritivo e já indexado — encurtar não compensa o custo de um 301 |
| `/reviews/athletic-racer.html` | mesma | Manter | Publicada há poucas horas, sem histórico a preservar mas também sem motivo para mudar |
| `/guias/como-escolher.html` | mesma | Manter | — |
| `/guias/esteira-para-apartamento.html` | mesma | Manter | — |
| `/aviso-legal.html` | mesma | Manter | — |
| `/termos-de-uso.html` | mesma | Manter | — |
| `/politica-de-cookies.html` | mesma | Manter | — |
| `/404.html` | mesma | Manter | Nova, sem histórico |

## Rotas técnicas (fora do inventário de conteúdo, mas relevantes para não quebrar nada)

| Rota | O que é | Ação |
|---|---|---|
| `/go/mercadolivre/<slug>` × 5 | Redirect 302 para o link de afiliado real, gerado por `scripts/gen-redirects.mjs` a partir de `src/data/affiliates.mjs` | Manter — nunca editar `_redirects` à mão |
| `/ml-dream`, `/ml-polimet`, `/ml-polimet-senior` | Rotas curtas legadas, 301 para as rotas `/go/` equivalentes, mantidas por já terem sido publicadas externamente em algum momento | Manter — não apagar mesmo se não usadas em nenhum link interno atual |

## Conclusão

Este documento confirma o estado antes de qualquer edição de conteúdo. Se, durante as fases de
atualização (4 em diante), surgir uma necessidade real de mudar alguma URL, ela deve ser
registrada aqui com a justificativa e o plano de redirect 301 **antes** de ser executada — não
depois.
