import json
from pathlib import Path
R=Path('work/alignment-v11/configs');read=lambda n:json.loads((R/(n+'.json')).read_text(encoding='utf8'))
w=json.loads(Path('outputs/laozu-web/wander-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
icons={x['id']:x['icon'] for x in w['seeds']}
a=[x for x in read('Ability') if x['iType'] in [1,2,4] and x['iLevel']==0]
d={'provenance':{'assemblySha256':'c0c9533b719ae312542d6e9fda26f0f7627fb828c474681a20986bba7ccfb2b8','resourceVersion':'2610131532','randomSelection':'local-uniform-preview-not-server-odds','ownership':'local-catalog-preview-not-account-unlocks'},'abilities':a,'names':read('RandomName'),'seeds':[{**x,'icon':icons.get(x['iID'],'')} for x in read('Seeding')],'skills':read('BattleSkill'),'otherRate':next(x['nNumVal'] for x in read('Misc') if x['nType']==3100)/10000}
Path('outputs/laozu-web/cultivation-data.js').write_text('window.CULTIVATION_DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('abilities',len(a),'seeds',len(d['seeds']),'icons',len(icons), 'rate',d['otherRate'])
