// Worker do site: atende só /api/* (pagamento do e-book Marmita Leve). Todo o resto é servido
// direto pelos arquivos estáticos (assets), com o mesmo comportamento de antes.
// A chave secreta do Mercado Pago fica no Cloudflare: Worker esteiraergometrica > Settings >
// Variables and Secrets > MP_ACCESS_TOKEN (tipo Secret).

// Cria o pagamento do e-book Marmita Leve no Mercado Pago (cartão ou Pix), chamado pelo checkout do site.
// A chave secreta fica só no Cloudflare: variável MP_ACCESS_TOKEN (Settings > Variables and Secrets, tipo Secret).
// Preço, produto e descrição são fixos aqui: nunca confiamos no valor que vem do navegador.

const PRODUTO = {
  valor: 27.9,
  descricao: 'Marmita Leve em 21 Dias - e-book digital (PDF)',
  referencia: 'marmita-leve-21',
};
const OBRIGADO = '/marmita-leve/obrigado-t70ofcjnpd';
const PERMITIDOS = /^(pix|visa|master|amex|elo|hipercard|cabal|diners)$/;

// Limpa a chave colada no painel: tira espaços, quebras de linha, aspas e um "Bearer" colado junto.
const chaveMP = (env) => String(env.MP_ACCESS_TOKEN || '').replace(/^\s*["']?\s*(Bearer\s+)?/i, '').replace(/["'\s]+$/g, '').replace(/\s+/g, '');

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function pagamento(request, env, ctx) {
  const tok = chaveMP(env);
  if (!tok) return json({ erro: 'Pagamento indisponível no momento.' }, 503);
  let f;
  try { f = await request.json(); } catch { return json({ erro: 'Dados inválidos.' }, 400); }

  const metodo = String(f.payment_method_id || '');
  if (!PERMITIDOS.test(metodo)) return json({ erro: 'Forma de pagamento não aceita.' }, 400);
  const email = String(f.payer?.email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ erro: 'Informe um e-mail válido.' }, 400);

  const corpo = {
    transaction_amount: PRODUTO.valor,
    description: PRODUTO.descricao,
    external_reference: PRODUTO.referencia,
    statement_descriptor: 'MARMITALEVE',
    payment_method_id: metodo,
    payer: { email },
    metadata: { email },
    notification_url: 'https://esteiraergometrica.com/api/mp/webhook',
    additional_info: { items: [{ id: PRODUTO.referencia, title: PRODUTO.descricao, quantity: 1, unit_price: PRODUTO.valor, category_id: 'learnings' }] },
  };
  const doc = f.payer?.identification;
  if (doc?.type && doc?.number) corpo.payer.identification = { type: String(doc.type), number: String(doc.number).replace(/\D/g, '') };
  if (f.payer?.first_name) corpo.payer.first_name = String(f.payer.first_name).slice(0, 60);
  if (f.payer?.last_name) corpo.payer.last_name = String(f.payer.last_name).slice(0, 60);

  if (metodo === 'pix') {
    corpo.date_of_expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString().replace('Z', '-00:00');
  } else {
    if (!f.token) return json({ erro: 'Dados do cartão incompletos.' }, 400);
    corpo.token = String(f.token);
    corpo.installments = Math.min(Math.max(parseInt(f.installments, 10) || 1, 1), 3);
    if (f.issuer_id) corpo.issuer_id = String(f.issuer_id);
  }

  const chave = String(f.idempotencia || '').replace(/[^\w-]/g, '').slice(0, 64) || crypto.randomUUID();
  const r = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tok}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': chave,
      ...(f.device_id ? { 'X-meli-session-id': String(f.device_id).slice(0, 100) } : {}),
    },
    body: JSON.stringify(corpo),
  });
  const p = await r.json().catch(() => ({}));
  if (!r.ok || !p.id) { console.error('MP pagamento recusado', r.status, p.message, JSON.stringify(p.cause || null)); }
  if (!r.ok || !p.id) return json({ erro: 'Não foi possível processar o pagamento. Confira os dados e tente de novo.', detalhe: p.message || null }, 400);

  const resp = { id: p.id, status: p.status, detalhe: p.status_detail };
  if (p.status === 'approved') { resp.proximo = OBRIGADO; if (ctx) ctx.waitUntil(enviarEbook(p, env)); }
  const pix = p.point_of_interaction?.transaction_data;
  if (metodo === 'pix' && pix) { resp.pix = { copia_e_cola: pix.qr_code, qr: pix.qr_code_base64, expira: p.date_of_expiration }; }
  return json(resp);
}

