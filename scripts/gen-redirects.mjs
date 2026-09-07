#!/usr/bin/env node
/**
 * Gera public/_redirects a partir de src/data/affiliates.mjs.
 *
 * Roda automaticamente antes de `npm run build` (script "prebuild"), e pode ser
 * chamado à mão com `npm run redirects`.
 *
 * Regras que este gerador garante:
 *   - uma linha explícita por rota; NUNCA splat (`*`) nem `:splat`
 *   - produto com link inválido ou host fora da allowlist derruba o build
 *   - saída idempotente: rodar duas vezes produz arquivo idêntico
 *
 * Node puro, sem nenhuma dependência.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
	products,
	merchants,
	legacyRoutes,
	validateProduct,
} from '../src/data/affiliates.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, '..', 'public', '_redirects');

/** @type {string[]} */
const errors = [];
const fail = (msg) => errors.push(msg);

// ---------------------------------------------------------------- validação

const slugs = Object.keys(products);

// Chaves de objeto já são únicas em JS, mas um par de slugs que só difira por
// caixa passaria despercebido e geraria duas rotas equivalentes.
const seen = new Map();
for (const slug of slugs) {
	const key = slug.toLowerCase();
	if (seen.has(key)) fail(`slug duplicado (ignorando caixa): ${seen.get(key)} e ${slug}`);
	seen.set(key, slug);
}

for (const [slug, p] of Object.entries(products)) {
	for (const e of validateProduct(slug, p)) fail(`${slug}: ${e}`);
}

for (const [route, slug] of Object.entries(legacyRoutes)) {
	if (!products[slug]) fail(`rota legada ${route} aponta para slug inexistente: ${slug}`);
	if (route.includes('*')) fail(`rota legada com curinga não é permitida: ${route}`);
}

if (errors.length) {
	console.error('\n[gen-redirects] FALHOU — nenhum arquivo foi escrito:\n');
	for (const e of errors) console.error('  ✗ ' + e);
	console.error('\nCorrija src/data/affiliates.mjs e rode de novo.\n');
	process.exit(1);
}

// ------------------------------------------------------------------- saída

const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));

const activeSlugs = slugs.filter((s) => products[s].enabled);
const routeCol =
	Math.max(
		...activeSlugs.map((s) => `/go/${products[s].merchant}/${s}`.length),
		...Object.keys(legacyRoutes).map((r) => r.length),
	) + 2;
const destCol =
	Math.max(
		...activeSlugs.map((s) => products[s].affiliateUrl.length),
		...Object.values(legacyRoutes).map((s) => `/go/${products[s].merchant}/${s}`.length),
	) + 2;

const lines = [
	'# GERADO AUTOMATICAMENTE por scripts/gen-redirects.mjs — NÃO EDITE À MÃO.',
	'# Fonte única: src/data/affiliates.mjs',
	'# Regenerar: npm run redirects  (roda sozinho no prebuild)',
	'#',
	'# 302 = redirecionamento temporário, correto para links comerciais:',
	'# trocar o destino no registro tem efeito imediato, sem cache permanente.',
	'',
	'# Links de afiliado.',
];

for (const slug of activeSlugs) {
	const p = products[slug];
	lines.push(
		pad(`/go/${p.merchant}/${slug}`, routeCol) + pad(p.affiliateUrl, destCol) + '302',
	);
}

const disabled = slugs.filter((s) => !products[s].enabled);
if (disabled.length) {
	lines.push('', '# Desabilitados no registro (rota inexistente → 404):');
	for (const s of disabled) lines.push(`#   ${s}`);
}

lines.push('', '# Rotas curtas antigas — mantidas para links externos já publicados.');
for (const [route, slug] of Object.entries(legacyRoutes)) {
	const p = products[slug];
	if (!p.enabled) {
		lines.push(`#   ${route} desativado (produto ${slug} está enabled:false)`);
		continue;
	}
	lines.push(pad(route, routeCol) + pad(`/go/${p.merchant}/${slug}`, destCol) + '301');
}

lines.push('');

const out = lines.join('\n');

// Sanidade final: nenhuma forma de curinga pode ter entrado na saída.
if (out.includes('*') || out.includes(':splat')) {
	console.error('[gen-redirects] FALHOU: curinga detectado na saída. Abortando.');
	process.exit(1);
}

const unchanged = existsSync(outFile) && readFileSync(outFile, 'utf8') === out;
writeFileSync(outFile, out, 'utf8');

const merchantList = [...new Set(activeSlugs.map((s) => products[s].merchant))]
	.map((m) => merchants[m].label)
	.join(', ');

console.log(
	`[gen-redirects] public/_redirects ${unchanged ? 'já estava atualizado' : 'atualizado'} — ` +
		`${activeSlugs.length} link(s) de afiliado (${merchantList}), ` +
		`${Object.keys(legacyRoutes).length} rota(s) legada(s).`,
);
