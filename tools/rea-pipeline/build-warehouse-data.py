"""Decode original GoodsUse and keep its referenced original prize rows."""
from pathlib import Path
import json,UnityPy
root=Path('work/alignment-v54');(root/'text-assets').mkdir(parents=True,exist_ok=True)
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
name='GoodsUse';start=source.index('public class cfg_'+name+' :');end=source.index('\n}',start)+2
(root/('cfg_'+name+'.cs')).write_text(source[start:end],encoding='utf8')
for obj in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  d=obj.read()
  if d.m_Name==name:(root/'text-assets'/('runtime_'+name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v54')"),'decode','exec'))
uses=json.loads((root/'configs/GoodsUse.json').read_text(encoding='utf8'))
ids={i for u in uses for i in u['arrPrizeID']+u['arrRandomPrize']+u['arrSpecialShowID']}
prizes=[p for p in json.loads(Path('work/alignment-v26/configs/PrizeMain.json').read_text(encoding='utf8')) if p['iPrizeID'] in ids]
Path('outputs/laozu-web/warehouse-data.js').write_text('window.WAREHOUSE_DATA='+json.dumps({'GoodsUse':uses,'PrizeMain':prizes},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('GoodsUse',len(uses),'PrizeMain',len(prizes))
