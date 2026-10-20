from pathlib import Path
import json,UnityPy
s=Path('work/alignment-v9/extract.py').read_text(encoding='utf8');exec(s[:s.index('layouts={}; refs={}')] )
p=Path('work/alignment-v12/configs');rd=lambda n:json.loads((p/(n+'.json')).read_text(encoding='utf8'))
icons={x['nID']:x['strIconName'] for x in json.loads(Path('work/alignment-v9/runtime/configs/Icon.json').read_text(encoding='utf8'))};teachers=rd('Teacher');recipes=rd('WanderingEquipCompose');rids={i for t in teachers for i in t['arrComposeID']};ids=set()
for r in recipes:
 if r['iFormID'] in rids:ids.update([r.get('iMaterial'+str(i),0) for i in range(5)]+r['arrProductID'])
folder=Path('outputs/laozu-web/assets/teacher-v12/equipment');folder.mkdir(exist_ok=True)
rows=[];envs={};objects={};lookup={x['name']:x for x in idx if x['type']=='Sprite'}
for item in rd('WanderingEquip'):
 if item['iID'] not in ids:continue
 name=icons.get(item['iIconId']);f=next(Path('outputs/laozu-web/assets').glob(name+'.png'),None) if name else None
 if not f and name in lookup:
  row=lookup[name];b=row['bundle']
  if b not in envs:envs[b]=UnityPy.load(raw_bundle(b)[4:]);objects[b]={o.path_id:o for o in envs[b].objects}
  f=folder/(name+'.png');objects[b][row['path_id']].read().image.save(f)
 rows.append({'id':item['iID'],'name':item['szName'],'icon':f.relative_to(Path('outputs/laozu-web')).as_posix() if f else '', 'quality':item['iQuality']})
Path('work/alignment-v12/equipment.json').write_text(json.dumps(rows,ensure_ascii=False),encoding='utf8');print(len(rows),'equipment',sum(not r['icon'] for r in rows),'missing')
