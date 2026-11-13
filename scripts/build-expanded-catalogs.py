"""Build the second, source-pinned batch of school Excel catalogs.

Keep the original files under --archive/raw with the filenames and hashes in
assets/catalogs/expanded-sources.json. Originals are read only. Table caches are
accepted only with the matching source hash; --refresh re-extracts them.
"""
import argparse
from collections import Counter
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

import pymupdf

SITE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('standard', SITE / 'scripts/build-standard-catalogs.py')
standard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(standard)


def clean(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', str(value or ''))).strip()


def numeric(value):
    return bool(re.fullmatch(r'\d+[.]?', clean(value)))


def conference(name):
    return bool(re.search(r'\b(?:conference|symposium|congress|workshop)\b|国际.*会议', name, re.I))


def horizontal_text(page, lines, rect):
    """Ignore diagonal personal watermarks without editing the original PDF."""
    result = []
    for line in lines:
        chars = [c for span in line['spans'] for c in span['chars']
                 if rect[0] - .5 <= (c['bbox'][0] + c['bbox'][2]) / 2 <= rect[2] + .5
                 and rect[1] - .5 <= (c['bbox'][1] + c['bbox'][3]) / 2 <= rect[3] + .5]
        if chars:
            result.append(''.join(c['c'] for c in chars).strip())
    return '\n'.join(result)


def tables(item, archive, refresh):
    source = item['originals'][0]
    cache = archive / (item['sourceId'] + '-reviewed-tables.json')
    if cache.exists() and not refresh:
        data = json.loads(cache.read_text(encoding='utf-8'))
        assert data['sourceSha256'] == source['sha256'], 'Stale table cache'
        return data['pages']
    pages = []
    with pymupdf.open(archive / 'raw' / source['filename']) as doc:
        for page in doc:
            horizontal = item['parser'] == 'xidian-2025'
            lines = [line for block in page.get_text('rawdict')['blocks'] if 'lines' in block
                     for line in block['lines'] if abs(line['dir'][1]) < .001] if horizontal else []
            found = []
            # Filled cells in the ZUEL PDF create false row boundaries with
            # the default strategy. Use actual ruled lines for that source.
            for table in page.find_tables(strategy='lines_strict' if item['parser'] == 'zuel-2025' else 'lines').tables:
                above = [0, 0, page.rect.width, table.bbox[1]]
                found.append({'bbox': list(table.bbox),
                              'above': horizontal_text(page, lines, above) if horizontal else page.get_text(clip=pymupdf.Rect(above)),
                              'rows': [[horizontal_text(page, lines, cell) if cell else None for cell in row.cells]
                                       for row in table.rows] if horizontal else table.extract()})
            pages.append({'page': page.number + 1,
                          'text': horizontal_text(page, lines, list(page.rect)) if horizontal else page.get_text(),
                          'tables': found})
    cache.write_text(json.dumps({'sourceSha256': source['sha256'], 'pages': pages}, ensure_ascii=False), encoding='utf-8')
    return pages


def convert(item, archive, refresh):
    sid = item['parser']
    rows, exclusions = [], []

    def add(name, grade, scope, page, sequence='', **fields):
        name, grade = clean(name), clean(grade)
        if not name or not grade:
            raise ValueError(f'{sid} missing name or grade at {page}: {name} {grade}')
        if re.search(r'其他.*(?:期刊|刊物)|其[他它]子刊|所有.*期刊|JCR排名|SCI/SSCI收录期刊', name, re.I):
            exclusions.append({'name': name, 'identifier': grade, 'location': str(page)})
            return
        row = {'name': name, 'grade': grade, 'scope': clean(scope), 'subject': clean(scope),
               'sourceLocation': f'PDF第{page}页，序号{sequence}' if isinstance(page, int) else str(page),
               'type': 'conference' if conference(name) else 'journal', **fields}
        rows.append({k: clean(v) if isinstance(v, str) else v for k, v in row.items()})

    if sid == 'zju-2024-docx':
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        with zipfile.ZipFile(archive / 'raw' / item['originals'][0]['filename']) as book:
            root = ET.fromstring(book.read('word/document.xml'))
        for ti, table in enumerate(root.findall('.//w:tbl', ns)):
            for row in table.findall('w:tr', ns):
                values = [clean(''.join(cell.itertext())) for cell in row.findall('w:tc', ns)]
                if len(values) != 3 or not numeric(values[0]):
                    continue
                sequence, name, identifier = values
                grade = '权威' if ti == 0 and '*' in name else '一级' if ti == 0 else '核心'
                add(name.replace('*', ''), grade, '国内学术期刊', f'DOCX表{ti + 1}，序号{sequence}',
                    issn=identifier, notes='原目录*号标记为人文社科权威期刊。' if '*' in name else '')
        assert [len(t.findall('w:tr', ns)) - 1 for t in root.findall('.//w:tbl', ns)] == [367, 1500]
        return rows, exclusions

    pages = tables(item, archive, refresh)
    scope, grade = '', ''
    for page in pages:
        number = page['page']
        for table in page['tables']:
            above = clean(table.get('above', ''))
            if sid == 'xidian-2025':
                headings = re.findall(r'(顶尖成果|工学类学科推荐[12] 类贡献度期刊|理学类学科推荐[12] 类贡献度期刊|人文社科类学科推荐[12] 类贡献度期刊)', above)
                if headings:
                    scope = headings[-1]
            elif sid == 'zuel-2025' and number < 29:
                headings = re.findall(r'([^\n]+)[(](\d+)\s*种[)]', unicodedata.normalize('NFKC', table.get('above', '')))
                if headings:
                    scope = clean(headings[-1][0])
            for raw in table['rows']:
                cells = [clean(value) for value in raw]
                if sid == 'cpu-2026':
                    if len(cells) < 4 or not numeric(cells[1]):
                        continue
                    grade, sequence = cells[:2]
                    if number < 102:
                        add(cells[2], grade, '自然科学 / ' + re.sub(r'学科.*', '', grade) if '学科' in grade else '自然科学',
                            number, sequence, issn=cells[4], abbreviation=cells[3])
                    elif number < 105:
                        add(cells[2], grade, '计算机类会议', number, sequence, type='conference', abbreviation=cells[3])
                    elif number < 140:
                        add(cells[3], grade, '人文社科中文 / ' + cells[2], number, sequence, issn=cells[5], notes='主办单位：' + cells[4])
                    else:
                        add(cells[2], grade, '人文社科英文', number, sequence, issn=cells[3])
                elif sid == 'ncepu-2025':
                    if len(cells) != 4 or not numeric(cells[0]):
                        continue
                    if cells[0] == '1':
                        scope = '自然科学' if number == 1 else '人文社会科学'
                    identifier = cells[3]
                    add(cells[2], cells[1], scope, number, cells[0],
                        **({'cn': identifier} if re.fullmatch(r'\d{2}-\d{4}/[A-Z0-9]+', identifier) else {'issn': identifier}))
                elif sid == 'xidian-2025':
                    if len(cells) != 3 or not numeric(cells[0]):
                        continue
                    assert scope, number
                    add(cells[1], cells[2].replace(' 类', '类'), scope, number, cells[0])
                elif sid == 'zuel-2025':
                    while cells and not cells[0]:
                        cells.pop(0)
                    while cells and not cells[-1]:
                        cells.pop()
                    if not cells or not numeric(cells[0]):
                        continue
                    if len(cells) != 5:
                        raise ValueError(f'{sid} unexpected row p{number}: {cells}')
                    if number < 29:
                        add(cells[1], cells[4], '中文 / ' + scope, number, cells[0], cn=cells[3], notes='主办单位：' + cells[2])
                    else:
                        add(cells[2], cells[4], '英文 / ' + cells[1], number, cells[0], issn=cells[3])
                elif sid == 'dufe-2025':
                    if len(cells) not in [5, 6] or not numeric(cells[0]):
                        continue
                    if len(cells) == 5:
                        add(cells[3], cells[1], '中文学术期刊', number, cells[0], notes='主办单位：' + cells[4])
                    else:
                        add(cells[3], cells[1], '外文学术期刊', number, cells[0], issn=cells[4], eissn=cells[5])
                elif sid == 'cau-cem-2025':
                    heading = re.fullmatch(r'([ABCD][+]?)\s*类期刊[(](\d+)\s*本[)]', cells[0]) if cells else None
                    if heading:
                        grade = heading[1]
                    if not cells or not numeric(cells[0]):
                        continue
                    values = [c for c in cells if c]
                    assert len(values) == 3, (sid, number, values)
                    sequence, name, identifiers = values
                    assert grade, (sid, number)
                    fields = {}
                    for key, pattern in [('issn', r'(?<!e)ISSN\s*[:：]?\s*([^ ]+)'), ('eissn', r'eISSN\s*[:：]?\s*([^ ]+)'), ('cn', r'CN\s*[:：]?\s*([^ ]+)')]:
                        match = re.search(pattern, identifiers)
                        if match:
                            fields[key] = match[1]
                    add(name, grade, '经济管理学院', number, sequence, **fields)
                elif sid == 'fdu-som-cn-2025':
                    heading = re.fullmatch(r'国内([AB][+-]?)\s*期刊', cells[0]) if cells else None
                    if heading:
                        grade = heading[1]
                    if len(cells) != 2 or not cells[1] or cells[0] == '期刊名':
                        continue
                    assert grade, (sid, cells)
                    name = re.sub(r'\s*[(](?:SCI|SSCI)[)]', '', cells[0])
                    add(name, grade, '管理学院国内期刊', number, notes='主办单位：' + cells[1])
                elif sid == 'fdu-som-en-2024':
                    if len(cells) != 2:
                        continue
                    name, value = cells
                    if name and not value:
                        if name == 'Grade A+':
                            scope = '跨学科A+'
                        elif not name.startswith('复旦大学'):
                            scope = name
                    if re.fullmatch(r'[AB][+-]?', value):
                        add(name, value, '管理学院国际 / ' + scope, number)
                elif sid == 'cup-science-2026' and 72 <= number <= 85:
                    if 72 <= number <= 73:
                        scope = '理学院 / 化学'
                    elif 76 <= number <= 79:
                        scope = '理学院 / 应用数学与能源数据科学'
                    elif 82 <= number <= 85:
                        scope = '理学院 / 能源物理科学与技术'
                    else:
                        continue
                    if len(cells) == 3 and numeric(cells[0]):
                        add(cells[1], cells[2], scope, number, cells[0])
    if sid == 'cpu-2026':
        assert sum(r['scope'].startswith('自然科学') for r in rows) == 2487
        assert sum(r['type'] == 'conference' for r in rows) == 59
    if sid == 'cau-cem-2025':
        assert Counter(row['grade'] for row in rows) == {'A+': 6, 'A': 32, 'B+': 26, 'B': 101, 'C': 114, 'D': 35}
    if sid == 'zuel-2025':
        headings = re.findall(r'[^\n]+[（(](\d+)\s*种[）)]', '\n'.join(p['text'] for p in pages[10:]))
        assert len(headings) == 64 and sum(map(int, headings)) == len(rows) == 1685
    if sid in ['xidian-2025', 'ncepu-2025', 'dufe-2025', 'cup-science-2026']:
        # Source row numbers restart at each clearly labeled subject/scope.
        # Every sequence must be present exactly once before deduplication.
        sequences = {}
        for row in rows:
            sequence = int(re.search(r'序号(\d+)', row['sourceLocation'])[1])
            sequences.setdefault(row['scope'], []).append(sequence)
        for scope, values in sequences.items():
            assert sorted(values) == list(range(1, max(values) + 1)), (sid, scope, 'missing or repeated source number')
    return rows, exclusions


NORMALIZE = r'''
import fs from 'node:fs';
import {createHash} from 'node:crypto';
await import('./catalogs-core.js');
const core=globalThis.JournalScoutCatalogs;
const input=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
for(const catalog of input) {
  const issues=[],dedup=new Map();
  for(const raw of catalog.rows) {
    const row={...raw};
    for(const field of ['issn','eissn']) if(row[field]) {
      if(row.type==='conference' || !core.validIssn(row[field])) {
        const reason=`原始 ${field}: ${row[field]}（未进入匹配字段，按名称匹配）`;
        row.notes=[row.notes,reason].filter(Boolean).join('；');
        issues.push({name:row.name,grade:row.grade,scope:row.scope,location:row.sourceLocation,reason});
        row[field]='';
      }
    }
    if(row.cn && !/^\d{2}-\d{4}(?:\/[A-Z][A-Z0-9]*)?$/i.test(row.cn)) {
      row.notes=[row.notes,`原始CN号：${row.cn}（未进入匹配字段）`].filter(Boolean).join('；');row.cn='';
    }
    const normalized=core.entry(row),key=[normalized.type,core.key(normalized.scope),core.key(normalized.name)].join('|');
    const previous=dedup.get(key);
    if(previous) {
      if(previous.grade!==normalized.grade) throw Error(catalog.item.sourceId+' conflicting name/grade '+JSON.stringify(normalized));
      for(const field of ['issn','eissn']) if(previous[field] && normalized[field] && previous[field]!==normalized[field]) throw Error('Conflicting identifiers '+row.name);
      for(const field of ['issn','eissn','cn']) if(!previous[field]) previous[field]=normalized[field];
      previous.notes=[previous.notes,`同范围同等级重复条目已合并：${normalized.sourceLocation}`].filter(Boolean).join('；').slice(0,1000);
      issues.push({name:row.name,grade:row.grade,scope:row.scope,location:row.sourceLocation,reason:'同范围同名同等级合并'});
    } else dedup.set(key,normalized);
  }
  const entries=[...dedup.values()],identities=new Map();
  const idKey=(row,field)=>[row.type,core.key(row.scope),field==='cn'?'cn':'issn',field==='cn'?row[field].toUpperCase():core.issn(row[field])].join('|');
  for(const row of entries) for(const field of ['issn','eissn','cn']) if(row[field]) {
    const token=idKey(row,field);
    if(!identities.has(token)) identities.set(token,new Set());
    identities.get(token).add(core.key(row.name));
  }
  // Conflicting source identifiers are quarantined for every affected title.
  // Do not guess which school's printed identifier should win.
  for(const row of entries) for(const field of ['issn','eissn','cn']) if(row[field] && identities.get(idKey(row,field)).size>1) {
    const reason=`原始 ${field}: ${row[field]}（原表同范围对应多个不同刊名，未用于匹配）`;
    row.notes=[row.notes,reason].filter(Boolean).join('；').slice(0,1000);
    issues.push({name:row.name,grade:row.grade,scope:row.scope,location:row.sourceLocation,reason});
    row[field]='';
  }
  const checked=core.validateEntries(entries);
  if(checked.errors.length) throw Error(catalog.item.sourceId+' '+JSON.stringify(checked.errors.slice(0,12)));
  catalog.pack=await core.localPackage({...catalog.item,name:catalog.item.name,notes:catalog.item.notes},entries);
  catalog.issues=issues;
  catalog.entriesSha256=createHash('sha256').update(JSON.stringify(entries)).digest('hex');
  delete catalog.rows;
}
fs.writeFileSync(process.argv[1],JSON.stringify(input));
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, default=SITE / '.local/catalog-expansion-20261113')
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    manifest = json.loads((SITE / 'assets/catalogs/expanded-sources.json').read_text(encoding='utf-8'))
    catalogs = []
    for item in manifest['catalogs']:
        for source in item['originals']:
            assert hashlib.sha256((args.archive / 'raw' / source['filename']).read_bytes()).hexdigest() == source['sha256'], source['filename']
        rows, exclusions = convert(item, args.archive, args.refresh)
        catalogs.append({'item': item, 'rows': rows, 'exclusions': exclusions, 'originalCount': len(rows)})
        print(item['sourceId'], len(rows), 'named rows', flush=True)
    intermediate = args.archive / 'normalized-packages.json'
    intermediate.write_text(json.dumps(catalogs, ensure_ascii=False), encoding='utf-8')
    subprocess.run(['node', '--input-type=module', '-e', NORMALIZE, str(intermediate)], cwd=SITE, check=True)
    catalogs = json.loads(intermediate.read_text(encoding='utf-8'))
    index_path = SITE / 'assets/catalogs/standard-index.json'
    index = json.loads(index_path.read_text(encoding='utf-8'))
    for catalog in catalogs:
        item, pack = catalog['item'], catalog['pack']
        sid = item['sourceId']
        scope_counts = Counter(row['scope'] for row in pack['entries'])
        review = {'sourceId': sid, 'originalRows': catalog['originalCount'], 'standardRows': len(pack['entries']),
                  'conferenceRows': sum(r['type'] == 'conference' for r in pack['entries']),
                  'checkedOn': item['checkedOn'], 'scopeChecks': [{'scope': scope, 'standardRows': count} for scope, count in scope_counts.items()], 'issues': catalog['issues'],
                  'exclusions': catalog['exclusions'],
                  'sources': [{'title': source['filename'], 'url': item['sourceUrl'], 'originalUrl': source['url'],
                               'sha256': source['sha256']} for source in item['originals']]}
        target = SITE / 'downloads/catalogs/standard' / (sid + '-20261113.xlsx')
        standard.workbook(pack, target, review)
        index['sources'][sid] = {'sourceId': sid, 'count': len(pack['entries']), 'originalCount': catalog['originalCount'],
                                'parts': 1, 'files': [target.name], 'conferenceCount': review['conferenceRows'],
                                'sourceSha256': item['originals'][0]['sha256'], 'sourceIds': [sid],
                                'download': './downloads/catalogs/standard/' + target.name,
                                'buildBatch': '20261113-expansion', 'entriesSha256': catalog['entriesSha256']}
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding='utf-8')
    subprocess.run(['python', str(SITE / 'scripts/build-reference-library.py')], cwd=SITE, check=True)
    print('Built', len(catalogs), 'Excel catalogs,', sum(len(c['pack']['entries']) for c in catalogs), 'rows')


if __name__ == '__main__':
    main()
