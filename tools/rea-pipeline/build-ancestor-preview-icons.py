"""Resolve the three native gem icon layers, deduplicating existing PNGs."""
from pathlib import Path
source=Path('tools/rea-pipeline/build-antique-icons.py').read_text(encoding='utf8').replace('antique-v51','ancestor-preview-v57').replace('antique-icons.js','ancestor-preview-icons.js').replace('ANTIQUE_ICONS','ANCESTOR_PREVIEW_ICONS')
start=source.index('data_source=');end=source.index('runtime=')
source=source[:start]+"""data_source=load(web/'ancestor-preview-data.js')
ids={r['iIconID'] for r in data_source['BattleSkill'] if r['iIconID']}
goods=load(web/'resource-data.js')['Goods']
ids|={g[k] for g in goods if g['iSubClass']==16 for k in ['iIconID','iIconID2','iIconID3'] if g[k]}
cfg={c['nID']:c for c in json.loads(Path('work/alignment-v49/configs/Icon.json').read_text(encoding='utf8')) if c['nID'] in ids}
"""+source[end:]
exec(compile(source,__file__,'exec'))
