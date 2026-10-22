"""Decode native gem preview configs from the supplied APK update bundle."""
from pathlib import Path
import json,re,UnityPy
root=Path('work/alignment-v56');(root/'text-assets').mkdir(parents=True,exist_ok=True)
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
names=['Gem','GemSuit']
for name in names:
 start=source.index('public class cfg_'+name+' :');end=source.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(source[start:end],encoding='utf8')
for obj in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  d=obj.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v56')"),'decode','exec'))
data={name:json.loads((root/('configs/'+name+'.json')).read_text(encoding='utf8')) for name in names}
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
quality=source[source.index('public string GetGemQualityString'):source.index('public int GetNextPowerLevelCost')]
data['qualityNames']={int(k):v for k,v in re.findall(r'(\d+) => "([^"]+)"',quality)}
Path('outputs/laozu-web/warehouse-special-data.js').write_text('window.WAREHOUSE_SPECIAL_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print({name:len(rows) for name,rows in data.items()})
