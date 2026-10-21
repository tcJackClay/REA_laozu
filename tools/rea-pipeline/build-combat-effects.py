"""Project source attribute/ability/buff metadata; formulas remain local approximations."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2]
def read(p): return json.loads((ROOT/p).read_text(encoding='utf8'))
attrs=read('work/alignment-v12/configs/Attribute.json')
abilities=read('work/alignment-v11/configs/Ability.json')
skills=read('work/alignment-v11/configs/BattleSkill.json')
bullets=read('work/alignment-v14/configs/BattleBullet.json')
buffers=read('work/alignment-v20/configs/BattleBuffer.json')
data={'attributes':{x['iAtrributeID']:x['szAttrName'] for x in attrs},'abilities':{x['iID']:x for x in abilities},'equipmentSkills':{x['iSkillID']:{k:x[k] for k in ['iCoolDown','arrSkillBulletList']} for x in skills},'buffs':{x['iID']:{k:x[k] for k in ['name','des','iBenefitial','bNoDismissal']} for x in buffers if x['iID'] in [114,282001010]}}
data['bullets']={x['iBulletID']:{k:x[k] for k in ['iDamageType','szDesc']} for x in bullets}
(ROOT/'outputs/laozu-web/combat-effects-data.js').write_text('window.COMBAT_EFFECTS_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('attributes',len(attrs),'abilities',len(abilities),'skills',len(skills),'buffs',data['buffs'])
