#!/usr/bin/env python3
"""Automated arithmetic / algebra audit of worked solutions in src/<id>.l*.txt.

For every display equation ($$ …) and solution line (| $$ … / | …) it:
  1. splits the line into separate statements at \\Rightarrow / \\therefore / ⇒ / , ;
  2. splits each statement into a chain at top-level = and \\approx ;
  3. evaluates neighbouring links of the chain with SymPy:
       - both purely numeric  → must agree (= : 1e-9 relative, \\approx : 3 %)
       - same free symbols, no functions/derivatives → compared at random points
Anything that cannot be parsed is skipped silently (the audit is a net, not a proof).

usage:  python3 tools/audit_math.py [chapter ...] [--json out.json] [--all]
        (--all also prints the "checked OK" count per lesson)
Exit code 1 when a numeric mismatch is found (algebraic mismatches are reported as REVIEW).
Requires: pip install sympy antlr4-python3-runtime==4.11
"""
import glob, json, math, os, random, re, sys, warnings
warnings.filterwarnings('ignore')
from sympy.parsing.latex import parse_latex
import sympy as sp

ROOT = os.path.join(os.path.dirname(__file__), '..')
AR = re.compile(r'[\u0600-\u06FF]')

def brace_end(s, i):
    d = 0
    for j in range(i, len(s)):
        if s[j] == '{': d += 1
        elif s[j] == '}':
            d -= 1
            if d == 0: return j
    return -1

def unwrap(s, macro):
    """\\macro{x} → x (handles nesting)."""
    out, i = '', 0
    while True:
        k = s.find(macro + '{', i)
        if k < 0: return out + s[i:]
        e = brace_end(s, k + len(macro))
        if e < 0: return out + s[i:]
        out += s[i:k] + s[k + len(macro) + 1:e]; i = e + 1

def clean(t):
    t = t.strip().rstrip('.').strip()
    for m in (r'\cf', r'\cch', r'\ctn', r'\ccc', r'\cin', r'\boxed', r'\mathbf', r'\mathrm'):
        t = unwrap(t, m)
    t = re.sub(r'\\color\{[^}]*\}|\\displaystyle', '', t)
    t = re.sub(r'\\(?:t|d)frac', r'\\frac', t)
    t = re.sub(r'\\text\{\s*(?:or|and|أو|و)\s*\}', ';', t)
    t = re.sub(r'\\sqrt\s*([a-zA-Z])(?![a-zA-Z])', r'\\sqrt{\1}', t)
    t = re.sub(r'\\text\{\s*[A-Za-z²³/\^\s\.]*\}(?:\^\{?\d\}?)?(?:\\text\{[^}]*\})?', '', t)   # units: \text{cm}^3\text{/s}
    t = re.sub(r'\\frac\s*(\d)\s*(\d)', r'\\frac{\1}{\2}', t)           # \frac13
    t = re.sub(r'\\frac\{([^{}]*)\}\s*(\d)', r'\\frac{\1}{\2}', t)       # \frac{x}2
    t = re.sub(r'\\frac\s*(\d)\s*\{', r'\\frac{\1}{', t)                 # \frac1{12}
    t = re.sub(r'\\sqrt(\[\d\])?\s*(\d)', r'\\sqrt\1{\2}', t)             # \sqrt3 , \sqrt[3]8
    t = re.sub(r'\^\{?\\circ\}?', '', t)                                 # degrees
    t = re.sub(r'\\(?:,|;|!|:| )', ' ', t)
    t = re.sub(r'(?<![\d.])(\d+)\s*\\frac\{(\d+)\}\{(\d+)\}', r'(\1+\\frac{\2}{\3})', t)   # mixed number 4\frac12
    t = t.replace(r'\left', '').replace(r'\right', '')
    t = t.replace(r'\times', r'\cdot').replace('×', r'\cdot').replace('−', '-').replace(r'\%', '')
    t = re.sub(r'\\(?:big|Big|bigg|Bigg)[lr]?', '', t)
    return t

SEP = re.compile(r'\\Rightarrow|\\Longrightarrow|\\implies|\\therefore|\\iff|⇒|\\quad|\\qquad|;|\\text\{[^}]*[\u0600-\u06FF][^}]*\}')

