# NIBOR Cinematic Math Reels Studio

وحدة إنتاج ريلز مستقلة داخل `tools/reels/studio/`. لا تلمس عرض الكتاب (`v2/`، `index.html`، `sw.js`) ولا تُحمَّل في الموقع.

## البنية

| الملف | الوحدة | ما يفعله |
|---|---|---|
| `core/tl.js` | Timeline | دوال زمنية نقية (easing, ramp, win, track, PRNG مزروع). كل إطار دالة في `t` فقط ⇒ المعاينة = التصدير. |
| `core/stage.js` | 3D Rendering + Camera | Three.js: إضاءة استوديو، انعكاسات IBL (PMREM)، ظلال ناعمة، أرضية بشبكة قياس، جسيمات عمق، حزمة ضوء خفيفة، `rig()` كاميرا كروية بإطارات مفتاحية، `project()` لربط تسميات HTML بنقاط ثلاثية الأبعاد. |
| `core/eq.js` | Equation Motion Engine | كل رمز «ممثل» KaTeX مستقل يحتفظ بهويته ولونه؛ المعادلات تخطيطات للممثلين؛ الانتقال = استيفاء بين التخطيطات (Object→Equation، Split، Fuse). لا تمديد للرموز. |
| `core/voice.py` | Voice Production + Sync | `narration.json` → Piper (صوت رجل) → توقيت كل كلمة من محاذاة الفونيمات → `timeline.js`. |
| `core/asr_check.py` | Audio QA | تفريغ Whisper للتحقق من وضوح النطق + طبقة الصوت. مؤشر لا بديل عن الاستماع. |
| `core/mix.py` | Sound Design + Mix | موسيقى ومؤثرات مولّدة بالكامل (بلا عينات مرخّصة)، Ducking، Loudness −14 LUFS. |
| `scenes/<id>/model.js` | Mathematical Model | النموذج الرياضي المرجعي؛ كل حركة تُحسب منه. |
| `scenes/<id>/scene.html` | Scene | المشهد: `window.render(t)`، `DURATION`، `STATE`. |
| `scenes/<id>/check.cjs` | QA | يفحص كل إطار مقابل النموذج + المنطقة الآمنة. |

التصدير بأداة المشروع الموجودة: `tools/reel-render.cjs` (أُضيف لها `FPS` اختياري وانتظار `READY`؛ السلوك القديم لم يتغير).

## إعادة التصدير (مثال: tank-leak)

```bash
# مرة واحدة
pip install --break-system-packages piper-tts onnx sherpa-onnx soundfile
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ar_JO-kareem-medium.tar.bz2 && tar xjf vits-piper-ar_JO-kareem-medium.tar.bz2
# (اختياري لفحص النطق) sherpa-onnx-whisper-small من asr-models بالطريقة نفسها

cd tools/reels/studio
python3 core/voice.py scenes/tank-leak --voice ../../../vits-piper-ar_JO-kareem-medium --audition   # 3 عينات
python3 core/voice.py scenes/tank-leak --voice ../../../vits-piper-ar_JO-kareem-medium              # الصوت + timeline.js
python3 core/mix.py   scenes/tank-leak
cd ../../..
node tools/reels/studio/scenes/tank-leak/check.cjs                                                    # QA رياضي
FPS=60 node tools/reel-render.cjs tools/reels/studio/scenes/tank-leak/scene.html out/silent.mp4
ffmpeg -i out/silent.mp4 -i tools/reels/studio/scenes/tank-leak/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/tank-leak.mp4
```

تغيير جملة في `narration.json` يغيّر التوقيت تلقائياً: أعد `voice.py` ثم `mix.py` ثم التصيير.

## مشهد جديد
انسخ `scenes/tank-leak/`، اكتب `model.js` من حل الكتاب، علّم نقاط التزامن في النص بـ `{key}`، ثم ابنِ المشهد من `core/`.

## الصوت
Piper `ar_JO-kareem-medium` (رجل). لا يدعم SSML ولا وسوم انفعال؛ «الانفعال» يُقرَّب بالسرعة والتنويع والطبقة والمستوى لكل سطر (`EMO` في `voice.py`). إن لم يكن طبيعياً بما يكفي: سجّل مؤدياً بشرياً سطراً سطراً بأسماء `build/vo/line<i>.wav` وأعد `mix.py` (التوقيت يُضبط حينها يدوياً في `timeline.js`). لا استنساخ لصوت شخص حقيقي.
