"""Export source UI trees without flattening RectTransform ancestry."""
import json, pathlib, zipfile, sys, re, hashlib, os
import UnityPy
sys.stdout.reconfigure(encoding='utf8')
root=pathlib.Path('work/home-profile-v68'); out=pathlib.Path('outputs/laozu-web')
assets=out/'assets/home-profile-v68'; assets.mkdir(parents=True,exist_ok=True); root.mkdir(parents=True,exist_ok=True)
idx=json.loads(pathlib.Path('work/apk-analysis/objects.json').read_text(encoding='utf8'))
runtime=pathlib.Path('work/alignment-v9/runtime')
for origin in ['patch','web-patch']:
 source=runtime/(origin+'-index.json')
 if source.exists():
  updated=json.loads(source.read_text(encoding='utf8'));bundles_changed={x['bundle'] for x in updated};idx=[x for x in idx if x['bundle'] not in bundles_changed]+updated
sprites={x['path_id']:x for x in idx if x['type']=='Sprite'}
scripts={x['path_id']:x.get('name','') for x in idx if x['type']=='MonoScript'}
bundles={n:x['bundle'] for x in idx if x['type']=='AssetBundle' for n in x.get('container',[])}
z=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk')
used_sources={}
def raw_bundle(b):
 for origin in ['patch','web-patch']:
  p=runtime/origin/pathlib.Path(b).name
  if p.exists():
   raw=p.read_bytes();used_sources[b]={'origin':origin,'sha256':hashlib.sha256(raw).hexdigest()};return raw
 raw=z.read(b);used_sources[b]={'origin':'apk','sha256':hashlib.sha256(raw).hexdigest()};return raw
env_cache={};cab_files={};resolved_sprites={}
cab_index=json.loads(pathlib.Path('work/home-effects-v67/cab-index.json').read_text(encoding='utf8'))
def load_bundle(b):
 if b not in env_cache:
  e=UnityPy.load(raw_bundle(b)[4:]);env_cache[b]=e
  for ob in e.objects:
   cab=ob.assets_file.name
   if cab not in cab_files:cab_files[cab]=(b,{x.path_id:x for x in e.objects if x.assets_file.name==cab})
 return env_cache[b]
def load_external(record):
 key=record['bundle']+'@'+record['origin']
 if key not in env_cache:
  raw=pathlib.Path(record['file']).read_bytes();used_sources[key]={'origin':record['origin'],'sha256':hashlib.sha256(raw).hexdigest()};e=UnityPy.load(raw[4:]);env_cache[key]=e
  for ob in e.objects:
   cab=ob.assets_file.name
   cab_files[cab]=(record['bundle'],{x.path_id:x for x in e.objects if x.assets_file.name==cab})
 return env_cache[key]
runtime_cab_index=json.loads((root/'runtime-cab-index.json').read_text(encoding='utf8'))
def sprite_ref(owner,ref):
 sid=ref.get('m_PathID',0)
 if not sid:return None
 if sid in sprites:return sprites[sid]
 cab=owner.assets_file.name if not ref.get('m_FileID') else owner.assets_file.externals[ref['m_FileID']-1].path.split('/')[-1]
 if cab not in cab_files and cab in runtime_cab_index:load_external(runtime_cab_index[cab])
 if cab not in cab_files and cab in cab_index:load_bundle(cab_index[cab])
 if cab not in cab_files:raise RuntimeError('Unresolved sprite CAB '+cab)
 b,objects=cab_files[cab];obj=objects.get(sid)
 if not obj or obj.type.name!='Sprite':raise RuntimeError('Missing sprite '+str(sid)+' in '+cab)
 row={'bundle':b,'path_id':sid,'type':'Sprite','name':obj.read().m_Name,'sourceCAB':cab};resolved_sprites[(b,sid)]=obj;sprites[sid]=row
 return row
