function preloadImage(path) {
  return new Promise(resolve=>{
    const image=new Image();
    image.onload=()=>image.decode().catch(()=>{}).then(resolve);
    image.onerror=resolve;
    image.src=path;
  });
}

export async function preloadMenu() {
  await Promise.allSettled([
    preloadImage('./assets/textures/concrete.jpg'),
    preloadImage('./assets/card-back.svg'),
    document.fonts.load('500 16px Cinzel'),
    document.fonts.load('600 16px Cinzel'),
    document.fonts.load('500 16px "Cinzel Timer"'),
    document.fonts.load('500 14px ShowKorean', '기억 포커 공유 카드')
  ]);
  await document.fonts.ready;
}
