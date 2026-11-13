import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
await import('../catalogs-core.js');
await import('../catalogs-excel.js');
const xlsx=createRequire(import.meta.url)('../assets/vendor/xlsx-0.20.3.min.js');
const excel=globalThis.JournalScoutCatalogExcel;
const metadata={name:'科学期刊目录',label:'学校',institution:'测试大学',edition:'2026',scope:'自然科学'};
const rows=[{name:'Nature',grade:'A+',type:'journal',issn:'0028-0836'},
  {name:'IEEE/CVF Computer Vision and Pattern Recognition Conference',grade:'A',type:'conference',abbreviation:'CVPR'}];
function workbook(table,modify=()=>{}){
  const book=xlsx.utils.book_new(),sheet=xlsx.utils.aoa_to_sheet(table);
  xlsx.utils.book_append_sheet(book,sheet,'目录');modify(book,sheet);
  return xlsx.write(book,{type:'array',bookType:'xlsx',compression:true});
}
const valid=[['名称','等级','类型','ISSN'],['Nature','A','期刊','0028-0836']];

test('Excel export preserves exact values, metadata and leading-zero ISSNs',()=>{
  const buffer=excel.write(metadata,rows,xlsx),result=excel.read(buffer,xlsx);
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.metadata,globalThis.JournalScoutCatalogs.metadata(metadata));
  assert.deepEqual(result.entries,rows.map(globalThis.JournalScoutCatalogs.entry));
  const literal=excel.read(excel.write(metadata,[{...rows[0],grade:'=A+',notes:'=1+2'}],xlsx),xlsx);
  assert.equal(literal.entries[0].grade,'=A+');assert.equal(literal.entries[0].notes,'=1+2');
});
test('the fill-in template has one sheet and only three required columns',async()=>{
  const file=await readFile(new URL('../assets/templates/catalog-upload-v1.xlsx',import.meta.url));
  const book=xlsx.read(file,{type:'buffer'});
  assert.deepEqual(book.SheetNames,['目录']);
  const table=xlsx.utils.sheet_to_json(book.Sheets['目录'],{header:1});
  assert.equal(table.length,1);assert.deepEqual(table[0],['名称','等级','类型']);
  book.Sheets['目录']=xlsx.utils.aoa_to_sheet([...table,['Nature','A','期刊'],['IEEE/CVF Computer Vision and Pattern Recognition Conference','A','会议']]);
  const checked=excel.read(xlsx.write(book,{type:'array',bookType:'xlsx',compression:true}),xlsx);
  assert.deepEqual(checked.errors,[]);assert.equal(checked.entries.length,2);assert.deepEqual(checked.metadata,{});
});
test('renamed PDF/text, missing headers, merged cells, formulas and excessive rows are refused',()=>{
  assert.throws(()=>excel.read(new TextEncoder().encode('%PDF-1.7 This is not a spreadsheet').buffer,xlsx),/xlsx|Excel/);
  assert.throws(()=>excel.read(workbook([['名称','等级'],['Nature','A']]),xlsx),/类型/);
  assert.throws(()=>excel.read(workbook(valid,(_,s)=>s['!merges']=[{s:{r:1,c:0},e:{r:1,c:1}}]),xlsx),/合并/);
  assert.throws(()=>excel.read(workbook(valid,(_,s)=>s.B2={t:'n',v:2,f:'1+1'}),xlsx),/公式/);
  assert.throws(()=>excel.read(workbook([valid[0],...Array.from({length:5001},(_,i)=>['Journal '+i,'A','期刊',''])]),xlsx),/5,000/);
  assert.throws(()=>excel.read(new ArrayBuffer(1024*1024+1),xlsx),/1 MB/);
});
test('row errors include missing values, generic rules, duplicates and identifier conflicts',()=>{
  for(const [table,pattern] of [
    [[valid[0],['Nature','','期刊','']],/名称和等级/],
    [[valid[0],['Nature','A','','']],/类型/],
    [[valid[0],['所有SCI期刊','A','期刊','']],/具体期刊/],
    [[valid[0],['Nature','A','期刊','0028-0000']],/ISSN/],
    [[...valid,valid[1]],/重复/],
    [[...valid,['Other Journal','B','期刊','0028-0836']],/冲突/],
    [[['名称','等级','类型','自创列'],['Nature','A','期刊','note']],/未识别/],
    [[['名称','等级','类型',''],['Nature','A','期刊','hidden data']],/列名/],
    [[['名称','等级','类型'],['Nature\nScience','A','期刊']],/换行/]
  ]){
    const result=excel.read(workbook(table),xlsx);
    assert.ok(result.errors.some(e=>pattern.test(e.message)),JSON.stringify(result.errors));
  }
});
test('each published workbook passes the same validation used for user uploads',async()=>{
  const index=JSON.parse(await readFile(new URL('../assets/catalogs/standard-index.json',import.meta.url),'utf8'));
  for(const item of Object.values(index.sources)){
    const bytes=await readFile(new URL('../'+item.download,import.meta.url));
    const parsed=excel.read(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),xlsx);
    assert.deepEqual(parsed.errors,[],item.sourceId);assert.equal(parsed.entries.length,item.count);
    globalThis.JournalScoutCatalogs.metadata(parsed.metadata);
  }
});
