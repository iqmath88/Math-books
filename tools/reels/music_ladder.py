# موسيقى ريلز السلم (مثال 4 ص 94) — تولَّد برمجياً بلا عينات؛ الأزمنة مطابقة لمشاهد v2/reels/ladder.js.
# usage: python3 tools/reels/music_ladder.py out.wav
# Soft ambient bed for the 30 s ladder Reel: Am – F – C – G pads aligned to the 4 cards (0, 7, 15, 23 s),
# gentle chimes on each card and on the stop at x = 3 m, a soft pulse under the motion, fade in/out. Synthesized, no samples.
import numpy as np, wave, sys
SR=48000; D=73.1333; n=int(SR*D); t=np.arange(n)/SR
def hz(m): return 440*2**((m-69)/12)
chords=[(0, 4.6, [45, 52, 57, 60, 64]), (4.6, 16.6, [50, 57, 62, 65, 69]), (16.6, 21.033, [41, 48, 53, 57, 60]), (21.033, 29.233, [48, 55, 60, 64, 67]), (29.233, 43.433, [43, 50, 55, 59, 62]), (43.433, 56.233, [45, 52, 57, 60, 64]), (56.233, 65.733, [41, 48, 53, 57, 60]), (65.733, 69.933, [48, 55, 60, 64, 67]), (69.933, 73.133, [45, 52, 57, 60, 64])]
L=np.zeros(n); Rr=np.zeros(n)
for a,b,notes in chords:
    env=np.clip((t-a+1.2)/1.6,0,1)*np.clip((b+1.2-t)/1.6,0,1); env=env*env*(3-2*env)
    for i,m in enumerate(notes):
        f=hz(m); amp=0.11/(1+0.35*i)
        for det,pan in ((-0.0025,0.35),(0.0025,0.65)):
            ph=2*np.pi*f*(1+det)*t
            w=np.sin(ph)+0.18*np.sin(2*ph)+0.06*np.sin(3*ph)
            L+=amp*env*w*(1-pan); Rr+=amp*env*w*pan
# slow movement in the pad
trem=0.86+0.14*np.sin(2*np.pi*0.18*t); L*=trem; Rr*=trem[::-1]
# soft pulse (heartbeat of the motion) 4–21 s
beat=np.zeros(n)
for k in np.arange(57.833,64.833,0.5):
    i=int(k*SR); m=min(n-i,int(0.35*SR)); tt=np.arange(m)/SR
    beat[i:i+m]+=0.10*np.exp(-tt*16)*np.sin(2*np.pi*(62+40*np.exp(-tt*30))*tt)
L+=beat; Rr+=beat
# chimes
def chime(at,base,gain):
    i=int(at*SR); m=min(n-i,int(2.6*SR)); tt=np.arange(m)/SR
    s=sum(g*np.sin(2*np.pi*base*r*tt)*np.exp(-tt*dk) for r,g,dk in ((1,1,2.2),(2.01,.45,3.5),(3.02,.2,5)))
    return i,m,gain*s
for at,base,g,pan in ((0.250,hz(81),0.09,0.4),(4.600,hz(74),0.06,0.5),(16.600,hz(77),0.07,0.6),(21.033,hz(84),0.07,0.4),(22.433,hz(88),0.035,0.5),(24.033,hz(88),0.035,0.5),(25.433,hz(88),0.035,0.5),(26.833,hz(86),0.05,0.5),(29.233,hz(79),0.07,0.6),(29.833,hz(88),0.035,0.5),(31.433,hz(88),0.035,0.5),(33.633,hz(88),0.035,0.5),(35.533,hz(88),0.035,0.5),(37.133,hz(88),0.035,0.5),(38.833,hz(88),0.1,0.5),(39.283,hz(93),0.07,0.5),(43.433,hz(81),0.07,0.4),(44.233,hz(88),0.035,0.5),(45.833,hz(88),0.035,0.5),(47.633,hz(88),0.035,0.5),(49.433,hz(88),0.035,0.5),(51.233,hz(88),0.1,0.5),(51.683,hz(93),0.07,0.5),(56.233,hz(77),0.07,0.6),(65.733,hz(84),0.09,0.5),(66.333,hz(88),0.07,0.5),(69.933,hz(81),0.08,0.4),(70.433,hz(86),0.06,0.6)):
    i,m,s=chime(at,base,g); L[i:i+m]+=s*(1-pan)*1.4; Rr[i:i+m]+=s*pan*1.4
# light reverb (feedback combs) and one-pole low-pass
def rev(x):
    y=x.copy()
    for dly,g in ((0.0297,.42),(0.0371,.38),(0.0411,.35),(0.0437,.33)):
        d=int(dly*SR); z=np.zeros(n)
        for k in range(0,n,d):  # vectorised block feedback
            xs=x[k:k+d]; seg=xs + (g*z[k-d:k-d+len(xs)] if k>=d else 0)
            z[k:k+len(seg)]=seg
        y+=0.18*z
    return y
L=rev(L); Rr=rev(Rr)
def lp(x,fc=5200):
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); acc=0.0
    for i in range(0,len(x),4096):
        blk=x[i:i+4096]; out=np.empty_like(blk)
        for j,v in enumerate(blk): acc=(1-a)*v+a*acc; out[j]=acc
        y[i:i+4096]=out
    return y
L=lp(L); Rr=lp(Rr)
fade=np.clip(t/0.4,0,1)*np.clip((D-t)/2.6,0,1)
L*=fade; Rr*=fade
pk=max(np.abs(L).max(),np.abs(Rr).max()); L*=0.5/pk; Rr*=0.5/pk   # peak −6 dBFS
st=np.stack([L,Rr],1); pcm=(st*32767).astype('<i2')
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', D, 's')
