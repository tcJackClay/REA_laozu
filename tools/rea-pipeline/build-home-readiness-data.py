"""Export level-one configuration previews, not account pet instances."""
from pathlib import Path
import json,UnityPy,zipfile,re,hashlib
root=Path('work/alignment-v48');(root/'text-assets').mkdir(parents=True,exist_ok=True)
s=Path('work/alignment-v13/all.cs').read_text(encoding='utf8');names=['Reddot','ReddotStyles']
for name in names:
 start=s.index('public class cfg_'+name+' :');end=s.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(s[start:end],encoding='utf8')
for o in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v48')"),'decode','exec'))
load=lambda name:json.loads((root/'configs'/f'{name}.json').read_text(encoding='utf8'))



archive=zipfile.ZipFile(r'C:\Users\45186\Downloads\wydlz_1.0.2609101116_20260917_030401_64981.apk')
def env(bundle):
 raw=archive.read(bundle)
 for origin in ['web-patch','patch']:
  p=Path('work/alignment-v9/runtime')/origin/Path(bundle).name
  if p.exists():raw=p.read_bytes();break
 return UnityPy.load(raw[4:])
game=env('assets/data/35bcavy.bin');app=next(o for o in game.objects if o.path_id==4874935988449324839);ref=app.read_typetree()['reddotSettings'];settings_env=env('assets/data/1pbfp5j.bin');settings_obj=next(o for o in settings_env.objects if o.path_id==ref['m_PathID'])
assert app.assets_file.externals[ref['m_FileID']-1].path.split('/')[-1]==settings_obj.assets_file.name
settings=settings_obj.read_typetree()

data={'provenance':{'gameAppID':str(app.path_id),'settingsID':str(settings_obj.path_id),'settingsCAB':settings_obj.assets_file.name},'reddots':{r['iID']:r for r in load('Reddot') if r['iID'] in [200,201,212,340,341,342,390,613]},'styles':[r for r in load('ReddotStyles') if r['iID'] in [212,342]],'settings':settings['Styles'],'registrations':[{'leaf':'auto_SeedingBtn','kind':'seed','id':212,'index':1,'x':0,'y':0},{'leaf':'auto_TeacherBtn','kind':'teacher','id':340,'index':0,'x':-10,'y':0},{'leaf':'auto_ClanBtn','kind':'clan','id':200,'index':0,'x':0,'y':0}]}
Path('outputs/laozu-web/home-readiness-data.js').write_text('window.HOME_READINESS_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
