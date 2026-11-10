/* الرياضيات الحيّة · محرّك الكتاب v2 (قصّة تمريرية + رسم ثابت يتبعها)
   كل فصل يعرّف window.BOOK = {id, grade, chapter, title, desc, classic, S:{scenes}, src:String.raw`markup`}
   ثم يُحمَّل هذا الملف فيبني صفحة الفصل (قائمة الدروس) وصفحة كل درس. */
(function(){
"use strict";
const B=window.BOOK, D=document, root=D.documentElement;
/* clear failure message instead of a blank page (missing chapter data or a runtime error) */
const fail=(why)=>{ D.body.innerHTML=`<div dir="rtl" style="max-width:560px;margin:15vh auto;padding:24px;font:17px/1.7 system-ui,sans-serif;text-align:center">
  <h2 style="margin:0 0 8px">تعذّر فتح هذا الفصل</h2><p style="margin:0 0 16px;color:#666">${why}</p>
  <button onclick="location.reload()" style="min-height:44px;padding:0 18px;border-radius:12px;border:0;background:#2563eb;color:#fff;font:inherit">أعد المحاولة</button>
  <a href="../index.html" style="display:inline-block;margin-inline-start:10px">العودة إلى المكتبة</a></div>`; };
if(!B||!B.src){ fail('لم تُحمَّل بيانات الفصل. تأكد من الاتصال بالإنترنت في أول فتح للفصل ثم أعد المحاولة.'); return; }
let booted=false; addEventListener('error',e=>{ if(!booted&&!/katex/i.test(String(e.filename||''))) fail('حدث خطأ أثناء تجهيز الصفحة: '+String(e.message||'').slice(0,120)); });
const $=(s,r=D)=>r.querySelector(s), $$=(s,r=D)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
/* isolate Latin/number runs inside Arabic text so that "(2 , 8)" and "a ، b" keep their order */
const iso=s=>{ s=String(s); return /[\u0600-\u06FF]/.test(s)?s.replace(/[^\u0600-\u06FF]+/g,m=>/[A-Za-z0-9]/.test(m)?m.replace(/^([^A-Za-z0-9(\[√−+-]*)([\s\S]*?)(\s*)$/,(_,a,b,c)=>a+'\u2066'+b+'\u2069'+c):m):/[A-Za-z0-9]/.test(s)?'\u2066'+s+'\u2069':s; };

/* ================= markup → lessons ================= */
/* the six lesson stages (a section opts in with "--- @stage title") */
const STAGES={discover:['اكتشف','🔍'],understand:['افهم','💡'],try:['جرّب','🎛'],learn:['تعلّم الحل','📝'],practice:['تدرّب','✏️'],check:['تحقّق','✅']};
/* step content type (".book .extra .act .enr" on the >>> line) */
const KIND={book:'من الكتاب',extra:'شرح إضافي',act:'نشاط تفاعلي',enr:'تمرين إثرائي'};
function parse(src){
  const L=[]; let les=null, sec=null, st=null, box=null, list=null;
  const flushList=()=>{ list=null; };
  for(let raw of src.split('\n')){
    const line=raw.replace(/\s+$/,''); const s=line.trim();
    if(!s){ box=null; flushList(); continue; }
    if(s.startsWith('//')) continue;
    if(s.startsWith('===')){ const [id,no,t,pg,d]=s.slice(3).split('|').map(x=>x.trim()); les={id,no,t,pg,d:d||'',secs:[]}; L.push(les); sec=null; st=null; continue; }
    if(s.startsWith('---')){ let t=s.slice(3).trim(), stg=''; const m2=t.match(/^@(\w+)\s*(.*)$/); if(m2){ stg=m2[1]; t=m2[2]||STAGES[stg]?.[0]||t; } sec={t,stg,steps:[]}; les.secs.push(sec); st=null; continue; }
    if(s.startsWith('>>>')){ let h=s.slice(3).trim(), lbl=''; const i=h.indexOf('::'); if(i>=0){ lbl=h.slice(i+2).trim(); h=h.slice(0,i).trim(); }
      const tk=h.split(/\s+/).filter(Boolean); st={sc:null,n:'',cls:[],lbl,parts:[]};
      for(const t of tk){ if(t[0]==='#') st.n=t.slice(1); else if(t==='!') st.cls.push('result'); else if(t==='+') st.cls.push('gap'); else if(t[0]==='.') st.cls.push(t.slice(1)); else st.sc=t; }
      if(!sec){ sec={t:'',steps:[]}; les.secs.push(sec); } sec.steps.push(st); box=null; flushList(); continue; }
    if(!st) continue;
    if(s.startsWith('| ')||s==='|'){ if(box) box.lines.push(s.slice(2)); continue; }
    const m=s.match(/^([a-z0-9*]+):\s?(.*)$/);
    if(m&&['k','p','h1','h2','lead','law','note','err','ask','o','o*','why','prac','sol','self','ok','tbl','tbh','html','fig','xp','hint','miss','gen','tnote'].includes(m[1])){
      const [ ,key,val]=m; flushList();
      if(key==='o'||key==='o*'){ const q=st.parts.findLast(p=>p.k==='ask'); if(q){ if(key==='o*') q.ans=q.o.length; q.o.push(val); } continue; }
      if(key==='hint'||key==='miss'||key==='gen'){ const q=st.parts.findLast(p=>p.k==='prac'||p.k==='self'); if(q){ if(key==='gen') q.gen=val.trim(); else if(key==='hint') (q.hints=q.hints||[]).push(val); else { const i=val.indexOf(';'); (q.miss=q.miss||[]).push([val.slice(0,i).trim(),val.slice(i+1).trim()]); } } continue; }
      if(key==='ok'){ const q=st.parts.findLast(p=>p.k==='prac'||p.k==='self'); if(q) q.ok=val; continue; }
      if(key==='tbl'||key==='tbh'){ let t=st.parts.at(-1); if(!t||t.k!=='tbl'){ t={k:'tbl',rows:[]}; st.parts.push(t); } t.rows.push({h:key==='tbh',c:val.split('|').map(x=>x.trim())}); continue; }
      const p={k:key,v:val,lines:val?[val]:[]};
      if(key==='law'||key==='xp'){ p.lines=[]; }
      if(key==='prac'){ const [ans,ph]=val.split(';').map(x=>x.trim()); p.ans=ans; p.ph=ph||'الجواب'; p.lines=[]; }
      if(key==='self'){ p.lines=[]; }
      if(key==='ask'){ p.o=[]; p.ans=0; }
      if(key==='sol'||key==='why'){ const q=st.parts.findLast(x=>['prac','self','ask'].includes(x.k)); if(q){ q[key]=p; } }
      st.parts.push(p); box=['law','note','err','sol','why','self','html','lead','xp','tnote'].includes(key)?p:null; continue; }
    if(s.startsWith('$$')){ flushList(); st.parts.push({k:'m',v:s.slice(2).trim()}); box=null; continue; }
    if(s.startsWith('- ')){ if(!list){ list={k:'ul',items:[]}; st.parts.push(list); } list.items.push(s.slice(2)); box=null; continue; }
    flushList(); st.parts.push({k:'p',v:s}); box=null;
  }
  return L;
}

/* inline: $tex$, $$tex$$ (display), [[cls:text]], **bold** */
function T(s){
  if(s==null) return ''; const keep=[], ph=i=>String.fromCharCode(0xE000+i);
  s=String(s).replace(/\$\$([^$]+)\$\$/g,(_,t)=>{ keep.push(`<span class="big tex" data-tex="${esc(t).replace(/"/g,'&quot;')}"></span>`); return ph(keep.length-1); })
   .replace(/\$([^$]+)\$/g,(_,t)=>{ keep.push(`<span class="tex" data-tex="${esc(t).replace(/"/g,'&quot;')}"></span>`); return ph(keep.length-1); });
  s=s.replace(/\[\[(\w+):([^\]]+)\]\]/g,'<span class="tag $1">$2</span>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
  /* keep plain Latin/number runs (e.g. "(5 , 3)") in reading order inside Arabic text */
  if(/[؀-ۿ]/.test(s)) s=s.replace(/(^|>)([^<]*)/g,(m,a,t)=>a+t.replace(/[^؀-ۿ-]+/g,r=>{ if(!/[A-Za-z0-9]/.test(r)) return r;
    const mm=r.match(/^([^A-Za-z0-9(\[√−+\-|]*)([\s\S]*?)([\s.،:؛]*)$/); return mm[1]+(mm[2]?`<bdi dir="ltr">${mm[2]}</bdi>`:'')+mm[3]; }));
  return s.replace(/[-]/g,c=>keep[c.charCodeAt(0)-0xE000]);
}
const LN=x=>x.startsWith('» ')?`<span class="xpl">${T(x.slice(2))}</span>`:x.startsWith('$$')&&!x.slice(2).includes('$$')?`<span class="big tex" data-tex="${esc(x.slice(2).trim()).replace(/"/g,'&quot;')}"></span>`:T(x);
const lines=p=>p.lines.map(LN).join('<br>');
const MAC={"\\cf":"\\htmlClass{tk-f}{#1}","\\cch":"\\htmlClass{tk-chord}{#1}","\\ctn":"\\htmlClass{tk-tan}{#1}","\\ccc":"\\htmlClass{tk-c}{#1}","\\cin":"\\htmlClass{tk-int}{#1}","\\cok":"\\htmlClass{tk-ok}{#1}","\\cbad":"\\htmlClass{tk-bad}{#1}","\\R":"R"};
function typeset(r){ $$('.tex',r).forEach(el=>{ try{ katex.render(el.dataset.tex,el,{trust:true,strict:false,throwOnError:false,displayMode:false,macros:{...MAC}}); el.classList.add('m'); el.setAttribute('dir','ltr'); }catch(e){ el.textContent=el.dataset.tex; } }); }

const extra=(p,id)=>(p.hints?`<button type="button" class="btn ghost small" data-hint>💡 تلميح <bdi>1/${p.hints.length}</bdi></button>`:'')+(p.gen?`<button type="button" class="btn ghost small" data-gen="${esc(p.gen)}">↻ تمرين مشابه</button>`:'');
const extraBox=p=>(p.hints?`<div class="hints">${p.hints.map(x=>`<p class="hn" hidden>${T(x)}</p>`).join('')}</div>`:'')+(p.gen?'<div class="genbox" hidden></div>':'');
function stepHTML(st,les,si,ki){
  let h=''; const kd=st.cls.find(c=>KIND[c]); if(kd) h+=`<span class="kind k-${kd}">${KIND[kd]}</span>`; if(st.n) h+=`<span class="sn">${esc(st.n)}</span>`; if(st.lbl) h+=`<span class="lbl">${T(st.lbl)}</span>`;
  st.parts.forEach((p,pi)=>{ const id=`${les.id}-${si}-${ki}-${pi}`;
    switch(p.k){
      case 'k': h+=`<div class="kicker">${T(p.v)}</div>`; break;
      case 'h1': h+=`<h1>${T(p.v)}</h1>`; break;
      case 'h2': h+=`<h2>${T(p.v)}</h2>`; break;
      case 'lead': h+=`<p class="lead">${lines(p)}</p>`; break;
      case 'p': h+=`<p>${T(p.v)}</p>`; break;
      case 'm': h+=`<div class="mathline tex" data-tex="${esc(p.v).replace(/"/g,'&quot;')}"></div>`; break;
      case 'ul': h+=`<ul>${p.items.map(i=>`<li>${T(i)}</li>`).join('')}</ul>`; break;
      case 'law': h+=`<div class="law"><span class="lbl">${T(p.v)}</span><div>${p.lines.map(x=>x.startsWith('$$')&&!x.slice(2).includes('$$')?`<span class="big tex" data-tex="${esc(x.slice(2).trim()).replace(/"/g,'&quot;')}"></span>`:`<p>${T(x)}</p>`).join('')}</div></div>`; break;
      case 'xp': h+=`<div class="xp"><span class="xl">${p.v?T(p.v):'خطوة توضيحية'}</span><div>${p.lines.map(x=>`<p>${LN(x)}</p>`).join('')}</div></div>`; break;
      case 'tnote': h+=`<div class="tnote"><b>للمدرّس:</b> ${lines(p)}</div>`; break;
      case 'note': h+=`<div class="note">${lines(p)}</div>`; break;
      case 'err': h+=`<div class="err"><b>تنبيه على خطأ في الكتاب:</b> ${lines(p)}</div>`; break;
      case 'html': h+=p.lines.join('\n'); break;
      case 'tbl': h+=`<div class="tblwrap"><table class="t">${p.rows.map(r=>`<tr>${r.c.map(c=>`<${r.h?'th':'td'}>${T(c)}</${r.h?'th':'td'}>`).join('')}</tr>`).join('')}</table></div>`; break;
      case 'ask': h+=`<p>${T(p.v)}</p><div class="ask" data-ans="${p.ans}">${p.o.map(o=>`<button type="button" class="opt">${T(o)}</button>`).join('')}</div><div class="why">${p.why?lines(p.why):''}</div>`; break;
      case 'prac': h+=`<div class="prac" data-key="${esc(p.ans)}" data-id="${id}"${p.ok?` data-ok="${esc(p.ok)}"`:''}${p.miss?` data-miss="${encodeURIComponent(JSON.stringify(p.miss))}"`:''}><input inputmode="text" autocomplete="off" placeholder="${esc(p.ph)}" aria-label="${esc(p.ph)}"><button type="button" class="btn">تحقّق</button></div><div class="fb"></div>`+
        `<div class="selfrow">${extra(p,id)}<button type="button" class="btn ghost small" data-show>الحل</button></div>${extraBox(p)}<div class="sol">${p.sol?lines(p.sol):''}</div>`; break;
      case 'self': h+=(p.lines.length?`<p>${lines(p)}</p>`:'')+`<div class="selfrow" data-self="${id}"${p.ok?` data-ok="${esc(p.ok)}"`:''}>${extra(p,id)}<button type="button" class="btn ghost small" data-show>أظهر الحل</button><span class="mk" hidden>هل كان حلّك صحيحاً؟ <button type="button" class="btn small" data-y>✓ نعم</button> <button type="button" class="btn ghost small" data-n>✗ ليس بعد</button></span><span class="done" hidden></span></div>${extraBox(p)}<div class="sol">${p.sol?lines(p.sol):''}</div>`; break;
    } });
  return h;
}

/* ================= state & storage ================= */
const KEY='lb-v2-'+B.id; let ST={ex:{},seen:{}};
try{ ST=Object.assign(ST,JSON.parse(localStorage.getItem(KEY)||'{}')); }catch(e){}
const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(ST)); }catch(e){} };
const LES=parse(B.src);
LES.forEach(l=>{ l.nEx=0; l.secs.forEach(s=>s.steps.forEach(st=>st.parts.forEach(p=>{ if(p.k==='prac'||p.k==='self') l.nEx++; }))); });
ST.n=LES.length; ST.t=LES.reduce((a,l)=>a+l.nEx,0); save();
const exDone=l=>Object.keys(ST.ex).filter(k=>k.startsWith(l.id+'-')&&ST.ex[k]===1).length;

/* ================= page skeleton ================= */
const ICON={back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
 present:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>',
 moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>'};
D.body.innerHTML=`<header>
 <a class="hb" id="bBack" href="../index.html" aria-label="رجوع">${ICON.back}<span class="l" id="bBackL">المكتبة</span></a>
 <a class="crumb" id="crumb" href="#"><small id="crS"></small><b id="crB"></b></a>
 <span class="sp"></span>
 <a class="hb" id="bLessons" href="#" title="دروس الفصل">${ICON.list}<span class="l">الدروس</span></a>
 <button class="hb" id="bPresent" aria-pressed="false" title="وضع العرض الصفي (الأسهم للتنقل)">${ICON.present}<span class="l">عرض صفي</span></button>
 <button class="hb" id="bRole" aria-pressed="false" title="التبديل بين وضع الطالب ووضع المدرّس"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg><span class="l" id="bRoleL">طالب</span></button>
 <button class="hb" id="bTools" aria-pressed="false" title="أدوات السبورة: قلم، ممحاة، تكبير، ملء الشاشة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 6l3 3"/></svg><span class="l">أدوات</span></button>
 <button class="hb" id="bTheme" aria-label="تبديل الألوان">${ICON.moon}</button>
 <div class="prog"><i id="prog"></i></div>
</header>
<div class="tools" id="tools" role="toolbar" aria-label="أدوات السبورة" hidden>
 <button data-tool="pen" aria-pressed="false" title="قلم (اكتب بالإصبع أو Apple Pencil)" aria-label="قلم">✎</button><button data-tool="red" class="sw" style="--sw:#e0393e" aria-pressed="true" title="أحمر"></button><button data-tool="blue" class="sw" style="--sw:#2563eb" aria-pressed="false" title="أزرق"></button><button data-tool="green" class="sw" style="--sw:#059669" aria-pressed="false" title="أخضر"></button>
 <button data-tool="erase" aria-pressed="false" title="ممحاة: المس الخط لمسحه" aria-label="ممحاة">⌫</button><button data-tool="undo" title="تراجع (Ctrl+Z)">↶</button><button data-tool="redo" title="إعادة (Ctrl+Y)">↷</button><button data-tool="clear" title="مسح كل الكتابة" aria-label="مسح الكل">🗑</button>
 <span class="tsep"></span><button data-tool="zoom" title="تكبير النص والمعادلات">A+</button><button data-tool="zoomout" title="تصغير">A−</button><button data-tool="full" title="ملء الشاشة">⛶</button><button data-tool="close" class="x" title="إغلاق الأدوات">✕</button>
</div>
<canvas id="inkCanvas" aria-hidden="true"></canvas><div id="toast" role="status" aria-live="polite"></div>
<div class="home" id="home"></div>
<div class="stages" id="stages" role="navigation" aria-label="مراحل الدرس" hidden></div>
<div class="wrap">
 <nav class="outline" aria-label="أقسام الدرس"><ol id="outline"></ol></nav>
 <main class="story focus" id="story"></main>
 <aside class="fig" aria-label="الرسم التفاعلي"><div class="panel">
  <div class="top"><span class="title" id="figTitle"></span><span id="chips" style="display:contents"></span></div>
  <div class="legend" id="legend" hidden></div>
  <div class="svgbox" id="box"><svg class="g" id="svg" dir="ltr" aria-hidden="true"></svg></div>
  <label class="sl" id="sl" hidden><span id="slL"></span><input type="range" id="slI"><b id="slV"></b></label>
  <div class="hint" id="hint"></div>
 </div></aside>
</div>`;
const story=$('#story'), outline=$('#outline');

/* ================= chapter home ================= */
function renderHome(){
  D.body.classList.add('is-home'); root.classList.remove('has-stages'); D.title=`${B.title} – الرياضيات الحيّة`;
  $('#crS').textContent=`${B.grade} · ${B.chapter}`; $('#crB').textContent=B.title; $('#bBack').href='../index.html'; $('#bBackL').textContent='المكتبة'; $('#bLessons').hidden=true;
  const tot=LES.reduce((a,l)=>a+l.nEx,0), done=LES.reduce((a,l)=>a+exDone(l),0), seen=LES.filter(l=>ST.seen[l.id]).length;
  $('#home').innerHTML=`<div class="hero"><svg class="deco" viewBox="0 0 300 200" fill="none" stroke="#fff" stroke-width="3"><path d="M0 170C60 170 80 20 150 40S240 180 300 60"/><path d="M40 150L260 70" stroke-dasharray="8 8"/><circle cx="150" cy="40" r="8" fill="#fff"/></svg>
    <small>${esc(B.grade)} · ${esc(B.chapter)}</small><h1>${esc(B.title)}</h1><p>${T(B.desc||'')}</p>
    <div class="bar"><i style="width:${LES.length?Math.round(seen/LES.length*100):0}%"></i></div>
    <div class="meta">أنهيت ${seen} من ${LES.length} دروس${tot?` · حللت ${done} من ${tot} تمريناً`:''}</div><div class="share"><input id="shN" placeholder="اسمك (اختياري)" autocomplete="name" aria-label="الاسم"><button type="button" class="btn small" id="shB">📤 أرسل تقدّمي للمدرّس</button></div><pre id="shT" hidden></pre></div>
   <div class="lessons">${LES.map((l,i)=>{ const n=exDone(l); return `<a class="lcard" href="#l=${l.id}"><span class="no"><span>${esc(/^\d/.test(l.no)?'['+l.no+']':l.no)}</span><span class="pg">ص ${esc(l.pg)}</span></span><b>${T(l.t)}</b><p>${T(l.d)}</p>
     <span class="st">${ST.seen[l.id]?'<span class="okb">✓ مكتمل</span>':`الدرس ${i+1}`}${l.nEx?`<span class="mini"><i style="width:${Math.round(n/l.nEx*100)}%"></i></span><span>${n}/${l.nEx}</span>`:''}</span></a>`; }).join('')}</div>
   ${B.classic?`<p class="classic">تفضّل الكتاب بصفحاته؟ <a href="${B.classic}">افتح النسخة الكلاسيكية</a></p>`:''}`;
  typeset($('#home')); scrollTo({top:0,behavior:'instant'}); $('#prog').style.width='0';
  try{ $('#shN').value=localStorage.getItem('lb-name')||''; }catch(e){}
  $('#shB').onclick=async()=>{ const nm=$('#shN').value.trim(); try{ localStorage.setItem('lb-name',nm); }catch(e){}
    const tried=LES.map(l=>{ let z=0; l.secs.forEach((s2,si)=>s2.steps.forEach((st,ki)=>st.parts.forEach((q,pi)=>{ if((q.k==='prac'||q.k==='self')&&ST.ex[`${l.id}-${si}-${ki}-${pi}`]===0) z++; }))); return z?`  • ${l.no} ${l.t}: ${z}`:''; }).filter(Boolean);
    const txt=[`الرياضيات الحيّة — ${B.grade} · ${B.chapter}: ${B.title}`, nm?`الاسم: ${nm}`:'', `الدروس المكتملة: ${seen} من ${LES.length}`, tot?`التمارين المحلولة: ${done} من ${tot}`:'', ST.gen?`تمارين مشابهة حُلّت صحيحاً: ${ST.gen}`:'',
      tried.length?'تمارين حاولتها ولم أحلّها بعد:\n'+tried.join('\n'):'', 'التاريخ: '+new Date().toLocaleDateString('ar-IQ')].filter(Boolean).join('\n');
    const pre=$('#shT'); pre.hidden=false; pre.textContent=txt;
    try{ if(navigator.share){ await navigator.share({text:txt}); return; } }catch(e){ if(e&&e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(txt); $('#shB').textContent='✓ نُسخ النص: الصقه في رسالة للمدرّس'; }catch(e){ $('#shB').textContent='انسخ النص الظاهر أو صوّره'; } };
}

/* ================= lesson ================= */
let steps=[], secs=[], active=null, curLes=null;
function renderLesson(les){
  D.body.classList.remove('is-home'); curLes=les; ST.last=les.id; save(); D.title=`${les.t.replace(/\$[^$]*\$/g,'')} – ${B.title}`;
  $('#crS').textContent=`${B.grade} · ${B.chapter} · ${/^\d/.test(les.no)?'['+les.no+']':les.no} · ص ${les.pg}`; $('#crB').innerHTML=T(les.t); typeset($('#crB'));
  $('#bBack').href='#'; $('#bBackL').textContent='الدروس'; $('#bLessons').hidden=true;
  let prevSc=null, h='';
  les.secs.forEach((sec,si)=>{ h+=`<section class="sec" data-sec="${esc(sec.t)}" data-stg="${esc(sec.stg||'')}" id="s${si}">`;
    sec.steps.forEach((st,ki)=>{ const sc=st.sc&&B.S[st.sc]?st.sc:prevSc; if(st.sc&&!B.S[st.sc]) console.warn('scene?',st.sc); prevSc=sc;
      h+=`<div class="step ${st.cls.join(' ')}" data-scene="${esc(sc||'')}">${stepHTML(st,les,si,ki)}</div>`; });
    h+='</section>'; });
  const i=LES.indexOf(les), nx=LES[i+1];
  h+=`<section class="sec" data-sec="التالي" id="sEnd"><div class="summary step" data-scene="${esc(prevSc||'')}"><h2>أحسنت!</h2><p>أنهيت درس «${T(les.t)}».</p><div class="lnav">${nx?`<a href="#l=${nx.id}"><span><small>الدرس التالي · ${esc(/^\d/.test(nx.no)?'['+nx.no+']':nx.no)}</small><br>${T(nx.t)}</span><span>←</span></a>`:''}<a href="#"><span>كل دروس الفصل</span><span>←</span></a><a href="#l=${les.id}" data-top><span>إعادة الدرس من أوله</span><span>↑</span></a></div></div></section>`;
  story.innerHTML=h; typeset(story);
  steps=$$('.step',story); secs=$$('.sec',story); active=null;
  outline.innerHTML=secs.map((s,i)=>`<li><a href="#l=${les.id}" data-s="${i}"><span class="n">${s.dataset.stg&&STAGES[s.dataset.stg]?STAGES[s.dataset.stg][1]:i+1}</span>${esc(s.dataset.sec)}</a></li>`).join('');
  /* stage bar: jump straight to any of the six stages */
  const stg=Object.keys(STAGES).filter(k=>secs.some(x=>x.dataset.stg===k)); const sb=$('#stages');
  sb.hidden=!stg.length; root.classList.toggle('has-stages',!!stg.length); sb.innerHTML=stg.map((k,i)=>`<button type="button" data-stg="${k}" title="${STAGES[k][0]} (${i+1})"><span>${STAGES[k][1]}</span>${STAGES[k][0]}</button>`).join('');
  $$('button',sb).forEach(b=>b.onclick=()=>{ const sec=secs.find(x=>x.dataset.stg===b.dataset.stg); const st=sec&&$('.step',sec); if(st) activate(st,1); });
  $$('a',outline).forEach(a=>a.onclick=e=>{ e.preventDefault(); secs[+a.dataset.s].scrollIntoView({behavior:'smooth'}); });
  $$('[data-top]',story).forEach(a=>a.onclick=e=>{ e.preventDefault(); scrollTo({top:0,behavior:'smooth'}); });
  wire(les); cur=null; from=null; scrollTo({top:0,behavior:'instant'}); requestAnimationFrame(()=>{ size(); pick(); });
}
function route(){ const m=location.hash.match(/l=([\w-]+)/), les=m&&LES.find(l=>l.id===m[1]); if(les) renderLesson(les); else { curLes=null; renderHome(); } }
addEventListener('hashchange',route);

/* ================= interactions inside the story ================= */
function num(s){ s=String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[−–]/g,'-').replace(/٫/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/\s/g,'');
  s=s.replace(/(\d*)([½⅓⅔¼¾])/g,(m,d,f)=>'('+(d||0)+'+'+{'½':'1/2','⅓':'1/3','⅔':'2/3','¼':'1/4','¾':'3/4'}[f]+')');
  s=s.replace(/π/g,'(PI)').replace(/\bpi\b/gi,'(PI)').replace(/²/g,'^2').replace(/³/g,'^3');
  s=s.replace(/∛\(/g,'cbrt(').replace(/√\(/g,'sqrt(').replace(/∛([0-9.]+)/g,'cbrt($1)').replace(/√([0-9.]+|\(PI\))/g,'sqrt($1)');
  s=s.replace(/ln\(/g,'LN(').replace(/ln([0-9.]+|\(PI\))/g,'LN($1)').replace(/(^|[^a-zA-Z])e(?![a-zA-Z])/g,'$1(EE)');
  s=s.replace(/(\d|\))(\(|sqrt|cbrt|LN)/g,'$1*$2');
  if(!/^[-+*/^0-9.()a-zA-Z]*$/.test(s)||/[a-zA-Z]/.test(s.replace(/sqrt|cbrt|PI|LN|EE/g,''))) return NaN;
  s=s.replace(/\^/g,'**').replace(/sqrt/g,'Math.sqrt').replace(/cbrt/g,'Math.cbrt').replace(/PI/g,'Math.PI').replace(/LN/g,'Math.log').replace(/EE/g,'Math.E');
  try{ const v=Function('"use strict";return ('+s+')')(); return typeof v==='number'?v:NaN; }catch(e){ return NaN; } }
function nums(s){ s=String(s).replace(/[−–]/g,'-').replace(/\b[a-zA-Z]\s*=/g,'').replace(/[a-zA-Z]+[²³]?(\/[a-zA-Z]+)?/g,m=>/^(pi|sqrt|cbrt|ln|e)$/i.test(m.replace(/[²³]$/,''))?m:'');
  s=s.replace(/\(([^()]*[,،][^()]*)\)/g,'$1');
  const out=[], dec=[]; for(let part of s.split(/[,،;؛]|\sو\s?|\sأو\s|\bor\b/)){ part=part.trim(); if(!part) continue;
    const m=part.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g,'.').match(/^[-+]?\d*\.(\d+)$/), d=m?m[1].length:0;
    if(part.includes('±')){ const [a,b]=part.split('±'); const x=a.trim()?num(a):0, y=num(b); out.push(x+y,x-y); dec.push(0,0); } else { out.push(num(part)); dec.push(d); } }
  out.dec=dec; return out; }
function same(got,key){ if(got.length!==key.length||got.some(v=>!isFinite(v))) return false;
  const g=got.map((v,i)=>({v,d:(got.dec||[])[i]||0})).sort((a,b)=>a.v-b.v), k=[...key].sort((a,b)=>a-b);
  return k.every((v,i)=>Math.abs(v-g[i].v)<=Math.max(1e-4,Math.abs(v)*2e-4,g[i].d?0.51*10**-g[i].d:0)); }
/* «تمرين مشابه»: generator G[name]() → {q, ans, sol:[lines], sc?} */
let genN=0;
function genEx(name,bx){ const g=B.G&&B.G[name]; if(!g) return; const E=g(); bx.hidden=false;
  bx.innerHTML=`<p class="gq"><b>تمرين مشابه:</b> ${T(E.q)}</p><div class="prac"><input inputmode="text" autocomplete="off" placeholder="${esc(E.ph||'الجواب')}" aria-label="الجواب"><button type="button" class="btn">تحقّق</button></div><div class="fb"></div>`+
   `<div class="selfrow"><button type="button" class="btn ghost small" data-gs>الحل</button><button type="button" class="btn ghost small" data-gn>↻ تمرين آخر</button></div><div class="sol">${E.sol.map(x=>LN(x)).join('<br>')}</div>`;
  typeset(bx); const inp=$('input',bx), fb=$('.fb',bx), sol=$('.sol',bx), key=nums(E.ans);
  const check=()=>{ const got=nums(inp.value.trim()); if(!inp.value.trim()||!got.length||got.some(x=>!isFinite(x))){ fb.textContent='اكتب جوابك عدداً'; fb.className='fb'; return; }
    if(same(got,key)){ fb.textContent='✓ صحيح! جرّب تمريناً آخر لتتأكد.'; fb.className='fb ok'; sol.classList.add('on'); ST.gen=(ST.gen||0)+1; save(); }
    else { const m=(E.miss||[]).find(([k])=>same(got,nums(k))); fb.innerHTML='✗ '+(m?T(m[1]):'ليس صحيحاً بعد. حاول مرة أخرى أو اعرض الحل.'); if(m) typeset(fb); fb.className='fb bad'; } };
  $('.btn',bx).onclick=check; inp.addEventListener('keydown',e=>{ if(e.key==='Enter') check(); });
  $('[data-gs]',bx).onclick=()=>sol.classList.toggle('on'); $('[data-gn]',bx).onclick=()=>genEx(name,bx);
  if(E.sc){ const k='gen'+(++genN); B.S[k]=E.sc; const stp=bx.closest('.step'); if(stp){ stp.dataset.scene=k; go(k); } } }
function wire(les){
  $$('.ask',story).forEach(q=>{ const ans=+q.dataset.ans, why=q.nextElementSibling;
    $$('.opt',q).forEach((b,i)=>b.onclick=()=>{ $$('.opt',q).forEach((x,j)=>{ x.classList.toggle('right',j===ans); x.classList.toggle('wrong',j===i&&i!==ans); }); why&&why.classList.add('on'); }); });
  $$('.prac',story).forEach(p=>{ const key=nums(p.dataset.key), inp=$('input',p), fb=p.nextElementSibling, row=fb.nextElementSibling, id=p.dataset.id; let sol=row.nextElementSibling; while(sol&&!sol.classList.contains('sol')) sol=sol.nextElementSibling;
    const miss=p.dataset.miss?JSON.parse(decodeURIComponent(p.dataset.miss)):[];
    if(!sol.innerHTML.trim()&&!row.querySelector('[data-hint],[data-gen]')) row.hidden=true; else if(!sol.innerHTML.trim()) $('[data-show]',row).hidden=true;
    const mark=v=>{ ST.ex[id]=v; save(); };
    if(ST.ex[id]!==undefined) row.dataset.tried=1;
    if(ST.ex[id]===1){ fb.textContent='✓ حللته سابقاً'; fb.className='fb ok'; }
    const check=()=>{ const v=inp.value.trim(); if(!v){ fb.textContent='اكتب جوابك أولاً'; fb.className='fb'; return; } row.dataset.tried=1;
      const got=nums(v); if(!got.length||got.some(x=>!isFinite(x))){ fb.textContent='اكتب عدداً، مثل 3 أو 1/2 أو √5 أو -4'; fb.className='fb'; return; }
      if(same(got,key)){ fb.textContent='✓ صحيح!'; fb.className='fb ok'; mark(1); sol.classList.add('on'); if(p.dataset.ok&&B.S[p.dataset.ok]){ p.closest('.step').dataset.scene=p.dataset.ok; go(p.dataset.ok); } }
      else if(key.length>1&&got.length<key.length&&got.every(g=>key.some(k=>Math.abs(k-g)<=1e-3))){ fb.textContent=`صحيح جزئياً: للسؤال ${key.length} قيم، افصل بينها بفاصلة.`; fb.className='fb'; }
      else { const m=miss.find(([k])=>same(got,nums(k))); fb.innerHTML=m?'✗ '+T(m[1]):'✗ ليس صحيحاً بعد. راجع خطواتك'+(row.querySelector('[data-hint]')?' أو اطلب تلميحاً.':' وحاول مرة أخرى.'); fb.className='fb bad'; if(m) typeset(fb); if(ST.ex[id]!==1) mark(0); } };
    $('.btn',p).onclick=check; inp.addEventListener('keydown',e=>{ if(e.key==='Enter') check(); });
    $('[data-show]',row).onclick=()=>{ if(sol.classList.contains('on')||gate(row,fb)) sol.classList.toggle('on'); }; });
  $$('[data-hint]',story).forEach(b=>{ const hs=$$('.hn',b.parentElement.nextElementSibling); let i=0;
    b.onclick=()=>{ if(i<hs.length){ hs[i].hidden=false; i++; } b.querySelector('bdi').textContent=Math.min(i+1,hs.length)+'/'+hs.length; if(i>=hs.length){ b.disabled=true; b.firstChild.textContent='💡 لا تلميحات أخرى '; } }; });
  $$('[data-gen]',story).forEach(b=>{ let bx=b.parentElement.nextElementSibling; while(bx&&!bx.classList.contains('genbox')) bx=bx.nextElementSibling; b.onclick=()=>genEx(b.dataset.gen,bx); });
  $$('[data-self]',story).forEach(r=>{ const id=r.dataset.self; let sol=r.nextElementSibling; while(sol&&!sol.classList.contains('sol')) sol=sol.nextElementSibling; const mk=$('.mk',r), dn=$('.done',r);
    const show=v=>{ mk.hidden=true; dn.hidden=false; dn.textContent=v===1?'✓ حللته':'سأعيد المحاولة'; dn.style.color=v===1?'':'var(--muted)'; };
    if(ST.ex[id]!==undefined) show(ST.ex[id]);
    $('[data-show]',r).onclick=()=>{ sol.classList.toggle('on'); if(ST.ex[id]===undefined){ mk.hidden=false; } if(r.dataset.ok&&B.S[r.dataset.ok]){ r.closest('.step').dataset.scene=r.dataset.ok; go(r.dataset.ok); } };
    $('[data-y]',r).onclick=()=>{ ST.ex[id]=1; save(); show(1); }; $('[data-n]',r).onclick=()=>{ ST.ex[id]=0; save(); show(0); }; });
}

/* ================= figure renderer ================= */
const svg=$('#svg'), box=$('#box'), NS='http://www.w3.org/2000/svg';
const css=n=>getComputedStyle(root).getPropertyValue('--'+n).trim();
let W=0,H=0, cur=null, from=null, t=1, raf=0, cDrag=null, sweepT=0, P=0, playing=false, playT=0, T0=performance.now();
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2, lerp=(a,b,k)=>a+(b-a)*k;
const fmt=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
function el(tag,attrs,parent){ const e=D.createElementNS(NS,tag); for(const k in attrs) if(attrs[k]!==undefined) e.setAttribute(k,attrs[k]); (parent||svg).appendChild(e); return e; }
function niceStep(range,px,min){ for(const s of [.05,.1,.2,.25,.5,1,2,2.5,5,10,20,25,50,100,200,500]) if(px*s/range>=min) return s; return 1000; }
const fnOf=sc=>sc.f?{f:sc.f,d:sc.d,d2:sc.d2,dom:sc.dom,brk:sc.brk}:(B.F&&B.F[sc.fn])||null;
const nd=(f,x,p)=>{ const h=1e-4; return (f(x+h,p)-f(x-h,p))/(2*h); };
function view(sc){ if(!sc.v) return null; let [x0,x1,y0,y1]=sc.v; const pad={l:34,r:14,t:14,b:sc.sign?82:26};
  if(sc.eq){ const sx=(W-pad.l-pad.r)/(x1-x0), sy=(H-pad.t-pad.b)/(y1-y0); if(sx<sy){ const m=(y0+y1)/2, h=(H-pad.t-pad.b)/sx; y0=m-h/2; y1=m+h/2; } else { const m=(x0+x1)/2, w=(W-pad.l-pad.r)/sy; x0=m-w/2; x1=m+w/2; } }
  return {x0,x1,y0,y1,pad}; }
function mixV(A,B2,k){ return {x0:lerp(A.x0,B2.x0,k),x1:lerp(A.x1,B2.x1,k),y0:lerp(A.y0,B2.y0,k),y1:lerp(A.y1,B2.y1,k),pad:B2.pad}; }
function colors(){ return {f:css('f'),chord:css('chord'),tan:css('tan'),c:css('c'),int:css('int'),grid:css('grid'),axis:css('axis'),muted:css('muted'),ink:css('ink'),ink2:css('ink2'),surf:css('surface'),surf2:css('surface2'),ok:css('ok'),bad:css('bad'),line:css('line'),accent:css('accent')}; }
const C2=n=>n&&n[0]!=='#'&&!n.startsWith('rgb')?(COL[n]||n):n; let COL={};
function lab(x,y,s,o={},parent){ const e=el('text',{x,y,fill:C2(o.fill)||COL.muted,'font-size':o.size||11,'text-anchor':o.anchor||'middle','font-weight':o.w||400,'dominant-baseline':'middle','font-style':o.it?'italic':undefined},parent||svg);
  if(o.halo) { e.setAttribute('paint-order','stroke'); e.setAttribute('stroke',COL.surf); e.setAttribute('stroke-width',4); e.setAttribute('stroke-linejoin','round'); }
  e.textContent=iso(s); return e; }
/* a small plot inside a rectangle: used by custom geometry scenes */
function subplot(G,rect,v,o={}){ const [rx,ry,rw,rh]=rect, [x0,x1,y0,y1]=v, X=x=>rx+(x-x0)/(x1-x0)*rw, Y=y=>ry+(y1-y)/(y1-y0)*rh;
  const api={X,Y,
    axes(xl,yl){ const sx=niceStep(x1-x0,rw,40), sy=niceStep(y1-y0,rh,28); let g=''; for(let x=Math.ceil(x0/sx)*sx;x<=x1+1e-9;x+=sx) g+=`M${X(x)} ${ry}V${ry+rh}`; for(let y=Math.ceil(y0/sy)*sy;y<=y1+1e-9;y+=sy) g+=`M${rx} ${Y(y)}H${rx+rw}`;
      el('path',{d:g,stroke:COL.grid,'stroke-width':1,fill:'none'},G); const ya=Math.min(Math.max(0,y0),y1), xa=Math.min(Math.max(0,x0),x1);
      el('path',{d:`M${rx} ${Y(ya)}H${rx+rw}M${X(xa)} ${ry+rh}V${ry}`,stroke:COL.axis,'stroke-width':1.3},G);
      for(let x=Math.ceil(x0/sx)*sx;x<=x1+1e-9;x+=sx) if(Math.abs(x)>1e-9) lab(X(x),Y(ya)+11,fmt(x),{size:10},G);
      for(let y=Math.ceil(y0/sy)*sy;y<=y1+1e-9;y+=sy) if(Math.abs(y)>1e-9) lab(X(xa)-4,Y(y),fmt(y),{size:10,anchor:'end'},G);
      if(xl) lab(rx+rw-2,Y(ya)-9,xl,{anchor:'end',size:12,w:700,fill:COL.ink2},G); if(yl) lab(X(xa)+6,ry+8,yl,{anchor:'start',size:12,w:700,fill:COL.ink2},G); return api; },
    curve(f,col,a=x0,b=x1,w=2.6,dash){ let d='',pen=false; for(let i=0;i<=240;i++){ const x=a+(b-a)*i/240, y=f(x); if(!isFinite(y)||y<y0-(y1-y0)||y>y1+(y1-y0)){ pen=false; continue; } d+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1); pen=true; }
      el('path',{d,stroke:C2(col),'stroke-width':w,fill:'none','stroke-dasharray':dash,'stroke-linecap':'round'},G); return api; },
    pt(x,y,col,label,o={}){ el('circle',{cx:X(x),cy:Y(y),r:o.r||5,fill:o.open?COL.surf:C2(col),stroke:C2(col),'stroke-width':2},G); if(label) lab(X(x)+(o.dx??0),Y(y)+(o.dy??-13),label,{fill:col,w:700,size:12,halo:1},G); return api; },
    seg(xa,ya,xb,yb,col,o={}){ el('path',{d:`M${X(xa)} ${Y(ya)}L${X(xb)} ${Y(yb)}`,stroke:C2(col),'stroke-width':o.w||1.6,'stroke-dasharray':o.dash},G); return api; }};
  return api; }

function draw(){
  if(!W||!cur) return; COL=colors(); const sc=cur, k=from&&from.v&&sc.v?ease(Math.min(1,t)):1;
  svg.replaceChildren(); svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  $('#figTitle').textContent=iso(sc.title||''); const chips=[]; let hint=sc.hint||'', hintOk=false;
  const legend=[];
  const A={W,H,el,lab,col:COL,p:P,t:(performance.now()-T0)/1000,svg,fmt,subplot:(r,v)=>subplot(svg,r,v),chips,set hint(v){ hint=v; },get hint(){ return hint; },set ok(v){ hintOk=v; },get ok(){ return hintOk; }};
  lastA=A;
  if(sc.v){
    const Vb=view(sc), V=from&&from.v&&k<1?mixV(view(from),Vb,k):Vb, pad=V.pad, gb=H-pad.b;
    const X=x=>pad.l+(x-V.x0)/(V.x1-V.x0)*(W-pad.l-pad.r), Y=y=>pad.t+(V.y1-y)/(V.y1-V.y0)*(gb-pad.t), W2X=px=>V.x0+(px-pad.l)/(W-pad.l-pad.r)*(V.x1-V.x0);
    Object.assign(A,{X,Y,V,W2X});
    /* grid & axes */
    if(!sc.noaxes){ const sx=sc.sx||niceStep(V.x1-V.x0,W,56), sy=sc.sy||niceStep(V.y1-V.y0,gb,40); let g='';
      for(let x=Math.ceil(V.x0/sx)*sx;x<=V.x1;x+=sx) g+=`M${X(x)} ${pad.t}V${gb}`; for(let y=Math.ceil(V.y0/sy)*sy;y<=V.y1;y+=sy) g+=`M${pad.l} ${Y(y)}H${W-pad.r}`;
      el('path',{d:g,stroke:COL.grid,'stroke-width':1,fill:'none'});
      const ya=Math.min(Math.max(0,V.y0),V.y1), xa=Math.min(Math.max(0,V.x0),V.x1); A.ya=ya;
      el('path',{d:`M${pad.l} ${Y(ya)}H${W-pad.r}M${X(xa)} ${gb}V${pad.t}`,stroke:COL.axis,'stroke-width':1.4});
      const xf=sc.xfmt||fmt;
      for(let x=Math.ceil(V.x0/sx)*sx;x<=V.x1+1e-9;x+=sx){ if(Math.abs(x)<1e-9) continue; lab(X(x),Math.min(gb-6,Y(ya)+13),xf(x)); }
      for(let y=Math.ceil(V.y0/sy)*sy;y<=V.y1+1e-9;y+=sy){ if(Math.abs(y)<1e-9) continue; lab(Math.max(pad.l-6,X(xa)-6),Y(y),fmt(y),{anchor:'end'}); }
      if(sc.axl){ lab(W-pad.r-4,Y(ya)-10,sc.axl[0],{anchor:'end',size:12,w:700,fill:COL.ink2}); lab(X(xa)+8,pad.t+8,sc.axl[1],{anchor:'start',size:12,w:700,fill:COL.ink2}); } }
    const ya=A.ya??0;
    const cp=el('clipPath',{id:'cp'}); el('rect',{x:pad.l,y:pad.t,width:W-pad.l-pad.r,height:gb-pad.t},cp);
    const G=el('g',{'clip-path':'url(#cp)'}); A.G=G;
    if(sc.under) sc.under(A);
    /* asymptotes */
    if(sc.asy){ (sc.asy.v||[]).forEach(x=>{ el('path',{d:`M${X(x)} ${pad.t}V${gb}`,stroke:COL.muted,'stroke-width':1.6,'stroke-dasharray':'7 6'},G); lab(X(x)+4,pad.t+10,`x = ${fmt(x)}`,{anchor:'start',size:11.5,w:700,halo:1},G); });
      (sc.asy.h||[]).forEach(y=>{ el('path',{d:`M${pad.l} ${Y(y)}H${W-pad.r}`,stroke:COL.muted,'stroke-width':1.6,'stroke-dasharray':'7 6'},G); lab(W-pad.r-4,Y(y)-10,`y = ${fmt(y)}`,{anchor:'end',size:11.5,w:700,halo:1},G); }); }
    const fo=fnOf(sc), pfo=from?fnOf(from):null;
    let a=sc.a??V.x0, b=sc.b??V.x1; if(from&&k<1&&from.a!==undefined&&sc.a!==undefined){ a=lerp(from.a,sc.a,k); b=lerp(from.b,sc.b,k); }
    if(sc.sweep){ b=sc.sweep[0]+(sc.sweep[1]-sc.sweep[0])*(0.5+0.5*Math.cos(sweepT)); }
    const f=fo?(x=>{ const y1=fo.f(x,P); if(!pfo||k>=1||pfo.f===fo.f) return y1; return lerp(pfo.f(x,P),y1,k); }):null;
    const d1=fo?(x=>fo.d?fo.d(x,P):nd(fo.f,x,P)):null, d2=fo?(x=>fo.d2?fo.d2(x,P):nd((u,p)=>d1(u),x,P)):null;
    Object.assign(A,{f,d1,d2,a,b});
    /* interval band */
    if(sc.interval){ el('rect',{x:X(a),y:pad.t,width:X(b)-X(a),height:gb-pad.t,fill:COL.int,opacity:.07},G);
      el('path',{d:`M${X(a)} ${Y(ya)}H${X(b)}`,stroke:COL.int,'stroke-width':4,'stroke-linecap':'round',opacity:.85},G);
      lab(X(a),Y(ya)-12,sc.al||'a',{fill:COL.int,w:700,size:13}); lab(X(b),Y(ya)-12,sc.bl||'b',{fill:COL.int,w:700,size:13}); }
    /* curves */
    const brk=(fo&&fo.brk)||[];
    const path=(fn,x0,x1,n=420)=>{ let d='',pen=false; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n; if(brk.some(q=>Math.abs(x-q)<(x1-x0)/n*1.01)){ pen=false; continue; } const y=fn(x); if(!isFinite(y)||Math.abs(y)>1e4||y>V.y1+(V.y1-V.y0)*2||y<V.y0-(V.y1-V.y0)*2){ pen=false; continue; } d+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1); pen=true; } return d; };
    A.path=path;
    (sc.curves||[]).forEach(c=>{ const dm=c.dom||[V.x0,V.x1]; el('path',{d:path(x=>c.f(x,P),Math.max(V.x0,dm[0]),Math.min(V.x1,dm[1])),stroke:C2(c.col||'f'),'stroke-width':c.w||2.4,fill:'none','stroke-dasharray':c.dash,opacity:c.op??1},G); if(c.lab) lab(X(c.lab[0]),Y(c.lab[1]),c.lab[2],{fill:c.col||'f',w:700,size:12.5,halo:1},G); });
    if(f){ const dom=fo.dom||[V.x0,V.x1], lo=Math.max(V.x0,dom[0]), hi=Math.min(V.x1,dom[1]);
      const emph=(sc.a!==undefined||sc.sweep), runs=[];
      if(sc.mono||sc.conc){ const g=sc.mono?d1:d2, n=420; let st=null;
        for(let i=0;i<=n;i++){ const x=lo+(hi-lo)*i/n, s=Math.sign(Math.round(g(x)*1e6)/1e6)||0; if(!st||s!==st.s&&s!==0){ if(st) st.x1=x; st={s,x0:st?st.x1:lo}; runs.push(st); } } if(st) st.x1=hi;
        runs.forEach(r=>{ const col=sc.mono?(r.s>0?COL.ok:r.s<0?COL.bad:COL.f):(r.s>0?COL.int:r.s<0?COL.chord:COL.f); el('path',{d:path(f,r.x0,r.x1,Math.max(20,Math.round(420*(r.x1-r.x0)/(hi-lo)))),stroke:col,'stroke-width':3.4,fill:'none','stroke-linecap':'round'},G); });
        if(sc.mono) legend.push([COL.ok,'متزايدة · '+(sc.mono===2?'f′ > 0':'f′(x) > 0')],[COL.bad,'متناقصة · f′(x) < 0']); else legend.push([COL.int,'مقعرة · f″(x) > 0'],[COL.chord,'محدبة · f″(x) < 0']);
      } else {
        el('path',{d:path(f,lo,hi),stroke:COL.f,'stroke-width':emph?2:3,fill:'none',opacity:emph?.28:1,'stroke-linecap':'round'},G);
        if(emph) el('path',{d:path(f,Math.max(lo,Math.min(a,b)),Math.min(hi,Math.max(a,b))),stroke:COL.f,'stroke-width':3.2,fill:'none','stroke-linecap':'round'},G); }
      if(sc.flab) lab(X(sc.flab[0]),Y(sc.flab[1]),sc.flab[2],{fill:COL.f,w:700,size:13,halo:1},G);
    }
    /* chord, tangent, c */
    const L=V.x1-V.x0, line=(x1,y1,s,colr,o={})=>el('path',{d:`M${X(x1-L)} ${Y(y1-s*L)}L${X(x1+L)} ${Y(y1+s*L)}`,stroke:colr,'stroke-width':o.w||2.2,'stroke-dasharray':o.dash||'',opacity:o.op??1},G);
    A.line=line;
    let m=NaN, mt=NaN; const fa=f?f(a):0, fb=f?f(b):0;
    const chO=sc.chord||0;
    if(f&&chO){ m=(fb-fa)/(b-a); line(a,fa,m,COL.chord,{w:1.6,dash:'6 6',op:.55*chO}); el('path',{d:`M${X(a)} ${Y(fa)}L${X(b)} ${Y(fb)}`,stroke:COL.chord,'stroke-width':3,opacity:chO,'stroke-linecap':'round'},G);
      chips.push(['chord','ميل الوتر',fmt(m)]); }
    if(f&&sc.tri){ el('path',{d:`M${X(a)} ${Y(fa)}H${X(b)}V${Y(fb)}`,stroke:COL.chord,'stroke-width':1.6,'stroke-dasharray':'4 4',fill:'none'},G);
      lab((X(a)+X(b))/2,Y(fa)+(fb>fa?14:-12),'Δx',{fill:COL.chord,w:700,size:13}); if(Math.abs(fb-fa)>1e-6) lab(X(b)+16,(Y(fa)+Y(fb))/2,'Δy',{fill:COL.chord,w:700,size:13}); }
    const c=cDrag!==null&&sc.drag?cDrag:sc.c;
    if(f&&sc.tan&&c!==undefined){ const yc=f(c); mt=d1(c); if(isFinite(mt)) line(c,yc,mt,COL.tan,{w:2.6});
      el('path',{d:`M${X(c)} ${Y(yc)}V${Y(ya)}`,stroke:COL.c,'stroke-width':1.2,'stroke-dasharray':'3 4'},G);
      lab(X(c),Math.min(gb-8,Y(ya)+14),sc.cl||'c',{fill:COL.c,w:700,size:13,halo:1});
      chips.push(['tan',sc.tl||'f′(c)',fmt(mt)],['c',sc.cl||'c',sc.cfmt?sc.cfmt(c):fmt(c)]); }
    if(f&&sc.cusp!==undefined){ el('circle',{cx:X(sc.cusp),cy:Y(f(sc.cusp)),r:9,fill:'none',stroke:COL.c,'stroke-width':2,'stroke-dasharray':'3 3'},G); }
    if(f&&sc.reject){ const [r,txt]=sc.reject, yr=f(r); el('circle',{cx:X(r),cy:Y(yr),r:6,fill:'none',stroke:COL.muted,'stroke-width':2},G); el('path',{d:`M${X(r)-6} ${Y(yr)-6}L${X(r)+6} ${Y(yr)+6}M${X(r)+6} ${Y(yr)-6}L${X(r)-6} ${Y(yr)+6}`,stroke:COL.muted,'stroke-width':2},G); lab(X(r),Y(yr)-16,txt,{fill:COL.muted,size:12,w:700,halo:1},G); }
    if(f&&(chO||sc.interval)&&!sc.noAB){ [[a,fa,sc.Al||'A'],[b,fb,sc.Bl||'B']].forEach(([x,y,s],i)=>{ if(!isFinite(y)) return; el('circle',{cx:X(x),cy:Y(y),r:5.5,fill:COL.surf,stroke:COL.chord,'stroke-width':2.4},G); lab(X(x)+(i?12:-12),Y(y)-13,s,{fill:COL.chord,w:700,size:14,halo:1},G); }); }
    if(f&&sc.tan&&c!==undefined){ const yc=f(c), par=isFinite(mt)&&isFinite(m)&&Math.abs(mt-m)<.03*(1+Math.abs(m));
      if(sc.drag) el('circle',{cx:X(c),cy:Y(yc),r:16,fill:COL.c,opacity:.14,class:'handle'},G);
      el('circle',{cx:X(c),cy:Y(yc),r:7.5,fill:COL.c,stroke:COL.surf,'stroke-width':2.5,class:sc.drag?'handle':''},G);
      if(par&&chO){ el('circle',{cx:X(c),cy:Y(yc),r:13,fill:'none',stroke:COL.tan,'stroke-width':2},G); if(sc.drag){ hint='✓ المماس يوازي الوتر: ميلاهما متساويان'; hintOk=true; } }
      if(sc.zero&&Math.abs(mt)<.03&&sc.drag){ hint='✓ المماس أفقي: f′(c) = 0'; hintOk=true; } }
    /* segments, points, labels */
    (sc.segs||[]).forEach(([x1,y1,x2,y2,col,dash,w])=>el('path',{d:`M${X(x1)} ${Y(y1)}L${X(x2)} ${Y(y2)}`,stroke:C2(col||'muted'),'stroke-width':w||1.6,'stroke-dasharray':dash?'5 5':undefined},G));
    (typeof sc.pts==='function'?sc.pts(A):sc.pts||[]).forEach(([x,y,s,col,o={}])=>{ col=C2(col||'c'); if(o.open) el('circle',{cx:X(x),cy:Y(y),r:6,fill:COL.surf,stroke:col,'stroke-width':2.4},G); else el('circle',{cx:X(x),cy:Y(y),r:6,fill:col,stroke:COL.surf,'stroke-width':2.2},G);
      if(s) lab(X(x)+(o.dx??0),Y(y)+(o.dy??-15),s,{fill:col,w:700,size:12.5,halo:1},G); });
    (sc.labs||[]).forEach(([x,y,s,col,o={}])=>lab(X(x),Y(y),s,{fill:C2(col||'ink2'),w:700,size:o.size||12.5,halo:1,anchor:o.anchor},G));
    /* v1 figure spec (worked examples): C circles, I implicit, P plots, L lines, S segments, V verticals, Pt points, R shading */
    if(sc.spec){ const F=sc.spec, CM={'c-std':'f','c-center':'c','c-radius':'chord','c-point':'c','c-gen':'int','c-cut':'tan'}, cc=(k,d)=>COL[CM[k]||k]||k||COL[d];
      (F.R||[]).forEach(([x0,y0,x1,y1,col])=>el('rect',{x:X(Math.min(x0,x1)),y:Y(Math.max(y0,y1)),width:Math.abs(X(x1)-X(x0)),height:Math.abs(Y(y1)-Y(y0)),fill:cc(col,'int'),opacity:.12},G));
      (F.V||[]).forEach(x=>el('path',{d:`M${X(x)} ${pad.t}V${gb}`,stroke:COL.muted,'stroke-width':1.2,'stroke-dasharray':'5 5'},G));
      (F.L||[]).forEach(([a2,b2,c2,col,dash])=>{ const st={stroke:cc(col,'chord'),'stroke-width':2,'stroke-dasharray':dash?'6 4':undefined};
        if(Math.abs(b2)<1e-12){ const x=-c2/a2; el('path',{d:`M${X(x)} ${pad.t}V${gb}`,...st},G); } else { const y=x=>(-c2-a2*x)/b2; el('path',{d:`M${X(V.x0)} ${Y(y(V.x0))}L${X(V.x1)} ${Y(y(V.x1))}`,...st},G); } });
      (F.C||[]).forEach(([h,k2,r,col,dash])=>el('ellipse',{cx:X(h),cy:Y(k2),rx:Math.abs(X(h+r)-X(h)),ry:Math.abs(Y(k2+r)-Y(k2)),fill:'none',stroke:cc(col,'f'),'stroke-width':2.8,'stroke-dasharray':dash?'6 4':undefined},G));
      (F.I||[]).forEach(([Fn,col])=>{ const nx=160, ny=120, dx=(V.x1-V.x0)/nx, dy=(V.y1-V.y0)/ny; let d='';
        const val=(i,j)=>Fn(V.x0+i*dx,V.y0+j*dy);
        for(let i=0;i<nx;i++) for(let j=0;j<ny;j++){ const a=val(i,j), b=val(i+1,j), c=val(i+1,j+1), e=val(i,j+1), P2=[];
          const ed=(v1,v2,x1,y1,x2,y2)=>{ if((v1<0)!==(v2<0)){ const t=v1/(v1-v2); P2.push([x1+(x2-x1)*t,y1+(y2-y1)*t]); } };
          ed(a,b,i,j,i+1,j); ed(b,c,i+1,j,i+1,j+1); ed(c,e,i+1,j+1,i,j+1); ed(e,a,i,j+1,i,j);
          for(let q=0;q+1<P2.length;q+=2) d+=`M${X(V.x0+P2[q][0]*dx).toFixed(1)} ${Y(V.y0+P2[q][1]*dy).toFixed(1)}L${X(V.x0+P2[q+1][0]*dx).toFixed(1)} ${Y(V.y0+P2[q+1][1]*dy).toFixed(1)}`; }
        el('path',{d,stroke:cc(col,'f'),'stroke-width':2.6,fill:'none','stroke-linecap':'round'},G); });
      (F.P||[]).forEach(([fn,a2,b2,col,dash])=>el('path',{d:path(fn,Math.max(V.x0,a2??V.x0),Math.min(V.x1,b2??V.x1)),stroke:cc(col,'f'),'stroke-width':2.8,fill:'none','stroke-dasharray':dash?'6 4':undefined,'stroke-linecap':'round'},G));
      (F.S||[]).forEach(([x1,y1,x2,y2,col,dash,l])=>{ el('path',{d:`M${X(x1)} ${Y(y1)}L${X(x2)} ${Y(y2)}`,stroke:cc(col,'chord'),'stroke-width':2.4,'stroke-dasharray':dash?'5 4':undefined},G); if(l) lab((X(x1)+X(x2))/2+8,(Y(y1)+Y(y2))/2-10,l,{fill:cc(col,'chord'),w:700,size:12.5,anchor:'start',halo:1},G); });
      (F.Pt||[]).forEach(([x,y,l,col])=>{ const c3=cc(col,'c'); el('circle',{cx:X(x),cy:Y(y),r:5.5,fill:c3,stroke:COL.surf,'stroke-width':2},G); if(l){ const right=X(x)>W*.7; lab(X(x)+(right?-9:9),Y(y)-14,l,{fill:c3,w:700,size:12.5,anchor:right?'end':'start',halo:1},G); } }); }
    /* approximation picture: f(a+h) ≈ f(a) + h f′(a) */
    if(f&&sc.apx){ const [xa,xb]=sc.apx, ya2=f(xa), s=d1(xa), yb=f(xb), yt=ya2+(xb-xa)*s; line(xa,ya2,s,COL.tan,{w:2.2});
      el('path',{d:`M${X(xb)} ${Y(ya)}V${Y(Math.max(yb,yt))}`,stroke:COL.c,'stroke-width':1.2,'stroke-dasharray':'3 4'},G);
      el('path',{d:`M${X(xa)} ${Y(ya2)}H${X(xb)}`,stroke:COL.chord,'stroke-width':1.6,'stroke-dasharray':'4 4'},G);
      el('path',{d:`M${X(xb)} ${Y(ya2)}V${Y(yt)}`,stroke:COL.tan,'stroke-width':3},G);
      [[xa,ya2,COL.f],[xb,yb,COL.f],[xb,yt,COL.tan]].forEach(([x,y,col])=>el('circle',{cx:X(x),cy:Y(y),r:5,fill:col,stroke:COL.surf,'stroke-width':2},G));
      lab((X(xa)+X(xb))/2,Y(ya2)+14,'h',{fill:COL.chord,w:700,size:13,halo:1},G); lab(X(xb)+8,(Y(ya2)+Y(yt))/2,'h f′(a)',{fill:COL.tan,w:700,size:12,anchor:'start',halo:1},G);
      chips.push(['f',`f(${fmt(xb,4)})`,fmt(yb,4)],['tan','التقريب',fmt(yt,4)]); }
    if(sc.draw) sc.draw(A);
    /* sign line under the graph */
    if(sc.sign){ const sg=sc.sign, y0=gb+22, yl=gb+42, z=sg.z||[], u=sg.u||[];
      el('path',{d:`M${pad.l} ${yl}H${W-pad.r}`,stroke:COL.axis,'stroke-width':1.6});
      lab(pad.l-2,gb+10,sg.lab||"f′(x)",{anchor:'start',size:11.5,w:700,fill:COL.ink2});
      const xs=[V.x0,...z,V.x1];
      for(let i=0;i<xs.length-1;i++){ const xm=(Math.max(V.x0,xs[i])+Math.min(V.x1,xs[i+1]))/2, ch=(sg.s||'')[i]; if(!ch) continue; const col=ch==='+'?COL.ok:COL.bad;
        lab(X(xm),y0,ch==='+'?'+ + +':'− − −',{fill:col,w:700,size:15});
        if(sg.w&&sg.w[i]) lab(X(xm),yl+16,sg.w[i],{fill:col,size:11.5,w:700}); }
      z.forEach((x,i)=>{ const isU=u.includes(i); el('path',{d:`M${X(x)} ${yl-7}V${yl+7}`,stroke:COL.ink2,'stroke-width':2});
        if(isU) el('circle',{cx:X(x),cy:yl,r:5,fill:COL.surf,stroke:COL.ink2,'stroke-width':2});
        const zl=(sg.zl&&sg.zl[i])||fmt(x); lab(X(x),yl+16,isU?`(${zl})`:zl,{fill:COL.ink,w:700,size:12}); }); }
    W2Xg=W2X; curA=a; curB=b;
  } else if(sc.fig){ drawFig(sc.fig,sc.k??99,A); if(sc.draw) sc.draw(A); }
  else if(sc.nl){ drawNL(sc.nl,A); if(sc.draw) sc.draw(A); }
  else if(sc.draw){ sc.draw(A); }
  /* chips, legend, hint */
  const ch=$('#chips'); ch.innerHTML=chips.map(([c,l,v])=>`<span class="chip"><i style="background:var(--${c})"></i>${esc(iso(l))} <b>${esc(v)}</b></span>`).join('');
  const lg=$('#legend'); lg.hidden=!legend.length; lg.innerHTML=legend.map(([c,l])=>`<span><i style="background:${c}"></i>${esc(iso(l))}</span>`).join('');
  const hh=$('#hint'); hh.textContent=iso(hint); hh.className='hint'+(hintOk?' ok':'');
}

/* geometry figure language (grade 9): F={pts:{A:[x,y]}, el:[{t,…,s (first step), h (glow steps), c, d, l}], names} */
const FCM={'c-std':'f','c-radius':'chord','c-center':'int','c-point':'c','c-gen':'int','c-cut':'tan',graphite:'ink2',muted:'muted'};
function drawFig(F,k,A){ const c=A.col, W=A.W, H=A.H, pad=34, P_=p=>typeof p==='string'?F.pts[p]:p;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; const add=(x,y)=>{ x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y); };
  Object.values(F.pts||{}).forEach(([x,y])=>add(x,y)); (F.el||[]).forEach(e=>{ if(e.t==='c'||e.t==='arc'){ const [x,y]=P_(e.o); add(x-e.r,y-e.r); add(x+e.r,y+e.r); } if(e.t==='e'){ const [x,y]=P_(e.o); add(x-e.rx,y-e.ry); add(x+e.rx,y+e.ry); } });
  if(F.box){ add(F.box[0],F.box[1]); add(F.box[2],F.box[3]); }
  const s=Math.min((W-2*pad)/Math.max(x1-x0,1e-6),(H-2*pad)/Math.max(y1-y0,1e-6)), ox=(W-(x1-x0)*s)/2-x0*s, oy=(H+(y1-y0)*s)/2+y0*s;
  const X=([x,y])=>[ox+x*s,oy-y*s], Q=p=>X(P_(p));
  const vis=e=>(e.s??0)<=k&&(e.u===undefined||k<e.u), glow=e=>Array.isArray(e.h)?e.h.includes(k):e.h===k;
  const CC=n=>c[FCM[n]||n]||n||c.ink2, col=e=>glow(e)?c.c:CC(e.c||'graphite'), wid=e=>(e.w||1.8)*(glow(e)?1.7:1)*1.3;
  const els=(F.el||[]).filter(vis), L=(x1,y1,x2,y2,o)=>A.el('path',{d:`M${x1} ${y1}L${x2} ${y2}`,stroke:o.color,'stroke-width':o.w,'stroke-dasharray':o.dash,'stroke-linecap':'round'});
  const path=(pts,o)=>A.el('path',{d:'M'+pts.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L'),stroke:o.color,'stroke-width':o.w,fill:'none','stroke-dasharray':o.dash,'stroke-linejoin':'round',opacity:o.a});
  const txt=(t,x,y,col,size=12.5)=>A.lab(x,y,t,{fill:col,w:700,size,halo:1});
  els.filter(e=>e.t==='p').forEach(e=>{ const pts=e.P.map(Q); A.el('path',{d:'M'+pts.map(p=>p.join(' ')).join('L')+'Z',fill:glow(e)?c.c:CC(e.c||'c-std'),opacity:glow(e)?.3:(e.a??.16)}); });
  els.forEach(e=>{ const C=col(e), w=wid(e);
    if(e.t==='s'){ const a=Q(e.a), b=Q(e.b); L(a[0],a[1],b[0],b[1],{color:C,w,dash:e.d?'6 4':undefined}); if(e.l){ const m=[(a[0]+b[0])/2,(a[1]+b[1])/2], len=Math.hypot(b[0]-a[0],b[1]-a[1])||1, nx=-(b[1]-a[1])/len, ny=(b[0]-a[0])/len, off=(e.off??13)*1.1; txt(e.l,m[0]+nx*off,m[1]+ny*off,glow(e)?c.c:CC(e.lc||e.c||'c-radius')); } }
    else if(e.t==='ln'){ const a=Q(e.a), b=Q(e.b), dx=b[0]-a[0], dy=b[1]-a[1], f=e.ext??.35; L(a[0]-dx*(e.e0??f),a[1]-dy*(e.e0??f),b[0]+dx*(e.e1??f),b[1]+dy*(e.e1??f),{color:C,w,dash:e.d?'6 4':undefined}); if(e.l) txt(e.l,b[0]+dx*(e.e1??f)+10,b[1]+dy*(e.e1??f),C,12); }
    else if(e.t==='c'){ const [cx,cy]=Q(e.o); A.el('circle',{cx,cy,r:e.r*s,fill:e.fill?CC(e.fill):'none','fill-opacity':e.fill?.12:undefined,stroke:C,'stroke-width':(e.w||1.6)*1.4,'stroke-dasharray':e.d?'6 4':undefined}); }
    else if(e.t==='e'){ const [cx,cy]=Q(e.o); if(e.fill) A.el('ellipse',{cx,cy,rx:e.rx*s,ry:e.ry*s,fill:CC(e.fill),opacity:.14});
      if(e.back){ const fr=[], bb=[]; for(let i=0;i<=36;i++){ const t=i/36*Math.PI; fr.push([cx+e.rx*s*Math.cos(t),cy+e.ry*s*Math.sin(t)]); bb.push([cx+e.rx*s*Math.cos(Math.PI+t),cy+e.ry*s*Math.sin(Math.PI+t)]); } path(fr,{color:C,w}); path(bb,{color:C,w:w*.8,dash:'5 4'}); }
      else A.el('ellipse',{cx,cy,rx:e.rx*s,ry:e.ry*s,fill:'none',stroke:C,'stroke-width':w}); }
    else if(e.t==='arc'){ const [cx,cy]=Q(e.o), pts=[], n=Math.max(8,Math.ceil(Math.abs(e.a1-e.a0)/3)); for(let i=0;i<=n;i++){ const a=(e.a0+(e.a1-e.a0)*i/n)*Math.PI/180; pts.push([cx+e.r*s*Math.cos(a),cy-e.r*s*Math.sin(a)]); } path(pts,{color:C,w:(e.w||3.4),a:.85});
      if(e.l){ const am=(e.a0+e.a1)/2*Math.PI/180, rr=e.r*s+(e.lo??16); txt(e.l,cx+rr*Math.cos(am),cy-rr*Math.sin(am),C); } }
    else if(e.t==='ang'||e.t==='ra'){ const v=Q(e.v), a=Q(e.a), b=Q(e.b); let Aa=Math.atan2(a[1]-v[1],a[0]-v[0]), Bb=Math.atan2(b[1]-v[1],b[0]-v[0]); let d=Bb-Aa; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI; const r=e.r||22;
      if(e.t==='ra'){ const u=[Math.cos(Aa),Math.sin(Aa)], w2=[Math.cos(Bb),Math.sin(Bb)], q=11; path([[v[0]+u[0]*q,v[1]+u[1]*q],[v[0]+(u[0]+w2[0])*q,v[1]+(u[1]+w2[1])*q],[v[0]+w2[0]*q,v[1]+w2[1]*q]],{color:C,w:1.4}); }
      else { const pts=[]; for(let i=0;i<=16;i++){ const t=Aa+d*i/16; pts.push([v[0]+r*Math.cos(t),v[1]+r*Math.sin(t)]); } path(pts,{color:C,w:glow(e)?2.8:1.8}); if(e.n===2) path(pts.map(([x,y])=>[v[0]+(x-v[0])*1.2,v[1]+(y-v[1])*1.2]),{color:C,w:1.5});
        if(e.l){ const m=Aa+d/2, rr=r+(e.lo??14); txt(e.l,v[0]+rr*Math.cos(m),v[1]+rr*Math.sin(m),glow(e)?c.c:CC(e.c||'c-center'),12); } } }
    else if(e.t==='tk'){ const a=Q(e.a), b=Q(e.b), m=[(a[0]+b[0])/2,(a[1]+b[1])/2], len=Math.hypot(b[0]-a[0],b[1]-a[1])||1, ux=(b[0]-a[0])/len, uy=(b[1]-a[1])/len; for(let i=0;i<(e.n||1);i++){ const off=(i-((e.n||1)-1)/2)*4.5, cx=m[0]+ux*off, cy=m[1]+uy*off; L(cx-uy*6,cy+ux*6,cx+uy*6,cy-ux*6,{color:CC(e.c||'c-point'),w:1.6}); } }
    else if(e.t==='par'){ const a=Q(e.a), b=Q(e.b), m=[(a[0]+b[0])/2,(a[1]+b[1])/2], an=Math.atan2(b[1]-a[1],b[0]-a[0]); A.el('path',{d:`M${m[0]+5*Math.cos(an)} ${m[1]+5*Math.sin(an)}L${m[0]-7*Math.cos(an-.5)} ${m[1]-7*Math.sin(an-.5)}M${m[0]+5*Math.cos(an)} ${m[1]+5*Math.sin(an)}L${m[0]-7*Math.cos(an+.5)} ${m[1]-7*Math.sin(an+.5)}`,stroke:CC(e.c||'c-point'),'stroke-width':1.8,fill:'none'}); }
    else if(e.t==='l'){ const p=Q(e.p); txt(e.s,p[0]+(e.dx||0),p[1]+(e.dy||0),glow(e)?c.c:CC(e.c||'graphite'),e.size||12.5); }
    else if(e.t==='dot'){ const p=Q(e.p); A.el('circle',{cx:p[0],cy:p[1],r:e.r||3.6,fill:CC(e.c||'graphite')}); }
  });
  if(F.names!==false){ const ps=Object.entries(F.pts||{}).filter(([n])=>!/^_/.test(n)&&!(F.hide||[]).includes(n)); if(ps.length){ const cx=ps.reduce((a,[,p])=>a+p[0],0)/ps.length, cy=ps.reduce((a,[,p])=>a+p[1],0)/ps.length;
    ps.forEach(([n,p])=>{ const [x,y]=X(p); const dx=p[0]-cx, dy=p[1]-cy, len=Math.hypot(dx,dy)||1, off=(F.off&&F.off[n])||[dx/len*15,-dy/len*15]; txt(n.replace(/\d$/,''),x+off[0],y+off[1],CC((F.nc&&F.nc[n])||'graphite'),13.5); }); } } }
/* stacked number lines: nl={w:[x0,x1], rows:[{I:[[a,b,incA,incB]],lab,col}], c (centre), r} */
function drawNL(N,A){ const c=A.col, W=A.W, H=A.H, [x0,x1]=N.w, rows=N.rows, X=v=>28+(Math.max(x0-1,Math.min(x1+1,v))-x0)/(x1-x0)*(W-56), st=niceStep(x1-x0,W,46);
  rows.forEach((R,i)=>{ const y=H*(rows.length===1?.55:.2+.62*i/(rows.length-1)), col=c[FCM[R.col]||R.col]||c.f;
    A.el('path',{d:`M14 ${y}H${W-14}`,stroke:c.axis,'stroke-width':1.6});
    for(let t=Math.ceil(x0/st)*st;t<=x1+1e-9;t+=st){ A.el('path',{d:`M${X(t)} ${y-5}V${y+5}`,stroke:c.axis,'stroke-width':1.2}); A.lab(X(t),y+18,fmt(t,2),{fill:c.muted,size:11}); }
    R.I.forEach(([a,b,ia,ib])=>{ const xa=isFinite(a)?X(a):10, xb=isFinite(b)?X(b):W-10; A.el('path',{d:`M${xa} ${y}H${xb}`,stroke:col,'stroke-width':6,'stroke-linecap':'round',opacity:.85});
      if(!isFinite(a)) A.el('path',{d:`M${xa+8} ${y-7}L${xa-2} ${y}L${xa+8} ${y+7}`,stroke:col,'stroke-width':2.4,fill:'none'}); else A.el('circle',{cx:xa,cy:y,r:6,fill:ia?col:c.surf,stroke:col,'stroke-width':2.4});
      if(!isFinite(b)) A.el('path',{d:`M${xb-8} ${y-7}L${xb+2} ${y}L${xb-8} ${y+7}`,stroke:col,'stroke-width':2.4,fill:'none'}); else A.el('circle',{cx:xb,cy:y,r:6,fill:ib?col:c.surf,stroke:col,'stroke-width':2.4}); });
    if(R.lab) A.lab(W-16,y-16,R.lab,{fill:col,w:700,size:13,anchor:'end',halo:1});
    if(N.c!==undefined&&i===rows.length-1){ A.el('circle',{cx:X(N.c),cy:y,r:4.5,fill:c.int}); A.el('path',{d:`M${X(N.c)} ${y-26}H${X(N.c+N.r)}M${X(N.c)} ${y-26}H${X(N.c-N.r)}`,stroke:c.int,'stroke-width':1.4,'stroke-dasharray':'5 4'}); A.lab(X(N.c),y-38,'المركز '+fmt(N.c,2)+' ، البعد '+fmt(N.r,2),{fill:c.int,size:12,w:700,halo:1}); } });
  if(N.chips) N.chips.forEach(ch=>A.chips.push(ch)); }
let W2Xg=null, curA=0, curB=1;
function loop(){ raf=0; let more=false; if(from&&t<1){ t+=1/36; more=true; } else if(from){ from=null; }
  if(cur&&cur.sweep){ sweepT+=.03; more=true; }
  if(cur&&cur.sl&&playing){ const s=cur.sl; playT+=1/60; const u=(Math.sin(playT*(s.speed||.6)-Math.PI/2)+1)/2; P=s.min+(s.max-s.min)*u; syncSlider(); more=true; }
  if(cur&&cur.anim) more=true;
  draw(); if(more) raf=requestAnimationFrame(loop); }
const kick=()=>{ if(!raf) raf=requestAnimationFrame(loop); };
function syncSlider(){ const s=cur&&cur.sl, w=$('#sl'); w.hidden=!s; if(!s) return; const i=$('#slI'); i.min=s.min; i.max=s.max; i.step=s.step||'any'; i.value=P; $('#slL').textContent=s.lab||''; $('#slV').textContent=(s.fmt||fmt)(P); }
function go(name){ const sc=B.S[name]; if(!sc||sc===cur) return; const red=matchMedia('(prefers-reduced-motion: reduce)').matches;
  from=cur&&!red?cur:null; t=0; cur=sc; cDrag=null; sweepT=0; svg.style.touchAction=sc.pick?'none':''; svg.style.cursor=sc.pick?'grab':''; if(sc.sl){ const sl=sc.sl; P=sl.v??sl.min; playing=!!sl.play&&!red; const u0=Math.min(1,Math.max(0,(P-sl.min)/((sl.max-sl.min)||1))); playT=Math.acos(1-2*u0)/(sl.speed||.6); } syncSlider(); kick(); }
function size(){ const r=box.getBoundingClientRect(); W=r.width; H=r.height; draw(); }
new ResizeObserver(size).observe(box);
$('#slI').addEventListener('input',e=>{ playing=false; P=+e.target.value; $('#slV').textContent=(cur.sl.fmt||fmt)(P); draw(); });
let dragging=false;
const setC=e=>{ if(!W2Xg) return; const r=svg.getBoundingClientRect(); const x=W2Xg(e.clientX-r.left); const lo=Math.min(curA,curB)+.01*(curB-curA), hi=Math.max(curA,curB)-.01*(curB-curA); cDrag=Math.max(lo,Math.min(hi,x)); draw(); };
let lastA=null;
const objDrag=e=>{ const r=svg.getBoundingClientRect(), s=cur.sl, v=cur.pick(lastA,e.clientX-r.left,e.clientY-r.top); if(v==null||!isFinite(v)) return; playing=false; P=Math.max(s.min,Math.min(s.max,v)); syncSlider(); draw(); };
svg.addEventListener('pointerdown',e=>{ if(!cur) return; if(cur.pick&&cur.sl&&lastA){ dragging=true; svg.setPointerCapture(e.pointerId); objDrag(e); return; } if(cur.drag){ dragging=true; svg.setPointerCapture(e.pointerId); setC(e); } else if(cur.sl&&cur.slx&&W2Xg){ dragging=true; svg.setPointerCapture(e.pointerId); slDrag(e); } });
const slDrag=e=>{ const r=svg.getBoundingClientRect(); const x=W2Xg(e.clientX-r.left), s=cur.sl; playing=false; P=Math.max(s.min,Math.min(s.max,x)); syncSlider(); draw(); };
svg.addEventListener('pointermove',e=>{ if(!dragging) return; if(cur.pick&&lastA) objDrag(e); else if(cur.drag) setC(e); else if(cur.slx) slDrag(e); });
svg.addEventListener('pointerup',()=>dragging=false); svg.addEventListener('pointercancel',()=>dragging=false);

/* ================= scrollytelling ================= */
function hiStage(si){ $$('a',outline).forEach((a,i)=>{ a.classList.toggle('on',i===si); a.classList.toggle('done',i<si); }); let k=''; for(let j=si;j>=0&&!k;j--) k=secs[j]?.dataset.stg||''; $$('#stages button').forEach(b=>b.classList.toggle('on',b.dataset.stg===k)); }
function pick(){ if(!curLes||!steps.length||performance.now()<lockPick) return; const narrow=innerWidth<=820, line=narrow?$('.fig').getBoundingClientRect().bottom+innerHeight*.06:innerHeight*.45;
  let best=steps[0], bd=1e9; if(scrollY>40) for(const s of steps){ const r=s.getBoundingClientRect(); const d=r.top<=line&&r.bottom>=line?0:Math.min(Math.abs(r.top-line),Math.abs(r.bottom-line)); if(d<bd){ bd=d; best=s; } }
  if(best!==active){ active?.classList.remove('on'); active=best; best.classList.add('on'); if(best.dataset.scene) go(best.dataset.scene); }
  const si=secs.indexOf(best.closest('.sec')); hiStage(si); $$('a',outline).forEach((a,i)=>{ a.classList.toggle('on',i===si); a.classList.toggle('done',i<si); });
  const h=root, pr=Math.min(100,h.scrollTop/Math.max(1,h.scrollHeight-innerHeight)*100); $('#prog').style.width=pr+'%';
  if(si>=secs.length-1&&!ST.seen[curLes.id]){ ST.seen[curLes.id]=1; save(); } }
addEventListener('scroll',()=>requestAnimationFrame(pick),{passive:true}); addEventListener('resize',pick);

/* ================= theme & presentation ================= */
try{ const t0=localStorage.getItem('lb-theme'); if(t0) root.dataset.theme=t0; }catch(e){}
$('#bTheme').onclick=()=>{ const dark=(root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark'; root.dataset.theme=dark?'light':'dark'; try{ localStorage.setItem('lb-theme',root.dataset.theme); }catch(e){} draw(); };
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>draw());
const bP=$('#bPresent');
bP.onclick=()=>{ const on=root.classList.toggle('present'); bP.setAttribute('aria-pressed',on); setTimeout(()=>{ size(); active&&active.scrollIntoView({block:'center'}); },60); };
/* keyboard / clicker: activate the next step explicitly (scrolling alone cannot move past the first steps) */
let lockPick=0;
function activate(st,jump){ if(!st) return; if(st!==active){ active?.classList.remove('on'); active=st; st.classList.add('on'); if(st.dataset.scene) go(st.dataset.scene); } hiStage(secs.indexOf(st.closest('.sec'))); lockPick=performance.now()+900; st.scrollIntoView({block:'center',behavior:jump?'instant':'smooth'}); }
addEventListener('keydown',e=>{ if(e.target.matches('input,textarea')||!curLes||e.ctrlKey||e.metaKey||e.altKey) return; const i=steps.indexOf(active);
  if(['ArrowDown','PageDown','ArrowLeft',' '].includes(e.key)&&!(e.key===' '&&e.target.matches('button'))){ e.preventDefault(); activate(steps[Math.min(steps.length-1,i+1)]); }
  if(['ArrowUp','PageUp','ArrowRight'].includes(e.key)){ e.preventDefault(); activate(steps[Math.max(0,i-1)]); }
  if(/^[1-6]$/.test(e.key)){ const b=$$('#stages button')[+e.key-1]; if(b){ e.preventDefault(); b.click(); } } });

/* ================= board tools: ink, zoom, fullscreen ================= */
const ink=(()=>{ const cv=$('#inkCanvas'), cx=cv.getContext('2d'), bar=$('#tools'), bT=$('#bTools'), toast=$('#toast'); let mode='off', color='#e0393e', S=[], RD=[], cur=null, tt=0;
  const say=t=>{ toast.textContent=t; toast.classList.add('on'); clearTimeout(tt); tt=setTimeout(()=>toast.classList.remove('on'),1800); };
  /* strokes are stored in page coordinates so they stay on the content while scrolling */
  const render=()=>{ const d=Math.min(devicePixelRatio||1,3), w=innerWidth, h=innerHeight; if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){ cv.width=Math.round(w*d); cv.height=Math.round(h*d); }
    cx.setTransform(d,0,0,d,0,0); cx.clearRect(0,0,w,h); cx.lineCap='round'; cx.lineJoin='round'; const ox=scrollX, oy=scrollY;
    for(const k of S){ cx.strokeStyle=k.c; cx.lineWidth=k.w; cx.beginPath(); k.p.forEach(([x,y],i)=>i?cx.lineTo(x-ox,y-oy):cx.moveTo(x-ox,y-oy)); if(k.p.length===1) cx.lineTo(k.p[0][0]-ox+.1,k.p[0][1]-oy+.1); cx.stroke(); } };
  const pt=e=>[e.clientX+scrollX,e.clientY+scrollY], near=p=>k=>k.p.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<22);
  cv.addEventListener('pointerdown',e=>{ if(mode==='off') return; e.preventDefault(); cv.setPointerCapture(e.pointerId); RD=[];
    if(mode==='erase'){ const n=S.length; S=S.filter(k=>!near(pt(e))(k)); if(S.length!==n) render(); } else { cur={c:color,w:e.pointerType==='pen'?3+4*(e.pressure||.5):4,p:[pt(e)]}; S.push(cur); render(); } });
  cv.addEventListener('pointermove',e=>{ if(mode==='off'||!(e.buttons||e.pressure)) return; e.preventDefault();
    if(mode==='erase'){ const n=S.length; S=S.filter(k=>!near(pt(e))(k)); if(S.length!==n) render(); } else if(cur){ cur.p.push(pt(e)); render(); } });
  const end=()=>{ cur=null; }; cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);
  addEventListener('scroll',()=>{ if(S.length) requestAnimationFrame(render); },{passive:true}); addEventListener('resize',render);
  const press=(t,on)=>{ const b=bar.querySelector(`[data-tool="${t}"]`); if(b) b.setAttribute('aria-pressed',String(!!on)); };
  const setMode=m=>{ mode=mode===m?'off':m; cv.classList.toggle('on',mode!=='off'); press('pen',mode==='pen'); press('erase',mode==='erase');
    say(mode==='pen'?'القلم مفعّل: اكتب على الشاشة · اضغط «قلم» مرة أخرى للتمرير':mode==='erase'?'الممحاة مفعّلة: المس الخط لمسحه':'القلم متوقف'); };
  const undo=()=>{ if(S.length){ RD.push(S.pop()); render(); } else say('لا توجد كتابة'); }, redo=()=>{ if(RD.length){ S.push(RD.pop()); render(); } else say('لا يوجد ما يُعاد'); };
  const clear=()=>{ if(S.length){ RD=[]; S=[]; render(); } };
  const ZL=[1,1.15,1.3,1.5,1.75]; let zi=0; try{ zi=Math.max(0,ZL.indexOf(+localStorage.getItem('lb-zoom')||1)); }catch(e){}
  const zoom=d=>{ zi=Math.max(0,Math.min(ZL.length-1,zi+d)); root.style.setProperty('--zoom',ZL[zi]); try{ localStorage.setItem('lb-zoom',ZL[zi]); }catch(e){} say('حجم النص '+Math.round(ZL[zi]*100)+'٪'); render(); };
  root.style.setProperty('--zoom',ZL[zi]);
  const full=async()=>{ const el=root, fs=D.fullscreenElement||D.webkitFullscreenElement;
    try{ if(fs){ await (D.exitFullscreen||D.webkitExitFullscreen).call(D); } else if(el.requestFullscreen) await el.requestFullscreen(); else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen(); else throw 0; }
    catch(e){ say('ملء الشاشة غير متاح هنا: أضف التطبيق إلى الشاشة الرئيسية ليفتح بملء الشاشة'); } };
  const open=v=>{ bar.hidden=!v; bT.setAttribute('aria-pressed',String(v)); if(!v&&mode!=='off') setMode(mode); };
  bT.onclick=()=>open(bar.hidden);
  bar.addEventListener('click',e=>{ const b=e.target.closest('[data-tool]'); if(!b) return; const t=b.dataset.tool;
    if(t==='pen'||t==='erase') setMode(t); else if(['red','blue','green'].includes(t)){ color=getComputedStyle(b).getPropertyValue("--sw").trim(); ['red','blue','green'].forEach(c=>press(c,c===t)); if(mode!=='pen') setMode('pen'); }
    else if(t==='undo') undo(); else if(t==='redo') redo(); else if(t==='clear'){ clear(); say('مُسحت الكتابة'); } else if(t==='zoom') zoom(1); else if(t==='zoomout') zoom(-1); else if(t==='full') full(); else if(t==='close') open(false); });
  addEventListener('keydown',e=>{ if(e.target.matches('input,textarea')) return; const k=e.key.toLowerCase();
    if((e.ctrlKey||e.metaKey)&&k==='z'){ e.preventDefault(); e.shiftKey?redo():undo(); } else if((e.ctrlKey||e.metaKey)&&k==='y'){ e.preventDefault(); redo(); }
    else if(k==='escape'&&mode!=='off') setMode(mode); });
  addEventListener('hashchange',()=>{ clear(); RD=[]; });
  return {count:()=>S.length,clear,setMode,say,render}; })();

