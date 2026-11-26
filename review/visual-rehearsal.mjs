import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='visual-review-output/frames';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const findings=[];
try{
 for(const width of [1440,390,358]){
  const height=width===1440?900:844;
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',deviceScaleFactor:1});
  page.on('pageerror',e=>findings.push({width,kind:'pageerror',message:e.message}));
  await page.goto('http://127.0.0.1:8124/?motion=static',{waitUntil:'networkidle'});
  await page.screenshot({path:out+'/'+width+'-hero.png'});
  async function capture(name,locator){
   // Capture the real viewport with its sticky header; do not resize
   // the viewport or hide the header to make a long scene fit a screenshot.
   await locator.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
   await page.waitForTimeout(150);
   await page.screenshot({path:out+'/'+width+'-'+name+'.png'});
   const area=await locator.boundingBox();
   if(area&&area.height>height-120){
    let top=await page.evaluate(()=>scrollY);
    for(let i=1;i<Math.ceil(area.height/(height-140));i++){
     await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top+i*(height-140));
     await page.waitForTimeout(100);
     await page.screenshot({path:out+'/'+width+'-'+name+'-part'+(i+1)+'.png'});
    }
   }
  }
  for(const selector of ['#agent-sees','[data-semantic-story]','#semantic-awareness','#capabilities','#benchmark','#evidence','#start']){
   const el=page.locator(selector).first();
   await capture(selector.replace(/[^a-z-]/g,''),el);
  }
  await page.locator('#demo').scrollIntoViewIfNeeded();
  for(const id of ['peer-briefings','edit-coordination','source-awareness','commit-ownership','team-awareness','integration-checks']){
   await page.locator('#cap-tab-'+id).click();
   const panel=page.locator('#'+id);
   const steps=panel.locator(id==='edit-coordination'?'.ls-scene-button':'.cx-step');
   await steps.first().waitFor();
   const count=await steps.count();
   for(let i=0;i<count;i++){
    await steps.nth(i).click();
    await capture(id+'-'+i,panel);
   }
  }
  const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
  if(overflow.document>overflow.viewport+2)findings.push({width,kind:'horizontal-overflow',...overflow});
  await page.close();
 }
}finally{await browser.close();writeFileSync('visual-review-output/frame-findings.json',JSON.stringify(findings,null,2)+'\n');}
if(findings.length)throw Error(JSON.stringify(findings));
