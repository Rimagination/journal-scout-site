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
