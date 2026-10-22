"""Export level-one configuration previews, not account pet instances."""
from pathlib import Path
import json,UnityPy,zipfile,re,hashlib
root=Path('work/alignment-v63');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');names=['Pet','PetLevel','PetMaximum','PetSkillGroup','BattleSkill','Misc','Goods','HelpTips']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for o in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v63')"),'decode','exec'))
load=lambda name:json.loads((root/'configs'/f'{name}.json').read_text(encoding='utf8'))
data={name:load(name) for name in names}
data['HelpTips']=[r for r in data['HelpTips'] if r['iID'] in [28,33]]
data['PetLevel']=[r for r in data['PetLevel'] if r['iPetID']]
data['Misc']=[r for r in data['Misc'] if r['nType'] in [3501,3504]]
ids=set(next(r['szArray'] for r in data['Misc'] if r['nType']==3504))
for r in data['PetLevel']:
 ids.update(r['arrBreakCost'][::2])
for r in data['PetMaximum']:
 ids.update(r['arrCost'][::2])
data['Goods']=[r for r in data['Goods'] if r['iGoodsID'] in ids]
skill_ids={g['arrSkill'][0] for g in data['PetSkillGroup'] if g['arrSkill']}
data['BattleSkill']=[r for r in data['BattleSkill'] if r['iSkillID'] in skill_ids]
Path('outputs/laozu-web/pet-management-data.js').write_text('window.PET_MANAGEMENT_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('data',[(k,len(v)) for k,v in data.items()])
