"""NIBOR Human Expressive Voice Director — narration.json → voiced lines → word-accurate timeline.

usage:
  python3 voice.py <scene dir> --voice <piper voice dir> [--preset cinematic|calm|energetic] [--audition]

  --audition   renders the first two lines in each of the three presets → <scene>/build/audition-<preset>.wav
  (default)    renders every line with --preset and writes
                 <scene>/build/vo/line<i>.wav     processed lines
                 <scene>/build/voice.wav          dry voice track, already placed on the timeline (48 kHz mono)
                 <scene>/timeline.js              window.CUES = {key: seconds}, window.LINES = [[start,dur]], window.DURATION

Sync: every {key} marker in a line is resolved to the start time of the following word, using the
phoneme/sample alignment returned by Piper (word boundaries = space phonemes). No guessing by text length.

Emotion is approximated with what Piper/VITS really supports — it has no SSML and no emotion tags:
pace (length_scale), liveliness (noise_scale), rhythm variation (noise_w), a small formant-preserving
pitch offset (rubberband) and level. Performance notes never reach the engine, so they are never spoken.
"""
import argparse, json, os, re, subprocess, wave
import numpy as np

PRESETS = {
    'calm':      dict(ls=0.84, ns=0.50, nw=0.60, pitch=0.985, gain=1.0),
    'energetic': dict(ls=0.68, ns=0.80, nw=0.95, pitch=1.035, gain=1.0),
    'cinematic': dict(ls=0.74, ns=0.667, nw=0.80, pitch=1.0, gain=1.0),
}
EMO = {   # applied on top of the preset in 'cinematic' (and in the final render)
    'curiosity':    dict(ls=1.03, pitch=1.025, ns=+0.05),
    'suspense':     dict(ls=1.08, pitch=0.990, ns=-0.05),
    'focus':        dict(ls=1.02, pitch=0.990, ns=-0.08, gain=0.95),
    'emphasis':     dict(ls=1.06, pitch=0.985, ns=-0.04, gain=1.05),
    'discovery':    dict(ls=0.98, pitch=1.040, ns=+0.08, gain=1.06),
    'satisfaction': dict(ls=1.02, pitch=1.015, ns=+0.02),
}
LEAD = 0.30            # silence before the first line (s)
SENT_SIL = 0.22        # pause between sentences inside one line (s)
MARK = re.compile(r'\{(\w+)\}')
SILENT = {'^', '$', '.', ',', '?', '!', '،', '؟', ':', ';'}


def sh(*a):
    subprocess.run(a, check=True)


def parse(text):
    """'{a}word1 word2 {b}word3' → ('word1 word2 word3', {'a':0,'b':2})"""
    marks, words = {}, []
    for tok in text.split():
        m = MARK.match(tok)
        while m:
            marks[m.group(1)] = len(words); tok = tok[m.end():]; m = MARK.match(tok)
        if tok: words.append(tok)
    return ' '.join(words), marks


