"""Export the original CfgShow gem info window and its referenced sprites."""
from pathlib import Path
import json
source=Path('tools/rea-pipeline/build-antique-layouts.py').read_text(encoding='utf8').replace('alignment-v51','alignment-v57').replace('antique-v51','ancestor-preview-v57')
source=source.replace("targets=['uiantiquenavs','uiantique','uiantiqueupgrade','uiantiquestory','uiantiquesuit','uiantiquesuitoverview','uirecruitlotteryantique','uiattrdes']", "targets=['uiancestorskinpreview','uiskilldesctips']")
source=source.replace('ANTIQUE_LAYOUTS','ANCESTOR_PREVIEW_LAYOUTS').replace('antique-layouts.js','ancestor-preview-layouts.js')
exec(compile(source,__file__,'exec'))
(root/'layouts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
