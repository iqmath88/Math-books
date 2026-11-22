#!/usr/bin/env python3
"""Reference chapter (6th scientific · ch.3 · applications of differentiation): every example's final answer,
solved independently with SymPy, must equal the book value AND appear inside that example's block in src/g12c3.l*.txt.
usage: python3 tests/g12c3-answers.test.py        (needs: pip install sympy)"""
from sympy import *            # first: sympy exports re/N/S, the std-lib names below must win
import glob, os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = {int(re.search(r'l(\d+)\.txt$', p).group(1)): open(p, encoding='utf8').read() for p in glob.glob(os.path.join(ROOT, 'src', 'g12c3.l*.txt'))}

def block(f, label):
    """text of the example whose k: line starts with label, up to the next k: example/exercise line"""
    s = SRC[f]; i = s.find('k: ' + label)
    assert i >= 0, f'l{f}: «{label}» not found'
    j = re.compile(r'^k: (?:مثال|تمارين|تمرين)', re.M).search(s, i + 3)
    return s[i:j.start() if j else len(s)]

x, b, A, B, C = symbols('x b A B C', real=True)
def crit(f): return sorted(solve(diff(f, x), x), key=lambda v: float(v))
def approx(e, a0, h): return float(e.subs(x, a0) + h * diff(e, x).subs(x, a0))

CASES = []   # (lesson file, example label, computed, expected, text that must be in the block)
def case(f, lab, got, exp, *snip): CASES.append((f, lab, got, exp, snip))

