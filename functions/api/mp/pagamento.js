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

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  if (!env.MP_ACCESS_TOKEN) return json({ erro: 'Pagamento indisponível no momento.' }, 503);
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
      'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': chave,
      ...(f.device_id ? { 'X-meli-session-id': String(f.device_id).slice(0, 100) } : {}),
    },
    body: JSON.stringify(corpo),
  });
  const p = await r.json().catch(() => ({}));
  if (!r.ok || !p.id) return json({ erro: 'Não foi possível processar o pagamento. Confira os dados e tente de novo.', detalhe: p.message || null }, 400);

  const resp = { id: p.id, status: p.status, detalhe: p.status_detail };
  if (p.status === 'approved') resp.proximo = OBRIGADO;
  const pix = p.point_of_interaction?.transaction_data;
  if (metodo === 'pix' && pix) { resp.pix = { copia_e_cola: pix.qr_code, qr: pix.qr_code_base64, expira: p.date_of_expiration }; }
  return json(resp);
}
