from __future__ import annotations

import html
import json
import re
import time
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "official_apc_prices.json"
INDEX_PATH = ROOT / "data" / "official_apc_issns.json"
LOOKUP_INDEX_PATH = ROOT / "data" / "official_apc_lookup_index.json"
RECORD_CHUNKS_DIR = ROOT / "data" / "official_apc_records"
RECORD_CHUNK_SIZE = 256
INVALID_ISSN_PLACEHOLDERS = {"00000000", "00001234"}

ELSEVIER_PRICING_PAGE_URL = "https://www.elsevier.com/about/policies-and-standards/pricing/journals"
WILEY_PRICING_PAGE_URL = "https://authors.wiley.com/author-resources/Journal-Authors/open-access/article-publication-charges/index.html"
WILEY_OA_FALLBACK_URL = "https://authors.wiley.com/asset/Wiley-Journal-APCs-Open-Access.xlsx"
WILEY_HYBRID_FALLBACK_URL = "https://authors.wiley.com/asset/Wiley-Journal-APCs-OnlineOpen.xlsx"
SPRINGER_NATURE_PRICING_PAGE_URL = "https://www.springernature.com/gp/open-science/journals-books/journals"
SPRINGER_NATURE_FULLY_OA_FALLBACK_URL = "https://cms-resources.apps.public.k8s.springernature.io/springer-cms/rest/v1/content/27820860/data/v3"
SPRINGER_NATURE_HYBRID_FALLBACK_URL = "https://cms-resources.apps.public.k8s.springernature.io/springer-cms/rest/v1/content/27820862/data/v3"
MDPI_PRICING_PAGE_URL = "https://www.mdpi.com/apc"
MDPI_JINA_URL = "https://r.jina.ai/http://r.jina.ai/http://https://www.mdpi.com/apc"
FRONTIERS_JOURNALS_URL = "https://www.frontiersin.org/journals"
FRONTIERS_FEE_POLICY_URL = "https://www.frontiersin.org/about/fee-policy"
SAGE_PUBLISHING_OPTIONS_URL = "https://www.sagepub.com/journals/information-for-authors/publishing-options"
SAGE_GOLD_FALLBACK_URL = "https://www.sagepub.com/docs/default-source/rp-pages/info-for-authors/sage-gold-oa-apcs-2026.xlsx?sfvrsn=5f7181ea_4"
SAGE_HYBRID_FALLBACK_URL = "https://www.sagepub.com/docs/default-source/rp-pages/info-for-authors/hybrid-oa-sage-choice/sage-choice-price-list-2026---external.xlsx?sfvrsn=4e6e819b_4"
CAMBRIDGE_PRICING_PAGE_URL = "https://www.cambridge.org/core/services/open-research/gold-open-access-journals"
CAMBRIDGE_FALLBACK_URL = "https://assets.ctfassets.net/ulsp6w1o06p0/6Qw0GQo4lQgkOIGGox1Z72/1a3960f59fcbecef369d6ebab2d2880a/CUPA_APC_Pricelist_2026_June.xlsx"
IEEE_APC_PAGE_URL = "https://open.ieee.org/for-authors/article-processing-charges/"
IEEE_APC_PDF_URL = "https://journals.ieeeauthorcenter.ieee.org/wp-content/uploads/sites/7/IEEE-Article-Processing-Charges-List.pdf"
PLOS_FEES_URL = "https://plos.org/fees/"
EMERALD_APC_PAGE_URL = "https://www.emeraldgrouppublishing.com/publish-with-us/publish-open-access/journal"
TAYLOR_FRANCIS_COST_FINDER_URL = "https://authorservices.taylorandfrancis.com/choose-open/publishing-open-access/open-access-cost-finder/"
OUP_CHARGES_URL = "https://academic.oup.com/pages/open-research/open-access/charges-licences-and-self-archiving"

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
}

XLSX_LINK_RE = re.compile(r'href=["\']([^"\']+\.xlsx)["\']', re.I)


def fetch_bytes(url: str, timeout: int = 60, retries: int = 3) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "text/html,application/xhtml+xml,application/xml,application/json,*/*",
            "Accept-Language": "en,zh-CN;q=0.9,zh;q=0.8",
            "User-Agent": "Mozilla/5.0 JournalScout official APC updater",
        },
    )
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except Exception as exc:
            last_error = exc
            if attempt >= retries:
                break
            time.sleep(1 + attempt)
    raise RuntimeError(f"Failed to fetch {url}: {last_error}")


def fetch_text(url: str, timeout: int = 60) -> str:
    return fetch_bytes(url, timeout=timeout).decode("utf-8", "ignore")


def absolute_url(raw_url: str, base: str) -> str:
    value = html.unescape(str(raw_url or "").strip())
    if value.startswith("//"):
        return f"https:{value}"
    if value.startswith("/"):
        match = re.match(r"^https?://[^/]+", base)
        return f"{match.group(0)}{value}" if match else value
    return value


def read_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    try:
        raw = zf.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ET.fromstring(raw)
    strings: list[str] = []
    for item in root.findall("main:si", NS):
        parts = [node.text or "" for node in item.findall(".//main:t", NS)]
        strings.append("".join(parts))
    return strings


def sheet_paths(zf: zipfile.ZipFile) -> list[str]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_map = {
        rel.attrib.get("Id"): "xl/" + rel.attrib.get("Target", "").lstrip("/")
        for rel in rels.findall("pkg:Relationship", NS)
    }
    paths: list[str] = []
    for sheet in workbook.findall("main:sheets/main:sheet", NS):
        rel_id = sheet.attrib.get(f"{{{NS['rel']}}}id")
        if rel_id and rel_id in rel_map:
            paths.append(rel_map[rel_id])
    return paths


def cell_text(cell: ET.Element, shared_strings: list[str]) -> str:
    value = cell.find("main:v", NS)
    if value is None:
        inline = cell.find("main:is/main:t", NS)
        return (inline.text or "").strip() if inline is not None else ""
    text = value.text or ""
    if cell.attrib.get("t") == "s":
        try:
            return shared_strings[int(text)].strip()
        except (ValueError, IndexError):
            return ""
    return text.strip()


