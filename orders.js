function json(data, status=200){ return Response.json(data, {status, headers:{"Cache-Control":"no-store"}}); }

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const address = String(body.address || '').trim();
    const items = Array.isArray(body.items) ? body.items : [];
    if (!name || !phone || !address || !items.length) return json({error:'Missing order information'},400);

    const ids = items.map(x=>Number(x.id)).filter(Number.isInteger);
    if (!ids.length) return json({error:'Invalid products'},400);
    const placeholders = ids.map(()=>'?').join(',');
    const { results } = await env.DB.prepare(`SELECT id,name,price,stock,active FROM products WHERE id IN (${placeholders})`).bind(...ids).all();
    const map = new Map((results||[]).map(p=>[p.id,p]));
    const clean=[]; let total=0;
    for (const item of items) {
      const p=map.get(Number(item.id)); const qty=Math.max(1,Math.min(99,Number(item.qty)||1));
      if(!p || !p.active) return json({error:'A selected product is unavailable'},409);
      if(Number(p.stock) < qty) return json({error:`Not enough stock for ${p.name}`},409);
      clean.push({id:p.id,name:p.name,price:p.price,qty}); total += p.price*qty;
    }
    await env.DB.prepare(`INSERT INTO orders(customer_name,phone,address,items_json,total) VALUES(?,?,?,?,?)`)
      .bind(name,phone,address,JSON.stringify(clean),total).run();
    return json({ok:true,total});
  } catch(e){ return json({error:'Could not place order'},500); }
}
