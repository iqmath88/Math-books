import json,sys,glob,os
import os as _os
HERE=_os.path.dirname(_os.path.abspath(__file__))
OUT=_os.path.join(HERE,'..','v2')+'/'
META={
 'g12c4':dict(grade='السادس العلمي',chapter='الفصل الرابع',title='التكامل',classic='',
   desc='المناطق تحت المنحنيات، المجاميع العليا والسفلى، تعريف التكامل، النظرية الأساسية والدالة المقابلة، الخواص، التكامل غير المحدد، اللوغاريتم الطبيعي، المساحات، والحجوم الدورانية.'),
 'g12c3':dict(grade='السادس العلمي',chapter='الفصل الثالث',title='تطبيقات التفاضل',classic='../g12c3.html',
   desc='المعدلات المرتبطة، مبرهنتا رول والقيمة المتوسطة، التقريب، التزايد والتناقص، النهايات المحلية، التقعر، رسم المخطط البياني، والتطبيقات العملية.'),
 'ch3':dict(grade='الخامس العلمي',chapter='الفصل الثالث',title='القطوع المخروطية',classic='../ch3.html',
   desc='المخروط الدائري ومقاطعه، ثم الدائرة: معادلتها القياسية والعامة، الدائرة التي تمس المحورين، الدائرة التي تحقق شروطاً، ومماس الدائرة.'),
 'g9c1':dict(grade='الثالث المتوسط',chapter='الفصل الأول',title='العلاقات والمتباينات في الأعداد الحقيقية',classic='../g9c1.html',desc='ترتيب العمليات وتنسيب المقام، التطبيقات وأنواعها وتركيبها، المتباينات المركبة، ومتباينات القيمة المطلقة.'),
 'g9c5':dict(grade='الثالث المتوسط',chapter='الفصل الخامس',title='الهندسة والقياس',classic='../g9c5.html',desc='المضلعات المنتظمة والهرم والمخروط، أضلاع المثلث وزواياه، التشابه والتناسب، القوس والوتر والمماس، المثلث والدائرة، والزوايا في الدائرة.'),
 'ch4':dict(grade='الخامس العلمي',chapter='الفصل الرابع',title='الدوال الدائرية',classic='../ch4.html',desc='التطبيق اللاف ودائرة الوحدة، القياس الرئيس، الدوال الست وإشاراتها، الزوايا المنتسبة، المجموع والفرق، المعادلات المثلثية، ورسم المنحنيات.'),
 'ch5':dict(grade='الخامس العلمي',chapter='الفصل الخامس',title='الغاية والاستمرارية',classic='../ch5.html',desc='جوار العدد، غاية الدالة من اليسار واليمين، مبرهنات الغاية، غاية الدوال الدائرية، والاستمرارية.'),
 'ch6':dict(grade='الخامس العلمي',chapter='الفصل السادس',title='المشتقات',classic='../ch6.html',desc='التفسير الهندسي للمشتقة، التعريف، الحركة، قابلية الاشتقاق، القواعد، قاعدة السلسلة، المماس والعمود، الاشتقاق الضمني، ومشتقات الدوال الدائرية.'),
}
CONV=_os.path.join(HERE,'conv')+'/'
_os.chdir(HERE)
WXS='''
function wxScenes(WXD,S,WXT){ for(const set in WXD) WXD[set].forEach(E=>{ for(let i=0;i<E.st.length;i++){ const F=typeof E.f==='function'?E.f(i):E.f; if(!F) continue;
  S[E.q+'-'+i]={v:[F.x0,F.x1,F.y0,F.y1],eq:F.eq,spec:F,title:(WXT&&WXT[E.q])||('مثال '+E.l),hint:F.hint||''}; } }); }
'''
def build(cid):
    m=META[cid]; sc=open(f'{cid}.scenes.js').read()
    if os.path.exists(CONV+cid+'.xf.json'):
        sc+='\n{ const XF=JSON.parse(%s); for(const k in XF) S["xf-"+k]={fig:XF[k],k:99,title:"تمرين",hint:"حلّ في دفترك ثم أظهر الحل"}; }\n' % json.dumps(open(CONV+cid+'.xf.json').read())
    if '//@G9' in sc:
        g9=open(CONV+cid+'.g9.json').read()
        sc=sc.replace('//@G9','''{ const G9=JSON.parse(%s); const INFV=v=>v==='inf'?Infinity:v==='-inf'?-Infinity:v;
  for(const k in G9.sc){ const o=G9.sc[k]; if(!o) continue; if(o.nl) o.nl.rows.forEach(r=>r.I=r.I.map(x=>x.map(INFV))); if(o.val!==undefined) Object.assign(o,valScene(o)); if(o.figq) o.fig=G9.F[o.figq]; S[k]=o; } }''' % json.dumps(g9))
    if '//@WX' in sc: sc=sc.replace('//@WX',WXS+'{\n'+open(CONV+cid+'.wx.js').read()+'\nwxScenes(WXD,S,WXT);\n}')
    parts=sorted(glob.glob(f'{cid}.l*.txt'),key=lambda p:int(p.split('.l')[1].split('.')[0]))
    src='\n'.join(open(p).read() for p in parts)
    import re
    if os.path.exists(CONV+cid+'.ex.txt'):
        ex={}; cur=None
        for line in open(CONV+cid+'.ex.txt').read().split('\n'):
            mm=re.match(r'^>>> (\S+)-0 \+$',line)
            if mm: cur=mm.group(1); ex[cur]=[]
            if cur: ex[cur].append(line)
        def inc(m):
            out=[]
            for q in m.group(1).split():
                if q not in ex: raise SystemExit('missing example '+q)
                out.append('\n'.join(ex[q]).rstrip())
            return '\n'.join(out)
        src=re.sub(r'^@@ex (.+)$',inc,src,flags=re.M)
    if os.path.exists(CONV+cid+'.xr.txt'):
        xr={}; cur=None
        for line in open(CONV+cid+'.xr.txt').read().split('\n'):
            mm=re.match(r'^--- (\S+)$',line)
            if mm: cur=mm.group(1); xr[cur]=[]; continue
            if line.startswith('// UNUSED'): continue
            if cur: xr[cur].append(line)
        src=re.sub(r'^@@xr (.+)$',lambda m:'\n'.join('\n'.join(xr[k]).strip() for k in m.group(1).split()),src,flags=re.M)
    js=f"/* {m['grade']} · {m['chapter']} · {m['title']} — مولَّد من المصدر، لا تعدّله يدوياً */\n(function(){{\n\"use strict\";\n{sc}\nwindow.BOOK=Object.assign({json.dumps(dict(id=cid,**m),ensure_ascii=False)},{{S,F:typeof F!=='undefined'?F:{{}},G:typeof GEN!=='undefined'?GEN:{{}},src:{json.dumps(src,ensure_ascii=False)}}});\n}})();\n"
    open(OUT+cid+'.js','w').write(js)
    html=f'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{m['title']} – الرياضيات الحيّة</title>
<meta name="theme-color" content="#0f1729">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="../manifest.webmanifest">
<link rel="icon" href="../favicon.png">
<link rel="stylesheet" href="lib/katex/katex.min.css">
<link rel="stylesheet" href="engine.css">
<script src="lib/katex/katex.min.js"></script>
</head>
<body>
<noscript>هذا الكتاب يحتاج إلى تفعيل JavaScript.</noscript>
<script src="{cid}.js"></script>
<script src="engine.js"></script>
</body>
</html>
'''
    open(OUT+cid+'.html','w').write(html)
    print(cid, len(js), 'bytes', len(parts),'parts')
for c in (sys.argv[1:] or META): build(c)
