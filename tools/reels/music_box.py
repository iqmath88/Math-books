# موسيقى ريلز أكبر صندوق (مثال 2 ص 141) — تولَّد برمجياً بلا عينات؛ الأزمنة مطابقة لمشاهد v2/reels/box.js.
# usage: python3 tools/reels/music_box.py out.wav
# Soft ambient pads that change with each scene, chimes on the key moments, a soft pulse under the payoff sweep, fade in/out.
import numpy as np, wave, sys
SR=48000; D=82.0; n=int(SR*D); t=np.arange(n)/SR
def hz(m): return 440*2**((m-69)/12)
chords=[(0, 4.55, [45, 52, 57, 60, 64]), (4.55, 15.55, [50, 57, 62, 65, 69]), (15.55, 24.8, [41, 48, 53, 57, 60]), (24.8, 36.8, [48, 55, 60, 64, 67]), (36.8, 50.4, [43, 50, 55, 59, 62]), (50.4, 62.4, [45, 52, 57, 60, 64]), (62.4, 73.4, [41, 48, 53, 57, 60]), (73.4, 77.4, [48, 55, 60, 64, 67]), (77.4, 82.0, [45, 52, 57, 60, 64])]
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
for k in np.arange(65.0,73.4,0.5):
    i=int(k*SR); m=min(n-i,int(0.35*SR)); tt=np.arange(m)/SR
    beat[i:i+m]+=0.10*np.exp(-tt*16)*np.sin(2*np.pi*(62+40*np.exp(-tt*30))*tt)
L+=beat; Rr+=beat
# chimes
def chime(at,base,gain):
    i=int(at*SR); m=min(n-i,int(2.6*SR)); tt=np.arange(m)/SR
    s=sum(g*np.sin(2*np.pi*base*r*tt)*np.exp(-tt*dk) for r,g,dk in ((1,1,2.2),(2.01,.45,3.5),(3.02,.2,5)))
    return i,m,gain*s
for at,base,g,pan in ((0.250,hz(81),0.09,0.4),(4.55,hz(74),0.06,0.5),(15.55,hz(77),0.07,0.6),(19.3,hz(88),0.04,0.5),(24.8,hz(84),0.07,0.4),(25.2,hz(88),0.05,0.5),(36.8,hz(79),0.07,0.6),(44.0,hz(88),0.08,0.5),(46.2,hz(83),0.06,0.5),(50.4,hz(81),0.07,0.4),(55.4,hz(88),0.1,0.5),(55.85,hz(93),0.07,0.5),(58.2,hz(86),0.06,0.5),(62.4,hz(77),0.07,0.6),(73.6,hz(88),0.1,0.5),(74.05,hz(93),0.07,0.5),(77.4,hz(84),0.09,0.5),(78.0,hz(88),0.07,0.5)):
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
