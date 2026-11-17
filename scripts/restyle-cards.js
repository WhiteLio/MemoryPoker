import {readFile,writeFile,readdir} from 'node:fs/promises';
const directory=new URL('../assets/cards/',import.meta.url);
for(const name of await readdir(directory)) {
  if(!name.endsWith('.svg')) continue;
  let svg=await readFile(new URL(name,directory),'utf8');
  const gradients=new Map();
  for(const match of svg.matchAll(/<(?:linear|radial)Gradient\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:linear|radial)Gradient>)/g)) {
    const id=match[1].match(/\bid="([^"]+)"/)?.[1];
    const color=match[2]?.match(/stop-color\s*:\s*([^;"\s]+)/)?.[1];
    const href=match[1].match(/(?:xlink:)?href="#([^"]+)"/)?.[1];
    if(id) gradients.set(id,{color,href});
  }
  function flatColor(id,seen=new Set()) {
    if(seen.has(id)) return '#ffffff';
    seen.add(id);
    const gradient=gradients.get(id);
    return gradient?.color || (gradient?.href?flatColor(gradient.href,seen):'#ffffff');
  }
  svg=svg.replace(/url\(#([^)]*)\)/g,(match,id)=>gradients.has(id)?flatColor(id):match);
  svg=svg.replace(/<(?:linear|radial)Gradient\b[^>]*?(?:\/>|>[\s\S]*?<\/(?:linear|radial)Gradient>)/g,'');
  svg=svg.replace(/font-family:[^;"\n]+/g,"font-family:Georgia,'Times New Roman',serif");
  svg=svg.replace(/-inkscape-font-specification:[^;"\n]+/g,'-inkscape-font-specification:Georgia');
  // The source's gloss is a separate blurred white path, not just a gradient.
  svg=svg.replace(/<path\b(?=[^>]*\bstyle="[^"]*filter:url\()[^>]*\/>/g,'');
  svg=svg.replace(/<filter\b[^>]*>[\s\S]*?<\/filter>/g,'');
  svg=svg.replace(/<path\b[^>]*\bid="path5"[^>]*\/>/g,tag=>tag.replace(/style="([^"]*)"/,(_,style)=>`style="${style};stroke:none"`));
  svg=svg.replace(/#ffffff\b/gi,'#f8f7f2').replace(/#fff\b/gi,'#f8f7f2');
  await writeFile(new URL(name,directory),svg);
}
console.log('Restyled 52 card faces: serif indices and solid fills.');
