import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
test('static school references have real downloads, explicit scopes and no local filesystem paths',async()=>{
  const text=await readFile(path.join(root,'assets/catalogs/library-index.json'),'utf8');
  const index=JSON.parse(text);assert.equal(index.schools.length,38);
  assert.ok(!text.includes('D:\\')&&!text.includes('C:\\'));
  let downloads=0;
  for(const school of index.schools){
    assert.ok(school.catalogs.length);
    assert.equal(school.is211,true,'the current research inventory contains only historical 211 institutions');
    const logo=new URL(school.logo.url);
    assert.equal(logo.origin,'https://www.scansci.com');
    assert.match(logo.pathname,/^\/logo-assets\/\d+\/logos\/images\/[a-z0-9-]+\/[a-z0-9]+\/\d+\.webp$/);
    assert.ok(school.logo.id&&school.logo.revision&&school.logo.sourceUrl);
    for(const catalog of school.catalogs)assert.ok(catalog.scope&&catalog.edition&&catalog.status);
    if(school.download){assert.match(school.download,/^\.\/downloads\/catalogs\/references\/[a-z0-9-]+\.zip$/);assert.ok((await stat(path.join(root,school.download))).size>0);downloads++;}
  }
  assert.equal(downloads,30);
  assert.equal(index.schools.find(s=>s.institution==='西安电子科技大学').download,'','personally watermarked archive is not distributed');
});
