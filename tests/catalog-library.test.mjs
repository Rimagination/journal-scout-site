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
        assert.match(catalog.standard.download,/^\.\/downloads\/catalogs\/standard\/[a-z0-9-]+\.xlsx$/);
        assert.ok((await stat(path.join(root,catalog.standard.download))).size>0);downloads++;
      }else{assert.equal(catalog.availability,'pending');pending++;}
    }
  }
  assert.equal(downloads,8);assert.equal(pending,39);
  const food=index.schools.find(s=>s.institution==='西北农林科技大学').catalogs.filter(c=>c.name.includes('食品学院'));
  assert.equal(food.length,1);assert.equal(food[0].name,'食品学院高质量期刊指导目录');
  assert.equal(food[0].standard.count,156);assert.equal(food[0].standard.parts,1);
});

test('all public Excel catalogs retain the reviewed rows, scopes and provenance',async()=>{
  const inspect=String.raw`
import json,zipfile,io,sys
from pathlib import Path
import openpyxl
root=Path(sys.argv[1]);index=json.loads((root/'assets/catalogs/standard-index.json').read_text(encoding='utf8'));out=[]
for item in index['sources'].values():
 file=root/item['download'];assert file.stat().st_size<=1024*1024
 book=openpyxl.load_workbook(file,data_only=False)
 for sheet in book:
  assert not sheet.merged_cells
  assert all(c.data_type!='f' for row in sheet for c in row)
 assert book['目录'].max_row<=5001
 table=[[v if v is not None else '' for v in row] for row in book['目录'].values]
 # Historical artifacts are a fixed baseline, never offered as new downloads.
 with zipfile.ZipFile(file.with_suffix('.zip')) as z:
  review=json.loads(z.read('整理记录.json'))
  old=[entry for name in z.namelist() if name.endswith('.journal-scout.json') for entry in json.loads(z.read(name))['entries']]
 out.append({'index':item,'review':review,'table':table,'previous':old,
   'metadata':dict(list(book['目录信息'].values)[1:]),'sources':list(book['来源记录'].values)[1:],
   'summary':dict(book['核对汇总'].values),'issues':list(book['整理记录'].values)[1:],'exclusions':list(book['排除项'].values)[1:]})
print(json.dumps(out,ensure_ascii=False))
`;
  const sources=JSON.parse(execFileSync('python',['-X','utf8','-c',inspect,root],{encoding:'utf8',maxBuffer:30*1024*1024}));
  let total=0;
  for(const source of sources){
    assert.match(source.review.sourceSha256,/^[a-f0-9]{64}$/);
    assert.equal(source.review.sourceSha256,source.index.sourceSha256);
    const table=core.fromTable(source.table),entries=table.entries;
    assert.equal(table.unknown.length,0);assert.deepEqual(table.errors,[]);
    const sorted=rows=>rows.map(row=>JSON.stringify(core.entry({...row,name:row.name.replace(/_x000[DA]_/gi,' ').replace(/\s+/g,' ').trim()}))).sort();
    assert.deepEqual(sorted(entries),sorted(source.previous),'every original structured entry survives');
    assert.ok(source.metadata['目录名称']&&source.metadata['标签名称']&&source.metadata['目录版本']);
    assert.equal(Number(source.summary.standardRows),entries.length);
    assert.equal(source.issues.length,source.review.issues.length+(source.index.sourceId==='swjtu-2026-public'?2:0));
    assert.equal(source.exclusions.length,source.review.exclusions.length);
    if(source.review.sources)assert.deepEqual(source.sources.map(r=>r[3]),source.review.sources.map(r=>r.sha256));
    else assert.equal(source.sources[0][3],source.review.sourceSha256);
    for(const row of entries)if(row.type==='conference')assert.ok(!row.issn&&!row.eissn&&!row.cn);
    assert.equal(entries.length,source.index.count);assert.equal(entries.length,source.review.standardRows);
    assert.equal(source.index.parts,1);assert.equal(source.index.files.length,1);total+=entries.length;
    if(source.index.sourceId==='uibe-en-2026'){
      assert.equal(source.review.scopeChecks[0].sections,19);
      const cvpr=entries.find(r=>r.name.includes('IEEE/CVF COMPUTER VISION AND PATTERN'));
      assert.equal(cvpr.type,'conference');assert.match(cvpr.subject,/ARTIFICIAL INTELLIGENCE/);
    }
    if(source.index.sourceId==='swufe-2025')assert.ok(!entries.some(r=>r.name.includes('其他子刊')));
    if(source.index.sourceId==='nwafu-food-2025'){
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
  assert.equal(total,11773);assert.equal(sources.length,8);
});
