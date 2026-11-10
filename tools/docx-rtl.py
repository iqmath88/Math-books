"""Finish a pandoc-made lesson .docx: Arabic RTL everywhere, box styles, A4, header/footer.
usage: python3 tools/docx-rtl.py raw.docx out.docx "<header title>"   (called by lesson-docx-part.cjs)"""
import sys, re, copy
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

raw, out, head = sys.argv[1:4]
d = Document(raw)
AR = re.compile('[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]')
FONT_CS, FONT_L = 'Arial', 'Calibri'
NAVY, GRAY = RGBColor(0x12, 0x3A, 0x6B), RGBColor(0x55, 0x62, 0x7A)

def sub(parent, tag, **attrs):
    e = parent.find(qn(tag))
    if e is None:
        e = OxmlElement(tag); parent.append(e)
    for k, v in attrs.items(): e.set(qn(k), str(v))
    return e

def ppr_bidi(ppr):
    if ppr.find(qn('w:bidi')) is None:
        b = OxmlElement('w:bidi'); ppr.insert(0, b)

def fonts(rpr, size=None, color=None, bold=None):
    sub(rpr, 'w:rFonts', **{'w:ascii': FONT_L, 'w:hAnsi': FONT_L, 'w:cs': FONT_CS})
    if bold is not None:
        sub(rpr, 'w:b', **{'w:val': '1' if bold else '0'}); sub(rpr, 'w:bCs', **{'w:val': '1' if bold else '0'})
    if color: sub(rpr, 'w:color', **{'w:val': color})
    if size:
        sub(rpr, 'w:sz', **{'w:val': int(size * 2)}); sub(rpr, 'w:szCs', **{'w:val': int(size * 2)})

def box(ppr, fill=None, line=None, style='single', sz=8):
    if line:
        bd = sub(ppr, 'w:pBdr')
        for side in ('top', 'left', 'bottom', 'right'):
            sub(bd, 'w:' + side, **{'w:val': style, 'w:sz': sz, 'w:space': 4, 'w:color': line})
    if fill: sub(ppr, 'w:shd', **{'w:val': 'clear', 'w:color': 'auto', 'w:fill': fill})

def find_style(name):
    key = name.replace(' ', '').lower()
    for s in d.styles:
        if (s.name or '').replace(' ', '').lower() == key or (s.style_id or '').lower() == key: return s
def pstyle(name, base='Normal'):
    s = find_style(name)
    if s is None: s = d.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH); s.base_style = find_style(base)
    return s

def cstyle(name):
    try: return d.styles[name]
    except KeyError: return d.styles.add_style(name, WD_STYLE_TYPE.CHARACTER)

# --- base styles
for nm in ('Normal', 'Body Text', 'First Paragraph', 'Compact'):
    try: s = d.styles[nm]
    except KeyError: continue
    ppr = s.element.get_or_add_pPr(); ppr_bidi(ppr)
    fonts(s.element.get_or_add_rPr(), size=12)
    s.paragraph_format.space_before = Pt(2); s.paragraph_format.space_after = Pt(4); s.paragraph_format.line_spacing = 1.15
heads = {'Title': (24, NAVY), 'Subtitle': (13, GRAY), 'Heading 2': (17, NAVY), 'Heading 3': (14.5, RGBColor(0x0F, 0x17, 0x29)), 'Heading 4': (13, NAVY)}
for nm, (sz, col) in heads.items():
    s = pstyle(nm); ppr = s.element.get_or_add_pPr(); ppr_bidi(ppr)
    fonts(s.element.get_or_add_rPr(), size=sz, bold=nm != 'Subtitle', color=str(col))
    s.font.italic = False; s.paragraph_format.keep_with_next = True
    if nm == 'Heading 2':
        bd = sub(ppr, 'w:pBdr'); sub(bd, 'w:bottom', **{'w:val': 'single', 'w:sz': 12, 'w:space': 2, 'w:color': '123A6B'})
        s.paragraph_format.space_before = Pt(16)

