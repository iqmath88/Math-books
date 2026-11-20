/* Classroom pen: ink must stay on the content when the page under it scrolls (old pages ch3…g12c3.html).
   usage: node tests/ink-scroll.test.cjs */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'); const root=path.join(__dirname,'..'); let fail=0;
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.png':'image/png'};
(async()=>{ const b=await chromium.launch(), pg=await (await b.newContext({viewport:{width:390,height:700}})).newPage();
 await pg.route('http://book.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) return r.fulfill({status:404,body:''}); r.fulfill({body:fs.readFileSync(f),contentType:T[path.extname(f)]||'application/octet-stream'}); });
 for(const page of ['ch3.html','g12c3.html']){
 await pg.goto('http://book.local/'+page,{waitUntil:'networkidle'}); await pg.waitForTimeout(800);
 const ok=await pg.evaluate(()=>{ const b=document.getElementById('mb_pen'); if(!b) return 'no pen'; b.click(); return document.getElementById('mbCanvas').classList.contains('on')?'on':'off'; });
 await pg.mouse.move(150,400); await pg.mouse.down(); for(let x=150;x<=270;x+=10) await pg.mouse.move(x,400); await pg.mouse.up();
 const px=(x,y)=>pg.evaluate(([x,y])=>{ const c=document.getElementById('mbCanvas'), d=c.width/innerWidth; return c.getContext('2d').getImageData(Math.round(x*d),Math.round(y*d),1,1).data[3]; },[x,y]);
 const before=await px(210,400);
 const sc=await pg.evaluate(()=>{ const c=document.getElementById('mbCanvas'); c.style.pointerEvents='none'; let h=document.elementFromPoint(210,400); c.style.pointerEvents=''; while(h&&!(/auto|scroll/.test(getComputedStyle(h).overflowY)&&h.scrollHeight>h.clientHeight+1)) h=h.parentElement; h=h||document.scrollingElement; const t0=h.scrollTop; h.scrollTop+=120; return h.scrollTop-t0; }); await pg.waitForTimeout(150);
 const oldS=await px(210,400), newS=await px(210,400-sc);
 const pass=ok==='on'&&before>0&&(sc===0?newS>0:(oldS===0&&newS>0)); if(!pass) fail++;
 console.log((pass?'PASS ':'FAIL ')+page+' pen='+ok+' scrolled='+sc+' ink old/new='+oldS+'/'+newS); }
 await b.close(); process.exit(fail?1:0); })();
