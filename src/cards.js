import {face,suit} from './poker.js';
export const cardPath = card => `./assets/cards/classic/${face(card)}${['C','D','H','S'][suit(card)]}.svg`;
export async function preloadCards(cards) {
  await Promise.all([...new Set(cards)].map(card=>new Promise(resolve=>{
    const image=new Image();
    image.onload=()=>image.decode().catch(()=>{}).then(resolve);
    image.onerror=resolve;
    image.src=cardPath(card);
  })));
}
