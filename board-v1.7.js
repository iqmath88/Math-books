/* v1.7.0: A genuine two-pane board workspace around the original interactive page. */
(()=>{'use strict';
 const teach=document.getElementById('teach'), board=document.getElementById('tBoard');
 if(!teach||!board)return;
 const head=document.createElement('header');head.id='mb17-head';head.innerHTML='<span id="mb17-title">الرياضيات | العرض الصفي</span><span id="mb17-subtitle">الشرح التفاعلي</span>';
 teach.prepend(head);
 const idea=document.createElement('aside');idea.className='mb17-idea';idea.setAttribute('aria-label','الفكرة الرياضية وأسئلة الاستكشاف');
 idea.innerHTML='<h2>الفكرة الرياضية</h2><div class="mb17-equation" id="mb17-equation"></div><div class="mb17-question" id="mb17-question"></div><div class="mb17-tip">استكشف العلاقة من الرسم التفاعلي، ثم اطلب من الطلاب تفسير التغير.</div>';
 let lastPage=null;
 function sync(){
   if(!document.body.classList.contains('mb-presentation')||!teach.classList.contains('on'))return;
   const page=board.querySelector(':scope > .page');if(!page)return;
   if(idea.parentElement!==board)board.append(idea);
   if(page===lastPage)return;lastPage=page;
   const heading=page.querySelector('h3,h2,h1,.lt,.run,.title');
   const label=(heading?.textContent||'الدرس التفاعلي').replace(/\s+/g,' ').trim().slice(0,85);
   document.getElementById('mb17-title').textContent='الرياضيات | '+label;
   document.getElementById('mb17-subtitle').textContent='الرسم والتطبيق';
   const equation=page.querySelector('.law.std,.law,.eq,.formula,.math,.katex,.mjx-container');
   const box=document.getElementById('mb17-equation');box.replaceChildren();
   if(equation){const clone=equation.cloneNode(true);clone.querySelectorAll('button,input,select,canvas').forEach(n=>n.remove());box.append(clone);}
   else box.textContent='راقب التغير في الرسم، ثم استنتج القاعدة الرياضية';
   const question=page.querySelector('.exq:not(.hide),.predict,.q,.question');
   document.getElementById('mb17-question').textContent=(question?.textContent||'ماذا نلاحظ؟ كيف تتغير النتائج عند تغيير قيمة واحدة فقط؟').trim().slice(0,240);
 }
 const observer=new MutationObserver(()=>{if(!document.body.classList.contains('mb-presentation')){lastPage=null;return;}requestAnimationFrame(sync)});
 observer.observe(board,{childList:true});
 document.getElementById('mbPresent')?.addEventListener('click',()=>setTimeout(sync,70));
 document.getElementById('bTeach')?.addEventListener('click',()=>setTimeout(sync,70));
 document.getElementById('tNext')?.addEventListener('click',()=>setTimeout(sync,70));
 document.getElementById('tPrev')?.addEventListener('click',()=>setTimeout(sync,70));
 sync();
})();
