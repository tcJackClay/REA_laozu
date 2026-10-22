"""Export original antique and linked lottery configuration."""
from pathlib import Path
import json,UnityPy,zipfile,re,hashlib
root=Path('work/alignment-v49');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');names=['Gubao','GubaoSuit','Attribute','Goods','Icon','Misc','Privilege','Lootbox','LootboxPool','LootboxGuarantee','LootboxPoolItemGroup','TextDescFight']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for o in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v49')"),'decode','exec'))
load=lambda name:json.loads((root/'configs'/f'{name}.json').read_text(encoding='utf8'))


data={name:load(name) for name in names if (root/'configs'/(name+'.json')).exists()}
data['qualityNames']=re.findall(r'"([^"]+)"',re.search(r'gubaoQualityName = new string\[7\] \{([^}]+)',s).group(1))
# Retain the linked antique system, rather than unrelated lottery systems.
data['Lootbox']=[r for r in data['Lootbox'] if r['iSystemType']==3]
pool_ids={r['iID'] for r in data['Lootbox']}
data['LootboxPool']=[r for r in data['LootboxPool'] if r['iBoxId'] in pool_ids]
guarantee_ids={i for r in data['Lootbox'] for i in r['arrGuaranteeRules']}
data['LootboxGuarantee']=[r for r in data['LootboxGuarantee'] if r['iId'] in guarantee_ids]
goods_ids={a[i] for r in data['Gubao'] for k,a in r.items() if k.startswith('arrCost_') for i in range(0,len(a),2)}
for r in data['Lootbox']:goods_ids.update([r['iGoodID'],r['iCurrency']])
goods_ids.update(r['iGoodID'] for r in data['LootboxPool'])
goods_ids.update(r['iBindGoods'] for r in data['Privilege'] if r['iBindGoods'])
data['Goods']=[r for r in data['Goods'] if r['iGoodsID'] in goods_ids]
icon_ids={r['iGubaoiIconID'] for r in data['Gubao']}|{r['iIconID'] for r in data['Goods']}|{r[k] for r in data['Lootbox'] for k in ['iBgID','iImageID']}
data['Icon']=[r for r in data['Icon'] if r['nID'] in icon_ids]
Path('outputs/laozu-web/antique-data.js').write_text('window.ANTIQUE_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print({k:len(v) for k,v in data.items()})
