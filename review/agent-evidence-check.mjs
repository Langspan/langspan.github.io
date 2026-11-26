import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const hashes=['fd8fe10d9253ec1b18c3fce3a1967f12a5e13ba7311b759ee3dcbb58a815ecb9','0dff963c8e9e7599fc7d3dc957e92187346a8debb327b4338f4fa80023315058'];
export async function checkAgentEvidence(p,width,out){
 const section=p.locator('#agent-sees');
 assert.ok(await section.isVisible());
 assert.equal(await section.locator('.agent-message details[open]').count(),0);
 const records=section.locator('.agent-message');
 assert.equal(await records.count(),2);
 for(let i=0;i<2;i++){
  const message=records.nth(i),raw=await message.locator('pre code').textContent();
  assert.equal(createHash('sha256').update(raw).digest('hex'),hashes[i],'verbatim Codex record '+i);
  for(const excerpt of await message.locator('.agent-message-excerpt code').allTextContents())assert.ok(raw.includes(excerpt),'excerpt is verbatim');
  const summary=message.locator('summary');await summary.focus();await p.keyboard.press('Enter');
  assert.ok(await message.locator('pre').isVisible());
  assert.ok(await message.locator('pre').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'raw record wraps');
  await summary.click();assert.equal(await message.locator('details').getAttribute('open'),null);
 }
 assert.equal(await section.locator('figcaption a').count(),2);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'evidence overflow '+width);
 if(out)await section.screenshot({path:out+'/'+width+'-agent-sees.png',animations:'disabled'});
}
export async function checkArchitecture(p,width,out){
 const diagram=p.locator('.arch-diagram');
 for(const scope of ['local','worktree','remote','local','remote']){
  await p.locator('[data-lx-arch="'+scope+'"]').click();
  assert.equal(await diagram.getAttribute('data-scope'),scope);
  assert.equal(await diagram.locator('.arch-machine:visible').count(),scope==='local'?1:2);
  assert.equal(await diagram.locator('.arch-core:visible').count(),scope==='remote'?2:1);
  assert.equal(await diagram.locator('.arch-git').isVisible(),scope==='remote');
  assert.equal(await diagram.locator('.arch-shared').isVisible(),scope==='worktree');
  assert.equal(await diagram.locator('.arch-lines').isVisible(),scope!=='local');
  if(scope==='local'){
   assert.notEqual(await diagram.locator('.arch-lines').getAttribute('hidden'),null,'SVG hidden attribute must be present');
   const gap=await diagram.evaluate(el=>{const grid=el.querySelector('.arch-machines').getBoundingClientRect(),card=el.querySelector('.arch-machine').getBoundingClientRect();return Math.abs(grid.width-card.width);});
   assert.ok(gap<2,'local card fills the grid');
  }else{
   assert.equal(await diagram.locator('.arch-lines path').getAttribute('stroke-dasharray'),scope==='remote'?'5 4':null);
   const attached=await diagram.evaluate(el=>{
    const svg=el.querySelector('.arch-lines'),path=svg.querySelector('path'),matrix=svg.getScreenCTM();
    const moves=Array.from(path.getAttribute('d').matchAll(/M([\d.]+) 0/g),m=>Number(m[1]));
    const boxes=[...el.querySelectorAll('.arch-machine')].map(n=>n.getBoundingClientRect());
    return moves.length===2&&moves.every((x,i)=>Math.abs(new DOMPoint(x,0).matrixTransform(matrix).x-(boxes[i].left+boxes[i].width/2))<2);
   });
   assert.ok(attached,'connector endpoints align with the actual cards');
  }
  if(out&&(width===1440||width===390))await diagram.screenshot({path:out+'/'+width+'-architecture-'+scope+'.png',animations:'disabled'});
 }
}
