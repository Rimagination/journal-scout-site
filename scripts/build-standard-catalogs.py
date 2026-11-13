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

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.comments import Comment
from openpyxl.worksheet.datavalidation import DataValidation
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


def append_text(sheet, values):
    sheet.append([str(value) if value is not None else '' for value in values])
    for cell in sheet[sheet.max_row]:
        cell.data_type = 's'
        cell.alignment = Alignment(wrap_text=True, vertical='top')


def workbook(pack, target, review=None):
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
            cell.number_format = '@'
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
    types = DataValidation(type='list', formula1='"期刊,会议"', allow_blank=False)
    types.errorTitle = '请填写类型'
    types.error = '只能选择“期刊”或“会议”。'
    types.showErrorMessage = True
    types.errorStyle = 'stop'
    sheet.add_data_validation(types)
    types.add('C2:C5001')
    info = book.create_sheet('目录信息')
    append_text(info, ['字段', '内容'])
    for key, label in [('name', '目录名称'), ('institution', '学校 / 机构'), ('label', '标签名称'),
                       ('edition', '目录版本'), ('scope', '适用范围'), ('sourceUrl', '官方来源网址'),
                       ('effectiveDate', '生效日期'), ('notes', '规则说明')]:
        append_text(info, [label, pack.get(key, '')])
    info.column_dimensions['A'].width = 18
    info.column_dimensions['B'].width = 100
    for row in info:
        for cell in row:
            cell.data_type = 's'
            cell.alignment = Alignment(wrap_text=True, vertical='top')
    instructions = book.create_sheet('填写说明')
    for row in [
        ['项目', '要求'], ['文件格式', '仅使用 .xlsx；不接受 PDF、CSV、JSON、截图或文字规则。'],
        ['目录工作表', '保留“目录”工作表名和第一行列名；每行填写一个具名期刊或会议。'],
        ['必填列', '名称、等级、类型；类型明确选择“期刊”或“会议”。其他列可留空。'],
        ['名称与等级', '使用全称和原始等级；不可用“所有SCI期刊”等集合规则代替名单。'],
        ['标识', 'ISSN / eISSN 可留空；填写时须通过校验。会议不填写论文集刊号。'],
        ['别名', '多个别名用英文分号分隔；不能与同范围其他条目的名称或标识冲突。'],
        ['限制', '最多5,000行、1 MB；禁止合并单元格、公式、宏和外部链接。'],
        ['资料来源', '请保留来源网址、适用范围和版本；格式通过不代表认定规则已核实。']
    ]:
        append_text(instructions, row)
    instructions.column_dimensions['A'].width = 20
    instructions.column_dimensions['B'].width = 100
    if review:
        sources = book.create_sheet('来源记录')
        append_text(sources, ['原件', '官方来源', '原件地址', 'SHA-256'])
        for doc in review['sources']:
            append_text(sources, [doc['title'], doc['url'], doc['originalUrl'], doc['sha256']])
        stats = book.create_sheet('核对汇总')
        for key in ['sourceId', 'originalRows', 'standardRows', 'conferenceRows', 'checkedOn']:
            append_text(stats, [key, review[key]])
        for check in review['scopeChecks']:
            for key, value in check.items():
                append_text(stats, ['scopeChecks.' + key, value])
        issues = book.create_sheet('整理记录')
        append_text(issues, ['名称', '原等级', '适用范围', '来源位置', '序号', '处理原因'])
        for row in review['issues']:
            append_text(issues, [row.get(key, '') for key in ['name', 'grade', 'scope', 'location', 'sequence', 'reason']])
        exclusions = book.create_sheet('排除项')
        append_text(exclusions, ['名称', '原始标识', '来源位置'])
        for row in review['exclusions']:
            append_text(exclusions, [row.get(key, '') for key in ['name', 'identifier', 'location']])
    for ws in book:
        ws.freeze_panes = 'A2'
        for cell in ws[1]:
            cell.font = Font(color='FFFFFF', bold=True)
            cell.fill = PatternFill('solid', fgColor='176650')
        if ws not in [sheet, info, instructions]:
            for column in ws.columns:
                ws.column_dimensions[column[0].column_letter].width = 50
    book.save(target)
    assert target.stat().st_size <= 1024 * 1024, f'Excel exceeds 1 MB: {target}'


