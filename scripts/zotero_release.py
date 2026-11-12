"""Prepare the public Zotero update signal after the corresponding release is ready."""
import argparse
import datetime as dt
import json
from pathlib import Path
import re

DEFAULT_FILE = Path(__file__).resolve().parents[1] / 'data' / 'zotero-data-release.json'
VERSION = re.compile(r'^(?:0|[1-9]\d{0,5})(?:\.(?:0|[1-9]\d{0,5})){1,3}$')
KINDS = ('impact', 'jcr', 'cas', 'xinrui', 'hq', 'ccf', 'ccft', 'natureIndex', 'chinese', 'indexing', 'warning')


def version_parts(value):
    if not VERSION.fullmatch(value):
        raise ValueError('Version must contain two to four numeric components.')
    return tuple(int(part) for part in value.split('.')) + (0,) * (4 - len(value.split('.')))


def iso(value):
    return value.isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--file', type=Path, default=DEFAULT_FILE, help='Signal file to update')
    parser.add_argument('--data', action='store_true', help='Increment data revision; run only after publishing the API data')
    parser.add_argument('--plugin-version', help='Advertise a newer XPI that is already published')
    parser.add_argument('--tag-match', help='Exact tag returned by the journal search API')
    parser.add_argument('--tag-label', help='Label to display and add as a native Zotero tag')
    parser.add_argument('--tag-kind', choices=KINDS, help='Existing badge color category')
    parser.add_argument('--remove-tag', help='Remove an existing exact-match tag mapping')
    args = parser.parse_args()
    if not (args.data or args.plugin_version):
        parser.error('Specify --data and/or --plugin-version.')
    tag_fields = (args.tag_match, args.tag_label, args.tag_kind)
    if any(tag_fields) and not all(tag_fields):
        parser.error('--tag-match, --tag-label and --tag-kind must be supplied together.')
    if (any(tag_fields) or args.remove_tag) and not args.data:
        parser.error('Tag mapping changes must include --data.')
    for text in (args.tag_match, args.tag_label, args.remove_tag):
        if text is not None and (not text or len(text) > 80 or any(ord(char) < 32 or ord(char) == 127 for char in text)):
            parser.error('Tag text must be 1–80 characters without control characters.')

    release = json.loads(args.file.read_text(encoding='utf-8'))
    if release.get('schemaVersion') != 1 or not isinstance(release.get('revision'), int) or not 1 <= release['revision'] < 1000000000 or not isinstance(release.get('extraBadges'), list):
        raise ValueError('Invalid signal file; nothing was changed.')
    if args.plugin_version:
        if version_parts(args.plugin_version) <= version_parts(release['pluginVersion']):
            parser.error('The new plugin version must be greater than the current version.')
        release['pluginVersion'] = args.plugin_version
    if args.data:
        release['revision'] += 1
        now = dt.datetime.now(dt.timezone.utc)
        release['publishedAt'] = iso(now)
        release['activateAfter'] = iso(now + dt.timedelta(minutes=65))
        rules = release['extraBadges']
        if args.remove_tag:
            rules = [rule for rule in rules if rule.get('match') != args.remove_tag]
        if args.tag_match:
            rules = [rule for rule in rules if rule.get('match') != args.tag_match]
            rules.append({'match': args.tag_match, 'label': args.tag_label, 'kind': args.tag_kind})
        if len(rules) > 100:
            raise ValueError('At most 100 tag mappings are allowed.')
        release['extraBadges'] = rules
    args.file.write_text(json.dumps(release, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"Prepared data revision {release['revision']}, plugin v{release['pluginVersion']}: {args.file}")
    print('Review and publish the changed signal file to make it visible to Zotero clients.')


if __name__ == '__main__':
    main()
