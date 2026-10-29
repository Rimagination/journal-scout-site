# Journal Scout Site

Public GitHub Pages artifact for `journal.scansci.com`.

This repository intentionally contains only the static website shell and public aggregate files.
The full journal database, build scripts, and private source data stay in the private
`Rimagination/journal-scout` repository and in the ScanSci D1-backed API.

Runtime data is served by:

- `GET https://www.scansci.com/api/journals/search`
- `GET https://www.scansci.com/api/journals/detail?id=...`
- `GET https://www.scansci.com/api/journals/metrics?issn=...`

The public compact APC catalog lives in `data/official_apc_issns.json`,
`data/official_apc_lookup_index.json`, and `data/official_apc_records/`. A scheduled
GitHub Actions workflow refreshes it from publisher price lists every Monday and
commits changed runtime assets, which triggers the legacy GitHub Pages deployment.

Do not commit row-level journal datasets such as `data/journals.json`,
`data/search_index.json`, `data/related_index.json`, `data/journal_chunks/`, or the
full maintenance catalog `data/official_apc_prices.json`.

The browser extension guide is `extension-install.html`. Edge users should install the
public [Microsoft Edge Add-ons listing](https://microsoftedge.microsoft.com/addons/detail/journal-scout-%E6%9C%9F%E5%88%8A%E5%88%86%E5%8C%BA%E4%B8%8E%E5%BD%B1%E5%93%8D%E5%9B%A0%E5%AD%90/jehpajedcihlfkcichdodghfigadcmbk),
verified live on 2026-10-29; Edge manages subsequent store updates. Users migrating from
the unpacked extension should disable the old installation to avoid duplicate badges;
extension settings do not automatically transfer between the two extension IDs.

Chrome manual installation and Firefox temporary installation still use the tested release
archives in `downloads/`. Update the displayed version, link paths and corresponding
archives together when publishing a new manual release. The Firefox package is currently
unsigned and is offered only for temporary installation. A store listing URL must be
verified publicly available before adding it to this guide.
