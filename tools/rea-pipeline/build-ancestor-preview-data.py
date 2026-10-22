"""Decode native gem preview configs from the supplied APK update bundle."""
from pathlib import Path
import json,re,UnityPy
root=Path('work/alignment-v57');(root/'text-assets').mkdir(parents=True,exist_ok=True)
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
names=['Ancestor']
for name in names:
 start=source.index('public class cfg_'+name+' :');end=source.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(source[start:end],encoding='utf8')
for obj in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  d=obj.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v57')"),'decode','exec'))
data={name:json.loads((root/('configs/'+name+'.json')).read_text(encoding='utf8')) for name in names}
skills=json.loads(Path('work/alignment-v42/configs/BattleSkill.json').read_text(encoding='utf8'))
ids={n for a in data['Ancestor'] for n in a['arrSkill'][1::2]}
views=json.loads(Path('work/alignment-v27/configs/CreatureView.json').read_text(encoding='utf8'))
view_ids={n for a in data['Ancestor'] for n in a['arrCreatureViewID'][1::2]}
data['BattleSkill']=[s for s in skills if s['iSkillID'] in ids]
data['CreatureView']=[v for v in views if v['iID'] in view_ids]
Path('outputs/laozu-web/ancestor-preview-data.js').write_text('window.ANCESTOR_PREVIEW_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print({name:len(rows) for name,rows in data.items()})
