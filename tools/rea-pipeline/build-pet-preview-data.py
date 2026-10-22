"""Export level-one configuration previews, not account pet instances."""
from pathlib import Path
import json,UnityPy,zipfile,re,hashlib
root=Path('work/alignment-v42');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');names=['Pet','PetLevel','PetSkillGroup','BattleSkill','Icon','HelpTips']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for o in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v42')"),'decode','exec'))
load=lambda name:json.loads((root/'configs'/f'{name}.json').read_text(encoding='utf8'))
levels=[r for r in load('PetLevel') if r['iLevel']==1]
groups=load('PetSkillGroup');skills=load('BattleSkill')
ids={r['arrSkill'][0] for r in groups if r['arrSkill']}
data={'pets':{r['iID']:r for r in load('Pet')},'levels':{r['iPetID']:r for r in levels},'groups':{r['iID']:r for r in groups},'skills':{r['iSkillID']:r for r in skills if r['iSkillID'] in ids},'icons':{},'help':{r['iID']:r for r in load('HelpTips') if r['iID'] in [30,31,32]}}
# Resolve dynamic skill icons through the same Icon -> Sprite references as the client.
web=Path('outputs/laozu-web');assets=web/'assets/pet-info-v42';assets.mkdir(parents=True,exist_ok=True)
base_groups={p[k] for p in data['pets'].values() for k in ['iActiveSkill','iPassiveSkill'] if p[k]}
icon_ids={data['skills'][data['groups'][g]['arrSkill'][0]]['iIconID'] for g in base_groups}|{p['iIcon'] for p in data['pets'].values() if p['iIcon']}
icon_names={r['strIconName']:r['nID'] for r in load('Icon') if r['nID'] in icon_ids}
idx=json.loads(Path('work/apk-analysis/objects.json').read_text(encoding='utf8'))
runtime=Path('work/alignment-v9/runtime')
for origin in ['patch','web-patch']:
 p=runtime/(origin+'-index.json')
 if p.exists():
  updated=json.loads(p.read_text(encoding='utf8'));changed={r['bundle'] for r in updated};idx=[r for r in idx if r['bundle'] not in changed]+updated
refs={r['path_id']:r for r in idx if r['type']=='Sprite' and r.get('name') in icon_names}
archive=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk')
def raw(bundle):
 for origin in ['web-patch','patch']:
  p=runtime/origin/Path(bundle).name
  if p.exists():return p.read_bytes()
 return archive.read(bundle)
for bundle in sorted({r['bundle'] for r in refs.values()}):
 for o in UnityPy.load(raw(bundle)[4:]).objects:
  if o.type.name=='Sprite' and o.path_id in refs:
   r=refs[o.path_id];fn=re.sub(r'[^\w.-]','_',r['name'])+'.png';o.read().image.save(assets/fn);data['icons'][icon_names[r['name']]]='assets/pet-info-v42/'+fn
# Atlas versions differ. Resolve omitted sprites against their exact indexed bytes.
data['iconFallbacks']=[]
for origin,index in [('patch',runtime/'patch-index.json'),('apk',Path('work/apk-analysis/objects.json'))]:
 fallback=[r for r in json.loads(index.read_text(encoding='utf8')) if r['type']=='Sprite' and r.get('name') in icon_names and icon_names[r['name']] not in data['icons']]
 for bundle in sorted({r['bundle'] for r in fallback}):
  wanted={r['path_id']:r for r in fallback if r['bundle']==bundle};raw_bytes=archive.read(bundle) if origin=='apk' else (runtime/origin/Path(bundle).name).read_bytes()
  for o in UnityPy.load(raw_bytes[4:]).objects:
   if o.type.name=='Sprite' and o.path_id in wanted:
    r=wanted[o.path_id];fn=re.sub(r'[^\w.-]','_',r['name'])+'.png';o.read().image.save(assets/fn);iid=icon_names[r['name']];data['icons'][iid]='assets/pet-info-v42/'+fn;data['iconFallbacks'].append({'id':iid,'origin':origin,'bundle':bundle})
data['missingIcons']=sorted(icon_ids-set(data['icons']))
# Reuse already extracted pet icons when their pixels/PNG bytes are identical.
events=json.loads((web/'wander-events-data.js').read_text(encoding='utf8').split('=',1)[1].strip().rstrip(';'))
existing={}
for pet in events['pets']:
 path=web/(pet.get('icon') or '')
 if path.is_file():existing[hashlib.sha256(path.read_bytes()).hexdigest()]=path
for iid,filename in list(data['icons'].items()):
 path=(web/filename).resolve();digest=hashlib.sha256(path.read_bytes()).hexdigest()
 if digest in existing and path!=existing[digest].resolve():
  data['icons'][iid]=existing[digest].relative_to(web).as_posix()
  if not path.is_relative_to(assets.resolve()):raise RuntimeError('Unexpected generated icon path')
  path.unlink()
 else:existing[digest]=web/filename
Path('outputs/laozu-web/pet-preview-data.js').write_text('window.PET_PREVIEW_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print(len(levels),len(groups),len(data['skills']))
