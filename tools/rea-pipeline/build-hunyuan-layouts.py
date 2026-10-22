"""Export the original Hunyuan store and exchange list, preserving source nodes."""
from pathlib import Path
source=Path('tools/rea-pipeline/build-antique-layouts.py').read_text(encoding='utf8').replace('alignment-v51','alignment-v58').replace('antique-v51','hunyuan-v58')
source=source.replace("targets=['uiantiquenavs','uiantique','uiantiqueupgrade','uiantiquestory','uiantiquesuit','uiantiquesuitoverview','uirecruitlotteryantique','uiattrdes']", "targets=['uihunyuanshop']")
source=source.replace('ANTIQUE_LAYOUTS','HUNYUAN_LAYOUTS').replace('antique-layouts.js','hunyuan-layouts.js')
exec(compile(source,__file__,'exec'))
