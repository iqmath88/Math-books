/* Math-books functional test suite (Playwright, Chromium).
   usage: BASE=http://localhost:8770/math-books/ node tests/e2e.cjs [--only T04,T14]
   Serve the PARENT folder so the app lives under a sub-path, exactly like GitHub Pages (/Math-books/). */
const {chromium,devices}=require('playwright');
const fs=require('fs'), path=require('path');
const BASE=process.env.BASE||'http://localhost:8770/math-books/';
const ONLY=(process.argv.find(a=>a.startsWith('--only='))||'').slice(7).split(',').filter(Boolean);
const R=[]; const rec=(id,name,ok,detail='')=>{ R.push({id,name,ok,detail:String(detail).slice(0,400)}); console.log((ok===true?'PASS':ok===false?'FAIL':'SKIP').padEnd(5),id,name,detail?'— '+String(detail).slice(0,200):''); };
const V2=['g12c3','g12c4','g12c5','ch3','ch4','ch5','ch6','g9c1','g9c5'], CLASSIC=['g12c3','ch3','ch4','ch5','ch6','g9c1','g9c5'];
const VIEWPORTS={phone:{width:390,height:844},ipad:{width:1180,height:820},board:{width:1920,height:1080}};
const want=id=>!ONLY.length||ONLY.includes(id);

async function page(b,vp='board',o={}){ const ctx=o.ctx||await b.newContext({viewport:VIEWPORTS[vp],hasTouch:vp!=='board',...(o.ctxOpts||{})}); const pg=await ctx.newPage(); const errs=[];
  pg.on('pageerror',e=>errs.push('pageerror: '+e.message)); pg.on('console',m=>{ if(m.type()==='error'&&!/favicon|No character metrics/.test(m.text())) errs.push('console: '+m.text()); });
  pg.on('requestfailed',r=>{ if(!o.offline) errs.push('requestfailed: '+r.url()); }); pg.on('response',r=>{ if(r.status()>=400) errs.push(r.status()+' '+r.url()); });
  return {ctx,pg,errs}; }

