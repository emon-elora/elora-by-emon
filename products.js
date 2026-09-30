export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT id,name,type,cat,price,badge,image_url,description,stock
    FROM products WHERE active=1 ORDER BY created_at DESC, id DESC
  `).all();
  return Response.json({ products: results || [] }, { headers: { "Cache-Control": "no-store" } });
}
