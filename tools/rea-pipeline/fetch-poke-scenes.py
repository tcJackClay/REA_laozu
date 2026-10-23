"""Fetch only scene paths explicitly present in the fixed PokeCatch deployment."""
import hashlib, json, urllib.request
from pathlib import Path

out = Path(__file__).resolve().parents[2] / 'outputs/laozu-web/poke/scenes'
out.mkdir(parents=True, exist_ok=True)
records = []
for name in ['39-bourg-palette-710x400.webp', '02-chemin-boise-lisiere-710x400.webp']:
    url = 'https://pokecatch-online.netlify.app/assets/bg/scenes/' + name
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://pokecatch-online.netlify.app/'})
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()
        if not data.startswith(b'RIFF') or data[8:12] != b'WEBP':
            raise ValueError('not a WebP image: ' + url)
        etag = response.headers.get('ETag')
    (out / name).write_bytes(data)
    records.append({'url': url, 'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'etag': etag,
                    'provenance': 'path from fixed app.f5605635e3.js; bytes fetched 2026-10-23, not part of original five packs'})
(out / 'manifest.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
print(json.dumps(records))
