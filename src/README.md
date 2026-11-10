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
