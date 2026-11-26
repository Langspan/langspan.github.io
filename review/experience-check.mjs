import assert from 'node:assert/strict';
import {checkArchitecture} from './agent-evidence-check.mjs';
export async function checkExperience(p,width,out){
 const exp=p.locator('[data-lx-experiment]');
 await exp.scrollIntoViewIfNeeded();
 for(const n of [2,5,10]){await exp.locator('[data-lx-n="'+n+'"]').click();assert.equal(await exp.locator('[data-lx-agents] span').count(),n*3);}
 for(const family of ['rename','contradiction','discovered']){
   await exp.locator('[data-lx-family]').selectOption(family);
   assert.equal(await p.evaluate(()=>window.LangSpanBenchmark.snapshot().family),family);
 }
 for(const arm of ['worktrees','awareness_only','langspan']){await exp.locator('[data-lx-arm="'+arm+'"]').click();assert.equal(await exp.locator('[data-lx-lane="'+arm+'"]').getAttribute('data-selected'),'true');}
 for(let step=0;step<4;step++){await exp.locator('[data-lx-beat="'+step+'"]').click();assert.equal(await exp.getAttribute('data-beat'),String(step));}
 await p.locator('[data-lx-metric="tokens"]').click();
 assert.equal(await p.locator('[data-lx-metric-title]').innerText(),'Token consumption');
 assert.equal(await p.locator('.lx-metric-detail dd').filter({hasText:'Not established'}).count(),3);
 assert.equal(await p.evaluate(()=>window.LangSpanBenchmark.snapshot().manifest.results),null);
 await p.locator('.lx-manifest summary').click();
 const config=JSON.parse(await p.locator('[data-lx-manifest]').innerText());assert.equal(config.sessions_per_arm,10);assert.equal(config.task_family,'discovered_change');assert.deepEqual(config.conditions,['worktrees','awareness_only','langspan']);
 await p.locator('.lx-manifest summary').click();
 for(const scope of ['local','worktree','remote']){await p.locator('[data-lx-scope="'+scope+'"]').click();assert.equal(await p.locator('[data-lx-scope="'+scope+'"]').getAttribute('aria-pressed'),'true');}
 await checkArchitecture(p,width,out);
 for(const type of ['host','remote','fixture']){await p.locator('[data-lx-proof="'+type+'"]').click();assert.equal(await p.locator('.evidence-item:visible').count(),1);}
 await p.locator('[data-lx-proof="host"]').click();
 await p.locator('[data-lx-install] summary').click();
 for(const host of await p.locator('[data-lx-host]').all())await host.uncheck();
 assert.ok(await p.locator('[data-lx-confirm]').isDisabled());
 await p.locator('[data-lx-host]').first().check();
 await p.locator('[data-lx-confirm]').click();assert.ok(await p.locator('[data-lx-setup-result]').isVisible());
 await p.locator('[data-lx-install] summary').click();
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'experience overflow '+width);
 await p.locator('#benchmark').screenshot({path:out+'/'+width+'-benchmark.png'});
}
