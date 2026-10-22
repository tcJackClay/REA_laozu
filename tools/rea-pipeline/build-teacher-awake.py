"""Export original teacher awakening tables and native windows."""
from pathlib import Path
import json,UnityPy
root=Path('work/alignment-v39');root.mkdir(parents=True,exist_ok=True);(root/'text-assets').mkdir(exist_ok=True)
source=Path('work/alignment-v13/all.cs').read_text(encoding='utf8')
names=['TeacherAwakening','TeacherAwakeningLevel','TeacherAwakenEffect']
names=[n for n in names if 'public class cfg_'+n+' :' in source]
for name in names:
 start=source.index('public class cfg_'+name+' :');end=source.index('\n}',start)+2
 (root/('cfg_'+name+'.cs')).write_text(source[start:end],encoding='utf8')
for obj in UnityPy.load(Path('work/alignment-v9/runtime/patch/3pfng7c.bin').read_bytes()[4:]).objects:
 if obj.type.name=='TextAsset':
  d=obj.read()
  if d.m_Name in names:(root/'text-assets'/('runtime_'+d.m_Name)).write_bytes(d.m_Script.encode('utf8',errors='surrogateescape'))
exec(compile(Path('work/alignment-v9/decode-patch.py').read_text(encoding='utf8').replace("root=pathlib.Path('work/alignment-v9/runtime')","root=pathlib.Path('work/alignment-v39')"),'decode','exec'))
data={n:json.loads((root/'configs'/(n+'.json')).read_text(encoding='utf8')) for n in names}
teachers=json.loads(Path('outputs/laozu-web/teacher-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))['teachers']
reward_ids={a[i] for t in teachers for a in [t.get('arrLevelReward',[])] for i in range(1,len(a),2)}
data['PrizeMain']=[p for p in json.loads(Path('work/alignment-v26/configs/PrizeMain.json').read_text(encoding='utf8')) if p['iPrizeID'] in reward_ids]
Path('outputs/laozu-web/teacher-awake-data.js').write_text('window.TEACHER_AWAKE_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
script=Path('tools/rea-pipeline/build-detail-secondary.py').read_text(encoding='utf8').replace('alignment-v32','alignment-v39').replace('detail-v32','awake-v39').replace("targets=['uiseedlingstory','uicoloursequiptip']","targets=['uiteacher','uiteacherinfo','uiteacherawake','uiteacherawakesuccess','uiteacherawakereward','uiteacherawakeresonance','uiteacherawakeeffectpreview','uiteacherawakeeffecttip']").replace('DETAIL_SECONDARY_LAYOUTS','TEACHER_AWAKE_LAYOUTS').replace('detail-secondary-layouts.js','teacher-awake-layouts.js')
exec(compile(script,'awake-layouts','exec'))
