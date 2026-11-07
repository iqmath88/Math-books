/* v1.4.0: Presentation ergonomics, independent of chapter content. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const toolbar=$('mbTools'), present=$('mbPresent');
 if(!toolbar||!present)return;
 const toggle=document.createElement('button');toggle.id='mbBoardToggle';toggle.type='button';toggle.textContent='☰ أدوات';toggle.setAttribute('aria-label','إظهار أدوات السبورة');document.body.append(toggle);
 const hint=document.createElement('span');hint.id='mbBoardHint';hint.textContent='وضع السبورة';toolbar.prepend(hint);
 const sync=()=>{const on=!!$('teach')?.classList.contains('on');document.body.classList.toggle('mb-presentation',on);present.setAttribute('aria-pressed',String(on));if(!on)document.body.classList.remove('mb-tools-collapsed');};
 present.addEventListener('click',()=>requestAnimationFrame(sync));
 $('bTeach')?.addEventListener('click',()=>requestAnimationFrame(sync));
 $('tExit')?.addEventListener('click',()=>requestAnimationFrame(sync));
 // Handled centrally by board-v1.7.4.js.
 const collapse=document.createElement('button');collapse.type='button';collapse.id='mbCollapse';collapse.textContent='▾ إخفاء الشريط';collapse.title='إخفاء شريط الأدوات لإتاحة مساحة إضافية';toolbar.insertBefore(collapse,$('mbHide'));
 collapse.addEventListener('click',()=>{if(document.body.classList.contains('mb-presentation'))document.body.classList.add('mb-tools-collapsed');else $('mbHide')?.click();});
 // Show a clear one-tap way to return to reading mode.
 present.textContent='▣ قراءة / سبورة';present.title='التبديل بين الكتاب المفتوح وصفحة العرض الصفي';
 // Keyboard support for classroom computers; do not intercept typing in inputs.
 document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
  if(event.key==='Escape'&&document.body.classList.contains('mb-presentation')){$('tExit')?.click();sync();}
 });
 sync();
})();
