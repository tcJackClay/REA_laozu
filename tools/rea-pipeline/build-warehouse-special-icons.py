"""Resolve the three native gem icon layers, deduplicating existing PNGs."""
from pathlib import Path
source=Path('tools/rea-pipeline/build-antique-icons.py').read_text(encoding='utf8').replace('antique-v51','warehouse-special-v56').replace('antique-icons.js','warehouse-special-icons.js').replace('ANTIQUE_ICONS','WAREHOUSE_SPECIAL_ICONS')
start=source.index('data_source=');end=source.index('runtime=')
source=source[:start]+"""data_source=load(web/'warehouse-special-data.js')
ids={r[k] for r in data_source['Gem'] for k in ['iIcon','iIconID2','iIconID3'] if r[k]}
goods=load(web/'resource-data.js')['Goods']
ids|={g[k] for g in goods if g['iSubClass']==17 for k in ['iIconID','iIconID2','iIconID3'] if g[k]}
cfg={c['nID']:c for c in json.loads(Path('work/alignment-v49/configs/Icon.json').read_text(encoding='utf8')) if c['nID'] in ids}
"""+source[end:]
exec(compile(source,__file__,'exec'))
