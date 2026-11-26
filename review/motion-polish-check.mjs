import assert from 'node:assert/strict';
export async function checkMotionPolish(p,width,out){
  const exp=p.locator('[data-lx-experiment]');
  if(await p.locator('html').getAttribute('data-motion-paused')==='true')await p.locator('[data-motion-toggle]').click();
  await exp.scrollIntoViewIfNeeded();
  await exp.locator('[data-lx-beat="3"]').click();
  assert.equal(await p.evaluate(()=>window.LangSpanBenchmark.snapshot().running),false);
  await exp.locator('[data-lx-play]').click();
  await p.waitForFunction(()=>window.LangSpanBenchmark.snapshot().running);
  if(width===1440||width===390)await p.waitForFunction(()=>window.LangSpanBenchmark.snapshot().beat===0,{},{timeout:6500});
  await exp.locator('[data-lx-play]').click();
  const clock=await p.evaluate(()=>window.LangSpanBenchmark.snapshot().elapsed);
  await p.waitForTimeout(150);
  assert.equal(await p.evaluate(()=>window.LangSpanBenchmark.snapshot().elapsed),clock,'benchmark manual pause');
  for(const id of ['peer-briefings','edit-coordination','source-awareness','commit-ownership','team-awareness','integration-checks']){
    await p.locator('#cap-tab-'+id).click();
    const panel=p.locator('#'+id),steps=panel.locator(id==='edit-coordination'?'.ls-scene-button':'.cx-step');
    await steps.first().waitFor();
    await steps.last().click();
    await p.waitForTimeout(150);
    const bounds=await panel.evaluate(el=>{
      const selector=el.id==='edit-coordination'?'.ls-terminal,.ls-shared-work':'.cx-window,.cx-result';
      const boxes=[...el.querySelectorAll(selector)].map(n=>n.getBoundingClientRect());
      const stage=el.querySelector('.ss-stage').getBoundingClientRect();
      return {outside:boxes.some(b=>b.x<stage.x-2||b.right>stage.right+2||b.y<stage.y-2||b.bottom>stage.bottom+2),
        overlap:boxes.some((a,i)=>boxes.slice(i+1).some(b=>Math.min(a.right,b.right)-Math.max(a.x,b.x)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>2))};
    });
    assert.equal(bounds.outside,false,id+' stage bounds at '+width);
    assert.equal(bounds.overlap,false,id+' panel overlap at '+width);
    if(width===1440||width===390)await panel.screenshot({path:out+'/'+width+'-polish-'+id+'.png'});
    if((width===1440||width===390)&&(id==='edit-coordination'||id==='peer-briefings')){
      const control=panel.locator(id==='edit-coordination'?'.ls-play-button':'.cx-play');
      await panel.locator(id==='edit-coordination'?'.ls-demo-stage':'.cx-stage').scrollIntoViewIfNeeded();
      await control.click();
      await p.waitForFunction(({id})=>document.querySelector('#'+id+(id==='edit-coordination'?' .ls-scene-content':' .cx-demo'))?.dataset.beat==='0',{id},{timeout:7000});
      await steps.first().click();
    }
  }
  const sem=p.locator('[data-semantic-story]');let heights=[];
  for(let i=0;i<3;i++){await sem.locator('[data-sem-step="'+i+'"]').click();heights.push((await sem.boundingBox()).height);}
  assert.ok(Math.max(...heights)-Math.min(...heights)<3,'semantic story jumps between beats');
  for(const scope of ['worktree','local','remote']){
    await p.locator('[data-lx-arch="'+scope+'"]').click();
    assert.equal(await p.locator('[data-lx-topology]:visible').count(),1);
    assert.equal(await p.locator('[data-lx-topology="'+scope+'"] .arch-core').count(),scope==='remote'?2:1);
  }
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'polish overflow '+width);
}
