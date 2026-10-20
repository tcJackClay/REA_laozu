from pathlib import Path
import json
p=Path('work/alignment-v12/configs');rd=lambda n:json.loads((p/(n+'.json')).read_text(encoding='utf8'))
w=json.loads(Path('outputs/laozu-web/wander-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));icons={x['id']:x['icon'] for x in w['teachers']}
d={'equipment':json.loads(Path('work/alignment-v12/equipment.json').read_text(encoding='utf8')),'teachers':[{**x,'icon':icons.get(x['iID'],'')} for x in rd('Teacher')],'attributes':rd('Attribute'),'recipes':rd('WanderingEquipCompose'),'starEffects':rd('TeacherStarAffect'),'secondSlot':next(x for x in rd('FunctionOpen') if x['iID']==17),'provenance':{'resourceVersion':'2610131532','account':'local-preview-unless-snapshot-imported'}}
Path('outputs/laozu-web/teacher-data.js').write_text('window.TEACHER_DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
