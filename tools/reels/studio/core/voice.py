"""NIBOR Human Expressive Voice Director — narration.json → voiced lines → word-accurate timeline.

usage:
  python3 voice.py <scene dir> --voice <piper voice dir> [--preset cinematic|calm|energetic] [--audition]

Writes <scene>/build/vo/line<i>.wav, <scene>/build/voice.wav (dry, placed on the timeline, 48 kHz mono) and
<scene>/timeline.js (window.CUES = {key: seconds}, window.LINES = [[start, dur]], window.DURATION).

Line syntax (narration.json "text"):
  {key}word     sync cue = start time of that word (from Piper's phoneme alignment)
  *word         pitch accent on that word (+ACCENT semitones, bell-shaped)
  ‖0.4          a real pause of 0.4 s; the text on each side is synthesised as its own phrase
  ⟨1.2⟩         pace multiplier for the phrase it starts (>1 = slower)
Line options: "emo" (prosody preset), "rise": true (question intonation on the last word), "gap" (silence after).

Prosody is shaped after synthesis with the WORLD vocoder (pyworld): the pitch contour of every line is
re-scaled around its median by the emotion's range factor, accented words get a pitch bump, questions rise
at the end and statements settle. Piper/VITS has no SSML or emotion tags, so this is how expression is
controlled; the performance notes in narration.json never reach the engine.

Pronunciation: espeak-ng (Piper's phonemiser) mis-handles some Arabic (shadda on و/ي, hamzat al-wasl).
PRON maps such words to hand-written IPA in the phoneme set the voice was trained on.
"""
import argparse, json, os, re, subprocess, wave
import numpy as np

PRESETS = {
    'calm':      dict(ls=0.84, ns=0.50, nw=0.60, pitch=0.985, gain=1.0),
    'energetic': dict(ls=0.68, ns=0.80, nw=0.95, pitch=1.035, gain=1.0),
    'cinematic': dict(ls=0.76, ns=0.667, nw=0.80, pitch=1.0, gain=1.0),
}
# ls/pitch/gain multiplicative, ns additive, rng = pitch-range factor (1 = as synthesised)
EMO = {
    'curiosity':    dict(ls=1.04, pitch=1.03, ns=+0.05, rng=1.30),
    'suspense':     dict(ls=1.18, pitch=0.98, ns=-0.05, rng=1.10, gain=0.92),
    'focus':        dict(ls=1.04, pitch=0.99, ns=-0.06, rng=1.00, gain=0.97),
    'emphasis':     dict(ls=1.12, pitch=0.99, ns=-0.02, rng=1.20, gain=1.04),
    'discovery':    dict(ls=1.00, pitch=1.06, ns=+0.08, rng=1.40, gain=1.06),
    'satisfaction': dict(ls=1.10, pitch=1.02, ns=+0.02, rng=1.25, gain=1.03),
}
ACCENT = 2.6        # semitones
RISE = 6.0          # semitones over the voiced part of a question's last word
SETTLE = -1.5       # semitones over the last word of a statement
LEAD = 0.30
SENT_SIL = 0.22
MARK = re.compile(r'\{(\w+)\}')
SILENT = {'^', '$', '.', ',', '?', '!', '،', '؟', ':', ';'}
PRON = {   # vowelled word (without cue/accent marks) → IPA
    'فَبِأَيِّ': 'fabiʔˈajji', 'تَغَيُّرِهِ': 'taɣˈajjurihi', 'بِالنِّسْبَةِ': 'binnˈisbati',
    'إِلَى': 'ʔˈila', 'الزَّمَنِ:': 'zzˈaman:', 'السَّاعَةِ.': 'ssˈaːʕa.', 'السَّاعَةِ،': 'ssˈaːʕa,',
    'وَانْتَبِهْ': 'wantˈabih', 'اثْنَانِ': 'ʔiθnˈaːni', 'اثْنَيْنِ': 'θnˈajni',
    'قَاعِدَتُهُ': 'qaːʕˈidatuhu', 'ضِلْعِهَا': 'dˤˈilʕihaː', 'ضِلْعُهَا': 'dˤˈilʕuhaː'
}


