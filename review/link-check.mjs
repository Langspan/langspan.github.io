// Static trust checks for the public pages. No dependencies and no browser.
//   node review/link-check.mjs
// 1. Every in-page anchor and every link to another page's anchor resolves to
//    an id on that page. On the home page, an id the home page hands to
//    technical.html (its legacy-anchor list) resolves if technical.html has it.
// 2. Every langspan.dev/...#anchor link in the repository's Markdown resolves
//    the same way.
// 3. Version text: an element whose whole text is a version (0.2.0 or v0.2.0)
//    carries data-release-version or data-release-number, so
//    assets/latest-release.js keeps it current.
// 4. Hosts: no public page names Gemini CLI.
// 5. Social card: og:image and twitter:image name the same file, and the
//    declared width and height match the PNG.
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('..',import.meta.url).pathname;
const read=p=>readFileSync(join(root,p),'utf8');
const pages=['index.html','technical.html','walkthrough.html','404.html'];
const failures=[];
const fail=m=>failures.push(m);
const ids={};
for(const p of pages)ids[p]=new Set([...read(p).matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
// The home page forwards some old anchors to technical.html in a script.
const homeScripts=[...read('index.html').matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!/^https?:/.test(s));
const forwarded=new Set();
for(const s of homeScripts){const m=read(s).match(/legacy\s*=\s*new Set\(\[([^\]]*)\]\)/);if(m)for(const id of m[1].matchAll(/'([^']+)'/g))forwarded.add(id[1]);}
const resolves=(page,id)=>ids[page]?.has(id)||(page==='index.html'&&forwarded.has(id)&&ids['technical.html'].has(id));
for(const id of forwarded)if(!ids['technical.html'].has(id))fail(`index.html forwards #${id} to technical.html, which has no such id`);
const targetPage=(from,path)=>{if(path===''||path==='./')return from;if(path==='/')return 'index.html';return path.replace(/^\.?\//,'');};
for(const p of pages){
  const html=read(p);
  for(const [,href] of html.matchAll(/\shref="([^"]*#[^"]*)"/g)){
    if(/^[a-z]+:/i.test(href)&&!/^https:\/\/langspan\.dev\//.test(href))continue;
    const local=href.replace(/^https:\/\/langspan\.dev\//,'/');
    const [path,id]=local.split('#');
    if(!id)continue;
    const target=targetPage(p,path);
    if(!pages.includes(target)){fail(`${p}: ${href} points to ${target}, which is not a public page`);continue;}
    if(!resolves(target,id))fail(`${p}: ${href} has no #${id} on ${target}`);
  }
  for(const m of html.matchAll(/<([a-z]+)\b([^>]*)>\s*(v?\d+\.\d+\.\d+)\s*<\/\1>/g))
    if(!/data-release-(version|number)/.test(m[2]))fail(`${p}: version text "${m[3]}" is not marked data-release-version or data-release-number`);
  if(/gemini cli/i.test(html.replace(/<script[\s\S]*?<\/script>/g,'')))fail(`${p}: names Gemini CLI; the supported hosts are Claude Code, Codex, Cursor and Antigravity`);
}
const markdown=[];
const walk=d=>{for(const f of readdirSync(join(root,d))){if(['.git','node_modules'].includes(f))continue;const rel=d?join(d,f):f;if(statSync(join(root,rel)).isDirectory())walk(rel);else if(f.endsWith('.md'))markdown.push(rel);}};
walk('');
for(const md of markdown)for(const [,path,id] of read(md).matchAll(/https:\/\/langspan\.dev\/([a-z0-9-]*\.html)?#([a-z0-9-]+)/gi)){
  const target=path||'index.html';
  if(!pages.includes(target))fail(`${md}: langspan.dev/${path||''}#${id} points to a page that does not exist`);
  else if(!resolves(target,id))fail(`${md}: langspan.dev/${path||''}#${id} has no such id`);
}
for(const p of ['index.html','technical.html']){
  const html=read(p),meta=n=>html.match(new RegExp(`<meta (?:property|name)="${n}" content="([^"]*)"`))?.[1];
  const og=meta('og:image'),tw=meta('twitter:image');
  if(!og||og!==tw){fail(`${p}: og:image and twitter:image must name the same card`);continue;}
  const png=readFileSync(join(root,og.replace('https://langspan.dev/','')));
  if(String(png.readUInt32BE(16))!==meta('og:image:width')||String(png.readUInt32BE(20))!==meta('og:image:height'))fail(`${p}: og:image width and height do not match ${og}`);
  if(/\bv?\d+\.\d+\.\d+\b/.test(meta('og:image:alt')||''))fail(`${p}: og:image:alt names a version; the card has none`);
}
if(failures.length){console.error(failures.join('\n'));console.error(`FAIL link and trust check: ${failures.length} problem(s)`);process.exit(1);}
console.log(`PASS link and trust check: ${pages.length} pages, ${markdown.length} Markdown files, ${forwarded.size} forwarded anchors`);
