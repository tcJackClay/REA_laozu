from pathlib import Path
import json,UnityPy
root=Path('work/alignment-v15');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
names=['WanderingEquipReforge','WanderPackageOpen','WanderPackageLevel']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for obj in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  d=obj.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v15')"),'decode','exec'))
data={n:json.loads((root/'configs'/(n+'.json')).read_text(encoding='utf8')) for n in names}
data['maxOpen']=next(x['nNumVal'] for x in json.loads(Path('work/alignment-v11/configs/Misc.json').read_text(encoding='utf8')) if x['nType']==3200)
Path('outputs/laozu-web/wander-tools-data.js').write_text('window.WANDER_TOOLS_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print(json.dumps(data,ensure_ascii=False))
