# Red-Team Audit — 1.3 Long-Term Debt Cycle

**Date:** 2026-04-24  
**Auditor:** ChatGPT (GPT-5.5 Thinking) — fresh context, not the author  
**Target:** `research/03_long_term_debt_cycle.md`  
**Tools used:** Web Browsing — yes · Code Interpreter/Python — yes · PDF preview/screenshots — yes (`HCGB-1` PDF pages P9, P28, P32, P37) · Python outbound networking — attempted but timed out; live web/PDF viewer fallback used · Uploaded PDFs — none  
**References consulted:** uploaded `audit_prompt.md`; uploaded target file; every URL listed in the URL audit table below.

## Findings

| ID | Severity | § / line | Finding | Evidence | Proposed fix |
|----|----------|----------|---------|----------|--------------|
| F1 | CRITICAL | § 4 lines 33–34, 36, 38–43; § 8a lines 166–167; § 8b lines 206–208 | The FRED observation URLs are not valid pre-flight URLs as written: every cited `fred/series/observations?series_id=...` URL returns HTTP 400 because the required `api_key` / response-format parameters are absent. This violates R11 even though line 47 says an API key is needed. | Live fetches returned `400 Bad Request` for `GFDEGDQ188S`, `FYGFGDQ188S`, `FYOIGDA188S`, `GS10`, `GDP`, `GDPDEF`, `FYFSGDA188S`, and `FYFRGDA188S`. FRED’s documentation page lists `fred/series/observations` as the observations endpoint and separately lists API keys in general documentation. Official FRED series pages themselves resolved and verified the series IDs. | In § 4, distinguish executable endpoint templates from resolvable source URLs. Add official FRED series pages as the public source URLs, and show executable endpoint templates as code, e.g. `https://api.stlouisfed.org/fred/series/observations?series_id=GFDEGDQ188S&api_key={FRED_API_KEY}&file_type=json`. |
| F2 | CRITICAL | § 4 lines 35 and 37; § 10 line 282 | The BIS API endpoints are broken as cited. `WS_TC,1.0` for total credit returned HTTP 500, while the live BIS public data portal exposes the same `Q.US.C.A.M.770.A` series under `BIS,WS_TC,2.0`. The DSR API URL also returned HTTP 500. This is a direct R11/R13 failure for the public API rows. | Live fetch of `https://stats.bis.org/api/v2/data/BIS,WS_TC,1.0/Q.US.C.A.M.770.A` returned `500 Internal Server Error`. Live BIS search/open resolved the public data portal page as `BIS,WS_TC,2.0/Q.US.C.A.M.770.A`, titled for United States credit from all sectors to the non-financial sector. Live fetch of `https://stats.bis.org/api/v2/data/BIS,WS_DSR,1.0/Q.US.P` also returned `500 Internal Server Error`; the BIS DSR portal page resolves separately. | Replace the BIS rows with currently resolving BIS portal URLs plus a verified API syntax. Update total-credit version from `WS_TC,1.0` to the current `WS_TC,2.0` path or use the official data portal link if API syntax cannot be made stable. |
| F3 | CRITICAL | § 4 lines 39–40 | `g_nom` and `Pi_dfl` are mislabeled as growth-rate series in the input table. The cited FRED series IDs are raw level/index series, not 4-quarter trailing growth rates. This violates R13 unless the table explicitly separates raw inputs from derived variables. | Official FRED `GDP` page identifies the series as `Gross Domestic Product`, units `Billions of Dollars, Seasonally Adjusted Annual Rate`, quarterly. Official FRED `GDPDEF` page identifies the series as `Gross Domestic Product: Implicit Price Deflator`, not a trailing inflation/growth rate. The target table labels both rows as `% p.a.` growth-like variables. | Change § 4 rows to raw inputs: `GDP_level` and `GDPDEF_index`, with official units. Then define `g_nom = yoy(GDP_level, 4)` and `Pi_dfl = yoy(GDPDEF_index, 4)` in § 5 as derived transformations. |
| F4 | MAJOR | § 7 lines 146–150 | The worked-example table mis-transcribes the source table by assigning `Int/Inc = 21.8%` to Year 0. In the source table, interest and debt-service ratios are blank for Year 0; `21.8%` belongs to Year 1. This directly contradicts line 154’s self-check claim that all § 7 rows are transcribed correctly. | Live HCGB-1 PDF extraction shows the Example 3 table with Year `0 1 2 ... 10`, `Interest` row beginning with `-`, and the `Interest / Income` ratio sequence beginning after the blank Year 0 slot. Python recomputation output below also flags: `target has Int/Inc=21.8%, which belongs to Year 1.` | Set the Year 0 `Int/Inc` cell to `—`, or add a separate Year 1 row with `Int/Inc = 21.8%`. Update the R14 self-check. |
| F5 | MAJOR | § 8a lines 184–195 | The JS `project()` function is labeled as a “Dalio Ex 3 recurrence” but does not reproduce the § 7 / HCGB-1 Example 3 anchors. It omits the maturity-rollover/debt-service mechanics and gives a materially lower debt path. | Python reproduction of the exact target JS recurrence using the target inputs (`d0=580`, `pdRev=15`, `g=3.8`, `r0=3.4`, `rCreep=0.5`) gives Year 5 = `674.200%` and Year 10 = `865.874%`, versus § 7 / HCGB anchors Year 5 = `689%` and Year 10 = `898%`. | Either remove the claim that this is the Dalio Ex 3 recurrence, or implement the full table mechanics: income growth, spending excluding interest, interest costs, 35% principal rollover, borrowing, ending debt, and ratios. |
| F6 | MAJOR | § 6 lines 107–115; § 7 lines 140–144 and 156 | R7b point-of-use coverage is too loose. The stage-threshold table contains multiple numeric edges more than three lines away from the `DERIVED` marker. The Step 1/Step 3 worked-example inputs also contain numeric thresholds and assumptions without a formal marker within three lines. | The `DERIVED` marker is on line 107; rows on lines 112–115 are outside the three-line window. Step 1 on line 140 and Step 3 on line 144 contain 580%, 20%, 3.4%, 3.8%, 37x, 15%, 50 bps/year, and 35% with no formal marker within three lines. R7b in the audit prompt explicitly rejects § 10-only or distant coverage. | Add a compact `DERIVED`/`Dalio` marker immediately adjacent to the table rows and to each worked-example input block, or move the source marker into the table caption/footnote within three physical lines of every numeric row. |
| F7 | MAJOR | § 6 lines 129–132 | The action rules are investment prescriptions with no attribution marker and no source support at point of use. “Hold gold / ILB,” “hold equities + gold,” and “avoid long nominals” are not harmless labels; they are portfolio recommendations. | Lines 129–132 contain action rules, but the nearest formal marker is the reserve-currency `DERIVED` marker on line 125, which covers the COFER heuristic, not the asset-allocation prescriptions. No Dalio/NON-DALIO/DERIVED marker is attached to these portfolio actions. | Add a `DERIVED (operational)` marker specifically for these action rules, or convert them to downstream scope pointers only, e.g. “route to 1.7 / 2.2 for asset implications.” |
| F8 | MAJOR | § 10 line 284 | The § 10 World Bank API URL is a literal template with `{ISO}` and is not fetchable as a public URL. This fails the URL pre-flight expectation unless clearly marked as a template rather than a cited URL. | Live open of `https://api.worldbank.org/v2/country/{ISO}/indicator/FI.RES.TOTL.CD` failed. The concrete § 4 USA endpoint resolved successfully and returned JSON for `FI.RES.TOTL.CD`. | Replace the § 10 URL with a concrete example URL plus a separate code template, or mark the `{ISO}` version as non-fetchable pseudo-code. |
| F9 | MAJOR | § 10 line 283; § 4 line 45 | The COFER description is stale/incomplete for the current IMF page. The target says “USD share of global allocated FX reserves,” but the live IMF COFER page states that starting 2025Q3 the “unallocated” portion was eliminated and a complete currency composition with imputation is published. | Live IMF COFER page says the dataset covers world official FX reserves by currency and notes a 2025Q3 methodology change eliminating the unallocated portion. The target locks the variable to “allocated” reserves and says only CSV/XLSX, while the live page also links an API resource. | Update `FX_res_USD` to match current COFER methodology, or explicitly state that the model intentionally uses the legacy allocated-reserves definition through 2025Q2 and must branch after 2025Q3. |
| F10 | MINOR | Structural schema: § headers lines 3, 7, 25, 29, 49, 101, 136, 160, 254, 262; § 8b line 201 | The section titles are substantively correct but not exact against the schema: the schema uses two spaces after the section number, and § 8b schema is “Power Query M or URL,” while the target has “Power Query M.” | Audit prompt S4 requires exact titles. Target H2s use `## § 1 Executive Summary`, not `## § 1  Executive Summary`; line 201 omits “or URL.” | Normalize headers to the schema exactly if the repository checker treats whitespace/title strings literally. |

