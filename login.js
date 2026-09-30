function json(data,status=200,headers={}){ return Response.json(data,{status,headers:{"Cache-Control":"no-store",...headers}}); }

export async function onRequestPost({request,env}){
  const body=await request.json().catch(()=>({}));
  const password=String(body.password||'');
  if(!env.ADMIN_PASSWORD || password!==env.ADMIN_PASSWORD) return json({error:'Invalid password'},401);
  const token=crypto.randomUUID()+crypto.randomUUID();
  const expires=Math.floor(Date.now()/1000)+60*60*24*7;
  await env.DB.prepare('INSERT INTO sessions(token,expires_at) VALUES(?,?)').bind(token,expires).run();
  return json({ok:true},{headers:{'Set-Cookie':`elora_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`}});
}
