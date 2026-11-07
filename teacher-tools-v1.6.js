/* Math-books v1.6.0: classroom teacher controls, additive and non-destructive. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const toolbar=$('mbTools');if(!toolbar)return;
 const button=(id,label,title)=>{const b=document.createElement('button');b.type='button';b.id=id;b.textContent=label;b.title=title||label;toolbar.insertBefore(b,$('mbHide'));return b;};
 const undo=button('mbTeacherUndo','↶ تراجع','التراجع عن آخر خط');
 const redo=button('mbTeacherRedo','↷ إعادة','إعادة آخر خط');
 undo.addEventListener('click',()=>dispatchEvent(new Event('mb-undo-stroke')));
 redo.addEventListener('click',()=>dispatchEvent(new Event('mb-redo-stroke')));
 const reveal=button('mbTeacherReveal','◫ إخفاء حل','اختيار جزء من الحل لإخفائه ثم كشفه بالتدرج');
 const next=button('mbTeacherNext','◀ كشف التالي','إظهار العنصر المخفي التالي');
 const reset=button('mbTeacherReset','إظهار الكل','إظهار جميع الأجزاء المخفية');
 const info=document.createElement('div');info.id='mbTeacherMessage';info.setAttribute('role','status');info.setAttribute('aria-live','polite');document.body.append(info);
 let selecting=false;const hidden=[];
 const message=t=>{info.textContent=t;info.classList.add('active');};
 const setSelecting=on=>{selecting=on;document.body.classList.toggle('mb-teacher-select',on);reveal.setAttribute('aria-pressed',String(on));reveal.textContent=on?'إلغاء الاختيار':'◫ إخفاء حل';if(on){if($('mbPen')?.getAttribute('aria-pressed')==='true')$('mbPen').click();if($('mbErase')?.getAttribute('aria-pressed')==='true')$('mbErase').click();message('المس خطوة من الحل لإخفائها، ثم اختر «كشف التالي»');}};
 const revealOne=()=>{const el=hidden.find(x=>x.isConnected&&x.classList.contains('mb-teacher-covered'));if(!el){message('لا توجد خطوات مخفية');return;}el.classList.remove('mb-teacher-covered');el.removeAttribute('aria-label');message('تم كشف خطوة');};
 const showAll=()=>{hidden.forEach(el=>{el.classList.remove('mb-teacher-covered');el.removeAttribute('aria-label')});hidden.length=0;message('تم إظهار جميع الخطوات');};
 reveal.addEventListener('click',()=>setSelecting(!selecting));next.addEventListener('click',revealOne);reset.addEventListener('click',showAll);
 document.addEventListener('click',e=>{
  if(!selecting||e.target.closest('#mbTools,#mbGuide,#mbTeacherMessage,#mbBoardToggle'))return;
  const target=e.target.closest('.step,.solution,.answer,.sol,.eq,.formula,.math,.card,.text,.page');
  if(!target||!target.closest('#teach'))return;
  e.preventDefault();e.stopPropagation();
  if(target.classList.contains('mb-teacher-covered')){target.classList.remove('mb-teacher-covered');hidden.splice(hidden.indexOf(target),1);message('تم إظهار العنصر');return;}
  if(!hidden.includes(target))hidden.push(target);
  target.classList.add('mb-teacher-covered');target.setAttribute('aria-label','جزء مخفي من الحل');
  message('تم إخفاء عنصر؛ يمكن كشفه لاحقاً');
 },true);
 document.addEventListener('keydown',e=>{
  const typing=e.target.closest('input,textarea,[contenteditable="true"]');if(typing)return;
  if(e.key==='Escape'&&selecting){setSelecting(false);return;}
  if(!document.body.classList.contains('mb-presentation'))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();dispatchEvent(new Event(e.shiftKey?'mb-redo-stroke':'mb-undo-stroke'));}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();dispatchEvent(new Event('mb-redo-stroke'));}
 });
 for(const id of ['tNext','tPrev','bNext','bPrev'])$(id)?.addEventListener('click',()=>{showAll();setSelecting(false)});
 const obs=new MutationObserver(()=>{if(!document.body.classList.contains('mb-presentation')&&selecting)setSelecting(false);});obs.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
