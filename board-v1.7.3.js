/* v1.7.3: deterministic board exit and tool toggle; no changes to math content. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const teach=$('teach'), entry=$('mb171-entry'), toggle=$('mbBoardToggle'), toolbar=$('mbTools');
if(!teach||!entry||!toggle||!toolbar)return;
const active=()=>teach.classList.contains('on');
const sync=()=>{
 const on=active();
 document.body.classList.toggle('mb171-board',on);
 document.body.classList.toggle('mb-presentation',on);
 entry.textContent=on?'✕ العودة إلى الكتاب':'▣ افتح واجهة السبورة';
 entry.setAttribute('aria-pressed',String(on));
 toggle.setAttribute('aria-expanded',String(on&&!document.body.classList.contains('mb-tools-collapsed')));
 toggle.setAttribute('aria-label',document.body.classList.contains('mb-tools-collapsed')?'إظهار أدوات السبورة':'إخفاء أدوات السبورة');
 toggle.textContent=document.body.classList.contains('mb-tools-collapsed')?'☰ أدوات':'✕ إخفاء الأدوات';
};
const setTools=show=>{
 toolbar.hidden=false;toolbar.style.removeProperty('display');
 $('mbRestore')?.remove();
 document.body.classList.toggle('mb-tools-collapsed',!show);
 sync();
};
const exit=()=>{
 if(!active())return;
 const button=$('tExit');
 if(button)button.click();
 // Use the original app exit control; sync after the original handler runs.
 requestAnimationFrame(()=>{if(active()){
   // In some chapter builds the native exit handler is asynchronous.
   setTimeout(sync,80);
 }else{
   document.body.classList.remove('mb-tools-collapsed');
   sync();
 }});
};
const enter=()=>{if(!active())$('bTeach')?.click();requestAnimationFrame(()=>{setTools(false);sync()})};
entry.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();active()?exit():enter()},true);
toggle.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(active())setTools(document.body.classList.contains('mb-tools-collapsed'));else setTools(toolbar.hidden||getComputedStyle(toolbar).display==='none')},true);
$('mbCollapse')?.addEventListener('click',()=>requestAnimationFrame(()=>setTools(false)));
$('mbHide')?.addEventListener('click',()=>requestAnimationFrame(()=>setTools(false)));
$('mbPresent')?.addEventListener('click',()=>requestAnimationFrame(sync));
$('tExit')?.addEventListener('click',()=>requestAnimationFrame(()=>{document.body.classList.remove('mb-tools-collapsed');sync()}));
const observer=new MutationObserver(sync);
observer.observe(teach,{attributes:true,attributeFilter:['class']});
sync();
})();
