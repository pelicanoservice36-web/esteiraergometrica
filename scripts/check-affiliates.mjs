#!/usr/bin/env node
/**
 * Verificação da estrutura de afiliados. `npm run check`
 *
 * Node puro, sem dependência e sem test runner. Cobre:
 *   - validação do registro (mesmas regras do gerador, incluindo casos hostis)
 *   - correspondência entre slugs do registro e páginas de review
 *   - ausência de links antigos ou de URL de loja fora de src/data/
 *   - forma do public/_redirects gerado
 *   - se dist/ existir: contagem e integridade dos CTAs no HTML publicado
 *
 * Sai com código 1 se qualquer verificação falhar.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

import {
	products,
	merchants,
	legacyRoutes,
	linkMode,
	validateProduct,
	buyHref,
	SLUG_RE,
} from '../src/data/affiliates.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

let passed = 0;
/** @type {string[]} */
const failures = [];

function check(name, fn) {
	try {
		const problem = fn();
		if (problem) failures.push(`${name}\n      ${problem}`);
		else passed++;
	} catch (err) {
		failures.push(`${name}\n      lançou: ${err.message}`);
	}
}

function walk(dir, out = []) {
	if (!existsSync(dir)) return out;
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => p.slice(root.length + 1).replace(/\\/g, '/');

// ------------------------------------------------- registro: casos válidos

check('T01 todo slug casa com o formato permitido', () => {
	const bad = Object.keys(products).filter((s) => !SLUG_RE.test(s));
	return bad.length ? `slugs inválidos: ${bad.join(', ')}` : null;
});

check('T02 nenhum slug duplicado ignorando caixa', () => {
	const seen = new Set();
	for (const s of Object.keys(products)) {
		if (seen.has(s.toLowerCase())) return `duplicado: ${s}`;
		seen.add(s.toLowerCase());
	}
	return null;
});

check('T03 todo merchant referenciado existe', () => {
	const bad = Object.entries(products).filter(([, p]) => !merchants[p.merchant]);
	return bad.length ? `merchant desconhecido em: ${bad.map(([s]) => s).join(', ')}` : null;
});

check('T04-T07 todo produto habilitado passa na validação completa', () => {
	const errs = [];
	for (const [slug, p] of Object.entries(products)) {
		for (const e of validateProduct(slug, p)) errs.push(`${slug}: ${e}`);
	}
	return errs.length ? errs.join(' | ') : null;
});

// ------------------------------------------------ registro: casos hostis
// A allowlist precisa recusar host que TERMINA com o domínio permitido e host
// que apenas CONTÉM o domínio permitido. São os dois erros clássicos que
// transformam um redirect em open redirect.

const hostile = [
	['T08 host totalmente estranho', 'https://evil.com/x'],
	['T09 host que termina com domínio permitido', 'https://evilmeli.la/x'],
	['T10 host que contém domínio permitido na query', 'https://evil.com/?u=meli.la'],
	['T11 http em vez de https', 'http://meli.la/x'],
	['T12 affiliateUrl não-parseável', 'não é uma url'],
	['T12b subdomínio não listado', 'https://a.meli.la/x'],
];

for (const [name, url] of hostile) {
	check(`${name} é rejeitado`, () => {
		const fake = { ...products[Object.keys(products)[0]], affiliateUrl: url };
		const errs = validateProduct('slug-de-teste', fake);
		return errs.length ? null : `ACEITOU indevidamente: ${url}`;
	});
}

check('T13 buyHref lança em slug inexistente', () => {
	try {
		buyHref('slug-que-nao-existe');
		return 'não lançou';
	} catch {
		return null;
	}
});

check('T14 buyHref lança em produto desabilitado', () => {
	const slug = Object.keys(products)[0];
	const original = products[slug].enabled;
	products[slug].enabled = false;
	let ok = false;
	try {
		buyHref(slug);
	} catch {
		ok = true;
	}
	products[slug].enabled = original;
	return ok ? null : 'não lançou';
});

check('T14b buyHref devolve a rota /go/ esperada', () => {
	if (linkMode !== 'redirect') return null; // modo direct: nada a conferir aqui
	const bad = Object.keys(products)
		.filter((s) => products[s].enabled)
		.filter((s) => buyHref(s) !== `/go/${products[s].merchant}/${s}`);
	return bad.length ? `rota inesperada em: ${bad.join(', ')}` : null;
});

// ------------------------------------- integridade entre registro e páginas

check('T15 todo slug do registro tem página de review', () => {
	const missing = Object.keys(products).filter(
		(s) => !existsSync(join(root, 'src', 'pages', 'reviews', `${s}.astro`)),
	);
	return missing.length ? `sem src/pages/reviews/*.astro: ${missing.join(', ')}` : null;
});

check('T16 toda review referencia um slug conhecido', () => {
	const dir = join(root, 'src', 'pages', 'reviews');
	const bad = [];
	for (const f of readdirSync(dir).filter((f) => extname(f) === '.astro')) {
		const slug = f.replace(/\.astro$/, '');
		const src = read(join(dir, f));
		if (!src.includes(`buyHref('${slug}')`)) bad.push(`${f} não chama buyHref('${slug}')`);
	}
	return bad.length ? bad.join(' | ') : null;
});

const srcFiles = walk(join(root, 'src'));

check('T17 nenhum placeholder SUBSTITUIR-PELO-SEU-LINK sobrou', () => {
	const hits = [...srcFiles, join(root, 'public', '_redirects')]
		.filter(existsSync)
		.filter((f) => read(f).includes('SUBSTITUIR-PELO-SEU-LINK'));
	return hits.length ? hits.map(rel).join(', ') : null;
});

check('T18 nenhum href="/ml-…" sobrou em src/', () => {
	const hits = srcFiles.filter((f) => /href="\/ml-/.test(read(f)));
	return hits.length ? hits.map(rel).join(', ') : null;
});

check('T19 nenhuma URL de loja fora de src/data/', () => {
	const hits = srcFiles
		.filter((f) => !rel(f).startsWith('src/data/'))
		.filter((f) => /meli\.la|mercadolivre\.com/.test(read(f)));
	return hits.length ? hits.map(rel).join(', ') : null;
});

check('T19b CTAs continuam com rel="sponsored nofollow"', () => {
	const bad = [];
	for (const f of srcFiles.filter((f) => extname(f) === '.astro')) {
		const src = read(f);
		for (const tag of src.match(/<a\b[^>]*>/g) ?? []) {
			// CTAs de afiliado são os únicos com href vindo de expressão JS.
			if (!/href=\{/.test(tag)) continue;
			if (!/rel="[^"]*sponsored/.test(tag) || !/rel="[^"]*nofollow/.test(tag)) {
				bad.push(`${rel(f)}: ${tag.slice(0, 90)}`);
			}
		}
	}
	return bad.length ? bad.join(' | ') : null;
});

// ------------------------------------------------------ public/_redirects

const redirectsPath = join(root, 'public', '_redirects');

check('T20 _redirects existe e foi gerado', () => {
	if (!existsSync(redirectsPath)) return 'arquivo não existe — rode npm run redirects';
	return read(redirectsPath).includes('GERADO AUTOMATICAMENTE')
		? null
		: 'sem o cabeçalho de aviso — foi editado à mão?';
});

check('T21 _redirects tem uma linha 302 por produto habilitado', () => {
	const src = read(redirectsPath);
	const missing = Object.entries(products)
		.filter(([, p]) => p.enabled)
		.filter(([slug, p]) => !src.includes(`/go/${p.merchant}/${slug}`) || !src.includes(p.affiliateUrl));
	return missing.length ? `faltando: ${missing.map(([s]) => s).join(', ')}` : null;
});

check('T21b _redirects tem as rotas legadas com 301', () => {
	const lines = read(redirectsPath).split('\n').filter((l) => l.trim() && !l.startsWith('#'));
	const bad = Object.keys(legacyRoutes).filter(
		(r) => !lines.some((l) => l.startsWith(r + ' ') && l.trim().endsWith('301')),
	);
	return bad.length ? `sem linha 301: ${bad.join(', ')}` : null;
});

check('T22 _redirects não contém curinga nem :splat', () => {
	const src = read(redirectsPath);
	if (src.includes(':splat')) return 'contém :splat';
	if (src.includes('*')) return 'contém *';
	return null;
});

check('T22b todo destino externo do _redirects está na allowlist', () => {
	const allowed = new Set(Object.values(merchants).flatMap((m) => m.allowedHosts));
	const bad = [];
	for (const line of read(redirectsPath).split('\n')) {
		if (!line.trim() || line.startsWith('#')) continue;
		const dest = line.trim().split(/\s+/)[1];
		if (!dest || !dest.startsWith('http')) continue;
		const host = new URL(dest).hostname.toLowerCase();
		if (!allowed.has(host)) bad.push(host);
	}
	return bad.length ? `hosts não permitidos: ${[...new Set(bad)].join(', ')}` : null;
});

// -------------------------------------------------------- dist/ (opcional)

const dist = join(root, 'dist');

if (existsSync(dist)) {
	const html = walk(dist).filter((f) => extname(f) === '.html');
	const all = html.map(read).join('\n');

	check('T28/T29 contagem de CTAs no dist/ bate com o esperado', () => {
		const expected = {
			'dream-fitness-dr1600': 4,
			'polimet-ep1600': 5,
			'polimet-ep1600-senior': 4,
			'esteira-eletrica-dobravel-residencial-cardio': 4,
				'athletic-racer': 4,
		};
		const got = {};
		for (const m of all.matchAll(/href="\/go\/[a-z0-9-]+\/([a-z0-9-]+)"/g)) {
			got[m[1]] = (got[m[1]] ?? 0) + 1;
		}
		const diff = Object.entries(expected)
			.filter(([s, n]) => got[s] !== n)
			.map(([s, n]) => `${s}: esperado ${n}, encontrado ${got[s] ?? 0}`);
		const total = Object.values(got).reduce((a, b) => a + b, 0);
		if (total !== 21) diff.push(`total de CTAs: esperado 21, encontrado ${total}`);
		return diff.length ? diff.join(' | ') : null;
	});

	check('T33 nenhum CTA aponta para /ml-… no dist/', () =>
		/href="\/ml-/.test(all) ? 'ainda há href="/ml-…" no HTML publicado' : null);

	check('T30/T31 todo CTA /go/ tem sponsored, nofollow e noopener', () => {
		const bad = [];
		for (const tag of all.match(/<a\b[^>]*href="\/go\/[^"]*"[^>]*>/g) ?? []) {
			const rel = (tag.match(/rel="([^"]*)"/) ?? [, ''])[1];
			const missing = ['sponsored', 'nofollow'].filter((k) => !rel.includes(k));
			if (/target="_blank"/.test(tag) && !rel.includes('noopener')) missing.push('noopener');
			if (missing.length) bad.push(`${missing.join('+')} em ${tag.slice(0, 80)}`);
		}
		return bad.length ? bad.join(' | ') : null;
	});

	check('T36 toda review publicada mantém o JSON-LD', () => {
		const reviews = html.filter((f) => rel(f).includes('reviews/'));
		const bad = [];
		for (const f of reviews) {
			const m = read(f).match(
				/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
			);
			if (!m) {
				bad.push(`${rel(f)}: sem JSON-LD`);
				continue;
			}
			try {
				JSON.parse(m[1]);
			} catch {
				bad.push(`${rel(f)}: JSON-LD inválido`);
			}
		}
		return bad.length ? bad.join(' | ') : null;
	});

	check('T34 toda página publicada mantém canonical', () => {
		const bad = html.filter((f) => !/<link rel="canonical"/.test(read(f)));
		return bad.length ? bad.map(rel).join(', ') : null;
	});

	check('T37 sitemap.xml publicado não contém /go/', () => {
		const p = join(dist, 'sitemap.xml');
		if (!existsSync(p)) return 'dist/sitemap.xml não existe';
		return read(p).includes('/go/') ? 'sitemap contém rota /go/' : null;
	});

	check('T38 robots.txt publicado bloqueia /go/ e /ml-', () => {
		const p = join(dist, 'robots.txt');
		if (!existsSync(p)) return 'dist/robots.txt não existe';
		const src = read(p);
		const missing = ['Disallow: /go/', 'Disallow: /ml-'].filter((d) => !src.includes(d));
		return missing.length ? `faltando: ${missing.join(', ')}` : null;
	});
} else {
	console.log('[check] dist/ ausente — verificações do HTML publicado puladas. Rode npm run build.\n');
}

// ------------------------------------------------------------------ saída

if (failures.length) {
	console.error(`\n[check] ${failures.length} falha(s), ${passed} ok:\n`);
	for (const f of failures) console.error('  ✗ ' + f);
	console.error('');
	process.exit(1);
}

console.log(`[check] ${passed} verificações passaram. Modo de link: ${linkMode}.`);
