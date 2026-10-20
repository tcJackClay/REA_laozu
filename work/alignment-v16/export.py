from pathlib import Path
import json,UnityPy
root=Path('work/alignment-v16');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
names=['TeacherAwakening','Teacher','TeacherAwakenEffect']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for obj in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  d=obj.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v16')"),'decode','exec'))
data={n:json.loads((root/'configs'/(n+'.json')).read_text(encoding='utf8')) for n in names}
Path('outputs/laozu-web/awakening-data.js').write_text('window.AWAKENING_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print({k:len(v) for k,v in data.items()})

