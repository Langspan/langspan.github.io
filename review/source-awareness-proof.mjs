// Exercise the published binary, not a model. Based on the tagged break-alert
// integration tests. All files, state, hook inputs and sessions are synthetic.
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';

assert.ok(process.env.LANGSPAN_BIN,'Set LANGSPAN_BIN to the released executable.');
const bin=resolve(process.env.LANGSPAN_BIN);
const root=realpathSync(mkdtempSync(join(tmpdir(),'ls-source-proof-')));
const state=join(root,'state'),repo=join(root,'project'),home=join(root,'home');
mkdirSync(state,{mode:0o700});mkdirSync(repo);mkdirSync(home,{mode:0o700});
const env={...process.env,HOME:home,XDG_CONFIG_HOME:join(home,'config'),XDG_STATE_HOME:join(home,'state'),LANGSPAN_STATE_DIR:state,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'};
delete env.CLAUDE_CONFIG_DIR;delete env.CODEX_HOME;delete env.GEMINI_CLI_HOME;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const oldSource='export function priceWithTax(amount: number): number {\n  return amount * 1.2;\n}\n';
const newSource='export function priceWithTax(amount: number, rate: number): number {\n  return amount * (1 + rate);\n}\n';
const caller=(args)=>'import { priceWithTax } from "./billing";\nexport function invoiceTotal(): number {\n  const total = priceWithTax('+args+');\n  return total;\n}\n';
function git(...args){return execFileSync('git',['-C',repo,'-c','user.name=Demo','-c','user.email=demo@example.invalid',...args],{env,stdio:'pipe',timeout:10000});}
function cli(args){return execFileSync(bin,['--state-dir',state,...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:10000});}
async function waitFor(label,predicate,ms=60000){
 const until=Date.now()+ms;let last='';
 while(Date.now()<until){
  try{if(predicate())return}catch(error){last=String(error.message)}
  await sleep(150);
 }
 throw Error(label+' not ready '+last);
}
function hook(session,id,file,content,phase){
 const event={session_id:session,cwd:repo,hook_event_name:phase,tool_name:'Write',tool_use_id:id,tool_input:{file_path:join(repo,file),content}};
 const result=spawnSync(bin,['hook','claude-code','--state-dir',state,'--workspace','source-demo','--root',repo],{input:JSON.stringify(event),env,encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr||String(result.error));
 const diagnostic=JSON.parse(result.stderr.trim().split(/\r?\n/).at(-1));
 const reply=result.stdout.trim()?JSON.parse(result.stdout):{};
 const specific=reply.hookSpecificOutput||{};
 return {coverage:diagnostic.coverage,detail:diagnostic.detail,decision:specific.permissionDecision,context:specific.additionalContext||''};
}
function request(session,id,file,content){
 const r=hook(session,id,file,content,'PreToolUse');
 assert.equal(r.coverage,'admitted',r.detail);
 assert.equal(r.decision,undefined,'advisory context must not decide permission');
 hook(session,id,file,content,'PostToolUseFailure'); // no actual write performed
 return r;
}
let daemon;
try{
 assert.equal(execFileSync(bin,['--version'],{env,encoding:'utf8',timeout:10000}).trim(),'langspan 0.1.0');
 git('init','-q','--initial-branch=main');
 writeFileSync(join(repo,'billing.ts'),oldSource);
 writeFileSync(join(repo,'invoices.ts'),caller('100'));
 git('add','.');git('commit','-qm','Initial example');
 daemon=spawn(bin,['daemon','--state-dir',state],{env,stdio:'ignore'});
 await waitFor('daemon',()=>{cli(['status']);return true},15000);
 cli(['workspace','add','source-demo',repo,'--request-id','workspace']);
 await waitFor('source index',()=>{
  const coverage=JSON.parse(cli(['graph','symbol','source-demo','priceWithTax','--json'])).outcome.coverage;
  return coverage.current_files===2&&coverage.indexable_files===2;
 });
 assert.equal(request('agent-b','b0','invoices.ts',caller('100')).context,'','no warning before change');
 const change=hook('agent-a','a1','billing.ts',newSource,'PreToolUse');
 assert.equal(change.coverage,'admitted',change.detail);
 assert.equal(change.decision,undefined);
 writeFileSync(join(repo,'billing.ts'),newSource);
 const observed=hook('agent-a','a1','billing.ts',newSource,'PostToolUse');
 assert.equal(observed.coverage,'observed',observed.detail);
 await waitFor('interface notice',()=>{
  const events=cli(['events','--limit','1000','--json']);
  return events.includes('interface_changed')&&events.includes('"name":"priceWithTax"')&&events.includes('rate: number');
 });
 assert.equal(request('agent-b','b1','invoices.ts',caller('100, 0.2')).context,'','compatible call needs no alert');
 const bad=request('agent-b','b2','invoices.ts',caller('100'));
 assert.ok(bad.context.startsWith('LangSpan: a call in this write'),bad.context);
 assert.ok(bad.context.includes('matched by name'),bad.context);
 assert.ok(bad.context.includes('"invoices.ts":3 calls "priceWithTax" with 1 argument'),bad.context);
 assert.ok(bad.context.includes('it now takes 2'),bad.context);
 assert.ok(bad.context.includes('billing.ts'),bad.context);
 assert.ok(bad.context.includes('rate: number'),bad.context);
 assert.ok(bad.context.includes('took 1'),bad.context);
 assert.ok(bad.context.includes('not instructions'),bad.context);
 assert.ok(cli(['events','--limit','1000','--json']).includes('interface_alerted'));
 assert.equal(request('agent-b','b3','invoices.ts',caller('100')).context,'','one alert per notice/session');
 console.log('Released LangSpan 0.1.0 · synthetic Claude Code-shaped events · real daemon, index, hooks and Git. No model invoked.');
 console.log('PASS: indexed both files; recorded the changed signature; compatible call received no alert.');
 console.log('PASS: incompatible proposed write admitted without a permission decision; exact advisory context follows:');
 console.log(bad.context.replaceAll(root,'[fixture]'));
 console.log('PASS: alert recorded once; subsequent request for same notice/session was not repeated.');
 console.log('The caller requests were ended using PostToolUseFailure; no caller was executed or automatically repaired.');
}finally{
 if(daemon){daemon.kill('SIGTERM');await Promise.race([new Promise(r=>daemon.once('exit',r)),sleep(500)]);}
 rmSync(root,{recursive:true,force:true});
}
