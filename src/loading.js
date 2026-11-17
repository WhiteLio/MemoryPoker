export function waitForAsset(task, timeoutMs=6000) {
  return new Promise(resolve=>{
    const timer=setTimeout(()=>resolve(false),timeoutMs);
    Promise.resolve(task).then(()=>true,()=>false).then(ok=>{clearTimeout(timer);resolve(ok);});
  });
}

export function preloadImage(path, timeoutMs=6000) {
  return waitForAsset(new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>{
      const decoded=typeof image.decode==='function'?image.decode():Promise.resolve();
      Promise.resolve(decoded).then(resolve,reject);
    };
    image.onerror=reject;
    image.src=path;
  }),timeoutMs);
}

export async function preloadMenu() {
  const fonts=document.fonts;
  await Promise.all([
    preloadImage('./assets/textures/concrete.jpg'),
    preloadImage('./assets/card-back.svg'),
    ...['500 16px Cinzel','600 16px Cinzel','500 16px "Cinzel Timer"','500 14px ShowKorean'].map(font=>
      waitForAsset(Promise.resolve().then(()=>fonts?.load(font,'기억 포커 공유 카드'))))
  ]);
}
