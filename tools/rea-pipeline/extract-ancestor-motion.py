"""Follow Pet -> CreatureView -> prefab -> exact skeleton references and atlas."""
from pathlib import Path
import json,zipfile,re,sys,hashlib
import UnityPy
root=Path('work/alignment-v57-motion');regions=root/'regions';texts=root/'text-assets'
regions.mkdir(parents=True,exist_ok=True);texts.mkdir(exist_ok=True)
archive=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk')
runtime=Path('work/alignment-v9/runtime')
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');name='CreatureView';start=source.index('public class cfg_'+name+' :');end=source.index('\n}',start)+2
(root/('cfg_'+name+'.cs')).write_text(source[start:end],encoding='utf8')
for o in UnityPy.load((runtime/'patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if d.m_Name==name:(texts/('runtime_'+name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v57-motion')"),'decode','exec'))
views={c['iID']:c for c in json.loads((root/'configs/CreatureView.json').read_text(encoding='utf8'))}
views_for_preview=json.loads(Path('outputs/laozu-web/ancestor-preview-data.js').read_text(encoding='utf8').split('=',1)[1].strip().rstrip(';'))['CreatureView']
pets={v['iID']:{'iID':v['iID'],'iCreatureID':v['iID']} for v in views_for_preview}
indexes=[]
for origin,p in [('web-patch',runtime/'web-patch-index.json'),('patch',runtime/'patch-index.json'),('apk',Path('work/apk-analysis/objects.json'))]:
 for x in json.loads(p.read_text(encoding='utf8')):indexes.append({**x,'origin':origin})
cache={}
def env(bundle,origin):
 key=(bundle,origin)
 if key not in cache:
  raw=archive.read(bundle) if origin=='apk' else (runtime/origin/Path(bundle).name).read_bytes()
  e=UnityPy.load(raw[4:]);cache[key]=(e,{o.path_id:o for o in e.objects})
 return cache[key]
canvas_evidence=[]
ce,co=env('assets/data/35bcavy.bin','apk')
for ob in ce.objects:
 if ob.type.name=='MonoBehaviour':
  t=ob.read_typetree()
  if 'm_ReferencePixelsPerUnit' in t:
   go=co[t['m_GameObject']['m_PathID']].read().m_Name
   if go in ['UIWithCamera','UIWithOverlay']:canvas_evidence.append({'bundle':'assets/data/35bcavy.bin','component':str(ob.path_id),'name':go,'referencePixelsPerUnit':t['m_ReferencePixelsPerUnit']})
if len(canvas_evidence)!=2 or any(c['referencePixelsPerUnit']!=100 for c in canvas_evidence):raise ValueError('Canvas scale changed')
(root/'canvas-evidence.json').write_text(json.dumps(canvas_evidence,indent=2),encoding='utf8')
def locate(name,kind='TextAsset'):
 hits=[x for x in indexes if x['type']==kind and x.get('name','').lower()==name.lower()]
 if not hits:raise ValueError('Missing '+kind+' '+name)
 x=hits[0];e,obs=env(x['bundle'],x['origin']);return obs[x['path_id']],x
def follow(ref,obs,bundle,origin,owner):
 if not ref['m_FileID'] and ref['m_PathID'] in obs:return obs[ref['m_PathID']]
 # Resolve the serialized external CAB first, then its exact PathID.
 external=owner.assets_file.externals[ref['m_FileID']-1].path.rsplit('/',1)[-1].lower()
 for candidate in indexes:
  if candidate['type']!='MonoBehaviour' or candidate['path_id']!=ref['m_PathID']:continue
  ce,cobs=env(candidate['bundle'],candidate['origin']);obj=cobs.get(ref['m_PathID'])
  if obj and obj.assets_file.name.lower()==external:return obj
 raise ValueError('Unresolved external CAB '+external+' '+str(ref))

specs=[];errors=[]
selected=set(map(int,sys.argv[1:]))
for p in sorted(pets.values(),key=lambda x:x['iID']):
 if selected and p['iID'] not in selected:continue
 try:
  cid=p['iCreatureID'];c=views[cid];prefab=Path(c['szResPath']).stem.lower();hit=next(x for x in indexes if x['type']=='AssetBundle' and prefab in [n.lower()for n in x.get('container',[])])
  e,obs=env(hit['bundle'],hit['origin']);graphics=[]
  for o in e.objects:
   if o.type.name=='MonoBehaviour':
    t=o.read_typetree()
    if 'skeletonDataAsset'in t:graphics.append((o,t))
  if len(graphics)!=1:raise ValueError('Expected one ancestor skeleton, got '+str(len(graphics)))
  graphic,gd=graphics[0];sd=follow(gd['skeletonDataAsset'],obs,hit['bundle'],hit['origin'],graphic).read_typetree()
  stem=Path(sd['skeletonMainJsonPath']).name.removesuffix('.bytes');atlas_name=stem.removesuffix('_skel_main')+'.atlas'
  atlas,ai=locate(atlas_name);main,mi=locate(stem)
  try:dynamic,di=locate(stem.replace('_skel_main','_skel_dynamic'))
  except ValueError:dynamic,di=None,None
  def script(o):return o.read().m_Script.encode('utf8',errors='surrogateescape')
  (texts/(str(cid)+'-main')).write_bytes(script(main));(texts/(str(cid)+'-dynamic')).write_bytes(script(dynamic)) if dynamic else None;atlas_text=script(atlas).decode('utf8');(texts/(str(cid)+'.atlas')).write_text(atlas_text,encoding='utf8');lines=atlas_text.splitlines()
  pages=[l for l in lines if l.endswith('.png') and not l.startswith(' ')]
  if len(pages)!=1:raise ValueError('Multiple atlas pages need explicit mapping: '+str(pages))
  texture=next((o for o in e.objects if o.type.name=='Texture2D' and o.read().m_Name.lower()==Path(pages[0]).stem.lower()),None)
  if texture is None:texture,texture_source=locate(Path(pages[0]).stem,'Texture2D')
  tex=texture.read().image;pw,ph=map(int,next(l for l in lines if l.startswith('size:')).split(':')[1].split(','));rr={}
  for i,l in enumerate(lines):
   if not l or l.startswith(' ') or ':'in l or l.endswith('.png'):continue
   q={}
   for ln in lines[i+1:]:
    if not ln.startswith(' '):break
    k,v=ln.strip().split(':',1);q[k]=v.strip()
   if 'xy' not in q:continue
   x,y=map(int,q['xy'].split(','));w,h=map(int,q['size'].split(','));ow,oh=map(int,q['orig'].split(','));ox,oy=map(int,q['offset'].split(','));deg=90 if q['rotate']=='true' else 0 if q['rotate']=='false' else int(q['rotate']);cw,ch=(h,w) if deg%180 else (w,h)
   crop=tex.crop((round(x/pw*tex.width),round(y/ph*tex.height),round((x+cw)/pw*tex.width),round((y+ch)/ph*tex.height)));crop=crop.rotate(-deg,expand=True) if deg else crop;fn=str(cid)+'-'+re.sub(r'[^\w.-]','_',l)+'.png';crop.save(regions/fn);rr[l]={'file':fn,'width':w,'height':h,'originalWidth':ow,'originalHeight':oh,'offsetX':ox,'offsetY':oy}
  (regions/(str(cid)+'.json')).write_text(json.dumps(rr),encoding='utf8')
  # Record the prefab's actual skeleton transform chain before UI context scale.
  go=gd['m_GameObject']['m_PathID'];transforms={o.path_id:o.read_typetree() for o in e.objects if o.type.name in ['Transform','RectTransform']};tr=next(t for t in transforms.values() if t['m_GameObject']['m_PathID']==go);chain=[]
  while tr:
   chain.append({k:tr.get(k)for k in ['m_LocalPosition','m_LocalScale','m_LocalRotation']});tr=transforms.get(tr.get('m_Father',{}).get('m_PathID'))
  spec={'actorId':p['iID'],'creatureId':cid,'id':'ancestor-'+str(cid),'prefab':c['szResPath'],'prefabBundle':hit['bundle'],'origin':hit['origin'],'skeletonPath':sd['skeletonMainJsonPath'],'skeletonScale':sd['scale'],'skeletonDataRef':{k:str(v) for k,v in gd['skeletonDataAsset'].items()},'graphicPathID':str(graphic.path_id),'transformChain':chain,'startingAnimation':gd.get('startingAnimation'),'initialFlipX':gd.get('initialFlipX',0),'initialFlipY':gd.get('initialFlipY',0),'mainFile':str(cid)+'-main','dynamicFile':str(cid)+'-dynamic' if dynamic else None,'map':str(cid)+'.json','mainSource':mi,'dynamicSource':di,'atlasSource':ai,'mainSha256':hashlib.sha256(script(main)).hexdigest(),'textureSize':[tex.width,tex.height]};specs.append(spec);print(p['iID'],prefab,stem,len(rr),flush=True)
 except Exception as ex:errors.append({'actorId':p['iID'],'error':str(ex)});print('ERROR',p['iID'],str(ex),flush=True)
def safe_source_ids(value,key=''):
 if isinstance(value,dict):return {k:safe_source_ids(v,k) for k,v in value.items()}
 if isinstance(value,list):return [safe_source_ids(v) for v in value]
 return str(value) if key in ['path_id','pathID','m_PathID'] and value is not None else value
specs=safe_source_ids(specs)
(root/'specs.json').write_text(json.dumps(specs,ensure_ascii=False,indent=2),encoding='utf8');(root/'errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2),encoding='utf8')
print('DONE',len(specs),'errors',len(errors),flush=True)
