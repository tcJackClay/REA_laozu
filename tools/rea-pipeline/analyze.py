"""Batch source analysis. Produces evidence-linked results without manual bindings."""
import argparse
from collections import defaultdict, deque
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from pipeline import ROOT, DEFAULT_DB, build, connect, digest, masked_code, summary

DEFAULT_OUT = ROOT / 'work/rea-pipeline/analysis'


def analyze(dbpath=DEFAULT_DB, out=DEFAULT_OUT, rebuild=True):
    if rebuild:
        build(dbpath)
    with connect(dbpath) as db:
        windows = [dict(r) for r in db.execute('SELECT * FROM windows ORDER BY name,line')]
        methods = defaultdict(list)
        edges = defaultdict(list)
        for r in db.execute('SELECT * FROM methods ORDER BY line'):
            methods[r['window_id']].append(dict(r))
        for r in db.execute('SELECT * FROM edges'):
            edges[r['method_id']].append(dict(r))
        layouts = {r['name']: dict(r) for r in db.execute('SELECT * FROM layouts')}
        configs = {r['name']: dict(r) for r in db.execute('SELECT * FROM config_tables')}
        artifacts = [dict(r) for r in db.execute('SELECT * FROM artifacts ORDER BY path')]
        counts = summary(db)
    sources = {source: (ROOT / source).read_text(encoding='utf-8-sig').splitlines() for source in {w['source'] for w in windows}}
    results, transitions = [], []
    for w in windows:
        lines = sources[w['source']]
        local = methods[w['id']]
        byname = defaultdict(list)
        for m in local:
            byname[m['name']].append(m)
        body = '\n'.join(lines[w['line']-1:w['end_line']])
        clean = masked_code(body)
        layoutrow = layouts.get(w['name'].lower())
        payload = json.loads(layoutrow['payload']) if layoutrow else None
        # Generated Meta.Widgets slots map to serialized m_Components by index.
        widgetslots = []
        componentnodes = {}
        if payload:
            for node in payload['layout']['nodes']:
                for comp in node['components']:
                    componentnodes[str(comp['pathID'])] = node
                    f = comp.get('fields', {})
                    if f.get('m_WndName') == w['name']:
                        widgetslots = f.get('m_Components', [])
        widgets = {}
        for hit in re.finditer(r'(\w+)\s*=\s*(?:\(\(UIWindow\)this\)\.)?Meta\.Widgets\.GetWidgetComponent<([^>]+)>\((\d+)\)', clean):
            field, kind, idx = hit[1], hit[2], int(hit[3])
            ref = widgetslots[idx] if idx < len(widgetslots) else {}
            node = componentnodes.get(str(ref.get('m_PathID')))
            widgets[field] = {'field':field, 'type':kind, 'slot':idx,
                              'path':node['path'] if node else None,
                              'line':w['line'] + clean[:hit.start()].count('\n')}
        callbacks = {h[1]:h[2] for h in re.finditer(r'(\w+)\s*=\s*new\s+UnityAction\(\s*(\w+)\s*\)', clean)}
        calls, facts = {}, {}
        for m in local:
            raw = '\n'.join(lines[m['line']-1:m['end_line']])
            cm = masked_code(raw)
            tail = cm[cm.find('{')+1:]
            calls[m['id']] = sorted({h[1] for h in re.finditer(r'(?<![\w.])([A-Za-z_]\w*)\s*\(', tail) if h[1] in byname})
            facts[m['id']] = {'conditions':[
                {'line':m['line']+cm[:h.start()].count('\n'), 'expression':h[0].strip()[:500]}
                for h in re.finditer(r'\b(?:if|switch)\s*\([^\n]+', cm)],
                'requests':[e for e in edges[m['id']] if e['kind']=='request']}
        def trace(name):
            queue = deque((m, 0) for m in byname.get(name, []))
            seen, observed, conditions = set(), [], []
            while queue:
                m, depth = queue.popleft()
                if m['id'] in seen:
                    continue
                seen.add(m['id'])
                observed.extend({**e, 'method':m['name']} for e in edges[m['id']])
                conditions.extend({**c, 'method':m['name']} for c in facts[m['id']]['conditions'])
                if depth < 8:
                    queue.extend((n, depth+1) for callee in calls[m['id']] for n in byname[callee])
            return {'methods':sorted(seen), 'edges':observed, 'conditions':conditions,
                    'basis':'static reachable candidates, same class, depth <= 8; no execution ordering'}
        buttons, bindings = [], {}
        # Bind only observed AddListener registrations, resolving generated aliases.
        for m in local:
            cm = masked_code('\n'.join(lines[m['line']-1:m['end_line']]))
            aliases = {h[1]:h[2] for h in re.finditer(r'\bButton\s+(\w+)\s*=\s*(\w+)\s*;', cm)}
            for hit in re.finditer(r'(\w+)\.onClick\.AddListener\(\s*(\w+)\s*\)', cm):
                field = aliases.get(hit[1],hit[1])
                callback = callbacks.get(hit[2], hit[2] if hit[2] in byname else None)
                item = {**widgets.get(field, {'field':field,'path':None}), 'callback':callback,
                        'registrationLine':m['line']+cm[:hit.start()].count('\n')}
                item['trace'] = trace(callback) if callback else {'edges':[], 'methods':[], 'conditions':[]}
                buttons.append(item)
                if item['path'] and callback:
                    bindings[item['path']] = {'action':w['name']+'.'+callback, 'label':field}
        for m in local:
            for e in edges[m['id']]:
                if e['kind'] in ('opens','show-call','closes'):
                    transitions.append({'from':w['name'],'to':e['target'],'kind':e['kind'],
                                        'method':m['name'],'source':w['source'],'line':e['line'],
                                        'basis':'static-reference'})
        references = sorted({e['target'] for m in local for e in edges[m['id']] if e['kind']=='config'})
        configlinks = [{'accessor':name,'table':next((k for k in configs if k.lower()==re.sub(r'_\d+$','',name).lower()),None),
                        'basis':'accessor-name candidate'} for name in references]
        results.append({**w,'layout':layoutrow['name'] if layoutrow else None,
                        'buttons':buttons,'bindings':bindings,'configs':configlinks,
                        'gaps':(['prefab-not-exported'] if not payload else [])+
                               (['unresolved-button-path'] if any(not b['path'] for b in buttons) else [])})
    report = {'schema':1,'generatedAt':datetime.now(timezone.utc).isoformat(),
              'counts':{**counts,'buttonRegistrations':sum(len(w['buttons']) for w in results),
                        'autoBindings':sum(len(w['bindings']) for w in results), 'transitions':len(transitions)},
              'artifacts':artifacts,'windows':results,'transitions':transitions,
              'limits':['Lexical call graph; overloads and runtime dispatch unresolved.',
                        'Conditions are source excerpts; not evaluated predicates.',
                        'Automatic preview bindings record callbacks; do not execute original game code.',
                        'No emulator exploration or runtime semantic validation is claimed.']}
    out.mkdir(parents=True, exist_ok=True)
    tmp = out/'report.tmp'
    tmp.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    tmp.replace(out/'report.json')
    wander = [w for w in results if re.search(r'Wander|SelectEquip|SelectTeacher|SelectGong|Recruit|BuyGrid|EquipAwake|EquipCompose|DiscipleInfo',w['name'],re.I)]
    md = ['# 自动分析结果', '', '生成时间：'+report['generatedAt'], '',
          '静态关联用于定位原版逻辑；没有据此宣称模拟器流程已验证。', '',
          '## 覆盖', '', '```json',json.dumps(report['counts'],ensure_ascii=False,indent=2),'```','',
          '## 游历相关按钮与后续关系','']
    for w in wander:
        md.extend(['### '+w['name'], '',f"来源：{w['source']}:{w['line']}；布局：{w['layout'] or '未导出'}",''])
        for b in w['buttons']:
            targets = sorted({e['kind']+':'+e['target'] for e in b['trace']['edges'] if e['kind'] in ('opens','show-call','request','closes','config')})
            md.append(f"- {b['field']} → {b['callback']}："+('、'.join(targets) or '无可解析的后续关系'))
        md.append('')
    (out/'report.md').write_text('\n'.join(md),encoding='utf-8')
    return report


if __name__ == '__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--db',type=Path,default=DEFAULT_DB)
    p.add_argument('--out',type=Path,default=DEFAULT_OUT)
    a=p.parse_args()
    print(json.dumps(analyze(a.db,a.out)['counts'],ensure_ascii=False,indent=2))