// Consulta a situação de um pagamento do e-book (usado enquanto a pessoa paga o Pix).
// Só devolve a situação; o endereço da página de obrigado só vai junto quando o pagamento está aprovado
// e é mesmo deste produto.


async function status(request, env, ctx) {
  const tok = chaveMP(env);
  if (!tok) return json({ erro: 'indisponível' }, 503);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^\d{5,20}$/.test(id)) return json({ erro: 'id inválido' }, 400);
  const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${tok}` } });
  if (!r.ok) return json({ erro: 'não encontrado' }, 404);
  const p = await r.json();
  if (p.external_reference !== 'marmita-leve-21') return json({ erro: 'não encontrado' }, 404);
  const resp = { status: p.status };
  if (p.status === 'approved') { resp.proximo = OBRIGADO; if (ctx) ctx.waitUntil(enviarEbook(p, env)); }
  return json(resp);
}


// ---------- E-mail com o e-book (enviado quando o pagamento é aprovado) ----------
// Funciona com o envio do próprio Cloudflare (binding EMAIL no wrangler.jsonc, exige Workers Paid)
// ou com o Resend (secret RESEND_API_KEY). Sem nenhum dos dois, simplesmente não envia.
const SITE = 'https://esteiraergometrica.com';
const REMETENTE = { email: 'ebook@esteiraergometrica.com', name: 'Marmita Leve em 21 Dias' };

function emailEbook() {
  const pg = SITE + OBRIGADO, pdf = SITE + '/marmita-leve/arquivos-t70ofcjnpd/';
  const html = `<!doctype html><html><body style="margin:0;background:#FAF8F1;font-family:Arial,Helvetica,sans-serif;color:#252A25">
<div style="max-width:560px;margin:0 auto;padding:28px 20px">
<div style="background:#244B38;color:#fff;border-radius:16px 16px 0 0;padding:26px 24px;text-align:center">
<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#E5A64B;font-weight:bold">Pagamento confirmado</div>
<h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:26px">Seu Marmita Leve em 21 Dias chegou!</h1></div>
<div style="background:#fff;border-radius:0 0 16px 16px;padding:24px;border:1px solid #E3E6DC;border-top:0">
<p style="margin:0 0 16px;line-height:1.55">Obrigada pela compra! Guarde este e-mail: por ele você pode baixar o material sempre que precisar.</p>
<p style="margin:0 0 10px"><a href="${pdf}marmita-leve-21-dias.pdf" style="display:block;background:#E5A64B;color:#2A1E08;text-decoration:none;font-weight:bold;text-align:center;padding:15px;border-radius:12px">Baixar o e-book (PDF, 72 páginas)</a></p>
<p style="margin:0 0 18px"><a href="${pdf}planners-para-imprimir.pdf" style="display:block;background:#EAF2E9;color:#244B38;text-decoration:none;font-weight:bold;text-align:center;padding:13px;border-radius:12px">Baixar os planejadores para imprimir</a></p>
<p style="margin:0 0 6px;font-weight:bold">Por onde começar</p>
<ol style="margin:0 0 18px;padding-left:20px;line-height:1.6"><li>Leia o começo: Método Tarde Única e Prato 4 Partes.</li><li>Escolha a sua tarde desta semana.</li><li>Faça as compras da semana 1 com a lista pronta.</li></ol>
<p style="margin:0 0 6px;font-size:14px">Também pode acessar pela página: <a href="${pg}" style="color:#3D7555">${pg}</a></p>
<p style="margin:0;font-size:14px">Dúvidas? Responda este e-mail ou escreva para ebook@esteiraergometrica.com.</p></div>
<p style="font-size:12px;color:#5E675F;text-align:center;line-height:1.5;margin:16px 0 0">Material de organização de refeições; não substitui orientação de nutricionista ou médico.<br>Uso pessoal: por favor, não compartilhe os arquivos.</p>
</div></body></html>`;
  const text = `Pagamento confirmado! Seu Marmita Leve em 21 Dias chegou.

Baixar o e-book (PDF): ${pdf}marmita-leve-21-dias.pdf
Baixar os planejadores para imprimir: ${pdf}planners-para-imprimir.pdf
Página do material: ${pg}

