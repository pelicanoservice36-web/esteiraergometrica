/**
 * Registro central de links de afiliado.
 *
 * FONTE ÚNICA DE VERDADE. Nenhuma URL de loja deve aparecer em .astro, em
 * public/_redirects ou em qualquer outro lugar — só aqui.
 *
 * Este arquivo é lido por dois consumidores:
 *   1. as páginas .astro, via buyHref('<slug>')          → href dos CTAs
 *   2. scripts/gen-redirects.mjs                          → gera public/_redirects
 *
 * É .mjs (e não .ts) de propósito: o gerador roda em Node puro, sem nenhuma
 * dependência de build, e precisa importar exatamente os mesmos dados que o
 * Astro importa. Um único arquivo, dois consumidores, zero divergência. Os
 * tipos vêm de JSDoc, que o editor e o `astro check` entendem.
 *
 * Para gerar um link novo: Mercado Livre → Barra de afiliados → "Compartilhar"
 * → modal "Gerar link / ID de produto". O link curto meli.la é o affiliateUrl.
 * Não dá para montá-lo por concatenação: o parâmetro `ref` é um token cifrado
 * gerado pelo servidor do Mercado Livre.
 */

/** @typedef {'redirect' | 'direct'} LinkMode */

/**
 * @typedef {object} Merchant
 * @property {string}   label         Nome exibível do marketplace
 * @property {string[]} allowedHosts  Hosts aceitos, comparados por IGUALDADE EXATA
 */

/**
 * @typedef {object} AffiliateProduct
 * @property {string}  merchant             Chave em `merchants`
 * @property {string}  title                Nome do produto (uso interno / mensagens de erro)
 * @property {string}  listingId            ID do anúncio no marketplace (ex.: MLB14733597)
 * @property {string}  productUrl           URL não-afiliada, guardada para auditoria
 * @property {string}  affiliateUrl         Link Especial gerado no painel de afiliados
 * @property {string} [affiliateProductId]  ID de produto do programa de afiliados
 * @property {string} [trackingTag]         Etiqueta de rastreamento (matt_word)
 * @property {boolean} enabled              false = fora do ar, sem apagar o registro
 * @property {string}  verifiedAt           Data da última conferência (YYYY-MM-DD)
 * @property {string} [notes]
 */

/**
 * Como o CTA aponta para o marketplace.
 *
 *   'redirect' → href = /go/<merchant>/<slug>, resolvido por public/_redirects
 *   'direct'   → href = affiliateUrl, sem camada intermediária
 *
 * O modo 'direct' existe por causa da cláusula 1.8 dos Termos do Programa de
 * Afiliados do Mercado Livre, que trata de manipulação de Links Especiais.
 * Trocar de modo é uma linha; ver AFFILIATE_IMPLEMENTATION.md §12.1.
 *
 * @type {LinkMode}
 */
export const linkMode = 'redirect';

