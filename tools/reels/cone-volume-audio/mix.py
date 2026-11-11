"""Place the narration clips on the timeline, synthesize a soft pad + whooshes/pings, duck, master.
usage: python3 mix.py <dir with k1.wav..kN.wav>   -> <dir>/mix.wav  (and prints the cue list for cone-volume.html)"""
import json, subprocess, sys, os
D = sys.argv[1]
run = lambda *a: subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *a], check=True)
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
N = len([f for f in os.listdir(D) if f.startswith('k') and f.endswith('.wav')])
gaps = [0.6, 0.4, 0.6, 0.6, 1.0, 1.0, 0.8, 0.6, 0.6, 0.5, 0.8] + [0.4] * 20
t, cues = 0.5, []
for i in range(N):
    d = dur(f'{D}/k{i+1}.wav'); cues.append([round(t, 3), round(d, 3)]); t += d + gaps[i]
print('CUES =', json.dumps(cues), ' end ≈', round(t, 2))
T = 54.8
ins, fl = [], []
for i, (s, _) in enumerate(cues):
    ins += ['-i', f'{D}/k{i+1}.wav']; ms = int(s * 1000); fl.append(f'[{i}:a]aresample=48000,adelay={ms}|{ms}[v{i}]')
fl.append(''.join(f'[v{i}]' for i in range(N)) + f'amix=inputs={N}:normalize=0,apad=whole_dur={T},atrim=0:{T},highpass=f=70,'
          'acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7[vo]')
run(*ins, '-filter_complex', ';'.join(fl), '-map', '[vo]', '-ac', '1', '-ar', '48000', f'{D}/voice.wav')
C = [c[0] for c in cues]
chord = lambda fr: '+'.join(f'0.09*sin(2*PI*{f}*t)+0.03*sin(2*PI*{f*2.003}*t)' for f in fr)
segs = [(0, 14, [110, 164.81, 220, 261.63, 329.63]), (14, 27, [87.31, 130.81, 174.61, 220, 261.63]),
        (27, 41, [130.81, 196, 261.63, 329.63, 392]), (41, 54.8, [98, 146.83, 196, 246.94, 293.66])]   # Am F C G
expr = '+'.join(f'between(t,{a},{b})*({chord(fr)})' for a, b, fr in segs)
run('-f', 'lavfi', '-i', f"aevalsrc='{expr}':s=48000:d={T}", '-af',
    'lowpass=f=1400,tremolo=f=0.25:d=0.25,aecho=0.8:0.7:120|260:0.35|0.25,afade=t=in:d=2,afade=t=out:st=51.8:d=3,volume=0.55', '-ac', '1', f'{D}/pad.wav')
sfx, fx = [], []
whoosh = [3.0, C[3] - 0.2, C[7] - 0.1, C[8] - 0.3, C[11] - 0.4]   # cylinder enters, flip, side-by-side, law, ending
for i, t0 in enumerate(whoosh):
    sfx += ['-f', 'lavfi', '-t', '1.2', '-i', 'anoisesrc=color=pink:a=0.5:d=1.2:r=48000']; ms = int(t0 * 1000)
    fx.append(f'[{i}:a]bandpass=f=900:w=1.2,afade=t=in:d=0.45:curve=exp,afade=t=out:st=0.45:d=0.75,volume=0.35,adelay={ms}|{ms}[w{i}]')
n = len(fx)
for j, t0 in enumerate([C[6] + 1.3, C[10] + 3.4, C[11] + 0.9]):   # cylinder full, 18π result, final formula
    sfx += ['-f', 'lavfi', '-t', '1', '-i', 'sine=f=1318.5:r=48000:d=1']; ms = int(t0 * 1000)
    fx.append(f'[{n+j}:a]afade=t=out:st=0:d=0.9:curve=exp,volume=0.18,adelay={ms}|{ms}[p{j}]')
pours = [C[4] - 0.15, C[5] - 0.15, C[6] - 0.15]
m0 = n + 3
for q, t0 in enumerate(pours):
    sfx += ['-f', 'lavfi', '-t', '1.4', '-i', 'anoisesrc=color=brown:a=0.6:d=1.4:r=48000']; ms = int(t0 * 1000)
    fx.append(f'[{m0+q}:a]bandpass=f=1800:w=1.5,tremolo=f=11:d=0.5,afade=t=in:d=0.15,afade=t=out:st=1.1:d=0.3,volume=0.22,adelay={ms}|{ms}[q{q}]')
fx.append(''.join(f'[w{i}]' for i in range(n)) + ''.join(f'[p{j}]' for j in range(3)) + ''.join(f'[q{q}]' for q in range(3)) + f'amix=inputs={n+6}:normalize=0,apad=whole_dur={T},atrim=0:{T}[s]')
run(*sfx, '-filter_complex', ';'.join(fx), '-map', '[s]', '-ac', '1', f'{D}/sfx.wav')
run('-i', f'{D}/voice.wav', '-i', f'{D}/pad.wav', '-i', f'{D}/sfx.wav', '-filter_complex',
    '[0:a]asplit[v1][v2];[1:a][v2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[pd];'
    '[v1][pd][2:a]amix=inputs=3:normalize=0:weights=1 0.5 1,alimiter=limit=0.95,loudnorm=I=-15:TP=-1.5:LRA=9[m]',
    '-map', '[m]', '-ac', '2', '-ar', '48000', f'{D}/mix.wav')