def main():
    if '--template-only' in sys.argv:
        template(SITE / 'assets/templates/catalog-upload-v1.xlsx')
        return
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
    # Rebuilding the first batch must not remove independently reviewed additions.
    expanded_path = SITE / 'assets/catalogs/expanded-sources.json'
    published_index = SITE / 'assets/catalogs/standard-index.json'
    if expanded_path.exists() and published_index.exists():
        previous = json.loads(published_index.read_text(encoding='utf-8'))['sources']
        expanded = json.loads(expanded_path.read_text(encoding='utf-8'))['catalogs']
        additions = {item['sourceId']: previous[item['sourceId']] for item in expanded
                     if item['sourceId'] in previous and item['sourceId'] not in manifest['sources']}
    else:
        additions = {}
    downloads = SITE / 'downloads/catalogs/standard'
    downloads.mkdir(parents=True, exist_ok=True)
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    if only:
        assert only in manifest['sources']
    for item in manifest['sources'].values():
        if only and item['sourceId'] != only:
            assert (downloads / Path(item['download']).name).is_file()
            continue
        folder = WORK / item['sourceId']
        package = json.loads((folder / 'catalog.json').read_text(encoding='utf-8'))
        review = json.loads((folder / '整理记录.json').read_text(encoding='utf-8'))
        workbook(package, downloads / Path(item['download']).name, review)
    template(SITE / 'assets/templates/catalog-upload-v1.xlsx')
    manifest['sources'].update(additions)
    (SITE / 'assets/catalogs/standard-index.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    subprocess.run(['python', str(SITE / 'scripts/build-reference-library.py')], cwd=SITE, check=True)
    print(json.dumps({'standardCatalogs': len(manifest['sources']), 'rows': sum(s['count'] for s in manifest['sources'].values()),
                      'scopeChecks': json.loads((WORK / 'input.json').read_text(encoding='utf-8'))['scopeChecks']}, ensure_ascii=False))


def template(target):
    """The fill-in template contains only the three required list fields."""
    book = openpyxl.Workbook()
    sheet = book.active
    sheet.title = '目录'
    sheet.append(['名称', '等级', '类型'])
    for row in [
        ['Nature', 'A（示例）', '期刊'],
        ['Science', 'B（示例）', '期刊'],
        ['IEEE/CVF Computer Vision and Pattern Recognition Conference', 'A+（示例）', '会议']
    ]:
        append_text(sheet, row)
        for cell in sheet[sheet.max_row]:
            cell.fill = PatternFill('solid', fgColor='F2F7F3')
        sheet.row_dimensions[sheet.max_row].height = 24
    sheet.freeze_panes = 'A2'
    sheet.row_dimensions[1].height = 28
    for cell in sheet[1]:
        cell.font = Font(color='FFFFFF', bold=True, size=12)
        cell.fill = PatternFill('solid', fgColor='176650')
        cell.alignment = Alignment(vertical='center')
    for column, width in [('A', 65), ('B', 18), ('C', 14)]:
        sheet.column_dimensions[column].width = width
        sheet.column_dimensions[column].number_format = '@'
    sheet['A1'].comment = Comment('每行填写一个期刊或会议全称，类型从下拉框选择。下方三行仅演示格式，等级不代表高校实际认定；请替换或删除示例后上传。', 'Journal Scout')
    types = DataValidation(type='list', formula1='"期刊,会议"', allow_blank=False)
    types.errorTitle = '请选择类型'
    types.error = '请选择“期刊”或“会议”。'
    types.showErrorMessage = True
    types.errorStyle = 'stop'
    sheet.add_data_validation(types)
    types.add('C2:C5001')
    book.save(target)


if __name__ == '__main__':
    main()
