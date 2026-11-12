"""Generate Zotero's native update manifest from the published release and XPI."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

from zotero_release import VERSION


def main():
    root = Path(__file__).resolve().parents[1]
    release = json.loads((root / 'data/zotero-data-release.json').read_text(encoding='utf-8'))
    version = release['pluginVersion']
    if not VERSION.fullmatch(version):
        raise ValueError('Invalid advertised plugin version.')
    filename = f'journal-scout-zotero-{version}.xpi'
    package = root / 'downloads' / filename
    with ZipFile(package) as archive:
        manifest = json.loads(archive.read('manifest.json'))
    app = manifest['applications']['zotero']
    if manifest['version'] != version or app['id'] != 'journal-scout@scansci.com':
        raise ValueError('XPI version or ID does not match the advertised release.')
    if app['update_url'] != 'https://journal.scansci.com/updates/zotero.json':
        raise ValueError('XPI points at a different native update manifest.')
    update = {
        'version': version,
        'update_link': f'https://journal.scansci.com/downloads/{filename}',
        'update_hash': 'sha256:' + hashlib.sha256(package.read_bytes()).hexdigest(),
        'applications': {'zotero': {
            'strict_min_version': app['strict_min_version'],
            'strict_max_version': app['strict_max_version'],
        }},
    }
    output = root / 'updates/zotero.json'
    output.parent.mkdir(exist_ok=True)
    output.write_text(json.dumps({'addons': {app['id']: {'updates': [update]}}}, indent=2) + '\n', encoding='utf-8')
    print(f'Generated native Zotero update v{version}: {output}')


if __name__ == '__main__':
    main()
