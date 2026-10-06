"""Real unwarp samples from project stengg: raw page + pz-auto_preprocessing /unwarp output + its lattice.

Calls the live service (AUTOPRE_URL, default http://127.0.0.1:6005) with include_grid=true (dense dewarp).
Writes apps/playground/public/samples/unwarp/ (git-ignored: customer pages, internal use only).
Run: python3 apps/playground/scripts/import_stengg_unwarp.py
"""
import io, json, os, urllib.request, uuid
from pathlib import Path
from PIL import Image

SVC = os.environ.get('AUTOPRE_URL', 'http://127.0.0.1:6005')
BLOBS = Path('/home/shared/projects/stengg/autoflow/data/blobs')
OUT = Path(__file__).resolve().parents[1] / 'public' / 'samples' / 'unwarp'
PAGES = [  # (blob, title)
    ('job-246/gen-p07.jpg', 'Record card on black · strong perspective'),
    ('job-246/gen-p06.jpg', 'Record card on black'),
    ('job-212/gen-p01.jpg', 'Handwritten double page'),
    ('job-219/gen-p01.jpg', 'Tilted microfilm page'),
    ('job-1/gen-p04.jpg', 'Hotel invoice photo (Air France run)'),
]
WIDTH = 900

def post_unwarp(path: Path) -> dict:
    b = f'----dtx{uuid.uuid4().hex}'
    body = io.BytesIO()
    for name, val in (('include_grid', 'true'), ('unwarp_postprocess', 'false')):
        body.write(f'--{b}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{val}\r\n'.encode())
    body.write(f'--{b}\r\nContent-Disposition: form-data; name="image"; filename="{path.name}"\r\nContent-Type: image/jpeg\r\n\r\n'.encode())
    body.write(path.read_bytes()); body.write(f'\r\n--{b}--\r\n'.encode())
    req = urllib.request.Request(f'{SVC}/unwarp', data=body.getvalue(), headers={'Content-Type': f'multipart/form-data; boundary={b}'})
    return json.load(urllib.request.urlopen(req, timeout=180))

def save(im: Image.Image, name: str) -> dict:
    im = im.convert('RGB'); s = WIDTH / im.width
    im = im.resize((WIDTH, round(im.height * s)), Image.LANCZOS)
    im.save(OUT / name, quality=84, optimize=True)
    return {'src': f'/samples/unwarp/{name}', 'width': im.width, 'height': im.height}

OUT.mkdir(parents=True, exist_ok=True)
index = []
for n, (blob, title) in enumerate(PAGES, 1):
    raw_path = BLOBS / blob
    res = post_unwarp(raw_path)
    g = res['grid']
    flat = [round(v, 5) for row in g['points'] for pt in row for v in pt]
    unwarped = Image.open(io.BytesIO(urllib.request.urlopen(f"{SVC}{res['url']}", timeout=60).read()))
    sid = f'stengg-{n}'
    doc = {'id': sid, 'title': title, 'source': f'stengg autoflow blob {blob} · pz-auto_preprocessing /unwarp',
           'raw': save(Image.open(raw_path), f'{sid}-raw.jpg'), 'unwarped': save(unwarped, f'{sid}-unwarped.jpg'),
           'grid': {'cols': g['cols'], 'rows': g['rows'], 'points': flat}}
    json.dump(doc, open(OUT / f'{sid}.json', 'w'))
    dev = max(max(abs(flat[(j * g['cols'] + k) * 2] - k / (g['cols'] - 1)), abs(flat[(j * g['cols'] + k) * 2 + 1] - j / (g['rows'] - 1))) for j in range(g['rows']) for k in range(g['cols']))
    index.append({'id': sid, 'title': title, 'warp': round(dev, 3)})
    print(sid, title, f"{g['cols']}x{g['rows']}", 'max offset', round(dev, 3))
json.dump(index, open(OUT / 'index.json', 'w'), ensure_ascii=False, indent=1)
