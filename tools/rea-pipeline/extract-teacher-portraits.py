import pathlib,json,zipfile,UnityPy,re
from PIL import Image
P=pathlib.Path; root=P('work/alignment-v27'); regions=root/'regions';regions.mkdir(exist_ok=True)
idx=json.loads(P('work/apk-analysis/objects.json').read_text(encoding='utf8'));wi=json.loads(P('work/alignment-v9/runtime/web-patch-index.json').read_text(encoding='utf8'));z=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk');cv=json.loads(P('work/alignment-v27/configs/CreatureView.json').read_text(encoding='utf8'));s=P('outputs/laozu-web/disciple-skin-data.js').read_text(encoding='utf8');skins=json.loads(P('work/alignment-v27/configs/TeacherSkin.json').read_text(encoding='utf8'))
specs=[];errors=[]
def env(b,web=False):return UnityPy.load((P('work/alignment-v9/runtime/web-patch')/P(b).name).read_bytes()[4:] if web else z.read(b)[4:])
for cid in sorted({s['iDisplayID'] for s in skins if s['iDisplayID']}):
 try:
  c=next(c for c in cv if c['iID']==cid);name=P(c['szResPath']).stem.lower();found=None
  hits=[b for b in idx+wi if b['type']=='AssetBundle' and name in [x.lower() for x in b.get('container',[])]]
  for b in hits:
   e=env(b['bundle'],(P('work/alignment-v9/runtime/web-patch')/P(b['bundle']).name).exists())
   for o in list(e.objects):
    if o.type.name!='MonoBehaviour':continue
    d=o.read_typetree();ref=d.get('skeletonDataAsset')
    if not ref:continue
    se=e;sb=b['bundle']
    if ref['m_FileID']:
     target=next((x for x in idx if x['path_id']==ref['m_PathID'] and x['type']=='MonoBehaviour'),None)
     if not target:continue
     se=env(target['bundle']);sb=target['bundle']
    so=next((x for x in se.objects if x.path_id==ref['m_PathID']),None)
    if not so:continue
    sd=so.read_typetree();mp=sd.get('skeletonMainJsonPath','')
    if not mp:continue
    # Prefer the playable full-body resource over the separate teacher portrait.
    # model resolved from the selected teacher prefab
    found=(se,sb,mp)
  if not found:raise ValueError('no resolved full-body skeleton reference')
  e,b,mp=found;n=P(mp).name.replace('_skel_main.bytes','');tex=next((o.read().image for o in e.objects if o.type.name=='Texture2D'),None)
  if tex is None:raise ValueError('texture dependency missing '+b)
  candidates=[x for x in idx if x.get('name')==n+'.atlas'];selected=None
  for a in candidates:
   main=next((x for x in idx if x['bundle']==a['bundle'] and x.get('name')==n+'_skel_main'),None)
   if main:selected=(a,main)
  if not selected:raise ValueError('no atlas/dynamic '+n)
  a,main=selected;ls=P(a['extracted']).read_text(encoding='utf8').splitlines();pw,ph=map(int,next(l for l in ls if l.startswith('size:')).split(':')[1].split(','));rr={}
  for i,l in enumerate(ls):
   if not l or l.startswith(' ') or ':' in l or l.endswith('.png'):continue
   q={}
   for ln in ls[i+1:]:
    if not ln.startswith(' '):break
    k,v=ln.strip().split(':',1);q[k]=v.strip()
   if 'xy' not in q:continue
   x,y=map(int,q['xy'].split(','));w,h=map(int,q['size'].split(','));ow,oh=map(int,q['orig'].split(','));ox,oy=map(int,q['offset'].split(','));deg=90 if q['rotate']=='true' else 0 if q['rotate']=='false' else int(q['rotate']);cw,ch=(h,w) if deg%180 else (w,h);crop=tex.crop((round(x/pw*tex.width),round(y/ph*tex.height),round((x+cw)/pw*tex.width),round((y+ch)/ph*tex.height)));crop=crop.rotate(-deg,expand=True) if deg else crop;fn=str(cid)+'-'+re.sub(r'[^\w.-]','_',l)+'.png';crop.save(regions/fn);rr[l]={'file':fn,'width':w,'height':h,'originalWidth':ow,'originalHeight':oh,'offsetX':ox,'offsetY':oy}
  (regions/(str(cid)+'.json')).write_text(json.dumps(rr));specs.append({'id':'teacher-'+str(cid),'file':P(main['extracted']).name,'map':str(cid)+'.json','bundle':b,'skeletonPath':mp,'skinIds':[s['iID'] for s in skins if s['iDisplayID']==cid]});print(cid,n,flush=True)
 except Exception as ex:errors.append([cid,str(ex)]);print('ERROR',cid,str(ex),flush=True)
(root/'specs.json').write_text(json.dumps(specs));(root/'errors.json').write_text(json.dumps(errors))
