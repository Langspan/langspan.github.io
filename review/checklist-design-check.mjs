import assert from 'node:assert/strict';
export async function checkCompactNavigation(page,width,out){
 const menu=page.locator('[data-mobile-nav]');
 assert.equal(await menu.isVisible(),width<=900,'compact navigation at '+width);
 assert.ok(await page.locator('.header-inner>.brand').isVisible());
 assert.ok(await page.locator('.nav-start').isVisible());
 if(width<=900){
  const summary=menu.locator('summary');
  await summary.focus();await page.keyboard.press('Enter');
  assert.ok(await menu.locator('nav').isVisible());
  assert.equal(await menu.locator('nav a:visible').count(),6);
  const bounds=await menu.locator('nav').boundingBox();
  assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1,'menu viewport bounds');
  assert.ok(bounds.y+bounds.height<=await page.evaluate(()=>innerHeight),'menu vertical bounds');
  for(const link of await menu.locator('nav a').all()){
   const box=await link.boundingBox();assert.ok(box.height>=44,'link target height');
  }
  if(width===390&&out)await page.screenshot({path:out+'/390-compact-navigation.png',animations:'disabled'});
  await menu.locator('nav a').first().focus();await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('open'),null);
  assert.equal(await summary.evaluate(el=>el===document.activeElement),true);
  await summary.click();
  await menu.getByText('Benchmarks',{exact:true}).click();
  assert.equal(await menu.getAttribute('open'),null);
  assert.equal(await page.evaluate(()=>location.hash),'#benchmark');
  await page.evaluate(()=>{history.replaceState(history.state,'',location.pathname);scrollTo({top:0,behavior:'instant'});});
 }
 assert.equal(await page.locator('.lx-distribute').isVisible(),width>640);
 assert.equal(await page.locator('.lx-connector').isVisible(),width>640);
 assert.equal(await page.locator('.lx-stacked-caption:visible').count(),width<=640?2:0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'navigation overflow at '+width);
}
