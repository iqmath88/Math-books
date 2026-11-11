# مصدر دروس التصميم الجديد (v2)

هذه الملفات هي **الأصل** الذي تُبنى منه ملفات `v2/<id>.js`. لا تعدّل `v2/<id>.js` يدوياً.

- `<id>.l1.txt` ، `<id>.l2.txt` … نص الدروس بالصيغة الموصوفة في `docs/LESSON_FORMAT.md`.
- `<id>.scenes.js` الرسوم التفاعلية (`S`) ومولّدات «تمرين مشابه» (`GEN`).
- `conv/` بيانات محوّلة من النسخة الكلاسيكية تحتاجها بعض الفصول.
- `build.py` يجمعها في `v2/<id>.js`.

## البناء
```
python3 src/build.py           # كل الفصول
python3 src/build.py g12c3     # فصل واحد
```
ثم الاختبارات: `node release.test.cjs` و `node tests/e2e.cjs`.

## تصدير درس إلى PDF
```
python3 -m http.server 8770      # من المجلد الذي يحتوي math-books
node tools/lesson-pdf.cjs g12c3 rates out.pdf             # نسخة الطالب (مفتاح الحلول في النهاية)
node tools/lesson-pdf.cjs g12c3 rates out.pdf --teacher   # نسخة المدرّس (الحلول تحت كل سؤال وملاحظات التدريس)
```

## تصدير درس إلى Word
الأداة نفسها؛ يكفي أن ينتهي اسم الملف بـ `.docx`:
```
node tools/lesson-pdf.cjs g12c3 rates out.docx [--teacher]
```
تحتاج `pandoc` و `python-docx`. المعادلات تصبح معادلات Word أصلية قابلة للتعديل،
والرسوم صور PNG عائمة على اليسار، والفقرات كلها من اليمين إلى اليسار
(`tools/lesson-docx-part.cjs` ثم `tools/docx-math.lua` ثم `tools/docx-rtl.py`).

## تصدير مقطع من درس إلى فيديو MP4
```
node tools/lesson-video.cjs g12c3 rates-3-0 rates-3-4 tank.mp4 --sub "مثال 1" --next "مثال 2 · صفيحة تتمدد" --end "نشتق أولاً ، ثم نعوّض"
```
`fromKey` و `toKey` مفاتيح الخطوات (`data-key`). يخرج 1920×1080 بمعدل 30 إطاراً، صامتاً:
بطاقة عنوان، ثم كل خطوة مع رسمها الحي ونصها يظهر جزءاً جزءاً، ثم بطاقة ختام.
`--vertical` نسخة طولية 1080×1920 للريلز والستوري (الرسم فوق والخطوات تحته). `--preview` يحفظ لقطتين من كل مقطع بدل الفيديو.

## ريلز بإخراج خاص
صفحات في `tools/reels/` (مثل `ladder.html`) تعرّف `render(t)` و `DURATION`، وترسم كل لقطة بنفسها:
```
node tools/reel-render.cjs tools/reels/ladder.html out.mp4 [--preview 3,8,17]
```

### «ما هي المشتقة؟» (ريلز 40 ث بتعليق صوتي)
- الصورة: `node tools/reel-render.cjs tools/reels/derivative.html video.mp4`
- الصوت (صوت عربي آلي Piper «كريم» + خلفية موسيقية مولّدة + مؤثرات) ثم الدمج:
  `VOICE=…/vits-piper-ar_JO-kareem-medium tools/reels/derivative-audio/build-audio.sh video.mp4 out.mp4`
  (طريقة تنزيل الصوت في رأس `build-audio.sh`؛ نص التعليق مشكول في `narration.txt`).

### «المعدلات المرتبطة بالزمن» (ريلز 45 ث، خزان أسطواني)
- الصورة: `node tools/reel-render.cjs tools/reels/tank-rates.html video.mp4`
- الصوت والدمج: `VOICE=… tools/reels/tank-rates-audio/build-audio.sh video.mp4 out.mp4`
- النسخة المحسّنة v2: `tools/reels/tank-rates-v2.html` و `tools/reels/tank-rates-v2-audio/` (منظر علوي للقرص، اشتقاق بلقطة قريبة، مقارنة خزانين r و 2r بالتدفق نفسه).
- النسخة v3: `tools/reels/tank-rates-v3.html` (الصوت نفسه في `tank-rates-v2-audio/`).
- فحص آلي لأي ريلز: `node tools/reel-validate.cjs tools/reels/tank-rates-v3.html --step 0.1`
  يفحص المنطقة الآمنة للنصوص، وتداخل النصوص، وتغطية الترجمة أو المعادلة للرسم، ونسبة ارتفاع الماء 4:1 من حالة المحاكاة نفسها.

### «المخروط» (ريلز ثلاثي الأبعاد 54.8 ث بصوت نسائي)
- الصورة (Three.js 0.170 منسوخة في `tools/reels/vendor/`): `node tools/reel-render.cjs tools/reels/cone-volume.html video.mp4` (~8 دقائق لأن WebGL يُرسم برمجياً)
- الصوت: `VOICE=…/vits-piper-ar_JO-SA_dii-high tools/reels/cone-volume-audio/build-audio.sh video.mp4 out.mp4`
  (صوت Piper «dii» النسائي، رخصة CC BY-NC-SA 4.0 — للاستعمال غير التجاري مع ذكر المصدر).

### «السلّم المنزلق» (مثال 4 ص 94، ثلاثي الأبعاد 97 ث بصوت نسائي)
- الصورة: `node tools/reel-render.cjs tools/reels/ladder-3d.html video.mp4` (~15 دقيقة)
- الصوت: `VOICE=…/vits-piper-ar_JO-SA_dii-high tools/reels/ladder-3d-audio/build-audio.sh video.mp4 out.mp4`
- التحقق الرياضي والحركي: `node tools/reels/ladder-3d.check.cjs` (طول السلّم، x²+y²=100، الإشارات، dy/dt و dθ/dt عددياً)
- أدوات الريلز لم تعد تحتاج خادماً محلياً: الملفات تُقدَّم للصفحة مباشرة (BASE اختياري).

### «السلّم المنزلق» v2 — نسختان من مشروع واحد
- `tools/reels/ladder-v2.html` (الكاملة 120.7 ث مع الزاوية) و `tools/reels/ladder-v2.html?short` (المختصرة 66.7 ث).
- الصوت والتوقيت: `tools/reels/ladder-v2-audio/` (المفاتيح والنصوص في `narration.txt`، و`mix.py` يكتب `ladder-v2.timeline.<mode>.js`).
- التحقق: `node tools/reels/ladder-v2.check.cjs [full|short]` و `node tools/reel-validate.cjs "tools/reels/ladder-v2.html?short" --step 0.1`.
