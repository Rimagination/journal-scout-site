import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
await import('../catalogs-core.js');
const core=globalThis.JournalScoutCatalogs;
const root=fileURLToPath(new URL('../',import.meta.url));

test('library links only to standardized catalogs and marks other sources as pending',async()=>{
  const text=await readFile(path.join(root,'assets/catalogs/library-index.json'),'utf8');
  const index=JSON.parse(text);assert.equal(index.schools.length,38);
  assert.ok(!text.includes('D:\\')&&!text.includes('C:\\'));
  let downloads=0,pending=0;
  for(const school of index.schools){
    assert.ok(school.catalogs.length);assert.equal(school.download,undefined);
    assert.equal(school.is211,true);
    const logo=new URL(school.logo.url);assert.equal(logo.origin,'https://www.scansci.com');
    assert.match(logo.pathname,/^\/logo-assets\/\d+\/logos\/images\/[a-z0-9-]+\/[a-z0-9]+\/\d+\.webp$/);
    for(const catalog of school.catalogs){
      assert.ok(catalog.scope&&catalog.edition&&catalog.status&&catalog.sourceId);
      if(catalog.standard){
        assert.equal(catalog.availability,'ready');
        assert.match(catalog.standard.download,/^\.\/downloads\/catalogs\/standard\/[a-z0-9-]+\.zip$/);
        assert.ok((await stat(path.join(root,catalog.standard.download))).size>0);downloads++;
      }else{assert.equal(catalog.availability,'pending');pending++;}
    }
  }
  assert.equal(downloads,8);assert.equal(pending,39);
  const food=index.schools.find(s=>s.institution==='西北农林科技大学').catalogs.filter(c=>c.name.includes('食品学院'));
  assert.equal(food.length,1);assert.equal(food[0].name,'食品学院高质量期刊指导目录');
  assert.equal(food[0].standard.count,156);assert.equal(food[0].standard.parts,1);
});

test('every downloadable JSON catalog imports correctly and round-trips through its standard Excel table',async()=>{
  const inspect=String.raw`
import json,zipfile,io,sys
from pathlib import Path
import openpyxl
root=Path(sys.argv[1]);index=json.loads((root/'assets/catalogs/standard-index.json').read_text(encoding='utf8'));out=[]
for item in index['sources'].values():
 with zipfile.ZipFile(root/item['download']) as z:
  assert len(z.namelist())==len(set(z.namelist()))
  assert not any(n.lower().endswith(('.pdf','.doc','.docx','.png')) for n in z.namelist())
  review=json.loads(z.read('整理记录.json'))
  packs=[]
  for name in item['files']:
   body=z.read(name);assert len(body)<=900000
   book=openpyxl.load_workbook(io.BytesIO(z.read(name.replace('.json','.xlsx'))),data_only=False)
   sheet=book['目录'];assert not sheet.merged_cells
   assert all(c.data_type!='f' for row in sheet for c in row)
   table=[[v if v is not None else '' for v in row] for row in sheet.values]
   packs.append({'json':body.decode('utf8'),'table':table})
  out.append({'index':item,'review':review,'packs':packs})
print(json.dumps(out,ensure_ascii=False))
`;
  const sources=JSON.parse(execFileSync('python',['-X','utf8','-c',inspect,root],{encoding:'utf8',maxBuffer:30*1024*1024}));
  let total=0,files=0;
  for(const source of sources){
    let count=0;const entries=[];
    assert.match(source.review.sourceSha256,/^[a-f0-9]{64}$/);
    assert.equal(source.review.sourceSha256,source.index.sourceSha256);
    for(const part of source.packs){
      const pack=core.importPackage(part.json),table=core.fromTable(part.table);
      assert.equal(pack.updateMode,'manual');assert.equal(table.unknown.length,0);
      assert.deepEqual(table.errors,[]);assert.deepEqual(table.entries,pack.entries);
      assert.ok(pack.entries.length<=5000);
      for(const row of pack.entries)if(row.type==='conference')assert.ok(!row.issn&&!row.eissn&&!row.cn);
      count+=pack.entries.length;entries.push(...pack.entries);files++;
    }
    assert.equal(count,source.index.count);assert.equal(count,source.review.standardRows);
    assert.equal(source.packs.length,source.index.parts);total+=count;
    if(source.index.sourceId==='uibe-en-2026'){
      assert.equal(source.review.scopeChecks[0].sections,19);
      const cvpr=entries.find(r=>r.name.includes('IEEE/CVF COMPUTER VISION AND PATTERN'));
      assert.equal(cvpr.type,'conference');assert.match(cvpr.subject,/ARTIFICIAL INTELLIGENCE/);
    }
    if(source.index.sourceId==='swufe-2025')assert.ok(!entries.some(r=>r.name.includes('其他子刊')));
    if(source.index.sourceId==='nwafu-food-2025'){
      assert.equal(source.packs.length,1);
      assert.equal(entries.filter(r=>r.grade==='A').length,101);
      assert.equal(entries.filter(r=>r.grade==='B').length,55);
      assert.deepEqual(source.review.sources.map(s=>s.id),['nwafu-food-a-2025','nwafu-food-b-2025']);
      for(const doc of source.review.sources)assert.match(doc.sha256,/^[a-f0-9]{64}$/);
      for(const row of entries)assert.ok(row.sourceLocation.includes(`（${row.grade}刊）`));
    }
    if(source.index.sourceId==='swjtu-2026-public'){
      const names=new Set(source.review.exclusions.map(r=>core.key(r.name)));
      const ids=new Set(source.review.exclusions.map(r=>core.issn(r.identifier)));
      assert.ok(!entries.some(r=>r.type==='journal'&&(names.has(core.key(r.name))||[r.issn,r.eissn].filter(Boolean).some(id=>ids.has(core.issn(id))))));
    }
  }
  assert.equal(total,11773);assert.equal(files,14);
});