P = {  # name: (fill, line, line-style, size, color, bold, align, indent)
    'Law':        ('FFF8E1', 'E0A800', 'single', 12, None, None, None, 0),
    'Clarify':    ('EEFAF4', '0F9D74', 'dashed', 11.5, None, None, None, 0),
    'Note':       ('F2F6FC', '9DB3D6', 'single', 12, None, None, None, 0),
    'BookError':  ('FDECEC', 'D04545', 'single', 11.5, None, None, None, 0),
    'TeacherNote':('F5F0FF', '7C5CD6', 'single', 11.5, None, None, None, 0),
    'Solution':   ('F3F8FF', 'A9C2EC', 'single', 11.5, None, None, None, 0),
    'Rule':       ('FFF3B0', 'E0B000', 'single', 12, None, True, 'center', 0),
    'Kicker':     (None, None, None, 9.5, '55627A', None, None, 0),
    'StepHead':   (None, None, None, 12.5, '123A6B', True, None, 0),
    'Badges':     (None, None, None, 9, None, None, None, 0),
    'Figure':     (None, None, None, 12, None, None, 'center', 0),
    'Caption':    (None, None, None, 9, '55627A', None, 'center', 0),
    'Answer':     (None, None, None, 12, '3B4A63', None, None, 0),
    'Option':     (None, None, None, 12, None, None, None, 0.8),
    'OptionRight':('EAF7EF', None, None, 12, '0F7A4E', True, None, 0.8),
    'KeyItem':    (None, 'C9D3E6', 'single', 11.5, None, None, None, 0),
    'TableHead':  (None, None, None, 11, '0F7A4E', None, None, 0),
    'CoverBand':  ('123A6B', None, None, 10.5, 'FFFFFF', True, None, 0),
    'CoverNo':    (None, None, None, 13, '2563C9', True, None, 0),
    'CoverMeta':  (None, None, None, 10, '55627A', None, None, 0),
}
for nm, (fill, line, ls, sz, col, b, al, ind) in P.items():
    s = pstyle(nm); ppr = s.element.get_or_add_pPr(); ppr_bidi(ppr)
    box(ppr, fill, line, ls or 'single')
    fonts(s.element.get_or_add_rPr(), size=sz, color=col, bold=b)
    pf = s.paragraph_format; pf.space_before = Pt(1); pf.space_after = Pt(1)
    if al == 'center': pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if ind: pf.right_indent = Cm(ind)   # RTL: "right" is the start side
    if nm in ('StepHead', 'Kicker', 'Badges', 'Figure', 'TableHead'): pf.keep_with_next = True
    if nm == 'KeyItem':
        bd = ppr.find(qn('w:pBdr'))
        for side in ('top', 'left', 'right'): bd.remove(bd.find(qn('w:' + side)))
for nm, col in {'Exam': 'B42318', 'Enrich': '6D3FC0', 'Activity': 'B45309', 'BookTag': '1D4ED8'}.items():
    s = cstyle(nm); fonts(s.element.get_or_add_rPr(), size=9, color=col, bold=True)

# --- every paragraph and run
body = d.element.body
for p in body.iter(qn('w:p')):
    ppr = p.find(qn('w:pPr'))
    if ppr is None: ppr = OxmlElement('w:pPr'); p.insert(0, ppr)
    ppr_bidi(ppr)
    for r in p.findall('.//' + qn('w:r')):
        t = ''.join(x.text or '' for x in r.findall(qn('w:t')))
        rpr = r.find(qn('w:rPr'))
        if rpr is None: rpr = OxmlElement('w:rPr'); r.insert(0, rpr)
        if rpr.find(qn('w:b')) is not None and rpr.find(qn('w:bCs')) is None: rpr.append(OxmlElement('w:bCs'))
        if rpr.find(qn('w:i')) is not None and rpr.find(qn('w:iCs')) is None: rpr.append(OxmlElement('w:iCs'))
        if AR.search(t): sub(rpr, 'w:rtl')