def iter_xlsx_rows(data: bytes, sheet_index: int = 0) -> list[list[str]]:
    with zipfile.ZipFile(BytesIO(data)) as zf:
        shared_strings = read_shared_strings(zf)
        paths = sheet_paths(zf)
        if not paths:
            raise RuntimeError("Workbook has no sheets")
        sheet = ET.fromstring(zf.read(paths[sheet_index]))
        rows: list[list[str]] = []
        for row in sheet.findall(".//main:sheetData/main:row", NS):
            cells: list[str] = []
            expected_col = 0
            for cell in row.findall("main:c", NS):
                ref = cell.attrib.get("r", "")
                col_name = re.sub(r"\d+", "", ref)
                if col_name:
                    col_idx = 0
                    for char in col_name:
                        col_idx = col_idx * 26 + (ord(char.upper()) - ord("A") + 1)
                    col_idx -= 1
                    while expected_col < col_idx:
                        cells.append("")
                        expected_col += 1
                cells.append(cell_text(cell, shared_strings))
                expected_col += 1
            rows.append(cells)
        return rows


def normalize_issn(raw: Any) -> str:
    text = str(raw or "").strip()
    if re.fullmatch(r"\d+(?:\.0+)?", text):
        text = text.split(".", 1)[0]
        if len(text) < 8:
            text = text.zfill(8)
    return re.sub(r"[^0-9Xx]", "", text).upper()


def is_valid_issn(raw: Any) -> bool:
    value = normalize_issn(raw)
    return len(value) == 8 and value not in INVALID_ISSN_PLACEHOLDERS


def display_issn(raw: Any) -> str:
    normalized = normalize_issn(raw)
    if len(normalized) == 8:
        return f"{normalized[:4]}-{normalized[4:]}"
    return str(raw or "").strip()


