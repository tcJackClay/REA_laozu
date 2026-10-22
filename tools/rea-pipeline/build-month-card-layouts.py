"""Export native card panels, preserving original widgets and source images."""
from pathlib import Path
source=Path('tools/rea-pipeline/build-antique-layouts.py').read_text(encoding='utf8').replace('alignment-v51','alignment-v59').replace('antique-v51','month-card-v59')
source=source.replace("targets=['uiantiquenavs','uiantique','uiantiqueupgrade','uiantiquestory','uiantiquesuit','uiantiquesuitoverview','uirecruitlotteryantique','uiattrdes']", "targets=['uimonthcard']")
source=source.replace('ANTIQUE_LAYOUTS','MONTH_CARD_LAYOUTS').replace('antique-layouts.js','month-card-layouts.js')
exec(compile(source,__file__,'exec'))
