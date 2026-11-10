/* Export one v2 lesson as a print-ready A4 PDF (or Word .docx when <out> ends in .docx).
   usage: node tools/lesson-pdf.cjs <book> <lessonId> <out.pdf> [--teacher]
   BASE (env) defaults to http://localhost:8770/math-books/  — serve the repo's parent folder first.
   Student edition: exercises with blank answer lines, answer key at the end, teacher notes hidden.
   Teacher edition: solutions inline under each exercise, teacher notes shown. */
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const [book,lesson,out]=process.argv.slice(2), TEACH=process.argv.includes('--teacher');
const BASE=process.env.BASE||'http://localhost:8770/math-books/';
if(!book||!lesson||!out){ console.error('usage: node tools/lesson-pdf.cjs <book> <lessonId> <out.pdf> [--teacher]'); process.exit(1); }
const font=b=>fs.readFileSync(path.join(__dirname,'..','v2','lib','fonts',b)).toString('base64');

(async()=>{
 const b=await chromium.launch(), pg=await b.newPage({viewport:{width:1180,height:860},deviceScaleFactor:1});
 await pg.addInitScript(()=>{ try{ localStorage.setItem('lb-theme','light'); localStorage.setItem('lb-role','student'); }catch(e){} });
 await pg.goto(`${BASE}v2/${book}.html#l=${lesson}`); await pg.waitForSelector('.step .katex'); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ document.documentElement.dataset.theme='light'; });

 /* 1) one figure per idea: snapshot the scene of the first step of every new scene family */
 const keys=await pg.$$eval('.story .step',ss=>ss.map(s=>s.dataset.scene||''));
 const base=s=>s.replace(/(ok|Ok|\d+)$/,'').replace(/\d+$/,'');
 const figs={}; let last='';
 for(let i=0;i<keys.length;i++){ const k=keys[i]; if(!k||/ok$|Ok$/.test(k)) continue; const bk=base(k); if(bk===last) continue; last=bk;
   await pg.evaluate(i=>{ const st=document.querySelectorAll('.story .step')[i]; st.scrollIntoView({block:'center'}); }, i);
   await pg.waitForTimeout(650);
   figs[i]=await pg.evaluate(()=>{ const s=document.getElementById('svg'), r=s.getBoundingClientRect(), c=s.cloneNode(true);
     c.setAttribute('viewBox',`0 0 ${Math.round(r.width)} ${Math.round(r.height)}`); c.removeAttribute('width'); c.removeAttribute('height'); c.removeAttribute('id'); c.removeAttribute('style');
     c.querySelectorAll('[id]').forEach(e=>{ if(e.tagName==='clipPath'){ const n='cp'+Math.random().toString(36).slice(2,8); c.querySelectorAll('[clip-path="url(#'+e.id+')"]').forEach(g=>g.setAttribute('clip-path','url(#'+n+')')); e.id=n; } });
     return {svg:c.outerHTML,title:document.getElementById('figTitle').textContent}; }); }

 /* 2) rebuild the page as a printable document */
 await pg.evaluate(({figs,TEACH,fonts})=>{
  const B=window.BOOK, L=LB.LES.find(l=>location.hash.includes('l='+l.id)), story=document.querySelector('.story');
  const stepsEls=[...story.querySelectorAll('.step')], key=[]; let qn=0;
  const doc=document.createElement('main'); doc.className='print';
  const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  /* cover */
  doc.insertAdjacentHTML('beforeend',`<div class="cover"><div class="band"><span>${esc(B.grade)} · ${esc(B.chapter)} · ${esc(B.title)}</span><span>${TEACH?'نسخة المدرّس':'نسخة الطالب'}</span></div>
   <div class="no">${/^\d/.test(L.no)?'['+esc(L.no)+']':esc(L.no)}</div><h1>${document.getElementById('crB').innerHTML}</h1>
   <p class="desc">${esc(L.d||'')}</p><p class="meta">صفحات الكتاب ${esc(L.pg)} · إعداد وتصميم: <b>الأستاذ فائز الحمداني</b></p>
   <div class="legend"><span class="kind k-book">من الكتاب</span> نص الكتاب كما هو <span class="kind k-act">نشاط تفاعلي</span> <span class="kind k-enr">تمرين إثرائي</span> ليس من الكتاب <span class="lgx">توضيح</span> شرح إضافي ليس من الكتاب</div></div>`);
  let cur=null;
  [...story.querySelectorAll('.sec')].forEach(sec=>{
   if(sec.id==='sEnd') return;
   const s=document.createElement('section'); s.className='psec';
   const stg=sec.dataset.stg; s.innerHTML=`<h2 class="sech">${esc(sec.dataset.sec)}</h2>`; doc.append(s); cur=s;
   sec.querySelectorAll('.step').forEach(st=>{
    const i=stepsEls.indexOf(st), c=st.cloneNode(true); c.classList.remove('on','flash'); c.removeAttribute('id');
    c.querySelectorAll('.tadd,.tform,.tx,.hints,.genbox,.fb,.selfrow,[data-hint],[data-gen],[data-show],.mk,button.btn').forEach(e=>e.remove());
    if(!TEACH) c.querySelectorAll('.tnote').forEach(e=>e.remove());
    c.querySelectorAll(':scope > p').forEach(e=>{ if(/^(حرّك|اسحب|شغّل|حرك)/.test(e.textContent.trim())) e.remove(); else e.innerHTML=e.innerHTML.replace(/\s*(اسحب|حرّك|شغّل)[^.،]*\.\s*$/,''); });
    /* exercises */
    c.querySelectorAll('.prac').forEach(p=>{ qn++; const sol=p.parentNode.querySelector(':scope > .sol'); const ans=p.dataset.key, ph=p.querySelector('input')?.getAttribute('placeholder')||'';
      const box=document.createElement('div'); box.className='ansline'; box.innerHTML=`<span class="qn">${qn}</span> ${esc(ph)}: <span class="blank"></span>`;
      p.replaceWith(box); if(sol){ if(TEACH){ sol.classList.add('on','tsol'); sol.insertAdjacentHTML('afterbegin',`<p class="ak">الجواب: <b dir="ltr">${esc(ans)}</b></p>`); } else { key.push({n:qn,ans,sol:sol.innerHTML}); sol.remove(); } } });
    c.querySelectorAll('.sol').forEach(sol=>{ if(sol.closest('.tsol')||sol.classList.contains('tsol')) return; qn++;
      if(TEACH){ sol.classList.add('on','tsol'); sol.insertAdjacentHTML('beforebegin',`<div class="ansline"><span class="qn">${qn}</span> الحل:</div>`); }
      else { sol.insertAdjacentHTML('beforebegin',`<div class="ansline work"><span class="qn">${qn}</span> الحل: <span class="blank"></span><span class="blank"></span></div>`); key.push({n:qn,sol:sol.innerHTML}); sol.remove(); } });
    c.querySelectorAll('.ask').forEach(a=>{ qn++; const opts=[...a.querySelectorAll('.opt')], right=+a.dataset.ans, why=a.nextElementSibling&&a.nextElementSibling.classList.contains('why')?a.nextElementSibling:null;
      const ol=document.createElement('ol'); ol.className='opts'; ol.innerHTML=opts.map((o,j)=>`<li${TEACH&&j===right?' class="right"':''}>${o.innerHTML}</li>`).join(''); ol.dataset.n=qn;
      a.replaceWith(ol); if(why){ if(TEACH){ why.classList.add('on','tsol'); } else { key.push({n:qn,ans:'أ ب ج د'.split(' ')[right],sol:why.innerHTML}); why.remove(); } } });
    if(figs[i]){ const f=document.createElement('figure'); f.innerHTML=figs[i].svg+`<figcaption>${esc(figs[i].title)}</figcaption>`; c.prepend(f); c.classList.add('hasfig'); }
    cur.append(c); }); });
  if(key.length&&!TEACH){ const k=document.createElement('section'); k.className='psec key'; k.innerHTML='<h2 class="sech">مفتاح الحلول</h2>'+key.map(q=>`<div class="kq"><span class="qn">${q.n}</span>${q.ans?` <b dir="ltr" class="kans">${esc(q.ans)}</b>`:''}<div class="ks">${q.sol}</div></div>`).join(''); doc.append(k); }
  doc.insertAdjacentHTML('beforeend','<p class="credit">إعداد وتصميم: الأستاذ فائز الحمداني · © 2026 · نصوص الكتاب المدرسي ملك وزارة التربية العراقية</p>');
  document.body.innerHTML=''; document.body.className='printing'; document.body.append(doc);
  const css=document.createElement('style'); css.textContent=`
   @page{size:A4;margin:16mm 14mm 18mm}
   html,body{background:#fff!important;color:#1d2433}
   body.printing{font-family:Plex,system-ui,sans-serif;font-size:10.4pt;line-height:1.62;direction:rtl}
   .print{max-width:none;margin:0;padding:0}
   .cover{border:1.5px solid #c9d3e6;border-radius:14px;padding:0 0 14px;margin:0 0 14px;overflow:hidden;break-inside:avoid}
   .cover .band{display:flex;justify-content:space-between;background:#123a6b;color:#fff;padding:7px 14px;font-size:9.5pt;font-weight:700}
   .cover .no{margin:14px 16px 0;color:#2563c9;font-weight:700;font-size:11pt}
   .cover h1{margin:2px 16px 4px;font-size:22pt;line-height:1.35;color:#0f1729}
   .cover .desc{margin:0 16px 6px;color:#3b4a63}.cover .meta{margin:0 16px 8px;font-size:9.5pt;color:#55627a}
   .legend{margin:0 16px;font-size:8.8pt;color:#55627a;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
   .legend .lgx{display:inline-block;border:1.5px dashed #0f9d74;color:#0f7a4e;font-weight:700;border-radius:99px;padding:0 8px;margin-inline-start:10px}
   .psec{margin:0 0 6px}
   .sech{font-size:14pt;color:#123a6b;border-bottom:2px solid #123a6b;padding:0 0 3px;margin:16px 0 8px;break-after:avoid}
   .step{opacity:1!important;filter:none!important;transform:none!important;background:#fff!important;border:1px solid #e3e8f2!important;border-radius:10px;padding:5px 10px!important;margin:0 0 6px!important;box-shadow:none!important;break-inside:avoid;min-height:0!important}
   .step.hasfig{overflow:hidden}
   .step::before,.step::after{display:none!important}
   figure{float:left;width:40%;margin:0 0 6px 12px;border:1px solid #e3e8f2;border-radius:8px;padding:4px;break-inside:avoid}
   figure svg{width:100%;height:auto;display:block;max-height:62mm}
   figcaption{font-size:8.5pt;color:#55627a;text-align:center}
   .ansline{margin:6px 0;font-size:10.5pt;color:#3b4a63;display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
   .ansline .blank{flex:1 1 55%;border-bottom:1.4px dotted #8a96ad;height:1.2em}
   .ansline.work .blank{flex-basis:100%;height:1.8em}
   .qn{display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:50%;background:#123a6b;color:#fff;font-size:8.5pt;font-weight:700;padding:0 4px}
   ol.opts{margin:4px 0;padding-inline-start:22px;list-style:arabic-indic}
   ol.opts li{margin:2px 0}ol.opts li.right{font-weight:700;color:#0f7a4e}
   .why,.sol{display:block!important}
   .tsol{clear:both;background:#f3f8ff;border:1px solid #cddcf5;border-radius:8px;padding:6px 10px;margin:6px 0}
   .ak{margin:0 0 4px}
   .key .kq{border-bottom:1px solid #e3e8f2;padding:6px 0;break-inside:avoid}
   .key .kans{margin-inline-start:8px;color:#0f7a4e}
   .key .ks{font-size:10pt}
   .exams .tadd,.exams .tform{display:none!important}
   .credit{margin-top:14px;text-align:center;font-size:8.5pt;color:#55627a}
   .katex{font-size:1em}
   .xp,.let,.law,.note,.err,.tnote{margin:5px 0!important;padding:5px 9px!important}
   .mathline{margin:2px 0!important}
   .sech{margin:10px 0 6px}
   .step .kicker{margin-bottom:0}
  `; document.head.append(css);
 },{figs,TEACH});
 await pg.waitForTimeout(400);
 if(/\.docx$/i.test(out)){ await require('./lesson-docx-part.cjs')(pg,out,{TEACH,lesson}); await b.close(); return; }
 await pg.emulateMedia({media:'print'});
 const ff=`@font-face{font-family:PlexF;src:url(data:font/woff2;base64,${font('plex-ar-500.woff2')}) format("woff2")}`;
 const L=await pg.evaluate(()=>{ const L=LB.LES.find(l=>location.hash.includes('l='+l.id)); return {no:L.no,t:document.querySelector('.cover h1').textContent}; });
 await pg.pdf({path:out,format:'A4',printBackground:true,displayHeaderFooter:true,margin:{top:'16mm',bottom:'18mm',left:'14mm',right:'14mm'},
  headerTemplate:`<style>${ff}</style><div style="font-family:PlexF;font-size:8px;color:#7a869c;width:100%;padding:0 14mm;display:flex;justify-content:space-between;direction:rtl"><span>[${L.no}] ${L.t}</span><span>الرياضيات الحيّة</span></div>`,
  footerTemplate:`<style>${ff}</style><div style="font-family:PlexF;font-size:8px;color:#7a869c;width:100%;padding:0 14mm;display:flex;justify-content:space-between;direction:rtl"><span>إعداد وتصميم: الأستاذ فائز الحمداني</span><span>صفحة <span class="pageNumber"></span> من <span class="totalPages"></span></span></div>`});
 await b.close(); console.log('wrote',out);
})();
