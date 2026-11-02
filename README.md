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

The browser extension guide is `extension-install.html`. Edge and Chrome users can choose
their public store listing or a versioned offline package. Edge users can install from the
public [Microsoft Edge Add-ons listing](https://microsoftedge.microsoft.com/addons/detail/journal-scout-%E6%9C%9F%E5%88%8A%E5%88%86%E5%8C%BA%E4%B8%8E%E5%BD%B1%E5%93%8D%E5%9B%A0%E5%AD%90/jehpajedcihlfkcichdodghfigadcmbk),
and Chrome users can install from the public [Chrome Web Store listing](https://chromewebstore.google.com/detail/journal-scout-%E6%9C%9F%E5%88%8A%E5%88%86%E5%8C%BA%E4%B8%8E%E5%BD%B1%E5%93%8D%E5%9B%A0%E5%AD%90/mnoflinhlbochdphhmjogjfnokncpoec).
Both stores manage automatic updates after review. The versioned Chromium packages in
`downloads/` support manual offline installation and can be offered as soon as a new package
is published; update the displayed version, link paths and corresponding archives together.
Users switching between store and offline installations should disable the old installation
to avoid duplicate badges; settings do not automatically transfer between separate extension
IDs. The Firefox package is currently unsigned and is offered only for temporary installation.
