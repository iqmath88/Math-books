/* v1.7.1: Explicit, visible entry to the real board mode. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const teach=$('teach'),board=$('tBoard'),teacherButton=$('bTeach');
 if(!teach||!board||!teacherButton)return;
 const entry=document.createElement('button');entry.id='mb171-entry';entry.type='button';entry.textContent='▣ افتح واجهة السبورة';entry.setAttribute('aria-label','افتح واجهة السبورة التفاعلية');document.body.append(entry);
 function active(){return teach.classList.contains('on')}
 function sync(){const on=active();document.body.classList.toggle('mb-presentation',on);document.body.classList.toggle('mb171-board',on);entry.textContent=on?'✕ العودة إلى الكتاب':'▣ افتح واجهة السبورة';entry.setAttribute('aria-pressed',String(on));const t=$('mbPresent');if(t)t.setAttribute('aria-pressed',String(on));
 if(on){document.body.classList.add('mb-tools-collapsed');const pg=board.querySelector('.page');if(pg){pg.style.removeProperty('width');pg.style.removeProperty('height');pg.style.removeProperty('font-size');pg.classList.remove('wide');}requestAnimationFrame(()=>{const pg2=board.querySelector('.page');if(pg2){pg2.style.removeProperty('width');pg2.style.removeProperty('height');pg2.style.removeProperty('font-size');}})}else document.body.classList.remove('mb-tools-collapsed');}
 entry.addEventListener('click',()=>{if(active())$('tExit')?.click();else teacherButton.click();sync()});
 teacherButton.addEventListener('click',()=>setTimeout(sync,0));$('tExit')?.addEventListener('click',()=>setTimeout(sync,0));$('mbPresent')?.addEventListener('click',()=>setTimeout(sync,0));
 const observer=new MutationObserver(()=>{if(active()!==document.body.classList.contains('mb171-board'))sync()});observer.observe(teach,{attributes:true,attributeFilter:['class']});
 // Keep the presentation page responsive when the teacher advances a page.
 const changes=new MutationObserver(()=>{if(active())requestAnimationFrame(()=>{const pg=board.querySelector('.page');if(pg){pg.style.removeProperty('width');pg.style.removeProperty('height');pg.style.removeProperty('font-size');}})});changes.observe(board,{childList:true});
 sync();
})();
