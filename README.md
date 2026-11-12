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
The install page's `journal-scout-manual-version` meta tag is also used by the extension to
check for newer manual packages. Only update it, the download links, and the version history
when those packages are actually released; unreleased development changes do not get entries.
Keep earlier published version records when updating the current release. The current
0.1.10 entry consolidates the browser extension changes into one release. Browser and
Zotero releases are recorded separately.
Run `node --test tests/extension-version.test.mjs` to check that the published versions match.
The install guide's searchable coverage table reads `data/extension-site-coverage.json`
only when needed. Its list describes the actual published manual package, groups Chinese
and English sites, and distinguishes list adapters from metadata-based article recognition.
When a manual package is released, check the list and its version against that package's
manifest and implementation; update the table's displayed version and the coverage-data
cache key together. Do not add unreleased sites as covered.
Users switching between store and offline installations should disable the old installation
to avoid duplicate badges; settings do not automatically transfer between separate extension
IDs. The Firefox package is currently unsigned and is offered only for temporary installation.

`zotero.html` is the separate Journal Scout for Zotero product and installation page.
Its public XPI is `downloads/journal-scout-zotero-0.1.0.xpi`; the browser extension and
Zotero plugin have independent versions and installation procedures. The Zotero page
documents the actual tested versions, manual updating, item metadata and tag changes.
Only publish the ordinary Zotero build, never personal builds containing private ranking
lists. Update its download, displayed version and compatibility notes together on release.
`assets/zotero-icon.png` is the original 256 px icon extracted from the installed Zotero
desktop executable, used to identify the target application.