# headings: the answer key starts on a new page
for p in d.paragraphs:
    if p.style.name.startswith('Heading 2') and 'مفتاح الحلول' in p.text: p.paragraph_format.page_break_before = True

# --- tables: RTL, borders, header shading
for tbl in d.tables:
    tpr = tbl._tbl.tblPr
    sub(tpr, 'w:bidiVisual')
    sub(tpr, 'w:jc', **{'w:val': 'center'})
    bd = sub(tpr, 'w:tblBorders')
    for side in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        sub(bd, 'w:' + side, **{'w:val': 'single', 'w:sz': 6, 'w:space': 0, 'w:color': 'B8C4DA'})
    for i, row in enumerate(tbl.rows):
        for c in row.cells:
            tcpr = c._tc.get_or_add_tcPr()
            if i == 0: sub(tcpr, 'w:shd', **{'w:val': 'clear', 'w:color': 'auto', 'w:fill': 'E8EEF8'})
            for p in c.paragraphs: p.alignment = WD_ALIGN_PARAGRAPH.CENTER

# --- figures: float at the left margin (6.4 cm), text wraps on the right like the PDF.
#     The drawing moves into the paragraph after its caption; figure + caption paragraphs go.
from docx.oxml.ns import nsdecls
from lxml import etree
WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
FW = Cm(6.4)
for p in list(d.paragraphs):
    if p.style.name != 'Figure': continue
    inl = p._p.find('.//{%s}inline' % WP)
    if inl is None: continue
    ext = inl.find('{%s}extent' % WP); cx, cy = int(ext.get('cx')), int(ext.get('cy'))
    ncx, ncy = int(FW), int(cy * FW / cx)
    for e in inl.iter():
        if e.tag.endswith('}extent') or e.tag.endswith('}ext'):
            if e.get('cx'): e.set('cx', str(ncx)); e.set('cy', str(ncy))
    anc = etree.SubElement(inl.getparent(), '{%s}anchor' % WP)
    for k, v in dict(distT='0', distB='72000', distL='0', distR='180000', simplePos='0', relativeHeight='2', behindDoc='0', locked='0', layoutInCell='1', allowOverlap='0').items(): anc.set(k, v)
    etree.SubElement(anc, '{%s}simplePos' % WP, x='0', y='0')
    ph = etree.SubElement(anc, '{%s}positionH' % WP, relativeFrom='margin'); etree.SubElement(ph, '{%s}align' % WP).text = 'left'
    pv = etree.SubElement(anc, '{%s}positionV' % WP, relativeFrom='paragraph'); etree.SubElement(pv, '{%s}posOffset' % WP).text = '0'
    kids = list(inl)
    for k in kids:
        if k.tag.endswith('}extent'): anc.append(k)
    eff = etree.SubElement(anc, '{%s}effectExtent' % WP, l='0', t='0', r='0', b='0')
    etree.SubElement(anc, '{%s}wrapSquare' % WP, wrapText='bothSides')
    for k in kids:
        if not (k.tag.endswith('}extent') or k.tag.endswith('}effectExtent')): anc.append(k)
    inl.getparent().remove(inl)
    run = anc.getparent().getparent()          # w:drawing -> w:r
    nxt = p._p.getnext()
    while nxt is not None and nxt.tag == qn('w:p') and any(st.get(qn('w:val')) in ('Caption',) for st in nxt.iter(qn('w:pStyle'))):
        dead = nxt; nxt = nxt.getnext(); dead.getparent().remove(dead)
    if nxt is not None and nxt.tag == qn('w:p'):
        ppr = nxt.find(qn('w:pPr')); (ppr.addnext(run) if ppr is not None else nxt.insert(0, run))
        p._p.getparent().remove(p._p)

# --- page, header, footer
def field(par, instr):
    r = par.add_run(); f1 = OxmlElement('w:fldChar'); f1.set(qn('w:fldCharType'), 'begin'); r._r.append(f1)
    r = par.add_run(); it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = instr; r._r.append(it)
    r = par.add_run(); f2 = OxmlElement('w:fldChar'); f2.set(qn('w:fldCharType'), 'end'); r._r.append(f2)
