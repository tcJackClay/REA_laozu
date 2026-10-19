from pathlib import Path
import re
s=Path('work/alignment-v9/extract.py').read_text(encoding='utf8')
s=re.sub(r'targets=\[[^\n]+',"targets=['uiselectseedling']",s)
s=s.replace("root=pathlib.Path('work/alignment-v9')", "root=pathlib.Path('work/alignment-v11')")
s=s.replace("assets/alignment", "assets/seed-v11")
s=s.replace("assets=out/'assets/alignment'", "assets=out/'assets/seed-v11'")
s=s.replace("out/'original-layout-data.js'", "out/'seed-layout-data.js'")
s=s.replace('window.ORIGINAL_LAYOUT_DATA=', 'window.SEED_LAYOUT_DATA=')
exec(compile(s,'birth-extractor','exec'))
