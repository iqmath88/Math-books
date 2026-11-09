/* Math-books v1.9 — classroom & board tools (one file; replaces classroom.js, classroom-enhancements.js,
   board-v1.4.js, guided-explanation.js, teacher-tools-v1.6.js, board-v1.7.js, board-v1.7.2.js, board-controls-v1.7.5.js).
   Non-destructive: never edits lesson content; works with the chapter's native teacher mode (#teach). */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const teach=$('teach'), board=$('tBoard'), tb=$('tb'), bTeach=$('bTeach'), tExit=$('tExit');
 if(!teach||!board||!tb||!bTeach||!tExit) return;
 const VER=globalThis.MATH_BOOKS_RELEASE?.version||'';
 const body=document.body, inBoard=()=>teach.classList.contains('on');
 const el=(tag,props={},html='')=>{ const e=document.createElement(tag); Object.assign(e,props); if(html) e.innerHTML=html; return e; };

 /* ---------- status message ---------- */
 const msg=el('div',{id:'mbMsg'}); msg.setAttribute('role','status'); msg.setAttribute('aria-live','polite'); body.append(msg);
 let msgT=0; const say=t=>{ msg.textContent=t; msg.classList.add('on'); clearTimeout(msgT); msgT=setTimeout(()=>msg.classList.remove('on'),2200); };

 /* ---------- drawing layer ---------- */
 const cv=el('canvas',{id:'mbCanvas'}); cv.setAttribute('aria-hidden','true'); body.append(cv); const ctx=cv.getContext('2d');
 let mode='off', color='#e44949', strokes=[], redo=[], cur=null, drawing=false;
 const render=()=>{ const d=Math.min(devicePixelRatio||1,3), w=innerWidth, h=innerHeight; cv.width=Math.round(w*d); cv.height=Math.round(h*d);
  ctx.setTransform(d,0,0,d,0,0); ctx.lineCap='round'; ctx.lineJoin='round';
  for(const s of strokes){ ctx.strokeStyle=s.c; ctx.lineWidth=s.w; ctx.beginPath(); s.p.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h)); if(s.p.length===1) ctx.lineTo(s.p[0][0]*w+.01,s.p[0][1]*h+.01); ctx.stroke(); } };
 const near=pt=>s=>s.p.some(p=>Math.hypot((p[0]-pt[0])*innerWidth,(p[1]-pt[1])*innerHeight)<24);
 cv.addEventListener('pointerdown',e=>{ if(mode==='off') return; e.preventDefault(); cv.setPointerCapture(e.pointerId); drawing=true; redo=[];
  const pt=[e.clientX/innerWidth,e.clientY/innerHeight]; if(mode==='erase') strokes=strokes.filter(s=>!near(pt)(s)); else { cur={c:color,w:3.5,p:[pt]}; strokes.push(cur); } render(); });
 cv.addEventListener('pointermove',e=>{ if(!drawing) return; e.preventDefault(); const pt=[e.clientX/innerWidth,e.clientY/innerHeight];
  if(mode==='erase') strokes=strokes.filter(s=>!near(pt)(s)); else if(cur) cur.p.push(pt); render(); });
 const endDraw=()=>{ drawing=false; cur=null; }; cv.addEventListener('pointerup',endDraw); cv.addEventListener('pointercancel',endDraw);
 const clearInk=()=>{ if(strokes.length){ strokes=[]; redo=[]; render(); } };
 const undoInk=()=>{ if(strokes.length){ redo.push(strokes.pop()); render(); say('تم التراجع عن آخر خط'); } else say('لا توجد خطوط'); };
 const redoInk=()=>{ if(redo.length){ strokes.push(redo.pop()); render(); } else say('لا يوجد ما يُعاد'); };
 addEventListener('resize',render); render();

 /* ---------- toolbar ---------- */
 const B={};
 const btn=(id,label,title,fn,o={})=>{ const b=el('button',{type:'button',id:'mb_'+id,title:title||label}); b.innerHTML=label; if(o.press) b.setAttribute('aria-pressed','false'); if(o.cls) b.className=o.cls; if(o.style) b.style.cssText=o.style; b.addEventListener('click',fn); B[id]=b; return b; };
 const press=(id,on)=>B[id]&&B[id].setAttribute('aria-pressed',String(!!on));
 const setMode=m=>{ mode=(mode===m?'off':m); if(mode!=='off') setPick(null); cv.classList.toggle('on',mode!=='off'); press('pen',mode==='pen'); press('erase',mode==='erase'); say(mode==='off'?'القلم متوقف':mode==='pen'?'القلم مفعّل — اكتب على الشاشة':'الممحاة مفعّلة'); };
 const setColor=(c,id)=>{ color=c; press('red',id==='red'); press('blue',id==='blue'); if(mode!=='pen') setMode('pen'); };
 const bar=el('div',{id:'mbBar'}); bar.setAttribute('role','toolbar'); bar.setAttribute('aria-label','أدوات العرض الصفي'); bar.hidden=true;
 const group=(t,items,cls='')=>{ const g=el('div',{className:'mbg '+cls}); g.append(el('span',{className:'mbgt'},t),...items); return g; };
 bar.append(
  group('الكتابة',[btn('pen','✎ قلم','الكتابة على الشاشة',()=>setMode('pen'),{press:1}),btn('erase','⌫ ممحاة','مسح خط بلمسه',()=>setMode('erase'),{press:1}),
   btn('red','','قلم أحمر',()=>setColor('#e44949','red'),{press:1,cls:'sw',style:'background:#e44949'}),btn('blue','','قلم أزرق',()=>setColor('#2878e4','blue'),{press:1,cls:'sw',style:'background:#2878e4'}),
   btn('undo','↶','تراجع عن آخر خط (Ctrl+Z)',undoInk),btn('redo','↷','إعادة آخر خط (Ctrl+Y)',redoInk),btn('clear','مسح الكل','مسح كل ما كُتب',()=>{ clearInk(); say('تم مسح الكتابة'); })]),
  group('إخفاء الحل',[btn('cover','▤ غطاء متدرّج','غطاء يُسحب للأسفل لكشف الصفحة تدريجياً',()=>toggleCover(),{press:1}),
   btn('pick','◫ إخفاء جزء','المس جزءاً من الصفحة لإخفائه',()=>setPick(!picking),{press:1,cls:'bo'}),btn('next','◀ كشف التالي','إظهار الجزء المخفي التالي',revealNext,{cls:'bo'}),btn('all','إظهار الكل','إظهار كل الأجزاء المخفية',()=>{ showAll(); say('ظهرت كل الأجزاء'); },{cls:'bo'})]),
  group('العرض',[btn('zoom','A+ تكبير','تكبير النص',()=>{ press('zoom',body.classList.toggle('mb-big')); },{press:1}),
   btn('focus','تركيز','إخفاء شريط التنقل مؤقتاً',()=>{ press('focus',body.classList.toggle('mb-focus')); },{press:1,cls:'rd'}),
   btn('full','⛶ ملء الشاشة','ملء الشاشة',async()=>{ try{ if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }catch(_){ say('ملء الشاشة غير مدعوم هنا'); } })]),
  el('span',{id:'mbVer'},VER?'v'+VER:'')
 );
 const closeB=btn('close','✕','إغلاق الأدوات',()=>setBar(false)); closeB.classList.add('x'); bar.append(closeB);
 body.append(bar);

 /* tools button in the navigation bar (does not cover the book) */
 const toolsBtn=el('button',{type:'button',className:'tbtn',id:'mbToolsBtn'},'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg><span class="lbl">أدوات</span>');
 toolsBtn.setAttribute('aria-expanded','false'); toolsBtn.setAttribute('aria-label','أدوات العرض الصفي'); bTeach.before(toolsBtn);
 const tl=bTeach.querySelector('.lbl'); if(tl) tl.textContent='السبورة'; bTeach.setAttribute('aria-label','واجهة السبورة'); bTeach.title='واجهة السبورة (العرض الصفي)';
 /* board-mode handle */
 const handle=el('button',{type:'button',id:'mbHandle'},'✎ أدوات'); handle.setAttribute('aria-expanded','false'); body.append(handle);
 function setBar(on){ bar.hidden=!on; body.classList.toggle('mb-bar',on); toolsBtn.setAttribute('aria-expanded',String(on)); toolsBtn.classList.toggle('on',on); handle.setAttribute('aria-expanded',String(on)); handle.textContent=on?'✕ إخفاء الأدوات':'✎ أدوات';
  if(!on){ if(mode!=='off') setMode(mode); setPick(false); } }
 toolsBtn.addEventListener('click',()=>setBar(bar.hidden)); handle.addEventListener('click',()=>setBar(bar.hidden));

 /* ---------- progressive cover ---------- */
 const cover=el('div',{id:'mbCover',hidden:true},'<div class="h" role="slider" tabindex="0" aria-label="اسحب لكشف الحل" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">اسحب للأسفل لكشف الحل ↕</div>');
 body.append(cover); let frac=0, dragC=false;
 const setReveal=v=>{ frac=Math.max(0,Math.min(1,v)); cover.style.setProperty('--r',frac*100+'%'); cover.firstChild.setAttribute('aria-valuenow',String(Math.round(frac*100))); };
 const coverTarget=()=>inBoard()?board.querySelector(':scope>.page'):document.querySelector('#book .slot.R .page')||document.querySelector('#book .slot.L .page');
 const placeCover=()=>{ const r=coverTarget()?.getBoundingClientRect(); if(!r) return; Object.assign(cover.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'}); };
 function toggleCover(on=cover.hidden){ cover.hidden=!on; press('cover',on); if(on){ setReveal(0); placeCover(); say('اسحب الغطاء للأسفل لكشف الصفحة'); } }
 cover.addEventListener('pointerdown',e=>{ dragC=true; cover.setPointerCapture(e.pointerId); e.preventDefault(); });
 cover.addEventListener('pointermove',e=>{ if(!dragC) return; const r=cover.getBoundingClientRect(); setReveal((e.clientY-r.top)/Math.max(1,r.height)); });
 cover.addEventListener('pointerup',()=>dragC=false); cover.addEventListener('pointercancel',()=>dragC=false);
 cover.firstChild.addEventListener('keydown',e=>{ if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); setReveal(frac+(e.key==='ArrowDown'?.1:-.1)); } });
 addEventListener('resize',()=>{ if(!cover.hidden) placeCover(); });

 /* ---------- hide parts of the page, reveal one by one ---------- */
 let picking=false; const hidden=[];
 function setPick(on){ if(on===null) on=false; picking=!!on; body.classList.toggle('mb-picking',picking); press('pick',picking); if(picking){ if(mode!=='off') setMode(mode); say('المس جزءاً من الصفحة لإخفائه'); } }
 function revealNext(){ const e=hidden.find(x=>x.isConnected&&x.classList.contains('mb-hid')); if(!e){ say('لا توجد أجزاء مخفية'); return; } e.classList.remove('mb-hid'); say('تم كشف جزء'); }
 function showAll(){ hidden.forEach(e=>e.classList.remove('mb-hid')); hidden.length=0; }
 document.addEventListener('click',e=>{
  if(spotPick){ if(e.target.closest('#mbBar,#mbIdea,#tb,#mbHandle')) return; const t=e.target.closest('.law,.cases,.predict,.ro,.stage,.side,.tbl,.exq,p,li,.page'); if(!t) return;
   e.preventDefault(); e.stopPropagation(); document.querySelectorAll('.mb-spot').forEach(x=>x.classList.remove('mb-spot')); t.classList.add('mb-spot'); setSpot(false); return; }
  if(!picking||e.target.closest('#mbBar,#mbIdea,#tb,#mbHandle,#mbMsg')) return;
  const t=e.target.closest('.row,.law,.cases li,.parts>span,.exl li,.steps li,.predict,.ro,.exq,.tbl tr,p,li,.stage'); if(!t||!t.closest('.page')) return;
  e.preventDefault(); e.stopPropagation();
  if(t.classList.contains('mb-hid')){ t.classList.remove('mb-hid'); hidden.splice(hidden.indexOf(t),1); return; }
  hidden.push(t); t.classList.add('mb-hid'); say('أُخفي جزء — «كشف التالي» يظهره');
 },true);

 /* ---------- board (classroom) mode around the native teacher mode ---------- */
 const head=el('header',{id:'mbHead'},'<span class="t1"></span><span class="t2"></span>'); teach.prepend(head);
 const idea=el('aside',{id:'mbIdea'}); idea.setAttribute('aria-label','فكرة الدرس');
 const GUIDE=[['الملاحظة','تأمل الرسم أو المثال. ما المعطيات التي تراها؟ وما المطلوب معرفته؟'],['الاستكشاف','غيّر قيمة واحدة فقط في الرسم التفاعلي، ثم لاحظ ما الذي تغير وما الذي بقي ثابتاً.'],['الاستنتاج','اربط التغير الذي شاهدته بالقاعدة المكتوبة. كيف تفسر العلاقة؟'],['التطبيق','طبّق الفكرة على المثال المعروض، واطلب من الطلاب توقع الخطوة التالية قبل إظهارها.']];
 let gStep=0, spotPick=false;
 const setSpot=on=>{ spotPick=on; body.classList.toggle('mb-picking',on); const b=idea.querySelector('.gspot'); if(b){ b.setAttribute('aria-pressed',String(on)); b.textContent=on?'إلغاء':'إبراز عنصر'; } if(on) say('المس عنصراً في الصفحة لإبرازه'); };
 const txt=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
 const clean=n=>{ const c=n.cloneNode(true); c.querySelectorAll('button,input,canvas,.flapbox,.popts').forEach(x=>x.remove()); c.removeAttribute('id'); return c; };
 let lastPage=null;
 function buildIdea(){
  const S=globalThis.SP||(typeof SP!=='undefined'?SP:null), P=(typeof pos!=='undefined'?pos:0); const page=board.querySelector(':scope>.page'); if(!page) return;
  if(idea.parentNode!==board) board.append(idea);
  if(page===lastPage) return; lastPage=page; showAll(); setSpot(false); document.querySelectorAll('.mb-spot').forEach(x=>x.classList.remove('mb-spot'));
  const R=S&&S[P]?S[P].R:null, h2=R?.querySelector('h2'); let sec='';
  if(h2){ const c=h2.cloneNode(true); c.querySelector('.num')?.remove(); sec=txt(c); }
  const lt=page.querySelector('.lt'); const labT=lt?(()=>{ const c=lt.cloneNode(true); c.querySelector('.lab-ic')?.remove(); return txt(c); })():'';
  head.querySelector('.t1').textContent=sec||labT||'العرض الصفي'; head.querySelector('.t2').textContent=sec&&labT?labT:'';
  idea.replaceChildren();
  idea.append(el('h2',{},'فكرة الدرس'));
  const laws=R?[...R.querySelectorAll('.law,.cases,table.dict,.tbl.law-t')].filter(x=>!x.closest('.predict')).slice(0,2):[];
  if(laws.length){ const box=el('div',{className:'ilaw'}); laws.forEach(l=>box.append(clean(l))); idea.append(box); }
  else if(R){ const p=R.querySelector('.hook,.tb,.tbl,.steps,.parts,.exl,.fcs,p'); if(p){ const box=el('div',{className:'ilaw'}); box.append(clean(p)); idea.append(box); } }
  const live=el('div',{id:'mbLive',hidden:true}); idea.append(live);
  const pr=R?.querySelector('.predict');
  if(pr){ const q=el('div',{className:'iq'}); q.append(el('b',{},'سؤال للصف'),clean(pr.querySelector('.pq')));
   const opts=pr.querySelectorAll('.popts .chip'); if(opts.length){ const ol=el('ol',{className:'iopts'}); opts.forEach(o=>{ const li=el('li'); li.append(...[...o.childNodes].map(n=>n.cloneNode(true))); ol.append(li); }); q.append(ol); }
   const ans=el('div',{className:'ians',hidden:true}); ans.append(clean(pr.querySelector('.ans'))); const sb=el('button',{type:'button',className:'ishow'},'اكشف الإجابة'); sb.onclick=()=>{ ans.hidden=!ans.hidden; sb.textContent=ans.hidden?'اكشف الإجابة':'أخفِ الإجابة'; };
   q.append(sb,ans); idea.append(q); }
  const g=el('details',{className:'iguide'}); g.innerHTML='<summary>دليل الإيضاح للمدرس</summary><div class="gs"></div><p class="gh"></p><div class="ga"><button type="button" class="gp">السابق</button><span class="gc"></span><button type="button" class="gn">التالي</button><button type="button" class="gspot" aria-pressed="false">إبراز عنصر</button></div>';
  const gs=g.querySelector('.gs'); GUIDE.forEach(([n],i)=>{ const b=el('button',{type:'button'},n); b.onclick=()=>gr(i); gs.append(b); });
  const gr=i=>{ gStep=Math.max(0,Math.min(3,i)); [...gs.children].forEach((b,j)=>b.classList.toggle('on',j===gStep)); g.querySelector('.gh').textContent=GUIDE[gStep][1]; g.querySelector('.gc').textContent=(gStep+1)+' / 4'; g.querySelector('.gp').disabled=gStep===0; g.querySelector('.gn').disabled=gStep===3; };
  g.querySelector('.gp').onclick=()=>gr(gStep-1); g.querySelector('.gn').onclick=()=>gr(gStep+1); g.querySelector('.gspot').onclick=()=>setSpot(!spotPick); gr(0);
  idea.append(g); liveVals(); }
 /* live centre/radius readout for circle labs (sliders named h, k, r) */
 function liveVals(){ const page=board.querySelector(':scope>.page'), live=$('mbLive'); if(!page||!live) return;
  const sl=[...page.querySelectorAll('input[type=range]')], nm=sl.map(s=>txt(s.closest('.sl')?.querySelector('.nm')).toLowerCase()), v=n=>{ const i=nm.indexOf(n); return i<0?null:Number(sl[i].value); };
  const h=v('h'),k=v('k'),r=v('r'); if([h,k,r].some(x=>x===null||!isFinite(x))){ live.hidden=true; return; }
  const f=x=>x<0?`+ ${Math.abs(x)}`:x>0?`− ${x}`:''; live.hidden=false; live.innerHTML=`<bdi dir="ltr">(x ${f(h)})² + (y ${f(k)})² = ${+(r*r).toFixed(4)}</bdi><small>المركز (${h} ، ${k}) · نصف القطر ${r}</small>`; }
 board.addEventListener('input',e=>{ if(e.target.matches('input[type=range]')) requestAnimationFrame(liveVals); },true);
 new MutationObserver(()=>{ if(inBoard()) requestAnimationFrame(buildIdea); }).observe(board,{childList:true});
 /* the drawing in board mode is shown flat: no pre-stretch for the tilted card */
 if(typeof globalThis.AK==='function'){ const ak=globalThis.AK; globalThis.AK=p=>p&&p.closest&&p.closest('#teach')&&body.classList.contains('mb-board')?1:ak(p); }
 /* the board is always shown in the light theme (clear on projectors); the reader's own theme returns on exit */
 const root=document.documentElement; let savedTheme=null, forced=false;
 const reTheme=()=>{ try{ if(typeof themeChanged==='function') themeChanged(); }catch(_){} };
 function boardTheme(on){ if(on&&!forced){ savedTheme=root.hasAttribute('data-theme')?root.dataset.theme:null; forced=true; if(root.dataset.theme!=='light'){ root.dataset.theme='light'; reTheme(); } }
  else if(!on&&forced){ forced=false; if(savedTheme===null) root.removeAttribute('data-theme'); else root.dataset.theme=savedTheme; reTheme(); } }
 function syncBoard(){ const on=inBoard(); boardTheme(on); body.classList.toggle('mb-board',on); if(!on){ lastPage=null; showAll(); setSpot(false); } setBar(false); if(!cover.hidden) toggleCover(false);
  if(on){ requestAnimationFrame(()=>{ buildIdea(); const pg=board.querySelector(':scope>.page'); const S=typeof SP!=='undefined'?SP:null; if(S&&typeof pos!=='undefined') S[pos]?.lab?.fit?.(); }); } }
 new MutationObserver(syncBoard).observe(teach,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',()=>{ if(inBoard()){ const S=typeof SP!=='undefined'?SP:null; if(S&&typeof pos!=='undefined') setTimeout(()=>S[pos]?.lab?.fit?.(),150); } });

 /* ---------- navigation clears ink and hidden parts ---------- */
 const onTurn=()=>{ clearInk(); showAll(); if(!cover.hidden) toggleCover(false); };
 document.querySelectorAll('#book .slot').forEach(s=>new MutationObserver(onTurn).observe(s,{childList:true}));
 new MutationObserver(onTurn).observe(board,{childList:true});

 /* ---------- keyboard ---------- */
 document.addEventListener('keydown',e=>{ if(e.target.closest?.('input,textarea,[contenteditable="true"]')) return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){ e.preventDefault(); e.shiftKey?redoInk():undoInk(); return; }
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){ e.preventDefault(); redoInk(); return; }
  if(e.key==='Escape'){ if(spotPick){ setSpot(false); document.querySelectorAll('.mb-spot').forEach(x=>x.classList.remove('mb-spot')); return; } if(picking){ setPick(false); return; } if(mode!=='off'){ setMode(mode); return; } if(!cover.hidden){ toggleCover(false); return; } if(!bar.hidden){ setBar(false); return; } }
 });
 syncBoard();
})();
