/* Math-books: service-worker registration + update notice (shared by every page).
   A new release never switches mid-lesson by itself: the teacher sees a bar and chooses when to reload. */
(()=>{ 'use strict';
 if(!('serviceWorker' in navigator)||!window.isSecureContext||location.protocol==='file:') return;
 const me=document.currentScript&&document.currentScript.src; if(!me) return;
 const base=new URL('./',me), SW=navigator.serviceWorker; let reloading=false, shown=false;
 const bar=w=>{ if(shown||!SW.controller) return; shown=true;
  const d=document.createElement('div'); d.id='updBar'; d.setAttribute('role','status'); d.dir='rtl';
  d.style.cssText='position:fixed;z-index:99999;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;'+
   'max-width:calc(100vw - 24px);padding:10px 14px;border-radius:14px;background:#13234a;color:#fff;font:600 15px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35)';
  d.innerHTML='<span>نسخة جديدة من التطبيق جاهزة.</span><button type="button" data-u="go" style="min-height:40px;padding:0 16px;border:0;border-radius:10px;background:#3b82f6;color:#fff;font:inherit;cursor:pointer">حدّث الآن</button><button type="button" data-u="later" style="min-height:40px;padding:0 12px;border:1px solid rgba(255,255,255,.35);border-radius:10px;background:transparent;color:#fff;font:inherit;cursor:pointer">لاحقاً</button>';
  d.addEventListener('click',e=>{ const t=e.target.closest('[data-u]'); if(!t) return; if(t.dataset.u==='later'){ d.remove(); return; } t.disabled=true; t.textContent='جارٍ التحديث…'; (w||{}).postMessage&&w.postMessage({type:'SKIP_WAITING'}); });
  document.body.append(d); };
 SW.addEventListener('controllerchange',()=>{ if(reloading||!shown) return; reloading=true; location.reload(); });
 SW.register(new URL('sw.js',base).href,{updateViaCache:'none'}).then(reg=>{
  if(reg.waiting) bar(reg.waiting);
  reg.addEventListener('updatefound',()=>{ const n=reg.installing; if(!n) return; n.addEventListener('statechange',()=>{ if(n.state==='installed') bar(reg.waiting||n); }); });
  const check=()=>{ if(navigator.onLine) reg.update().catch(()=>{}); };
  check(); document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') check(); });
 }).catch(()=>{});
})();
