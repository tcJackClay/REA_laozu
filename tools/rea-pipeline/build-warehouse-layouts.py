"""Export native warehouse, box detail, batch use and goods icon layouts."""
from pathlib import Path
import json
source=Path('tools/rea-pipeline/build-antique-layouts.py').read_text(encoding='utf8').replace('alignment-v51','alignment-v54').replace('antique-v51','warehouse-v54')
source=source.replace("targets=['uiantiquenavs','uiantique','uiantiqueupgrade','uiantiquestory','uiantiquesuit','uiantiquesuitoverview','uirecruitlotteryantique','uiattrdes']", "targets=['uiwarehouse','uirandomboxtips','uiselectableboxtips','uibatchuse','goodsiconitem_v1','goodsiconitem_v2','uireward']")
source=source.replace('ANTIQUE_LAYOUTS','WAREHOUSE_LAYOUTS').replace('antique-layouts.js','warehouse-layouts.js')
exec(compile(source,__file__,'exec'))
(root/'layouts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
