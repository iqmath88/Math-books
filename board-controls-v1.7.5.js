/* Math-books v1.7.5: single controller for board entry and tools. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const teach=$('teach'), teacher=$('bTeach'), nativeExit=$('tExit'), toolbar=$('mbTools');
 if(!teach||!teacher||!nativeExit||!toolbar){console.warn('[Math-books] Missing native board controls');return;}
 const entry=document.createElement('button');entry.type='button';entry.id='mb171-entry';document.body.append(entry);
 const toggle=document.createElement('button');toggle.type='button';toggle.id='mbBoardToggle';document.body.append(toggle);
 let expanded=false;
 const active=()=>teach.classList.contains('on');
 function render(){
  const board=active();
  document.body.classList.toggle('mb171-board',board);
  document.body.classList.toggle('mb-presentation',board);
  document.body.classList.toggle('mb-tools-collapsed',board&&!expanded);
  entry.textContent=board?'✕ العودة إلى الكتاب':'▣ افتح واجهة السبورة';
  entry.setAttribute('aria-pressed',String(board));
  toggle.textContent=expanded?'✕ إخفاء الأدوات':'☰ أدوات';
  toggle.setAttribute('aria-expanded',String(expanded));
  toolbar.hidden=board&&!expanded;
  if(board)toolbar.style.display=expanded?'flex':'none';
  else toolbar.style.removeProperty('display');
 }
 entry.addEventListener('click',()=>{
  // Original native handlers own teachOn, page restoration and interactive diagrams.
  if(active())nativeExit.click();else teacher.click();
  expanded=false;render();
 });
 toggle.addEventListener('click',()=>{
  expanded=!expanded;
  // A native toolbar-close action may have hidden the toolbar before.
  $('mbRestore')?.remove();
  render();
 });
 const close=$('mbHide');
 if(close)close.addEventListener('click',()=>{expanded=false;queueMicrotask(render)});
 teacher.addEventListener('click',()=>queueMicrotask(()=>{expanded=false;render()}));
 nativeExit.addEventListener('click',()=>queueMicrotask(()=>{expanded=false;render()}));
 $('mbPresent')?.addEventListener('click',()=>queueMicrotask(()=>{expanded=false;render()}));
 new MutationObserver(()=>{if(!active())expanded=false;render()}).observe(teach,{attributes:true,attributeFilter:['class']});
 render();
})();
