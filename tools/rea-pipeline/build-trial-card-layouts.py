"""Export the native independent trial-card window, without inventing its gate."""
from pathlib import Path
source=Path('tools/rea-pipeline/build-antique-layouts.py').read_text(encoding='utf-8').replace('alignment-v51','alignment-v61').replace('antique-v51','trial-card-v61')
source=source.replace("targets=['uiantiquenavs','uiantique','uiantiqueupgrade','uiantiquestory','uiantiquesuit','uiantiquesuitoverview','uirecruitlotteryantique','uiattrdes']", "targets=['uitrylongcard']")
source=source.replace('ANTIQUE_LAYOUTS','TRIAL_CARD_LAYOUTS').replace('antique-layouts.js','trial-card-layouts.js')
exec(compile(source,__file__,'exec'))

import json
rows=json.loads(Path('work/alignment-v48/configs/Reddot.json').read_text(encoding='utf-8'))
Path('outputs/laozu-web/month-card-hints.js').write_text('window.MONTH_CARD_HINTS='+json.dumps({'reddot':next(r for r in rows if r['iID']==370)},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
