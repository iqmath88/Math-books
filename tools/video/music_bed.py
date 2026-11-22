# موسيقى خلفية هادئة لفيديو طويل: وسادة أوتار تتغير عند بداية كل فصل، ونقرة جرس خفيفة على كل فصل، بلا عينات.
# usage: python3 tools/video/music_bed.py out.wav D t1 t2 ...   (D = المدة بالثواني، t = أزمنة بدايات الفصول)
# مستواها منخفض (−14 dBFS قمة) لأن الصوت المسجَّل سيوضع فوقها.
import numpy as np, wave, sys
from scipy.signal import lfilter
SR=48000; out=sys.argv[1]; D=float(sys.argv[2]); cuts=[float(x) for x in sys.argv[3:]]
n=int(SR*D); t=np.arange(n)/SR
hz=lambda m:440*2**((m-69)/12)
PROG=[[45,52,57,60,64],[41,48,53,57,60],[48,55,60,64,67],[43,50,55,59,62]]
bounds=sorted(set([0.0]+cuts+[D]))
Lc=np.zeros(n); Rc=np.zeros(n)
for k in range(len(bounds)-1):
    a,b=bounds[k],bounds[k+1]; notes=PROG[k%4]
    env=np.clip((t-a+1.5)/2.0,0,1)*np.clip((b+1.5-t)/2.0,0,1); env=env*env*(3-2*env)
    i0=max(0,int((a-2)*SR)); i1=min(n,int((b+2)*SR)); tt=t[i0:i1]; e=env[i0:i1]
    for j,m in enumerate(notes):
        f=hz(m); amp=0.1/(1+0.4*j)
        for det,pan in ((-0.002,0.35),(0.002,0.65)):
            ph=2*np.pi*f*(1+det)*tt; w=np.sin(ph)+0.15*np.sin(2*ph)
            Lc[i0:i1]+=amp*e*w*(1-pan); Rc[i0:i1]+=amp*e*w*pan
trem=0.88+0.12*np.sin(2*np.pi*0.13*t); Lc*=trem; Rc*=trem
def chime(at,base,g):
    i=int(at*SR); m=min(n-i,int(3*SR)); tt=np.arange(m)/SR
    return i,m,g*sum(gg*np.sin(2*np.pi*base*r*tt)*np.exp(-tt*dk) for r,gg,dk in ((1,1,2),(2.01,.4,3.4),(3.02,.18,5)))
for k,c in enumerate([0.3]+cuts):
    if c>=D-1: continue
    i,m,s=chime(c,hz([81,84,79,86][k%4]),0.07); Lc[i:i+m]+=s*.6; Rc[i:i+m]+=s*.4
def rev(x):
    y=x.copy()
    for dly,g in ((0.0297,.45),(0.0371,.41),(0.0411,.38),(0.0437,.35)):
        d=int(dly*SR); z=np.zeros(n)                       # feedback comb z[k] = x[k] + g·z[k−d], a block of d at a time
        z[:d]=x[:d]
        for k in range(d,n,d): m=min(d,n-k); z[k:k+m]=x[k:k+m]+g*z[k-d:k-d+m]
        y+=0.16*z
    return y
Lc=rev(Lc); Rc=rev(Rc)
b0=1-np.exp(-2*np.pi*4200/SR); Lc=lfilter([b0],[1,-(1-b0)],Lc); Rc=lfilter([b0],[1,-(1-b0)],Rc)
fade=np.clip(t/1.5,0,1)*np.clip((D-t)/3,0,1); Lc*=fade; Rc*=fade
pk=max(abs(Lc).max(),abs(Rc).max()); Lc*=0.2/pk; Rc*=0.2/pk
pcm=(np.stack([Lc,Rc],1)*32767).astype('<i2')
with wave.open(out,'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok',D)