def title_key(raw: Any) -> str:
    text = str(raw or "").lower()
    text = html.unescape(text)
    text = re.sub(r"&", " and ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def numeric(value: Any) -> int | None:
    text = str(value or "")
    text = re.sub(r"(?i)\b(?:CHF|USD|EUR|GBP|JPY|CNY|RMB)\b", "", text)
    text = re.sub(r"[$£€¥]", "", text)
    text = text.replace(",", "").replace(" ", "").strip()
    if not re.fullmatch(r"\d+(?:\.\d+)?", text):
        return None
    return round(float(text))


def clean_title(raw: Any) -> str:
    text = html.unescape(str(raw or "")).strip()
    text = re.sub(r"\s+Article Publishing Charge\s*$", "", text, flags=re.I)
    return re.sub(r"\s+", " ", text)


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        text = re.sub(r"\s+", " ", html.unescape(data)).strip()
        if text:
            self.parts.append(text)


def html_text_lines(page_html: str) -> list[str]:
    parser = TextExtractor()
    parser.feed(page_html)
    return parser.parts


def price_rows(*pairs: tuple[str, Any]) -> list[dict[str, Any]]:
    prices: list[dict[str, Any]] = []
    for currency, raw in pairs:
        amount = numeric(raw)
        if amount and amount > 0:
            prices.append({"price": amount, "currency": currency})
    return prices


def new_catalog() -> dict[str, Any]:
    return {
        "meta": {
            "source": "Publisher official APC sources",
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "record_count": 0,
            "sources": [],
            "skipped_sources": [],
            "collisions": [],
        },
        "records": [],
        "by_issn": {},
        "by_title": {},
    }


def add_record(catalog: dict[str, Any], record: dict[str, Any]) -> bool:
    prices = record.get("prices") or []
    if not prices:
        return False
    record = dict(record)
    record["title_key"] = title_key(record.get("title", ""))
    record["issns"] = [normalize_issn(x) for x in (record.get("issns") or []) if is_valid_issn(x)]
    record["id"] = f"{record.get('source_id', 'source')}:{record.get('title_key') or len(catalog['records'])}"
    record_index = len(catalog["records"])
    catalog["records"].append(record)
    for issn in record["issns"]:
        existing = catalog["by_issn"].get(issn, [])
        existing_indexes = existing if isinstance(existing, list) else [existing]
        existing_indexes = [index for index in existing_indexes if isinstance(index, int)]
        if existing_indexes:
            kept_index = existing_indexes[0]
            kept = catalog["records"][kept_index] if kept_index < len(catalog["records"]) else {}
            catalog["meta"]["collisions"].append(
                {
                    "issn": issn,
                    "kept": kept.get("title"),
                    "skipped": record.get("title"),
                    "skipped_source": record.get("source"),
                }
            )
        catalog["by_issn"][issn] = [*existing_indexes, record_index]
    title_keys = [record.get("title_key")]
    title_keys.extend(title_key(alias) for alias in (record.get("title_aliases") or []))
    for key in dict.fromkeys(key for key in title_keys if key):
        existing = catalog["by_title"].get(key, [])
        existing_indexes = existing if isinstance(existing, list) else [existing]
        existing_indexes = [index for index in existing_indexes if isinstance(index, int)]
        catalog["by_title"][key] = [*existing_indexes, record_index]
    return True


def add_source_meta(catalog: dict[str, Any], **kwargs: Any) -> None:
    catalog["meta"]["sources"].append(kwargs)


def discover_elsevier_xlsx_url() -> str:
    page_html = fetch_text(ELSEVIER_PRICING_PAGE_URL)
    match = re.search(r'href=["\']([^"\']*article-publishing-charge\.xlsx)["\']', page_html, re.I)
    if not match:
        raise RuntimeError("Could not find Elsevier APC XLSX link")
    return absolute_url(match.group(1), ELSEVIER_PRICING_PAGE_URL)


def import_elsevier(catalog: dict[str, Any]) -> int:
    source_url = discover_elsevier_xlsx_url()
    rows = iter_xlsx_rows(fetch_bytes(source_url))
    price_date = ""
    for row in rows[:5]:
        joined = " ".join(row)
        match = re.search(r"Prices as of date:\s*([0-9]{2}-[A-Za-z]{3}-[0-9]{4})", joined)
        if match:
            price_date = match.group(1)
            break

    header_idx = next(
        (idx for idx, row in enumerate(rows) if [cell.upper() for cell in row[:4]] == ["ISSN", "TITLE", "BUSINESS MODEL", "USD"]),
        None,
    )
    if header_idx is None:
        raise RuntimeError("Could not locate Elsevier APC table header")

    count = 0
    for row in rows[header_idx + 1 :]:
        issn = normalize_issn(row[0] if len(row) > 0 else "")
        prices = price_rows(("USD", row[3] if len(row) > 3 else ""), ("EUR", row[4] if len(row) > 4 else ""), ("GBP", row[5] if len(row) > 5 else ""), ("JPY", row[6] if len(row) > 6 else ""))
        if not issn or not prices:
            continue
        if add_record(
            catalog,
            {
                "publisher": "Elsevier",
                "source": "Elsevier APC price list",
                "source_id": "elsevier",
                "source_url": source_url,
                "pricing_page_url": ELSEVIER_PRICING_PAGE_URL,
                "price_date": price_date,
                "title": clean_title(row[1] if len(row) > 1 else ""),
                "issns": [issn],
                "display_issn": display_issn(row[0]),
                "business_model": row[2] if len(row) > 2 else "",
                "prices": prices,
            },
        ):
            count += 1

    add_source_meta(
        catalog,
        id="elsevier",
        publisher="Elsevier",
        source="Elsevier APC price list",
        pricing_page_url=ELSEVIER_PRICING_PAGE_URL,
        source_url=source_url,
        price_date=price_date,
        record_count=count,
    )
    return count


def discover_wiley_urls() -> tuple[str, str]:
    try:
        page_html = fetch_text(WILEY_PRICING_PAGE_URL)
        urls = [absolute_url(match.group(1), WILEY_PRICING_PAGE_URL) for match in XLSX_LINK_RE.finditer(page_html)]
        oa = next((url for url in urls if "Open-Access" in url), WILEY_OA_FALLBACK_URL)
        hybrid = next((url for url in urls if "OnlineOpen" in url), WILEY_HYBRID_FALLBACK_URL)
        return oa, hybrid
    except Exception:
        return WILEY_OA_FALLBACK_URL, WILEY_HYBRID_FALLBACK_URL


def import_wiley_workbook(catalog: dict[str, Any], source_url: str, source_id: str, business_model: str) -> int:
    rows = iter_xlsx_rows(fetch_bytes(source_url))
    price_date = ""
    for row in rows[:8]:
        joined = " ".join(str(cell or "") for cell in row)
        match = re.search(r"Updated:\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})", joined)
        if match:
            price_date = match.group(1)
            break

    count = 0
    if source_id == "wiley-oa":
        start_idx = next((idx for idx, row in enumerate(rows) if len(row) > 4 and str(row[0]).strip() == "Journal Name"), None)
        if start_idx is None:
            raise RuntimeError("Could not locate Wiley OA APC table header")
        for row in rows[start_idx + 1 :]:
            title = clean_title(row[0] if len(row) > 0 else "")
            issn = normalize_issn(row[2] if len(row) > 2 else "")
            prices = price_rows(("USD", row[4] if len(row) > 4 else ""), ("GBP", row[5] if len(row) > 5 else ""), ("EUR", row[6] if len(row) > 6 else ""))
            if not title or not issn or not prices:
                continue
            if add_record(
                catalog,
                {
                    "publisher": "Wiley",
                    "source": "Wiley Open Access APC price list",
                    "source_id": source_id,
                    "source_url": source_url,
                    "pricing_page_url": WILEY_PRICING_PAGE_URL,
                    "price_date": price_date,
                    "title": title,
                    "issns": [issn],
                    "display_issn": display_issn(row[2]),
                    "business_model": business_model,
                    "license": row[3] if len(row) > 3 else "",
                    "prices": prices,
                },
            ):
                count += 1
    else:
        start_idx = next((idx for idx, row in enumerate(rows) if len(row) > 4 and str(row[0]).strip() == "Journal Title"), None)
        if start_idx is None:
            raise RuntimeError("Could not locate Wiley Hybrid APC table header")
        for row in rows[start_idx + 2 :]:
            title = clean_title(row[0] if len(row) > 0 else "")
            issn = normalize_issn(row[2] if len(row) > 2 else "")
            prices = price_rows(("USD", row[4] if len(row) > 4 else ""), ("GBP", row[5] if len(row) > 5 else ""), ("EUR", row[6] if len(row) > 6 else ""))
            if not title or not issn or not prices:
                continue
            if add_record(
                catalog,
                {
                    "publisher": "Wiley",
                    "source": "Wiley OnlineOpen APC price list",
                    "source_id": source_id,
                    "source_url": source_url,
                    "pricing_page_url": WILEY_PRICING_PAGE_URL,
                    "price_date": price_date,
                    "title": title,
                    "issns": [issn],
                    "display_issn": display_issn(row[2]),
                    "business_model": business_model,
                    "license": row[3] if len(row) > 3 else "",
                    "prices": prices,
                },
            ):
                count += 1
    add_source_meta(
        catalog,
        id=source_id,
        publisher="Wiley",
        source="Wiley APC price list",
        pricing_page_url=WILEY_PRICING_PAGE_URL,
        source_url=source_url,
        price_date=price_date,
        record_count=count,
    )
    return count


def import_wiley(catalog: dict[str, Any]) -> int:
    oa_url, hybrid_url = discover_wiley_urls()
    return import_wiley_workbook(catalog, oa_url, "wiley-oa", "Fully open access") + import_wiley_workbook(
        catalog, hybrid_url, "wiley-hybrid", "Hybrid"
    )


def discover_springer_nature_pdf_urls() -> tuple[str, str]:
    try:
        page_html = fetch_text(SPRINGER_NATURE_PRICING_PAGE_URL)
        fully = re.search(r'href=["\']([^"\']+)["\'][^>]+download=["\']2026 Springer Nature fully open access journals', page_html, re.I)
        hybrid = re.search(r'href=["\']([^"\']+)["\'][^>]+download=["\']2026 Springer Nature hybrid journals', page_html, re.I)
        return (
            absolute_url(fully.group(1), SPRINGER_NATURE_PRICING_PAGE_URL) if fully else SPRINGER_NATURE_FULLY_OA_FALLBACK_URL,
            absolute_url(hybrid.group(1), SPRINGER_NATURE_PRICING_PAGE_URL) if hybrid else SPRINGER_NATURE_HYBRID_FALLBACK_URL,
        )
    except Exception:
        return SPRINGER_NATURE_FULLY_OA_FALLBACK_URL, SPRINGER_NATURE_HYBRID_FALLBACK_URL


def import_springer_pdf(catalog: dict[str, Any], source_url: str, source_id: str, business_model: str) -> int:
    try:
        import fitz  # type: ignore
    except Exception as exc:  # pragma: no cover - depends on local maintenance environment
        catalog["meta"]["skipped_sources"].append({"id": source_id, "reason": f"PyMuPDF unavailable: {exc}"})
        return 0

    pdf_data = fetch_bytes(source_url)
    doc = fitz.open(stream=pdf_data, filetype="pdf")
    count = 0
    for page in doc:
        try:
            tables = page.find_tables().tables
        except Exception:
            continue
        for table in tables:
            rows = table.extract()
            if not rows:
                continue
            header = [str(cell or "").strip().lower() for cell in rows[0]]
            data_rows = rows[1:] if "eissn" in header else rows
            for row in data_rows:
                if len(row) < 6:
                    continue
                title = clean_title(row[0])
                issn = normalize_issn(row[2])
                prices = price_rows(("USD", row[4]), ("EUR", row[3]), ("GBP", row[5]))
                if not title or len(issn) != 8 or not prices:
                    continue
                if add_record(
                    catalog,
                    {
                        "publisher": "Springer Nature",
                        "source": "Springer Nature APC price list",
                        "source_id": source_id,
                        "source_url": source_url,
                        "pricing_page_url": SPRINGER_NATURE_PRICING_PAGE_URL,
                        "price_date": "April 2026",
                        "title": title,
                        "issns": [issn],
                        "display_issn": display_issn(row[2]),
                        "business_model": business_model,
                        "imprint": row[1] if len(row) > 1 else "",
                        "prices": prices,
                    },
                ):
                    count += 1
    add_source_meta(
        catalog,
        id=source_id,
        publisher="Springer Nature",
        source="Springer Nature APC price list",
        pricing_page_url=SPRINGER_NATURE_PRICING_PAGE_URL,
        source_url=source_url,
        price_date="April 2026",
        record_count=count,
    )
    return count


def import_springer_nature(catalog: dict[str, Any]) -> int:
    fully_url, hybrid_url = discover_springer_nature_pdf_urls()
    return import_springer_pdf(catalog, fully_url, "springer-nature-fully-oa", "Fully open access") + import_springer_pdf(
        catalog, hybrid_url, "springer-nature-hybrid", "Hybrid"
    )


def clean_markdown_link_text(raw: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)\s*", "", raw)
    text = re.sub(r"\[[^\]]*\]\([^)]+\)", "", text)
    return clean_title(text)


def import_mdpi(catalog: dict[str, Any]) -> int:
    markdown = fetch_text(MDPI_JINA_URL, timeout=90)
    start = markdown.find("| Journal Name | Basic APC")
    end = markdown.find("## Local Sales Taxes", start)
    if start < 0:
        raise RuntimeError("Could not locate MDPI APC table")
    section = markdown[start : end if end > start else len(markdown)]
    count = 0
    for line in section.splitlines():
        match = re.match(r"\|\s*\[(.*?)\]\((https://www\.mdpi\.com/journal/[^)]+)\)\s*\|\s*CHF\s*([0-9,]+)\s*\|", line)
        if not match:
            continue
        title = clean_markdown_link_text(match.group(1))
        price = numeric(match.group(3))
        if not title or not price:
            continue
        if add_record(
            catalog,
            {
                "publisher": "MDPI",
                "source": "MDPI APC page",
                "source_id": "mdpi",
                "source_url": MDPI_PRICING_PAGE_URL,
                "pricing_page_url": MDPI_PRICING_PAGE_URL,
                "price_date": "",
                "title": title,
                "issns": [],
                "business_model": "Fully open access",
                "prices": [{"price": price, "currency": "CHF"}],
                "journal_url": match.group(2),
            },
        ):
            count += 1
    add_source_meta(
        catalog,
        id="mdpi",
        publisher="MDPI",
        source="MDPI APC page",
        pricing_page_url=MDPI_PRICING_PAGE_URL,
        source_url=MDPI_PRICING_PAGE_URL,
        price_date="",
        record_count=count,
        note="Read through r.jina.ai due intermittent direct anti-bot response; source URL remains the MDPI official page.",
    )
    return count


def frontiers_journal_slugs(max_pages: int = 20) -> list[str]:
    slugs: list[str] = []
    for page in range(1, max_pages + 1):
        url = FRONTIERS_JOURNALS_URL if page == 1 else f"{FRONTIERS_JOURNALS_URL}?page={page}"
        text = fetch_text(url, timeout=90)
        hrefs = [html.unescape(href) for href in re.findall(r'href=["\']([^"\']+)["\']', text)]
        page_slugs = sorted(set(re.findall(r"^/journals/([a-z0-9-]+)$", "\n".join(hrefs), re.M)))
        slugs.extend(page_slugs)
        if f"/journals?page={page + 1}" not in text:
            break
    return sorted(set(slugs))


def extract_frontiers_issns(page_html: str) -> list[str]:
    issns: list[str] = []
    for match in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', page_html, re.S | re.I):
        raw = html.unescape(match.group(1))
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if data.get("@type") != "Periodical":
            continue
        value = data.get("issn")
        if isinstance(value, list):
            issns.extend(normalize_issn(item) for item in value)
        elif value:
            issns.append(normalize_issn(value))
    return [issn for issn in dict.fromkeys(issns) if issn]


def parse_frontiers_fee_page(slug: str) -> dict[str, Any] | None:
    url = f"https://www.frontiersin.org/journals/{slug}/for-authors/publishing-fees"
    page_html = fetch_text(url, timeout=90)
    flat = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", page_html)))
    match = re.search(
        r"Article processing charges\s+Journal\s+A Type Articles\s+B Type Articles\s+C Type Articles\s+(.+?)\s+CHF\s*([0-9,]+)\s+CHF\s*([0-9,]+)\s+(?:CHF\s*)?([0-9,]+|0)\b",
        flat,
        re.I,
    )
    if not match:
        return None
    title = clean_title(match.group(1))
    a_price = numeric(match.group(2))
    b_price = numeric(match.group(3))
    c_price = numeric(match.group(4))
    if not title or not a_price:
        return None
    prices = [{"price": a_price, "currency": "CHF", "label": "A Type"}]
    if b_price and b_price > 0:
        prices.append({"price": b_price, "currency": "CHF", "label": "B Type"})
    return {
        "publisher": "Frontiers",
        "source": "Frontiers publishing fees page",
        "source_id": "frontiers",
        "source_url": url,
        "pricing_page_url": FRONTIERS_FEE_POLICY_URL,
        "price_date": "",
        "title": title,
        "issns": extract_frontiers_issns(page_html),
        "business_model": "Fully open access",
        "prices": prices,
        "price_note": f"A Type CHF {a_price:,} / B Type CHF {b_price:,} / C Type {c_price or 0}",
        "journal_url": f"https://www.frontiersin.org/journals/{slug}",
    }


def import_frontiers(catalog: dict[str, Any]) -> int:
    slugs = frontiers_journal_slugs()
    count = 0
    failures: list[str] = []
    with ThreadPoolExecutor(max_workers=6) as executor:
        future_map = {executor.submit(parse_frontiers_fee_page, slug): slug for slug in slugs}
        for future in as_completed(future_map):
            slug = future_map[future]
            try:
                record = future.result()
            except Exception:
                failures.append(slug)
                continue
            if record and add_record(catalog, record):
                count += 1
    add_source_meta(
        catalog,
        id="frontiers",
        publisher="Frontiers",
        source="Frontiers journal publishing fees pages",
        pricing_page_url=FRONTIERS_FEE_POLICY_URL,
        source_url=FRONTIERS_JOURNALS_URL,
        price_date="",
        record_count=count,
        failed_count=len(failures),
    )
    if failures:
        catalog["meta"]["skipped_sources"].append({"id": "frontiers-partial", "failed_slugs": failures[:20], "failed_count": len(failures)})
    return count


def discover_sage_urls() -> tuple[str, str]:
    try:
        page_html = fetch_text(SAGE_PUBLISHING_OPTIONS_URL)
        links = [absolute_url(match.group(1), SAGE_PUBLISHING_OPTIONS_URL) for match in XLSX_LINK_RE.finditer(page_html)]
        gold = next((url for url in links if "sage-gold-oa-apcs" in url.lower()), SAGE_GOLD_FALLBACK_URL)
        hybrid = next((url for url in links if "sage-choice-price-list" in url.lower()), SAGE_HYBRID_FALLBACK_URL)
        return gold, hybrid
    except Exception:
        return SAGE_GOLD_FALLBACK_URL, SAGE_HYBRID_FALLBACK_URL


def import_sage_gold(catalog: dict[str, Any], source_url: str) -> int:
    rows = iter_xlsx_rows(fetch_bytes(source_url))
    header_idx = next((idx for idx, row in enumerate(rows) if row and str(row[0]).strip().startswith("Journal Title")), None)
    if header_idx is None:
        raise RuntimeError("Could not locate SAGE Gold OA APC table header")
    count = 0
    for row in rows[header_idx + 1 :]:
        title = clean_title(row[0] if len(row) > 0 else "")
        journal_url = row[1] if len(row) > 1 else ""
        prices = price_rows((row[7] if len(row) > 7 else "", row[6] if len(row) > 6 else ""))
        if not title or not prices:
            continue
        if add_record(
            catalog,
            {
                "publisher": "SAGE",
                "source": "SAGE Gold OA APC price list",
                "source_id": "sage-gold",
                "source_url": source_url,
                "pricing_page_url": SAGE_PUBLISHING_OPTIONS_URL,
                "price_date": "2026",
                "title": title,
                "issns": [],
                "business_model": "Fully open access",
                "journal_url": journal_url,
                "journal_code": row[2] if len(row) > 2 else "",
                "prices": prices,
            },
        ):
            count += 1
    add_source_meta(
        catalog,
        id="sage-gold",
        publisher="SAGE",
        source="SAGE Gold OA APC price list",
        pricing_page_url=SAGE_PUBLISHING_OPTIONS_URL,
        source_url=source_url,
        price_date="2026",
        record_count=count,
    )
    return count


def import_sage_hybrid(catalog: dict[str, Any], source_url: str) -> int:
    rows = iter_xlsx_rows(fetch_bytes(source_url))
    header_idx = next((idx for idx, row in enumerate(rows) if row and str(row[0]).strip() == "Journal Title"), None)
    if header_idx is None:
        raise RuntimeError("Could not locate SAGE Choice APC table header")
    count = 0
    for row in rows[header_idx + 1 :]:
        title = clean_title(row[0] if len(row) > 0 else "")
        issns = [row[2] if len(row) > 2 else "", row[3] if len(row) > 3 else ""]
        prices = price_rows(("USD", row[5] if len(row) > 5 else ""), ("GBP", row[6] if len(row) > 6 else ""))
        if not title or not prices:
            continue
        if add_record(
            catalog,
            {
                "publisher": "SAGE",
                "source": "SAGE Choice APC price list",
                "source_id": "sage-hybrid",
                "source_url": source_url,
                "pricing_page_url": SAGE_PUBLISHING_OPTIONS_URL,
                "price_date": "2026",
                "title": title,
                "issns": issns,
                "display_issn": display_issn(row[2] if len(row) > 2 else ""),
                "business_model": "Hybrid",
                "journal_url": row[7] if len(row) > 7 else "",
                "journal_code": row[1] if len(row) > 1 else "",
                "prices": prices,
            },
        ):
            count += 1
    add_source_meta(
        catalog,
        id="sage-hybrid",
        publisher="SAGE",
        source="SAGE Choice APC price list",
        pricing_page_url=SAGE_PUBLISHING_OPTIONS_URL,
        source_url=source_url,
        price_date="2026",
        record_count=count,
    )
    return count


def import_sage(catalog: dict[str, Any]) -> int:
    gold_url, hybrid_url = discover_sage_urls()
    return import_sage_gold(catalog, gold_url) + import_sage_hybrid(catalog, hybrid_url)


def discover_cambridge_url() -> str:
    try:
        page_html = fetch_text(CAMBRIDGE_PRICING_PAGE_URL)
        match = re.search(r'href=["\']([^"\']*APC_Pricelist_2026[^"\']*\.xlsx)["\']', page_html, re.I)
        if match:
            return absolute_url(match.group(1), CAMBRIDGE_PRICING_PAGE_URL)
    except Exception:
        pass
    return CAMBRIDGE_FALLBACK_URL


def import_cambridge(catalog: dict[str, Any]) -> int:
    source_url = discover_cambridge_url()
    rows = iter_xlsx_rows(fetch_bytes(source_url), sheet_index=0)
    header_idx = next((idx for idx, row in enumerate(rows) if row and str(row[0]).strip() == "Mnemonic"), None)
    if header_idx is None:
        raise RuntimeError("Could not locate Cambridge APC table header")
    count = 0
    for row in rows[header_idx + 3 :]:
        title = clean_title(row[1] if len(row) > 1 else "")
        issns = [row[2] if len(row) > 2 else "", row[3] if len(row) > 3 else ""]
        prices = price_rows(("GBP", row[8] if len(row) > 8 else ""), ("USD", row[10] if len(row) > 10 else ""), ("EUR", row[12] if len(row) > 12 else ""))
        if not title or not prices:
            continue
        if add_record(
            catalog,
            {
                "publisher": "Cambridge University Press",
                "source": "Cambridge University Press APC price list",
                "source_id": "cambridge",
                "source_url": source_url,
                "pricing_page_url": CAMBRIDGE_PRICING_PAGE_URL,
                "price_date": "June 2026",
                "title": title,
                "issns": issns,
                "display_issn": display_issn(row[2] if len(row) > 2 else row[3] if len(row) > 3 else ""),
                "business_model": row[7] if len(row) > 7 else "",
                "journal_code": row[0] if len(row) > 0 else "",
                "prices": prices,
            },
        ):
            count += 1
    add_source_meta(
        catalog,
        id="cambridge",
        publisher="Cambridge University Press",
        source="Cambridge University Press APC price list",
        pricing_page_url=CAMBRIDGE_PRICING_PAGE_URL,
        source_url=source_url,
        price_date="June 2026",
        record_count=count,
    )
    return count


def ieee_title_aliases(raw_title: str) -> list[str]:
    title = clean_title(raw_title)
    aliases = [title]
    match = re.match(r"(.+),\s*IEEE\s+Trans\.?$", title, re.I)
    if match:
        aliases.append(f"IEEE Transactions on {match.group(1).strip()}")
    match = re.match(r"(.+),\s*IEEE\s+J\.?$", title, re.I)
    if match:
        aliases.append(f"IEEE Journal of {match.group(1).strip()}")
    match = re.match(r"(.+),\s*IEEE\s+Open\s+J\.?$", title, re.I)
    if match:
        aliases.append(f"IEEE Open Journal of {match.group(1).strip()}")
    match = re.match(r"(.+)\s+Lett\.,\s*IEEE$", title, re.I)
    if match:
        aliases.append(f"IEEE {match.group(1).strip()} Letters")
    match = re.match(r"(.+)\s+Mag\.,\s*IEEE$", title, re.I)
    if match:
        aliases.append(f"IEEE {match.group(1).strip()} Magazine")
    match = re.match(r"(.+),\s*IEEE$", title, re.I)
    if match:
        aliases.append(f"IEEE {match.group(1).strip()}")
    return [alias for alias in dict.fromkeys(clean_title(alias) for alias in aliases) if alias]


def import_ieee(catalog: dict[str, Any]) -> int:
    try:
        import fitz  # type: ignore
    except Exception as exc:  # pragma: no cover - depends on local maintenance environment
        catalog["meta"]["skipped_sources"].append({"id": "ieee", "reason": f"PyMuPDF unavailable: {exc}"})
        return 0

    pdf_data = fetch_bytes(IEEE_APC_PDF_URL)
    doc = fitz.open(stream=pdf_data, filetype="pdf")
    count = 0
    for page in doc:
        try:
            tables = page.find_tables().tables
        except Exception:
            continue
        for table in tables:
            for row in table.extract():
                if len(row) < 4:
                    continue
                title = clean_title(row[0])
                oa_type = clean_title(row[2])
                prices = price_rows(("USD", row[3]))
                if not title or title.lower() == "title" or oa_type.lower() == "no oa" or not prices:
                    continue
                if add_record(
                    catalog,
                    {
                        "publisher": "IEEE",
                        "source": "IEEE APC list",
                        "source_id": "ieee",
                        "source_url": IEEE_APC_PDF_URL,
                        "pricing_page_url": IEEE_APC_PAGE_URL,
                        "price_date": "2026",
                        "title": ieee_title_aliases(title)[0],
                        "title_aliases": ieee_title_aliases(title)[1:],
                        "issns": [],
                        "business_model": "Fully open access" if oa_type.lower() == "full" else oa_type,
                        "journal_code": row[1] if len(row) > 1 else "",
                        "overlength_charge": row[4] if len(row) > 4 else "",
                        "repository_licensing_fee": row[5] if len(row) > 5 else "",
                        "prices": prices,
                    },
                ):
                    count += 1
    add_source_meta(
        catalog,
        id="ieee",
        publisher="IEEE",
        source="IEEE APC list",
        pricing_page_url=IEEE_APC_PAGE_URL,
        source_url=IEEE_APC_PDF_URL,
        price_date="2026",
        record_count=count,
        note="The official PDF does not include ISSNs; records are indexed by normalized IEEE title aliases only.",
    )
    return count


def money_to_price(raw: str) -> int | None:
    return numeric(raw)


def import_plos(catalog: dict[str, Any]) -> int:
    lines = html_text_lines(fetch_text(PLOS_FEES_URL, timeout=90))
    try:
        start = lines.index("Current fees")
    except ValueError as exc:
        raise RuntimeError("Could not locate PLOS Current fees section") from exc
    end = next((idx for idx in range(start + 1, len(lines)) if lines[idx].startswith("Open access funding support")), len(lines))
    fee_lines = lines[start:end]
    compact: list[str] = []
    idx = 0
    while idx < len(fee_lines):
        if fee_lines[idx] == "PLOS Sustainability" and idx + 1 < len(fee_lines) and fee_lines[idx + 1] == "and Transformation":
            compact.append("PLOS Sustainability and Transformation")
            idx += 2
            continue
        compact.append(fee_lines[idx])
        idx += 1

    journals: list[tuple[str, list[tuple[str, int]]]] = []
    current_title = ""
    current_prices: list[tuple[str, int]] = []
    idx = 0
    while idx < len(compact):
        line = compact[idx]
        if line.startswith("PLOS ") and not line.startswith("PLOS journals"):
            if current_title and current_prices:
                journals.append((current_title, current_prices))
            current_title = line
            current_prices = []
            idx += 1
            continue
        if line.startswith("Fees are subject"):
            break
        if idx + 1 < len(compact) and compact[idx + 1].startswith("$") and current_title:
            price = money_to_price(compact[idx + 1])
            if price:
                current_prices.append((line, price))
            idx += 2
            continue
        idx += 1
    if current_title and current_prices:
        journals.append((current_title, current_prices))

    count = 0
    for title, article_prices in journals:
        preferred = next((item for item in article_prices if item[0] in {"Research Article", "All other articles"}), article_prices[0])
        price_note = " / ".join(f"{label} USD {amount:,}" for label, amount in article_prices)
        if add_record(
            catalog,
            {
                "publisher": "PLOS",
                "source": "PLOS publication fees page",
                "source_id": "plos",
                "source_url": PLOS_FEES_URL,
                "pricing_page_url": PLOS_FEES_URL,
                "price_date": "",
                "title": title,
                "issns": [],
                "business_model": "Fully open access",
                "prices": [{"price": preferred[1], "currency": "USD"}],
                "price_note": price_note,
                "primary_article_type": preferred[0],
            },
        ):
            count += 1
    add_source_meta(
        catalog,
        id="plos",
        publisher="PLOS",
        source="PLOS publication fees page",
        pricing_page_url=PLOS_FEES_URL,
        source_url=PLOS_FEES_URL,
        price_date="",
        record_count=count,
        note="Primary display price uses Research Article or PLOS ONE All other articles; other article types are retained in price_note.",
    )
    return count


def parse_consecutive_price_table(lines: list[str], start: int, end: int, publisher: str, source_id: str, business_model: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    idx = start
    while idx + 3 < end:
        title = clean_title(lines[idx])
        prices = price_rows(("GBP", lines[idx + 1]), ("USD", lines[idx + 2]), ("EUR", lines[idx + 3]))
        if title and prices and lines[idx + 1].startswith("£") and lines[idx + 2].startswith("$") and lines[idx + 3].startswith("€"):
            records.append(
                {
                    "publisher": publisher,
                    "source": "Emerald APC page",
                    "source_id": source_id,
                    "source_url": EMERALD_APC_PAGE_URL,
                    "pricing_page_url": EMERALD_APC_PAGE_URL,
                    "price_date": "2026",
                    "title": title,
                    "issns": [],
                    "business_model": business_model,
                    "prices": prices,
                }
            )
            idx += 4
            continue
        idx += 1
    return records


def import_emerald(catalog: dict[str, Any]) -> int:
    lines = html_text_lines(fetch_text(EMERALD_APC_PAGE_URL, timeout=90))
    count = 0
    try:
        gold_heading = lines.index("Gold open access APCs 2026")
        ice_heading = lines.index("ICE Publishing APCs 2026")
    except ValueError as exc:
        raise RuntimeError("Could not locate Emerald APC headings") from exc

    gold_start = next(idx + 4 for idx in range(gold_heading, ice_heading) if lines[idx] == "Publication name")
    emerald_records = parse_consecutive_price_table(lines, gold_start, ice_heading, "Emerald Publishing", "emerald-gold", "Fully open access")

    ice_gold_start = next(idx + 4 for idx in range(ice_heading, len(lines)) if lines[idx] == "Publication name")
    ice_hybrid_heading = lines.index("ICE Publishing hybrid journals", ice_heading)
    ice_gold_records = parse_consecutive_price_table(lines, ice_gold_start, ice_hybrid_heading, "ICE Publishing", "ice-gold", "Fully open access")
    ice_hybrid_start = next(idx + 4 for idx in range(ice_hybrid_heading, len(lines)) if lines[idx] == "Publication name")
    ice_end = next((idx for idx in range(ice_hybrid_start, len(lines)) if lines[idx] == "Find a journal"), len(lines))
    ice_hybrid_records = parse_consecutive_price_table(lines, ice_hybrid_start, ice_end, "ICE Publishing", "ice-hybrid", "Hybrid")

    source_counts: dict[str, int] = {"emerald-gold": 0, "ice-gold": 0, "ice-hybrid": 0}
    for record in emerald_records + ice_gold_records + ice_hybrid_records:
        if add_record(catalog, record):
            count += 1
            source_counts[record["source_id"]] += 1

    for source_id, publisher, model in [
        ("emerald-gold", "Emerald Publishing", "Gold open access APCs 2026"),
        ("ice-gold", "ICE Publishing", "ICE gold open access journal APCs 2026"),
        ("ice-hybrid", "ICE Publishing", "ICE hybrid journal APCs 2026"),
    ]:
        add_source_meta(
            catalog,
            id=source_id,
            publisher=publisher,
            source=model,
            pricing_page_url=EMERALD_APC_PAGE_URL,
            source_url=EMERALD_APC_PAGE_URL,
            price_date="2026",
            record_count=source_counts[source_id],
        )
    return count


def build_source_summary(catalog: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "id": source.get("id"),
            "publisher": source.get("publisher"),
            "record_count": source.get("record_count"),
            "price_date": source.get("price_date"),
        }
        for source in catalog["meta"]["sources"]
    ]


def build_index(catalog: dict[str, Any]) -> dict[str, Any]:
    source_summary = build_source_summary(catalog)
    return {
        "meta": {
            "source": catalog["meta"]["source"],
            "generated_at": catalog["meta"]["generated_at"],
            "record_count": catalog["meta"]["record_count"],
            "sources": source_summary,
        },
        "issns": sorted(catalog["by_issn"].keys()),
    }


def runtime_record(record: dict[str, Any]) -> dict[str, Any]:
    output: dict[str, Any] = {
        "publisher": record.get("publisher", ""),
        "title": record.get("title", ""),
        "price_date": record.get("price_date", ""),
        "business_model": record.get("business_model", ""),
        "prices": record.get("prices") or record.get("apc_prices") or [],
    }
    if record.get("title_aliases"):
        output["title_aliases"] = record.get("title_aliases")
    if record.get("price_note"):
        output["price_note"] = record.get("price_note")
    return output


def build_lookup_index(catalog: dict[str, Any]) -> dict[str, Any]:
    return {
        "meta": {
            "source": catalog["meta"]["source"],
            "generated_at": catalog["meta"]["generated_at"],
            "record_count": catalog["meta"]["record_count"],
            "sources": build_source_summary(catalog),
        },
        "chunk_size": RECORD_CHUNK_SIZE,
        "chunk_count": (len(catalog["records"]) + RECORD_CHUNK_SIZE - 1) // RECORD_CHUNK_SIZE,
        "record_chunk_paths": [
            "./data/official_apc_records/chunk-{chunk}.json",
            "/data/official_apc_records/chunk-{chunk}.json",
            "./xuankan/demo_site/data/official_apc_records/chunk-{chunk}.json",
            "/xuankan/demo_site/data/official_apc_records/chunk-{chunk}.json",
        ],
        "by_issn": catalog["by_issn"],
        "by_title": catalog["by_title"],
    }


def write_runtime_lookup(catalog: dict[str, Any]) -> None:
    RECORD_CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    for old_chunk in RECORD_CHUNKS_DIR.glob("chunk-*.json"):
        old_chunk.unlink()

    records = [runtime_record(record) for record in catalog["records"]]
    for start in range(0, len(records), RECORD_CHUNK_SIZE):
        chunk_index = start // RECORD_CHUNK_SIZE
        payload = {
            "meta": {
                "generated_at": catalog["meta"]["generated_at"],
                "start": start,
                "count": len(records[start : start + RECORD_CHUNK_SIZE]),
            },
            "start": start,
            "records": records[start : start + RECORD_CHUNK_SIZE],
        }
        chunk_path = RECORD_CHUNKS_DIR / f"chunk-{chunk_index:03d}.json"
        chunk_path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    LOOKUP_INDEX_PATH.write_text(json.dumps(build_lookup_index(catalog), ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def finalize_catalog(catalog: dict[str, Any]) -> None:
    catalog["by_issn"] = dict(sorted(catalog["by_issn"].items()))
    catalog["by_title"] = dict(sorted(catalog["by_title"].items()))
    catalog["meta"]["record_count"] = len(catalog["records"])


def main() -> None:
    catalog = new_catalog()
    importers = [
        ("elsevier", import_elsevier),
        ("wiley", import_wiley),
        ("springer-nature", import_springer_nature),
        ("mdpi", import_mdpi),
        ("frontiers", import_frontiers),
        ("sage", import_sage),
        ("cambridge", import_cambridge),
        ("ieee", import_ieee),
        ("plos", import_plos),
        ("emerald", import_emerald),
    ]
    for source_id, importer in importers:
        try:
            count = importer(catalog)
            print(f"{source_id}: {count} records")
        except Exception as exc:
            catalog["meta"]["skipped_sources"].append({"id": source_id, "reason": str(exc)})
            print(f"{source_id}: skipped ({exc})")

    catalog["meta"]["skipped_sources"].append(
        {
            "id": "aaas-science",
            "reason": "No stable machine-readable official APC price list found; Science.org fee pages returned anti-bot verification in automated access.",
        }
    )
    catalog["meta"]["skipped_sources"].append(
        {
            "id": "taylor-francis",
            "pricing_page_url": TAYLOR_FRANCIS_COST_FINDER_URL,
            "reason": "Official cost finder uses a dynamic WordPress AJAX endpoint with nonce, pagination, and country/article-type state; left out until the interface is implemented and verified end to end.",
        }
    )
    catalog["meta"]["skipped_sources"].append(
        {
            "id": "oup",
            "pricing_page_url": OUP_CHARGES_URL,
            "reason": "Official Oxford Academic charges page returned Cloudflare/403 verification to automated access; no stable machine-readable APC table was verified.",
        }
    )
    finalize_catalog(catalog)
    OUT_PATH.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    INDEX_PATH.write_text(json.dumps(build_index(catalog), ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    write_runtime_lookup(catalog)
    print(f"wrote {catalog['meta']['record_count']} records to {OUT_PATH}")
    print(f"wrote {len(catalog['by_issn'])} ISSN keys to {INDEX_PATH}")
    print(f"wrote APC runtime lookup to {LOOKUP_INDEX_PATH} and {RECORD_CHUNKS_DIR}")


if __name__ == "__main__":
    main()