def sh(*a):
    subprocess.run(a, check=True)


def parse_line(text):
    """→ [phrase], phrase = dict(words, marks={key: word index}, acc=[word index], pause=s after, pace=x)"""
    new = lambda: dict(words=[], marks={}, acc=[], pause=0.0, pace=1.0)
    out, cur = [], new()
    for tok in text.split():
        if tok.startswith('‖'):
            cur['pause'] = float(tok[1:] or 0.3); out.append(cur); cur = new(); continue
        m = re.fullmatch(r'⟨([\d.]+)⟩', tok)
        if m: cur['pace'] = float(m.group(1)); continue
        m = MARK.match(tok)
        while m:
            cur['marks'][m.group(1)] = len(cur['words']); tok = tok[m.end():]; m = MARK.match(tok)
        if tok.startswith('*'): cur['acc'].append(len(cur['words'])); tok = tok[1:]
        if tok: cur['words'].append(tok)
    out.append(cur)
    return [p for p in out if p['words']]


def phonemes(voice, words):
    """sentence phoneme lists with PRON overrides applied word by word"""
    sents, cur = [], []
    for i, w in enumerate(words):
        ipa = PRON.get(w)
        ph = list(ipa) if ipa else sum(voice.phonemize(w), [])
        if cur: cur.append(' ')
        cur += ph
        if w[-1] in '.؟?!' and i < len(words) - 1: sents.append(cur); cur = []
    if cur: sents.append(cur)
    return sents


def synth_phrase(voice, words, cfg):
    """→ float audio (voice sample rate), [word start s], [word end s]"""
    pcm, starts, t, sr = [], [], 0, voice.config.sample_rate
    idmap = voice.config.phoneme_id_map; npad = len(idmap.get('_', []))
    for ph in phonemes(voice, words):
        ids = voice.phonemes_to_ids(ph)
        audio, samples = voice.phoneme_ids_to_audio(ids, cfg, include_alignments=True)
        audio = np.asarray(audio, np.float32).reshape(-1); samples = np.asarray(samples).reshape(-1)
        if pcm: n = int(SENT_SIL * sr); pcm.append(np.zeros(n, np.float32)); t += n
        k, s, new_word = 0, t, True
        for p in ['^'] + ph + ['$']:
            n_ids = len(idmap.get(p, [])) + (npad if p != '$' else 0)
            if p == ' ': new_word = True
            elif p not in SILENT and new_word and p != '^': starts.append(s / sr); new_word = False
            s += int(np.sum(samples[k:k + n_ids])); k += n_ids
        pcm.append(audio); t += len(audio)
    a = np.concatenate(pcm)
    return a, starts, starts[1:] + [len(a) / sr]


def shape_pitch(a, sr, rng, accents, last, rise):
    """WORLD: scale the log-F0 contour around its median, add accent bumps and the final contour"""
    import pyworld as pw
    x = a.astype(np.float64)
    f0, tt = pw.harvest(x, sr, f0_floor=60, f0_ceil=300, frame_period=5.0)
    sp = pw.cheaptrick(x, f0, tt, sr); ap = pw.d4c(x, f0, tt, sr)
    v = f0 > 0
    if v.sum() < 10: return a
    st = np.zeros_like(f0); st[v] = 12 * np.log2(f0[v])
    med = np.median(st[v]); st[v] = med + (st[v] - med) * rng
    for (s, e) in accents:
        w = (tt >= s) & (tt <= e)
        if w.any(): st[w] += ACCENT * np.sin(np.pi * (tt[w] - s) / max(e - s, 1e-3))
    if last:
        s, e = last; vv = np.where(v & (tt >= s) & (tt <= e))[0]
        if len(vv): e = tt[vv[-1]]
        w = (tt >= s) & (tt <= e)
        k = np.clip((tt[w] - s) / max(e - s, 1e-3), 0, 1)
        st[w] += (RISE * k ** 1.5) if rise else (SETTLE * k)
    f0n = np.where(v, 2 ** (st / 12), 0)
    y = pw.synthesize(f0n, sp, ap, sr, frame_period=5.0)[:len(a)]
    if len(y) < len(a): y = np.pad(y, (0, len(a) - len(y)))
    return (y / max(np.abs(y).max(), 1e-6) * np.abs(a).max()).astype(np.float32)


