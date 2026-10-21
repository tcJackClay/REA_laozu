"""Build runtime event/pet records and an explicit static coverage report from decoded APK tables."""
from pathlib import Path
import json
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]
def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf8'))
def emit(path, global_name, value):
    (ROOT/path).write_text('window.'+global_name+'='+json.dumps(value,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')

rows=read('work/alignment-v18/configs/WanderEvent.json')
events={x['iID']:x for x in rows if x['iID'] and x['iEventType']}
supported={1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,23,24,25,26,27}
def reason(id, stack=()):
    if id in stack:return 'cycle'
    e=events.get(id)
    if not e:return 'missing-or-placeholder'
    if e['iEventType'] not in supported:return 'external-mode'
    for i in range(11):
        a=e['arrAction'+str(i)]
        if a and a[0]==1:
            problem=reason(a[1],(*stack,id))
            if problem:return problem
    return None
excluded={str(id):reason(id) for id in events if reason(id)}
compact={str(id):{k:v for k,v in e.items() if v not in ('',[],0) or k in ('iID','iEventType')} for id,e in events.items() if str(id) not in excluded}
types={str(t):[int(id) for id,e in compact.items() if e['iEventType']==t] for t in supported}
prizes=read('work/alignment-v19/configs/PrizeMain.json')
wheels=read('work/alignment-v19/configs/WanderFortureWheel.json')
text=read('work/alignment-v18/configs/WanderEventText.json')
data={'events':compact,'byType':types,'prizes':{str(x['iPrizeID']):x for x in prizes},'wheels':{str(x['iID']):x for x in wheels},'texts':{str(x['iID']):x['szText'] for x in text if x['iID']},'excluded':excluded}
emit('outputs/laozu-web/event-library-data.js','EVENT_LIBRARY_DATA',data)
pets=read('work/alignment-v18/configs/Pet.json')
skills={s['iSkillID']:s for s in read('work/alignment-v11/configs/BattleSkill.json')}
bullets={b['iBulletID']:b for b in read('work/alignment-v14/configs/BattleBullet.json')}
pet_data={str(p['iID']):{'pet':p,'skills':[skills[id] for id in [p['iActiveSkill'],*p['arrBreakSkill']] if id in skills]} for p in pets}
used={id for p in pet_data.values() for s in p['skills'] for id in s['arrSkillBulletList']}
emit('outputs/laozu-web/pet-battle-data.js','PET_BATTLE_DATA',{'pets':pet_data,'bullets':{str(id):bullets[id] for id in used if id in bullets}})
report={'sourceRows':len(rows),'nonPlaceholder':len(events),'runtimeRecords':len(compact),'typeCounts':dict(Counter(e['iEventType'] for e in compact.values())),'excluded':excluded,'pets':len(pet_data),'limitations':['Static coverage is not browser or emulator coverage.','Server event selection weights and conditions are approximated locally.','External modes, cycles, missing references are excluded rather than silently treated as success.']}
out=ROOT/'work/rea-pipeline/analysis/event-library-coverage.json';out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'tools/rea-pipeline/event-library-coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print({k:v for k,v in report.items() if k not in ('excluded','limitations')},'excluded',len(excluded))
