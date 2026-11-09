/* الرياضيات الحيّة · محرّك الكتاب v2 (قصّة تمريرية + رسم ثابت يتبعها)
   كل فصل يعرّف window.BOOK = {id, grade, chapter, title, desc, classic, S:{scenes}, src:String.raw`markup`}
   ثم يُحمَّل هذا الملف فيبني صفحة الفصل (قائمة الدروس) وصفحة كل درس. */
(function(){
"use strict";
const B=window.BOOK, D=document, root=D.documentElement;
const $=(s,r=D)=>r.querySelector(s), $$=(s,r=D)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
/* isolate Latin/number runs inside Arabic text so that "(2 , 8)" and "a ، b" keep their order */
const iso=s=>{ s=String(s); return /[\u0600-\u06FF]/.test(s)?s.replace(/[^\u0600-\u06FF]+/g,m=>/[A-Za-z0-9]/.test(m)?m.replace(/^([^A-Za-z0-9(\[√−+-]*)([\s\S]*?)(\s*)$/,(_,a,b,c)=>a+'\u2066'+b+'\u2069'+c):m):s; };

/* ================= markup → lessons ================= */
function parse(src){
  const L=[]; let les=null, sec=null, st=null, box=null, list=null;
  const flushList=()=>{ list=null; };
  for(let raw of src.split('\n')){
    const line=raw.replace(/\s+$/,''); const s=line.trim();
    if(!s){ box=null; flushList(); continue; }
    if(s.startsWith('//')) continue;
    if(s.startsWith('===')){ const [id,no,t,pg,d]=s.slice(3).split('|').map(x=>x.trim()); les={id,no,t,pg,d:d||'',secs:[]}; L.push(les); sec=null; st=null; continue; }
    if(s.startsWith('---')){ sec={t:s.slice(3).trim(),steps:[]}; les.secs.push(sec); st=null; continue; }
    if(s.startsWith('>>>')){ let h=s.slice(3).trim(), lbl=''; const i=h.indexOf('::'); if(i>=0){ lbl=h.slice(i+2).trim(); h=h.slice(0,i).trim(); }
      const tk=h.split(/\s+/).filter(Boolean); st={sc:null,n:'',cls:[],lbl,parts:[]};
      for(const t of tk){ if(t[0]==='#') st.n=t.slice(1); else if(t==='!') st.cls.push('result'); else if(t==='+') st.cls.push('gap'); else if(t[0]==='.') st.cls.push(t.slice(1)); else st.sc=t; }
      if(!sec){ sec={t:'',steps:[]}; les.secs.push(sec); } sec.steps.push(st); box=null; flushList(); continue; }
    if(!st) continue;
    if(s.startsWith('| ')||s==='|'){ if(box) box.lines.push(s.slice(2)); continue; }
    const m=s.match(/^([a-z0-9*]+):\s?(.*)$/);
    if(m&&['k','p','h1','h2','lead','law','note','err','ask','o','o*','why','prac','sol','self','ok','tbl','tbh','html','fig'].includes(m[1])){
      const [ ,key,val]=m; flushList();
      if(key==='o'||key==='o*'){ const q=st.parts.findLast(p=>p.k==='ask'); if(q){ if(key==='o*') q.ans=q.o.length; q.o.push(val); } continue; }
      if(key==='ok'){ const q=st.parts.findLast(p=>p.k==='prac'||p.k==='self'); if(q) q.ok=val; continue; }
      if(key==='tbl'||key==='tbh'){ let t=st.parts.at(-1); if(!t||t.k!=='tbl'){ t={k:'tbl',rows:[]}; st.parts.push(t); } t.rows.push({h:key==='tbh',c:val.split('|').map(x=>x.trim())}); continue; }
      const p={k:key,v:val,lines:val?[val]:[]};
      if(key==='law'){ p.lines=[]; }
      if(key==='prac'){ const [ans,ph]=val.split(';').map(x=>x.trim()); p.ans=ans; p.ph=ph||'الجواب'; p.lines=[]; }
      if(key==='self'){ p.lines=[]; }
      if(key==='ask'){ p.o=[]; p.ans=0; }
      if(key==='sol'||key==='why'){ const q=st.parts.findLast(x=>['prac','self','ask'].includes(x.k)); if(q){ q[key]=p; } }
      st.parts.push(p); box=['law','note','err','sol','why','self','html','lead'].includes(key)?p:null; continue; }
    if(s.startsWith('$$')){ flushList(); st.parts.push({k:'m',v:s.slice(2).trim()}); box=null; continue; }
    if(s.startsWith('- ')){ if(!list){ list={k:'ul',items:[]}; st.parts.push(list); } list.items.push(s.slice(2)); box=null; continue; }
    flushList(); st.parts.push({k:'p',v:s}); box=null;
  }
  return L;
}

/* inline: $tex$, $$tex$$ (display), [[cls:text]], **bold** */
function T(s){
  if(s==null) return ''; const keep=[];
  s=String(s).replace(/\$\$([^$]+)\$\$/g,(_,t)=>{ keep.push(`<span class="big tex" data-tex="${esc(t).replace(/"/g,'&quot;')}"></span>`); return `\u0000${keep.length-1}\u0000`; })
   .replace(/\$([^$]+)\$/g,(_,t)=>{ keep.push(`<span class="tex" data-tex="${esc(t).replace(/"/g,'&quot;')}"></span>`); return `\u0000${keep.length-1}\u0000`; });
  s=s.replace(/\[\[(\w+):([^\]]+)\]\]/g,'<span class="tag $1">$2</span>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
  return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>keep[+i]);
}
const lines=p=>p.lines.map(T).join('<br>');
const MAC={"\\cf":"\\htmlClass{tk-f}{#1}","\\cch":"\\htmlClass{tk-chord}{#1}","\\ctn":"\\htmlClass{tk-tan}{#1}","\\ccc":"\\htmlClass{tk-c}{#1}","\\cin":"\\htmlClass{tk-int}{#1}","\\cok":"\\htmlClass{tk-ok}{#1}","\\cbad":"\\htmlClass{tk-bad}{#1}","\\R":"R"};
function typeset(r){ $$('.tex',r).forEach(el=>{ try{ katex.render(el.dataset.tex,el,{trust:true,strict:false,throwOnError:false,displayMode:false,macros:{...MAC}}); el.classList.add('m'); el.setAttribute('dir','ltr'); }catch(e){ el.textContent=el.dataset.tex; } }); }

function stepHTML(st,les,si,ki){
  let h=''; if(st.n) h+=`<span class="sn">${esc(st.n)}</span>`; if(st.lbl) h+=`<span class="lbl">${T(st.lbl)}</span>`;
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
      case 'note': h+=`<div class="note">${lines(p)}</div>`; break;
      case 'err': h+=`<div class="err"><b>تنبيه على خطأ في الكتاب:</b> ${lines(p)}</div>`; break;
      case 'html': h+=p.lines.join('\n'); break;
      case 'tbl': h+=`<div class="tblwrap"><table class="t">${p.rows.map(r=>`<tr>${r.c.map(c=>`<${r.h?'th':'td'}>${T(c)}</${r.h?'th':'td'}>`).join('')}</tr>`).join('')}</table></div>`; break;
      case 'ask': h+=`<p>${T(p.v)}</p><div class="ask" data-ans="${p.ans}">${p.o.map(o=>`<button type="button" class="opt">${T(o)}</button>`).join('')}</div><div class="why">${p.why?lines(p.why):''}</div>`; break;
      case 'prac': h+=`<div class="prac" data-key="${esc(p.ans)}" data-id="${id}"${p.ok?` data-ok="${esc(p.ok)}"`:''}><input inputmode="text" autocomplete="off" placeholder="${esc(p.ph)}" aria-label="${esc(p.ph)}"><button type="button" class="btn">تحقّق</button></div><div class="fb"></div>`+
        `<div class="selfrow"><button type="button" class="btn ghost small" data-show>الحل</button></div><div class="sol">${p.sol?lines(p.sol):''}</div>`; break;
      case 'self': h+=(p.lines.length?`<p>${lines(p)}</p>`:'')+`<div class="selfrow" data-self="${id}"${p.ok?` data-ok="${esc(p.ok)}"`:''}><button type="button" class="btn ghost small" data-show>أظهر الحل</button><span class="mk" hidden>هل كان حلّك صحيحاً؟ <button type="button" class="btn small" data-y>✓ نعم</button> <button type="button" class="btn ghost small" data-n>✗ ليس بعد</button></span><span class="done" hidden></span></div><div class="sol">${p.sol?lines(p.sol):''}</div>`; break;
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
 <button class="hb" id="bTheme" aria-label="تبديل الألوان">${ICON.moon}</button>
 <div class="prog"><i id="prog"></i></div>
</header>
<div class="home" id="home"></div>
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
  D.body.classList.add('is-home'); D.title=`${B.title} – الرياضيات الحيّة`;
  $('#crS').textContent=`${B.grade} · ${B.chapter}`; $('#crB').textContent=B.title; $('#bBack').href='../index.html'; $('#bBackL').textContent='المكتبة'; $('#bLessons').hidden=true;
  const tot=LES.reduce((a,l)=>a+l.nEx,0), done=LES.reduce((a,l)=>a+exDone(l),0), seen=LES.filter(l=>ST.seen[l.id]).length;
  $('#home').innerHTML=`<div class="hero"><svg class="deco" viewBox="0 0 300 200" fill="none" stroke="#fff" stroke-width="3"><path d="M0 170C60 170 80 20 150 40S240 180 300 60"/><path d="M40 150L260 70" stroke-dasharray="8 8"/><circle cx="150" cy="40" r="8" fill="#fff"/></svg>
    <small>${esc(B.grade)} · ${esc(B.chapter)}</small><h1>${esc(B.title)}</h1><p>${T(B.desc||'')}</p>
    <div class="bar"><i style="width:${LES.length?Math.round(seen/LES.length*100):0}%"></i></div>
    <div class="meta">أنهيت ${seen} من ${LES.length} دروس${tot?` · حللت ${done} من ${tot} تمريناً`:''}</div></div>
   <div class="lessons">${LES.map((l,i)=>{ const n=exDone(l); return `<a class="lcard" href="#l=${l.id}"><span class="no"><span>${esc(l.no)}</span><span class="pg">ص ${esc(l.pg)}</span></span><b>${T(l.t)}</b><p>${T(l.d)}</p>
     <span class="st">${ST.seen[l.id]?'<span class="okb">✓ مكتمل</span>':`الدرس ${i+1}`}${l.nEx?`<span class="mini"><i style="width:${Math.round(n/l.nEx*100)}%"></i></span><span>${n}/${l.nEx}</span>`:''}</span></a>`; }).join('')}</div>
   ${B.classic?`<p class="classic">تفضّل الكتاب بصفحاته؟ <a href="${B.classic}">افتح النسخة الكلاسيكية</a></p>`:''}`;
  typeset($('#home')); scrollTo({top:0,behavior:'instant'}); $('#prog').style.width='0';
}

/* ================= lesson ================= */
let steps=[], secs=[], active=null, curLes=null;
function renderLesson(les){
  D.body.classList.remove('is-home'); curLes=les; ST.last=les.id; save(); D.title=`${les.t.replace(/\$[^$]*\$/g,'')} – ${B.title}`;
  $('#crS').textContent=`${B.grade} · ${B.chapter} · [${les.no}] · ص ${les.pg}`; $('#crB').innerHTML=T(les.t); typeset($('#crB'));
  $('#bBack').href='#'; $('#bBackL').textContent='الدروس'; $('#bLessons').hidden=true;
  let prevSc=null, h='';
  les.secs.forEach((sec,si)=>{ h+=`<section class="sec" data-sec="${esc(sec.t)}" id="s${si}">`;
    sec.steps.forEach((st,ki)=>{ const sc=st.sc&&B.S[st.sc]?st.sc:prevSc; if(st.sc&&!B.S[st.sc]) console.warn('scene?',st.sc); prevSc=sc;
      h+=`<div class="step ${st.cls.join(' ')}" data-scene="${esc(sc||'')}">${stepHTML(st,les,si,ki)}</div>`; });
    h+='</section>'; });
  const i=LES.indexOf(les), nx=LES[i+1];
  h+=`<section class="sec" data-sec="التالي" id="sEnd"><div class="summary step" data-scene="${esc(prevSc||'')}"><h2>أحسنت!</h2><p>أنهيت درس «${T(les.t)}».</p><div class="lnav">${nx?`<a href="#l=${nx.id}"><span><small>الدرس التالي · [${esc(nx.no)}]</small><br>${T(nx.t)}</span><span>←</span></a>`:''}<a href="#"><span>كل دروس الفصل</span><span>←</span></a><a href="#l=${les.id}" data-top><span>إعادة الدرس من أوله</span><span>↑</span></a></div></div></section>`;
  story.innerHTML=h; typeset(story);
  steps=$$('.step',story); secs=$$('.sec',story); active=null;
  outline.innerHTML=secs.map((s,i)=>`<li><a href="#l=${les.id}" data-s="${i}"><span class="n">${i+1}</span>${esc(s.dataset.sec)}</a></li>`).join('');
  $$('a',outline).forEach(a=>a.onclick=e=>{ e.preventDefault(); secs[+a.dataset.s].scrollIntoView({behavior:'smooth'}); });
  $$('[data-top]',story).forEach(a=>a.onclick=e=>{ e.preventDefault(); scrollTo({top:0,behavior:'smooth'}); });
  wire(les); cur=null; from=null; scrollTo({top:0,behavior:'instant'}); requestAnimationFrame(()=>{ size(); pick(); });
}
function route(){ const m=location.hash.match(/l=([\w-]+)/), les=m&&LES.find(l=>l.id===m[1]); if(les) renderLesson(les); else { curLes=null; renderHome(); } }
addEventListener('hashchange',route);

/* ================= interactions inside the story ================= */
function num(s){ s=String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[−–]/g,'-').replace(/٫/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/\s/g,'');
  s=s.replace(/π/g,'(PI)').replace(/\bpi\b/gi,'(PI)').replace(/²/g,'^2').replace(/³/g,'^3');
  s=s.replace(/∛\(/g,'cbrt(').replace(/√\(/g,'sqrt(').replace(/∛([0-9.]+)/g,'cbrt($1)').replace(/√([0-9.]+|\(PI\))/g,'sqrt($1)');
  s=s.replace(/(\d|\))(\(|sqrt|cbrt)/g,'$1*$2');
  if(!/^[-+*/^0-9.()a-zA-Z]*$/.test(s)||/[a-zA-Z]/.test(s.replace(/sqrt|cbrt|PI/g,''))) return NaN;
  s=s.replace(/\^/g,'**').replace(/sqrt/g,'Math.sqrt').replace(/cbrt/g,'Math.cbrt').replace(/PI/g,'Math.PI');
  try{ const v=Function('"use strict";return ('+s+')')(); return typeof v==='number'?v:NaN; }catch(e){ return NaN; } }
function nums(s){ s=String(s).replace(/[−–]/g,'-').replace(/\b[a-zA-Z]\s*=/g,'').replace(/[a-zA-Z]+[²³]?(\/[a-zA-Z]+)?/g,m=>/^(pi|sqrt|cbrt)$/i.test(m)?m:'');
  s=s.replace(/\(([^()]*[,،][^()]*)\)/g,'$1');
  const out=[], dec=[]; for(let part of s.split(/[,،;؛]|\sو\s?|\sأو\s|\bor\b/)){ part=part.trim(); if(!part) continue;
    const m=part.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g,'.').match(/^[-+]?\d*\.(\d+)$/), d=m?m[1].length:0;
    if(part.includes('±')){ const [a,b]=part.split('±'); const x=a.trim()?num(a):0, y=num(b); out.push(x+y,x-y); dec.push(0,0); } else { out.push(num(part)); dec.push(d); } }
  out.dec=dec; return out; }
function same(got,key){ if(got.length!==key.length||got.some(v=>!isFinite(v))) return false;
  const g=got.map((v,i)=>({v,d:(got.dec||[])[i]||0})).sort((a,b)=>a.v-b.v), k=[...key].sort((a,b)=>a-b);
  return k.every((v,i)=>Math.abs(v-g[i].v)<=Math.max(1e-4,Math.abs(v)*2e-4,g[i].d?0.51*10**-g[i].d:0)); }
function wire(les){
  $$('.ask',story).forEach(q=>{ const ans=+q.dataset.ans, why=q.nextElementSibling;
    $$('.opt',q).forEach((b,i)=>b.onclick=()=>{ $$('.opt',q).forEach((x,j)=>{ x.classList.toggle('right',j===ans); x.classList.toggle('wrong',j===i&&i!==ans); }); why&&why.classList.add('on'); }); });
  $$('.prac',story).forEach(p=>{ const key=nums(p.dataset.key), inp=$('input',p), fb=p.nextElementSibling, row=fb.nextElementSibling, sol=row.nextElementSibling, id=p.dataset.id;
    if(!sol.innerHTML.trim()) row.hidden=true;
    const mark=v=>{ ST.ex[id]=v; save(); };
    if(ST.ex[id]===1){ fb.textContent='✓ حللته سابقاً'; fb.className='fb ok'; }
    const check=()=>{ const v=inp.value.trim(); if(!v){ fb.textContent='اكتب جوابك أولاً'; fb.className='fb'; return; }
      const got=nums(v); if(!got.length||got.some(x=>!isFinite(x))){ fb.textContent='اكتب عدداً، مثل 3 أو 1/2 أو √5 أو -4'; fb.className='fb'; return; }
      if(same(got,key)){ fb.textContent='✓ صحيح!'; fb.className='fb ok'; mark(1); sol.classList.add('on'); if(p.dataset.ok&&B.S[p.dataset.ok]){ p.closest('.step').dataset.scene=p.dataset.ok; go(p.dataset.ok); } }
      else if(key.length>1&&got.length<key.length&&got.every(g=>key.some(k=>Math.abs(k-g)<=1e-3))){ fb.textContent=`صحيح جزئياً: للسؤال ${key.length} قيم، افصل بينها بفاصلة.`; fb.className='fb'; }
      else { fb.textContent='✗ ليس صحيحاً بعد. راجع خطواتك وحاول مرة أخرى.'; fb.className='fb bad'; if(ST.ex[id]!==1) mark(0); } };
    $('.btn',p).onclick=check; inp.addEventListener('keydown',e=>{ if(e.key==='Enter') check(); });
    $('[data-show]',row).onclick=()=>sol.classList.toggle('on'); });
  $$('[data-self]',story).forEach(r=>{ const id=r.dataset.self, sol=r.nextElementSibling, mk=$('.mk',r), dn=$('.done',r);
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
  if(sc.v){
    const Vb=view(sc), V=from&&from.v&&k<1?mixV(view(from),Vb,k):Vb, pad=V.pad, gb=H-pad.b;
    const X=x=>pad.l+(x-V.x0)/(V.x1-V.x0)*(W-pad.l-pad.r), Y=y=>pad.t+(V.y1-y)/(V.y1-V.y0)*(gb-pad.t), W2X=px=>V.x0+(px-pad.l)/(W-pad.l-pad.r)*(V.x1-V.x0);
    Object.assign(A,{X,Y,V,W2X});
    /* grid & axes */
    if(!sc.noaxes){ const sx=sc.sx||niceStep(V.x1-V.x0,W,46), sy=sc.sy||niceStep(V.y1-V.y0,gb,34); let g='';
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
  } else if(sc.draw){ sc.draw(A); }
  /* chips, legend, hint */
  const ch=$('#chips'); ch.innerHTML=chips.map(([c,l,v])=>`<span class="chip"><i style="background:var(--${c})"></i>${esc(iso(l))} <b>${esc(v)}</b></span>`).join('');
  const lg=$('#legend'); lg.hidden=!legend.length; lg.innerHTML=legend.map(([c,l])=>`<span><i style="background:${c}"></i>${esc(iso(l))}</span>`).join('');
  const hh=$('#hint'); hh.textContent=iso(hint); hh.className='hint'+(hintOk?' ok':'');
}
let W2Xg=null, curA=0, curB=1;
function loop(){ raf=0; let more=false; if(from&&t<1){ t+=1/36; more=true; } else if(from){ from=null; }
  if(cur&&cur.sweep){ sweepT+=.03; more=true; }
  if(cur&&cur.sl&&playing){ const s=cur.sl; playT+=1/60; const u=(Math.sin(playT*(s.speed||.6)-Math.PI/2)+1)/2; P=s.min+(s.max-s.min)*u; syncSlider(); more=true; }
  if(cur&&cur.anim) more=true;
  draw(); if(more) raf=requestAnimationFrame(loop); }
const kick=()=>{ if(!raf) raf=requestAnimationFrame(loop); };
function syncSlider(){ const s=cur&&cur.sl, w=$('#sl'); w.hidden=!s; if(!s) return; const i=$('#slI'); i.min=s.min; i.max=s.max; i.step=s.step||'any'; i.value=P; $('#slL').textContent=s.lab||''; $('#slV').textContent=(s.fmt||fmt)(P); }
function go(name){ const sc=B.S[name]; if(!sc||sc===cur) return; const red=matchMedia('(prefers-reduced-motion: reduce)').matches;
  from=cur&&!red?cur:null; t=0; cur=sc; cDrag=null; sweepT=0; if(sc.sl){ P=sc.sl.v??sc.sl.min; playing=!!sc.sl.play&&!red; playT=0; } syncSlider(); kick(); }
function size(){ const r=box.getBoundingClientRect(); W=r.width; H=r.height; draw(); }
new ResizeObserver(size).observe(box);
$('#slI').addEventListener('input',e=>{ playing=false; P=+e.target.value; $('#slV').textContent=(cur.sl.fmt||fmt)(P); draw(); });
let dragging=false;
const setC=e=>{ if(!W2Xg) return; const r=svg.getBoundingClientRect(); const x=W2Xg(e.clientX-r.left); const lo=Math.min(curA,curB)+.01*(curB-curA), hi=Math.max(curA,curB)-.01*(curB-curA); cDrag=Math.max(lo,Math.min(hi,x)); draw(); };
svg.addEventListener('pointerdown',e=>{ if(!cur) return; if(cur.drag){ dragging=true; svg.setPointerCapture(e.pointerId); setC(e); } else if(cur.sl&&cur.slx&&W2Xg){ dragging=true; svg.setPointerCapture(e.pointerId); slDrag(e); } });
const slDrag=e=>{ const r=svg.getBoundingClientRect(); const x=W2Xg(e.clientX-r.left), s=cur.sl; playing=false; P=Math.max(s.min,Math.min(s.max,x)); syncSlider(); draw(); };
svg.addEventListener('pointermove',e=>{ if(!dragging) return; if(cur.drag) setC(e); else if(cur.slx) slDrag(e); });
svg.addEventListener('pointerup',()=>dragging=false); svg.addEventListener('pointercancel',()=>dragging=false);

/* ================= scrollytelling ================= */
function pick(){ if(!curLes||!steps.length) return; const narrow=innerWidth<=820, line=narrow?$('.fig').getBoundingClientRect().bottom+innerHeight*.06:innerHeight*.45;
  let best=steps[0], bd=1e9; if(scrollY>40) for(const s of steps){ const r=s.getBoundingClientRect(); const d=r.top<=line&&r.bottom>=line?0:Math.min(Math.abs(r.top-line),Math.abs(r.bottom-line)); if(d<bd){ bd=d; best=s; } }
  if(best!==active){ active?.classList.remove('on'); active=best; best.classList.add('on'); if(best.dataset.scene) go(best.dataset.scene); }
  const si=secs.indexOf(best.closest('.sec')); $$('a',outline).forEach((a,i)=>{ a.classList.toggle('on',i===si); a.classList.toggle('done',i<si); });
  const h=root, pr=Math.min(100,h.scrollTop/Math.max(1,h.scrollHeight-innerHeight)*100); $('#prog').style.width=pr+'%';
  if(si>=secs.length-1&&!ST.seen[curLes.id]){ ST.seen[curLes.id]=1; save(); } }
addEventListener('scroll',()=>requestAnimationFrame(pick),{passive:true}); addEventListener('resize',pick);

/* ================= theme & presentation ================= */
try{ const t0=localStorage.getItem('lb-theme'); if(t0) root.dataset.theme=t0; }catch(e){}
$('#bTheme').onclick=()=>{ const dark=(root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark'; root.dataset.theme=dark?'light':'dark'; try{ localStorage.setItem('lb-theme',root.dataset.theme); }catch(e){} draw(); };
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>draw());
const bP=$('#bPresent');
bP.onclick=()=>{ const on=root.classList.toggle('present'); bP.setAttribute('aria-pressed',on); setTimeout(()=>{ size(); active&&active.scrollIntoView({block:'center'}); },60); };
addEventListener('keydown',e=>{ if(e.target.matches('input,textarea')||!curLes) return; const i=steps.indexOf(active);
  if(['ArrowDown','PageDown','ArrowLeft'].includes(e.key)){ e.preventDefault(); steps[Math.min(steps.length-1,i+1)].scrollIntoView({block:'center'}); }
  if(['ArrowUp','PageUp','ArrowRight'].includes(e.key)){ e.preventDefault(); steps[Math.max(0,i-1)].scrollIntoView({block:'center'}); } });

window.LB={go,draw,LES,num,nums,same};
if('serviceWorker' in navigator&&location.protocol==='https:') navigator.serviceWorker.register('../sw.js').catch(()=>{});
route();
})();
