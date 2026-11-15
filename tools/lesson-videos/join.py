"""Join the parts of a lesson video and write its timed narration script.
usage: python3 tools/lesson-videos/join.py <dir with A.mp4 A.timeline.json …> <out.mp4> <narration.json> PART [PART …]
writes <out>.mp4 (parts joined with -c copy), <out>.narration.txt (for recording) and <out>.srt (captions)."""
import json, subprocess, sys, os
D, out, narr, parts = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3])), sys.argv[4:]
dur = lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
lst = os.path.join(D, 'concat.txt'); open(lst,'w').write(''.join(f"file '{os.path.abspath(os.path.join(D,p+'.mp4'))}'\n" for p in parts))
subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy','-movflags','+faststart',out],check=True)
ts = lambda s: f"{int(s//3600):02d}:{int(s%3600//60):02d}:{int(s%60):02d},{int(round((s%1)*1000))%1000:03d}"
mm = lambda s: f"{int(s//60):02d}:{s%60:05.2f}"
off, rows, srt, n = 0.0, [], [], 0
for p in parts:
    tl = json.load(open(os.path.join(D, p+'.timeline.json')))
    for x in tl:
        a, b = off+x['start'], off+x['start']+x['len']
        if x['page'] in ('title','end'): rows.append(f"[{mm(a)} → {mm(b)}]  ({'شاشة العنوان' if x['page']=='title' else 'شاشة الختام'} — بلا كلام)"); continue
        say = narr.get(x['page'], '')
        rows.append(f"[{mm(a)} → {mm(b)}]  {x['page']}\n{say or '(بلا كلام)'}")
        if say: n+=1; srt.append(f"{n}\n{ts(a+0.3)} --> {ts(b-0.3)}\n{say}\n")
    off += dur(os.path.join(D, p+'.mp4'))
base = out[:-4]
open(base+'.narration.txt','w',encoding='utf8').write("نص التعليق الصوتي — مُؤقَّت على الفيديو\nكل فقرة تبدأ عند التوقيت المكتوب، ومدة الشاشة تتسع لقراءتها بهدوء (نحو كلمتين في الثانية).\n\n"+"\n\n".join(rows)+"\n")
open(base+'.srt','w',encoding='utf8').write("\n".join(srt))
print('total', round(off,1), 's ; narrated pages', n)