/** @type {Record<string, Merchant>} */
export const merchants = {
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

/** @type {Record<string, AffiliateProduct>} */
export const products = {
	'dream-fitness-dr1600': {
		merchant: 'mercadolivre',
		title: 'Dream Fitness DR-1600',
		listingId: 'MLB14733597',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-eletrica-dream-fitness-dr-1600-110v220v-dobravel-preto-127220v/p/MLB14733597',
		affiliateUrl: 'https://meli.la/2J8ihmd',
		affiliateProductId: 'HAPWBH-9U6G',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-07',
		notes: 'Catálogo/PDP, loja oficial Dream Fitness. Ficha técnica bate 100% com a review.',
	},
	'polimet-ep1600': {
		merchant: 'mercadolivre',
		title: 'Polimet EP-1600',
		listingId: 'MLB65492201',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-polimet-dobravel-residencial-5-funcoes-ep-1600-preto/p/MLB65492201',
		affiliateUrl: 'https://meli.la/1epCpV7',
		affiliateProductId: 'HAPWBH-48VM',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-07',
		notes:
			'Marca Polimet, REDE Marketplace. Mesmo equipamento sob a marca Poli Sports: MLB36882419 (sem link gerado).',
	},
	'polimet-ep1600-senior': {
		merchant: 'mercadolivre',
		title: 'Polimet EP-1600 Sênior',
		listingId: 'MLB20620342',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-residencial-ep-1600-senior-16hp-poli-sports/p/MLB20620342',
		affiliateUrl: 'https://meli.la/1tSuqej',
		affiliateProductId: 'HAPWBH-U2C9',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-07',
		notes: "Ficha técnica confirma 'É dobrável: Não', validando a hipótese da review.",
	},
	'esteira-eletrica-dobravel-residencial-cardio': {
		merchant: 'mercadolivre',
		title: 'Esteira Elétrica Dobrável Residencial Cardio',
		listingId: 'MLB5070173491',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-dobravel-residencial-cardio/up/MLBU4760101286?pdp_filters=item_id%3AMLB5070173491',
		affiliateUrl: 'https://meli.la/16h15N4',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-07',
		notes:
			'Sem marca (ficha declara "Genérica"), vendedor não é loja oficial, sem idProdutoCatalogo (listagem de vendedor único, não catálogo multi-seller). Comissão 28% informada pelo usuário. Specs vieram da ficha colada pelo usuário, não de scraping — página do anúncio bloqueada por anti-bot em toda tentativa.',
	},
	'athletic-racer': {
		merchant: 'mercadolivre',
		title: 'Athletic Racer 16km/h',
		listingId: 'MLB29724235',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-athletic-racer-16kmh-residencial-suporta-130kg/p/MLB29724235',
		affiliateUrl: 'https://meli.la/21roffC',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-09',
		notes:
			'Loja oficial ATHLETIC, 500 vendidos, R$4.300 (de R$5.190) em setembro/2026 — mesmo preço no site oficial do fabricante (shop.athletic.com.br, de R$4.590). Ficha cruzada com o manual PDF oficial. O texto de marketing do fabricante diz "26 programas de treinamento", mas a tabela de specs do próprio site e o manual (P0 manual + P1-P15 pré-definidos + P16-P18 de usuário) confirmam 19 — usar 19, não 26.',
	},
	'wct-fitness-esteira': {
		merchant: 'mercadolivre',
		title: 'WCT Fitness Esteira Elétrica Ergométrica',
		listingId: 'MLB26516485',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-eletrica-ergometrica-bivolt-ginastica-wct-fitness-cor-preto/p/MLB26516485',
		affiliateUrl: 'https://meli.la/22gN9m9',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-11',
		notes:
			'Loja oficial WCT Fitness, maior volume do catálogo: 10.000 vendidos, 3.347 avaliações, nota 4,8. R$1.699 no Mercado Livre em setembro/2026 — mesmo produto no site oficial (wct.com.br) por R$1.720,90 (R$1.686,48 à vista), de R$3.199,90. Ficha técnica cruzada com o site oficial: potência de pico 2,0HP, mas potência CONTÍNUA de só 0,75HP — a mais fraca do catálogo mesmo sendo o maior volume de vendas. Lona 39×110cm, peso máx. 110kg, 31kg de equipamento, bivolt automático.',
	},
	'importway-iwest2x1-10': {
		merchant: 'mercadolivre',
		title: 'Importway IWEST2X1-10',
		listingId: 'MLB34782946',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-eletrica-ergometrica-dobravel-portatil-2-em-1-120kg-10kmh-20hp-importway-iwest2x1-10/p/MLB34782946',
		affiliateUrl: 'https://meli.la/1jKzbqr',
		affiliateProductId: 'HAPWBH-KFSV',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-11',
		notes:
			'Achada em varredura de baixa concorrência (Apify + checagem de SERP): 500 vendidos, 189 avaliações, nota 4,7, zero review editorial concorrente encontrada (só páginas de loja). Ficha cruzada com o site oficial (importway.com.br) — CUIDADO: a Importway tem dois produtos quase homônimos, "IWEST2X1" (110kg, lona 92×38cm, com inclinação) e "IWEST2X1-10" (120kg, lona 100×41cm, sem inclinação) — este anúncio (MLB34782946) é o IWEST2X1-10. Potência informada só como "máxima" (2.0hp), fabricante não declara contínua separadamente — [VERIFICAR] na review. Garantia de 90 dias.',
	},
	'gallant-elite-gee13m29a': {
		merchant: 'mercadolivre',
		title: 'Gallant Elite GEE13M29A (2.9HP, 220V)',
		listingId: 'MLB38668054',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-gallant-elite-29hp-16kmh-130kg-gee13m29a-220pt/p/MLB38668054',
		affiliateUrl: 'https://meli.la/1YVHsu8',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-11',
		notes:
			'Pedido direto do usuário (não veio da varredura de baixa concorrência). Loja oficial GALLANT: 100 vendidos, 269 avaliações, nota 4,8, R$3.609 em setembro/2026. Marca Gallant pertence à Webcontinental. Ficha cruzada com o site oficial (gallantoficial.com.br) — a mais completa do catálogo: motor 2,9HP, 16km/h, lona 122×45cm, 130kg, inclinação manual hidráulica em 3 níveis, dobrável (sistema hidráulico), peso líquido 45kg / bruto 52,2kg, garantia 6 meses. ATENÇÃO: não é bivolt — este anúncio (MLB38668054) é a versão 220V (GEE13M29A-220PT); existe um anúncio separado da versão 127V (GEE13M29A-127PT, MLB66114997) com histórico de vendas bem menor. Não confundir com os outros modelos da linha Elite (GEE12M25A 2,5HP/120kg e GEE12M28A 2,8HP/120kg), que são produtos diferentes.',
	},
};

/** Rotas curtas antigas, mantidas para links externos já publicados. */
export const legacyRoutes = {
	'/ml-dream': 'dream-fitness-dr1600',
	'/ml-polimet': 'polimet-ep1600',
	'/ml-polimet-senior': 'polimet-ep1600-senior',
};

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

/**
 * Valida um produto. Devolve a lista de problemas encontrados (vazia = ok).
 * Usada tanto pelo gerador quanto por buyHref, para que um link inválido
 * quebre o build em vez de ir ao ar.
 *
 * @param {string} slug
 * @param {AffiliateProduct} p
 * @returns {string[]}
 */
export function validateProduct(slug, p) {
	/** @type {string[]} */
	const errs = [];

	if (!SLUG_RE.test(slug)) {
		errs.push(`slug fora do formato permitido: ${JSON.stringify(slug)}`);
	}

	const merchant = merchants[p.merchant];
	if (!merchant) {
		errs.push(`merchant desconhecido: ${JSON.stringify(p.merchant)}`);
		return errs;
	}

	if (!p.enabled) return errs;

	if (!p.affiliateUrl) {
		errs.push('produto habilitado sem affiliateUrl');
		return errs;
	}

	let url;
	try {
		url = new URL(p.affiliateUrl);
	} catch {
		errs.push(`affiliateUrl não é uma URL válida: ${JSON.stringify(p.affiliateUrl)}`);
		return errs;
	}

	if (url.protocol !== 'https:') {
		errs.push(`affiliateUrl precisa usar https: (recebido ${url.protocol})`);
	}

	// Igualdade exata, sempre. endsWith() aceitaria evilmercadolivre.com.br e
	// includes() aceitaria https://evil.com/?x=meli.la.
	const host = url.hostname.toLowerCase();
	if (!merchant.allowedHosts.includes(host)) {
		errs.push(
			`host fora da allowlist de ${p.merchant}: ${host} ` +
				`(permitidos: ${merchant.allowedHosts.join(', ')})`,
		);
	}

	return errs;
}

/**
 * Href que o CTA deve usar.
 *
 * Lança em build time — de propósito. Um slug errado quebra `npm run build`,
 * não a produção: é o equivalente estático de um 404.
 *
 * @param {string} slug
 * @returns {string}
 */
export function buyHref(slug) {
	const p = products[slug];
	if (!p) {
		throw new Error(
			`[affiliates] slug desconhecido em CTA: ${JSON.stringify(slug)}. ` +
				`Conhecidos: ${Object.keys(products).join(', ')}`,
		);
	}
	if (!p.enabled) {
		throw new Error(`[affiliates] slug desabilitado usado em CTA: ${slug}`);
	}

	const errs = validateProduct(slug, p);
	if (errs.length) {
		throw new Error(`[affiliates] ${slug}: ${errs.join(' | ')}`);
	}

	return linkMode === 'direct' ? p.affiliateUrl : `/go/${p.merchant}/${slug}`;
}

/**
 * Rótulo do marketplace, para o atributo title dos CTAs.
 * @param {string} slug
 * @returns {string}
 */
export function merchantLabel(slug) {
	const p = products[slug];
	return p ? (merchants[p.merchant]?.label ?? p.merchant) : '';
}
