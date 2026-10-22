"""Resolve original GoodsUse and reward icons, reusing existing PNGs by hash."""
from pathlib import Path
source=Path('tools/rea-pipeline/build-antique-icons.py').read_text(encoding='utf8').replace('antique-v51','warehouse-v54').replace('antique-icons.js','warehouse-icons.js').replace('ANTIQUE_ICONS','WAREHOUSE_ICONS')
start=source.index('data_source=');end=source.index('runtime=')
source=source[:start]+"""data_source=load(web/'resource-data.js');uses=load(web/'warehouse-data.js')
goods={r['iGoodsID']:r for r in data_source['Goods']}
goods_ids={u['iGoodsID'] for u in uses['GoodsUse']}|{i for p in uses['PrizeMain'] for i in p['arrItem1']}
ids={goods[i].get(k,0) for i in goods_ids if i in goods for k in ['iIconID','iIconID2']}-{0}
cfg={c['nID']:c for c in json.loads(Path('work/alignment-v49/configs/Icon.json').read_text(encoding='utf8')) if c['nID'] in ids}
"""+source[end:]
exec(compile(source,__file__,'exec'))
