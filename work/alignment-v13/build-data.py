from pathlib import Path
import json
root=Path('work/alignment-v12/configs')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
slots={x['iLayoutID']:x for x in read(Path('work/apk-analysis/configs/WanderingEquipSlot.json'))}
icons={x['id']:x for x in read(Path('work/alignment-v12/equipment.json'))}
items=[]
for x in read(root/'WanderingEquip.json'):
 if x['iID'] not in icons:continue
 s=slots[x['iSlotId']]
 cells=[[c,r] for r in range(6) for c,v in enumerate(s['arrEmitRow'+str(r)]) if v&1]
 assert cells
 mx=min(c[0] for c in cells);my=min(c[1] for c in cells)
 buff=x['arrBuffParam']
 items.append(dict(id=x['iID'],name=x['szName'],quality=x['iQuality'],element=(x['arrTechnique'] or [0])[0],shape=[[a-mx,b-my] for a,b in cells],icon=icons[x['iID']]['icon'],stats={str(buff[i]):buff[i+1] for i in range(0,len(buff)-1,2)},description=x['szEquipSkillDesc'],effects=x['arrFlashBuffParam'],source={'slotId':x['iSlotId'],'skillIds':x['arrSkillID'],'passiveIds':x['arrPassiveSKill'],'price':x['iPrice']},weaponForms=x['arrWeaponForm'],reson=x['iReson']))
data={'items':items,'damageDescriptions':read(root/'TextDescFight.json'),'provenance':{'equipment':'updated 2610131532','shapes':'APK WanderingEquipSlot; placeholder bit 1','damageFormula':'local-preview, server formula unavailable'}}
Path('outputs/laozu-web/teacher-runtime-data.js').write_text('window.TEACHER_RUNTIME_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print(len(items),'runtime items')