def synth(voice, text, p, emo, out):
    """→ (duration, [start time of each word])"""
    from piper import SynthesisConfig
    e = EMO.get(emo, {}) if emo else {}
    cfg = SynthesisConfig(length_scale=p['ls'] * e.get('ls', 1), noise_scale=max(0.2, p['ns'] + e.get('ns', 0)), noise_w_scale=p['nw'])
    pitch = p['pitch'] * e.get('pitch', 1); gain = p['gain'] * e.get('gain', 1)
    pcm, starts, t, sr = [], [], 0, 22050
    for c in voice.synthesize(text, cfg, include_alignments=True):
        sr = c.sample_rate; al = c.phoneme_alignments
        if al is None: raise SystemExit('this voice model gives no phoneme alignment — cannot sync words')
        if pcm:
            n = int(SENT_SIL * sr); pcm.append(np.zeros(n, np.int16)); t += n
        new_word, s = True, t
        for a in al:
            if a.phoneme == ' ': new_word = True
            elif a.phoneme not in SILENT and new_word:
                starts.append(s / sr); new_word = False
            s += a.num_samples
        pcm.append(c.audio_int16_array); t += len(c.audio_int16_array)
    raw = out + '.raw.wav'
    with wave.open(raw, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.concatenate(pcm).tobytes())
    # tail trim only (keeps word times valid), formant-preserving pitch, warm male voice chain
    af = ('areverse,silenceremove=start_periods=1:start_threshold=-58dB:start_silence=0.08,areverse,'
          f'aresample=48000,rubberband=pitch={pitch:.4f}:formant=preserved,'
          'highpass=f=75,equalizer=f=140:t=q:w=1.0:g=2.5,equalizer=f=320:t=q:w=1.2:g=-1.5,'
          'equalizer=f=3200:t=q:w=1.0:g=2,deesser=i=0.35,'
          f'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,volume={gain:.3f}')
    sh('ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', raw, '-af', af, '-ac', '1', '-ar', '48000', out)
    os.remove(raw)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]))
    return d, starts


def place(clips, T, out):
    ins, fl = [], []
    for i, (f, t0) in enumerate(clips):
        ins += ['-i', f]; ms = int(round(t0 * 1000)); fl.append(f'[{i}:a]adelay={ms}|{ms}[v{i}]')
    fl.append(''.join(f'[v{i}]' for i in range(len(clips))) + f'amix=inputs={len(clips)}:normalize=0,apad=whole_dur={T},atrim=0:{T}[o]')
    sh('ffmpeg', '-nostdin', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ac', '1', '-ar', '48000', out)


def main():
    from piper import PiperVoice
    ap = argparse.ArgumentParser(); ap.add_argument('scene'); ap.add_argument('--voice', required=True)
    ap.add_argument('--preset', default='cinematic'); ap.add_argument('--audition', action='store_true')
    a = ap.parse_args()
    N = json.load(open(os.path.join(a.scene, 'narration.json'), encoding='utf-8'))
    model = [os.path.join(a.voice, f) for f in os.listdir(a.voice) if f.endswith('.onnx')][0]
    voice = PiperVoice.load(model, include_alignments=True)
    B = os.path.join(a.scene, 'build'); os.makedirs(os.path.join(B, 'vo'), exist_ok=True)
    runs = [(n, PRESETS[n], n == 'cinematic', N['lines'][:2]) for n in PRESETS] if a.audition else [(a.preset, PRESETS[a.preset], True, N['lines'])]
    for name, p, use_emo, lines in runs:
        t, clips, cues, spans = LEAD, [], {}, []
        for i, L in enumerate(lines):
            text, marks = parse(L['text'])
            f = os.path.join(B, 'vo', (f'aud-{name}-' if a.audition else '') + f'line{i+1}.wav')
            d, starts = synth(voice, text, p, L['emo'] if use_emo else None, f)
            if len(starts) != len(text.split()):
                print(f'  ! line {i+1}: {len(starts)} word onsets for {len(text.split())} words')
            for k, wi in marks.items():
                cues[k] = round(t + starts[min(wi, len(starts) - 1)], 3)
            clips.append((f, t)); spans.append([round(t, 3), round(d, 3)]); t += d + L['gap']
        T = round(t + (0.6 if a.audition else N.get('tail', 1.5)), 2)
        out = os.path.join(B, f'audition-{name}.wav' if a.audition else 'voice.wav'); place(clips, T, out)
        if a.audition:
            print('audition', name, T, 's'); continue
        with open(os.path.join(a.scene, 'timeline.js'), 'w', encoding='utf-8') as fh:
            fh.write('/* generated by core/voice.py from narration.json — do not edit by hand */\n')
            fh.write(f'window.CUES={json.dumps(cues)};\nwindow.LINES={json.dumps(spans)};\nwindow.DURATION={T};\n')
        print('duration', T); print(json.dumps(cues))


if __name__ == '__main__':
    main()