layouts={}; refs={}
keys=['m_AnchoredPosition','m_SizeDelta','m_AnchorMin','m_AnchorMax','m_Pivot','m_LocalScale','m_LocalRotation','m_LocalPosition','m_Sprite','m_text','m_FontSize','m_fontSize','m_fontSizeMin','m_fontSizeMax','m_fontStyle','m_enableAutoSizing','m_Color','m_fontColor','m_Enabled','m_Type','m_FillCenter','m_FillAmount','m_RaycastTarget','m_HorizontalAlignment','m_VerticalAlignment','m_Margin','m_Padding','m_Spacing','m_ChildAlignment','m_Constraint','m_ConstraintCount','m_CellSize','m_ChildControlWidth','m_ChildControlHeight','m_ChildForceExpandWidth','m_ChildForceExpandHeight']
avatar_text=(out/'home-management-data.js').read_text(encoding='utf8')
avatars=json.loads(avatar_text[avatar_text.index('=')+1:].strip().rstrip(';'))['PlayerAvatar']
targets=['uisetrepresentdisciple','uiotherinfo','uiplayerinfo','uiplayerheadsettings','auto_playerhead']+sorted({pathlib.Path(a['szAssetPath']).stem.lower() for a in avatars if a['iType'] in [2,3] and a['szAssetPath']})
# Refresh actual AssetBundle containers: older object indexes can omit new aliases
# even when the updated serialized GameObjects are present in the same bundle.
for b in sorted({bundles[n] for n in targets if n in bundles}):
 e=load_bundle(b)
 for obj in e.objects:
  if obj.type.name=='AssetBundle':
   for n,ref in obj.read().m_Container:bundles[n.lower()]=b
import os
if os.environ.get('PROFILE_ONLY'):targets=[os.environ['PROFILE_ONLY']]
for name in targets:
 if name not in bundles: print('MISSING',name,flush=True);continue
 b=bundles[name]; e=load_bundle(b); obs={o.path_id:o for o in e.objects}
 ab=next(o.read() for o in e.objects if o.type.name=='AssetBundle'); rid=next(v.asset.path_id for n,v in ab.m_Container if n.lower()==name)
 rows=[]
 def walk(go,parent,parent_id=None):
  d=go.read(); path=parent+'/'+d.m_Name; row={'id':str(go.path_id),'parentID':parent_id,'path':path,'active':bool(d.m_IsActive),'components':[]}; rows.append(row)
  children=[]
  for cp in d.m_Component:
   ob=obs.get(cp.component.path_id)
   if not ob:continue
   t=ob.read_typetree(); c={'type':ob.type.name,'pathID':ob.path_id,**{k:v for k,v in t.items() if k in keys}}
   if ob.type.name=='MonoBehaviour':
    c['scriptID']=t.get('m_Script',{}).get('m_PathID'); c['sourceScriptName']=scripts.get(c['scriptID'],''); c['scriptName']='HorizontalLayoutGroup' if c['sourceScriptName']=='HorizontalLayoutGroupEx' else c['sourceScriptName']; c['fields']={k:v for k,v in t.items() if k not in keys and k not in ['m_GameObject','m_Script','m_Name','m_ObjectHideFlags','m_EditorHideFlags','m_EditorClassIdentifier','m_CorrespondingSourceObject','m_PrefabInstance','m_PrefabAsset']}
    for ref in t.get('SpriteList',[]):
     sid=ref.get('m_PathID')
     if sid:
      s=sprite_ref(ob,ref);refs[(s['bundle'],s['path_id'])]=s
   if t.get('m_Sprite',{}).get('m_PathID'):
    s=sprite_ref(ob,t['m_Sprite']); c['sprite']=s; refs[(s['bundle'],s['path_id'])]=s
   row['components'].append(c)
   if ob.type.name in ['RectTransform','Transform']:
    children=[obs.get(ch.path_id) for ch in ob.read().m_Children]
  for tr in children:
   if tr:
    g=obs.get(tr.read().m_GameObject.path_id)
    if g:walk(g,path,str(go.path_id))
 walk(obs[rid],''); layouts[name]={'bundle':b,'nodes':rows}; print(name,len(rows),flush=True)
# Dynamic PlayerAvatar pictures are loaded by icon id, not authored on the preview prefab.
icons=json.loads((runtime/'configs/Icon.json').read_text(encoding='utf8'))
icon_ids={a['iIcon'] for a in avatars if a.get('iIcon')}
icon_names={x['strIconName'] for x in icons if x['nID'] in icon_ids}
for sprite in sprites.values():
 if sprite['name'] in icon_names:refs[(sprite['bundle'],sprite['path_id'])]=sprite
