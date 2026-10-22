"""Retain the native battle-speed button subtree and original Misc multipliers."""
from pathlib import Path
import json
source=Path('tools/rea-pipeline/build-antique-layouts.py').read_text(encoding='utf-8').replace('alignment-v51','alignment-v60').replace('antique-v51','battle-speed-v60')
source=source.replace("targets=['uiantiquenavs','uiantique','uiantiqueupgrade','uiantiquestory','uiantiquesuit','uiantiquesuitoverview','uirecruitlotteryantique','uiattrdes']", "targets=['uibattlestorywin']")
source=source.replace('ANTIQUE_LAYOUTS','BATTLE_SPEED_LAYOUTS').replace('antique-layouts.js','battle-speed-layouts.js')
trim="""
for layout in layouts.values():
 full=layout['nodes']
 paths=[n['path'] for n in full if 'timescale' in n['path'].lower()]
 print('speed paths',paths,flush=True)
 selected=[n for n in full if any(n['path']==p or p.startswith(n['path']+'/') or n['path'].startswith(p+'/') for p in paths)]
 layout['nodes']=selected
needed=set()
def collect(v):
 if isinstance(v,dict):
  if 'm_PathID' in v:needed.add(v['m_PathID'])
  for x in v.values():collect(x)
 elif isinstance(v,list):
  for x in v:collect(x)
collect(layouts)
refs={k:v for k,v in refs.items() if v['path_id'] in needed}
"""
source=source.replace('manifest=[]',trim+'\nmanifest=[]')
exec(compile(source,__file__,'exec'))
misc=json.loads(Path('work/alignment-v26/configs/Misc.json').read_text(encoding='utf-8'))
rows=[r for r in misc if r['nType'] in [2207,2214,2215]]
Path('outputs/laozu-web/battle-speed-data.js').write_text('window.BATTLE_SPEED_DATA='+json.dumps({'misc':rows,'quickWanderScale':1.5},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
