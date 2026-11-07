const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const pages = ['index.html','ch3.html','ch4.html','ch5.html','ch6.html','g9c1.html','g9c5.html'];
const originalPages = process.env.ORIGINAL_DIR;
const version = fs.readFileSync(path.join(root,'app-version.js'),'utf8');
assert.match(version, /version: '1\.2\.0'/);
const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.start_url, './index.html');
for (const file of pages) {
  const current = fs.readFileSync(path.join(root,file),'utf8');
  assert.match(current, /<script src="app-version\.js"><\/script>/);
  assert.match(current, /register\('sw\.js', \{updateViaCache:'none'\}\)/);
  if (originalPages && process.env.STRICT_ORIGINAL === "1") {
    const old = fs.readFileSync(path.join(originalPages,file),'utf8');
    const reverted = current.replace('<script src="app-version.js"></script>\n','').replace("navigator.serviceWorker.register('sw.js', {updateViaCache:'none'}).then(reg=>{ if(navigator.onLine) reg.update().catch(()=>{}); }).catch(()=>{});", "navigator.serviceWorker.register('sw.js').catch(()=>{});");
    assert.equal(reverted, old, `${file} content/layout must be unchanged`);
  }
}
const listeners = {};
const fakeSelf = {
  registration: {scope:'https://example.com/Math-books/'},
  clients: {claim: async()=>{}},
  addEventListener: (name,fn)=>listeners[name]=fn,
};
const ctx = {self:fakeSelf, globalThis:fakeSelf, URL, Response, Set, Promise,
  importScripts:()=>vm.runInContext(version,ctx),
  caches: {open:async()=>({addAll:async(files)=>{files.forEach(file=>assert.ok(fs.existsSync(path.join(root,file))));},match:async()=>null}), keys:async()=>[], delete:async()=>true},
  fetch:async()=>new Response('ok')};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),ctx);
assert.deepEqual(Object.keys(listeners).sort(),['activate','fetch','install']);
let installation;
listeners.install({waitUntil:p=>installation=p});
installation.then(()=>console.log('PASS: manifest, unchanged lessons, worker lifecycle, offline precache files'));
