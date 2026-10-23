"""Import the fixed PokeCatch evidence pack; no network or original cloud calls."""
import argparse, hashlib, json, struct
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('reference', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
target = root / 'outputs/laozu-web/poke'
target.mkdir(parents=True, exist_ok=True)
source = args.reference / 'evidence'
manifest = {'source': 'PokeCatch fixed deployment 2026-10-22', 'inputs': [], 'assets': []}
def read(path):
    b = path.read_bytes()
    manifest['inputs'].append({'path': str(path.relative_to(args.reference)).replace('\\', '/'), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)})
    return b
catalog = {}
for name in ['POKEDEX', 'MOVES', 'TYPE_CHART', 'SPRITE_BOUNDS']:
    value = json.loads(read(source / f'runtime-data/{name}.json').decode('utf-8-sig'))
    if name == 'POKEDEX':
        value = [{k: s[k] for k in ['id', 'name', 'types', 'stats', 'learn']} for s in value]
    catalog[name] = value
packs = json.loads(read(source / 'source/packs.json').decode('utf-8-sig'))
catalog['SPRITE_SIZES'] = {}
for group in ['pokemon', 'items', 'badges', 'ui', 'faces']:
    pack = packs[group]
    blob = read(source / ('source' + pack['url']))
    for path, (offset, length, mime) in pack['files'].items():
        data = blob[offset:offset + length]
        if len(data) != length:
            raise ValueError(f'truncated pack: {path}')
        out = target / path.removeprefix('/assets/')
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        if group == 'pokemon' and data.startswith(b'\x89PNG'):
            catalog['SPRITE_SIZES'][path.removeprefix('/')] = list(struct.unpack('>II', data[16:24]))
        manifest['assets'].append({'path': str(out.relative_to(target)).replace('\\', '/'), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)})
(target / 'catalog.js').write_text('globalThis.POKE_CATALOG=' + json.dumps(catalog, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
(target / 'source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'species': len(catalog['POKEDEX']), 'moves': len(catalog['MOVES']), 'assets': len(manifest['assets'])}))
