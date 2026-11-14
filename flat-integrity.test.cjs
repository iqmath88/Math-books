const fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path'); const root=__dirname;
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const core=[...sw.matchAll(/'\.\/([^']*)'/g)].map(m=>m[1]);
for(const f of core)assert.ok(fs.existsSync(path.join(root,f)),`Missing precache: ${f}`);
for(const f of fs.readdirSync(root).filter(x=>x.endsWith('.html'))){
 const s=fs.readFileSync(path.join(root,f),'utf8');
 for(const m of s.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css|png|webmanifest))"/g))
  assert.ok(fs.existsSync(path.join(root,m[1])),`${f}: Missing ${m[1]}`);
}
console.log('PASS flat files='+fs.readdirSync(root).length+' precache='+core.length);
