import { requireAdmin, unauthorized } from './auth.js';
function out(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}

export async function onRequestGet({request,env}){
 if(!await requireAdmin(request,env)) return unauthorized();
 const {results}=await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC,id DESC').all();
 return out({products:results||[]});
}
export async function onRequestPost({request,env}){
 if(!await requireAdmin(request,env)) return unauthorized();
 const b=await request.json();
 const name=String(b.name||'').trim(); if(!name) return out({error:'Name required'},400);
 const r=await env.DB.prepare(`INSERT INTO products(name,type,cat,price,badge,image_url,description,stock,active) VALUES(?,?,?,?,?,?,?,?,1)`)
  .bind(name,String(b.type||'Fashion'),String(b.cat||'fashion'),Number(b.price)||0,String(b.badge||'NEW'),String(b.image_url||''),String(b.description||''),Math.max(0,Number(b.stock)||0)).run();
 return out({ok:true,id:r.meta.last_row_id},201);
}
export async function onRequestPatch({request,env}){
 if(!await requireAdmin(request,env)) return unauthorized();
 const b=await request.json(); const id=Number(b.id); if(!id) return out({error:'Invalid id'},400);
 await env.DB.prepare(`UPDATE products SET name=?,type=?,cat=?,price=?,badge=?,image_url=?,description=?,stock=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
 .bind(String(b.name||''),String(b.type||'Fashion'),String(b.cat||'fashion'),Number(b.price)||0,String(b.badge||'NEW'),String(b.image_url||''),String(b.description||''),Math.max(0,Number(b.stock)||0),b.active?1:0,id).run();
 return out({ok:true});
}
export async function onRequestDelete({request,env}){
 if(!await requireAdmin(request,env)) return unauthorized();
 const b=await request.json(); const id=Number(b.id); await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run(); return out({ok:true});
}
