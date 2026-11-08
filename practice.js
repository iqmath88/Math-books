/* Math-books v1.12 — practice: type your answer, self-check, saved progress and stars.
   Non-destructive: reads the answer already shown under each «تحقّق من حلّك» flap; never edits lesson content. */
(()=>{'use strict';
 const CHID=(location.pathname.split('/').pop()||'').replace(/\.html$/,'')||'ch';
 const KEY='lb-ex-'+CHID, SKEY='lb-stars-'+CHID;
 const ls={get(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } },set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }};
 const store=ls.get(KEY)||{}; store.r=store.r||{};
 const save=()=>{ store.t=total; ls.set(KEY,store); };

 /* ---------- tiny numeric parser: numbers, π, √, ∛, + − × / ^ ( ), implicit multiplication ---------- */
 function evalExpr(src){ const s=src.replace(/\s+/g,''); let i=0;
  const peek=()=>s[i], eat=c=>{ if(s[i]===c){ i++; return true; } return false; };
  function num(){ const m=s.slice(i).match(/^\d+(\.\d+)?|^\.\d+/); if(!m) return null; i+=m[0].length; return parseFloat(m[0]); }
  function atom(){ const c=peek();
   if(c==='('){ i++; const v=expr(); if(!eat(')')) throw 0; return v; }
   if(c==='π'){ i++; return Math.PI; }
   if(c==='√'){ i++; return Math.sqrt(unary()); }
   if(c==='∛'){ i++; return Math.cbrt(unary()); }
   const n=num(); if(n===null) throw 0; return n; }
  function power(){ let b=atom(); if(eat('^')){ const e=unary(); b=Math.pow(b,e); } return b; }
  function implicit(){ let v=power(); while(i<s.length&&/[\d(π√∛.]/.test(peek())) v*=power(); return v; }
  function unary(){ if(eat('-')) return -unary(); if(eat('+')) return unary(); return implicit(); }
  function term(){ let v=unary(); for(;;){ if(eat('*')) v*=unary(); else if(eat('/')) v/=unary(); else return v; } }
  function expr(){ let v=term(); for(;;){ if(eat('+')) v+=term(); else if(eat('-')) v-=term(); else return v; } }
  const v=expr(); if(i!==s.length||!isFinite(v)) throw 0; return v; }
 const AR=/[؀-ۿ]/;
 const UNIT=/(?<![A-Za-z])(cm|km|mm|m|sec|s|min|h|rad|units?)(\^\(?-?\d\)?)?(\s*\/\s*(sec|s|min|h)(\^\(?\d\)?)?)?(?![A-Za-z])/g;
 const AUNIT=/(سم|كم|م|ثا|ساعة|دقيقة|وحدات|وحدة|درجة)(\s*\/\s*(ثا|ساعة|دقيقة|م))?(\^?\(?\d\)?)?/g;
 function topSplit(s,seps){ const out=[]; let d=0, cur=''; for(const ch of s){ if(ch==='('||ch==='{'||ch==='[') d++; else if(ch===')'||ch==='}'||ch===']') d--; if(d===0&&seps.includes(ch)){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out.map(x=>x.trim()).filter(Boolean); }
 function dropComments(s){ /* remove (...) groups that hold words, ∉/∈, inequalities */
  let prev; do{ prev=s; s=s.replace(/\(([^()]*)\)/g,(m,inner)=>/[؀-ۿ∉∈⇒<>≠]/.test(inner)?' ':'\u0001'+inner+'\u0002'); }while(s!==prev);
  return s.replace(/\u0001/g,'(').replace(/\u0002/g,')'); }
 /* one comma-part -> list of values, or null if not purely numeric */
 function partValues(p,strict){ p=p.trim(); if(!p) return [];
  p=p.replace(/^[A-Za-z][′'’]?\s*(?=\()/,'');                   /* point label A′( */
  const tup=p.match(/^\((.*)\)$/); if(tup&&topSplit(tup[1],[',']).length>1){ const r=[]; for(const q of topSplit(tup[1],[','])){ const v=partValues(q,strict); if(!v) return null; r.push(...v); } return r; }
  const cut=p.split(/[=≈≅]/); let rhs=cut[cut.length-1].trim(); if(!rhs) return null;
  if(strict&&cut.length>1){ const lhs=cut[cut.length-2].split('⇒').pop().replace(/\([^()]*\)/g,'').trim(); if(/[A-Za-z]/.test(lhs)&&/[+\-*\/]/.test(lhs)) return null; } /* an equation, not «name = value» */
  rhs=rhs.replace(UNIT,'').replace(AUNIT,'').replace(/°/g,'').trim(); if(!rhs) return null;
  if(!/^[\d.\s+\-*/^()π√∛±]+$/.test(rhs)) return null;
  const lit=rhs.match(/^-?\d*\.(\d+)$/), tl=lit?0.5*Math.pow(10,-lit[1].length)+1e-12:0;
  const V=v=>({v,t:Math.max(tl,Math.abs(v)*0.006,1e-9)});
  try{ if(rhs.includes('±')) return [V(evalExpr(rhs.replace('±','+'))),V(evalExpr(rhs.replace('±','-')))]; return [V(evalExpr(rhs))]; }catch(e){ return null; } }
 const norm=s=>s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[−–]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/،/g,',').replace(/٫/g,'.').replace(/\s+/g,' ');
 /* answer key from the ✓ rows of the hidden answer (HTML keeps fractions/roots exact) */
 function htmlText(el){ const c=el.cloneNode(true);
  c.querySelectorAll('.fr').forEach(f=>{ const n=f.querySelector(':scope>.nu'), d=f.querySelector(':scope>.de'); f.replaceWith(document.createTextNode(`((${htmlText(n)})/(${htmlText(d)}))`)); });
  c.querySelectorAll('.rad').forEach(r=>{ const cube=r.querySelector(':scope>.ri'), rc=r.querySelector(':scope>.rc'); r.replaceWith(document.createTextNode((cube?'∛':'√')+'('+htmlText(rc)+')')); });
  c.querySelectorAll('sup').forEach(x=>x.replaceWith(document.createTextNode('^('+x.textContent+')')));
  c.querySelectorAll('sub').forEach(x=>x.remove());
  return c.textContent; }
 function keyFrom(ans){ if(!ans) return null; const rows=[...ans.querySelectorAll('b')].filter(b=>/^[\s]*[✓✗]/.test(b.textContent)); if(!rows.length) return null;
  const vals=[], names=[]; for(const r of rows){ if(/^\s*✗/.test(r.textContent)) return null; let t=norm(htmlText(r)).replace(/^\s*✓\s*/,''); t=dropComments(t);
   t=t.replace(AUNIT,''); if(AR.test(t)) return null;
   for(const part of topSplit(t,[','])){ const v=partValues(part,true); if(!v||!v.length) return null; vals.push(...v);
    const nm=part.split(/[=≈≅]/)[0].replace(/\^\([^)]*\)/g,'').trim(); if(v.length===1&&/[A-Za-z]/.test(nm)&&nm.length<=10&&/[=≈≅]/.test(part)) names.push(nm); else names.push(null); } }
  if(!vals.length||vals.length>8) return null; vals.names=names.length===vals.length&&names.every(Boolean)?names:null; return vals; }
 function studentValues(txt){ let t=norm(txt).replace(/\s+و\s+/g,','); const vals=[];
  for(const part of topSplit(t,[',',';'])){ const v=partValues(part,false); if(!v) return null; vals.push(...v); } return vals; }
  function match(key,got,keyTxt){ if(!got||got.length!==key.length) return false; const left=[...key];
  for(const g of got){ const j=left.findIndex(k=>Math.abs(g.v-k.v)<=k.t+Math.max(g.t*.0,1e-9)); if(j<0) return false; left.splice(j,1); } return true; }

 /* ---------- UI in every «تحقّق من حلّك» lab ---------- */
 const labs=[...document.querySelectorAll('.page.lab')].filter(p=>p.querySelector('.xsel'));
 let total=0; labs.forEach(p=>total+=p.querySelectorAll('.xsel [data-x]').length);
 const el=(t,c,h)=>{ const e=document.createElement(t); if(c) e.className=c; if(h!==undefined) e.innerHTML=h; return e; };
 labs.forEach(page=>{
  const set=page.dataset.set||'', side=page.querySelector('.side'), flap=page.querySelector('.lab-flap'), ans=flap?flap.querySelector('.ans'):page.querySelector('.ro');
  const box=el('div','px-box'); box.innerHTML=`<div class="px-in"><input type="text" inputmode="text" autocomplete="off" spellcheck="false" dir="ltr" aria-label="اكتب جوابك"><button type="button" class="chip gold px-go">تحقّق</button></div><div class="px-fb" aria-live="polite"></div>`;
  const self=el('div','px-self'); self.innerHTML=`<span>هل حللته صحيحاً؟</span><button type="button" class="chip px-y">✓ نعم</button><button type="button" class="chip px-n">✗ أخطأت</button>`;
  const cnt=el('div','px-cnt');
  const tgt=flap||ans; tgt.before(box); (flap||ans).after(self); side.prepend(cnt);
  const inp=box.querySelector('input'), fb=box.querySelector('.px-fb');
  let cur=null, key=null;
  const curId=()=>{ const on=page.querySelector('.xsel [data-x].on'); return on?set+'|'+on.textContent.trim():null; };
  const paint=()=>{ page.querySelectorAll('.xsel [data-x]').forEach(b=>{ const r=store.r[set+'|'+b.textContent.trim()]; b.classList.toggle('px-ok',r===1); b.classList.toggle('px-bad',r===0); });
   const all=[...page.querySelectorAll('.xsel [data-x]')], done=all.filter(b=>store.r[set+'|'+b.textContent.trim()]===1).length;
   cnt.innerHTML=`<span class="px-bar"><i style="width:${all.length?Math.round(done/all.length*100):0}%"></i></span> حللت ${'<bdi>'+done+'</bdi>'} من ${'<bdi>'+all.length+'</bdi>'}`; };
  const record=v=>{ const id=curId(); if(!id) return; if(store.r[id]===1&&v===0) return; store.r[id]=v; save(); paint(); };
  const refresh=()=>{ const id=curId(); if(id===cur) return; cur=id; key=keyFrom(ans); inp.value=''; fb.textContent=''; fb.className='px-fb';
   box.hidden=!key; if(key){ const nn=key.names&&new Set(key.names).size===key.names.length?key.names:null, cnt=key.length===2?'قيمتين':key.length+' قيم'; inp.placeholder=nn?`اكتب قيمة ${nn.join(' ، ')}`+(key.length>1?' بينها فاصلة':''):key.length>1?`اكتب ${cnt} بينها فاصلة`:'اكتب الجواب النهائي (عدد)'; }
   self.hidden=!!flap; paint(); };
  const check=()=>{ if(!key) return; const got=studentValues(inp.value);
   if(!inp.value.trim()){ fb.textContent='اكتب جوابك أولاً.'; fb.className='px-fb'; return; }
   if(!got){ fb.textContent='لم أفهم الجواب: اكتب أعداداً مثل 3/4 أو 2√3 أو −1.5'; fb.className='px-fb'; return; }
   if(got.length!==key.length){ fb.textContent=`المطلوب ${key.length} ${key.length>1?'قيم':'قيمة'}، وكتبت ${got.length}.`; fb.className='px-fb'; return; }
   if(match(key,got)){ fb.textContent='✓ صحيح! ارفع اللسان لترى الحل كاملاً.'; fb.className='px-fb ok'; record(1); }
   else { fb.textContent='✗ ليس صحيحاً. راجع حلك وحاول مرة أخرى، أو ارفع اللسان.'; fb.className='px-fb bad'; record(0); } };
  box.querySelector('.px-go').addEventListener('click',check);
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
  self.querySelector('.px-y').addEventListener('click',()=>{ record(1); self.classList.add('done'); });
  self.querySelector('.px-n').addEventListener('click',()=>{ record(0); self.classList.add('done'); });
  if(flap) new MutationObserver(()=>{ const open=flap.classList.contains('open'); self.hidden=!open; if(open) self.classList.remove('done'); }).observe(flap,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>requestAnimationFrame(refresh)).observe(page.querySelector('.xsel'),{subtree:true,attributes:true,attributeFilter:['class']});
  refresh(); });
 save();
 /* ---------- challenge stars ---------- */
 document.querySelectorAll('.stars').forEach(st=>new MutationObserver(()=>{ const n=(st.childNodes[0]&&st.childNodes[0].nodeType===3?st.childNodes[0].textContent:'').split('★').length-1;
  if(st.textContent.includes('★')){ const best=+(ls.get(SKEY)||0); if(n>best) ls.set(SKEY,n); } }).observe(st,{childList:true,subtree:true,characterData:true}));
 /* debugging hook for tests */
 globalThis.MB_PRACTICE={keyFrom,studentValues,match};
})();
