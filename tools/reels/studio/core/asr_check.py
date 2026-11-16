"""Round-trip pronunciation check: transcribe voiced clips with Whisper (sherpa-onnx) and print text + prosody stats.
usage: python3 asr_check.py <whisper-small dir> clip1.wav [clip2.wav ...]
Whisper output is a proxy for intelligibility, not proof of naturalness; a human listen is still required."""
import sys, sherpa_onnx, soundfile as sf, numpy as np
d = sys.argv[1]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{d}/small-encoder.int8.onnx', decoder=f'{d}/small-decoder.int8.onnx', tokens=f'{d}/small-tokens.txt', language='ar', task='transcribe', num_threads=4)
def f0(x, sr):
    out = []
    for i in range(0, len(x) - 2048, 512):
        fr = x[i:i+2048]
        if np.sqrt((fr**2).mean()) < 0.02: continue
        c = np.correlate(fr, fr, 'full')[2047:]; lo, hi = int(sr/350), int(sr/65)
        k = lo + np.argmax(c[lo:hi])
        if c[k] > 0.3*c[0]: out.append(sr/k)
    return np.array(out)
for w in sys.argv[2:]:
    x, sr = sf.read(w, dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    import scipy.signal as ss
    y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    s = rec.create_stream(); s.accept_waveform(16000, y); rec.decode_stream(s)
    p = f0(x, sr)
    print(f'{w.split("/")[-1]:<34} {len(x)/sr:5.2f}s  F0 median {np.median(p):5.0f} Hz  spread(IQR) {np.percentile(p,75)-np.percentile(p,25):4.0f} Hz | {s.result.text.strip()}')
