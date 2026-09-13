// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://esteiraergometrica.com',
	build: {
		format: 'file',
		// CSS global (~25KB minificado) inline no <head> de cada página em vez de
		// um <link rel="stylesheet"> externo bloqueante — elimina uma requisição
		// de rede no caminho crítico de renderização (afeta LCP/FCP no mobile).
		// O custo é reenviar o CSS em cada página em vez de cachear uma vez só,
		// mas o tráfego do site é majoritariamente visita única vinda de busca,
		// então o ganho no primeiro carregamento pesa mais que a cacheabilidade.
		inlineStylesheets: 'always',
	},
});
