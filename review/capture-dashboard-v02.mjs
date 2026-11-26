// Verify and capture the released v0.2.0 dashboard, using its own demo data.
import {chromium} from 'playwright';
import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const bin=resolve(process.env.LANGSPAN_BIN),out=resolve('review-output');
mkdirSync(out,{recursive:true});
const dir=mkdtempSync(join(tmpdir(),'ls-v02-')); const state=join(dir,'state');
mkdirSync(state,{mode:0o700});
const child=spawn(bin,['dashboard','--demo','--state-dir',state],{stdio:['ignore','pipe','ignore']});
let browser,printed='';
child.stdout.on('data',d=>printed+=String(d));
try {
  assert.equal(execFileSync(bin,['--version'],{encoding:'utf8'}).trim(),'langspan 0.2.0');
  let url='';
  for(let i=0;i<100;i++){url=printed.match(/http:\/\/127\.0\.0\.1:\d+\/\?t=[a-f0-9]+/i)?.[0]||'';if(url)break;await new Promise(r=>setTimeout(r,100));}
  assert.ok(url,'dashboard started');
  const res=await fetch(url);assert.ok(res.ok);
  const raw=Buffer.from(await res.arrayBuffer());
  const committed=readFileSync('assets/product/langspan-live-v0.2.0.html');
  assert.equal(createHash('sha256').update(raw).digest('hex'),createHash('sha256').update(committed).digest('hex'),'the website demo equals the published binary response');
  const u=new URL(url);const api=await fetch(u.origin+'/api/state',{headers:{'X-LangSpan-Token':u.searchParams.get('t')}});
  assert.equal(api.status,404,'demo never exposes coordinator data');
  browser=await chromium.launch({headless:true});
  for(const [width,height] of [[1440,900],[390,844]]){
    const page=await browser.newPage({viewport:{width,height},colorScheme:'dark',reducedMotion:'reduce',deviceScaleFactor:1});
    const requests=[];
    page.on('request',r=>{if(r.url()!==url&&!r.url().startsWith('data:'))requests.push(r.url().split('?')[0]);});
    await page.goto(url);
    await page.getByText('Simulated data',{exact:true}).first().waitFor();
    assert.equal(await page.locator('#kpis li').count(),7);
    await page.locator('#demo-prev').click();
    assert.ok((await page.locator('#demo-caption').innerText()).startsWith('Scene 3 of 4'));
    assert.ok(await page.locator('#scope').isVisible());
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
    const path=join(out,'langspan-live-v0.2.0-'+width+'.jpg');
    const jpg=await page.screenshot({path,type:'jpeg',quality:84,animations:'disabled'});
    assert.deepEqual(requests,[],'demo makes no external or coordinator requests');
    console.log('PASS dashboard '+width+'px; actual release UI with simulated data');
    // Transfer the capture to the review branch via the GitHub artifact/log.
    // No URL, token, real session or private repository is in the capture.
    if(width===1440){
      const encoded=jpg.toString('base64');
      console.log('LS_CAPTURE_SHA '+createHash('sha256').update(jpg).digest('hex'));
      for(let i=0;i<encoded.length;i+=4000)console.log('LS_CAPTURE_CHUNK '+String(i/4000).padStart(4,'0')+' '+encoded.slice(i,i+4000));
    }
    await page.close();
  }
  writeFileSync(join(out,'langspan-live-v0.2.0.txt'),'Published Linux x86-64 v0.2.0, actual langspan dashboard --demo response, scene 3 of 4. Simulated data, no model sessions, no coordinator data. Captured with Playwright Chromium at 1440x900 and 390x844.\n');
}catch(error){console.error(String(error.message).replace(/([?&]t=)[a-f0-9]+/gi,'$1[redacted]'));process.exitCode=1;}finally{await browser?.close();child.kill('SIGTERM');rmSync(dir,{recursive:true,force:true});}
