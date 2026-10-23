from pathlib import Path
import json,re,urllib.request,hashlib
root=Path('tools/rea-pipeline/poke-fusion/progression');root.mkdir(exist_ok=True)
story=json.loads(Path('tools/rea-pipeline/poke-fusion/routes/source-input.json').read_text(encoding='utf-8'))['STORY']
gridtext=Path('outputs/laozu-web/poke/maps/source/region_map_layout_kanto.h').read_text();grid=[[v.strip() for v in row.split(',') if v.strip()] for row in re.findall(r'\{([^{}]+)\}',gridtext.split('[LAYER_DUNGEON]')[0]) if 'MAPSEC_' in row]
towns=[('PALLET_TOWN','Bourg Palette','真新镇'),('VIRIDIAN_CITY','Jadielle','常青市'),('PEWTER_CITY','Argenta','深灰市'),('CERULEAN_CITY','Azuria','华蓝市'),('VERMILION_CITY','Carmin sur Mer','枯叶市'),('LAVENDER_TOWN','Lavanville','紫苑镇'),('CELADON_CITY','Céladopole','玉虹市'),('SAFFRON_CITY','Safrania','金黄市'),('FUCHSIA_CITY','Parmanie','浅红市'),('CINNABAR_ISLAND',"Cramois'Île",'红莲镇'),('INDIGO_PLATEAU','Plateau Indigo','石英高原')]
scenes=['26-arene-pierre','27-arene-ondine','28-arene-major-bob','29-arene-erika','30-arene-koga','31-arene-morgane','32-arene-auguste','33-arene-giovanni']
names=['深灰道馆','华蓝道馆','枯叶道馆','玉虹道馆','浅红道馆','金黄道馆','红莲道馆','常青道馆'];leaders=['小刚','小霞','马志士','莉佳','阿桔','娜姿','夏伯','坂木'];townids=['PEWTER_CITY','CERULEAN_CITY','VERMILION_CITY','CELADON_CITY','FUCHSIA_CITY','SAFFRON_CITY','CINNABAR_ISLAND','VIRIDIAN_CITY'];aces=[16,24,30,38,46,54,62,70]
gyms=[];assets=[]
for i,c in enumerate(story['CHAPTERS'][:8]):
 g=next(s for s in c['steps'] if s['kind']=='gym');ace=g.get('ace',aces[i]);top=max(t[1] for t in g['team']);file=scenes[i]+'-710x400.webp';path=Path('outputs/laozu-web/poke/scenes')/file
 if not path.exists():path.write_bytes(urllib.request.build_opener(urllib.request.ProxyHandler({})).open(urllib.request.Request('https://pokecatch-online.netlify.app/assets/bg/scenes/'+file,headers={'User-Agent':'Mozilla/5.0','Referer':'https://pokecatch-online.netlify.app/'}),timeout=20).read())
 assets.append({'file':file,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
 gyms.append({**g,'id':'gym-'+str(i),'chapter':i,'name':names[i],'leader':leaders[i],'city':townids[i],'scene':file,'badgeImage':'frlg-'+str(i+1)+'.png','team':[[id,int(lv*ace/top+.5)] for id,lv in g['team']]})
routes=json.loads(Path('outputs/laozu-web/poke/routes.js').read_text(encoding='utf-8').split('const data=')[1].split(';if(typeof')[0])['variants']
cities=[]
for key,source,name in towns:
 found=None
 for ci,c in enumerate(story['CHAPTERS'][:9]):
  for si,s in enumerate(c['steps']):
   if s['name']==source and s['kind']=='heal':found=(ci,si);break
  if found:break
 cities.append({'id':key,'name':name,'sourceName':source,'chapter':found[0] if found else (0 if key=='PALLET_TOWN' else 8),'sourceStep':found[1] if found else 0,'requiresRoute':next((v['id'] for step in reversed(story['CHAPTERS'][found[0]]['steps'][:found[1]]) for v in routes if v['chapter']==found[0]+1 and v['sourceName']==step['name']),None) if found else None,'cells':[[x,y] for y,row in enumerate(grid) for x,v in enumerate(row) if v=='MAPSEC_'+key],'gym':next((g['id'] for g in gyms if g['city']==key),None)})
data={'gyms':gyms,'cities':cities}
Path('outputs/laozu-web/poke/progression.js').write_text('(function(r){const data='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module==="object"&&module.exports)module.exports=data;else r.POKE_PROGRESSION=data;})(globalThis);\n',encoding='utf-8')
root.joinpath('source.json').write_text(json.dumps({'source':'PokeCatch STORY + gymTeam/aceOf; snapshot 2026-10-22','assets':assets,'data':data},ensure_ascii=False,indent=2),encoding='utf-8')
print('8 gyms, 11 towns, 8 source scenes')
