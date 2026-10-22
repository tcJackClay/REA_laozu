"""Export source UI trees without flattening RectTransform ancestry."""
import json, pathlib, zipfile, sys, re
import UnityPy
sys.stdout.reconfigure(encoding='utf8')
root=pathlib.Path('work/alignment-v41'); out=pathlib.Path('outputs/laozu-web')
assets=out/'assets/strategy-v41'; assets.mkdir(parents=True,exist_ok=True); root.mkdir(parents=True,exist_ok=True)
idx=json.loads(pathlib.Path('work/apk-analysis/objects.json').read_text(encoding='utf8'))
runtime=pathlib.Path('work/alignment-v9/runtime')
for origin in ['patch','web-patch']:
 source=runtime/(origin+'-index.json')
 if source.exists():
  updated=json.loads(source.read_text(encoding='utf8'));bundles_changed={x['bundle'] for x in updated};idx=[x for x in idx if x['bundle'] not in bundles_changed]+updated
sprites={x['path_id']:x for x in idx if x['type']=='Sprite'}
bundles={n:x['bundle'] for x in idx if x['type']=='AssetBundle' for n in x.get('container',[])}
z=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk')
def raw_bundle(b):
 for origin in ['web-patch','patch']:
  p=runtime/origin/pathlib.Path(b).name
  if p.exists():return p.read_bytes()
 return z.read(b)
layouts={}; refs={}
keys=['m_AnchoredPosition','m_SizeDelta','m_AnchorMin','m_AnchorMax','m_Pivot','m_LocalScale','m_LocalRotation','m_LocalPosition','m_Sprite','m_text','m_FontSize','m_fontSize','m_fontSizeMin','m_fontSizeMax','m_fontStyle','m_enableAutoSizing','m_Color','m_fontColor','m_Enabled','m_Type','m_FillCenter','m_FillAmount','m_RaycastTarget','m_HorizontalAlignment','m_VerticalAlignment','m_Margin','m_Padding','m_Spacing','m_ChildAlignment','m_Constraint','m_ConstraintCount','m_CellSize','m_ChildControlWidth','m_ChildControlHeight','m_ChildForceExpandWidth','m_ChildForceExpandHeight']
targets=['uistrategydetail']
for name in targets:
 if name not in bundles: continue
 b=bundles[name]; e=UnityPy.load(raw_bundle(b)[4:]); obs={o.path_id:o for o in e.objects}
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
    c['scriptID']=t.get('m_Script',{}).get('m_PathID'); c['fields']={k:v for k,v in t.items() if k not in keys and k not in ['m_GameObject','m_Script','m_Name','m_ObjectHideFlags','m_EditorHideFlags','m_EditorClassIdentifier','m_CorrespondingSourceObject','m_PrefabInstance','m_PrefabAsset']}
    for ref in t.get('SpriteList',[]):
     sid=ref.get('m_PathID')
     if sid in sprites:
      s=sprites[sid];refs[(s['bundle'],s['path_id'])]=s
   if t.get('m_Sprite',{}).get('m_PathID') in sprites:
    s=sprites[t['m_Sprite']['m_PathID']]; c['sprite']=s; refs[(s['bundle'],s['path_id'])]=s
   row['components'].append(c)
   if ob.type.name in ['RectTransform','Transform']:
    children=[obs.get(ch.path_id) for ch in ob.read().m_Children]
  for tr in children:
   if tr:
    g=obs.get(tr.read().m_GameObject.path_id)
    if g:walk(g,path,str(go.path_id))
 walk(obs[rid],''); layouts[name]={'bundle':b,'nodes':rows}; print(name,len(rows),flush=True)
manifest=[]
for b in sorted({k[0] for k in refs}):
 e=UnityPy.load(raw_bundle(b)[4:])
 for o in e.objects:
  if (b,o.path_id) not in refs:continue
  d=o.read(); fn=re.sub(r'[^\w.-]','_',d.m_Name)+'__'+str(o.path_id)+'.png'
  try:im=d.image
  except FileNotFoundError as err:
   print('Missing optional sprite dependency',d.m_Name,flush=True);continue
  im.save(assets/fn)
  manifest.append({**refs[(b,o.path_id)],'file':'assets/strategy-v41/'+fn,'size':list(im.size),'border':dict(zip(['x','y','z','w'],[d.m_Border.x,d.m_Border.y,d.m_Border.z,d.m_Border.w]))})
def safe_ids(v,key=''):
 if isinstance(v,dict):return {k:safe_ids(x,k) for k,x in v.items()}
 if isinstance(v,list):return [safe_ids(x) for x in v]
 return str(v) if key in ['m_PathID','path_id','pathID','scriptID'] and v is not None else v
data=safe_ids({'layouts':layouts,'sprites':{str(x['path_id']):x for x in manifest}})
(root/'layouts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
(out/'strategy-layouts.js').write_text('window.STRATEGY_LAYOUTS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
for f in (root/'source').glob('*.cs'):
 f.write_text(f.read_text(encoding='utf-8-sig').split('You are not using the latest version')[0].rstrip()+'\n',encoding='utf8')
print('sprites',len(manifest))


# Share byte-identical exported images with existing asset collections.
import hashlib
web=pathlib.Path('outputs/laozu-web').resolve();target=(web/'assets/strategy-v41').resolve()
existing={}
for path in (web/'assets').rglob('*.png'):
 if not path.is_relative_to(target):existing.setdefault(hashlib.sha256(path.read_bytes()).hexdigest(),path)
replaced=0
for row in data['sprites'].values():
 path=(web/row['file']).resolve()
 if not path.is_relative_to(target):raise RuntimeError('Unexpected output path')
 digest=hashlib.sha256(path.read_bytes()).hexdigest()
 if digest in existing:
  row['file']=existing[digest].relative_to(web).as_posix();path.unlink();replaced+=1
 else:existing[digest]=path
(out/'strategy-layouts.js').write_text('window.STRATEGY_LAYOUTS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
