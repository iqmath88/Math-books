/* Screenshot a lesson of the v2 book at phone width, teacher mode (solutions open), as tiles.
   usage: node tools/book-shot.cjs g12c3 rates outdir [--width 390] [--student] */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const [book,les,out]=process.argv.slice(2), A=process.argv, wi=A.indexOf('--width'), W=wi>0?+A[wi+1]:390;
(async()=>{ const b=await chromium.launch(), ctx=await b.newContext({viewport:{width:W,height:860},deviceScaleFactor:1}), pg=await ctx.newPage(), root=path.join(__dirname,'..');
 const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/json'};
 await pg.route('http://book.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) return r.fulfill({status:404,body:''}); r.fulfill({body:fs.readFileSync(f),contentType:T[path.extname(f)]||'application/octet-stream'}); });
 await pg.addInitScript(s=>{ try{ localStorage.setItem('lb-role',s?'student':'teacher'); }catch(e){} },A.includes('--student'));
 await pg.goto(`http://book.local/v2/${book}.html#l=${les}`,{waitUntil:'networkidle'}); await pg.waitForTimeout(1500);
 fs.mkdirSync(out,{recursive:true}); const H=await pg.evaluate(()=>document.documentElement.scrollHeight);
 await pg.screenshot({path:path.join(out,'full.png'),fullPage:true}); console.log('height',H); await b.close(); })();
