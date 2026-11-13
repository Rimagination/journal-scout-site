"""Build static school reference downloads from the archived research manifest.

Original files keep their original bytes. No reference is converted into a
plugin classification package by this script; that requires a separate review.
"""
from pathlib import Path
from collections import defaultdict
import json,zipfile

SITE=Path(__file__).resolve().parents[1]
PROJECT=SITE.parent/'journal-scout'
MANIFEST=PROJECT/'docs/catalogs/985-211-20261113/sources.json'
RAW=PROJECT/'.local/university-catalogs-20261113/raw'
ASSETS=SITE/'assets/catalogs'
DOWNLOADS=SITE/'downloads/catalogs/references'
ASSETS.mkdir(parents=True,exist_ok=True);DOWNLOADS.mkdir(parents=True,exist_ok=True)
data=json.loads(MANIFEST.read_text(encoding='utf-8'))
logos=json.loads((ASSETS/'university-logos.json').read_text(encoding='utf-8'))['schools']
grouped=defaultdict(list)
for item in data['sources']:grouped[item['school']].append(item)
schools=[]
for school,items in grouped.items():
    slug=items[0]['id'].split('-')[0]
    # University directories share one school card; specific campus names remain explicit.
    name=slug+'-references-20261113.zip'
    files=[]
    for item in items:
        original=RAW/Path(item.get('local_file') or '').name
        if item['id']=='xidian-2025':continue # The archived original contains a personal watermark.
        if item['format'] in ['pdf','xlsx','docx','doc','png'] and original.is_file():files.append((item,original))
    if files:
        note='\n\n'.join(f"{x['title']}\n版本：{x['edition']}\n范围：{x['scope']}\n状态：{x['status']}；{x['currentness']}\n说明：{x['note']}\n来源：{x['page_url']}\n原件：{x['file_url']}" for x in items)
        with zipfile.ZipFile(DOWNLOADS/name,'w',compression=zipfile.ZIP_DEFLATED) as z:
            z.writestr('资料说明.txt','本包为参考原件，不是可直接导入插件的目录包。\n请核对版本、适用范围与认定条件。\n整理日期：2026-11-13\n\n'+note)
            for item,p in files:z.write(p,p.name)
    schools.append({'institution':school,'is985':items[0]['is985'],'summary':f'{len(items)}项资料 · '+('原始文件已归档；插件目录包待整理核对' if files else '已确认官网入口，原件暂不提供下载'),'download':'./downloads/catalogs/references/'+name if files else '', 'catalogs':[{'name':x['title'],'edition':x['edition'],'scope':x['scope'],'status':x['status'],'currentness':x['currentness'],'note':x['note'],'sourceUrl':x['page_url']} for x in items]})
schools.sort(key=lambda s:(not bool(s['download']),s['institution']))
for school in schools:
    # This research manifest only contains schools from the historical 211 list.
    school['is211']=True
    school['logo']=logos.get(school['institution'])
(ASSETS/'library-index.json').write_text(json.dumps({'schemaVersion':1,'updated':'2026-11-13','schools':schools},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'schools':len(schools),'downloads':sum(bool(s['download']) for s in schools),'files':sum(1 for p in DOWNLOADS.glob('*.zip'))},ensure_ascii=False))
