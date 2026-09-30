export async function requireAdmin(request,env){
  const cookie=request.headers.get('Cookie')||'';
  const m=cookie.match(/(?:^|;\s*)elora_admin=([^;]+)/);
  if(!m) return false;
  const row=await env.DB.prepare('SELECT token FROM sessions WHERE token=? AND expires_at>?').bind(m[1],Math.floor(Date.now()/1000)).first();
  return !!row;
}
export function unauthorized(){ return Response.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}}); }