## URLs audited

| URL | HTTP status | Quote / content match? | Notes |
|-----|-------------|------------------------|-------|
| `https://economicprinciples.org/downloads/how-countries-go-broke-part-1.pdf` | 200 | YES | Live PDF opened; 46 pages; HCGB-1 quotes and Example 3 table verified via web PDF text plus screenshots. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=GFDEGDQ188S` | 400 | NO — endpoint incomplete | Missing API key/format in cited URL. Official series page separately verified as `Federal Debt: Total Public Debt as Percent of GDP`. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=FYGFGDQ188S` | 400 | NO — endpoint incomplete | Missing API key/format in cited URL. Official series page separately verified as `Federal Debt Held by the Public as Percent of GDP`. |
| `https://stats.bis.org/api/v2/data/BIS,WS_TC,1.0/Q.US.C.A.M.770.A` | 500 | NO | Broken live API URL. BIS public data portal resolves same key under `BIS,WS_TC,2.0`. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=FYOIGDA188S` | 400 | NO — endpoint incomplete | Missing API key/format. Official series page verified as `Federal Outlays: Interest as Percent of GDP`, annual. |
| `https://stats.bis.org/api/v2/data/BIS,WS_DSR,1.0/Q.US.P` | 500 | NO | Broken live API URL. BIS DSR overview and portal page resolve separately. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=GS10` | 400 | NO — endpoint incomplete | Missing API key/format. Official series page verified as 10-year Treasury constant maturity market yield. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=GDP` | 400 | NO — endpoint incomplete | Missing API key/format. Official series is raw nominal GDP level, not growth rate. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=GDPDEF` | 400 | NO — endpoint incomplete | Missing API key/format. Official series is implicit price deflator, not trailing inflation rate. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=FYFSGDA188S` | 400 | NO — endpoint incomplete | Missing API key/format. Official series page verified separately. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=FYFRGDA188S` | 400 | NO — endpoint incomplete | Missing API key/format. Official series page verified separately. |
| `https://api.worldbank.org/v2/country/USA/indicator/FI.RES.TOTL.CD?format=json` | 200 | YES | JSON returned; indicator ID and name match `Total reserves (includes gold, current US$)`. |
| `https://data.imf.org/en/datasets/IMF.STA:COFER` | 200 | PARTIAL | COFER page resolves and describes the dataset; live page shows updated 2025Q3 methodology and API link. |
| `https://api.stlouisfed.org/fred/series/observations` | 400 | NO — endpoint incomplete | The bare endpoint from the code block returns Bad Request without parameters. |
| `https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf` | 200 | YES | PDF opens; relevant long-term debt cycle text is present. |
| `https://www.linkedin.com/pulse/where-we-big-cycle-money-credit-debt-economic-activity-ray-dalio` | 200 | PARTIAL | Page resolves, but visible fetched content is limited by LinkedIn layout/login/comment rendering. No target quote depends on it. |
| `https://www.principles.com/big-debt-crises` | 200 | YES | Page resolves and identifies `Principles for Navigating Big Debt Crises`; PDF access requires email subscription. |
| `https://fred.stlouisfed.org/docs/api/fred/` | 200 | YES | FRED API documentation resolves and lists series/observations and API-key docs. |
| `https://data.bis.org/topics/TOTAL_CREDIT` | 200 | YES | BIS total-credit topic resolves and describes credit to the non-financial sector, frequency, and units. |
| `https://stats.bis.org/api-doc/v2/` | 200 | PARTIAL | Page resolves, but fetched content is mostly footer/navigation; still verifies public API documentation URL exists. |
| `https://stats.bis.org/api/v2/` | 501 | NO | Bare API base returns Not Implemented; should not be cited as a standalone fetchable source URL. |
| `https://api.worldbank.org/v2/country/{ISO}/indicator/FI.RES.TOTL.CD` | INVALID / failed | NO | Literal placeholder URL is not fetchable; concrete USA endpoint works. |
| `https://data.worldbank.org/indicator/FI.RES.TOTL.CD` | 200 | YES | World Bank indicator page resolves and matches the reserves indicator. |

