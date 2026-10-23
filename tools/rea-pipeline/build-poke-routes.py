from pathlib import Path
import json,re,math,hashlib
snapshot=json.loads(Path('tools/rea-pipeline/poke-fusion/routes/source-input.json').read_text(encoding='utf-8'))
story=snapshot['STORY']; encounters=snapshot['ENCOUNTERS']
scene_map=json.loads(Path('tools/rea-pipeline/poke-fusion/routes/scene-mapping.json').read_text(encoding='utf-8'))['routes']
aces=[16,24,30,38,46,54,62,70,75]
layout=Path('outputs/laozu-web/poke/maps/source/region_map_layout_kanto.h').read_text();rows=re.findall(r'\{([^{}]+)\}',layout.split('[LAYER_DUNGEON]')[0]);grid=[[v.strip() for v in row.split(',') if v.strip()] for row in rows if 'MAPSEC_' in row]
regions=[]
for n in range(1,26):
 cells=[[x,y] for y,row in enumerate(grid) for x,v in enumerate(row) if v==f'MAPSEC_ROUTE_{n}' and not(n==2 and y==6)]
 regions.append({'id':f'route-{n}','name':f'{n}号道路','cells':cells,'variants':[]})
regions.append({'id':'forest','name':'常青森林','cells':[[4,6]],'variants':[]})
variants=[]
for ci,c in enumerate(story['CHAPTERS'][:9]):
 routes=[x for x in c['steps'] if x['kind']=='route'];lo=2 if ci==0 else aces[ci-1];hi=aces[ci]-1
 for ri,r in enumerate(routes):
  if not(re.match(r'^Routes? \d',r['name']) or r['name'] in ['Forêt de Jade','Pont Pépite','Piste Cyclable']):continue
  ids=['forest'] if r['name']=='Forêt de Jade' else sorted(set('route-'+re.search(r'(?:sea-)?route-(\d+)',a).group(1) for a in r['areas'] if re.search(r'(?:sea-)?route-(\d+)',a)))
  level=r.get('lv',[math.floor(lo+(hi-lo)*ri/len(routes)+.5),math.floor(lo+(hi-lo)*(ri+1)/len(routes)+.5)]);level[1]=max(level[0]+1,level[1])
  pool={}
  for area in r['areas']:
   for e in encounters.get(area,[]):
    if 'walk' in e[4] or 'surf' in e[4]:pool[e[0]]=max(pool.get(e[0],0),e[3])
  assert pool,(r['name'],r['areas'])
  v={'id':f'kanto-{ci}-{ri}','name':'常青森林' if ids==['forest'] else '／'.join(i.split('-')[1] for i in ids)+'号道路','chapter':ci+1,'levels':level,'wild':r.get('wild',0),'trainers':r.get('trainers',0),'areas':r['areas'],'sourceName':r['name'],'scene':scene_map[r['name']]['path'],'bg':r['bg'],'pool':[[k,v] for k,v in pool.items()],'regions':ids}
  variants.append(v)
  for region in regions:
   if region['id'] in ids:region['variants'].append(v['id'])
assert all(r['cells'] and r['variants'] for r in regions)
data={'regions':regions,'variants':variants,'geometry':{'width':192,'height':144,'cellSize':8,'xOffset':8,'yOffset':16},'source':'PokeCatch 2026-10-22 STORY + ENCOUNTERS; pret/pokefirered ce6406d8 region_map_layout_kanto.h'}
out=Path('outputs/laozu-web/poke/routes.js');out.write_text('/* Generated source-backed outdoor Kanto routes; see ROUTES.md. */\n(function(r){const data='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module==="object"&&module.exports)module.exports=data;else r.POKE_ROUTES=data;})(globalThis);\n',encoding='utf-8')
Path('work/kanto-routes.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');print(len(regions),len(variants))
