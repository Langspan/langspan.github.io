// Capture actual released dashboard with constructed hook events. No model sessions.
import {chromium} from 'playwright';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
const bin=resolve(process.env.LANGSPAN_BIN);
const base=mkdtempSync(join(tmpdir(),'ls-proof-')),state=join(base,'state'),repo=join(base,'project');
const out=resolve('review-output');mkdirSync(out,{recursive:true});mkdirSync(state,{mode:0o700});mkdirSync(repo);
const children=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function git(...args){return execFileSync('git',['-C',repo,'-c','user.name=Demo','-c','user.email=demo@example.invalid',...args],{stdio:'pipe'});}
function cli(args,input){return execFileSync(bin,['--state-dir',state,...args],{input,encoding:'utf8',stdio:['pipe','pipe','pipe']});}
function hook(vendor,event){return cli(['hook',vendor,'--workspace','demo','--root',repo],JSON.stringify({cwd:repo,...event}));}
function start(args){const p=spawn(bin,args,{stdio:['ignore','pipe','ignore']});children.push(p);return p;}
let browser;
try{
 git('init','-q','--initial-branch=main');mkdirSync(join(repo,'src'));mkdirSync(join(repo,'tests'));writeFileSync(join(repo,'src','session.ts'),'export function refreshSession() { return true; }\n');writeFileSync(join(repo,'tests','session.test.ts'),'// test coverage\n');git('add','.');git('commit','-qm','Initial demo');
 start(['daemon','--state-dir',state]);let ready=false;
 for(let i=0;i<100;i++){try{cli(['status']);ready=true;break}catch{}await sleep(100)}assert.ok(ready,'daemon ready');
 hook('claude-code',{session_id:'agent-a',hook_event_name:'UserPromptSubmit',prompt:'Update session refresh'});
 hook('codex',{session_id:'agent-b',hook_event_name:'UserPromptSubmit',prompt:'Extend session coverage'});
 const dash=start(['dashboard','--state-dir',state]);let url='';
 dash.stdout.on('data',d=>{url+=String(d)});
 for(let i=0;i<100&&!url.includes('?t=');i++)await sleep(100);assert.ok(url.startsWith('http://127.0.0.1:'),'loopback dashboard started');
 browser=await chromium.launch({headless:true});const p=await browser.newPage({viewport:{width:1280,height:900},colorScheme:'dark',deviceScaleFactor:2});
 // URL includes per-run token; never log it or save it in the artifact.
 await p.goto(url.trim());await p.locator('#agents li.agent').first().waitFor();await p.screenshot({path:join(out,'dashboard-before.png'),fullPage:true});
 const pre={session_id:'agent-a',hook_event_name:'PreToolUse',tool_name:'Write',tool_use_id:'a1',tool_input:{file_path:join(repo,'src/session.ts'),content:'updated'}};
 const first=hook('claude-code',pre);
 const patch=path=>'*** Begin Patch\n*** Update File: '+path+'\n@@\n-a\n+b\n*** End Patch';
 const conflict=hook('codex',{session_id:'agent-b',turn_id:'t',hook_event_name:'PreToolUse',tool_name:'apply_patch',tool_use_id:'b1',tool_input:{command:patch('src/session.ts')}});
 assert.ok(conflict.includes('"permissionDecision":"deny"'),'conflict denied');
 await p.locator('#denials').getByText('conflict',{exact:true}).waitFor({timeout:10000});await p.screenshot({path:join(out,'dashboard-overlap.png'),fullPage:true});
 hook('codex',{session_id:'agent-b',turn_id:'t',hook_event_name:'PreToolUse',tool_name:'apply_patch',tool_use_id:'b2',tool_input:{command:patch('tests/session.test.ts')}});
 await p.locator('#editing').getByText('tests/session.test.ts',{exact:true}).waitFor({timeout:10000});await p.screenshot({path:join(out,'dashboard-independent.png'),fullPage:true});
 const light=await browser.newPage({viewport:{width:1280,height:900},colorScheme:'light',deviceScaleFactor:2});await light.goto(url.trim());await light.locator('#editing').getByText('tests/session.test.ts',{exact:true}).waitFor();await light.screenshot({path:join(out,'dashboard-independent-light.png'),fullPage:true});
 writeFileSync(join(out,'dashboard-provenance.txt'),'Released v0.1.0 Linux x86-64 binary. Actual loopback dashboard; constructed Claude Code/Codex-shaped events, fictional repo, real local coordinator. No model invoked. No production data or access token in media.\n');
 console.log('PASS: real released dashboard shows a refused overlap and independent hold');
}finally{await browser?.close();for(const p of children.reverse())p.kill('SIGTERM');await sleep(500);rmSync(base,{recursive:true,force:true});}