(root/'tree-raw.json').write_text(json.dumps({'layouts':layouts},ensure_ascii=False,default=str),encoding='utf8')
# Reuse previously exported exact source sprites; do not repeatedly decode large atlases.
known={}
for q in out.glob('*layouts.js'):
 try:
  txt=q.read_text(encoding='utf8');obj=json.loads(txt[txt.index('=')+1:].strip().rstrip(';'))
  for k,v in obj.get('sprites',{}).items():
   if v.get('file') and (out/v['file']).exists():known[str(k)]=v
 except (ValueError,KeyError):pass
manifest=[]
for b in sorted({k[0] for k in refs}):
 pending=[k for k in refs if k[0]==b and str(k[1]) not in known]
 for k in refs:
  if k[0]==b and str(k[1]) in known:manifest.append(known[str(k[1])])
 if os.environ.get('PROFILE_REEXPORT'):pending=[k for k in refs if k[0]==b];manifest=[v for v in manifest if v.get('bundle')!=b]
 if not pending:continue
 e=load_bundle(b)
 export_objects={o.path_id:o for o in e.objects}
 export_objects.update({sid:o for (bundle,sid),o in resolved_sprites.items() if bundle==b})
 for o in export_objects.values():
  if (b,o.path_id) not in pending:continue
  d=o.read();fn=re.sub(r'[^\w.-]','_',d.m_Name)+'__'+str(o.path_id)+'.png'
  target=assets/fn
  if os.environ.get('PROFILE_REEXPORT') or not target.exists():
   try:d.image.save(target)
   except FileNotFoundError:print('Missing optional sprite dependency',d.m_Name,flush=True);continue
  from PIL import Image
  with Image.open(target) as image:size=list(image.size)
  manifest.append({**refs[(b,o.path_id)],'file':'assets/home-profile-v68/'+fn,'size':size,'border':dict(zip(['x','y','z','w'],[d.m_Border.x,d.m_Border.y,d.m_Border.z,d.m_Border.w]))})
def safe_ids(v,key=''):
 if isinstance(v,dict):return {k:safe_ids(x,k) for k,x in v.items()}
 if isinstance(v,list):return [safe_ids(x) for x in v]
 return str(v) if key in ['m_PathID','path_id','pathID','scriptID'] and v is not None else v
data=safe_ids({'layouts':layouts,'sprites':{str(x['path_id']):x for x in manifest},'icons':{str(x['nID']):x['strIconName'] for x in icons if x['nID'] in icon_ids},'provenance':{'bundles':used_sources,'avatarConfigSHA256':hashlib.sha256(avatar_text.encode()).hexdigest(),'priority':['patch','web-patch','apk']}})
(root/'layouts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
(out/'home-profile-layouts.js').write_text('window.HOME_PROFILE_LAYOUTS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
for f in (root/'source').glob('*.cs'):
 f.write_text(f.read_text(encoding='utf-8-sig').split('You are not using the latest version')[0].rstrip()+'\n',encoding='utf8')
print('sprites',len(manifest))


# Share byte-identical exported images with existing asset collections.
import hashlib
web=pathlib.Path('outputs/laozu-web').resolve();target=(web/'assets/home-profile-v68').resolve()
existing={}
for path in (web/'assets').rglob('*.png'):
 if not path.is_relative_to(target):existing.setdefault(hashlib.sha256(path.read_bytes()).hexdigest(),path)
replaced=0
for row in data['sprites'].values():
 path=(web/row['file']).resolve()
 if not path.is_relative_to(target):continue
 digest=hashlib.sha256(path.read_bytes()).hexdigest()
 if digest in existing:
  row['file']=existing[digest].relative_to(web).as_posix();path.unlink();replaced+=1
 else:existing[digest]=path
(out/'home-profile-layouts.js').write_text('window.HOME_PROFILE_LAYOUTS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')


print('profile templates',len(layouts),'source sprites',len(data['sprites']))
