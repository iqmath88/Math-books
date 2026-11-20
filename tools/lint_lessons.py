"""Quality gate for lesson sources (run by src/build.py on every chapter; a chapter with errors is not built).

usage:  python3 tools/lint_lessons.py [chapter ...]        report only
        (src/build.py imports lint(cid, src) and stops on errors)

Rules — each one is a defect a student would actually see:
  ar-nested     Arabic words inside a fraction/root/sub-group of a formula: they cannot be put in reading order.
  ar-edge       a display line split at its Arabic words leaves an operator (=, <, ⇒ …) or an open bracket at the edge
                of a formula chunk next to the words, so the line reads backwards in RTL
                (write «القياس الرئيس هو  3π/4» rather than «القياس الرئيس = 3π/4»).
  ar-inline     Arabic inside an inline $…$ formula (inline formulas are not split).
  label-math    a part label a) / b) inside an inline formula ($a) x=1$): it cannot be lifted into its own row.
  dollar        unbalanced $ on a line (the rest of the line would be read as TeX).
  brace         unbalanced { } in a formula (KaTeX error box on the page).
  sol-empty     a «sol:» block with no lines.
  let-empty     a givens row («| a ; ; c» / «| let> a ; ; c») with an empty column: the page shows a stray «;».
Warnings (reported, do not stop the build):
  unit-italic   a unit written as italic letters after a number inside a formula (2m, 0.4m^3/h) — write \\text{m}.
"""
import re, sys, os, glob

AR = re.compile(r'[\u0600-\u06FF]')
OPS = r'(=|<|>|\\le|\\ge|\\leq|\\geq|\\ne|\\neq|\\Rightarrow|\\Leftrightarrow|\\iff|\\implies|\\to|\+|-|−|\\times|\\cdot|\\div|\\approx|\\cong|\\equiv|\\in|\\subset|\\perp|\\parallel)'
EDGE_END = re.compile(OPS + r'\s*$')
EDGE_START = re.compile(r'^\s*' + OPS.replace(r'|\+|-|−', ''))   # a leading sign (−7π/2) is not a dangling operator
SPACE = re.compile(r'^(\s|\\[;,:!> ]|\\q?quad)+|(\s|\\[;,:!> ]|\\q?quad)+$')


def split_display(t):
    """Mirror of engine arSplit: top-level Arabic \\text{…} cut the formula into chunks. Returns (chunks, nested_arabic)."""
    out, d, cur, i, nested = [], 0, '', 0, False
    def flush():
        nonlocal cur
        m = SPACE.sub('', cur)
        if m: out.append(('m', m))
        cur = ''
    while i < len(t):
        c = t[i]
        if c == '\\':
            mm = re.match(r'\\[A-Za-z]+|\\[\s\S]', t[i:])
            mm = mm.group(0) if mm else '\\'
            if re.fullmatch(r'\\(text|textbf|mbox)', mm) and t[i + len(mm):i + len(mm) + 1] == '{':
                j, dd = i + len(mm) + 1, 1
                while j < len(t) and dd:
                    dd += {'{': 1, '}': -1}.get(t[j], 0); j += 1
                body = t[i + len(mm) + 1:j - 1]
                if AR.search(body):
                    if d == 0:
                        flush(); out.append(('a', body)); i = j; continue
                    nested = True
            cur += mm; i += len(mm); continue
        if c == '{': d += 1
        elif c == '}': d -= 1
        cur += c; i += 1
    flush()
    if AR.search(re.sub(r'\\(text|textbf|mbox)\{[^{}]*\}', '', t)): nested = True   # bare Arabic letters in TeX
    return out, nested


def brackets_ok(m):
    m = re.sub(r'\\[{}]|\\left.|\\right.', '', m)
    return m.count('(') == m.count(')') and m.count('[') == m.count(']')


def braces_ok(t):
    d = 0
    t = re.sub(r'\\[{}]', '', t)
    for c in t:
        d += {'{': 1, '}': -1}.get(c, 0)
        if d < 0: return False
    return d == 0


