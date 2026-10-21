// Dados resumidos de cada modelo analisado, para a tabela "Compare com modelos de preço
// parecido" no fim de cada análise (src/components/CompareSimilar.astro).
//
// Extraídos da tabela comparativa da home (motor, velocidade, lona, peso máximo, dobra,
// preço) e da metodologia (nota editorial) em 21/10/2026. Ao mudar um desses dados na home
// ou na metodologia, atualize aqui também. precoRef é só para ordenar por preço.

/** @typedef {{ slug: string, nome: string, nota: string, motor: string, vel: string, lona: string, peso: string, dobra: string, preco: string, precoRef: number }} Model */

/** @type {Model[]} */
export const models = [
	{ slug: 'polimet-ep1600', nome: 'Polimet EP-1600', nota: '6,9', motor: '1,6 HP', vel: '9 km/h', lona: '33 × 100 cm', peso: '110 kg', dobra: 'Sim', preco: 'R$ 1.449', precoRef: 1449 },
	{ slug: 'dream-fitness-dr1600', nome: 'Dream Fitness DR-1600', nota: '6,5', motor: '1,6 HP', vel: '9 km/h', lona: '33 × 100 cm', peso: '110 kg', dobra: 'Sim', preco: 'R$ 1.939', precoRef: 1939 },
	{ slug: 'polimet-ep1600-senior', nome: 'Polimet EP-1600 Sênior', nota: '6,0', motor: '1,6 HP', vel: '10 km/h', lona: '33 × 100 cm', peso: '110 kg', dobra: 'Não', preco: 'R$ 1.579', precoRef: 1579 },
	{ slug: 'esteira-eletrica-dobravel-residencial-cardio', nome: 'Esteira Cardio (genérica)', nota: '6,5', motor: '2,5 HP', vel: '10 km/h', lona: '48 × 90 cm', peso: '150 kg', dobra: 'Sim', preco: 'R$ 640', precoRef: 640 },
	{ slug: 'athletic-racer', nome: 'Athletic Racer', nota: '8,6', motor: '5.0 HPM', vel: '16 km/h', lona: '40 × 126,5 cm', peso: '130 kg', dobra: 'Sim', preco: 'R$ 4.300', precoRef: 4300 },
	{ slug: 'wct-fitness-esteira', nome: 'WCT Fitness', nota: '5,8', motor: '0,75 HP', vel: '10 km/h', lona: '39 × 110 cm', peso: '110 kg', dobra: 'Sim', preco: 'R$ 1.699', precoRef: 1699 },
	{ slug: 'importway-iwest2x1-10', nome: 'Importway IWEST2X1-10', nota: '6,4', motor: '2,0 HP', vel: '10 km/h', lona: '41 × 100 cm', peso: '120 kg', dobra: 'Sim', preco: 'R$ 1.055', precoRef: 1055 },
	{ slug: 'gallant-elite-gee13m29a', nome: 'Gallant Elite GEE13M29A', nota: '7,6', motor: '2,9 HP', vel: '16 km/h', lona: '45 × 122 cm', peso: '130 kg', dobra: 'Sim', preco: 'R$ 3.609', precoRef: 3609 },
	{ slug: 'gallant-elite-gee12m28a', nome: 'Gallant Elite GEE12M28A', nota: '7,7', motor: '2,8 HP', vel: '16 km/h', lona: '42 × 122 cm', peso: '120 kg', dobra: 'Sim', preco: 'R$ 2.498', precoRef: 2498 },
	{ slug: 'gallant-elite-gee12m25a', nome: 'Gallant Elite GEE12M25A', nota: '7,4', motor: '2,5 HP', vel: '14 km/h', lona: '42 × 110 cm', peso: '120 kg', dobra: 'Sim', preco: 'R$ 2.453,13', precoRef: 2453.13 },
	{ slug: 'podiumfit-x300', nome: 'PodiumFit X300', nota: '6,5', motor: '2,0 HPM', vel: '12 km/h', lona: '40 × 110 cm', peso: '110 kg', dobra: 'Sim', preco: 'R$ 2.534', precoRef: 2534 },
	{ slug: 'antuvi-mesa', nome: 'Antuvi', nota: '5,5', motor: '2,5 HP', vel: '12 km/h', lona: '38 × 100 cm', peso: '100 kg', dobra: 'Não', preco: 'R$ 1.580', precoRef: 1580 },
	{ slug: 'qbuen-150kg', nome: 'QBuen AT-1271', nota: '6,4', motor: '2 HP', vel: '12 km/h', lona: '40 cm larg.', peso: '150 kg', dobra: 'Sim', preco: 'R$ 1.079,98', precoRef: 1079.98 },
	{ slug: 'strive-25hp-16kmh', nome: 'Strive TM16', nota: '6,0', motor: '2,5 HP', vel: '16 km/h', lona: '40 × 110 cm', peso: '120 kg', dobra: 'Não', preco: 'R$ 2.658,70', precoRef: 2658.7 },
	{ slug: 'redfin-150kg', nome: 'Redfin Ideal DL-227', nota: '6,7', motor: '2,5 HP', vel: '6 km/h', lona: '40 × 90 cm', peso: '150 kg', dobra: 'Sim', preco: 'R$ 716,66', precoRef: 716.66 },
	{ slug: 'health-herald-lcd', nome: 'Health Herald SP0501', nota: '5,5', motor: '0,65 HP', vel: '6 km/h', lona: '37 × 90 cm', peso: '110 kg', dobra: 'Sim', preco: 'R$ 719,70', precoRef: 719.7 },
	{ slug: 'speedo-tr5', nome: 'Speedo TR5', nota: '6,2', motor: '4,0 HP pico', vel: '18 km/h', lona: '50 × 140 cm', peso: '150 kg', dobra: 'Sim', preco: 'R$ 10.990', precoRef: 10990 },
	{ slug: 'kht-gts6', nome: 'KHT GTS-6', nota: '7,3', motor: '4,0 HP AC', vel: '18,8 km/h', lona: '52 × 135 cm', peso: '150 kg', dobra: 'Sim', preco: 'R$ 11.499', precoRef: 11499 },
	{ slug: 'kht-gts7', nome: 'KHT GTS-7', nota: '6,9', motor: '2,5 HP DC', vel: '18,8 km/h', lona: '52 × 135 cm', peso: '150 kg', dobra: 'Sim', preco: 'R$ 17.172,15', precoRef: 17172.15 },
	{ slug: 'movement-lx-160-g4', nome: 'Movement LX 160 G4', nota: '7,3', motor: '2,0 cv (3,0 de pico)', vel: '18 km/h', lona: '47 × 133 cm', peso: '150 kg', dobra: 'Não', preco: 'R$ 18.588', precoRef: 18588 },
	{ slug: 'poli-sports-ep-16k', nome: 'Poli Sports EP-16K', nota: '7,6', motor: '3,0 HP', vel: '16 km/h', lona: '39 × 122 cm', peso: '120 kg', dobra: 'Sim', preco: 'R$ 2.354,30 – 2.727', precoRef: 2354.3 },
	{ slug: 'jmjn-qk-3058', nome: 'JMJN QK-3058-D', nota: '5,8', motor: '3,0 HP', vel: '14 km/h', lona: '38,5 × 94 cm', peso: '200 kg', dobra: 'Sim', preco: 'R$ 1.121,43 – 1.299', precoRef: 1121.43 },
];

/**
 * Os n modelos de preço mais parecido com o do slug informado (distância relativa de preço).
 * @param {string} slug
 * @param {number} [n]
 */
export function similarByPrice(slug, n = 3) {
	const self = models.find((m) => m.slug === slug);
	if (!self) throw new Error(`[models] slug desconhecido: ${slug}`);
	return models
		.filter((m) => m.slug !== slug)
		.map((m) => ({ m, d: Math.abs(Math.log(m.precoRef / self.precoRef)) }))
		.sort((x, y) => x.d - y.d)
		.slice(0, n)
		.map((x) => x.m);
}
