"""Resolve active framework PPtrs before exporting window animation curves."""
from pathlib import Path
import json, zipfile, UnityPy, hashlib
web=Path('outputs/laozu-web'); out=Path('work/alignment-v47');out.mkdir(parents=True,exist_ok=True)
archive=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk')
sources=[]
def load(bundle):
 raw=archive.read(bundle);origin='apk'
 for layer in ['web-patch','patch']:
  p=Path('work/alignment-v9/runtime')/layer/Path(bundle).name
  if p.exists():raw=p.read_bytes();origin=layer;break
 sources.append({'bundle':bundle,'origin':origin,'sha256':hashlib.sha256(raw).hexdigest()})
 return UnityPy.load(raw[4:])
game=load('assets/data/35bcavy.bin');framework=next(o for o in game.objects if o.path_id==9190050698666742893);f=framework.read_typetree();ref=f['m_Settings']
settings_env=load('assets/data/1pbfp5j.bin');settings=next(o for o in settings_env.objects if o.path_id==ref['m_PathID'])
assert framework.assets_file.externals[ref['m_FileID']-1].path.split('/')[-1]==settings.assets_file.name
common=settings.read_typetree()['WndCommonSettings'];ref=common['AnimTempletes']
template_env=load('assets/data/ydb66m.bin');template=next(o for o in template_env.objects if o.path_id==ref['m_PathID'])
assert settings.assets_file.externals[ref['m_FileID']-1].path.split('/')[-1]==template.assets_file.name
ids=[common['PopupAnimTempleteID'],common['CloseAnimTempleteID']]
rows={str(t['id']):t for t in template.read_typetree()['templetes'] if t['id'] in ids}
assert len(rows)==2 and ids==[10001,10005]
for row in rows.values():
 assert row['isScaleAnimEnabled'] and row['isCanvasGroupAlphaAnimEnabled']
 assert not row['isMoveAnimEnabled'] and not row['isRotationAnimEnabled'] and row['interval']==0
 for curve in [row['canvasGroupAlphaAminSettings']['curve'],*[row['scaleAminSettings']['scale'][axis]['curve'] for axis in ['x','y','z']]]:
  assert all(not k['weightedMode'] for k in curve['m_Curve']), 'Weighted curves require a separate evaluator'
data={'common':common,'templates':rows,'provenance':{'sources':sources,'frameworkID':str(framework.path_id),'settingsID':str(settings.path_id),'templateID':str(template.path_id),'settingsCAB':settings.assets_file.name,'templateCAB':template.assets_file.name}}
(out/'window-motion.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
def safe_ids(v,key=''):
 if isinstance(v,dict):return {k:safe_ids(x,k) for k,x in v.items()}
 if isinstance(v,list):return [safe_ids(x) for x in v]
 return str(v) if key=='m_PathID' else v
data=safe_ids(data)
(web/'window-motion-data.js').write_text('window.WINDOW_MOTION_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('active templates',ids)
