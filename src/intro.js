import {newAttempt} from './state.js';

export const EASE_OUT_QUAD='cubic-bezier(.25,.46,.45,.94)';

export async function newAttemptAfterIntro(number,animations,now=Date.now) {
  await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));
  return newAttempt(number,now());
}