def synth_line(voice, L, p, use_emo, out):
    """→ (duration s, {cue: s}) — the line is assembled phrase by phrase with real pauses"""
    from piper import SynthesisConfig
    e = EMO.get(L.get('emo'), {}) if use_emo else {}
    sr = voice.config.sample_rate
    parts, cues, acc, t, last = [], {}, [], 0.0, None
    for ph in parse_line(L['text']):
        cfg = SynthesisConfig(length_scale=p['ls'] * e.get('ls', 1) * ph['pace'], noise_scale=max(0.2, p['ns'] + e.get('ns', 0)), noise_w_scale=p['nw'])
        a, st, en = synth_phrase(voice, ph['words'], cfg)
        if len(st) != len(ph['words']): print(f'  ! {len(st)} onsets for {len(ph["words"])} words: {" ".join(ph["words"])[:40]}')
        for k, wi in ph['marks'].items(): cues[k] = t + st[min(wi, len(st) - 1)]
        for wi in ph['acc']: acc.append((t + st[wi], t + en[wi]))
        last = (t + st[-1], t + en[-1])
        parts.append(a); t += len(a) / sr
        if ph['pause']: parts.append(np.zeros(int(ph['pause'] * sr), np.float32)); t += ph['pause']
    a = np.concatenate(parts)
    if use_emo: a = shape_pitch(a, sr, e.get('rng', 1), acc, last, L.get('rise', False))
    raw = out + '.raw.wav'
    with wave.open(raw, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    pitch = p['pitch'] * e.get('pitch', 1); gain = p['gain'] * e.get('gain', 1)
    # tail trim only (cue times stay valid); clean male voice: no boom, presence for intelligibility, a little air
    af = ('areverse,silenceremove=start_periods=1:start_threshold=-58dB:start_silence=0.08,areverse,'
          f'aresample=48000:resampler=soxr,rubberband=pitch={pitch:.4f}:formant=preserved,'
          'highpass=f=85,equalizer=f=220:t=q:w=1.0:g=-2.5,equalizer=f=500:t=q:w=1.2:g=-1,'
          'equalizer=f=2800:t=q:w=0.9:g=3.5,equalizer=f=5000:t=h:w=0.7:g=2.5,aexciter=amount=1.2:drive=6:freq=6000,'
          'deesser=i=0.4,acompressor=threshold=-20dB:ratio=2.5:attack=6:release=110,'
          f'volume={gain:.3f}')
    sh('ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', raw, '-af', af, '-ac', '1', '-ar', '48000', out)
    os.remove(raw)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]))
    return d, cues


NUM = {'0.4': 'صفر فاصله اربعه', '0.1': 'صفر فاصله واحد', '4': 'اربعه', '2': 'اثنان', '10': 'عشره', '0': 'صفر'}


def norm_ar(s):
    s = re.sub(r'\{\w+\}|‖[\d.]*|⟨[\d.]+⟩|\*', '', s)
    s = re.sub(r'[\u064B-\u0652\u0640]', '', s)
    s = re.sub(r'\d+(?:\.\d+)?', lambda m: ' ' + NUM.get(m.group(0), m.group(0)) + ' ', s)
    for a, b in (('أ', 'ا'), ('إ', 'ا'), ('آ', 'ا'), ('ة', 'ه'), ('ى', 'ي'), ('ال', '')):
        s = s.replace(a, b)
    return re.sub(r'[^\u0621-\u064A]', '', s)


