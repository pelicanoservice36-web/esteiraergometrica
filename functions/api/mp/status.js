// Consulta a situação de um pagamento do e-book (usado enquanto a pessoa paga o Pix).
// Só devolve a situação; o endereço da página de obrigado só vai junto quando o pagamento está aprovado
// e é mesmo deste produto.

const OBRIGADO = '/marmita-leve/obrigado-t70ofcjnpd';
const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestGet({ request, env }) {
  if (!env.MP_ACCESS_TOKEN) return json({ erro: 'indisponível' }, 503);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^\d{5,20}$/.test(id)) return json({ erro: 'id inválido' }, 400);
  const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } });
  if (!r.ok) return json({ erro: 'não encontrado' }, 404);
  const p = await r.json();
  if (p.external_reference !== 'marmita-leve-21') return json({ erro: 'não encontrado' }, 404);
  const resp = { status: p.status };
  if (p.status === 'approved') resp.proximo = OBRIGADO;
  return json(resp);
}