(async()=>{
 const b=await chromium.launch();
 process.on('unhandledRejection',e=>{ rec('ERR','استثناء غير متوقع في الاختبار',false,e.message.split('\n')[0]); });
 /* T01 library */
 if(want('T01')){ const {ctx,pg,errs}=await page(b); await pg.goto(BASE); await pg.waitForSelector('.book');
  const n=await pg.$$eval('a.book:not(.lock)',a=>a.length); rec('T01','المكتبة تفتح دون أخطاء',errs.length===0&&n>=8,`${n} فصول متاحة; ${errs.join(' | ')}`); await ctx.close(); }
 /* T02 every library link resolves */
 if(want('T02')){ const {ctx,pg}=await page(b); await pg.goto(BASE); const hrefs=await pg.$$eval('a.book:not(.lock)',a=>a.map(x=>x.href)); const bad=[];
  for(const h of hrefs){ const r=await pg.request.get(h); if(r.status()!==200) bad.push(r.status()+' '+h); } rec('T02','كل روابط المكتبة تعمل (مسارات GitHub Pages الفرعية)',bad.length===0,bad.join(' | ')||hrefs.length+' روابط'); await ctx.close(); }
 /* T03 resume card */
 if(want('T03')){ const {ctx,pg,errs}=await page(b); await pg.goto(BASE+'v2/g12c4.html#l=ftc'); await pg.waitForSelector('.step'); await pg.goto(BASE); await pg.waitForTimeout(300);
  const href=await pg.$eval('#rGo',a=>a.getAttribute('href')).catch(()=>null); const vis=await pg.$eval('#resume',e=>!e.hidden&&getComputedStyle(e).display!=='none').catch(()=>null);
  rec('T03','بطاقة «تابع من حيث توقفت»',!!href&&/g12c4/.test(href)&&vis!==false,`href=${href} visible=${vis} ${errs.join('|')}`); await ctx.close(); }
 /* T04 every v2 chapter & lesson renders on phone / iPad / board */
 if(want('T04')) for(const vp of Object.keys(VIEWPORTS)){ const {ctx,pg,errs}=await page(b,vp); const bad=[]; let nl=0;
  for(const c of V2){ await pg.goto(BASE+`v2/${c}.html`); await pg.waitForSelector('.lcard'); const ids=await pg.evaluate(()=>LB.LES.map(l=>l.id));
   for(const id of ids){ nl++; await pg.evaluate(id=>location.hash='l='+id,id); await pg.waitForSelector('.step'); await pg.waitForTimeout(80);
    const r=await pg.evaluate(()=>({k:document.querySelectorAll('.katex-error').length,ovf:document.documentElement.scrollWidth>innerWidth+1,st:document.querySelectorAll('.step').length,fig:!!document.querySelector('#svg')}));
    if(r.k||r.ovf||!r.st||!r.fig) bad.push(`${c}/${id} ${JSON.stringify(r)}`); } }
  rec('T04.'+vp,`كل دروس التصميم الجديد تُعرض (${vp})`,bad.length===0&&errs.length===0,`${nl} درساً; ${bad.concat(errs).slice(0,6).join(' | ')}`); await ctx.close(); }
 /* T05 back navigation */
 if(want('T05')){ const {ctx,pg,errs}=await page(b); await pg.goto(BASE+'v2/g12c4.html#l=ln'); await pg.waitForSelector('.step');
  await pg.click('#bBack'); await pg.waitForSelector('.lcard'); const home=await pg.evaluate(()=>location.hash===''||location.hash==='#');
  await pg.click('#bBack'); await pg.waitForSelector('.book'); const lib=/index\.html$|math-books\/$/.test(pg.url());
  rec('T05','الرجوع: درس ← الفصل ← المكتبة',home&&lib&&!errs.length,`${pg.url()} ${errs.join('|')}`); await ctx.close(); }
 /* T06 link back to the original (classic) book */
 if(want('T06')){ const {ctx,pg,errs}=await page(b); const bad=[];
  for(const c of V2){ await pg.goto(BASE+`v2/${c}.html`); await pg.waitForSelector('.lcard'); const h=await pg.$eval('.classic a',a=>a.href).catch(()=>null);
   if(!h){ const has=await pg.evaluate(()=>!!BOOK.classic); if(has) bad.push(c+': الرابط مفقود'); continue; } const r=await pg.request.get(h); if(r.status()!==200) bad.push(c+' '+r.status()); }
  rec('T06','العودة إلى الكتاب الأصلي من كل فصل',bad.length===0,bad.join(' | ')); await ctx.close(); }
 /* T07 scenes follow the steps */
 if(want('T07')){ const {ctx,pg,errs}=await page(b); await pg.goto(BASE+'v2/g12c4.html#l=regions'); await pg.waitForSelector('.step'); const titles=new Set();
  const n=await pg.$$eval('.step',s=>s.length); for(let i=0;i<Math.min(n,14);i++){ await pg.evaluate(i=>document.querySelectorAll('.step')[i].scrollIntoView({block:'center',behavior:'instant'}),i); await pg.waitForTimeout(250); titles.add(await pg.$eval('#figTitle',e=>e.textContent)); }
  rec('T07','الرسم يتبدّل مع الخطوات (التنقل بين المشاهد)',titles.size>=4&&!errs.length,`${titles.size} مشاهد مختلفة`); await ctx.close(); }
 /* T08 present mode + arrow keys */
 if(want('T08')){ const {ctx,pg,errs}=await page(b); await pg.goto(BASE+'v2/g12c4.html#l=ftc'); await pg.waitForSelector('.step'); await pg.click('#bPresent');
  const on=await pg.evaluate(()=>document.documentElement.classList.contains('present')); const i0=await pg.evaluate(()=>[...document.querySelectorAll('.step')].findIndex(s=>s.classList.contains('on')));
  for(let k=0;k<3;k++){ await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(500); }
  const i1=await pg.evaluate(()=>[...document.querySelectorAll('.step')].findIndex(s=>s.classList.contains('on')));
  rec('T08','وضع العرض الصفي والتنقل بالأسهم',on&&i1>i0,`present=${on} step ${i0}→${i1}`); await ctx.close(); }
 /* T09–T12 classroom tools inside the NEW design */
 if(want('T09')){ const {ctx,pg}=await page(b); await pg.addInitScript(()=>{ window.__fs=0; Element.prototype.requestFullscreen=function(){ window.__fs++; return Promise.resolve(); }; });
  await pg.goto(BASE+'v2/g12c4.html#l=ftc'); await pg.waitForSelector('.step'); await pg.click('#bTools').catch(()=>{}); const btn=await pg.$('[data-tool="full"],#bFull'); if(btn) await btn.click();
  rec('T09','ملء الشاشة في التصميم الجديد',!!btn&&await pg.evaluate(()=>window.__fs>0),btn?'':'لا يوجد زر ملء الشاشة'); await ctx.close(); }
 if(want('T10')){ const {ctx,pg}=await page(b,'ipad'); await pg.goto(BASE+'v2/g12c4.html#l=ftc'); await pg.waitForSelector('.step');
  await pg.click('#bTools').catch(()=>{}); const pen=await pg.$('[data-tool="pen"],#bPen'); let drew=false, undone=false;
  if(pen){ await pen.click(); const cv=await pg.$('#inkCanvas'); const bb=await cv.boundingBox(); await pg.mouse.move(bb.x+200,bb.y+200); await pg.mouse.down(); await pg.mouse.move(bb.x+320,bb.y+260,{steps:8}); await pg.mouse.up();
   drew=await pg.evaluate(()=>window.LB&&LB.ink&&LB.ink.count()>0); await pg.click('[data-tool="undo"]'); undone=await pg.evaluate(()=>LB.ink.count()===0); }
  rec('T10','القلم والتراجع في التصميم الجديد',!!pen&&drew&&undone,pen?`drew=${drew} undo=${undone}`:'لا يوجد قلم في التصميم الجديد'); await ctx.close(); }
 if(want('T11')){ const {ctx,pg,errs}=await page(b); await pg.goto(BASE+'v2/g12c4.html#l=area'); await pg.waitForSelector('.prac');
  const r=await pg.evaluate(()=>{ const st=document.querySelector('.prac').closest('.step'), sol=st.querySelector('.sol'), p=st.querySelector('.prac'); LB.role.set('student');
   st.querySelector('[data-show]').click(); const blocked=!sol.classList.contains('on');
   p.querySelector('input').value='123'; p.querySelector('.btn').click(); st.querySelector('[data-show]').click(); const afterTry=sol.classList.contains('on');
   const hb=st.querySelector('[data-hint]'); hb.click(); const h1=[...st.querySelectorAll('.hn')].filter(x=>!x.hidden).length; hb.click(); const h2=[...st.querySelectorAll('.hn')].filter(x=>!x.hidden).length; return {blocked,afterTry,h1,h2}; });
  rec('T11','الحل التدريجي: الطالب يُفتح له الحل بعد المحاولة، والتلميحات واحداً واحداً',r.blocked&&r.afterTry&&r.h1===1&&r.h2===2&&!errs.length,JSON.stringify(r)); await ctx.close(); }
 /* T21 teacher / student mode, teacher notes, six-stage navigation */
 if(want('T21')){ const {ctx,pg,errs}=await page(b,'ipad'); await pg.goto(BASE+'v2/g12c3.html#l=rates'); await pg.waitForSelector('#stages button');
  const r={}; r.stages=await pg.$$eval('#stages button',b=>b.map(x=>x.textContent.trim())); r.noteHidden=await pg.evaluate(()=>getComputedStyle(document.querySelector('.tnote')).display==='none');
  await pg.click('#bRole'); r.noteShown=await pg.evaluate(()=>getComputedStyle(document.querySelector('.tnote')).display!=='none');
  r.teacherSol=await pg.evaluate(()=>{ const st=document.querySelector('.prac').closest('.step'); st.querySelector('[data-show]').click(); return st.querySelector('.sol').classList.contains('on'); });
  await pg.keyboard.press('5'); await pg.waitForTimeout(1100); r.jump=await pg.evaluate(()=>document.querySelector('.step.on')?.closest('.sec')?.dataset.stg);
  await pg.click('#stages button:nth-child(6)'); await pg.waitForTimeout(1100); r.jump2=await pg.evaluate(()=>document.querySelector('.step.on')?.closest('.sec')?.dataset.stg);
  await pg.reload(); await pg.waitForSelector('#stages button'); r.persist=await pg.evaluate(()=>LB.role.get()); r.kinds=await pg.$$eval('.kind',k=>[...new Set(k.map(x=>x.textContent))]);
  const ok=r.stages.length===6&&r.noteHidden&&r.noteShown&&r.teacherSol&&r.jump==='practice'&&r.jump2==='check'&&r.persist==='teacher'&&r.kinds.length>=3&&!errs.length;
  rec('T21','وضع المدرّس/الطالب، ملاحظات المدرّس، القفز إلى المراحل الست، وسوم نوع المحتوى',ok,JSON.stringify(r)+' '+errs.join('|')); await ctx.close(); }
 /* T22 exam-year tags: teacher adds/removes «وزاري», badge persists, home list links back */
 if(want('T22')){ const {ctx,pg,errs}=await page(b,'ipad'); await pg.addInitScript(()=>{ try{ localStorage.setItem('lb-role','teacher'); }catch(e){} });
  await pg.goto(BASE+'v2/g12c3.html#l=rates'); await pg.waitForSelector('.tadd'); const r={};
  r.btns=await pg.$$eval('.tadd',b=>b.filter(x=>x.offsetParent).length);
  const st=await pg.evaluateHandle(()=>document.querySelector('.tadd').closest('.step')); r.key=await st.evaluate(s=>s.dataset.key);
  await (await st.$('.tadd')).click(); await (await st.$('.tform input')).fill('٢٠١٣'); await (await st.$('.tform select')).selectOption('الدور الثاني'); await (await st.$('.tform .btn')).click();
  r.badge=await st.evaluate(s=>s.querySelector('.k-exam')?.textContent.replace('×','').trim());
  await pg.reload(); await pg.waitForSelector('.k-exam'); r.persist=await pg.$eval('.k-exam',e=>e.textContent.replace('×','').trim());
  await pg.click('#bRole'); r.studentNoAdd=await pg.$$eval('.tadd',b=>b.filter(x=>x.offsetParent).length===0); r.studentBadge=await pg.$eval('.k-exam',e=>!!e.offsetParent);
  await pg.click('#bRole'); await pg.goto(BASE+'v2/g12c3.html'); await pg.waitForSelector('.exlist a'); const sel=`.exlist a[href$="k=${r.key}"]`; r.homeHref=await pg.$eval(sel,a=>a.getAttribute('href'));
  await pg.click(sel); await pg.waitForTimeout(1300); r.jumped=await pg.evaluate(()=>document.querySelector('.step.on')?.dataset.key);
  await pg.click('.step.on .k-exam .tx'); r.removed=await pg.evaluate(()=>!document.querySelector('.step.on .k-exam'));
  const ok=r.btns>3&&r.badge==='وزاري 2013 · الدور الثاني'&&r.persist===r.badge&&r.studentNoAdd&&r.studentBadge&&r.jumped===r.key&&r.removed&&!errs.length;
  rec('T22','وسوم «وزاري»: إضافة المدرّس للسنة والدور، الحفظ، الإظهار للطالب، قائمة الفصل، الحذف',ok,JSON.stringify(r)+' '+errs.join('|')); await ctx.close(); }
 /* T23 solution template (lesson 3-1): «نفرض» tables, framed relations, worksheet companion + generator */
 if(want('T23')){ const {ctx,pg,errs}=await page(b,'phone'); await pg.goto(BASE+'v2/g12c3.html#l=rates'); await pg.waitForSelector('.let'); const r={};
  r.let=await pg.$$eval('.let',x=>x.length); r.rel=await pg.$$eval('.rel',x=>x.length); r.kerr=await pg.$$eval('.katex-error',x=>x.length); r.ow=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  const st=await pg.evaluateHandle(()=>[...document.querySelectorAll('.step.enr')].find(s=>/2018/.test(s.textContent))); const p=await st.$('.prac');
  await (await p.$('input')).fill('0.1'); await (await p.$('.btn')).click(); r.miss=/يتسرب/.test(await p.evaluate(x=>x.nextElementSibling.textContent));
  await (await p.$('input')).fill('-0.1'); await (await p.$('.btn')).click(); r.ok=/صحيح/.test(await p.evaluate(x=>x.nextElementSibling.textContent));
  r.gen=await pg.evaluate(()=>{ let ok=0; for(let i=0;i<40;i++){ const q=BOOK.G.gTank(); const m=q.q.match(/ضلعها \$(\d+)\\,m\$.*?بمعدل \$([\d.]+)\\,m\^3/); if(!m) return 'parse'; const v=(+m[2])/(m[1]*m[1])*(/يتسرب/.test(q.q)?-1:1); if(Math.abs(v-(+q.ans))<1e-9) ok++; } return ok; });
  const ok=r.let===6&&r.rel===10&&r.kerr===0&&r.ow<=0&&r.miss&&r.ok&&r.gen===40&&!errs.length;
  rec('T23','قالب الحل في الدرس 3−1: جداول «نفرض»، العلاقة المؤطرة، سؤال الورقة الوزاري ومولّده',ok,JSON.stringify(r)+' '+errs.join('|')); await ctx.close(); }
 if(want('T12')){ const {ctx,pg}=await page(b); await pg.goto(BASE+'v2/g12c4.html#l=ftc'); await pg.waitForSelector('.step'); await pg.click('#bTools').catch(()=>{}); const z=await pg.$('[data-tool="zoom"],#bZoom');
  let ok=false; if(z){ const f0=await pg.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.story')).fontSize)); await z.click(); const f1=await pg.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.story')).fontSize)); ok=f1>f0; }
  rec('T12','تكبير النص والمعادلات في التصميم الجديد',ok,z?'':'لا يوجد زر تكبير'); await ctx.close(); }
 /* T13 user state persists across reloads */
 if(want('T13')){ const {ctx,pg,errs}=await page(b); await pg.goto(BASE+'v2/g12c4.html#l=area'); await pg.waitForSelector('.prac');
  await pg.evaluate(()=>{ const p=document.querySelector('.prac'); p.querySelector('input').value=p.dataset.key; p.querySelector('.btn').click(); }); await pg.click('#bTheme').catch(()=>{});
  const th0=await pg.evaluate(()=>document.documentElement.dataset.theme); await pg.reload(); await pg.waitForSelector('.prac');
  const r=await pg.evaluate(()=>({fb:document.querySelector('.prac').nextElementSibling.textContent,th:document.documentElement.dataset.theme}));
  rec('T13','حفظ حالة المستخدم (تمارين محلولة، السمة)',/سابقاً/.test(r.fb)&&r.th===th0,JSON.stringify(r)+' '+errs.join('|')); await ctx.close(); }
 /* T14 classic chapters: board tools */
 if(want('T14')) for(const c of CLASSIC){ const {ctx,pg,errs}=await page(b,'ipad'); await pg.addInitScript(()=>{ window.__fs=0; Element.prototype.requestFullscreen=function(){ window.__fs++; return Promise.resolve(); }; });
  await pg.goto(BASE+c+'.html'); await pg.waitForTimeout(400); const res={};
  try{ await pg.click('#bNext'); res.next=true; await pg.waitForTimeout(2600); /* let the page-flip animation finish, as a teacher would */ await pg.click('#bTeach'); await pg.waitForTimeout(200); res.teach=await pg.evaluate(()=>document.getElementById('teach').classList.contains('on'));
   await pg.click('#mbHandle'); await pg.click('#mb_pen'); const bb=await (await pg.$('#mbCanvas')).boundingBox();
   await pg.mouse.move(bb.x+300,bb.y+300); await pg.mouse.down(); await pg.mouse.move(bb.x+420,bb.y+360,{steps:8}); await pg.mouse.up();
   const ink=()=>pg.evaluate(()=>{ const c=document.getElementById('mbCanvas'), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=3;i<d.length;i+=4) if(d[i]) n++; return n; });
   res.ink=await ink(); await pg.click('#mb_undo'); res.undo=await ink(); await pg.click('#mb_redo'); res.redo=await ink();
   await pg.click('#mb_zoom'); res.zoom=await pg.evaluate(()=>document.body.classList.contains('mb-big')); await pg.click('#mb_full'); res.full=await pg.evaluate(()=>window.__fs);
   await pg.click('#mb_cover'); res.cover=await pg.$eval('#mb_cover',b=>b.getAttribute('aria-pressed')); }catch(e){ res.err=e.message.split('\n')[0]; }
  const ok=res.teach&&res.ink>50&&res.undo===0&&res.redo>50&&res.zoom&&res.full>0&&res.cover==='true'&&!errs.length;
  rec('T14.'+c,'أدوات السبورة في الكتاب الأصلي (قلم، تراجع، إعادة، تكبير، ملء الشاشة، غطاء)',ok,JSON.stringify(res)+' '+errs.slice(0,3).join('|')); await ctx.close(); }
 /* T15 manifest & icons */
 if(want('T15')){ const {ctx,pg}=await page(b); const r=await pg.request.get(BASE+'manifest.webmanifest'); let ok=r.status()===200, d='';
  try{ const m=JSON.parse(await r.text()); for(const ic of m.icons){ const s=(await pg.request.get(new URL(ic.src,BASE+'manifest.webmanifest').href)).status(); if(s!==200){ ok=false; d+=ic.src+' '+s; } } ok=ok&&m.start_url&&m.display==='standalone'&&m.icons.some(i=>i.purpose==='maskable'); d+=` start=${m.start_url} display=${m.display}`; }catch(e){ ok=false; d=e.message; }
  rec('T15','ملف التثبيت (manifest) والأيقونات',ok,d); await ctx.close(); }
 /* T16 offline after first visit */
 if(want('T16')){ const ctx=await b.newContext({viewport:VIEWPORTS.ipad}); const {pg}=await page(b,'ipad',{ctx,offline:1}); await pg.goto(BASE); await pg.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller,null,{timeout:15000}).catch(()=>{});
  const ctl=await pg.evaluate(()=>!!navigator.serviceWorker.controller); await pg.waitForTimeout(1500); await ctx.setOffline(true); const out={ctl};
  for(const u of ['','index.html','v2/g12c4.html','v2/g12c3.html','ch5.html','g9c5.html']){ try{ const r=await pg.goto(BASE+u,{timeout:8000}); out[u||'/']=r&&r.ok()?'ok':'fail'; }catch(e){ out[u||'/']='ERR'; } }
  try{ await pg.goto(BASE+'v2/g12c4.html#l=ln',{timeout:8000}); await pg.waitForSelector('.step .katex',{timeout:5000}); out.lessonKatex='ok'; out.fonts=await pg.evaluate(()=>document.fonts.check('16px KaTeX_Main')); }catch(e){ out.lessonKatex='fail'; }
  rec('T16','العمل دون إنترنت بعد أول زيارة (فعلياً مع قطع الاتصال)',ctl&&Object.values(out).every(v=>v===true||v==='ok'),JSON.stringify(out)); await ctx.close(); }
 /* T17 update delivery: a new release must reach the user without closing every tab */
 if(want('T17')){ const root=process.env.UPD_ROOT; if(!root){ rec('T17','وصول التحديث الجديد للمستخدم',null,'UPD_ROOT not set'); } else {
  const ctx=await b.newContext(); const pg=await ctx.newPage(); const U=process.env.UPD_BASE; await pg.goto(U); await pg.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:15000}); await pg.waitForTimeout(800);
  const v0=await pg.evaluate(()=>MATH_BOOKS_RELEASE.version); const f=path.join(root,'app-version.js'); const old=fs.readFileSync(f,'utf8'); fs.writeFileSync(f,old.replace(/version: '([^']+)'/,"version: '9.9.9'"));
  const e=path.join(root,'v2/engine.js'); const oldE=fs.readFileSync(e,'utf8'); fs.writeFileSync(e,oldE+'\nwindow.__NEWENGINE=1;');
  try{ await pg.reload(); const bar=await pg.waitForSelector('#updBar',{timeout:15000}).catch(()=>null); let v1=null, ne=false;
   if(bar){ await Promise.all([pg.waitForNavigation({timeout:15000}).catch(()=>{}),pg.click('#updBar [data-u="go"]')]); await pg.waitForTimeout(800); v1=await pg.evaluate(()=>MATH_BOOKS_RELEASE.version);
    await pg.goto(U+'v2/g12c4.html'); await pg.waitForTimeout(800); ne=await pg.evaluate(()=>!!window.__NEWENGINE); }
   rec('T17','وصول التحديث الجديد: شريط «حدّث الآن» ثم النسخة الجديدة كاملة',!!bar&&v1==='9.9.9'&&ne,`before=${v0} bar=${!!bar} after=${v1} newEngine=${ne}`); }
  finally{ fs.writeFileSync(f,old); fs.writeFileSync(e,oldE); } await ctx.close(); } }
 /* T18 answers accepted for every auto-checked exercise */
 if(want('T18')){ const {ctx,pg,errs}=await page(b,'phone'); let ok=0; const bad=[];
  for(const c of V2){ await pg.goto(BASE+`v2/${c}.html`); await pg.waitForSelector('.lcard'); const ids=await pg.evaluate(()=>LB.LES.map(l=>l.id));
   for(const id of ids){ await pg.evaluate(id=>location.hash='l='+id,id); await pg.waitForSelector('.step');
    const r=await pg.evaluate(()=>[...document.querySelectorAll('.prac')].map(p=>{ p.querySelector('input').value=p.dataset.key; p.querySelector('.btn').click(); return [p.dataset.key,/ok/.test(p.nextElementSibling.className)]; }));
    r.forEach(([k,v])=>v?ok++:bad.push(c+'/'+id+':'+k)); } }
  rec('T18','كل تمرين مُصحَّح آلياً يقبل جوابه الصحيح',bad.length===0&&!errs.length,`${ok} تمريناً; ${bad.slice(0,5).join(' | ')}`); await ctx.close(); }
 /* T19 math accuracy spot checks: answer parser */
 if(want('T19')){ const {ctx,pg}=await page(b); await pg.goto(BASE+'v2/g12c4.html'); await pg.waitForSelector('.lcard');
  const cases=[['ln4','2ln2',true],['8⅔','26/3',true],['−3','-3',true],['٤٫٥','9/2',true],['(√2,2),(-√2,2)','(-√2,2),(√2,2)',true],['31π/5','6.2π',true],['e-1','1.718',true],['3','4',false],['2.4','2',false],['1/2+π/6','1.0236',true]];
  const r=await pg.evaluate(c=>c.map(([a,k,exp])=>[a,k,LB.same(LB.nums(a),LB.nums(k))===exp]),cases); const bad=r.filter(x=>!x[2]);
  rec('T19','مدقق الأجوبة الرياضية (كسور، ln، e، π، أرقام عربية)',bad.length===0,bad.map(x=>x[0]+' vs '+x[1]).join(' | ')||cases.length+' حالات'); await ctx.close(); }
 /* T20 clear error message instead of a blank page */
 if(want('T20')){ const {ctx,pg}=await page(b); await pg.route('**/v2/g12c4.js',r=>r.abort()); await pg.goto(BASE+'v2/g12c4.html').catch(()=>{}); await pg.waitForTimeout(500);
  const t=await pg.evaluate(()=>document.body.innerText); rec('T20','رسالة واضحة عند فشل تحميل الفصل (بدل صفحة فارغة)',/تعذّر فتح هذا الفصل/.test(t)&&/أعد المحاولة/.test(t),t.slice(0,80)); await ctx.close(); }
 await b.close();
 fs.writeFileSync(path.join(__dirname,'last-run.json'),JSON.stringify({base:BASE,date:new Date().toISOString(),results:R},null,1));
 const f=R.filter(r=>r.ok===false).length; console.log(`\n${R.length-f}/${R.length} passed`); process.exitCode=f?1:0;
})();
