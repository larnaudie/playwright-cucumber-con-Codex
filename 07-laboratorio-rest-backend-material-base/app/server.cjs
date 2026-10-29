const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const tasks = new Map();
const sessions = new Map();
const priorities = ['baja', 'media', 'alta'];
let nextId = 1;
tasks.set(nextId, { id: nextId++, title: 'Explorar REST', completed: false, priority: 'media' });

function send(req, res, status, body, headers = {}) {
  const text = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Request-Id': req.requestId,
    ...headers,
  });
  res.end(req.method === 'HEAD' ? undefined : text);
}
function fail(req, res, status, code, message, headers = {}) {
  send(req, res, status, { error: { code, message, requestId: req.requestId } }, headers);
}
function allow(req, res, methods) {
  if (req.method === 'OPTIONS') return send(req, res, 204, undefined, { Allow: [...methods, 'OPTIONS'].join(', ') });
  fail(req, res, 405, 'METHOD_NOT_ALLOWED', 'Método no permitido', { Allow: [...methods, 'OPTIONS'].join(', ') });
}
async function read(req) {
  const type = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if(type !== 'application/json') throw { status:415, code:'UNSUPPORTED_MEDIA_TYPE', message:'Usá application/json' };
  const chunks=[]; let size=0;
  for await(const chunk of req) {
    size+=chunk.length;
    if(size>65536) throw {status:413,code:'BODY_TOO_LARGE',message:'Body mayor que 64 KiB'};
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw {status:400,code:'INVALID_JSON',message:'JSON mal formado'}; }
}
function validate(body, method) {
  if(!body || typeof body !== 'object' || Array.isArray(body)) return 'El body debe ser un objeto JSON';
  const keys=Object.keys(body);
  if(keys.some(k=>!['title','completed','priority'].includes(k))) return 'Campo desconocido';
  if(method==='PATCH' && keys.length===0) return 'PATCH requiere al menos un campo';
  if(method==='PUT' && !['title','completed','priority'].every(k=>Object.hasOwn(body,k))) return 'PUT requiere title, completed y priority';
  if((method!=='PATCH' || Object.hasOwn(body,'title')) &&
    (typeof body.title!=='string' || body.title.trim().length<3 || body.title.trim().length>80)) return 'title debe tener entre 3 y 80 caracteres';
  if(Object.hasOwn(body,'completed') && typeof body.completed!=='boolean') return 'completed debe ser booleano';
  if(Object.hasOwn(body,'priority') && !priorities.includes(body.priority)) return 'priority inválida: baja, media o alta';
  return null;
}
function conflict(title, exclude) {
  return [...tasks.values()].some(t=>t.id!==exclude && t.title.toLowerCase()===title.toLowerCase());
}
function authenticate(req,res) {
  const match=(req.headers.authorization??'').match(/^Bearer (.+)$/);
  const session=match && sessions.get(match[1]);
  if(!session || session.expiresAt<=Date.now()){
    fail(req,res,401,'UNAUTHORIZED','Token ausente, inválido o vencido',{'WWW-Authenticate':'Bearer'});
    return null;
  }
  return session;
}
const server=http.createServer(async(req,res)=>{
  req.requestId=randomUUID();
  const url=new URL(req.url,'http://127.0.0.1');
  console.log(req.requestId+' '+req.method+' '+url.pathname+url.search);
  try{
    if(url.pathname==='/' && req.method==='GET'){
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      return res.end(fs.readFileSync(path.join(__dirname,'index.html')));
    }
    if(url.pathname==='/api/health'){
      if(!['GET','HEAD'].includes(req.method))return allow(req,res,['GET','HEAD']);
      return send(req,res,200,{status:'ok',service:'rest-lab-07'});
    }
    if(url.pathname==='/api/sessions'){
      if(req.method==='DELETE'){
        const session=authenticate(req,res); if(!session)return;
        const token=req.headers.authorization.slice(7); sessions.delete(token);
        return send(req,res,204);
      }
      if(req.method!=='POST')return allow(req,res,['POST','DELETE']);
      const body=await read(req);
      if(!body || typeof body!=='object' || Array.isArray(body) || typeof body.email!=='string' || typeof body.password!=='string'){
        return fail(req,res,422,'VALIDATION_ERROR','Se requieren email y password');
      }
      const role=body.email==='qa@example.test'?'user':body.email==='admin@example.test'?'admin':null;
      if(!role || body.password!=='Aprender123!')return fail(req,res,401,'INVALID_CREDENTIALS','Credenciales incorrectas',{'WWW-Authenticate':'Bearer'});
      const accessToken=randomUUID(); const expiresIn=1800;
      sessions.set(accessToken,{email:body.email,role,expiresAt:Date.now()+expiresIn*1000});
      return send(req,res,201,{accessToken,tokenType:'Bearer',expiresIn,user:{email:body.email,role}});
    }
    if(url.pathname==='/api/profile' || url.pathname==='/api/admin/stats'){
      if(req.method!=='GET')return allow(req,res,['GET']);
      const session=authenticate(req,res); if(!session)return;
      if(url.pathname==='/api/admin/stats'){
        if(session.role!=='admin')return fail(req,res,403,'FORBIDDEN','Se requiere rol admin');
        return send(req,res,200,{taskCount:tasks.size});
      }
      return send(req,res,200,{email:session.email,role:session.role});
    }
    if(url.pathname==='/api/lab/status/429' || url.pathname==='/api/lab/status/500' || url.pathname==='/api/lab/status/503'){
      if(req.method!=='GET')return allow(req,res,['GET']);
      const status=Number(url.pathname.split('/').pop());
      return fail(req,res,status,'SIMULATED_'+status,'Respuesta simulada del laboratorio',
        status===429||status===503?{'Retry-After':'2'}:{});
    }
    if(url.pathname==='/api/lab/delay'){
      if(req.method!=='GET')return allow(req,res,['GET']);
      const raw=url.searchParams.get('ms')??'500';
      if(!/^\d+$/.test(raw)||Number(raw)>2000)return fail(req,res,400,'INVALID_QUERY','ms debe ser entero entre 0 y 2000');
      return setTimeout(()=>send(req,res,200,{delayedMs:Number(raw)}),Number(raw));
    }
    if(url.pathname==='/api/tasks'){
      if(['GET','HEAD'].includes(req.method)){
        const known=['completed','priority','q','page','limit'];
        if([...url.searchParams.keys()].some(k=>!known.includes(k)))return fail(req,res,400,'INVALID_QUERY','Parámetro desconocido');
        const completed=url.searchParams.get('completed');
        const priority=url.searchParams.get('priority');
        const q=url.searchParams.get('q')??'';
        const page=url.searchParams.get('page')??'1';
        const limit=url.searchParams.get('limit')??'10';
        if((completed!==null&&!['true','false'].includes(completed))||
          (priority!==null&&!priorities.includes(priority))||
          !/^[1-9]\d*$/.test(page)||!/^[1-9]\d*$/.test(limit)||
          !Number.isSafeInteger(Number(page))||Number(limit)>50)
          return fail(req,res,400,'INVALID_QUERY','Filtro o paginación inválidos');
        const all=[...tasks.values()].filter(t=>
          (completed===null||t.completed===(completed==='true'))&&
          (priority===null||t.priority===priority)&&t.title.toLowerCase().includes(q.toLowerCase()));
        const start=(Number(page)-1)*Number(limit);
        return send(req,res,200,{items:all.slice(start,start+Number(limit)),total:all.length,page:Number(page),limit:Number(limit)});
      }
      if(req.method!=='POST')return allow(req,res,['GET','HEAD','POST']);
      const body=await read(req); const validation=validate(body,'POST');
      if(validation)return fail(req,res,422,'VALIDATION_ERROR',validation);
      const title=body.title.trim();
      if(conflict(title))return fail(req,res,409,'TITLE_CONFLICT','Ya existe una tarea con ese título');
      const task={id:nextId++,title,completed:body.completed??false,priority:body.priority??'media'};
      tasks.set(task.id,task);
      return send(req,res,201,task,{Location:'/api/tasks/'+task.id});
    }
    const match=url.pathname.match(/^\/api\/tasks\/([1-9]\d*)$/);
    if(match){
      const methods=['GET','HEAD','PUT','PATCH','DELETE'];
      if(!methods.includes(req.method))return allow(req,res,methods);
      const id=Number(match[1]);const task=tasks.get(id);
      if(!task)return fail(req,res,404,'TASK_NOT_FOUND','La tarea no existe');
      if(['GET','HEAD'].includes(req.method))return send(req,res,200,task);
      if(req.method==='DELETE'){tasks.delete(id);return send(req,res,204);}
      const body=await read(req);const validation=validate(body,req.method);
      if(validation)return fail(req,res,422,'VALIDATION_ERROR',validation);
      const updated=req.method==='PUT'?{id,title:body.title.trim(),completed:body.completed,priority:body.priority}:{...task,...body};
      updated.title=updated.title.trim();
      if(conflict(updated.title,id))return fail(req,res,409,'TITLE_CONFLICT','Ya existe una tarea con ese título');
      tasks.set(id,updated);
      return send(req,res,200,updated);
    }
    return fail(req,res,404,'ROUTE_NOT_FOUND','Ruta no encontrada');
  }catch(e){
    if(e.status)return fail(req,res,e.status,e.code,e.message);
    console.error(e);return fail(req,res,500,'INTERNAL_ERROR','Error interno inesperado');
  }
});
server.listen(Number(process.env.PORT??3400),'127.0.0.1',()=>console.log('Laboratorio REST: http://127.0.0.1:'+(process.env.PORT??3400)));