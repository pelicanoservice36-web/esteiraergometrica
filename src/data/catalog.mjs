// Fonte única da contagem do catálogo (SEO-AUDIT-2026-10, item 3).
//
// Antes desta constante, "dezenove"/"19 modelos" estava escrito à mão em 13
// arquivos. Trocar o número em todo lugar ao mesmo tempo seria uma
// refatoração grande demais pra um ajuste de SEO (a maioria das ocorrências
// é texto corrido em português, não um valor estruturado), então o escopo
// deste arquivo é mais modesto: é a fonte única pra quem importar, e um
// checklist explícito pra quem não importar ainda.
//
// `melhor-esteira-ergometrica-residencial.astro` já importa e usa esta
// constante (era a página onde o número aparecia em title/h1/description,
// então o ganho de evitar dessincronia era maior).
//
// Os outros 12 arquivos abaixo ainda têm "dezenove"/"19" escrito à mão, em
// frases como "as dezenove análises que já publicamos" ou "os dezenove
// modelos do catálogo". Ao adicionar ou remover um produto do catálogo,
// confira cada um deles e atualize o número junto com esta constante:
//
//   src/pages/index.astro
//   src/pages/metodologia.astro
//   src/pages/guias/como-comprar-esteira-com-seguranca.astro
//   src/pages/guias/como-escolher.astro
//   src/pages/guias/esteira-acima-de-100kg.astro
//   src/pages/guias/esteira-dobravel.astro
//   src/pages/guias/esteira-para-corrida-ou-caminhada.astro
//   src/pages/guias/esteira-silenciosa.astro
//   src/pages/guias/kikos-e-boa-marca.astro
//   src/pages/guias/melhor-esteira-custo-beneficio.astro
//   src/pages/guias/melhores-marcas-de-esteira.astro
//   src/pages/guias/o-que-e-uma-esteira-ergometrica.astro
//
// (busca rápida: grep -rln "dezenove\|19 modelos\|19 esteiras" src/pages)

export const TOTAL_MODELOS = 19;
export const TOTAL_MODELOS_EXTENSO = 'dezenove';
