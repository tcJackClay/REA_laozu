"""Export the original teacher disciple-transmog preview and consume confirmation."""
from pathlib import Path
import json

source=Path('tools/rea-pipeline/build-antique-layouts.py').read_text(encoding='utf8')
source=source.replace('alignment-v51','alignment-v53').replace('antique-v51','teacher-skin-v53')
source=source.replace("targets=['uiantiquenavs','uiantique','uiantiqueupgrade','uiantiquestory','uiantiquesuit','uiantiquesuitoverview','uirecruitlotteryantique','uiattrdes']", "targets=['uiteacherskintip','uiconsumeconfirm']")
source=source.replace('ANTIQUE_LAYOUTS','TEACHER_SKIN_LAYOUTS').replace('antique-layouts.js','teacher-skin-layouts.js')
exec(compile(source,__file__,'exec'))
# Keep the inspection manifest consistent with the post-deduplication runtime file.
(root/'layouts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
