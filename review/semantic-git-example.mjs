// Reproduce the semantic conflict with real Git and Node, without a model or LangSpan.
// An example inspired by Michele Matozza's Nov 14, 2026 Lanes post.
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const dir=mkdtempSync(join(tmpdir(),'langspan-semantic-'));
const git=(...args)=>execFileSync('git',args,{cwd:dir,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const write=(name,content)=>writeFileSync(join(dir,name),content);
const check=()=>spawnSync(process.execPath,['--test'],{cwd:dir,encoding:'utf8'});
const old="export function priceWithTax(amount) { return amount * 1.2; }\n";
const renamed="export function grossPrice(amount) { return amount * 1.2; }\n";
try{
 git('init','-b','main');git('config','user.name','Example');git('config','user.email','example@example.invalid');
 write('billing.mjs',old);git('add','.');git('commit','-m','Base billing module');
 git('switch','-c','feature/billing');
 write('billing.mjs',renamed);
 write('billing.test.mjs',"import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport {grossPrice} from './billing.mjs';\ntest('billing',()=>assert.equal(grossPrice(100),120));\n");
 assert.equal(check().status,0,'billing branch should pass');git('add','.');git('commit','-m','Rename export');
 git('switch','main');git('switch','-c','feature/invoices');
 write('invoices.mjs',"import { priceWithTax } from './billing.mjs';\nexport const total = priceWithTax(100);\n");
 write('invoices.test.mjs',"import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport {total} from './invoices.mjs';\ntest('invoice total',()=>assert.equal(total,120));\n");
 assert.equal(check().status,0,'invoices branch should pass');git('add','.');git('commit','-m','Add endpoint caller');
 git('switch','main');git('merge','--no-ff','feature/billing','-m','Merge billing');git('merge','--no-ff','feature/invoices','-m','Merge invoices');
 assert.equal(git('diff','--name-only','--diff-filter=U'),'','merge must have no textual conflicts');
 const failed=check();assert.notEqual(failed.status,0,'combined tests must fail');assert.match(failed.stdout+failed.stderr,/priceWithTax/,'failure must name old export');
 console.log('PASS: each branch passes independently; Git merges without conflicts; combined tests fail on the old export.');
 write('invoices.mjs',"import { grossPrice } from './billing.mjs';\nexport const total = grossPrice(100);\n");
 assert.equal(check().status,0,'explicit caller repair must pass');
 console.log('PASS: explicit manual caller repair passes the combined tests. No agent or LangSpan was involved.');
}finally{rmSync(dir,{recursive:true,force:true});}
