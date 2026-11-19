"""Reel · idea 1 (book ex. 1 p.92) — narration timeline + original pad + light SFX.
usage: python3 cinema/idea1-reel/mix.py <clips dir with <key>.wav>
writes <dir>/mix.wav and cinema/idea1-reel/timeline.js (window.TL = [[key,start,dur],...], window.TL_END, window.SFX)
Every visual beat in index.html is keyed to these starts, so picture and sound share one clock."""
import json, subprocess, sys, os
D = sys.argv[1]
ORDER = ['h1', 'p1', 'p2', 'p3', 't1', 't2', 'r1', 'r2', 'r3', 's1', 's2', 's3', 'y1', 'e1']
START = 0.9                                          # hook: light sweep + hit first, then the voice
GAP = {'h1': 0.9, 'p1': 0.35, 'p2': 0.45, 'p3': 0.8, 't1': 0.4, 't2': 0.5, 'r1': 0.6, 'r2': 0.4, 'r3': 0.6,
       's1': 0.35, 's2': 0.45, 's3': 0.9, 'y1': 0.7}
TAIL = 3.2                                           # end title + loop back to the hook frame
run = lambda *a: subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *a], check=True)
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
t, TL = START, []
for k in ORDER:
    d = dur(f'{D}/{k}.wav'); TL.append([k, round(t, 3), round(d, 3)]); t += d + GAP.get(k, 0.5)
T = round(TL[-1][1] + TL[-1][2] + TAIL, 2)
S = {k: s for k, s, _ in TL}
# sound design cues (seconds) — the page reads the same list to time the matching motion
SFX = {'hit': [0.25], 'whoosh': [S['p1'] - 0.35, S['t1'] - 0.4, S['r2'] - 0.3, S['y1'] - 0.4, S['e1'] - 0.3],
       'tick': [S['p1'] + 0.5, S['p2'] + 1.0, S['p3'] + 0.6, S['t2'] + 0.4, S['r1'] + 0.2, S['r2'] + 0.9, S['s1'] + 0.6, S['s2'] + 0.5],
       'ping': [S['s3'] + 0.25]}
here = os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here, 'timeline.js'), 'w').write(
    f'window.TL={json.dumps(TL)};window.TL_END={T};window.SFX={json.dumps({k: [round(x, 3) for x in v] for k, v in SFX.items()})};\n')
print('duration', T); print(TL)
# voice
ins, fl = [], []
for i, (k, s, _) in enumerate(TL):
    ins += ['-i', f'{D}/{k}.wav']; ms = int(s * 1000); fl.append(f'[{i}:a]aresample=48000,adelay={ms}|{ms}[v{i}]')
N = len(TL)
fl.append(''.join(f'[v{i}]' for i in range(N)) + f'amix=inputs={N}:normalize=0,apad=whole_dur={T},atrim=0:{T},highpass=f=70,'
          'acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7[vo]')
run(*ins, '-filter_complex', ';'.join(fl), '-map', '[vo]', '-ac', '1', '-ar', '48000', f'{D}/voice.wav')
# original pad: four slow chords + a soft pulse (generated here, no third-party music)
chord = lambda fr: '+'.join(f'0.09*sin(2*PI*{f}*t)+0.03*sin(2*PI*{f*2.003}*t)' for f in fr)
segs = [(0, S['t1'], [110, 164.81, 220, 261.63, 329.63]), (S['t1'], S['s1'], [87.31, 130.81, 174.61, 220, 261.63]),
        (S['s1'], S['y1'], [98, 146.83, 196, 246.94, 293.66]), (S['y1'], T, [130.81, 196, 261.63, 329.63, 392])]
expr = '+'.join(f'between(t,{a:.2f},{b:.2f})*({chord(fr)})' for a, b, fr in segs)
run('-f', 'lavfi', '-i', f"aevalsrc='{expr}':s=48000:d={T}", '-af',
    f'lowpass=f=1500,tremolo=f=0.5:d=0.2,aecho=0.8:0.7:120|260:0.35|0.25,afade=t=in:d=1.2,afade=t=out:st={T-2.5}:d=2.5,volume=0.55',
    '-ac', '1', f'{D}/pad.wav')
# sfx
src, fx, tags = [], [], []
def add(kind, t0, i):
    ms = int(max(0, t0) * 1000)
    if kind == 'whoosh':
        src.extend(['-f', 'lavfi', '-t', '1.1', '-i', 'anoisesrc=color=pink:a=0.5:d=1.1:r=48000'])
        fx.append(f'[{i}:a]bandpass=f=1100:w=1.4,afade=t=in:d=0.5:curve=exp,afade=t=out:st=0.5:d=0.6,volume=0.18,adelay={ms}|{ms}[x{i}]')
    elif kind == 'hit':
        src.extend(['-f', 'lavfi', '-t', '1.6', '-i', 'sine=f=55:r=48000:d=1.6'])
        fx.append(f'[{i}:a]afade=t=out:st=0:d=1.5:curve=exp,volume=0.55,adelay={ms}|{ms}[x{i}]')
    elif kind == 'tick':
        src.extend(['-f', 'lavfi', '-t', '0.25', '-i', 'sine=f=1760:r=48000:d=0.25'])
        fx.append(f'[{i}:a]afade=t=out:st=0:d=0.22:curve=exp,volume=0.05,adelay={ms}|{ms}[x{i}]')
    else:
        src.extend(['-f', 'lavfi', '-t', '1.4', '-i', 'sine=f=1318.5:r=48000:d=1.4'])
        fx.append(f'[{i}:a]afade=t=out:st=0:d=1.3:curve=exp,volume=0.12,adelay={ms}|{ms}[x{i}]')
i = 0
for kind, ts in SFX.items():
    for t0 in ts: add(kind, t0, i); i += 1
fx.append(''.join(f'[x{j}]' for j in range(i)) + f'amix=inputs={i}:normalize=0,apad=whole_dur={T},atrim=0:{T}[s]')
run(*src, '-filter_complex', ';'.join(fx), '-map', '[s]', '-ac', '1', f'{D}/sfx.wav')
run('-i', f'{D}/voice.wav', '-i', f'{D}/pad.wav', '-i', f'{D}/sfx.wav', '-filter_complex',
    '[0:a]asplit[v1][v2];[1:a][v2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[pd];'
    '[v1][pd][2:a]amix=inputs=3:normalize=0:weights=1 0.2 1,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=9[m]',
    '-map', '[m]', '-ac', '2', '-ar', '48000', f'{D}/mix.wav')
