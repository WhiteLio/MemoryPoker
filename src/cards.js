import {preloadImage} from './loading.js';
import {face,suit} from './poker.js';
export const cardPath = card => `./assets/cards/classic/${face(card)}${['C','D','H','S'][suit(card)]}.svg`;
export async function preloadCards(cards) {
  const loaded=await Promise.all([...new Set(cards)].map(card=>preloadImage(cardPath(card))));
  return loaded.every(Boolean);
}