## Arithmetic re-checks (§ 7)

```text
component check year 0: debt/income from rounded source components = 29.3/5.1*100 = 574.510% vs source table 580% (delta -5.490 pp)
component check year 0: debt service and interest components are blank in the source table; target has Int/Inc=21.8%, which belongs to Year 1.
component check year 5: debt/income from rounded source components = 41.9/6.1*100 = 686.885% vs source table 689% (delta -2.115 pp)
component check year 5: debt service/income = 15.8/6.1*100 = 259.016% vs source table 260% (delta -0.984 pp)
component check year 5: interest/income = 2.3/6.1*100 = 37.705% vs source table 37.5% (delta +0.205 pp)
component check year 10: debt/income from rounded source components = 65.8/7.3*100 = 901.370% vs source table 898% (delta +3.370 pp)
component check year 10: debt service/income = 25.9/7.3*100 = 354.795% vs source table 353% (delta +1.795 pp)
component check year 10: interest/income = 5.0/7.3*100 = 68.493% vs source table 68.4% (delta +0.093 pp)
rate path check:
year 0: 3.4 + 0.5*0 = 3.4%
year 5: 3.4 + 0.5*5 = 5.9%
year 10: 3.4 + 0.5*10 = 8.4%
target JS project recurrence with d0=580, pdRev=15, g=3.8, r0=3.4, rCreep=0.5:
year 0: debt/income=580.000%, r=3.4%
year 5: debt/income=674.200%, r=5.9%
year 10: debt/income=865.874%, r=8.4%
target §7 chart/source anchors: year 0=580%, year 5=689%, year 10=898%
```

