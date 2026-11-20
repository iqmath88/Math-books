/* Offline/update engine (sw.js + update.js) in a real browser, on a temporary copy of the site:
   same-release pages come from the release cache · offline works · a new release shows the bar and switches only on «حدّث الآن».
   usage: node tests/sw-update.test.cjs */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),os=require('os'),http=require('http');
const SRC=path.join(__dirname,'..'), D=fs.mkdtempSync(path.join(os.tmpdir(),'mb-sw-'));
for(const f of fs.readdirSync(SRC)) if(fs.statSync(path.join(SRC,f)).isFile()) fs.copyFileSync(path.join(SRC,f),path.join(D,f));
const TY={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{ let p=decodeURIComponent(new URL(q.url,'http://x').pathname); if(p.endsWith('/')) p+='index.html'; const f=path.join(D,p);
 if(!f.startsWith(D)||!fs.existsSync(f)){ r.writeHead(404); return r.end(); } r.writeHead(200,{'Content-Type':TY[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'}); r.end(fs.readFileSync(f)); });
const log=(ok,m)=>{ console.log((ok?'PASS ':'FAIL ')+m); if(!ok) process.exitCode=1; };
(async()=>{ await new Promise(ok=>srv.listen(0,'127.0.0.1',ok)); const U=`http://127.0.0.1:${srv.address().port}/`; const b=await chromium.launch(), ctx=await b.newContext(), pg=await ctx.newPage();
 await pg.goto(U+'v2__g12c6.html'); await pg.evaluate(()=>navigator.serviceWorker.ready); await pg.reload(); await pg.waitForTimeout(800);
 log(await pg.evaluate(()=>!!navigator.serviceWorker.controller),'SW controls the page after install');
 const f=D+'/v2__g12c6.html', orig=fs.readFileSync(f,'utf8'); fs.writeFileSync(f,orig.replace('</body>','<i id="NEWMARK"></i></body>'));
 await pg.goto(U+'v2__g12c6.html'); await pg.waitForTimeout(500);
 log(!(await pg.$('#NEWMARK')),'same release: page comes from the release cache (no new page with old JS)');
 await ctx.setOffline(true); await pg.goto(U+'v2__g12c6.html').catch(()=>{}); await pg.waitForTimeout(800);
 log(await pg.evaluate(()=>document.querySelectorAll('.story,section,article').length>0),'offline: chapter opens'); await ctx.setOffline(false);
 const vf=D+'/app-version.js', v=fs.readFileSync(vf,'utf8'); fs.writeFileSync(vf,v.replace(/1\.\d+\.0/,'9.9.0'));
 await pg.goto(U+'v2__g12c6.html'); await pg.waitForSelector('#updBar',{timeout:20000}).catch(()=>{});
 log(!!(await pg.$('#updBar')),'new release: update bar appears');
 log(!(await pg.$('#NEWMARK')),'before «حدّث الآن»: still the old release (no switch mid-lesson)');
 await Promise.all([pg.waitForNavigation({timeout:20000}).catch(()=>{}), pg.click('#updBar [data-u="go"]')]); await pg.waitForTimeout(1200);
 log(!!(await pg.$('#NEWMARK')),'after «حدّث الآن»: the new page is served');
 log((await pg.evaluate(()=>caches.keys())).every(k=>!/1\.\d+\.0$/.test(k)),'old release cache removed');
 await b.close(); srv.close(); fs.rmSync(D,{recursive:true,force:true}); })();
