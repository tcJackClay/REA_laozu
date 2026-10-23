"""Extract original home Spine atlas and portal particle/material carriers; no gameplay edits."""
from pathlib import Path
import UnityPy,zipfile,json,re,hashlib
from UnityPy.helpers.MeshHelper import MeshHandler
from PIL import Image
root=Path('work/home-effects-v67');root.mkdir(parents=True,exist_ok=True)
out=Path('outputs/laozu-web/assets/home-effects-v67');out.mkdir(parents=True,exist_ok=True)
z=zipfile.ZipFile(r'C:/Users/45186/Downloads/wydlz_1.0.2609101116_20260917_030401_64981.apk')
cache={};files={};index=json.loads(Path('work/apk-analysis/objects.json').read_text(encoding='utf8'))
def env(name):
 if name not in cache:
  raw=z.read('assets/data/'+name+'.bin');p=Path('work/alignment-v9/runtime/patch')/(name+'.bin')
  if p.exists():raw=p.read_bytes()
  e=UnityPy.load(raw[4:]);cache[name]=e
  for o in e.objects:files[o.assets_file.name]=(name,{q.path_id:q for q in e.objects})
 return cache[name]
for n in ['3y71i9q','30d7a79','5xi2i9','2m2am25']:env(n)
def follow(owner,ref):
 name=owner.assets_file.name if not ref['m_FileID'] else owner.assets_file.externals[ref['m_FileID']-1].path.split('/')[-1]
 if name not in files:
  cab=json.loads((root/'cab-index.json').read_text(encoding='utf8'))
  if name in cab:env(Path(cab[name]).stem)
  for hit in index:
   if hit.get('path_id')==ref['m_PathID']:env(Path(hit['bundle']).stem)
  if name not in files:raise ValueError('Unresolved serialized file '+name)
 return files[name][1].get(ref['m_PathID'])
# SpineObject resets loaded prefab position/rotation/scale (all.cs914138-140).
# SkeletonGraphic scale is .01; UI canvas reference pixels/unit is100.
spec={}
for o in env('5xi2i9').objects:
 if o.type.name=='MonoBehaviour':
  t=o.read_typetree()
  if 'skeletonDataAsset'in t:spec.update({'graphicID':str(o.path_id),'animation':t['startingAnimation'],'timeScale':t['timeScale'],'loop':t.get('startingLoop',True)})
  if 'atlasAssets'in t:spec['skeletonScale']=t['scale']
for o in env('2m2am25').objects:
 if o.type.name=='TextAsset':
  d=o.read();raw=d.m_Script.encode('utf8',errors='surrogateescape');(root/d.m_Name).write_bytes(raw);spec[d.m_Name]={'id':str(o.path_id),'sha256':hashlib.sha256(raw).hexdigest()}
tex=next(o.read().image for o in env('5xi2i9').objects if o.type.name=='Texture2D')
lines=(root/'eff_main_scene.json.skel.atlas').read_text().splitlines();pw,ph=map(int,lines[2].split(':')[1].split(','));regions={}
for i,l in enumerate(lines):
 if not l or l.startswith(' ') or ':'in l or l.endswith('.png'):continue
 q={}
 for ln in lines[i+1:]:
  if not ln.startswith(' '):break
  k,v=ln.strip().split(':',1);q[k]=v.strip()
 if 'xy'not in q:continue
 x,y=map(int,q['xy'].split(','));w,h=map(int,q['size'].split(','));ow,oh=map(int,q['orig'].split(','));ox,oy=map(int,q['offset'].split(','));deg=90 if q['rotate']=='true' else 0 if q['rotate']=='false' else int(q['rotate']);cw,ch=(h,w) if deg%180 else (w,h)
 im=tex.crop((round(x/pw*tex.width),round(y/ph*tex.height),round((x+cw)/pw*tex.width),round((y+ch)/ph*tex.height)));im=im.rotate(-deg,expand=True) if deg else im
 fn=re.sub(r'[^\w.-]','_',l)+'.png';im.save(out/fn);regions[l]={'file':'assets/home-effects-v67/'+fn,'width':w,'height':h,'originalWidth':ow,'originalHeight':oh,'offsetX':ox,'offsetY':oy}
(root/'regions.json').write_text(json.dumps(regions),encoding='utf8');(root/'spine-source.json').write_text(json.dumps(spec,indent=2),encoding='utf8')
layout=json.loads(Path('outputs/laozu-web/original-layout-data.js').read_text(encoding='utf8').split('=',1)[1].strip().rstrip(';'))['layouts']['uimain'];nodes=layout['nodes'];source={o.path_id:o for o in env('3y71i9q').objects}
portals=[];textures={};meshes={}
for n in nodes:
 if '/Auto_TransPort/'not in n['path']:continue
 pc=next((c for c in n['components'] if c['type']=='ParticleSystem'),None);rc=next((c for c in n['components'] if c['type']=='ParticleSystemRenderer'),None)
 if not pc or not rc:continue
 po,ro=source[int(pc['pathID'])],source[int(rc['pathID'])];particle=po.read_typetree();renderer=ro.read_typetree();mats=[]
 for ref in renderer['m_Materials']:
  mo=follow(ro,ref);mt=mo.read_typetree();props=mt['m_SavedProperties'];texs={}
  for key,value in props['m_TexEnvs']:
   ref=value['m_Texture'];texture=follow(mo,ref) if ref['m_PathID'] else None
   if texture:
    td=texture.read();fn='particle-'+td.m_Name+'.png';td.image.save(out/fn);textures[str(texture.path_id)]={'file':'assets/home-effects-v67/'+fn,'name':td.m_Name};texs[key]={**value,'image':textures[str(texture.path_id)]}
  mats.append({'id':str(mo.path_id),'name':mt['m_Name'],'floats':dict(props['m_Floats']),'colors':dict(props['m_Colors']),'textures':texs})
 if renderer['m_RenderMode']==4:
  mesh=follow(ro,renderer['m_Mesh']);handler=MeshHandler(mesh.read());handler.process();meshes[str(mesh.path_id)]={'vertices':handler.m_Vertices,'uv':handler.m_UV0,'colors':handler.m_Colors,'triangles':[v for sub in handler.get_triangles() for tri in sub for v in tri]}
 portals.append({'path':n['path'],'id':n['id'],'active':n['active'],'particle':particle,'renderer':renderer,'materials':mats})
data={'spine':spec,'portals':portals,'particleTextures':textures,'meshes':meshes}
(root/'source.json').write_text(json.dumps(data,indent=2),encoding='utf8')
print('Spine regions',len(regions),'portal layers',len(portals),'particle textures',len(textures))
for p in portals[:3]:
 i=p['particle']['InitialModule'];print(p['path'].split('/Auto_TransPort/')[1],p['active'],p['particle']['looping'],i['startLifetime']['scalar'],i['startSize']['scalar'],i['startSizeY']['scalar'],p['materials'][0]['name'])
