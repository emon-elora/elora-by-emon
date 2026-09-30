import { requireAdmin, unauthorized } from './auth.js';
function out(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export async function onRequestGet({request,env}){
 if(!await requireAdmin(request,env)) return unauthorized();
 const {results}=await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC,id DESC').all();
 return out({orders:(results||[]).map(o=>({...o,items:JSON.parse(o.items_json||'[]')}))});
}
export async function onRequestPatch({request,env}){
 if(!await requireAdmin(request,env)) return unauthorized();
 const b=await request.json(); const id=Number(b.id); const status=String(b.status||'pending');
 const allowed=['pending','confirmed','packed','shipped','delivered','cancelled'];
 if(!allowed.includes(status)) return out({error:'Invalid status'},400);
 await env.DB.prepare('UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(status,id).run();
 return out({ok:true});
}
