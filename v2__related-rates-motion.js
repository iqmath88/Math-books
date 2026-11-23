/* Math-books v1.28.0 — Related rates motion enhancement.
   An additive adapter for sixth-grade related-rate ladder scenes.
   No changes to the lesson parser, layouts, other chapters, or original questions. */
(()=>{'use strict';
const B=window.BOOK;
if(!B||B.id!=='g12c3'||!B.S)return;
const names=['rDisc','rTry','rLadder','rLadder1','rLadder2','rLadder3'];
let active='', playing=false, speed=1, raf=0, previous=0, internalUpdate=false;
const $=s=>document.querySelector(s);
const svgNS='http://www.w3.org/2000/svg';
const fmt=(n,d=2)=>Number.isFinite(n)?(Math.abs(n)<1e-9?'0':n.toFixed(d).replace(/\.?0+$/,'')):'—';
const derivatives=x=>{const y=Math.sqrt(Math.max(0,100-x*x));return {x,y,dy:y>1e-8?-2*x/y:NaN,dth:y>1e-8?-2/y:NaN};};
const base={};
for(const name of names){
  const scene=B.S[name];if(!scene||typeof scene.draw!=='function')continue;
  base[name]=scene.draw;
  scene.draw=function(A){
    active=name; base[name].call(this,A);
    const isTime=name==='rDisc'||name==='rTry';
    const x=isTime?.5+2*A.p:A.p;
    if(!Number.isFinite(x)||x<=0||x>=10)return;
    const m=derivatives(x);
    if(name==='rLadder'||name==='rLadder1'||name==='rLadder2'||name==='rLadder3'){
      A.chips.push(['int','θ',fmt(Math.atan2(m.y,m.x)*180/Math.PI,1)+'°']);
    }
    const ns=(tag,attrs,text)=>{const e=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;A.svg.append(e);return e;};
    /* A small direction legend drawn in the existing scene; independent of layout. */
    if(A.W>390&&A.H>280){
      const right=A.W-13, top=A.H-13;
      ns('rect',{x:right-126,y:top-43,width:124,height:41,rx:8,fill:A.col.surf,stroke:A.col.line,'stroke-width':1,opacity:.94});
      ns('text',{x:right-8,y:top-28,'text-anchor':'end',fill:A.col.chord,'font-size':11,'font-weight':700},'dx/dt = +2 m/s →');
      ns('text',{x:right-8,y:top-11,'text-anchor':'end',fill:A.col.tan,'font-size':11,'font-weight':700},'dy/dt = '+fmt(m.dy,2)+' ↓');
    }
  };
  /* v1.32: playback is owned by the engine (▶/⏸ beside the slider, constant dx/dt = 2 m/s like every related-rates scene);
     this panel keeps the live readouts only. */
}
const panel=document.createElement('div');panel.id='rrMotion';panel.hidden=true;
panel.setAttribute('aria-label','أدوات حركة مسألة السلم');
panel.innerHTML=`<div class="rr-row"><button id="rrPlay" type="button" aria-label="تشغيل حركة السلم">▶ تشغيل</button><button id="rrReset" type="button">↺ إعادة</button><label>سرعة الحركة <select id="rrSpeed" aria-label="سرعة الحركة"><option value="0.5">½×</option><option value="1" selected>1×</option><option value="1.5">1½×</option><option value="2">2×</option></select></label></div><div class="rr-values" aria-live="off"><span id="rrX"></span><span id="rrY"></span><span id="rrDY"></span><span id="rrTH"></span></div><div id="rrExplain" class="rr-explain"></div>`;
const style=document.createElement('style');style.textContent=`#rrMotion{padding:10px 12px;margin-top:8px;border:1px solid var(--line);border-radius:12px;background:var(--surface2,#f4f5f6);color:var(--ink);font-size:12px;line-height:1.65}#rrMotion[hidden]{display:none!important}#rrMotion .rr-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}#rrMotion button,#rrMotion select{font:inherit;border:1px solid var(--line);border-radius:8px;background:var(--surface,#fff);color:var(--ink);padding:6px 9px;min-height:34px;cursor:pointer}#rrMotion label{display:inline-flex;align-items:center;gap:5px}#rrMotion .rr-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin-top:8px;font-variant-numeric:tabular-nums}#rrMotion .rr-values span{border-radius:7px;padding:4px 6px;background:var(--surface,#fff);white-space:normal}#rrMotion .rr-explain{margin-top:7px;color:var(--ink2);line-height:1.8}#rrMotion .rr-row button:focus-visible,#rrMotion select:focus-visible{outline:2px solid var(--accent,#2563eb);outline-offset:2px}@media(max-width:380px){#rrMotion .rr-values{grid-template-columns:1fr}}`;
style.textContent+='#rrPlay,#rrReset,#rrMotion label:has(#rrSpeed){display:none!important}';
/* v1.80: the four value cells repeat the scene chips (x , y , dy/dt , dθ/dt) and the live equation row — hidden; the sign explanation stays.
   This gives the drawing back its height on iPad. The cells stay in the DOM (refresh() still fills them). */
style.textContent+='#rrMotion .rr-row,#rrMotion .rr-values{display:none!important}#rrMotion{padding:7px 12px;margin-top:6px}';document.head.append(style);const hint=$('#hint');if(!hint)return;hint.after(panel);
const slider=$('#slI'), title=$('#figTitle'), play=$('#rrPlay');
const stop=()=>{playing=false;play.textContent='▶ تشغيل';play.setAttribute('aria-label','تشغيل حركة السلم');if(raf){cancelAnimationFrame(raf);raf=0;}previous=0;};
const isLadder=()=>Object.hasOwn(base,active)&&title&&/سلّم|سلم/.test(title.textContent||'');
const currentX=()=>{const v=Number(slider.value);return active==='rDisc'||active==='rTry'?.5+2*v:v;};
function refresh(){
  const enabled=isLadder()&&!$('#sl').hidden;
  panel.hidden=!enabled;if(!enabled){stop();return;}
  const m=derivatives(currentX());
  $('#rrX').textContent='x = '+fmt(m.x,2)+' m';
  $('#rrY').textContent='y = '+fmt(m.y,2)+' m';
  $('#rrDY').textContent='dy/dt = '+fmt(m.dy,3)+' m/s';
  $('#rrTH').textContent='dθ/dt = '+fmt(m.dth,3)+' rad/s';
  $('#rrExplain').textContent=m.y<.05?'قرب الأرض يصبح معدل الهبوط كبيراً جداً في النموذج المثالي؛ عملياً لا يستمر تماس السلم مع الحائط حتى هذه اللحظة.':m.dy<0?'الإشارة السالبة تعني أن ارتفاع السلم والزاوية يتناقصان، بينما تبتعد القاعدة عن الحائط.':'حركة السلم مرتبطة بالعلاقة x² + y² = 100.';
}
function setValue(n){internalUpdate=true;slider.value=String(Math.max(+slider.min,Math.min(+slider.max,n)));slider.dispatchEvent(new Event('input',{bubbles:true}));internalUpdate=false;refresh();}
function tick(ts){raf=0;if(!playing)return;if(!isLadder()){stop();return;}if(!previous)previous=ts;
  const dt=Math.min(.05,(ts-previous)/1000);previous=ts;
  const lo=+slider.min,hi=+slider.max;
  /* Traverse the physical horizontal position at dx/dt=2m/s; do not use a sinusoidal fake motion. */
  const step=2*dt*speed/(active==='rDisc'||active==='rTry'?2:1);
  let next=+slider.value+step;
  if(next>=hi){next=hi;setValue(next);stop();return;}
  setValue(next);raf=requestAnimationFrame(tick);
}
play.onclick=()=>{if(playing){stop();return;}if(!isLadder())return;if(+slider.value>=+slider.max-.001)setValue(+slider.min);playing=true;previous=0;play.textContent='Ⅱ إيقاف';play.setAttribute('aria-label','إيقاف حركة السلم');raf=requestAnimationFrame(tick);};
$('#rrReset').onclick=()=>{stop();setValue(active==='rDisc'||active==='rTry'?0:8);};
$('#rrSpeed').onchange=e=>{speed=Number(e.target.value)||1;};
slider.addEventListener('input',()=>{if(playing&&!internalUpdate)stop();refresh();});
/* Scene titles update when the scrollytelling engine advances. */
let lastTitle=title.textContent;new MutationObserver(()=>{const current=title.textContent;if(current!==lastTitle){lastTitle=current;stop();}queueMicrotask(refresh);}).observe(title,{childList:true,characterData:true,subtree:true});
const obs=new MutationObserver(()=>refresh());obs.observe($('#sl'),{attributes:true,attributeFilter:['hidden']});
document.addEventListener('mathbooks:scene-update',()=>{ if(isLadder()) refresh(); });
refresh();
})();
