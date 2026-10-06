"""Real before/after pairs for pixel cleanup: raw page → pz-auto_preprocessing /preprocess (clean/enhance).

Same pages as import_stengg_unwarp.py. Writes apps/playground/public/samples/enhance/ (git-ignored, internal only).
Run: python3 apps/playground/scripts/import_stengg_enhance.py
"""
import io, json, os, urllib.request, uuid
from pathlib import Path
from PIL import Image

SVC = os.environ.get('AUTOPRE_URL', 'http://127.0.0.1:6005')
BLOBS = Path('/home/shared/projects/stengg/autoflow/data/blobs')
OUT = Path(__file__).resolve().parents[1] / 'public' / 'samples' / 'enhance'
PAGES = [('job-246/gen-p07.jpg', 'Record card on black'), ('job-212/gen-p01.jpg', 'Handwritten double page'),
         ('job-219/gen-p01.jpg', 'Tilted microfilm page'), ('job-1/gen-p04.jpg', 'Hotel invoice photo'), ('job-214/gen-p01.jpg', 'Marriage record, dark border')]
WIDTH = 900

def post(path: Path, route: str) -> dict:
    b = f'----dtx{uuid.uuid4().hex}'
    body = f'--{b}\r\nContent-Disposition: form-data; name="image"; filename="{path.name}"\r\nContent-Type: image/jpeg\r\n\r\n'.encode() + path.read_bytes() + f'\r\n--{b}--\r\n'.encode()
    req = urllib.request.Request(f'{SVC}{route}', data=body, headers={'Content-Type': f'multipart/form-data; boundary={b}'})
    return json.load(urllib.request.urlopen(req, timeout=180))

def save(im: Image.Image, name: str) -> dict:
    im = im.convert('RGB'); im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
    im.save(OUT / name, quality=84, optimize=True)
    return {'src': f'/samples/enhance/{name}', 'width': im.width, 'height': im.height}

OUT.mkdir(parents=True, exist_ok=True)
index = []
for n, (blob, title) in enumerate(PAGES, 1):
    raw = Image.open(BLOBS / blob)
    res = post(BLOBS / blob, '/preprocess')
    enhanced = Image.open(io.BytesIO(urllib.request.urlopen(f"{SVC}{res['url']}", timeout=60).read()))
    if enhanced.size != raw.size:  # keep the pair pixel-aligned for sliders and scans
        enhanced = enhanced.resize(raw.size, Image.LANCZOS)
    sid = f'enhance-{n}'
    index.append({'id': sid, 'title': title, 'source': f'stengg autoflow blob {blob} · pz-auto_preprocessing /preprocess',
                  'before': save(raw, f'{sid}-raw.jpg'), 'after': save(enhanced, f'{sid}-enhanced.jpg')})
    print(sid, title, raw.size)
json.dump(index, open(OUT / 'index.json', 'w'), ensure_ascii=False, indent=1)