## Quote fidelity table

| Quote # | Cited page | Actual printed page / live location | Word-for-word match? | Notes |
|---------|------------|--------------------------------------|----------------------|-------|
| Q1 — §2 line 11, cycle duration | HCGB-1 Introduction | HCGB-1 PDF viewer P1; live text lines around P1 L47–L49 | YES | Target cites by chapter, not printed page. |
| Q2 — §2 line 13, five stages | HCGB-1 Ch 1 | HCGB-1 PDF viewer P6–P9; live text shows stage headings beginning at P6 | YES with ellipses | Elisions are explicit. |
| Q3 — §2 line 15, 1944 ratios | HCGB-1 Ch 1 | HCGB-1 PDF viewer P6; live text lines around P6 L236–L238 | YES | Numeric ratios match. |
| Q4 — §2 line 17, deleveraging reduction | HCGB-1 Ch 1 | HCGB-1 PDF viewer P9; live text line around P9 L349 | SUBSTANTIVE MATCH; not literal due bracket correction | Source text contains OCR/typo wording. Target transparently inserts `[to]`. |
| Q5 — §2 line 19, r-g rule | HCGB-1 Ch 3 | HCGB-1 PDF viewer P32; live text around P32 L1192–L1196 | YES with ellipsis | Quote is supported. |
| Q6 — §2 line 21, 580% / 15% / 20% | HCGB-1 Ch 3, Ex 1 | HCGB-1 PDF viewer P33; live text around P33 L1216–L1219 | YES with ellipsis | Quote is supported. |
| Q7 — §2 line 23, 20% of 750 markets | HCGB-1 Introduction | HCGB-1 PDF viewer P0; live text around P0 L35–L38 | YES | Quote is supported. |
| Q8 — §5 line 53, four indicators | HCGB-1 Ch 3 | HCGB-1 PDF viewer P28; live text around P28 L1055–L1059 and following page | YES with ellipsis | Quote is supported, but line-level source spans page continuation. |
| Q9 — §5 line 59, 580% / interest burden | HCGB-1 Ch 3, Ex 1 | HCGB-1 PDF viewer P33 | YES | Short excerpt supported. |
| Q10 — §5 line 61, flat debt rule | HCGB-1 Ch 3 | HCGB-1 PDF viewer P31–P32 | YES with ellipsis | Quote is supported. |
| Q11 — §5 line 65, revenue table | HCGB-1 Ch 3 | HCGB-1 PDF viewer P34; live text around P34 L1260–L1267 | YES | Country figures match source extraction. |
| Q12 — §5 line 77, 580 to 730 | HCGB-1 Ch 3, Ex 1 | HCGB-1 PDF viewer P33; live text around P33 L1220–L1223 | YES | Quote is supported. |
| Q13 — §5 line 81, r-g 2% | HCGB-1 Ch 3, Ex 2 | HCGB-1 PDF viewer P32; live text around P32 L1192–L1197 | YES | Quote is supported. |
| Q14 — §5 line 97, MP phases | HCGB-1 Ch 1 | HCGB-1 PDF viewer P9–P11; live text around P9 L377–L393 and following lines | YES with ellipsis | Quote is supported. |
| Q15 — §6 line 119, currency/debt markets | HCGB-1 Introduction | HCGB-1 PDF viewer P0; live text around P0 L35–L38 | YES | Same source passage as Q7. |
| Q16 — §6 line 121, empires prominence | HCGB-1 Ch 1 | HCGB-1 PDF viewer P11; live text around P11 L449–L450 | YES | Quote is supported. |
| Q17 — §7 line 152, Example 3 table | HCGB-1 Ch 3, Ex 3 | HCGB-1 PDF viewer P37; live text around P37 L1360–L1373 | PARTIAL | Year 5 and Year 10 anchors match. Target’s Year 0 `Int/Inc=21.8%` does not match the source table alignment. |

## Verdict

**REJECT-re-spawn**

## Summary

The report is structurally close and most HCGB-1 prose quotations are supportable from the live PDF. However, it fails on blocking audit criteria: multiple cited API URLs do not pre-flight, the BIS total-credit endpoint is stale/wrong-versioned, the GDP/GDPDEF rows mislabel raw FRED series as growth-rate inputs, and the worked example contains a concrete table-transcription error. The implementation code also claims to reproduce Dalio’s Example 3 while materially missing the published anchor path.

Recommended next action: re-spawn the file rather than patching lightly. The correction list should prioritize public-data endpoint hygiene, raw-vs-derived input separation, exact §7 table transcription, and replacing the §8a projection function with mechanics that actually reproduce HCGB-1 Example 3 or explicitly labeling it as a simplified operational approximation.
