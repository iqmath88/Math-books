"""NIBOR sound design + mix — voice-first.
usage: python3 mix.py <scene dir>
reads   <scene>/build/voice.wav, <scene>/timeline.js (CUES, DURATION), <scene>/sfx.json
writes  <scene>/build/music.wav, sfx.wav, mix.wav (48 kHz stereo, −14 LUFS integrated, −1.5 dBTP)

Everything is synthesised here (no third-party samples, no licensing questions):
  pad     original slow chord pad, low-passed, ducked under the voice (sidechain)
  whoosh  filtered pink-noise swells for camera moves
  tick    soft high sine blips when a symbol lands
  chime   gold result chord
  impact  low sine thump with fast decay (controlled cinematic hit)
  drip    tiny water plinks, timed to the droplets drawn on screen
sfx.json: {"events":[["whoosh","idea",-0.35], ...], "drip":{"t0":..,"period":..}}  — times are cue names (+offset) or seconds.
"""
import json, os, re, subprocess, sys, random

S = sys.argv[1]; B = os.path.join(S, 'build')
tl = open(os.path.join(S, 'timeline.js'), encoding='utf-8').read()
CUES = json.loads(re.search(r'CUES=(\{.*?\});', tl).group(1)); T = float(re.search(r'DURATION=([\d.]+)', tl).group(1))
X = json.load(open(os.path.join(S, 'sfx.json')))
run = lambda *a: subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *a], check=True)
at = lambda c, o=0: (CUES[c] if isinstance(c, str) else c) + o

# ---------- pad (original) ----------
chord = lambda fr, a=.08: '+'.join(f'{a}*sin(2*PI*{f}*t)+{a/3}*sin(2*PI*{f*2.003}*t)+{a/5}*sin(2*PI*{f*0.998}*t)' for f in fr)
prog = X.get('pad', [[98.0, 146.83, 196.0, 233.08, 293.66], [87.31, 130.81, 174.61, 220.0, 261.63], [110.0, 164.81, 220.0, 261.63, 329.63], [98.0, 146.83, 196.0, 246.94, 293.66]])
q = T / len(prog)
expr = '+'.join(f'between(t,{i*q:.3f},{(i+1)*q:.3f})*({chord(fr)})' for i, fr in enumerate(prog))
run('-f', 'lavfi', '-i', f"aevalsrc='{expr}':s=48000:d={T}", '-af',
    f'lowpass=f=1500,tremolo=f=0.2:d=0.2,aecho=0.8:0.6:140|300:0.3|0.2,afade=t=in:d=1.5,afade=t=out:st={T-2.5}:d=2.5,volume=0.55',
    '-ac', '1', os.path.join(B, 'music.wav'))

# ---------- sfx ----------
SRC = {
    'whoosh': (['-f', 'lavfi', '-t', '1.4', '-i', 'anoisesrc=color=pink:a=0.6:d=1.4:r=48000'], 'bandpass=f=700:w=1.4,afade=t=in:d=0.6:curve=exp,afade=t=out:st=0.6:d=0.8,volume=0.22'),
    'tick':   (['-f', 'lavfi', '-t', '0.5', '-i', 'sine=f=1760:r=48000:d=0.5'], 'afade=t=out:st=0:d=0.35:curve=exp,volume=0.09'),
    'chime':  (['-f', 'lavfi', '-t', '2.2', '-i', "aevalsrc='0.10*sin(2*PI*659.25*t)+0.08*sin(2*PI*830.61*t)+0.07*sin(2*PI*987.77*t)+0.04*sin(2*PI*1318.5*t)':s=48000:d=2.2"], 'afade=t=out:st=0:d=2.1:curve=exp,aecho=0.8:0.5:90:0.3,volume=0.6'),
    'impact': (['-f', 'lavfi', '-t', '1.6', '-i', "aevalsrc='0.9*sin(2*PI*(52-18*t)*t)*exp(-3.2*t)':s=48000:d=1.6"], 'lowpass=f=240,volume=0.55'),
    'drip':   (['-f', 'lavfi', '-t', '0.18', '-i', "aevalsrc='0.6*sin(2*PI*(1400+2600*t)*t)*exp(-38*t)':s=48000:d=0.18"], 'highpass=f=500,volume=0.05'),
}
ev = [(k, at(c, o)) for k, c, o in X['events']]
d = X.get('drip')
if d:
    R = random.Random(5); n = 0
    while d['t0'] + n * d['period'] < T - 0.5:
        if R.random() < d.get('density', 0.55): ev.append(('drip', d['t0'] + n * d['period']))
        n += 1
ins, fl = [], []
for i, (k, t0) in enumerate(ev):
    a, f = SRC[k]; ins += a; ms = max(0, int(t0 * 1000))
    fl.append(f'[{i}:a]{f},adelay={ms}|{ms}[e{i}]')
fl.append(''.join(f'[e{i}]' for i in range(len(ev))) + f'amix=inputs={len(ev)}:normalize=0,apad=whole_dur={T},atrim=0:{T}[s]')
run(*ins, '-filter_complex', ';'.join(fl), '-map', '[s]', '-ac', '1', os.path.join(B, 'sfx.wav'))

# ---------- mix: voice first, pad ducked by the voice, gentle bus glue, loudness for Reels ----------
run('-i', os.path.join(B, 'voice.wav'), '-i', os.path.join(B, 'music.wav'), '-i', os.path.join(B, 'sfx.wav'), '-filter_complex',
    '[0:a]asplit[v1][v2];[1:a][v2]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=600:makeup=1[pd];'
    '[v1]pan=stereo|c0=c0|c1=c0[vs];[pd]aecho=0.6:0.5:23:0.4,pan=stereo|c0=c0|c1=0.85*c0[ps];[2:a]pan=stereo|c0=c0|c1=c0[ss];'
    '[vs][ps][ss]amix=inputs=3:normalize=0:weights=1 0.9 2.2,acompressor=threshold=-18dB:ratio=2:attack=10:release=200,'
    'loudnorm=I=-14:TP=-2:LRA=9,alimiter=limit=0.79:level=false[m]',   # AAC adds ~0.5 dB: aim −2 dBTP before encoding
    '-map', '[m]', '-ar', '48000', os.path.join(B, 'mix.wav'))
print('mix', T, 's,', len(ev), 'sfx events')