def lint(cid, src):
    errs, warns, les = [], [], '?'
    lines = src.split('\n')
    for n, raw in enumerate(lines, 1):
        if raw.startswith('=== '): les = raw[4:].split('|')[0].strip()
        where = f'{cid}/{les}:{n}'
        body = raw[2:] if raw.startswith('| ') else raw
        body = re.sub(r'^(let|main|aux)>\s?', '', body)
        if raw.startswith('>>>') or raw.startswith('---') or raw.startswith('==='): continue
        disp = body.startswith('$$') and '$$' not in body[2:]
        if disp:
            tex = body[2:].strip()
            if not braces_ok(tex): errs.append((where, 'brace', tex[:80]))
            ch, nested = split_display(tex)
            if nested: errs.append((where, 'ar-nested', tex[:90]))
            if any(k == 'a' for k, _ in ch):
                for i, (k, v) in enumerate(ch):
                    if k != 'm': continue
                    nxt_ar = i + 1 < len(ch) and ch[i + 1][0] == 'a'
                    prv_ar = i > 0 and ch[i - 1][0] == 'a'
                    if (nxt_ar and EDGE_END.search(v)) or (prv_ar and EDGE_START.search(v)) or not brackets_ok(v):
                        errs.append((where, 'ar-edge', tex[:90])); break
            continue
        # inline formulas (text lines); $$…$$ pairs inside text are display blocks
        txt = re.sub(r'\$\$[^$]+\$\$', lambda m: ' ', body)
        if raw.startswith('| ') and ' ; ' in txt:
            cols = re.sub(r'\$[^$]*\$', 'M', txt).split(';')
            if len(cols) >= 2 and any(not c.strip() for c in cols[:-1]): errs.append((where, 'let-empty', body[:80]))
        if txt.count('$') % 2: errs.append((where, 'dollar', body[:80])); continue
        for m in re.finditer(r'\$([^$]+)\$', txt):
            f = m.group(1)
            if AR.search(f): errs.append((where, 'ar-inline', f[:80]))
            if re.match(r'\s*(\\text\{)?[a-j]\)', f): errs.append((where, 'label-math', f[:60]))
            if not braces_ok(f): errs.append((where, 'brace', f[:60]))
            if re.search(r'\d\s*(cm|km|mm|m)(?![A-Za-z])', f) and '\\text' not in f: warns.append((where, 'unit-italic', f[:60]))
        if raw.startswith('sol:') and not raw[4:].strip() and not (n < len(lines) and lines[n].startswith('| ')):
            errs.append((where, 'sol-empty', ''))
    return errs, warns


# ---------------- template (the standard of lesson 3-1, generalised) ----------------
# A worked example from the book = a step (not .enr) whose «k:» starts «مثال n» plus the numbered steps (#n) after it.
# It meets the template when it has:  page («ص N») · a givens table (let:) · the main relation/law in a box (main:) ·
# at least two titled steps (#n :: title) · a result step (!) · a check or meaning (xp:) on the result.
# A book exercise solution (sol: of 3+ lines) meets it with «| let>» rows and a «| main>» box.
# A lesson meets it when it has the stages discover · learn · practice · check, all its examples and solutions meet it.
# Lessons listed in src/tier-a.json MUST meet it (errors); for the rest the gate prints what is missing (progress).
EX_REQ = [('page', 'رقم الصفحة'), ('let', 'جدول المعطيات'), ('main', 'العلاقة الرئيسية'), ('steps', 'خطوات معنونة'),
          ('result', 'خطوة النتيجة'), ('check', 'تحقق/معنى')]


def lessons(src):
    for part in re.split(r'^(?==== )', src, flags=re.M):
        if part.startswith('=== '): yield part.split('|')[0][4:].strip(), part


