import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root)) {res.writeHead(403).end();return;}
    let body=await readFile(file);
    if(pathname==='/') body=body.toString().replace('<head>','<head><script src="/scripts/qa-environment.js"></script>');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(body);
  } catch {res.writeHead(404).end('Not found');}
}).listen(4174,'127.0.0.1',()=>console.log('Isolated QA: http://127.0.0.1:4174/'));
