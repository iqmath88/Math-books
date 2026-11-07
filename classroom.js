/* v1.2.0 classroom utilities: non-destructive overlay, no math content changes */
(()=>{'use strict';
 const toolbar=document.createElement('aside');toolbar.id='mbTools';toolbar.setAttribute('aria-label','أدوات العرض الصفي');
 toolbar.innerHTML='<span id="mbStatus" role="status">أدوات العرض</span>'+
 '<button id="mbPen" type="button" aria-pressed="false" title="الكتابة على الشاشة">✎ قلم</button>'+
 '<button id="mbErase" type="button" aria-pressed="false">⌫ ممحاة</button>'+
 '<button id="mbRed" class="mb-color" style="background:#e44949" type="button" aria-label="قلم أحمر" aria-pressed="true"></button>'+
 '<button id="mbBlue" class="mb-color" style="background:#2878e4" type="button" aria-label="قلم أزرق" aria-pressed="false"></button>'+
 '<button id="mbClear" type="button">مسح الرسم</button>'+
 '<button id="mbFocus" type="button" aria-pressed="false">تركيز</button>'+
 '<button id="mbZoom" type="button" aria-pressed="false">تكبير</button>'+
 '<button id="mbFull" type="button">ملء الشاشة</button>'+
 '<button id="mbHide" type="button" aria-label="إخفاء أدوات العرض">×</button>';
 const canvas=document.createElement('canvas');canvas.id='mbCanvas';canvas.setAttribute('aria-label','لوحة الكتابة');
 document.body.append(canvas,toolbar);
 const $=id=>document.getElementById(id),ctx=canvas.getContext('2d');
 let mode='off',color='#e44949',drawing=false,last=null,strokes=[],current=null;
 const status=t=>{$('mbStatus').textContent=t};
 const render=()=>{const dpr=Math.min(devicePixelRatio||1,3);const w=innerWidth,h=innerHeight;
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';
 for(const stroke of strokes){ctx.strokeStyle=stroke.color;ctx.lineWidth=stroke.width;ctx.beginPath();stroke.points.forEach((pt,i)=>i?ctx.lineTo(pt[0]*w,pt[1]*h):ctx.moveTo(pt[0]*w,pt[1]*h));if(stroke.points.length===1){let pt=stroke.points[0];ctx.lineTo(pt[0]*w+.01,pt[1]*h+.01)}ctx.stroke()}
 };
 const switchMode=m=>{mode=mode===m?'off':m;canvas.classList.toggle('mbDrawing',mode!=='off');$('mbPen').setAttribute('aria-pressed',String(mode==='pen'));$('mbErase').setAttribute('aria-pressed',String(mode==='erase'));status(mode==='off'?'أدوات العرض':mode==='pen'?'القلم مفعل':'الممحاة مفعلة')};
 $('mbPen').onclick=()=>switchMode('pen');$('mbErase').onclick=()=>switchMode('erase');
 for(const [id,c] of [['mbRed','#e44949'],['mbBlue','#2878e4']]){$(id).onclick=()=>{color=c;for(const x of ['mbRed','mbBlue'])$(x).setAttribute('aria-pressed',String(x===id));mode='off';switchMode('pen')}}
 $('mbClear').onclick=()=>{strokes=[];render();status('تم مسح الرسم')};
 $('mbFocus').onclick=()=>{const active=document.body.classList.toggle('mb-focus');$('mbFocus').setAttribute('aria-pressed',String(active))};
 $('mbZoom').onclick=()=>{const active=document.body.classList.toggle('mb-bigtext');$('mbZoom').setAttribute('aria-pressed',String(active))};
 $('mbFull').onclick=async()=>{try{if(document.fullscreenElement){await document.exitFullscreen()}else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen()}else{status('ملء الشاشة غير مدعوم في هذا المتصفح')}}catch(_){status('تعذر تفعيل ملء الشاشة')}};
 $('mbHide').onclick=()=>{toolbar.hidden=true;toolbar.style.display='none';canvas.classList.remove('mbDrawing');mode='off';const restore=document.createElement('button');restore.textContent='✎ أدوات العرض';restore.id='mbRestore';restore.style.cssText='position:fixed;z-index:99990;bottom:75px;right:10px;background:#132a3b;color:#fff;border:1px solid #fff6;border-radius:12px;padding:12px;font:600 13px Tahoma';restore.onclick=()=>{toolbar.style.display='flex';toolbar.hidden=false;restore.remove()};document.body.append(restore)};
 canvas.addEventListener('pointerdown',e=>{if(mode==='off')return;e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;const pt=[e.clientX/innerWidth,e.clientY/innerHeight];if(mode==='erase'){strokes=strokes.filter(s=>!s.points.some(p=>Math.hypot((p[0]-pt[0])*innerWidth,(p[1]-pt[1])*innerHeight)<24));render()}else{current={color,width:3.5,points:[pt]};strokes.push(current);render()}});
 canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const pt=[e.clientX/innerWidth,e.clientY/innerHeight];if(mode==='erase'){strokes=strokes.filter(s=>!s.points.some(p=>Math.hypot((p[0]-pt[0])*innerWidth,(p[1]-pt[1])*innerHeight)<24))}else if(current){current.points.push(pt)}render()});
 const end=()=>{drawing=false;current=null};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 window.addEventListener('resize',render);window.addEventListener('orientationchange',render);render();
 // Keep marks aligned with the currently visible lesson: clear on navigation.
 for(const id of ['bPrev','bNext','tPrev','tNext']){const btn=$(id);if(btn)btn.addEventListener('click',()=>{strokes=[];render()})}
})();
