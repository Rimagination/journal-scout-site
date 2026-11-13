"""Build standard school catalogs from named rows and their archived sources.

The private research archive is read only. Only sources with structured rows
are eligible; scanned documents and recognition rules are not guessed into rows.
"""
from pathlib import Path
from collections import Counter
import hashlib
import json
import re
import subprocess
import sys
import zipfile

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
import pymupdf

SITE = Path(__file__).resolve().parents[1]
PROJECT = SITE.parent / 'journal-scout'
ARCHIVE = PROJECT / '.local/university-catalogs-20261113'
WORK = SITE / '.local/standard-catalogs'
WORK.mkdir(parents=True, exist_ok=True)
SOURCE_INDEX = PROJECT / 'docs/catalogs/985-211-20261113/sources.json'


def correct_uibe_scopes(rows, source_id):
    """Re-read multiline/qualified subject headings above each source table."""
    records = [r for r in rows if r['source_id'] == source_id]
    by_location = {(r['pdf_page'], r['source_sequence'], r['title']): r for r in records}
    pattern = re.compile(r'^\d+\.[^\n（(]+(?:\n[^\n（(]+){0,2}\s*[（(][^）)\n]*\d+[^）)\n]*[）)]', re.M)
    scope, headings, matched = '', {}, set()
    first_page = 4 if source_id == 'uibe-cn-2026' else 3
    with pymupdf.open(ARCHIVE / 'raw' / (source_id + '.pdf')) as doc:
        for page in list(doc)[first_page:]:
            for table in sorted(page.find_tables().tables, key=lambda t: t.bbox[1]):
                above = page.get_text(clip=pymupdf.Rect(0, 0, page.rect.width, table.bbox[1]))
                found = pattern.findall(above)
                if found:
                    scope = re.sub(r'\s+', ' ', found[-1]).strip()
                    headings[scope] = int(re.search(r'(\d+)\s*(?:种)?[）)]$', scope).group(1))
                for cells in table.extract():
                    values = [re.sub(r'\s+', ' ', v or '').strip() for v in cells]
                    if not values or not re.fullmatch(r'\d+', values[0]):
                        continue
                    key = (page.number + 1, values[0], values[1])
                    if key in by_location:
                        if not scope:
                            raise ValueError(f'No subject heading for {source_id} {key}')
                        by_location[key]['scope'] = scope
                        matched.add(key)
    counts = Counter(r['scope'] for r in records)
    assert len(matched) == len(records), (source_id, len(matched), len(records))
    expected_sections = 29 if source_id == 'uibe-cn-2026' else 19
    assert len(counts) == expected_sections, (source_id, counts)
    assert dict(counts) == headings, (source_id, counts, headings)
    return {'sourceId': source_id, 'sections': len(counts), 'rows': len(records), 'sectionCountsVerified': True}


def workbook(pack, target):
    book = openpyxl.Workbook()
    sheet = book.active
    sheet.title = '目录'
    fields = [('名称', 'name'), ('等级', 'grade'), ('类型', 'type'), ('ISSN', 'issn'),
              ('eISSN', 'eissn'), ('简称', 'abbreviation'), ('适用范围', 'scope'),
              ('备注', 'notes'), ('CN号', 'cn'), ('别名', 'aliases'),
              ('学科', 'subject'), ('来源位置', 'sourceLocation')]
    sheet.append([name for name, _ in fields])
    for row_index, row in enumerate(pack['entries'], 2):
        values = []
        for _, key in fields:
            value = row.get(key, '')
            if key == 'type':
                value = '会议' if value == 'conference' else '期刊'
            elif key == 'aliases':
                value = ';'.join(value)
            values.append(value)
        # All source values are text, including values beginning with '='.
        for col, value in enumerate(values, 1):
            cell = sheet.cell(row_index, col, value)
            cell.data_type = 's'
    sheet.freeze_panes = 'A2'
    sheet.auto_filter.ref = sheet.dimensions
    widths = [65, 18, 10, 16, 16, 20, 65, 70, 20, 65, 45, 35]
    for col, width in enumerate(widths, 1):
        sheet.column_dimensions[openpyxl.utils.get_column_letter(col)].width = width
    for cell in sheet[1]:
        cell.font = Font(color='FFFFFF', bold=True)
        cell.fill = PatternFill('solid', fgColor='176650')
    for row in sheet.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(vertical='top', wrap_text=True)
    info = book.create_sheet('说明')
    for key, label in [('name', '目录名称'), ('institution', '学校 / 机构'), ('label', '标签名称'),
                       ('edition', '版本'), ('scope', '适用范围'), ('sourceUrl', '官方来源'),
                       ('effectiveDate', '生效日期'), ('notes', '使用说明')]:
        info.append([label, pack.get(key, '')])
    info.column_dimensions['A'].width = 18
    info.column_dimensions['B'].width = 100
    for row in info:
        for cell in row:
            cell.data_type = 's'
            cell.alignment = Alignment(wrap_text=True, vertical='top')
    book.save(target)