def template(les_src):
    blocks = re.split(r'^(?=>>> )', les_src, flags=re.M)
    exs, cur = [], None
    for b in blocks:
        head = b.split('\n', 1)[0]
        if not head.startswith('>>> '): continue
        num = re.search(r'\s#\d+', head)
        km = re.search(r'^(?:k|h1|h2):\s*(مثال\s*\d.*)$', b, re.M)
        if km and not num and '.enr' not in head:
            cur = {'name': head.split()[1], 'txt': b, 'steps': 0, 'result': '', 'k': km.group(1)}
            exs.append(cur); continue
        if num and cur is not None:
            cur['txt'] += b
            if '::' in head: cur['steps'] += 1
            if re.search(r'\s!\s|\s!$', head): cur['result'] += b
            continue
        if not num: cur = None
    out = []
    for e in exs:
        t = e['txt']
        have = {'page': bool(re.search(r'ص\s*\d', e['k'])), 'let': bool(re.search(r'^(let:|\| let>)', t, re.M)),
                'main': bool(re.search(r'^(main:|\| main>)', t, re.M)), 'steps': e['steps'] >= 2, 'result': bool(e['result']),
                'check': bool(re.search(r'^xp:', e['result'], re.M)) or '✓' in e['result']}
        out.append((e['name'], e['k'].strip(), [k for k, _ in EX_REQ if not have[k]]))
    sols = []
    for m in re.finditer(r'^sol:.*\n((?:\| .*\n?)+)', les_src, re.M):
        body = m.group(1)
        if body.count('\n') >= 3:
            miss = [k for k, rx in (('let', r'\| let>'), ('main', r'\| main>')) if not re.search(rx, body)]
            sols.append(miss)
    stages = set(re.findall(r'^--- @(\w+)', les_src, re.M))
    need = [x for x in ('discover', 'learn', 'practice', 'check') if x not in stages]
    return out, sols, need


def template_lint(cid, src, tier):
    errs, rows = [], []
    for les, body in lessons(src):
        exs, sols, need = template(body)
        ok_ex = sum(1 for *_, miss in exs if not miss); ok_sol = sum(1 for m in sols if not m)
        rows.append((les, len(exs), ok_ex, len(sols), ok_sol, need))
        if les in tier.get(cid, []):
            for name, k, miss in exs:
                if miss: errs.append((f'{cid}/{les}', 'template', f'{k}: ' + '، '.join(dict(EX_REQ)[x] for x in miss)))
            for i, m in enumerate(sols):
                if m: errs.append((f'{cid}/{les}', 'template', f'حل التمرين {i + 1}: ' + '، '.join(dict(EX_REQ)[x] for x in m)))
            if need: errs.append((f'{cid}/{les}', 'template', 'مراحل ناقصة: ' + '، '.join(need)))
    return errs, rows


def load_tier():
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'tier-a.json')
    import json
    return json.load(open(f)) if os.path.exists(f) else {}


def report(cid, errs, warns, out=sys.stdout):
    for w, r, x in errs: print(f'  ✗ {w}  [{r}]  {x}', file=out)
    if os.environ.get('LINT_WARN'):
        for w, r, x in warns: print(f'  · {w}  [{r}]  {x}', file=out)
    print(f'{cid}: {len(errs)} errors, {len(warns)} warnings', file=out)


if __name__ == '__main__':
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src')
    sys.path.insert(0, here)
    import build  # noqa: E402  (build exposes assemble(cid) without writing files)
    ids = [a for a in sys.argv[1:] if not a.startswith('-')] or list(build.META)
    bad = 0
    tier = load_tier()
    for c in ids:
        src = build.assemble(c)
        e, w = lint(c, src); te, rows = template_lint(c, src, tier); e += te; report(c, e, w); bad += len(e)
        if '--template' in os.environ.get('LINT', '') or os.environ.get('TEMPLATE'):
            for les, ne, oe, ns, os_, need in rows:
                mark = '★' if les in tier.get(c, []) else ' '
                print(f'   {mark} {les:11} أمثلة {oe}/{ne}  حلول {os_}/{ns}  ' + ('مراحل ناقصة: ' + ' '.join(need) if need else 'المراحل كاملة'))
    sys.exit(1 if bad else 0)
