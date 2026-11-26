// Renders marketing/film/social-card.html to assets/product/social-card.png
// at exactly 1280 x 640, and checks that nothing in the card is clipped.
// Run from the repository root after installing Playwright into review/:
//   npm install --prefix review --no-save --ignore-scripts playwright@1.65.1
//   node marketing/scripts/social-card.mjs
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=createRequire(new URL('../../review/package.json',import.meta.url))('playwright');
const source=resolve('marketing/film/social-card.html'),out=resolve('assets/product/social-card.png');
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1280,height:640},deviceScaleFactor:1});
await page.goto(pathToFileURL(source).href);
await page.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode())]));
assert.doesNotMatch(await page.evaluate(()=>document.body.innerText),/\d+\.\d+/,'the card must not show a version number');
const fits=await page.evaluate(()=>[...document.querySelectorAll('h1,code,.chip,img,.panel')].every(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=1280&&r.bottom<=640;}));
assert.ok(fits,'an element of the card falls outside 1280 x 640');
await page.screenshot({path:out});
await browser.close();
const png=readFileSync(out);
assert.equal(png.readUInt32BE(16),1280);assert.equal(png.readUInt32BE(20),640);
console.log('PASS social card: 1280 x 640, no version number, nothing clipped');