def main():
    if '--prepared' in sys.argv:
        data = json.loads((WORK / 'input.json').read_text(encoding='utf-8'))
        # Resume packaging only when the source bytes and section checks agree.
        for source in data['sources']:
            if source['id'] in data['sourceHashes']:
                digest = hashlib.sha256((ARCHIVE / 'raw' / Path(source['local_file']).name).read_bytes()).hexdigest()
                assert digest == data['sourceHashes'][source['id']]
        assert [(c['sections'], c['rows'], c['sectionCountsVerified']) for c in data['scopeChecks']] == [(29, 721, True), (19, 2215, True)]
    else:
        prepare()
    publish()


def prepare():
    sources = json.loads(SOURCE_INDEX.read_text(encoding='utf-8'))['sources']
    rows = json.loads((ARCHIVE / 'organized/explicit-source-rows.json').read_text(encoding='utf-8'))
    scope_checks = [correct_uibe_scopes(rows, key) for key in ['uibe-cn-2026', 'uibe-en-2026']]
    eligible = {r['source_id'] for r in rows}
    hashes = {s['id']: hashlib.sha256((ARCHIVE / 'raw' / Path(s['local_file']).name).read_bytes()).hexdigest()
              for s in sources if s['id'] in eligible}
    data = {'sources': sources, 'rows': rows, 'sourceHashes': hashes, 'scopeChecks': scope_checks,
            'exclusions': json.loads((ARCHIVE / 'organized/excluded-journals.json').read_text(encoding='utf-8'))}
    (WORK / 'input.json').write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')


def publish():
    subprocess.run(['node', str(SITE / 'scripts/build-standard-catalogs.mjs')], cwd=SITE, check=True)
    manifest = json.loads((WORK / 'manifest.json').read_text(encoding='utf-8'))
    downloads = SITE / 'downloads/catalogs/standard'
    downloads.mkdir(parents=True, exist_ok=True)
    for item in manifest['sources'].values():
        folder = WORK / item['sourceId']
        for name in item['files']:
            package = json.loads((folder / name).read_text(encoding='utf-8'))
            workbook(package, (folder / name).with_suffix('.xlsx'))
        with zipfile.ZipFile(downloads / Path(item['download']).name, 'w', zipfile.ZIP_DEFLATED) as z:
            for name in item['files']:
                z.write(folder / name, name)
                z.write((folder / name).with_suffix('.xlsx'), name.replace('.json', '.xlsx'))
            z.write(folder / '整理说明.txt', '整理说明.txt')
            z.write(folder / '整理记录.json', '整理记录.json')
        with zipfile.ZipFile(downloads / Path(item['download']).name) as z:
            assert z.testzip() is None
            assert len(z.namelist()) == len(set(z.namelist()))
    (SITE / 'assets/catalogs/standard-index.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    subprocess.run(['python', str(SITE / 'scripts/build-reference-library.py')], cwd=SITE, check=True)
    print(json.dumps({'standardCatalogs': len(manifest['sources']), 'rows': sum(s['count'] for s in manifest['sources'].values()),
                      'scopeChecks': json.loads((WORK / 'input.json').read_text(encoding='utf-8'))['scopeChecks']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