# 3−1 related rates
case(1, 'مثال 1 · ص 92', Rational(-4, 10) / 4, Rational(-1, 10), r'\dfrac{dh}{dt}=-0.1')           # V = 4h
case(1, 'مثال 2 · ص 92', -Rational(8, 12) * 2, Rational(-4, 3), r'-\dfrac43')                      # 96 = Lw, w=8 → L=12
case(1, 'مثال 3 · ص 93', Rational(-6) / (3 * 10**2) / 2, Rational(-1, 100), '-0.01')                # V = (8+2s)^3, s=1
case(1, 'مثال 5 · ص 95', Rational(4) / (pi / 9 * 144), 1 / (4 * pi), r'\dfrac{1}{4\pi}')         # V = πh³/27, h=12
case(1, 'مثال 4 · ص 94', -Rational(8, 6) * 2, Rational(-8, 3), r'\dfrac{-8}{3}')                   # x²+y²=100
S = sqrt((4 - 7)**2 + 16); case(1, 'مثال 6 · ص 96', Rational(2, 10) * S / (4 - 7 + 2), -1, r'\dfrac{dx}{dt}&=-1')
# 3−2 Rolle · MVT
case(2, 'مثال 2 · a · ص 100', crit((2 - x)**2), [2], r'\ccc{c=2}')
f = 9*x + 3*x**2 - x**3; case(2, 'مثال 2 · b · ص 101', (f.subs(x, -1), f.subs(x, 1)), (-5, 11), '')
f = x**2 - 6*x + 4; case(3, 'مثال 3 · a · ص 103', solve(Eq(diff(f, x), (f.subs(x, 7) - f.subs(x, -1)) / 8), x), [3], r'\ccc{c=3}')
f = sqrt(25 - x**2); case(3, 'مثال 3 · b · ص 104', solve(Eq(diff(f, x), (f.subs(x, 0) - f.subs(x, -4)) / 4), x), [-sqrt(5)], r'\ccc{c=-\sqrt5}')
f = x**3 - 4*x**2; case(3, 'مثال 4 · ص 105', solve(Eq(diff(f, x).subs(x, Rational(2, 3)), f.subs(x, b) / b), b), [2], 'b=2')
# 3−2−6 approximation (book rounding kept)
case(4, 'مثال 5 · ص 106', approx(sqrt(x), 25, 1), 5.1, '=5.1')
case(4, 'مثال 6 · ص 107', approx(x**3 + 3*x**2 + 4*x + 5, 1, Rational(1, 1000)), 13.013, '13.013')
case(4, 'مثال 7 · ص 107', approx(x**3, 10, Rational(-2, 100)), 994, '994')
case(4, 'مثال 9 · ص 108', float(Rational(3, 10) * 300), 90, '=90')
case(4, 'مثال 10 · a · ص 109', approx(x**Rational(3, 5) + x**4 + 3, 1, Rational(-2, 100)), 4.908, '4.908')
case(4, 'مثال 10 · c · ص 110', approx(sqrt(x) + x**Rational(1, 4), 16, 1), 6.15625, '6.156')
# 3−3 / 3−4 monotonic · extrema
case(5, 'مثال 2 · a · ص 114', crit(9*x + 3*x**2 - x**3), [-1, 3], r'(-1\,,\,3)')
f = x**3 - 9*x**2 + 24*x; case(5, 'مثال 3 · c · ص 118', [(p, f.subs(x, p)) for p in crit(f)], [(2, 20), (4, 16)], r'(2\,,\,20)', r'(4\,,\,16)')
# 3−5 concavity
f = 2*x**3 - 3*x**2 - 12*x + 1; p = solve(diff(f, x, 2), x)[0]; case(6, 'مثال 2 · ص 121', (p, f.subs(x, p)), (Rational(1, 2), Rational(-11, 2)), r'\tfrac{-11}2')
f = 4*x**3 - x**4; case(6, 'مثال 3 · a · ص 122', [(p, f.subs(x, p)) for p in solve(diff(f, x, 2), x)], [(0, 0), (2, 16)], r'(2\,,\,16)')
# 3−6 second derivative test
f = 6*x - 3*x**2 - 1; case(6, 'مثال 1 · a · ص 125', [f.subs(x, p) for p in crit(f)], [2], 'f(1)=6-3-1=2')
f = x - 4/x**2; case(6, 'مثال 1 · b · ص 125', [f.subs(x, p) for p in crit(f)], [-3], 'f(-2)=-2-1=-3')
f = x**3 - 3*x**2 - 9*x; case(6, 'مثال 1 · c · ص 126', [f.subs(x, p) for p in crit(f)], [5, -27], 'f(-1)=5', 'f(3)=27-27-27=-27')
a = symbols('a'); f = x**2 + a/x; sa = solve(diff(f, x, 2).subs(x, 1), a)
case(6, 'مثال 2 · ص 127', sa, [-1], 'a=-1')
f = A*x**3 + B*x**2 + C; case(6, 'مثال 4 · ص 129', solve([diff(f, x, 2).subs(x, 1), f.subs(x, 3) - 1, diff(f, x).subs(x, 3) + 9], [A, B, C]), {A: -1, B: 3, C: 1}, 'a=-1', 'c=1')
f = A*x**3 + 3*x**2 + C; sA = solve(diff(f, x, 2).subs(x, 1), A)[0]; f = f.subs(A, sA)
m = [p for p in crit(f) if diff(f, x, 2).subs(x, p) < 0][0]; case(6, 'مثال 5 · ص 130', (sA, m, solve(f.subs(x, m) - 8, C)), (-1, 2, [4]), 'c=4')
# 3−8 optimisation
case(8, 'مثال 1 · ص 140', crit(x + x**2), [Rational(-1, 2)], r'-\tfrac12')
f = x * (12 - 2*x)**2; case(8, 'مثال 2 · ص 141', [(p, f.subs(x, p)) for p in crit(f) if 0 < p < 6], [(2, 128)], '128')
h = symbols('h', positive=True); Ar = sqrt(24*h - h**2) * h; ho = [p for p in solve(diff(Ar, h), h) if p > 0][0]
case(8, 'مثال 3 · ص 142', (ho, 2*sqrt(24*ho - ho**2), simplify(Ar.subs(h, ho) / (144*pi))), (18, 12*sqrt(3), 3*sqrt(3)/(4*pi)), r'12\sqrt3', r'\dfrac{3\sqrt3}{4\pi}')
w = symbols('w'); Ar = w * 18 * (1 - w/24); wo = solve(diff(Ar, w), w)[0]
case(8, 'مثال 4 · ص 143', (18*(1 - wo/24), wo, Ar.subs(w, wo)), (9, 12, 108), 'x=9', r'12\,\text{cm}', '108')
r = symbols('r', positive=True); s = (60 - 2*pi*r)/4; ro = solve(diff(pi*r**2 + s**2, r), r)[0]
case(8, 'مثال 5 · ص 145', simplify(2*ro - s.subs(r, ro)), 0, 'x=2r')
y = symbols('y'); yo = solve(diff((y**2 - 3) + (y - 4)**2, y), y)[0]; case(8, 'مثال 6 · ص 146', (yo, sqrt(yo**2 - 3)), (2, 1), r'(1\,,\,2)\,,\;(-1\,,\,2)')

def same(g, e):
    if isinstance(g, (list, tuple)): return isinstance(e, (list, tuple)) and len(g) == len(e) and all(same(a, c) for a, c in zip(g, e))
    if isinstance(g, dict): return g.keys() == e.keys() and all(same(g[k], e[k]) for k in g)
    try: return abs(complex(N(g)) - complex(N(e))) < 5e-4
    except TypeError: return g == e

bad = 0
for f, lab, got, exp, snip in CASES:
    blk = block(f, lab); miss = [t for t in snip if t and t not in blk]; ok = same(got, exp) and not miss
    bad += not ok
    print(('PASS' if ok else 'FAIL'), f'l{f} {lab:22}', '' if ok else f'got={got} expected={exp} missing={miss}')
print(f'{len(CASES) - bad}/{len(CASES)} reference-chapter answers verified')
sys.exit(1 if bad else 0)
