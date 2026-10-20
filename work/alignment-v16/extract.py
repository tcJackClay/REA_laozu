from pathlib import Path
import re
s=Path('work/alignment-v9/extract.py').read_text(encoding='utf8')
s=re.sub(r'targets=\[[^\n]+',"targets=['uiequipbooknavs','uiequipawakebook','uiequipcomposebook','uibuygridconfirm','uidiscipleinfo','uiwanderequipillus']",s)
s=s.replace("root=pathlib.Path('work/alignment-v9')","root=pathlib.Path('work/alignment-v16')").replace('assets/alignment','assets/tools-v16').replace("out/'original-layout-data.js'","out/'tools-layout-data.js'").replace('window.ORIGINAL_LAYOUT_DATA=','window.TOOLS_LAYOUT_DATA=')
exec(compile(s,'tools-extractor','exec'))

import json
p=Path('work/alignment-v16/layouts.json');d=json.loads(p.read_text(encoding='utf8'))
names=['ty_k01','ty_k02','ty_huang','ty_he','guanbi','ui_ls_jbd','ui_ls_hd','kuang','ui_pfl_huidi','huobi_2']
skin={s['name']:s['file'] for s in d['sprites'].values() if s['name'] in names}
Path('outputs/laozu-web/tools-skin.js').write_text('window.TOOLS_SKIN='+json.dumps(skin,ensure_ascii=False)+';Object.entries(TOOLS_SKIN).forEach(([k,v])=>document.documentElement.style.setProperty("--tools-"+k,`url("${v}")`));\n',encoding='utf8')
