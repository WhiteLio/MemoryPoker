import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForAsset,preloadImage} from '../src/loading.js';

test('loading resolves failures and stalled assets instead of waiting indefinitely',async()=>{
  assert.equal(await waitForAsset(Promise.resolve(),20),true);
  assert.equal(await waitForAsset(Promise.reject(new Error('offline')),20),false);
  assert.equal(await waitForAsset(new Promise(()=>{}),10),false);
});

test('image loading waits for decoding and bounds a stalled decode',async()=>{
  const original=globalThis.Image;
  let finishDecode;
  globalThis.Image=class {
    set src(value) {queueMicrotask(()=>this.onload());}
    decode() {return new Promise(resolve=>{finishDecode=resolve;});}
  };
  try {
    let complete=false;
    const ready=preloadImage('card.svg',100).then(ok=>{complete=true;return ok;});
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(complete,false);
    finishDecode();
    assert.equal(await ready,true);
    assert.equal(await preloadImage('stalled.svg',10),false);
  } finally {globalThis.Image=original;}
});
