import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const story=JSON.parse(readFileSync('marketing/parallel-story.json','utf8'));const html=readFileSync('technical.html','utf8');const js=readFileSync('assets/parallel-story.js','utf8');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const b of story.semantic.beats)for(const s of [b.label,b.title,b.description,b.result])assert.ok(html.includes(esc(s)),s);
for(const b of story.topology.phases)for(const s of [b.title,b.body])assert.ok(js.includes(s),s);
for(const r of story.research)for(const s of [r.name,r.metric,r.desc,r.href])assert.ok(html.includes(esc(s)),s);
assert.ok(html.includes(esc(story.topology.boundary)));assert.ok(html.includes(esc(story.semantic.boundary)));
console.log('PASS scale, semantic example and research copy match the canonical story');

const source=story.sourceAwareness;
for(const s of [source.title,source.category,source.summary,source.scope,source.definitionFile,source.callerFile,source.oldSignature,source.newSignature,source.call,source.relation,source.advisory,source.message,source.decision,source.detail,source.indexScope,source.planned,source.disclosure,source.sources.index,source.sources.alerts,source.sources.rename,source.sources.worktrees,source.sources.fixture])assert.ok(html.includes(esc(s)),'semantic awareness copy missing: '+s);
assert.ok(html.indexOf('id="semantic-awareness"')>html.indexOf('id="why"'));
assert.ok(html.indexOf('id="semantic-awareness"')<html.indexOf('id="research"'));
assert.ok(html.includes('data-semantic-layer'));
console.log('PASS source-awareness example and evidence boundaries match canonical story');
