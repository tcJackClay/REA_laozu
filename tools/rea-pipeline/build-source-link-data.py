"""Export level-one configuration previews, not account pet instances."""
from pathlib import Path
import json,UnityPy,zipfile,re,hashlib
root=Path('work/alignment-v45');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');names=['TextDesc','HelpTips']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for o in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v45')"),'decode','exec'))
load=lambda name:json.loads((root/'configs'/f'{name}.json').read_text(encoding='utf8'))

data={'tips':{r['iID']:r for r in load('TextDesc')},'help':{r['iID']:r for r in load('HelpTips')}}
Path('outputs/laozu-web/source-link-data.js').write_text('window.SOURCE_LINK_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