def top_split(s, pats):
    """split at top-level occurrences of any of pats; returns [(piece, sep_before)]."""
    out, d, last, sep, i = [], 0, 0, None, 0
    while i < len(s):
        c = s[i]
        if c in '{([': d += 1
        elif c in '})]': d -= 1
        elif d == 0:
            for p in pats:
                if s.startswith(p, i) and not (p == '=' and (s[i-1:i] in '<>!' or s[i+1:i+2] == '=')):
                    out.append((s[last:i], sep)); sep = p; i += len(p); last = i; break
            else:
                i += 1; continue
            continue
        i += 1
    out.append((s[last:], sep)); return out

def has_fn(e):
    return bool(e.atoms(sp.Function, sp.Derivative, sp.Integral, sp.Limit, sp.Subs)) if isinstance(e, sp.Basic) else True

def parse(seg):
    seg = seg.strip()
    if not seg or AR.search(seg) or re.search(r'\\(?:lim|int|sum|prod|in|notin|cup|cap|pm|mp|infty|to|perp|parallel|angle|triangle|overline|vec|hat|bar|leq|geq|le|ge|neq|ne|lt|gt)(?![a-zA-Z])', seg): return None
    if re.search(r"[<>]|'|\\prime|\|\s*_|\\{|\\}|(?<!\\sqrt)\[|\](?!\{)", seg): return None
    if re.search(r'(?<![a-zA-Z\\])[a-zA-Z]\s*\(', seg) and not re.match(r'^[\d\s\+\-\*/\(\)\.\\a-z\{\}\^]+$', seg):
        return None                                                   # f(x), y(t) … function application
    if re.search(r'\\[a-zA-Z]*\(|^[\s,]*$', seg): return None
    if re.search(r'\d\s*,\s*\d', seg): return None                    # points (1 , 2) / lists
    try:
        e = parse_latex(seg)
    except Exception:
        return None
    if not isinstance(e, sp.Expr) or has_fn(e): return None
    sub = {}
    for sym in e.free_symbols:
        if sym.name == 'i': sub[sym] = sp.I
        elif sym.name == 'omega': sub[sym] = sp.Rational(-1, 2) + sp.sqrt(3) / 2 * sp.I
    return e.subs(sub) if sub else e

def num(e):
    try:
        v = complex(sp.N(e, 30))
        if math.isfinite(v.real) and math.isfinite(v.imag): return v
    except Exception:
        pass
    return None

def same_numeric(a, b, tol):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))

def same_symbolic(ea, eb, syms):
    rnd = random.Random(7); bad = 0; tried = 0
    for _ in range(12):
        sub = {s: sp.Rational(rnd.randint(11, 97), rnd.choice([7, 9, 13])) for s in syms}
        a, b = num(ea.subs(sub)), num(eb.subs(sub))
        if a is None or b is None: continue
        tried += 1
        if not same_numeric(a, b, 1e-7): bad += 1
    return None if tried < 3 else bad == 0

def equations(path):
    """yield (lineno, tex, label, lesson) for display-math content of a lesson source."""
    lesson = label = ''
    for n, raw in enumerate(open(path, encoding='utf8'), 1):
        line = raw.rstrip('\n')
        if line.startswith('=== '): lesson = line[4:].split('|')[0].strip(); label = ''; continue
        if line.startswith('>>> '): continue
        m = re.match(r'(?:k|h2):\s*(.*)', line)
        if m and re.search(r'مثال|تمرين|ص\s*\d', m.group(1)): label = m.group(1).strip(); continue
        s = re.sub(r'^\|\s*(?:»\s*)?(?:[a-z]+>\s*)?', '', line)
        if s.startswith('$$'): yield n, s[2:], label, lesson
        elif line.startswith('|') and '$' in s:
            for t in re.findall(r'\$([^$]+)\$', s): yield n, t, label, lesson

