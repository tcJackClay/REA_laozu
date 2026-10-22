"""Resolve TeacherSkin -> CreatureView.iPictureID -> Icon -> original Sprite."""
import json,zipfile,hashlib
from pathlib import Path
import UnityPy
def js(path):
    return json.loads(Path(path).read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
out=Path('outputs/laozu-web');data=js(out/'home-detail-data.js')
icons={x['nID']:x for x in js(out/'aligned-stage-data.js')['icons']}
views={x['iID']:x for x in json.loads(Path('work/alignment-v27/configs/CreatureView.json').read_text(encoding='utf8'))}
index=json.loads(Path('work/apk-analysis/objects.json').read_text(encoding='utf8'))
for kind in ['patch','web-patch']:
    p=Path(f'work/alignment-v9/runtime/{kind}-index.json')
    if p.exists(): index += [{**r,'origin':kind} for r in json.loads(p.read_text(encoding='utf8'))]
archive=zipfile.ZipFile('C:/Users/45186/Downloads/wydlz_1.0.2609101116_20260917_030401_64981.apk')
folder=out/'assets/teacher-cards';folder.mkdir(exist_ok=True)
mapping={};evidence=[];missing=[];cache={}
for skin in data['TeacherSkin']:
    pic=views.get(skin['iDisplayID'],{}).get('iPictureID');name=icons.get(pic,{}).get('strIconName')
    match=next((r for r in reversed(index) if r['type']=='Sprite' and r.get('name','').lower()==str(name).lower()),None)
    if not match: missing.append({'skin':skin['iID'],'picture':pic,'name':name});continue
    bundle=match['bundle'];origin=match.get('origin');key=(bundle,origin)
    if key not in cache:
        raw=(Path('work/alignment-v9/runtime')/origin/Path(bundle).name).read_bytes() if origin else archive.read(bundle)
        cache[key]=UnityPy.load(raw[4:])
    obj=next(o for o in cache[key].objects if str(o.path_id)==str(match['path_id']))
    file=folder/(name+'.png')
    obj.read().image.save(file)
    mapping[str(skin['iID'])]=file.relative_to(out).as_posix()
    evidence.append({'skin':skin['iID'],'picture':pic,'sprite':name,'bundle':bundle,'origin':origin or 'apk','pathID':str(match['path_id']),'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
data['cardPortraits']=mapping
(out/'home-detail-data.js').write_text('window.HOME_DETAIL_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(folder/'provenance.json').write_text(json.dumps({'sources':evidence,'missing':missing},ensure_ascii=False,indent=2),encoding='utf8')
print(f'{len(mapping)} card skin mappings; {len(missing)} unresolved')
