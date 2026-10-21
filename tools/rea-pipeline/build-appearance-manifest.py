"""Publish source animation mapping after all four render shards have completed."""
import json
import pathlib
import hashlib
from PIL import Image

root = pathlib.Path('work/alignment-v25')
out = pathlib.Path('outputs/laozu-web')
specs = json.loads((root / 'specs.json').read_text(encoding='utf8'))
clips = sum([json.loads((root / f'manifest-{i}.json').read_text()) for i in range(4)], [])
mapping, art = {}, {}
for spec in specs:
    spec['skeletonHashes'] = {}
    for name in [spec['file'], spec['file'].replace('_skel_main', '_skel_dynamic')]:
        spec['skeletonHashes'][name] = hashlib.sha256((pathlib.Path('work/apk-analysis/text-assets') / name).read_bytes()).hexdigest()
    selected = [c for c in clips if c['character'] == spec['id']]
    assert selected and all(not c['missingPaths'] for c in selected), spec['id']
    pose = out / 'assets/transmog-v25' / (spec['id'] + '-full.png')
    x0, y0, x1, y1 = Image.open(pose).getchannel('A').getbbox()
    margin = max(x1 - x0, y1 - y0) * .09
    view_box = ' '.join(str(round(n, 2)) for n in [x0-margin, y0-margin, x1-x0+2*margin, y1-y0+2*margin])
    entry = {'character': spec['id'], 'viewBox': view_box, 'clips': {}}
    idle = next(c for c in selected if c['animation'] == 'idle')
    for c in selected:
        file = out / 'assets/transmog-v25' / c['file']
        assert file.is_file(), file
        with Image.open(file) as atlas:
            assert atlas.size == (320 * c['frames'], 420), file
        c['sha256'] = hashlib.sha256(file.read_bytes()).hexdigest()
        scale = idle['factor'] / c['factor']
        transform = f"translate({idle['tx']-c['tx']*scale} {idle['ty']-c['ty']*scale}) scale({scale})"
        entry['clips'][c['animation']] = {'file': 'assets/transmog-v25/' + c['file'], 'duration': c['duration'], 'frames': c['frames'], 'transform': transform}
    assert all(n in entry['clips'] for n in ['idle', 'atk', 'die']), spec['id']
    for skin_id in spec['skinIds']:
        mapping[skin_id] = entry
        art[skin_id] = 'assets/transmog-v25/' + spec['id'] + '-full.png'
(out / 'appearance-motion-data.js').write_text('window.APPEARANCE_MOTION_DATA=' + json.dumps(mapping) + ';\n', encoding='utf8')
(out / 'transmog-art-data.js').write_text('window.TRANSMOG_ART_DATA=' + json.dumps(art) + ';\nwindow.TRANSMOG_ICON_DATA={};\n', encoding='utf8')
(out / 'assets/transmog-v25/provenance.json').write_text(json.dumps({'sources': specs, 'clips': clips}, indent=2), encoding='utf8')
print(json.dumps({'characters': len(specs), 'skins': len(mapping), 'animations': len(clips)}))