def hf_par(par, text_right, text_left_fn):
    ppr = par._p.get_or_add_pPr(); ppr_bidi(ppr)
    tabs = sub(ppr, 'w:tabs'); sub(tabs, 'w:tab', **{'w:val': 'right', 'w:pos': int(17.4 * 567)})
    r = par.add_run(text_right); fonts(r._r.get_or_add_rPr(), size=8.5, color='7A869C'); sub(r._r.get_or_add_rPr(), 'w:rtl')
    r = par.add_run('\t'); text_left_fn(par)
for sec in d.sections:
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.left_margin = sec.right_margin = Cm(1.8); sec.top_margin = Cm(1.8); sec.bottom_margin = Cm(1.8)
    sec.header_distance = sec.footer_distance = Cm(0.8); sec.gutter = 0
    sec.different_first_page_header_footer = False
    hp = sec.header.paragraphs[0]
    def hl(par):
        r = par.add_run('الرياضيات الحيّة'); fonts(r._r.get_or_add_rPr(), size=8.5, color='7A869C'); sub(r._r.get_or_add_rPr(), 'w:rtl')
    hf_par(hp, head, hl)
    fp = sec.footer.paragraphs[0]
    def fl(par):
        for txt, ins in (('صفحة ', None), (None, 'PAGE'), (' من ', None), (None, 'NUMPAGES')):
            if txt:
                r = par.add_run(txt); fonts(r._r.get_or_add_rPr(), size=8.5, color='7A869C'); sub(r._r.get_or_add_rPr(), 'w:rtl')
            else: field(par, ins)
    hf_par(fp, 'إعداد وتصميم: الأستاذ فائز الحمداني', fl)

# --- Word is strict about child order inside property elements: re-sort what we appended
ORDER = {
 'pPr': 'pStyle keepNext keepLines pageBreakBefore framePr widowControl numPr suppressLineNumbers pBdr shd tabs suppressAutoHyphens kinsoku wordWrap overflowPunct topLinePunct autoSpaceDE autoSpaceDN bidi adjustRightInd snapToGrid spacing ind contextualSpacing mirrorIndents suppressOverlap jc textDirection textAlignment textboxTightWrap outlineLvl divId cnfStyle rPr sectPr pPrChange',
 'rPr': 'rStyle rFonts b bCs i iCs caps smallCaps strike dstrike outline shadow emboss imprint noProof snapToGrid vanish webHidden color spacing w kern position sz szCs highlight u effect bdr shd fitText vertAlign rtl cs em lang eastAsianLayout specVanish oMath',
 'pBdr': 'top left bottom right between bar',
 'tblPr': 'tblStyle tblpPr tblOverlap bidiVisual tblStyleRowBandSize tblStyleColBandSize tblW jc tblCellSpacing tblInd tblBorders shd tblLayout tblCellMar tblLook tblCaption tblDescription',
 'tblBorders': 'top left bottom right insideH insideV',
 'tcPr': 'cnfStyle tcW gridSpan hMerge vMerge tcBorders shd noWrap tcMar textDirection tcFitText vAlign hideMark',
}
ORDER = {qn('w:' + k): {qn('w:' + t): i for i, t in enumerate(v.split())} for k, v in ORDER.items()}
def resort(root):
    for el in root.iter(*ORDER.keys()):
        o = ORDER[el.tag]; kids = list(el)
        kids2 = sorted(kids, key=lambda k: o.get(k.tag, 999))
        if kids2 != kids:
            for k in kids: el.remove(k)
            for k in kids2: el.append(k)
resort(d.element); resort(d.styles.element)
for sec in d.sections: resort(sec.header._element); resort(sec.footer._element)

cp = d.core_properties
cp.author = 'الأستاذ فائز الحمداني'; cp.title = head; cp.language = 'ar-IQ'
d.save(out)