/* ================= teacher / student mode =================
   student: a worked solution opens only after an attempt (a check or every hint); teacher notes hidden.
   teacher: solutions open freely, teacher notes visible. */
const role={ get:()=>root.dataset.role||'student', set(r){ root.dataset.role=r; try{ localStorage.setItem('lb-role',r); }catch(e){} $('#bRole').setAttribute('aria-pressed',String(r==='teacher')); $('#bRoleL').textContent=r==='teacher'?'مدرّس':'طالب'; } };
try{ role.set(localStorage.getItem('lb-role')==='teacher'?'teacher':'student'); }catch(e){ role.set('student'); }
$('#bRole').onclick=()=>{ role.set(role.get()==='teacher'?'student':'teacher'); ink.say(role.get()==='teacher'?'وضع المدرّس: الحلول وملاحظات التدريس ظاهرة':'وضع الطالب: الحل يُفتح بعد المحاولة'); };
/* gate: called by the solution buttons of auto-checked exercises */
const gate=(row,fb)=>{ if(role.get()==='teacher') return true; if(row.dataset.tried) return true; const hb=row.querySelector('[data-hint]'); if(hb&&hb.disabled) return true;
  fb.textContent='جرّب أولاً: اكتب جوابك واضغط «تحقّق»'+(hb?' أو اطلب التلميحات':'')+'، ثم يُفتح الحل.'; fb.className='fb'; return false; };

window.LB={go,draw,LES,num,nums,same,ink,role};
(d=>{ const s=d.createElement('script'); s.src='../update.js'; d.head.append(s); })(document);
route();
booted=true;
})();
