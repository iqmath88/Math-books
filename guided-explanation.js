/* Math-books v1.5.0 — Guided mathematical explanation (non-destructive overlay). */
(()=>{'use strict';
 const $=(id)=>document.getElementById(id);
 const stages=[
  {name:'الملاحظة',hint:'تأمل الرسم أو المثال. ما المعطيات التي تراها؟ وما المطلوب معرفته؟'},
  {name:'الاستكشاف',hint:'غيّر قيمة واحدة فقط في الرسم التفاعلي، ثم لاحظ ما الذي تغير وما الذي بقي ثابتاً.'},
  {name:'الاستنتاج',hint:'اربط التغير الذي شاهدته بالقاعدة أو المعادلة المكتوبة في الصفحة. كيف تفسر العلاقة؟'},
  {name:'التطبيق',hint:'طبّق الفكرة على المثال المعروض. اطلب من الطلاب توقع الخطوة التالية قبل إظهارها.'}
 ];
 let step=0, minimized=false, focusMode=false;
 const wrap=document.createElement('aside');wrap.id='mbGuide';wrap.setAttribute('aria-label','دليل الشرح الرياضي');
 wrap.innerHTML=`<div class="mbg-head"><strong>دليل الإيضاح</strong><span id="mbg-context"></span><button id="mbg-min" type="button" aria-label="طي دليل الإيضاح">−</button></div><div class="mbg-body"><div class="mbg-stages" role="group" aria-label="مراحل الشرح"></div><p id="mbg-hint" aria-live="polite"></p><div class="mbg-actions"><button type="button" id="mbg-prev">السابق</button><span id="mbg-count"></span><button type="button" id="mbg-next">التالي</button><button type="button" id="mbg-focus" aria-pressed="false" title="اختيار عنصر من الصفحة لإبرازه">إبراز عنصر</button></div><small>أسئلة توجيهية للمدرس؛ لا تغيّر حلول الكتاب أو أمثلته.</small></div>`;
 document.body.append(wrap);
 const bar=wrap.querySelector('.mbg-stages');
 stages.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.textContent=s.name;b.addEventListener('click',()=>render(i));bar.append(b);});
 function render(i){step=Math.max(0,Math.min(stages.length-1,i));
  [...bar.children].forEach((b,j)=>{b.classList.toggle('active',j===step);b.setAttribute('aria-pressed',String(j===step));});
  $('mbg-hint').textContent=stages[step].hint;$('mbg-count').textContent=`${step+1} / ${stages.length}`;
  $('mbg-prev').disabled=step===0;$('mbg-next').disabled=step===stages.length-1;
 }
 $('mbg-prev').addEventListener('click',()=>render(step-1));$('mbg-next').addEventListener('click',()=>render(step+1));
 $('mbg-min').addEventListener('click',()=>{minimized=!minimized;wrap.classList.toggle('minimized',minimized);$('mbg-min').textContent=minimized?'+':'−';$('mbg-min').setAttribute('aria-label',minimized?'فتح دليل الإيضاح':'طي دليل الإيضاح');});
 const focusBtn=$('mbg-focus');
 function stopFocus(){focusMode=false;document.body.classList.remove('mbg-pick');focusBtn.setAttribute('aria-pressed','false');focusBtn.textContent='إبراز عنصر';}
 focusBtn.addEventListener('click',()=>{if(focusMode){stopFocus();return;}focusMode=true;document.body.classList.add('mbg-pick');focusBtn.setAttribute('aria-pressed','true');focusBtn.textContent='إلغاء الاختيار';});
 document.addEventListener('click',event=>{if(!focusMode||event.target.closest('#mbGuide')||event.target.closest('#mbTools'))return;
  const target=event.target.closest('.card,.eq,.formula,.diagram,canvas,svg,.graph,.lab,.text,.page');
  if(!target)return;
  document.querySelectorAll('.mbg-spotlight').forEach(x=>x.classList.remove('mbg-spotlight'));
  target.classList.add('mbg-spotlight');stopFocus();
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){stopFocus();document.querySelectorAll('.mbg-spotlight').forEach(x=>x.classList.remove('mbg-spotlight'));}});
 function update(){const active=document.body.classList.contains('mb-presentation');wrap.classList.toggle('visible',active);if(!active){stopFocus();document.querySelectorAll('.mbg-spotlight').forEach(x=>x.classList.remove('mbg-spotlight'));}
  const heading=document.querySelector('#tBoard h1,#tBoard h2,#tBoard h3,.page h2,.page h3');
  $('mbg-context').textContent=(heading?.textContent||'').trim().slice(0,55);
 }
 const observer=new MutationObserver(update);observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 $('tNext')?.addEventListener('click',()=>{render(0);setTimeout(update,80);});
 $('tPrev')?.addEventListener('click',()=>{render(0);setTimeout(update,80);});
 render(0);update();
})();
