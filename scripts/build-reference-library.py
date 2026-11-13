"""Build the public library index. Only standardized packages get download links."""
from pathlib import Path
from collections import defaultdict
import json

SITE=Path(__file__).resolve().parents[1]
PROJECT=SITE.parent/'journal-scout'
MANIFEST=PROJECT/'docs/catalogs/985-211-20261113/sources.json'
ASSETS=SITE/'assets/catalogs'
data=json.loads(MANIFEST.read_text(encoding='utf-8'))
logos=json.loads((ASSETS/'university-logos.json').read_text(encoding='utf-8'))['schools']
standard_path=ASSETS/'standard-index.json'
standards=json.loads(standard_path.read_text(encoding='utf-8'))['sources'] if standard_path.exists() else {}
grouped=defaultdict(list)
for item in data['sources']:
    grouped[item['school']].append(item)
schools=[]
for school,items in grouped.items():
    catalogs=[]
    for item in items:
        package=standards.get(item['id'])
        catalogs.append({'sourceId':item['id'],'name':item['title'],'edition':item['edition'],'scope':item['scope'],
                         'status':item['status'],'currentness':item['currentness'],'note':item['note'],
                         'sourceUrl':item['page_url'],'availability':'ready' if package else 'pending',
                         'standard':{key:package[key] for key in ['download','count','originalCount','parts','conferenceCount']} if package else None})
    schools.append({'institution':school,'is985':items[0]['is985'],'is211':True,
                    'summary':f'{len(items)}份资料，{sum(c["availability"]=="ready" for c in catalogs)}份标准目录可下载',
                    'logo':logos.get(school),'catalogs':catalogs})
schools.sort(key=lambda s:(not any(c['availability']=='ready' for c in s['catalogs']),s['institution']))
(ASSETS/'library-index.json').write_text(json.dumps({'schemaVersion':1,'updated':'2026-11-13','schools':schools},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'schools':len(schools),'standardCatalogs':len(standards),'pending':sum(c['availability']=='pending' for s in schools for c in s['catalogs'])}))
