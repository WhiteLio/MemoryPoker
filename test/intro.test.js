import test from 'node:test';
import assert from 'node:assert/strict';
import {newAttemptAfterIntro} from '../src/intro.js';

test('memorization starts after the last card finishes, not the Play click',async()=>{
  let firstDone,lastDone,now=1000,started=false;
  const first={finished:new Promise(resolve=>{firstDone=resolve;})};
  const last={finished:new Promise(resolve=>{lastDone=resolve;})};
  const pending=newAttemptAfterIntro(6,[first,last],()=>now).then(attempt=>{started=true;return attempt;});
  now=1480;firstDone();
  await Promise.resolve();await Promise.resolve();
  assert.equal(started,false);
  now=1630;lastDone();
  const attempt=await pending;
  assert.equal(attempt.startedAt,1630);
  assert.equal(attempt.phase,'memorize');
});