class Judge:
    """Whisper round-trip: character similarity between what was meant and what is understood (0..1).
    A proxy for intelligibility only — it cannot judge warmth or naturalness."""
    def __init__(self, d):
        import sherpa_onnx
        self.r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{d}/small-encoder.int8.onnx', decoder=f'{d}/small-decoder.int8.onnx', tokens=f'{d}/small-tokens.txt', language='ar', task='transcribe', num_threads=2)
    def __call__(self, wav, text):
        import difflib, soundfile as sf, scipy.signal as ss
        x, sr = sf.read(wav); y = ss.resample_poly(x, 16000, sr).astype(np.float32)
        st = self.r.create_stream(); st.accept_waveform(16000, y); self.r.decode_stream(st); hyp = st.result.text.strip()
        return difflib.SequenceMatcher(None, norm_ar(text), norm_ar(hyp)).ratio(), hyp


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
    ap.add_argument('--takes', type=int, default=1, help='render N takes per line and keep the most intelligible (needs --asr)')
    ap.add_argument('--asr', help='sherpa-onnx whisper-small directory (take selection)')
    a = ap.parse_args()
    judge = Judge(a.asr) if a.asr and a.takes > 1 else None
    report = []
    N = json.load(open(os.path.join(a.scene, 'narration.json'), encoding='utf-8'))
    model = [os.path.join(a.voice, f) for f in os.listdir(a.voice) if f.endswith('.onnx')][0]
    voice = PiperVoice.load(model, include_alignments=True)
    B = os.path.join(a.scene, 'build'); os.makedirs(os.path.join(B, 'vo'), exist_ok=True)
    runs = [(n, PRESETS[n], n == 'cinematic', N['lines'][:2]) for n in PRESETS] if a.audition else [(a.preset, PRESETS[a.preset], True, N['lines'])]
    for name, p, use_emo, lines in runs:
        t, clips, cues, spans = LEAD, [], {}, []
        for i, L in enumerate(lines):
            f = os.path.join(B, 'vo', (f'aud-{name}-' if a.audition else '') + f'line{i+1}.wav')
            if judge:
                best = None
                for k in range(a.takes):
                    tf = f'{f}.take{k}.wav'; d, c = synth_line(voice, L, p, use_emo, tf); sc, hyp = judge(tf, L['text'])
                    if best is None or sc > best[0]: best = (sc, d, c, tf, hyp, k)
                sc, d, c, tf, hyp, k = best; os.replace(tf, f)
                for k2 in range(a.takes):
                    if os.path.exists(f'{f}.take{k2}.wav'): os.remove(f'{f}.take{k2}.wav')
                report.append(dict(line=i + 1, take=k, score=round(sc, 3), heard=hyp)); print(f'  line {i+1}: take {k} score {sc:.2f} | {hyp}')
            else:
                d, c = synth_line(voice, L, p, use_emo, f)
            for k, v in c.items(): cues[k] = round(t + v, 3)
            clips.append((f, t)); spans.append([round(t, 3), round(d, 3)]); t += d + L['gap']
        T = round(t + (0.6 if a.audition else N.get('tail', 1.5)), 2)
        out = os.path.join(B, f'audition-{name}.wav' if a.audition else 'voice.wav'); place(clips, T, out)
        if a.audition:
            print('audition', name, T, 's'); continue
        with open(os.path.join(a.scene, 'timeline.js'), 'w', encoding='utf-8') as fh:
            fh.write('/* generated by core/voice.py from narration.json — do not edit by hand */\n')
            fh.write(f'window.CUES={json.dumps(cues)};\nwindow.LINES={json.dumps(spans)};\nwindow.DURATION={T};\n')
        if report: json.dump(report, open(os.path.join(B, 'takes.json'), 'w'), ensure_ascii=False, indent=1)
        print('duration', T); print(json.dumps(cues))


if __name__ == '__main__':
    main()
