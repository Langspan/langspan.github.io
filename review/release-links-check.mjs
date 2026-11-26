import assert from 'node:assert/strict';
const api='https://api.github.com/repos/Langspan/LangSpan.dev/releases/latest';
const base='https://github.com/Langspan/LangSpan.dev/releases';
const targets=["aarch64-apple-darwin","x86_64-apple-darwin","x86_64-unknown-linux-gnu","aarch64-unknown-linux-gnu"];
function fixture(tag){
 return {tag_name:tag,draft:false,prerelease:false,published_at:'2026-11-26T14:06:24Z',
  assets:[...targets.map(t=>'langspan-'+tag+'-'+t+'.tar.gz'),'SHA256SUMS'].map(name=>({name,state:'uploaded',size:100}))};
}
export async function mockLatestRelease(page,tag='v0.2.0'){
 await page.route(api,route=>route.fulfill({json:fixture(tag),headers:{'access-control-allow-origin':'*'}}));
}
async function assertVersion(page,tag){
 const versions=await page.locator('[data-release-version]').allTextContents(),numbers=await page.locator('[data-release-number]').allTextContents();
 assert.ok(versions.length+numbers.length>0,'the page shows the release version');
 assert.ok(versions.every(v=>v===tag)&&numbers.every(n=>n===tag.slice(1)),'every version label shows '+tag);
 const actual=await page.locator('[data-release-target]').evaluateAll(links=>Object.fromEntries(links.map(a=>[a.dataset.releaseTarget,a.href])));
 for(const t of targets)assert.equal(actual[t],base+'/download/'+tag+'/langspan-'+tag+'-'+t+'.tar.gz');
 assert.equal(await page.locator('[data-release-checksums]').getAttribute('href'),base+'/download/'+tag+'/SHA256SUMS');
 for(const a of await page.locator('[data-release-tag-link]').all())assert.equal(await a.getAttribute('href'),base+'/tag/'+tag);
 assert.ok(await page.locator('#start a[href="'+base+'/latest"]').count()>0);
}
export async function checkLatestRelease(browser,site){
 const future='v9.8.7';
 for(const [label,change,expected] of [
  ['new complete release',r=>r,future],
  ['draft',r=>({...r,draft:true}),'v0.2.0'],
  ['prerelease',r=>({...r,prerelease:true}),'v0.2.0'],
  ['missing checksum',r=>({...r,assets:r.assets.filter(a=>a.name!=='SHA256SUMS')}),'v0.2.0'],
  ['missing platform',r=>({...r,assets:r.assets.slice(1)}),'v0.2.0'],
  ['invalid tag',r=>({...r,tag_name:'../other'}),'v0.2.0'],
  ['API rate limit',null,'v0.2.0']
 ]){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route(api,route=>change?route.fulfill({json:change(fixture(future)),headers:{'access-control-allow-origin':'*'}}):route.fulfill({status:403,headers:{'access-control-allow-origin':'*'},body:'rate limited'}));
  await page.goto(site+'/?motion=static',{waitUntil:'networkidle'});
  await assertVersion(page,expected);
  assert.equal(await page.locator('html').getAttribute('data-release-state'),expected===future?'ready':'fallback',label);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,label);
  await page.close();
 }
 const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await page.goto(site+'/',{waitUntil:'domcontentloaded'});
 await assertVersion(page,'v0.2.0');
 await page.close();
 console.log('PASS future release links, incomplete and invalid release fallback, API failure, no-JS fallback');
}
