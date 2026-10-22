"""Resolve antique, material and lottery icons through original cfg_Icon."""
from pathlib import Path
import json,zipfile,re,hashlib,UnityPy
web=Path('outputs/laozu-web');out=web/'assets/pet-management-v63';out.mkdir(exist_ok=True)
load=lambda p:json.loads(Path(p).read_text(encoding='utf8').split('=',1)[1].strip().rstrip(';'))
data_source=load(web/'pet-management-data.js')
ids={r['iIconID'] for r in data_source['Goods'] if r['iIconID']}
cfg={c['nID']:c for c in json.loads(Path('work/alignment-v42/configs/Icon.json').read_text(encoding='utf8')) if c['nID'] in ids}
runtime=Path('work/alignment-v9/runtime');archive=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk')
index=[]
for origin,path in [('web-patch',runtime/'web-patch-index.json'),('patch',runtime/'patch-index.json'),('apk',Path('work/apk-analysis/objects.json'))]:
 index.extend({**c,'origin':origin} for c in json.loads(path.read_text(encoding='utf8')) if c['type']=='Sprite')
selected={i:next((s for s in index if s.get('name')==c['strIconName']),None) for i,c in cfg.items()}
existing={}
for p in (web/'assets').rglob('*.png'):
 if not p.name.startswith('dynamic_'):existing.setdefault(hashlib.sha256(p.read_bytes()).hexdigest(),p)
cache={};data={'icons':{},'provenance':[],'missing':[]}
for i in sorted(ids):
 s=selected.get(i)
 if not s:data['missing'].append(i);continue
 key=(s['origin'],s['bundle'])
 if key not in cache:
  raw=archive.read(s['bundle']) if s['origin']=='apk' else (runtime/s['origin']/Path(s['bundle']).name).read_bytes()
  env=UnityPy.load(raw[4:]);cache[key]={o.path_id:o for o in env.objects}
 obj=cache[key][s['path_id']].read();path=out/('dynamic_'+re.sub(r'[^\w.-]','_',obj.m_Name)+'.png');obj.image.save(path);digest=hashlib.sha256(path.read_bytes()).hexdigest()
 if digest in existing:
  file=existing[digest].relative_to(web).as_posix();path.unlink()
 else:file=path.relative_to(web).as_posix();existing[digest]=path
 data['icons'][i]=file;data['provenance'].append({'id':i,'name':s['name'],'origin':s['origin'],'bundle':s['bundle'],'pathID':str(s['path_id']),'sha256':digest,'file':file})
assert not data['missing'], data['missing']
(web/'pet-management-icons.js').write_text('window.PET_MANAGEMENT_ICONS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('resolved',len(data['icons']),'source antique icons')
