const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const tasks = new Map();
let nextId = 1;
const priorities = ['baja', 'media', 'alta'];
const seed = {
  id: nextId++, title: 'Explorar la API', completed: false, priority: 'media'
};
tasks.set(seed.id, seed);

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}
function error(res, status, code, message) {
  json(res, status, { error: { code, message } });
}
function allow(res, methods) {
  res.setHeader('Allow', methods.join(', '));
  error(res, 405, 'METHOD_NOT_ALLOWED', 'Método no permitido para esta ruta');
}
async function readJSON(req) {
  const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw { status: 415, code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Usá Content-Type application/json' };
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 65536) throw { status: 413, code: 'BODY_TOO_LARGE', message: 'Body demasiado grande' };
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw { status: 400, code: 'INVALID_JSON', message: 'El body no es JSON válido' }; }
}
function validate(body, partial) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return 'El body debe ser un objeto JSON';
  const keys = Object.keys(body);
  if (keys.some(key => !['title', 'completed', 'priority'].includes(key))) return 'El body contiene campos desconocidos';
  if (partial && keys.length === 0) return 'Enviá al menos un campo para actualizar';
  if ((!partial || Object.hasOwn(body, 'title')) &&
      (typeof body.title !== 'string' || body.title.trim().length < 3 || body.title.trim().length > 80)) {
    return 'title debe tener entre 3 y 80 caracteres después de quitar espacios extremos';
  }
  if (Object.hasOwn(body, 'completed') && typeof body.completed !== 'boolean') return 'completed debe ser booleano';
  if (Object.hasOwn(body, 'priority') && !priorities.includes(body.priority)) return 'priority debe ser baja, media o alta';
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  console.log(req.method + ' ' + url.pathname + url.search);
  try {
    if (url.pathname === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    }
    if (url.pathname === '/api/health') {
      if (req.method !== 'GET') return allow(res, ['GET']);
      return json(res, 200, { status: 'ok', service: 'tareas-api' });
    }
    if (url.pathname === '/api/tasks') {
      if (req.method === 'GET') {
        const filter = url.searchParams.get('completed');
        if (filter !== null && filter !== 'true' && filter !== 'false') {
          return error(res, 400, 'INVALID_QUERY', 'completed debe ser true o false');
        }
        const items = [...tasks.values()].filter(task => filter === null || task.completed === (filter === 'true'));
        return json(res, 200, { items, total: items.length });
      }
      if (req.method === 'POST') {
        const body = await readJSON(req);
        const validation = validate(body, false);
        if (validation) return error(res, 400, 'VALIDATION_ERROR', validation);
        const task = {
          id: nextId++,
          title: body.title.trim(),
          completed: body.completed ?? false,
          priority: body.priority ?? 'media',
        };
        tasks.set(task.id, task);
        return json(res, 201, task, { Location: '/api/tasks/' + task.id });
      }
      return allow(res, ['GET', 'POST']);
    }
    const match = url.pathname.match(/^\/api\/tasks\/([1-9]\d*)$/);
    if (match) {
      if (!['GET', 'PATCH', 'DELETE'].includes(req.method)) return allow(res, ['GET', 'PATCH', 'DELETE']);
      const id = Number(match[1]);
      const task = tasks.get(id);
      if (!task) return error(res, 404, 'TASK_NOT_FOUND', 'La tarea no existe');
      if (req.method === 'GET') return json(res, 200, task);
      if (req.method === 'DELETE') {
        tasks.delete(id);
        res.writeHead(204);
        return res.end();
      }
      const body = await readJSON(req);
      const validation = validate(body, true);
      if (validation) return error(res, 400, 'VALIDATION_ERROR', validation);
      const updated = { ...task, ...body };
      if (Object.hasOwn(body, 'title')) updated.title = body.title.trim();
      tasks.set(id, updated);
      return json(res, 200, updated);
    }
    return error(res, 404, 'ROUTE_NOT_FOUND', 'La ruta no existe');
  } catch (failure) {
    if (failure.status) return error(res, failure.status, failure.code, failure.message);
    console.error(failure);
    return error(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
  }
});
const port = Number(process.env.PORT ?? 3300);
server.listen(port, '127.0.0.1', () => console.log('API de tareas: http://127.0.0.1:' + port));