Dúvidas? Responda este e-mail ou escreva para ebook@esteiraergometrica.com.`;
  return { subject: 'Seu e-book Marmita Leve em 21 Dias chegou', html, text };
}

async function enviarEbook(p, env) {
  if (!p || p.status !== 'approved' || p.external_reference !== PRODUTO.referencia) return 'ignorado';
  const para = String(p.metadata?.email || p.payer?.email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(para)) return 'sem-email';
  // evita mandar duas vezes para o mesmo pagamento (o Mercado Pago repete avisos)
  const marca = new Request(`${SITE}/__email-enviado/${p.id}`);
  const cache = caches.default;
  if (await cache.match(marca)) return 'ja-enviado';
  const m = emailEbook();
  try {
    if (env.EMAIL) {
      await env.EMAIL.send({ to: para, from: REMETENTE, replyTo: REMETENTE.email, subject: m.subject, html: m.html, text: m.text });
    } else if (env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${String(env.RESEND_API_KEY).trim()}`, 'Content-Type': 'application/json', 'Idempotency-Key': `ebook-${p.id}` },
        body: JSON.stringify({ from: `${REMETENTE.name} <${REMETENTE.email}>`, to: [para], reply_to: REMETENTE.email, subject: m.subject, html: m.html, text: m.text }),
      });
      if (!r.ok) throw new Error(`Resend ${r.status} ${await r.text()}`);
    } else {
      console.log('E-mail do e-book não enviado: nenhum serviço de e-mail configurado', p.id);
      return 'sem-servico-de-email';
    }
  } catch (e) {
    console.error('Falha ao enviar e-mail do e-book', p.id, e && (e.code || ''), e && e.message);
    return 'erro';
  }
  await cache.put(marca, new Response('1', { headers: { 'Cache-Control': 'max-age=31536000' } }));
  console.log('E-mail do e-book enviado', p.id);
  return 'enviado';
}

async function buscarPagamento(id, tok) {
  const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${tok}` } });
  return r.ok ? r.json() : null;
}

// Aviso do Mercado Pago (webhook). Nunca confiamos no conteúdo: só usamos o id para buscar o pagamento de verdade.
async function webhook(request, env, ctx) {
  const tok = chaveMP(env);
  if (!tok) return json({ ok: false }, 200);
  const u = new URL(request.url);
  let corpo = {};
  try { corpo = await request.json(); } catch {}
  const tipo = corpo.type || corpo.topic || u.searchParams.get('type') || u.searchParams.get('topic') || '';
  const id = String(corpo.data?.id || u.searchParams.get('data.id') || u.searchParams.get('id') || '');
  if (!/payment/.test(tipo) || !/^\d{5,20}$/.test(id)) return json({ ok: true, ignorado: true });
  ctx.waitUntil(buscarPagamento(id, tok).then((p) => enviarEbook(p, env)));
  return json({ ok: true });
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/mp/pagamento') {
      if (request.method !== 'POST') return json({ erro: 'método não permitido' }, 405);
      return pagamento(request, env, ctx);
    }
    if (pathname === '/api/mp/status') {
      if (request.method !== 'GET') return json({ erro: 'método não permitido' }, 405);
      return status(request, env, ctx);
    }
    if (pathname === '/api/mp/webhook') {
      if (request.method !== 'POST') return json({ ok: true });
      return webhook(request, env, ctx);
    }
    if (pathname === '/api/mp/diag') {
      // Diagnóstico sem expor a chave: só diz se ela existe e se tem o formato esperado.
      const t = chaveMP(env), bruto = String(env.MP_ACCESS_TOKEN || '');
      const tipo = /^APP_USR-\d+-\d+-[0-9a-f]{32}-\d+$/.test(t) ? (t.startsWith('APP_USR-7284920251678353-') ? 'access_token_producao' : 'access_token_de_outra_aplicacao_ou_teste')
        : /^APP_USR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t) ? 'public_key'
        : /^TEST-/.test(t) ? 'credencial_de_teste' : /^[A-Za-z0-9]{32}$/.test(t) ? 'client_secret' : /^\d{10,20}$/.test(t) ? 'client_id' : 'desconhecido';
      return json({ tem_chave: !!t, tipo, tinha_espacos_ou_bearer: bruto !== t });
    }
    if (pathname.startsWith('/api/')) return json({ erro: 'não encontrado' }, 404);
    return env.ASSETS.fetch(request);
  },
};
