import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const story=JSON.parse(readFileSync(new URL('../marketing/story.json',import.meta.url),'utf8'))
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8')
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
assert.equal(story.capabilityExplorer.scenes.length,6)
for(const c of story.capabilityExplorer.scenes){
 assert.ok(html.includes('id="cap-tab-'+c.id+'"'),c.id+' tab')
 const start=html.indexOf('data-cap-panel="'+c.id+'"')
 assert.ok(start>=0,c.id+' panel')
 const end=html.indexOf('</section>',start), panel=html.slice(start,end)
 for(const text of [c.heading,c.summary,c.scope,c.evidenceLabel,c.evidence,...c.beats.flatMap(b=>[b.label,b.event,b.result])]){
  assert.ok(panel.includes(esc(text)),c.id+' stale HTML fallback: '+text)
 }
}
console.log('PASS six capability panels and all static fallback claims match canonical story')
