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
	'gallant-elite-gee12m28a': {
		merchant: 'mercadolivre',
		title: 'Gallant Elite GEE12M28A (2.8HP, 127V)',
		listingId: 'MLB54762239',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-gallant-elite-28hp-16kmh-120kg-gee12m28a-127pt/p/MLB54762239',
		affiliateUrl: 'https://meli.la/1R8M9vy',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-11',
		notes:
			'Pedido direto do usuário (não veio da varredura de baixa concorrência). Loja oficial GALLANT por Webcontinental: 1000+ vendidos, 242 avaliações, nota 4,8, R$2.498 em setembro/2026. Ficha cruzada com o site oficial (gallantoficial.com.br): motor 2,8HP, 1-16km/h, superfície de caminhada 122×42cm, 120kg, inclinação manual hidráulica em 3 níveis, dobrável (sistema hidráulico), 12 programas + 3 modos de contagem regressiva, display LED (não é o LCD de 5" do GEE13M29A), peso líquido 40,8kg / bruto 47,6kg, dimensões do produto 126,5×70,5×147cm, garantia 6 meses. ATENÇÃO: não é bivolt — este anúncio (MLB54762239) é a versão 127V (GEE12M28A-127PT); existe pelo menos um anúncio separado da versão 220V com histórico de vendas menor. Mesma linha "Elite" do GEE13M29A já publicado (2,9HP/130kg) e do GEE12M25A (2,5HP/120kg) — não confundir os três.',
	},
	'podiumfit-x300': {
		merchant: 'mercadolivre',
		title: 'PodiumFit X300',
		listingId: 'MLB53462403',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-eletrica-podiumfit-x300-silenciosa-dobravel-12km-preto/p/MLB53462403',
		affiliateUrl: 'https://meli.la/1zUr5xC',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-13',
		notes:
			'Achada em varredura de baixa concorrência. Loja oficial PODIUMFIT: 1000+ vendidos, 385 avaliações, nota 4,7, R$2.534 em setembro/2026. Ficha cruzada com o site oficial (podiumfit.com.br) — completa: motor 2,0 HPM, 1-12km/h, lona 110×40cm, 12 programas, dobrável, dimensões montada 136×60×116cm e dobrada 56×60×126cm, dois porta-objetos, amortecedores, rodízios, peso máximo do usuário 110kg, peso do produto 30kg, bivolt, garantia 90 dias.',
	},
	'qbuen-150kg': {
		merchant: 'mercadolivre',
		title: 'QBuen Esteira Elétrica (até 150 kg)',
		listingId: 'MLB65525774',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-eletrica-qbuen-para-casa-com-inclinacao-de-0-6-e-suporte-ate-150-kg/p/MLB65525774',
		affiliateUrl: 'https://meli.la/2yycfWx',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-13',
		notes:
			'Achada em varredura de baixa concorrência. Loja oficial QBUEN: 500+ vendidos, R$1.325,99 em setembro/2026 (screenshot direto do anúncio enviado pelo usuário). Nota/avaliações revisadas para 4,6/237 no screenshot mais recente (captura anterior, pré-bloqueio do Apify, tinha registrado 257 — divergência não explicada, usar 237). Usuário enviou ficha técnica completa do anúncio, permitindo confirmar: modelo AT-1271 (linha AT-1271), motor 2 HP (não separa contínua de pico), velocidade máxima 12km/h, peso máximo 150kg, peso do equipamento 24,5kg, É dobrável: Sim, inclinação 0-6% do tipo ELÉTRICA (motorizada, confirma dúvida anterior sobre o mecanismo), tela com tempo/velocidade/calorias/distância/programas/scan, 12 programas, requer montagem. [VERIFICAR] apenas comprimento da lona (ficha só declara largura, 40cm) e garantia — não divulgados em nenhuma fonte. Uma fonte externa (Amazon) cita ficha de um produto QBuen DIFERENTE (modelo AT-1379, 2,5HP, 120kg) — confirmado como modelo distinto pelo próprio campo "Modelo" da ficha real (AT-1271), então a suspeita original estava correta, não usamos esses números. Promovida de "parcial sem nota" para análise completa com nota editorial (6,4/10) usando banda conservadora (mínima) para o critério de lona, dado que o comprimento não é confirmado — ver metodologia.astro. NA tabela comparativa da home e em metodologia.astro.',
	},
	'strive-25hp-16kmh': {
		merchant: 'mercadolivre',
		title: 'Strive 2.5HP 16km/h (New Speed)',
		listingId: 'MLB68421626',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-strive-25hp-16kmh-com-inclinacao-preto/p/MLB68421626',
		affiliateUrl: 'https://meli.la/2fQyqer',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-13',
		notes:
			'Achada em varredura de baixa concorrência. Loja "STRIVE por New Speed": 100 vendidos, R$2.658,70 (24% off de R$3.499,99) em setembro/2026 (screenshot direto do anúncio enviado pelo usuário). Nota/avaliações revisadas para 5,0/28 no screenshot mais recente (captura anterior tinha 27, divergência mínima). Usuário enviou ficha técnica completa, confirmando: modelo TM16, motor 2,5HP (não separa contínua de pico), velocidade máxima 16km/h (a maior do catálogo), peso máximo 120kg, lona 110×40cm, peso do equipamento 37kg, É dobrável: Não, inclinação do tipo ELÉTRICA (motorizada, grau ainda não especificado em texto), monitor de frequência cardíaca, tela, 12 programas, requer montagem. [VERIFICAR] apenas garantia — não divulgada em nenhuma fonte. Imagem promocional alega "15% Auto Incline" mas isso NÃO está confirmado em nenhuma fonte independente/ficha técnica — tratado como marketing, não fato. ATENÇÃO mantida: reclamação pública no Reclame Aqui contra a New Speed (modelo FT400, não este TM16) sobre dificuldade de acionar garantia — não confirmado se se aplica a esta linha, mas pesa negativamente na nota de confiabilidade (piso, 3,0, apesar de marca identificável). Promovida de "parcial sem nota" para análise completa com nota editorial (6,0/10) — ver metodologia.astro. NA tabela comparativa da home e em metodologia.astro.',
	},
	'redfin-150kg': {
		merchant: 'mercadolivre',
		title: 'Redfin Ideal DL-227 (até 150 kg)',
		listingId: 'MLB73035446',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-dobravel-com-controle-remoto-treino-cardio-caminhada-casa-academia-150kg/p/MLB73035446',
		affiliateUrl: 'https://meli.la/1GbL3gp',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-13',
		notes:
			'Achada em varredura de baixa concorrência. Loja "Redfin": 1000+ vendidos, R$716,66 (40% off de R$1.199) em setembro/2026 (screenshot direto do anúncio enviado pelo usuário) — o segundo menor preço do catálogo, atrás só da Esteira Cardio genérica (R$640). Avaliações revisadas para 4,8/426 (captura anterior tinha 423, divergência mínima). Usuário enviou ficha técnica completa, confirmando: linha "Ideal", modelo "DL-227", motor 2,5HP (não separa contínua de pico), velocidade máxima 6km/h (a mais baixa do catálogo), peso máximo 150kg, lona 90×40cm (a mais curta confirmada do catálogo), peso do equipamento 18kg, É dobrável: Sim (um dos mais leves entre os dobráveis do catálogo; superado depois pela Health Herald, 13,5kg), inclinação MANUAL de 1 posição só. Ficha do anúncio é CONTRADITÓRIA: declara "Inclui display: Não" e "Com tela: Não", mas também lista "Informações do painel: Calorias, Distância, Passos, Tempo, Velocidade" — não resolvido, registrado na review. [VERIFICAR] apenas garantia — não divulgada em nenhuma fonte. IMPORTANTE: a ficha confirma que a variante "Redfin Ideal DL-227" (nome ligeiramente diferente do "IDL-227" citado por uma fonte externa antes) é de fato este anúncio (MLB73035446) — a cautela anterior sobre não usar dados de uma fonte externa não confirmada estava correta como precaução, mas o próprio anúncio agora confirma os mesmos números. CUIDADO mantido: existem múltiplas lojas "Redfin"/"Sevenfit Redfin Kamaré" no ML vendendo produtos diferentes — confirmar que é este anúncio específico antes de comprar. Promovida de "parcial sem nota" para análise completa com nota editorial (6,7/10) — ver metodologia.astro. NA tabela comparativa da home e em metodologia.astro.',
	},
	'health-herald-lcd': {
		merchant: 'mercadolivre',
		title: 'Health Herald SP0501 (Painel LCD)',
		listingId: 'MLB65574846',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-dobravel-eletrica-com-painel-lcd-e-controle-remoto-para-casa-academia-preta/p/MLB65574846',
		affiliateUrl: 'https://meli.la/2Rif86M',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-13',
		notes:
			'Achada em varredura de baixa concorrência. Loja oficial Health Herald: 1000+ vendidos, R$719,70 em setembro/2026 (preço confirmado igual à captura anterior). Avaliações revisadas para 4,8/704 (screenshot direto do anúncio; captura anterior tinha 697, divergência mínima), maior número de avaliações do catálogo. Usuário enviou ficha técnica completa, confirmando: modelo SP0501, motor 0,65HP (o mais fraco confirmado do catálogo, mais fraco que os 0,75HP contínuo da WCT Fitness), velocidade máxima 6km/h (empatada com a Redfin como a mais baixa), peso máximo 110kg, lona 90×37cm, peso do equipamento 13,5kg (o mais leve do catálogo), É dobrável: Sim, inclinação MANUAL (quantidade de posições não especificada), monitor de frequência cardíaca, tela, função "Stepper" (não detalhada), não requer montagem. [VERIFICAR] apenas garantia — não divulgada em nenhuma fonte, sem site de fabricante independente localizado. Promovida de "parcial sem nota" (a mais vazia das 4 parciais) para análise completa com nota editorial (5,5/10) — ver metodologia.astro. Nota baixa apesar da ótima praticidade, por causa do motor mais fraco do catálogo. NA tabela comparativa da home e em metodologia.astro. Com isso, as 5 análises da varredura de baixa concorrência (PodiumFit, QBuen, Strive, Redfin, Health Herald) mais a Antuvi (pendência resolvida à parte) estão todas com nota editorial completa.',
	},
	'gallant-elite-gee12m25a': {
		merchant: 'mercadolivre',
		title: 'Gallant Elite GEE12M25A (2.5HP)',
		listingId: 'MLB3801040505',
		productUrl:
			'https://www.mercadolivre.com.br/esteira-ergometrica-eletrica-gallant-elite-25hp-14kmh-120kg-gee12m25a-127pt/p/MLB38669848',
		affiliateUrl: 'https://meli.la/1xeQRiL',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-19',
		notes:
			'Pedido direto do usuário (mesma origem da GEE12M28A/GEE13M29A). Consolidado de dois registros separados (220V/127V) depois que o usuário confirmou que este único anúncio (MLB38669848) tem seletor de voltagem embutido (127V ou 220V), não são anúncios distintos. Ficha técnica cruzada com o site oficial (gallantoficial.com.br): motor 2,5HP, 1-14km/h, lona 110×42cm, 120kg, inclinação manual hidráulica em 3 níveis, dobrável (sistema hidráulico), peso líquido 35,20kg / bruto 40,40kg, dimensões montada 117×65,5×139cm, display LCD 3.5", 12 programas + 3 modos de contagem regressiva, garantia 6 meses. Preço observado varia por voltagem selecionada no mesmo anúncio: R$2.529 (4,5★, 28 avaliações) com 127V pré-selecionado (item_id MLB3801040505, o da URL enviada), R$2.453,13 (5,0★, 23 avaliações) quando 220V foi selecionado numa captura anterior (item_id MLB6864120796) — tratado como faixa de preço, não dois produtos. +100 vendidos. Usuário enviou prints do anúncio direto. ATENÇÃO: "Conferir mais produtos da marca Gallant" aparece no anúncio, mas não confirmamos explicitamente o selo "Loja Oficial" como nos outros dois Gallant Elite — sinalizado como [VERIFICAR] na review. Não é bivolt apesar do seletor — confirme a voltagem escolhida antes de finalizar a compra.',
	},
	'antuvi-mesa': {
		merchant: 'mercadolivre',
		title: 'Antuvi Esteira Elétrica Ergométrica (marca declarada "Geral")',
		listingId: 'MLB63778249',
		productUrl: 'https://www.mercadolivre.com.br/p/MLB63778249',
		affiliateUrl: 'https://meli.la/1tgCGPc',
		trackingTag: 'pelicano',
		enabled: true,
		verifiedAt: '2026-09-13',
		notes:
			'Última pendência da varredura de baixa concorrência. Apify travado a sessão toda (cota mensal); usuário enviou link, imagem e depois a ficha técnica e um screenshot do anúncio direto, o que permitiu completar os dados. Título do anúncio: "Esteira Elétrica Ergométrica Ginástica Inclinação 12km 2.5hp Preto". Loja "Antuvi" no Mercado Livre — a ficha técnica declara a MARCA como "Geral" (não "Antuvi"; mesmo padrão sem marca real da Esteira Cardio/"Genérica"). +500 vendidos, nota 4,7, 280 avaliações (número revisado — uma captura anterior, antes do bloqueio do Apify, tinha registrado 319, divergência não explicada, usar 280 por vir de screenshot direto do anúncio), selo "Mais vendido" (14º em Esteira Ergométrica), R$1.580,24 em setembro/2026 (revisado de uma captura anterior de R$1.453, também superada pelo screenshot direto). CONFIRMADO pela ficha técnica do próprio anúncio: motor 2,5 HP (não separa contínua de pico), velocidade máxima 12km/h, superfície para correr 100×38cm, peso máximo do usuário 100kg, peso do equipamento 15kg, NÃO é dobrável (tem rodas), tem tela com tempo/velocidade/distância/calorias, função adicional "Stepper" (não detalhada), não requer montagem, modelo HD020, voltagem por seleção (visto 220V como opção, não confirmado bivolt automático). Inclinação confirmada como existente pelo título do anúncio, mas grau não especificado em texto — a imagem promocional usa uma chamada gráfica de "6°" que NÃO tratamos como confirmado (mesmo critério da Strive/"15% Auto Incline"). [VERIFICAR] apenas garantia — não encontrada em nenhuma fonte. Dado o quanto foi confirmado (só garantia falta), promovida de "parcial sem nota" para análise completa com nota editorial (5,5/10) — ver cálculo em metodologia.astro. NA tabela comparativa da home e em metodologia.astro.',
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
