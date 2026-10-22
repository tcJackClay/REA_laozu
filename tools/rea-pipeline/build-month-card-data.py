"""Decode original card definitions; keep referenced daily/buy rewards and prices."""
from pathlib import Path
import json,UnityPy
root=Path('work/alignment-v59');(root/'text-assets').mkdir(parents=True,exist_ok=True)
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');names=['MonthlyCard','Recharge']
for name in names:
 start=source.index('public class cfg_'+name+' :');end=source.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(source[start:end],encoding='utf8')
for obj in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  d=obj.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v59')"),'decode','exec'))
data={name:json.loads((root/('configs/'+name+'.json')).read_text(encoding='utf8')) for name in names}
ids={p for c in data['MonthlyCard'] for p in c['arrDayPrizeID']+[c['iBuyPrizeID']]}
data['PrizeMain']=[p for p in json.loads(Path('work/alignment-v26/configs/PrizeMain.json').read_text(encoding='utf8')) if p['iPrizeID'] in ids]
pay={c['iPayID'] for c in data['MonthlyCard']};data['Recharge']=[r for r in data['Recharge'] if r['iID'] in pay]
Path('outputs/laozu-web/month-card-data.js').write_text('window.MONTH_CARD_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print({n:len(v) for n,v in data.items()})
