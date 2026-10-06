"""Export vector fills inside a clip rect of a PDF page to a standalone SVG (pip install pymupdf).

Used to pull the horizontal logo from the guideline PDF:
    from pdf_vector_clip import export
    export("guideline.pdf", 6, (706, 276, 1032, 356), "logo-horizontal.svg")
"""
import sys, pymupdf

def hexc(c):
    return '#%02X%02X%02X' % tuple(round(v * 255) for v in c[:3])

def fmt(v):
    return ('%.3f' % v).rstrip('0').rstrip('.')

def export(pdf, pno, clip, out, skip_area=0.5, recolor=None):
    pg = pymupdf.open(pdf)[pno]
    clip = pymupdf.Rect(clip)
    ox, oy = clip.x0, clip.y0
    P = lambda p: f'{fmt(p.x - ox)} {fmt(p.y - oy)}'
    parts = []
    for d in pg.get_drawings():
        r = d['rect']
        if not r.intersects(clip) or d.get('fill') is None:
            continue
        if r.width * r.height > clip.width * clip.height * skip_area:
            continue  # page/panel backgrounds
        segs, cur = [], None
        for it in d['items']:
            op = it[0]
            if op == 're':
                q = it[1]
                segs.append(f'M{P(q.tl)}L{P(q.tr)}L{P(q.br)}L{P(q.bl)}Z'); cur = None
            elif op == 'qu':
                q = it[1]
                segs.append(f'M{P(q.ul)}L{P(q.ur)}L{P(q.lr)}L{P(q.ll)}Z'); cur = None
            else:
                a = it[1]
                if cur is None or abs(cur.x - a.x) > 1e-3 or abs(cur.y - a.y) > 1e-3:
                    segs.append(f'M{P(a)}')
                if op == 'l':
                    segs.append(f'L{P(it[2])}'); cur = it[2]
                elif op == 'c':
                    segs.append(f'C{P(it[2])} {P(it[3])} {P(it[4])}'); cur = it[4]
        if d.get('closePath'):
            segs.append('Z')
        fill = hexc(d['fill'])
        if recolor:
            fill = recolor.get(fill, fill)
        rule = ' fill-rule="evenodd"' if d.get('even_odd') else ''
        op = d.get('fill_opacity', 1)
        opa = f' fill-opacity="{fmt(op)}"' if op is not None and op < 1 else ''
        parts.append(f'<path d="{"".join(segs)}" fill="{fill}"{rule}{opa}/>')
    w, h = fmt(clip.width), fmt(clip.height)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n'
           + '\n'.join(parts) + '\n</svg>\n')
    open(out, 'w').write(svg)
    print(out, len(parts), 'paths')
