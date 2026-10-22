"""Export numeric WanderingEquipSkill adjacency rules; do not parse UI prose."""
from pathlib import Path
import json,UnityPy
root=Path('work/alignment-v40');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');names=['WanderingEquipSkill','WanderingEquipSlot']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for o in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v40')"),'decode','exec'))
rows=json.loads((root/'configs/WanderingEquipSkill.json').read_text(encoding='utf8'))
slots=json.loads((root/'configs/WanderingEquipSlot.json').read_text(encoding='utf8'))
Path('outputs/laozu-web/equip-adjacency-data.js').write_text('window.EQUIP_ADJACENCY_DATA='+json.dumps({'skills':{r['iID']:r for r in rows},'slots':{r['iLayoutID']:r for r in slots}},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
