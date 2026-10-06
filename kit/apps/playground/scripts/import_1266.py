"""Import real samples from project 1266 (full OCR pipeline: seg → rec → LiLT extract) as OcrDocument JSON.

Writes apps/playground/public/samples/ (git-ignored: real civil-registry records, internal use only).
Run: python3 apps/playground/scripts/import_1266.py
"""
import csv, json, re
from pathlib import Path
from PIL import Image

SRC = Path('/home/shared/projects/1266_full_pipeline')
OUT = Path(__file__).resolve().parents[1] / 'public' / 'samples'
DOCS = [  # test split, one of each record type plus two more, mid-sized pages
    '007841021_00062-000_preprocessed',  # Birth
    '007839748_00049-000_preprocessed',  # Marriage
    '007839778_00019-000_preprocessed',  # Death
    '007840200_00097-000_preprocessed',  # Birth
    '007840208_00043-000_preprocessed',  # Marriage
]
WIDTH = 1200

def humanize(key: str) -> str:
    return re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', key)

def center_in(b, box):
    cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
    return box[0] <= cx <= box[2] and box[1] <= cy <= box[3]

manifest = {r['doc']: r for r in csv.DictReader(open(SRC / 'manifest.csv'))}
OUT.mkdir(parents=True, exist_ok=True)
index = []
for n, doc in enumerate(DOCS, 1):
    rec = json.load(open(SRC / 'predict_ocr/test/02_rec' / f'{doc}.ocr.json'))
    ext = json.load(open(SRC / 'predict_ocr/test/03_extract' / f'{doc}.json'))
    im = Image.open(SRC / 'images' / f'{doc}.jpg').convert('RGB')
    s = WIDTH / im.width
    im = im.resize((WIDTH, round(im.height * s)), Image.LANCZOS)
    im.save(OUT / f'{doc}.jpg', quality=82, optimize=True)
    sc = lambda b: [round(v * s, 1) for v in b]

    words = [w for p in rec['layout_mask_ocr'][0]['paragraphs'] for l in p['lines'] for w in l['words']]
    lines = [{'id': w['id'], 'text': w['text'], 'confidence': round(w.get('rec_score', w['score']), 4),
              'box': {'x1': sc(w['bbox'])[0], 'y1': sc(w['bbox'])[1], 'x2': sc(w['bbox'])[2], 'y2': sc(w['bbox'])[3]}} for w in words]
    fields = []
    for sp in ext['spans']:
        hit = next((w['id'] for w in words if center_in(w['bbox'], sp['box'])), None)
        fields.append({'key': sp['field'], 'label': humanize(sp['field']), 'value': sp['text'], 'confidence': sp['score'], 'lineId': hit})
    doc_type = manifest.get(doc, {}).get('doc_type') or 'Record'
    out = {
        'fileName': f'{doc}.jpg', 'engine': 'DIGI-XTRACT · 1266 (seg → rec v2 → LiLT v11)',
        'image': {'src': f'/samples/{doc}.jpg', 'width': im.width, 'height': im.height},
        'units': 'px', 'lines': lines, 'fields': fields,
    }
    json.dump(out, open(OUT / f'{doc}.json', 'w'), ensure_ascii=False)
    low = sum(1 for l in lines if l['confidence'] < .8)
    index.append({'id': doc, 'title': f'{doc_type} #{n}', 'docType': doc_type, 'words': len(lines), 'fields': len(fields), 'lowConfidence': low})
    print(f'{doc}  {doc_type:9} {len(lines):3} words  {len(fields):2} fields  {low:2} < 80%')
json.dump(index, open(OUT / 'index.json', 'w'), ensure_ascii=False, indent=1)
