from pathlib import Path
import re, json, hashlib
import UnityPy

root=Path('work/alignment-v14')
(root/'text-assets').mkdir(exist_ok=True)
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
start=source.index('public class cfg_BattleBullet :')
end=source.index('\n}',start)+2
(root/'cfg_BattleBullet.cs').write_text(source[start:end],encoding='utf8')
patch=Path('work/alignment-v9/runtime/patch/3pfng7c.bin')
for obj in UnityPy.load(patch.read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  data=obj.read()
  if data.m_Name=='BattleBullet':
   (root/'text-assets/runtime_BattleBullet').write_bytes(data.m_Script.encode('utf8',errors='surrogateescape'))
decoder=Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v14')")
exec(compile(decoder,'decode-bullets','exec'))
rows=json.loads((root/'configs/BattleBullet.json').read_text(encoding='utf8'))
data={'resourceVersion':'2610131532','patchSha256':hashlib.sha256(patch.read_bytes()).hexdigest(),'bullets':{str(x['iBulletID']):x['iDamageType'] for x in rows}}
Path('outputs/laozu-web/battle-damage-types.js').write_text('window.BATTLE_DAMAGE_TYPES='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
