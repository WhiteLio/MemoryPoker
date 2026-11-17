import { cp, mkdir, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'styles.css', 'favicon.svg', 'src', 'styles', 'assets', 'LICENSE', 'THIRD_PARTY.md']) {
  await cp(new URL(`../${path}`, import.meta.url), new URL(path, output), { recursive: true });
}
const paths=(await readdir(output,{recursive:true})).filter(path=>/\.(?:js|css|html)$/.test(path)).sort();
const sources=await Promise.all(paths.map(path=>readFile(new URL(path.replaceAll('\\','/'),output),'utf8')));
const hash=createHash('sha256');
paths.forEach((path,i)=>hash.update(path).update(sources[i]));
const version=hash.digest('hex').slice(0,12);
// Version the whole module graph together so cached dependencies match the page.
await Promise.all(paths.map((path,i)=>{
  let source=sources[i];
  if(path.endsWith('.html')) source=source.replace(/((?:src|href)=["'])(\.[^"']+\.(?:js|css))(["'])/g,`$1$2?v=${version}$3`);
  if(path.endsWith('.js')) source=source.replace(/(from\s*["'])(\.[^"']+\.js)(["'])/g,`$1$2?v=${version}$3`);
  return writeFile(new URL(path.replaceAll('\\','/'),output),source);
}));
console.log(`Built static site in dist/ (${version})`);
