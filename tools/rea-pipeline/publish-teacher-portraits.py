"""Publish source portrait mapping; preserve explicit unresolved references."""
from pathlib import Path
import json,hashlib
p=Path('outputs/laozu-web/home-detail-data.js');d=json.loads(p.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
spec=json.loads(Path('work/alignment-v27/specs.json').read_text())
d['portraits']={str(id):'assets/teacher-v27/'+x['id']+'-full.png' for x in spec for id in x['skinIds'] if Path('outputs/laozu-web/assets/teacher-v27/'+x['id']+'-full.png').exists()}
d.pop('CreatureView',None)
d['unresolvedPortraits']=[t['iID'] for t in d['TeacherSkin'] if str(t['iID']) not in d['portraits']]
p.write_text('window.HOME_DETAIL_DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
rows=[]
for x in spec:
 f=Path('outputs/laozu-web/assets/teacher-v27/'+x['id']+'-full.png')
 if f.exists():rows.append({**x,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
Path('outputs/laozu-web/assets/teacher-v27/provenance.json').write_text(json.dumps({'sources':rows,'unresolved':d['unresolvedPortraits']},ensure_ascii=False,indent=2),encoding='utf8')
print(len(rows),'portraits;',len(d['portraits']),'skin mappings; unresolved',d['unresolvedPortraits'])
