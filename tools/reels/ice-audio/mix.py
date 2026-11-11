"""Ice-covered cube reel (book ex. 3 p.93) — narration timeline + music/sfx mix for one MODE.
usage: python3 mix.py <clips dir with <key>.wav> <full|short>
writes <dir>/mix-<mode>.wav and ../ice.timeline.<mode>.js (window.TL = [[key,start,dur],...], window.TL_END)"""
import json, subprocess, sys, os
D, MODE = sys.argv[1], sys.argv[2]
ORDER = {'full':['hook','q','ask','model','vol','deriv','sub','res','mean','close']}[MODE]
GAP = {'hook':0.8,'q':0.4,'ask':0.8,'model':0.8,'vol':0.8,'deriv':0.8,'sub':1.0,'res':0.8,'mean':0.8}
run = lambda *a: subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *a], check=True)
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
t, TL = 0.4, []
for k in ORDER:
    d = dur(f'{D}/{k}.wav'); TL.append([k, round(t, 3), round(d, 3)]); t += d + GAP.get(k, 0.5)
T = round(TL[-1][1] + TL[-1][2] + 1.6, 2)
here = os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here, '..', f'ice.timeline.{MODE}.js'), 'w').write(f'window.TL={json.dumps(TL)};window.TL_END={T};\n')
print(MODE, 'duration', T); print(TL)
S = {k: s for k, s, _ in TL}
ins, fl = [], []
for i, (k, s, _) in enumerate(TL):
    ins += ['-i', f'{D}/{k}.wav']; ms = int(s * 1000); fl.append(f'[{i}:a]aresample=48000,adelay={ms}|{ms}[v{i}]')
N = len(TL)
fl.append(''.join(f'[v{i}]' for i in range(N)) + f'amix=inputs={N}:normalize=0,apad=whole_dur={T},atrim=0:{T},highpass=f=70,'
          'acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7[vo]')
run(*ins, '-filter_complex', ';'.join(fl), '-map', '[vo]', '-ac', '1', '-ar', '48000', f'{D}/voice-{MODE}.wav')
chord = lambda fr: '+'.join(f'0.09*sin(2*PI*{f}*t)+0.03*sin(2*PI*{f*2.003}*t)' for f in fr)
q = T / 4
segs = [(0, q, [110, 164.81, 220, 261.63, 329.63]), (q, 2*q, [87.31, 130.81, 174.61, 220, 261.63]),
        (2*q, 3*q, [130.81, 196, 261.63, 329.63, 392]), (3*q, T, [98, 146.83, 196, 246.94, 293.66])]
expr = '+'.join(f'between(t,{a:.2f},{b:.2f})*({chord(fr)})' for a, b, fr in segs)
run('-f', 'lavfi', '-i', f"aevalsrc='{expr}':s=48000:d={T}", '-af',
    f'lowpass=f=1400,tremolo=f=0.25:d=0.25,aecho=0.8:0.7:120|260:0.35|0.25,afade=t=in:d=2,afade=t=out:st={T-3}:d=3,volume=0.5', '-ac', '1', f'{D}/pad-{MODE}.wav')
sfx, fx = [], []
whoosh = [S[k] - 0.3 for k in ('model', 'deriv', 'mean')]
for i, t0 in enumerate(whoosh):
    sfx += ['-f', 'lavfi', '-t', '1.2', '-i', 'anoisesrc=color=pink:a=0.5:d=1.2:r=48000']; ms = int(t0 * 1000)
    fx.append(f'[{i}:a]bandpass=f=900:w=1.2,afade=t=in:d=0.45:curve=exp,afade=t=out:st=0.45:d=0.75,volume=0.2,adelay={ms}|{ms}[w{i}]')
n = len(fx)
pings = [S['res'] + 0.4]
for j, t0 in enumerate(pings):
    sfx += ['-f', 'lavfi', '-t', '1', '-i', 'sine=f=1318.5:r=48000:d=1']; ms = int(t0 * 1000)
    fx.append(f'[{n+j}:a]afade=t=out:st=0:d=0.9:curve=exp,volume=0.12,adelay={ms}|{ms}[p{j}]')
fx.append(''.join(f'[w{i}]' for i in range(n)) + ''.join(f'[p{j}]' for j in range(len(pings))) + f'amix=inputs={n+len(pings)}:normalize=0,apad=whole_dur={T},atrim=0:{T}[s]')
run(*sfx, '-filter_complex', ';'.join(fx), '-map', '[s]', '-ac', '1', f'{D}/sfx-{MODE}.wav')
run('-i', f'{D}/voice-{MODE}.wav', '-i', f'{D}/pad-{MODE}.wav', '-i', f'{D}/sfx-{MODE}.wav', '-filter_complex',
    '[0:a]asplit[v1][v2];[1:a][v2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[pd];'
    '[v1][pd][2:a]amix=inputs=3:normalize=0:weights=1 0.3 1,alimiter=limit=0.95,loudnorm=I=-15:TP=-1.5:LRA=9[m]',
    '-map', '[m]', '-ac', '2', '-ar', '48000', f'{D}/mix-{MODE}.wav')
