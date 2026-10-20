from pathlib import Path
import re
s=Path('work/alignment-v9/extract.py').read_text(encoding='utf8')
s=re.sub(r'targets=\[[^\n]+',"targets=['uiselectteacher']",s)
s=s.replace("root=pathlib.Path('work/alignment-v9')", "root=pathlib.Path('work/alignment-v12')")
s=s.replace("assets/alignment", "assets/teacher-v12")
s=s.replace("assets=out/'assets/alignment'", "assets=out/'assets/teacher-v12'")
s=s.replace("out/'original-layout-data.js'", "out/'teacher-layout-data.js'")
s=s.replace('window.ORIGINAL_LAYOUT_DATA=', 'window.TEACHER_LAYOUT_DATA=')
exec(compile(s,'birth-extractor','exec'))
