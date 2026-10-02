"""Rebuild deployable portraits: uv run --with pillow==12.3.0 python scripts/optimize-images.py."""
import hashlib
import io
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'references' / 'portraits-original'
OUTPUT = ROOT / 'public' / 'year-frames'
manifest = json.loads((SOURCE / 'manifest.json').read_text(encoding='utf-8'))
OUTPUT.mkdir(parents=True, exist_ok=True)
frames = []
total_before = total_after = 0
for entry in manifest['frames']:
    source = SOURCE / entry['file']
    with Image.open(source) as original:
        image = original.convert('RGBA').resize((768, 768), Image.Resampling.LANCZOS)
        encoded = io.BytesIO()
        # Lossless keeps the two cel-style versions' linework clean; 3D uses quality 86.
        image.save(encoded, format='WEBP', lossless=entry['year'] <= 2013,
                   quality=86, method=6, exact=True)
    data = encoded.getvalue()
    digest = hashlib.sha256(data).hexdigest()
    filename = f'{source.stem}.{digest[:12]}.webp'
    (OUTPUT / filename).write_bytes(data)
    with Image.open(io.BytesIO(data)) as decoded:
        assert decoded.size == (768, 768)
        assert decoded.mode == 'RGBA'
        assert decoded.getpixel((0, 0))[3] == 0
    frames.append({**entry, 'file': filename, 'width': 768, 'height': 768, 'sha256': digest})
    total_before += source.stat().st_size
    total_after += len(data)
    print(f'{source.name}: {source.stat().st_size:,} -> {len(data):,} bytes')
target = ROOT / 'src' / 'data' / 'frames.json'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps({'version': 1, 'width': 768, 'height': 768, 'frames': frames},
                            ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Total: {total_before:,} -> {total_after:,} bytes ({100 * (1-total_after/total_before):.1f}% smaller)')
