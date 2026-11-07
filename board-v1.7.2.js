/* v1.7.2: Keep the original live drawing and controls, enrich the explanation pane. */
(()=>{'use strict';
 const board=document.getElementById('tBoard'); if(!board)return;
 const idea=()=>board.querySelector('.mb17-idea');
 let current=null, observed=null;
 function update(){
  if(!document.body.classList.contains('mb171-board'))return;
  const page=board.querySelector(':scope > .page');const panel=idea();if(!page||!panel)return;
  if(current!==page){current=page;if(observed)observed.disconnect();observed=new MutationObserver(()=>requestAnimationFrame(update));observed.observe(page,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['value']});}
  const eq=panel.querySelector('#mb17-equation');if(!eq)return;
  const sliders=[...page.querySelectorAll('input[type="range"]')];
  const names=sliders.map(el=>{const row=el.closest('.sl');return (row?.querySelector('.nm')?.textContent||row?.textContent||'').trim().toLowerCase()});
  const findVal=(name)=>{const i=names.findIndex(s=>s===name||s.startsWith(name+' ')||s.endsWith(' '+name));return i>=0?Number(sliders[i].value):null};
  const h=findVal('h'),k=findVal('k'),r=findVal('r');
  if(h!==null&&k!==null&&r!==null&&Number.isFinite(h)&&Number.isFinite(k)&&Number.isFinite(r)){
   const fmt=(v)=>v<0?`+ ${Math.abs(v)}`:v>0?`− ${v}`:'';
   const label=`(x ${fmt(h)})² + (y ${fmt(k)})² = ${Number((r*r).toFixed(4))}`;
   if(eq.dataset.dynamicEquation!==label){eq.textContent=label;eq.dataset.dynamicEquation=label;eq.setAttribute('dir','ltr');}
   let live=panel.querySelector('#mb172-values');if(!live){live=document.createElement('div');live.id='mb172-values';live.style.cssText='text-align:center;color:#254d70;font:600 clamp(16px,1.25vw,22px) system-ui;padding:10px;background:#edf4f9;border-radius:10px';eq.after(live)}
   live.textContent=`المركز (${h} ، ${k})  ·  نصف القطر ${r}`;
  }else{delete eq.dataset.dynamicEquation;panel.querySelector('#mb172-values')?.remove()}
 }
 board.addEventListener('input',e=>{if(e.target.matches('input[type="range"]'))requestAnimationFrame(update)},true);
 const mo=new MutationObserver(()=>requestAnimationFrame(update));mo.observe(board,{childList:true});
 document.getElementById('mb171-entry')?.addEventListener('click',()=>setTimeout(update,90));
 document.getElementById('tNext')?.addEventListener('click',()=>setTimeout(update,90));
 document.getElementById('tPrev')?.addEventListener('click',()=>setTimeout(update,90));
 setTimeout(update,100);
})();
