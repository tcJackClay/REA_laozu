"""Extract fixed PokeCatch dark theme, embedded fonts and pixel control rules."""
import argparse, hashlib, json, re
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('reference', type=Path)
args = parser.parse_args()
path = args.reference / 'evidence/source/bundle/app.4cbef38437.css'
raw = path.read_bytes()
css = raw.decode('utf-8-sig')
rules = []
for match in re.finditer(r'([^{}]+)\{([^{}]*)\}', css):
    selector, declarations = match.group(1).strip(), match.group(2)
    take = selector in ['@font-face', ':root', '.px', '.btn', '.btn.gold', '.btn.primary,.btn.danger,.mp-go', '.btn.ghost']
    take |= selector.startswith('.px :is(.btn') or selector.startswith('.px .btn') or selector.startswith(':where(.px) :where(.btn')
    # Only the dark palette and shared source pixel-button implementation.
    if take:
        rules.append({'selector': selector, 'start': match.start(1), 'end': match.end(), 'css': selector + '{' + declarations + '}'})
body = next(m.group(2) for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', css) if m.group(1).strip() == 'body' and '--ball-pattern:' in m.group(2))
rules.append({'selector': 'body', 'start': css.index(body), 'end': css.index(body) + len(body), 'css': 'body{' + body + '}'})
types_raw = (args.reference / 'evidence/runtime-data/TYPES.json').read_bytes()
types = json.loads(types_raw.decode('utf-8-sig'))
out = Path(__file__).resolve().parents[2] / 'outputs/laozu-web/poke'
result = '/* Extracted source rules; original PokeCatch CSS, not redrawn artwork. */\n' + '\n'.join(x['css'] for x in rules) + '\n'
result += '\n'.join('.type-' + name + '{--type:' + entry['color'] + '}' for name, entry in types.items()) + '\n'
(out / 'source-theme.css').write_text(result, encoding='utf-8')
(out / 'theme-manifest.json').write_text(json.dumps({
    'input': str(path.relative_to(args.reference)).replace('\\', '/'), 'sha256': hashlib.sha256(raw).hexdigest(),
    'typesInput': 'evidence/runtime-data/TYPES.json', 'typesSha256': hashlib.sha256(types_raw).hexdigest(),
    'rules': [{k:v for k,v in x.items() if k != 'css'} for x in rules],
    'rangeUnit': 'Python Unicode code points in UTF-8-sig decoded CSS; not original JS UTF-16 evidence index',
    'fontFaces': sum(x['selector'] == '@font-face' for x in rules),
    'typeColors': {k:v['color'] for k,v in types.items()},
    'outputSha256LF': hashlib.sha256(result.encode()).hexdigest()
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'sourceRules':len(rules),'fontFaces':sum(x['selector']=='@font-face' for x in rules),'types':len(types)}))
