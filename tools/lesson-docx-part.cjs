/* Word (.docx) back-end for tools/lesson-pdf.cjs — called when <out> ends in .docx.
   Takes the print DOM already built by lesson-pdf.cjs, snapshots the figures as PNG,
   rewrites the DOM as plain HTML with custom-style hints, then
   pandoc (HTML -> docx, TeX -> native Word equations) + tools/docx-rtl.py (RTL, styles, header/footer). */
const fs=require('fs'), path=require('path'), {execFileSync}=require('child_process');
module.exports=async(pg,out,{TEACH})=>{
 const tmp=fs.mkdtempSync(path.join(require('os').tmpdir(),'lessondocx-'));
 /* 1) figures -> PNG (enlarged first so the vector drawing is rasterised sharply) */
 const nf=await pg.$$eval('main.print figure',fs=>fs.length);
 for(let i=0;i<nf;i++){
  const h=await pg.evaluateHandle(i=>{ const f=document.querySelectorAll('main.print figure')[i]; f.style.cssText='float:none;width:760px;border:0;padding:0;margin:0'; f.querySelector('svg').style.maxHeight='none'; return f.querySelector('svg'); },i);
  await h.screenshot({path:path.join(tmp,`fig${i}.png`)});
  await pg.evaluate(i=>{ document.querySelectorAll('main.print figure')[i].style.cssText='display:none'; },i);
 }
 /* trim the white margins around each drawing */
 if(nf) execFileSync('python3',['-c',`import sys,glob
from PIL import Image, ImageChops
for f in glob.glob(sys.argv[1]+'/fig*.png'):
  im=Image.open(f).convert('RGB'); bb=ImageChops.difference(im,Image.new('RGB',im.size,(255,255,255))).point(lambda v:255 if v>12 else 0).getbbox()
  if bb: im.crop((max(bb[0]-10,0),max(bb[1]-10,0),min(bb[2]+10,im.width),min(bb[3]+10,im.height))).save(f)`,tmp]);
 /* 2) DOM -> pandoc-friendly HTML */
 const html=await pg.evaluate(({TEACH})=>{
  const M=document.querySelector('main.print'), esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const D=document; const el=(t,a={},inner='')=>{ const e=D.createElement(t); for(const k in a) e.setAttribute(k,a[k]); e.innerHTML=inner; return e; };
  const AN=a=>/[\u0600-\u06FF]/.test(a)?esc(a):`<span class="math inline">${esc(a.replace(/\s+/g,' '))}</span>`;  /* numeric answers as math: always LTR */
  const clean=t=>t.replace(/\\(cf|cch|ctn|ccc|cin|cok|cbad)\b/g,'').replace(/\\R\b/g,'R').replace(/\\htmlClass\{[^}]*\}/g,'');
  M.querySelectorAll('.exams[hidden],.selfrow,input,button').forEach(e=>e.remove());
  /* math */
  M.querySelectorAll('.tex').forEach(t=>{ const disp=t.classList.contains('mathline')||t.classList.contains('big');
    const s=el('span',{class:'math '+(disp?'display':'inline')}); s.textContent=clean(t.dataset.tex);
    if(t.tagName==='DIV'){ const p=el('p',{}); p.append(s); t.replaceWith(p); } else t.replaceWith(s); });
  M.querySelectorAll('bdi').forEach(b=>b.replaceWith(D.createTextNode(b.textContent)));
  /* action sentences that make no sense on paper (answer key + leftovers) */
  M.querySelectorAll('.ks').forEach(p=>{ const f=p.firstChild; if(f&&f.nodeType===3) f.textContent=f.textContent.replace(/^\s*شغّل الحركة و/,''); });
  M.querySelectorAll('.ks,p').forEach(p=>{ const f=p.firstChild; if(f&&f.nodeType===3&&/^\s*(شغّل|حرّك|اسحب|حرك)[^.،:]*[.،:]\s*/.test(f.textContent)) f.textContent=f.textContent.replace(/^\s*(شغّل|حرّك|اسحب|حرك)[^.،:]*[.،:]\s*/,''); });
  /* figures */
  M.querySelectorAll('figure').forEach((f,i)=>{ const cap=f.querySelector('figcaption')?.textContent||'';
    const d=el('div',{}); d.append(el('p',{'custom-style':'Figure'},`<img src="fig${i}.png" style="width:7.2cm">`)); if(cap) d.append(el('p',{'custom-style':'Caption'},esc(cap))); f.replaceWith(d); });
  /* badges */
  M.querySelectorAll('.step .kind').forEach(k=>{ const st=k.classList.contains('k-exam')?'Exam':k.classList.contains('k-enr')?'Enrich':k.classList.contains('k-act')?'Activity':'BookTag';
    k.replaceWith(el('span',{'custom-style':st},'['+esc(k.textContent.trim())+']')); });
  M.querySelectorAll('.step').forEach(st=>{ /* gather loose badges into one line */
    const bs=[...st.querySelectorAll(':scope > span[custom-style], :scope > .exams > span[custom-style]')]; if(!bs.length) return;
    const p=el('p',{'custom-style':'Badges'}); bs.forEach((b,j)=>{ if(j) p.append(D.createTextNode('  ')); p.append(b); }); st.prepend(p); st.querySelectorAll(':scope > .exams').forEach(e=>e.remove()); });
  M.querySelectorAll('.kicker').forEach(k=>k.replaceWith(el('p',{'custom-style':'Kicker'},k.innerHTML)));
  /* step numbers */
  M.querySelectorAll('.step').forEach(st=>{ const sn=st.querySelector(':scope > .sn'), lb=st.querySelector(':scope > .lbl');
    if(sn||lb){ const p=el('p',{'custom-style':'StepHead'},(sn?esc(sn.textContent)+' · ':'')+(lb?lb.innerHTML:'')); (sn||lb).before(p); sn&&sn.remove(); lb&&lb.remove(); } });
  M.querySelectorAll('.step h1').forEach(h=>h.replaceWith(el('h3',{},h.innerHTML)));
  M.querySelectorAll('.step h2').forEach(h=>h.replaceWith(el('h4',{},h.innerHTML)));
  M.querySelectorAll('.sech').forEach(h=>h.replaceWith(el('h2',{},h.innerHTML)));
  /* boxes */
  const box=(sel,style,label)=>M.querySelectorAll(sel).forEach(b=>{ const lbl=b.querySelector(':scope > .lbl, :scope > .xl'); const d=el('div',{'custom-style':style});
    const lt=label(b,lbl); if(lt) d.append(el('p',{},`<b>${lt}</b>`)); lbl&&lbl.remove();
    const kids=[...b.childNodes]; let para=null;
    kids.forEach(k=>{ if(k.nodeType===1&&/^(P|DIV|UL|OL|TABLE)$/.test(k.tagName)){ para=null; if(k.tagName==='DIV'&&!k.getAttribute('custom-style')) [...k.childNodes].forEach(x=>d.append(x)); else d.append(k); } else { if(!para){ para=el('p'); d.append(para); } para.append(k); } });
    b.replaceWith(d); });
  box('.law','Law',(b,l)=>l?l.innerHTML:'');
  box('.xp','Clarify',(b,l)=>'توضيح'+(l?' · '+l.innerHTML:''));
  box('.note','Note',()=> '');
  box('.err','BookError',()=> '');
  box('.tnote','TeacherNote',()=> 'ملاحظة للمدرّس');
  box('.why','Solution',()=> 'التعليل');
  box('.sol','Solution',()=> '');
  M.querySelectorAll('.rel').forEach(r=>r.replaceWith(el('p',{'custom-style':'Rule'},(r.classList.contains('rx')?'<b>توضيح:</b> ':'')+(r.querySelector('span')||r).innerHTML)));
  /* let tables */
  M.querySelectorAll('.let').forEach(l=>{ const t=l.querySelector('.lh b')?.textContent||'نفرض';
    const rows=[...l.querySelectorAll('.lr')].map(r=>`<tr><td>${r.querySelector('.ls').innerHTML}</td><td>${r.querySelector('.lm').innerHTML}</td><td>${r.querySelector('.lv').innerHTML}</td></tr>`).join('');
    const d=el('div',{}); d.append(el('p',{'custom-style':'TableHead'},`<b>${esc(t)}</b> (توضيح)`)); d.append(el('table',{},`<thead><tr><th>الرمز</th><th>المعنى</th><th>القيمة</th></tr></thead><tbody>${rows}</tbody>`)); l.replaceWith(d); });
  /* answers and options */
  M.querySelectorAll('.ansline').forEach(a=>{ const n=a.querySelector('.qn')?.textContent||''; a.querySelector('.qn')?.remove(); a.querySelectorAll('.blank').forEach(b=>b.remove());
    const txt=a.innerHTML.trim(), work=a.classList.contains('work');
    a.replaceWith(el('p',{'custom-style':'Answer'},`<b>(${esc(n)})</b> ${txt} `+(TEACH?'':'…'.repeat(work?60:34)+(work?'<br>'+'…'.repeat(90):'')))); });
  M.querySelectorAll('ol.opts').forEach(o=>{ const n=o.dataset.n, L='أ ب ج د هـ و'.split(' ');
    const d=el('div',{}); d.append(el('p',{'custom-style':'Answer'},`<b>(${esc(n)})</b> اختر الجواب الصحيح:`));
    [...o.children].forEach((li,j)=>d.append(el('p',{'custom-style':li.classList.contains('right')?'OptionRight':'Option'},`${L[j]}) ${li.innerHTML}${li.classList.contains('right')?'  ✓':''}`))); o.replaceWith(d); });
  M.querySelectorAll('.kq').forEach(k=>{ const d=el('div',{'custom-style':'KeyItem'}), n=k.querySelector('.qn')?.textContent||'', a=k.querySelector('.kans')?.textContent||'';
    d.append(el('p',{},`<b>(${esc(n)})</b>`+(a?` الجواب: <b>${AN(a)}</b>`:' الحل:')));
    let para=null; [...(k.querySelector('.ks')||el('div')).childNodes].forEach(x=>{ if(x.nodeType===1&&/^(P|DIV|UL|OL|TABLE)$/.test(x.tagName)){ para=null; d.append(x); } else if(x.nodeType===1&&x.tagName==='BR'){ para=null; } else { if(!para){ para=el('p'); d.append(para); } para.append(x); } });
    k.replaceWith(d); });
  M.querySelectorAll('.ak b').forEach(b=>{ b.innerHTML=AN(b.textContent); });
  M.querySelectorAll('.qn').forEach(q=>q.replaceWith(el('b',{},`(${esc(q.textContent)})`)));
  M.querySelectorAll('.key > h2').forEach(h=>h.setAttribute('class','pagebreak'));
  /* cover */
  const c=M.querySelector('.cover'); if(c){ const d=el('div',{});
    d.append(el('p',{'custom-style':'CoverBand'},c.querySelector('.band').innerText.replace(/\n+/g,'   ·   ')));
    d.append(el('p',{'custom-style':'CoverNo'},esc(c.querySelector('.no').textContent)));
    d.append(el('p',{'custom-style':'Title'},c.querySelector('h1').innerHTML));
    d.append(el('p',{'custom-style':'Subtitle'},c.querySelector('.desc').innerHTML));
    d.append(el('p',{'custom-style':'CoverMeta'},c.querySelector('.meta').innerHTML));
    d.append(el('p',{'custom-style':'CoverMeta'},'<b>دليل الوسوم:</b> [من الكتاب] نص الكتاب كما هو · [نشاط تفاعلي] نشاط من التطبيق · [تمرين إثرائي] ليس من الكتاب · «توضيح» شرح إضافي ليس من الكتاب'));
    c.replaceWith(d); }
  M.querySelectorAll('.credit').forEach(p=>p.setAttribute('custom-style','CoverMeta'));
  M.querySelectorAll('p[custom-style]').forEach(p=>{ const d=el('div',{'custom-style':p.getAttribute('custom-style')}); p.removeAttribute('custom-style'); p.replaceWith(d); d.append(p); });
  return '<!doctype html><html dir="rtl"><head><meta charset="utf-8"></head><body>'+M.innerHTML+'</body></html>';
 },{TEACH});
 fs.writeFileSync(path.join(tmp,'lesson.html'),html);
 const raw=path.join(tmp,'raw.docx'), lua=path.join(__dirname,'docx-math.lua');
 execFileSync('pandoc',['-f','html','-t','docx','--lua-filter',lua,'--resource-path',tmp,'--metadata','pagetitle=lesson','-o',raw,path.join(tmp,'lesson.html')],{stdio:'inherit'});
 const meta=await pg.evaluate(()=>{ const L=LB.LES.find(l=>location.hash.includes('l='+l.id)); return {no:L.no,t:L.t||document.title}; });
 execFileSync('python3',[path.join(__dirname,'docx-rtl.py'),raw,out,`[${meta.no}] ${meta.t}`],{stdio:'inherit'});
 if(process.env.KEEP) console.log('tmp',tmp); else fs.rmSync(tmp,{recursive:true,force:true});
 console.log('wrote',out);
};
