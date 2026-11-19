# cinema/idea1-tank — فيديو سينمائي تفاعلي · الفكرة 1 (مثال 1 ص 92)

وحدة مستقلة: لا تلمس `v2/` ولا `src/` ولا عرض الكتاب الحالي؛ تستعير منه فقط KaTeX والخطوط (`../../v2/lib/`).

| الملف | الدور |
|---|---|
| `index.html` | المشهد كاملاً (Three.js 0.170 + KaTeX). وضعان: تفاعلي (افتراضي) و`?render` للتصدير |
| `timeline.js` | أزمنة جمل التعليق (`window.TL`) — يولّده `mix.py`، وكل الحركات مربوطة به |
| `narration.txt` | نص التعليق الصوتي (مشكول لمحرك النطق) |
| `tts.sh` → `mix.py` | توليد مقاطع الصوت ثم مزجها + كتابة `timeline.js` |
| `audio/narration.m4a` | الصوت النهائي للنسخة التفاعلية |
| `check.cjs` | فحص الرياضيات (V = 4h ، dV/dτ = −0.4 ، dh/dτ = −0.1) وفحص الأجهزة (iPad أفقي/عمودي، حاسوب، سبورة 4K) |
| `STORYBOARD.md` | التقرير + ميثاق الرياضيات + اللوحات |

## التشغيل والمعاينة

```bash
python3 -m http.server 8771            # من جذر المستودع
# افتح http://127.0.0.1:8771/cinema/idea1-tank/
node cinema/idea1-tank/check.cjs       # يحتاج الخادم أعلاه
```

لوحة التحكم (خارج إطار الفيديو، أزرار ≥ 44 px للمس): تشغيل/إيقاف (أو مفتاح المسافة)، إعادة، المراحل 1–4 (5–6 معطّلة حالياً)، شريط الزمن، منزلق h (يظهر عند الإيقاف في مرحلة النموذج)، إظهار/إخفاء المعطيات، ملء الشاشة. المسرح 1920×1080 يتحجّم ليناسب أي شاشة.

## إعدادات التصدير

```bash
node tools/reel-render.cjs 'cinema/idea1-tank/index.html?render' out/video.mp4 --size 1920x1080   # H.264, 30 fps, CRF 18, veryfast, yuv420p
ffmpeg -i out/video.mp4 -i <clips>/mix-full.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/idea1-tank.mp4
```

التصدير حتمي: كل إطار يُرسم بـ `render(t)` (لا تسجيل للشاشة)، فالصوت والصورة متزامنان من المصدر نفسه (`timeline.js`).

## الصوت

Piper، صوت عربي أنثوي `ar_JO-SA_dii-high`، `--length-scale 1.1 --noise-scale 0.8 --noise-w-scale 1.0 --sentence-silence 0.4` ثم `atempo=1.04`؛ مزج بخلفية نغمية خافتة (وزن 0.22) و«رنّة» واحدة عند النتيجة؛ loudnorm −16 LUFS.