def audit(cid):
    files = sorted(glob.glob(os.path.join(ROOT, 'src', cid + '.l*.txt')), key=lambda p: int(re.search(r'\.l(\d+)\.txt$', p).group(1)))
    files += sorted(glob.glob(os.path.join(ROOT, 'src', 'conv', cid + '.ex.txt')))   # exercises converted from the classic book
    errs, review, ok = [], [], 0
    for f in files:
        for n, tex, label, lesson in equations(f):
            # separate statements: ⇒ , ∴ , quad , ; and top-level commas (lists such as x=1 , y=3)
            for stmt, _ in top_split(clean(tex), [r'\Rightarrow', r'\Longrightarrow', r'\implies', r'\therefore', '⇒', r'\quad', r'\qquad', ';', r'\iff', ',', r'\text{or}']):
                if AR.search(stmt): continue
                chain = top_split(stmt, ['=', r'\approx', '≈'])
                if len(chain) < 2: continue
                exprs = [(parse(p), p, sep) for p, sep in chain]
                for (ea, _, _), (eb, pb, sep) in zip(exprs, exprs[1:]):
                    if ea is None or eb is None: continue
                    fa, fb = ea.free_symbols, eb.free_symbols
                    loc = dict(chapter=cid, file=os.path.basename(f), line=n, lesson=lesson, label=label, tex=tex.strip(), a=str(ea), b=str(eb))
                    if not fa and not fb:
                        va, vb = num(ea), num(eb)
                        if va is None or vb is None: continue
                        tol = 0.03 if sep in (r'\approx', '≈') else 1e-9
                        # a written decimal (0.333) is accepted when it is the value rounded to its own places
                        rounded = max((10 ** -len(d) / 2 for d in re.findall(r'\d\.(\d+)\s*$', pb)), default=0)
                        if same_numeric(va, vb, tol) or (rounded and abs(va - vb) <= rounded + 1e-12): ok += 1
                        else: errs.append(dict(loc, kind='numeric', va=fmt(va), vb=fmt(vb)))
                    elif fa == fb and sep == '=' and len(chain) >= 3:
                        # only inside a chain a = b = c (a transformation, not an equation to solve)
                        r = same_symbolic(ea, eb, fa)
                        if r is True: ok += 1
                        elif r is False: review.append(dict(loc, kind='algebraic'))
    return errs, review, ok

def fmt(v):
    return f'{v.real:.6g}' if abs(v.imag) < 1e-12 else f'{v.real:.6g}{v.imag:+.6g}i'

def known():
    p = os.path.join(ROOT, 'tools', 'audit-known.json')
    return {(k['chapter'], k['tex']): k for k in json.load(open(p, encoding='utf8'))['items']} if os.path.exists(p) else {}

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    if out in args: args.remove(out)
    ids = args or sorted({re.sub(r'\.l\d+\.txt$', '', os.path.basename(p)) for p in glob.glob(os.path.join(ROOT, 'src', '*.l*.txt'))})
    allE, allR, allK, tot = [], [], [], 0
    for cid in ids:
        e, r, ok = audit(cid); tot += ok
        K = known(); kn = [x for x in e if (x['chapter'], x['tex']) in K]; e = [x for x in e if (x['chapter'], x['tex']) not in K]
        for x in kn: x['known'] = K[(x['chapter'], x['tex'])]; allK.append(x)
        allE += e; allR += r
        print(f'{cid:6}  checked-equal {ok:5}   numeric-mismatch {len(e):3}   algebra-review {len(r):3}')
    for x in allE: print(f"  ✗ {x['chapter']} {x['file']}:{x['line']} [{x['label'] or x['lesson']}]  {x['a']} = {x['va']}  ≠  {x['b']} = {x['vb']}\n      {x['tex']}")
    for x in allR: print(f"  ? {x['chapter']} {x['file']}:{x['line']} [{x['label'] or x['lesson']}]  {x['a']}  vs  {x['b']}\n      {x['tex']}")
    for x in allK: print(f"  · reviewed ({x['known']['status']}) {x['chapter']} {x['file']}:{x['line']} [{x['label']}]  {x['tex']}")
    print(f'TOTAL links verified {tot} · numeric mismatches {len(allE)} · reviewed/known {len(allK)} · algebra to review {len(allR)}')
    if out: json.dump(dict(errors=allE, review=allR, known=allK, verified=tot), open(out, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    sys.exit(1 if allE else 0)

if __name__ == '__main__':
    main()
