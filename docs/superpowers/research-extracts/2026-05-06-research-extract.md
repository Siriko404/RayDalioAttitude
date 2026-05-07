# Research Extract for Plan v2 — Dalio Dashboard Engine
# Generated: 2026-05-06 | Source: 12 verified research files (read-only)
# Purpose: Orchestrator (Opus) consumes this to write implementation plan tasks

---

## research/01_economic_machine.md → Step 1.1 · Economic Machine Template

**Inputs (§4 input table):**
- `GDP_nom` · source: `FRED (BEA NIPA)` · cadence: `Q` · url/api: `series_id=GDP`
- `GDP_real` · source: `FRED (BEA)` · cadence: `Q` · url/api: `series_id=GDPC1`
- `GDP_defl` · source: `FRED (BEA)` · cadence: `Q` · url/api: `series_id=GDPDEF`
- `RGDP_pc` · source: `FRED (BEA)` · cadence: `Q` · url/api: `series_id=A939RX0Q048SBEA`
- `POP` · source: `FRED (BLS)` · cadence: `M` · url/api: `series_id=CNP16OV`
- `M2` · source: `FRED (Fed H.6)` · cadence: `M` · url/api: `series_id=M2SL`
- `TCMDO` · source: `FRED (Fed Z.1)` · cadence: `Q` · url/api: `series_id=TCMDO` — unit: USD mn, divide by 1000 for USD bn
- `HPAY` · source: `FRED (BLS)` · cadence: `Q` · url/api: `series_id=HOANBS`
- `OPH` · source: `FRED (BLS)` · cadence: `Q` · url/api: `series_id=OPHNFB`

**Formulas / decision rules (§5 + §6):**
- Identity: `Total $ₜ = Mₜ + Cₜ`; `Pₜ = Total $ₜ / Qₜ`; `GDP_nom = GDP_real · GDP_defl / 100`
- Credit mix: `sᶜₜ = ΔCₜ / (ΔCₜ + ΔMₜ)` where `ΔC = TCMDO_t − TCMDO_{t-1}`, `ΔM = M2_t − M2_{t-1}`
- Productivity trend OLS: `ln(RGDP_pc_t) = α + β·t + ε`; `g_trend = exp(4β) − 1`
- Output gap: `gap_t = ln(RGDP_pc_t) − (α̂ + β̂·t)`; expressed as `gap% = 100·gap_t`
- Debt/money ratio: `R^{D/M}_t = (TCMDO_t / 1000) / M2_t` — TCMDO in mn, M2 in bn, divide by 1000
- `gap_regime`: `ABOVE_TREND` if gap% > +σ; `BELOW_TREND` if < −σ; else `ON_TREND` (σ = OLS residual stdev ≈ 3.2%)
- `credit_mix_regime`: `CREDIT_DRIVEN` if sᶜ > 0.66; `MONEY_DRIVEN` if < 0.33; else `MIXED`
- `debt_money_regime`: `LOW` if < 10; `ELEVATED` if 10–15; `HIGH` if > 15

**State / regime output:**
- States: `ABOVE_TREND` | `ON_TREND` | `BELOW_TREND` (gap_regime)
- States: `CREDIT_DRIVEN` | `MIXED` | `MONEY_DRIVEN` (credit_mix_regime)
- States: `LOW` | `ELEVATED` | `HIGH` (debt_money_regime)
- Classifier rule: OLS residual ±1σ band for gap; 0.33/0.66 tertile for credit mix; 10/15 edges for debt/money

**Byte-exact / canonical values (§7):**
- Toy example: `Total $ = 110`, `Q = 11`, `P = $10.00`; after credit expansion: `Total $ = 140`, `P = $12.73`
- `sᶜ = 30/(30+0) = 1.00` → `CREDIT_DRIVEN`
- OLS on `A939RX0Q048SBEA` 1947-Q1→2024-Q4 (n=312): `β̂ ≈ 0.00485/quarter`; `g_trend ≈ 1.96% p.a.`; residual σ ≈ 3.2%
- Latest TCMDO ≈ $97T; M2 ≈ $21T → `R^{D/M} ≈ 4.6` (M2-based); `≈ 17` (narrow-money, comparable to Dalio's "roughly 15" from 2012)
- Dalio 2012 snapshot: debt ~$50T, money (currency+reserves) ~$3T → `R^{D/M} ≈ 15`

**Integration emit → consumed by (§9):**
- emit `gap_regime` → consumed by Step `1.2`
- emit `credit_mix_regime` → consumed by Step `1.2`, Step `1.7`
- emit `trend_growth_pct` → consumed by Step `1.2`, Step `1.3`, Step `2.1`, Step `2.2`
- emit `debt_money_regime` → consumed by Step `1.3`, Step `1.4` (activates when = HIGH)
- emit `Total $ decomposition` → consumed by Step `1.7`

**Source line refs:**
- §4 L29–41, §5.1 L45–57, §5.2 L59–65, §5.3 L67–77, §5.4 L79–84, §5.5 L85–93, §6 L96–112, §7 L114–147, §9 L287–298

---

## research/02_short_term_debt_cycle.md → Step 1.2 · Short-Term Debt Cycle

**Inputs (§4 input table):**
- `RGDP_qoq_saar` · source: `FRED (BEA)` · cadence: `Q` · url/api: `series_id=A191RL1Q225SBEA`
- `GDP_gap` · source: `FRED (BEA, CBO)` · cadence: `Q` · url/api: `series_id=GDPC1` + `series_id=GDPPOT` (computed ratio)
- `UNRATE` · source: `FRED (BLS)` · cadence: `M` · url/api: `series_id=UNRATE`
- `CAPUTL` · source: `FRED (Fed G.17)` · cadence: `M` · url/api: `series_id=TCU`
- `CPI_yoy` · source: `FRED (BLS)` · cadence: `M` · url/api: `series_id=CPIAUCSL`
- `FEDFUNDS` · source: `FRED (Fed H.15)` · cadence: `M` · url/api: `series_id=FEDFUNDS`
- `T10Y2Y` · source: `FRED (Fed H.15)` · cadence: `D` · url/api: `series_id=T10Y2Y`
- `T10Y3M` · source: `FRED (Fed H.15)` · cadence: `D` · url/api: `series_id=T10Y3M`
- `C&I_loans` · source: `FRED (Fed H.8)` · cadence: `M` · url/api: `series_id=BUSLOANS`
- `SAHM` · source: `FRED` · cadence: `M` · url/api: `series_id=SAHMREALTIME`
- `NYFED_prob` · source: `NY Fed` · cadence: `M` · url/api: `https://www.newyorkfed.org/medialibrary/media/research/capital_markets/allmonth.xls`

**Formulas / decision rules (§5 + §6):**
- Early: `g > 4% AND Δg > 0 AND π < π_prev AND ΔFF ≤ 0`
- Mid: `1.5% ≤ g ≤ 2.5% AND Δg < 0 AND |ΔFF| < 0.5pp` (±0.5pp band is DERIVED)
- Late: `3.5% ≤ g ≤ 4.0% AND π > π_prev AND cu > 78% AND MST ≥ 30` (78% = 50-yr TCU median; 30mo from Dalio "about 2½ years")
- Tightening: `ΔFF > 0 AND spread < 1% AND π > 2.5%`
- `policy_stance`: `EASING` if `ΔFF_12m < −0.5pp`; `TIGHTENING` if `> +0.5pp`; else `NEUTRAL`
- `yc_signal`: `INVERTED` if T10Y3M < 0; `FLAT` if [0, 100bp); `STEEP` if ≥ 100bp
- `recession_prob_12m`: NY Fed probit `P(rec) = Φ(α + β·spread)`; `ELEVATED` if > 30%
- Sahm rule: `Sahm_t = MA₃(u_t) − min_{s∈[t-12,t]} u_s`; `TRIGGERED` if ≥ 0.5pp
- `RECESSION_EARLY`: `sahm_signal=TRIGGERED AND policy_stance ∈ {NEUTRAL, TIGHTENING}`
- `RECESSION_LATE`: `sahm_signal=TRIGGERED AND policy_stance=EASING`

**State / regime output:**
- States: `EARLY` | `MID` | `LATE` | `TIGHTENING` | `RECESSION_EARLY` | `RECESSION_LATE` | `TRANSITIONAL`
- Classifier rule: phase Boolean flags from §5.1 evaluated in order; first match wins; fallthrough = `TRANSITIONAL`

**Byte-exact / canonical values (§7):**
- Illustrative inputs: `RGDP_qoq_saar=2.1%`, `CAPUTL=77.9%`, `CPI_yoy=3.1%`, `FEDFUNDS=4.33%`, `T10Y3M=0.45pp`, `ΔFF_12m=−1.00pp`, `SAHM=0.4pp`
- No flags fire → `TRANSITIONAL`; `policy_stance=EASING`; `yc_signal=FLAT`; `recession_prob≈18%`; `sahm=NOT_TRIGGERED`
- NY Fed probit at `spread=0.45pp` → ≈18% probability

**Integration emit → consumed by (§9):**
- emit `cycle_phase` → consumed by Step `2.2`, Step `2.5`, Step `1.3`, Step `1.5`
- emit `recession_prob_12m` → consumed by Step `2.5`
- emit `sahm_signal` → consumed by Step `2.5`
- emit `policy_stance` → consumed by Step `1.3`
- emit `yc_signal` → consumed by Step `2.2`

**Source line refs:**
- §4 L28–43, §5.1 L47–68, §5.2 L69–77, §5.3 L79–86, §5.4 L87–91, §6 L93–119, §7 L121–155, §9 L261–271

---

## research/03_long_term_debt_cycle.md → Step 1.3 · Long-Term Debt Cycle

**Inputs (§4 input table):**
- `D_tot_GDP` · source: `FRED` · cadence: `Q` · url/api: `series_id=GFDEGDQ188S`
- `D_pub_GDP` · source: `FRED` · cadence: `Q` · url/api: `series_id=FYGFGDQ188S`
- `D_priv_GDP` · source: `BIS (SDMX v2)` · cadence: `Q` · url/api: `https://stats.bis.org/api/v2/data/BIS,WS_TC,2.0/Q.US.C.A.M.770.A`
- `DS_int_GDP` · source: `FRED` · cadence: `A` · url/api: `series_id=FYOIGDA188S`
- `DSR_priv` · source: `BIS portal` · cadence: `Q` · url/api: `https://data.bis.org/topics/DSR/data` (CSV/XLSX; SDMX WS_DSR API unstable 2026-04)
- `r_nom` · source: `FRED (H.15)` · cadence: `M` · url/api: `series_id=GS10`
- `GDP_level` · source: `FRED` · cadence: `Q` · url/api: `series_id=GDP`
- `GDPDEF_index` · source: `FRED` · cadence: `Q` · url/api: `series_id=GDPDEF`
- `HdlDef_GDP` · source: `FRED` · cadence: `A` · url/api: `series_id=FYFSGDA188S`
- `PrimDef_GDP` · source: `FRED (derived)` · cadence: `A` · url/api: `FYFSGDA188S + FYOIGDA188S`
- `Rev_GDP` · source: `FRED` · cadence: `A` · url/api: `series_id=FYFRGDA188S`
- `Res_GDP` · source: `WB WDI` · cadence: `A` · url/api: `https://api.worldbank.org/v2/country/USA/indicator/FI.RES.TOTL.CD?format=json`
- `FX_res_USD` · source: `IMF COFER` · cadence: `Q` · url/api: `https://data.imf.org/en/datasets/IMF.STA:COFER` (CSV/XLSX)

**Formulas / decision rules (§5 + §6):**
- `I1 = Debt_t / Revenue_t`; `I2 = (Interest_t + Principal_due_t) / Revenue_t`; `I3 = r_nom_t − g_nom_t`; `I4 = Debt_t / (Reserves + Savings_t)`
- GDP-to-revenue: `I1_rev = I1_GDP / Rev_GDP` where Dalio anchors `Rev_GDP ≈ 0.17` for US today
- `g_nom = yoy(GDP_level, 4)`; `PrimDef_GDP = |HdlDef_GDP| − DS_int_GDP`
- Forward projection: `D_{t+N}/Y_{t+N} = [D_t·∏(1+r) + ∑PD·∏(1+r)] / [Y_t·∏(1+g)]`
- Rate rule of thumb: `r − g = 2%` → debt/income rises ~50% over 20 years at zero primary deficit
- COFER trigger (DERIVED): "falling > 10 pp over 10 years" → devaluation-risk elevated
- MP phases: MP1 (Linked/Hard, 1944-1971) → MP2 (Fiat Interest-Rate) → MP3 (Debt Monetization, 2008-2020) → MP4 (Coordinated Fiscal+Monetary) → MP5 (Big Deleveraging) → MP6 (Return to Hard Money)

**State / regime output:**
- States: `SOUND` | `BUBBLE` | `TOP` | `DELEVERAGING` | `RECEDES`
- Classifier rule (by % of Revenue): SOUND < 200% D/Rev, < 5% Int/Rev; BUBBLE 200-400%, 5-10%; TOP 400-550%, 10-15%; DELEVER 550-900%, 15-40%; RECEDES falling through 400%/10%

**Byte-exact / canonical values (§7):**
- US Ex.1 anchors: `I1_rev = 580%`; `I2_rev ≈ 20%` (interest/revenue); `I3 = 3.4% − 3.8% = −0.4%`
- Dalio 1944 gold ratios: debt/gold = 7x; money/gold = 1.3x → now 37x and 6x
- Dalio Ex.3 toy model (HCGB-1 Ch.3): start 580%, g=3.8%, prim deficit=15% rev, r starts 3.4% rising 50bps/yr, 35% rolls/yr
- Year 0: r=3.4%, D/Inc=580%; Year 5: r=5.9%, D/Inc=689%, DS/Inc=260%, Int/Inc=37.5%; Year 10: r=8.4%, D/Inc=898%, DS/Inc=353%, Int/Inc=68.4%
- US revenue ≈ 17% of GDP (Dalio cross-country table: JPN 16%, CHN 28%, FRA 18%, DEU 13%, GBR 36%)
- COFER anchor: 2012=61.50%, 2022=58.52% → `resDelta10 = −2.98 pp`

**Integration emit → consumed by (§9):**
- emit `stage` → consumed by Step `1.4` (activates on TOP or DELEVER), Step `1.6`, Step `2.2`
- emit `mp_phase` → consumed by Step `1.4`, Step `1.7`
- emit `I3` sign → consumed by Step `1.7`, Step `2.2`
- emit `10yr_projection` → consumed by Step `2.5`
- emit `policy_stance` (decade-scale) → consumed by Step `1.4`

**Source line refs:**
- §4 L30–47, §5.1 L51–63, §5.2 L65–71, §5.3 L73–79, §5.4 L81–87, §5.5 L89–95, §5.6 L97–101, §6 L103–140, §7 L142–168, §9 L264–270

---

## research/04_deleveragings.md → Step 1.4 · Deleveragings

**Inputs (§4 input table):**
- `GDP_level` · source: `FRED (BEA)` · cadence: `Q` · url/api: `series_id=GDP`
- `DebtGDP` · source: `FRED (BIS)` · cadence: `Q` · url/api: `series_id=QUSCAM770A`
- `LT_Rate` · source: `FRED` · cadence: `D` · url/api: `series_id=DGS10`
- `M0_GDP` · source: `FRED` · cadence: `M` · url/api: `series_id=BOGMBASE` ÷ `GDP`
- `CB_Assets` · source: `FRED (Fed)` · cadence: `W` · url/api: `series_id=WALCL`
- `CPI_yoy` · source: `FRED (BLS)` · cadence: `M` · url/api: `series_id=CPIAUCSL`
- `FX_Gold` · source: `Stooq / LBMA` · cadence: `D` · url/api: `https://stooq.com/q/?s=xauusd&i=d` + DXY
- `FiscalBal` · source: `FRED (OMB)` · cadence: `A` · url/api: `series_id=FYFSGDA188S`
- `LoanWriteoff` · source: `FRED (FDIC QBP)` · cadence: `Q` · url/api: `series_id=QBPLNTLNNTCGOFFR`
- `Gini_net` · source: `World Inequality Database` · cadence: `A` · url/api: `https://wid.world/data/` (variable `gdiinc992j`)

**Formulas / decision rules (§5 + §6):**
- `G_t = NGDP_yoy_t − LT_Rate_t` (beautiful-condition core; NGDP_yoy = yoy(GDP_level, 4))
- `ΔD_t = DebtGDP_t − DebtGDP_{t-4}` (4Q debt trajectory)
- `π_t = (M0_GDP_t − M0_GDP_{t-4}) + (CB_Assets_t − CB_Assets_{t-4})` (4Q print deltas)
- Lever decomposition (pp of GDP): `L_aust = −ΔFiscalBal`; `L_def = Writeoff · DebtGDP`; `L_print = π_t`; `L_redist = −0.1 · ΔGini · DebtGDP`
- Lever shares: `sⁱₜ = Lⁱ / ∑Lʲ`
- `UGLY_DEFLATIONARY`: `G < 0 AND ΔD > 0`
- `BEAUTIFUL`: `G > 0 AND ΔD < 0 AND π moderate` (π moderate = 0.5%–4% DERIVED)
- `UGLY_INFLATIONARY`: `G > 0 AND CPI_yoy > LT_Rate AND FX_Gold < −20% p.a.`
- `beautiful_score` = 1 if `G ∈ [0, +3pp] AND ΔD < 0 AND π ∈ [0.5%, 4%]`
- `fisher_spiral` = 1 if `Δ(DSR) > 0 AND CPI_yoy < 0`

**State / regime output:**
- States: `UGLY_DEFLATIONARY` | `BEAUTIFUL` | `UGLY_INFLATIONARY` | `NOT_DELEVERAGING` | `TRANSITIONAL`
- Classifier rule: joint sign of G and π; activates only when `debt_money_regime=HIGH AND gap_regime=BELOW_TREND`

**Byte-exact / canonical values (§7):**
- US Depression 1930-32: `NGDP_yoy=−17.0%`, `Bond yield=3.4%`, `G=−20.4pp`, `ΔD=+32pp/yr (total+97pp)`, `π=0.8%` → `UGLY_DEFLATIONARY`; `s_print≈0.10 < 0.25` → under-printing flag
- US Reflation 1933-37: `NGDP_yoy=+9.2%`, `Bond yield=2.9%`, `G=+6.3pp`, `π=2.0%`, `ΔD<0 (−17%/yr)` → `BEAUTIFUL` categorical; `beautiful_score=0` (G > +3pp ceiling)
- Japan 1990-present: `NGDP_yoy=0.6%`, `Bond yield=2.6%`, `G=−2.0pp`, `π=0.8%`, `DebtGDP 403%→498%` → `UGLY_DEFLATIONARY`
- π bucket edges: "small" ≤ 0.5%, "moderate" 0.5%-4%, "large" > 4% (calibrated to Japan ≈0.8%, US 1933 ≈2.0%, US 2009+ ≈3.3%)

**Integration emit → consumed by (§9):**
- emit `regime` → consumed by Step `1.5`, Step `1.7`, Step `2.2`, Step `2.5`
- emit `lever_mix` → consumed by Step `1.5`
- emit `beautiful_score` → consumed by Step `2.2`
- emit `fisher_spiral` → consumed by Step `2.5`

**Source line refs:**
- §4 L26–40, §5.1 L44–55, §5.2 L56–66, §5.3 L67–83, §5.4 L85–89, §5.5 L91–97, §6 L99–116, §7 L118–143, §9 L284–291

---

## research/05_paradigm_shifts.md → Step 1.5 · Paradigm Shifts

**Inputs (§4 input table):**
- `ret_SPX` · source: `Damodaran NYU histretSP` · cadence: `A` · url/api: `https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls`
- `ret_UST10` · source: `Damodaran NYU histretSP` · cadence: `A` · url/api: same xls
- `ret_Tbill` · source: `FRED (Fed H.15)` · cadence: `M` · url/api: `FRED TB3MS`
- `ret_gold` · source: `Damodaran xls + LBMA` · cadence: `A/D` · url/api: `https://prices.lbma.org.uk/json/gold_pm.json`
- `ret_cmdty` · source: `FRED (BLS) / S&P DJI GSCI` · cadence: `M/D` · url/api: `FRED PPIACO` (PPI proxy; GSCI cross-check)
- `CPI_headline` · source: `FRED (BLS)` · cadence: `M` · url/api: `FRED CPIAUCSL`
- `RGDP` · source: `FRED (BEA)` · cadence: `Q` · url/api: `FRED GDPC1`
- `FedFunds` · source: `FRED` · cadence: `M` · url/api: `FRED FEDFUNDS`
- `BuybackYield` · source: `S&P DJI` · cadence: `Q` · url/api: `https://www.spglobal.com/spdji/en/documents/additional-material/sp-500-buyback.xlsx`
- `ProfitShare` · source: `FRED (BEA NIPA)` · cadence: `Q` · url/api: `FRED A463RC1Q027SBEA ÷ GDP`
- `StatTaxRate` · source: `OECD Tax Database` · cadence: `A` · url/api: `https://stats.oecd.org/Index.aspx?DataSetCode=TABLE_II1`
- `ConsForecast` · source: `IBES via Yardeni` · cadence: `W` · url/api: `https://archive.yardeni.com/pub/sp500analycons.pdf`
- `RealRate10y` · source: `FRED` · cadence: `D` · url/api: `FRED DFII10`

**Formulas / decision rules (§5 + §6):**
- Decade geometric return: `r_{a,d} = (∏(1+r_{a,t}))^{1/|d|} − 1`; real = `(1+r_a)/(1+π_d) − 1`
- Spearman ρ: `ρ_d = 1 − 6Σd²/(n(n²−1))`, n=5 assets; ρ≈+1 persists, ≈−1 inverts
- Tailwinds (all binary AND-logic): T1=`RealRate10y < 0.50% AND FedFunds < 1.00%`; T2=`BuybackYield > 2.5%`; T3=`ProfitShare > μ+σ (1948+)`; T4=`StatTaxRate at post-1986 low AND stable ≥ 2yr`; `S_tail = ΣT_i ∈ {0,…,4}`
- Recency divergence: `Δ_recency = r_cons_12m − 6.4%` where 6.4% = long-run nominal EPS CAGR anchor; `σ_Δ = 3.5 pts`
- Paradigm Age: `PA = (1/3)·[(1−ρ_d)/2 + S_tail/4 + sigmoid(Δ_recency/σ_Δ)]`; PA ∈ [0,1]
- `paradigm_stage`: `EARLY` if PA < 0.33; `MID` if [0.33, 0.67); `LATE` if ≥ 0.67
- `tilt_trigger`: fires if `S_tail ≥ 3 AND ρ_d < 0` (retrospective last decade boundary)
- `gold_overlay`: ON if `PA ≥ 0.67 AND RealRate10y < 0.50%`

**State / regime output:**
- States: `EARLY` | `MID` | `LATE` (paradigm_stage)
- Classifier rule: PA equal-weight composite of rank-inversion, tailwind count, consensus-recency

**Byte-exact / canonical values (§7):**
- 2019-Q4 decade returns (%p.a.): SPX 2000s=−0.9/2010s=13.4; UST10=6.6/4.0; Tbill=2.5/0.6; Gold=14.3/3.3; Cmdty(PPIACO)=2.9/0.9
- Spearman: d_i = {SPX −4, UST10 0, Gold +2, Cmdty +1, Tbill +1}; Σd²=22; ρ = 1−132/120 = **−0.10**
- 2019-Q4 tailwinds: T1=FALSE (FedFunds=1.55%>1.00%); T2=TRUE (buyback≈3.1%); T3=TRUE (profit share≈11.2% > μ+σ≈10.6%); T4=TRUE (21% post-1986 low since 2018); `S_tail=3`
- Recency: IBES≈10.5%, anchor 6.4%, Δ=+4.1; sigmoid(1.17)≈**0.76**
- PA = (0.55+0.75+0.76)/3 = **0.687** → `LATE`; `tilt_trigger` fires; `next_leaders` = {Tbill, Cmdty}; `gold_overlay` ON (0.15% < 0.50%)

**Integration emit → consumed by (§9):**
- emit `paradigm_stage` → consumed by Step `1.6`
- emit `tilt_trigger` → consumed by Step `1.7`
- emit `gold_overlay` → consumed by Step `2.2`
- emit `next_leader_set` → consumed by Step `2.1`

**Source line refs:**
- §4 L29–46, §5.1 L51–64, §5.2 L69–79, §5.3 L81–96, §5.4 L99–106, §5.5 L109–114, §6 L117–131, §7 L133–166, §9 L260–268

---

## research/06_changing_world_order.md → Step 1.6 · Changing World Order / Big Cycle

**Inputs (§4 input table):**
- `Edu_tert` · source: `WB WDI` · cadence: `A` · url/api: `WB SE.TER.ENRR`
- `Pat_res` · source: `WB WDI (WIPO)` · cadence: `A` · url/api: `WB IP.PAT.RESD`
- `Cost_comp` · source: `BIS EER bulk CSV` · cadence: `M` · url/api: `https://data.bis.org/bulkdownload` (API 500, use bulk)
- `Mil_xpnd` · source: `WB WDI (SIPRI)` · cadence: `A` · url/api: `WB MS.MIL.XPND.CD`
- `Exp_gnfs` · source: `WB WDI` · cadence: `A` · url/api: `WB NE.EXP.GNFS.CD`
- `GDP_cur` · source: `WB WDI` · cadence: `A` · url/api: `WB NY.GDP.MKTP.CD`
- `Fin_ctr` · source: `BIS LBS bulk` · cadence: `Q` · url/api: `https://data.bis.org/bulkdownload WS_LBS_D_PUB`
- `Res_shr` · source: `IMF COFER via DBnomics` · cadence: `A` · url/api: `IMF/COFER/A.W00.RAXGFXARUSDRT_PT` (corrected; old Q.W00... was 404)
- GII_rank and GCI_score: cross-validation only, NOT in CPI formula

**Formulas / decision rules (§5 + §6):**
- z-score per measure, 11-country panel: `z_{c,m} = (x_{c,m} − μ_{E,m}) / σ_{E,m}`; panel = {USA, CHN, DEU, FRA, GBR, JPN, IND, RUS, KOR, SGP, CAN}
- CPI aggregate: `z̄_c = (1/8)·Σz_{c,m}`; `CPI_c = (z̄_c − min_E) / (max_E − min_E)` with anchors max≈+1.9, min≈−1.5
- 20-yr trajectory: `s20_c = (CPI_{c,t} − CPI_{c,t-20y}) / 20` (CPI units/yr)
- Stage by (CPI_level, s20, res_currency_z_slope): RISE = CPI 0.25-0.80 + s20 > +0.05/yr + flat/rising reserve; TOP = CPI > 0.80 + |s20| ≤ 0.05; DECLINE = CPI > 0.60 + s20 < −0.05; NEW_ORDER = CPI < 0.30 after prior > 0.80
- HegemonyRisk: `cntNeg` = count measures where `z_USA_m − z_CHN_m ≤ 0`; `resDelta10` = COFER 10yr Δ pp; LOW = cntNeg ≤ 1 + resDelta ≥ 0; ELEVATED = 2-3 + −1 to −10pp; HIGH = ≥ 4 + < −10pp

**State / regime output:**
- States: `RISE` | `TOP` | `DECLINE` | `NEW_ORDER` (StageTag)
- States: `LOW` | `ELEVATED` | `HIGH` (HegemonyRisk)
- Classifier rule: CPI level + s20 slope + reserve-currency z-slope

**Byte-exact / canonical values (§7):**
- USA z-scores (Apr-2022): Edu=2.0, Innov=2.1, Cost=−0.4, Mil=2.0, Trade=1.1, Output=1.7, Fin=2.7, Reserve=1.9 → sum=13.1 → z̄=1.6375
- CHN z-scores: Edu=1.7, Innov=1.6, Cost=1.1, Mil=0.9, Trade=1.9, Output=1.5, Fin=0.2, Reserve=−0.6 → sum=8.3 → z̄=1.0375
- CPI_USA = (1.6375 − (−1.5)) / (1.9 − (−1.5)) = 3.1375/3.4 = **0.923** (Dalio published: 0.89; error=0.033)
- CPI_CHN = 2.5375/3.4 = **0.746** (Dalio published: 0.76; error=0.014)
- Published CPI scores Apr-2022: USA=0.89, CHN=0.76, DEU=0.38, JPN=0.33, KOR=0.31, GBR=0.27, IND=0.28, RUS=0.26, FRA=0.26
- HegemonyRisk: cntNeg=2 (Cost −1.5, Trade −0.8); resDelta10=−2.98pp (2012 61.50%→2022 58.52%) → **ELEVATED**
- USA=DECLINE (CPI 0.89>0.80, s20<−0.05); CHN=RISE (CPI 0.76∈[0.25,0.80], s20>+0.05)

**Integration emit → consumed by (§9):**
- emit `CountryPowerIndex` → consumed by Step `1.3` (reserve-currency overlay), Step `1.7`, Step `2.2`, Step `2.5`
- emit `StageTag` → consumed by Step `1.4` (NEW_ORDER → crisis path), Step `1.7`
- emit `HegemonyRisk` → consumed by Step `1.3`, Step `2.2`, Step `2.5`

**Source line refs:**
- §4 L28–44, §5.1 L48–58, §5.2 L60–66, §5.3 L68–73, §5.4 L74–87, §5.5 L89–103, §6 L105–131, §7 L133–168, §9 L275–281

---

## research/07_inflation_currency.md → Step 1.7 · Inflation & Currency Debasement

**Inputs (§4 input table):**
- `cpi_hdln` · source: `FRED (BLS)` · cadence: `M` · url/api: `https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL` (seasonally adjusted)
- `cpi_core` · source: `FRED (BLS)` · cadence: `M` · url/api: `fredgraph.csv?id=CPILFESL`
- `tips10` · source: `FRED (Fed H.15)` · cadence: `D` · url/api: `fredgraph.csv?id=DFII10`
- `ust10` · source: `FRED (Fed H.15)` · cadence: `D` · url/api: `fredgraph.csv?id=DGS10`
- `rreal10` · source: `FRED (Cleveland Fed)` · cadence: `M` · url/api: `fredgraph.csv?id=REAINTRATREARAT10Y`
- `gold_pm` · source: `FRED (ICE-LBMA)` · cadence: `D` · url/api: `fredgraph.csv?id=GOLDPMGBD228NLBM`
- `usd_broad` · source: `FRED (Fed H.10)` · cadence: `D` · url/api: `fredgraph.csv?id=DTWEXBGS`
- `m2` · source: `FRED (Fed H.6)` · cadence: `M` · url/api: `fredgraph.csv?id=M2SL`
- `gdp_ngdp` · source: `FRED (BEA)` · cadence: `Q` · url/api: `fredgraph.csv?id=GDP`
- `rsv_status` · source: `IMF COFER via DBnomics` · cadence: `A` · url/api: `https://api.db.nomics.world/v22/series/IMF/COFER/A.W00.RAXGFXARUSDRT_PT` (binary 1 if USD share > 40%)

**Formulas / decision rules (§5 + §6):**
- `π_hdln = cpi_t/cpi_{t-12} − 1`; `π_core = cpic_t/cpic_{t-12} − 1`
- `r_mkt = tips10`; `π_be = ust10 − tips10`; `r_mdl = rreal10`
- Real-rate buckets: `DEEPLY_NEG` < −0.5%; `MILDLY_NEG` −0.5% to <0%; `NEUTRAL` 0-<0.5%; `MILDLY_POS` 0.5-<1.5%; `POSITIVE` ≥ 1.5% (at-boundary falls in upper bucket)
- Monetary separator: `μ = M2_yoy − NGDP_yoy`; monetary-driven if `μ > 4%/yr sustained ≥ 4Q`
- `ΔFX_12m = usd_broad_t/usd_broad_{t-12} − 1`; `ΔGold_12m = gold_t/gold_{t-12} − 1`
- `DebaseFlag = 1` if `ΔFX < −7% AND ΔGold > +15%` (calibrated: 1971/2002/2008/2020 trigger; 1995-99/2014-15 do not)
- Regime precedence: INFLATIONARY > STAGFLATION > BEAUTIFUL > DEFLATIONARY
- `DEFLATIONARY`: `π_hdln < 1% AND r_mkt > 0 AND ΔGold < 0`
- `BEAUTIFUL`: `1% ≤ π_hdln ≤ 3% AND μ > 0 AND r_mkt > 0`
- `STAGFLATION`: `π_hdln > 3% AND NGDP_yoy < 2×π_hdln`
- `INFLATIONARY` (reserve): `π_hdln > 4% AND r_mkt < 0 AND DebaseFlag=1`; (non-reserve): `π_hdln > 3% AND r_mkt < 0 AND DebaseFlag=1`
- `CashTrashFlag=1` if `r_mkt < 0 for ≥ 6 consecutive months`; reset when `r_mkt > +1%`

**State / regime output:**
- States: `DEFLATIONARY` | `BEAUTIFUL` | `STAGFLATION` | `INFLATIONARY`
- Classifier rule: precedence walk (INFLATIONARY first), reserve-currency tier (4% vs 3% threshold)

**Byte-exact / canonical values (§7 + §6):**
- Portfolio tilt table (δ from AW baseline, internal assets sum to zero):
  - DEFLATIONARY: Gold −2.5pts, Comm −2.5pts, Bonds 0, Cash +5pts
  - BEAUTIFUL: all 0
  - STAGFLATION: Gold +5pts, Comm +5pts, Bonds −5pts, Cash −5pts; FXShort +5pts long EUR/JPY vs USD
  - INFLATIONARY: Gold +10pts, Comm +5pts, Bonds −10pts, Cash −5pts; FXShort +10pts short debasing currency
- Illustrative 2022-Q2: π_hdln=8.5%, π_core=6%, r_mkt=−0.5% (MILDLY_NEG), μ=−2%, ΔFX=+8%, ΔGold=+1.5%, DebaseFlag=0 → STAGFLATION; tilts Gold+5, Comm+5, Bonds−5, Cash−5
- AW baseline gold+comm=15.0%; post-STAGFLATION=25.0%

**Integration emit → consumed by (§9):**
- emit `RegimeTag` → consumed by Step `2.2`, Step `2.5`
- emit `tilt_deltas` → consumed by Step `2.2`
- emit `DebaseFlag` → consumed by Step `1.4`, Step `2.3`
- emit `CashTrashFlag` → consumed by Step `2.2`
- emit `RealRateBucket` → consumed by Step `2.2`, Step `2.3`

**Source line refs:**
- §4 L37–48, §5.1 L53–57, §5.2 L58–66, §5.3 L67–84, §5.4 L85–94, §5.5 L95–104, §5.6 L105–119, §6 L121–141, §7 L143–176, §9 L273–276

---

## research/08_template_for_investing.md → Step 2.1 · Template for Investing

**Inputs (§4 input table):**
- `P_sp500` · source: `FRED` · cadence: `D` · url/api: `series_id=SP500`
- `Y_10y` · source: `FRED` · cadence: `D` · url/api: `series_id=DGS10`
- `Y_3m` · source: `FRED` · cadence: `D` · url/api: `series_id=DTB3` (risk-free proxy)
- `S_hy` · source: `FRED` · cadence: `D` · url/api: `series_id=BAMLH0A0HYM2`
- `P_gold` · source: `FRED` · cadence: `D` · url/api: `series_id=GOLDPMGBD228NLBM`
- `P_wti` · source: `FRED` · cadence: `D` · url/api: `series_id=DCOILWTICO`
- `FX_DXY` · source: `FRED` · cadence: `D` · url/api: `series_id=DTWEXBGS`
- `P_eem` · source: `Stooq` · cadence: `D` · url/api: `stooq.com/q/d/l/?s=eem.us&i=d`
- `P_agg` · source: `Stooq` · cadence: `D` · url/api: `stooq.com/q/d/l/?s=agg.us&i=d`
- `r_{i,t}` · derived daily log excess return; `ρ_{ij}` / `σ_i` · 252-day rolling window (industry standard)

**Formulas / decision rules (§5 + §6):**
- Excess return: `r̃_{i,t} = ln(P_{i,t}/P_{i,t-1}) − r_f_t/252`; for yields: `r̃_{10y} ≈ −D·ΔY_10y`, D=8.5
- Average pairwise correlation: `ρ̄_t = 2/(N(N−1)) · Σ_{i<j} ρ_{ij,t}`
- Portfolio vol (equal-weight, equal-vol): `σ_p/σ = √[(1+(N−1)ρ)/N]`
- Effective stream count: `N_eff = N / [1 + (N−1)ρ̄]` → `σ_p/σ = 1/√N_eff`
- `HolyGrailRegime`: NONE if N_eff < 5; PARTIAL if 5-14; FULL if ≥ 15
- `ρ̄ tag`: UNCORRELATED < 0.10; LIGHTLY-CORRELATED 0.10-0.30; HIGHLY-CORRELATED 0.30-0.70; DOMINATED ≥ 0.70

**State / regime output:**
- States: `NONE` | `PARTIAL` | `FULL` (HolyGrailRegime)
- States: `UNCORRELATED` | `LIGHTLY-CORRELATED` | `HIGHLY-CORRELATED` | `DOMINATED` (ρ̄ tag)
- Classifier rule: N_eff thresholds at 5 and 15; ρ̄ thresholds at 0.10, 0.30, 0.70

**Byte-exact / canonical values (§7):**
- Dalio Chart 5 (Engineering, p.8): P1 N=6, ρ=0.25 → N_eff=2.667, σ_p/σ=0.6124, σ-red=38.76%; P2 N=77, ρ=0.04 → N_eff=19.06, σ_p/σ=0.2291, σ-red=77.09%
- σ grid (σ=10%/stream): N=15/ρ=0→2.582%; N=25/ρ=0→2.000% (80% red.); N=15/ρ=0.10→4.000%
- Sample 8-stream panel, ρ̄≈0.22: `N_eff = 8/2.54 = 3.150`; σ-red=43.65% → `NONE`
- "up to 80%" requires ρ≈0 AND N≥25; at ρ=0.25 floor is 50% regardless of N

**Integration emit → consumed by (§9):**
- emit `HolyGrailRegime` → consumed by Step `2.2` (sizing gate N_eff≥15), Step `2.4`, Step `2.5`
- emit `N_eff` → consumed by Step `2.2`, Step `2.3`, Step `2.4`
- emit `ρ̄` → consumed by Step `2.3`, Step `2.5`

**Source line refs:**
- §4 L35–51, §5.1 L55–65, §5.2 L67–68, §5.3 L70–77, §5.4 L82–86, §6.1 L90–101, §6.2 L103–111, §7 L119–164, §9 L272–277

---

## research/09_all_weather.md → Step 2.2 · All-Weather (Beta) Portfolio

**Inputs (§4 input table):**
- `ret_spx` · source: `FRED` · cadence: `D` · url/api: `series_id=SP500`
- `ret_tlt` · source: `FRED` · cadence: `D` · url/api: `series_id=DGS20 or DGS30`
- `ret_ief` · source: `FRED` · cadence: `D` · url/api: `series_id=DGS10`
- `ret_gold` · source: `FRED` · cadence: `D` · url/api: `series_id=GOLDPMGBD228NLBM`
- `ret_comm` · source: `Stooq` · cadence: `D` · url/api: `https://stooq.com/q/d/?s=%5Ebcom&i=d`
- `cpi_yoy` · source: `FRED (BLS)` · cadence: `M` · url/api: `series_id=CPIAUCSL`
- `gdp_yoy` · source: `FRED (BEA)` · cadence: `Q` · url/api: `series_id=GDPC1`

**Formulas / decision rules (§5 + §6):**
- `σ_i = √252·stdev(r_{i,t})` over trailing 252 days; `Σ_{ij} = σ_i·σ_j·ρ_{ij}`; `σ_p = √(w'Σw)`
- `RC%_i = w_i·(Σw)_i / σ_p²` (sums to 100%)
- `RC^{env}_e = Σ_{i:B_{i,e}=+1} RC%_i` (non-disjoint; do not sum to 100%)
- Drift = `‖w_current − w_target‖_∞`; GREEN < 3%; AMBER 3-5%; RED > 5% absolute
- Vol-band rebalance: RED if any sleeve drifts > 5% OR portfolio ex-ante vol outside ±25% of long-run target
- Environment-risk check: if max/min RC ratio > 1.5× → flag environmentally unbalanced

**State / regime output:**
- States: `GREEN` | `AMBER` | `RED` (drift band)
- Outputs: `σ_p`, `RC%_i` per sleeve, `RC^env_e` per environment

**Byte-exact / canonical values (§7 + §6):**
- Target weights (Robbins 2014 / Dalio): Equities 30.0%, Long Treasuries 40.0%, Intermediate Treasuries 15.0%, Gold 7.5%, Commodities 7.5%
- Illustrative vols (Apr-2026): SPX=16%, LT=13%, IT=6%, Gold=15%, Comm=18%; σ_p=7.510%
- RC% at canonical weights+illustrative cov: SPX=34.20%, LT=46.87%, IT=7.83%, Gold=5.40%, Comm=5.69%
- Environment RC (non-disjoint): Growth-up=39.89%, Growth-down=54.70%, Inflation-up=11.09%, Inflation-down=88.90%
- Drift example: actuals 33/37/15/7.5/7.5 → max drift=3.0% → AMBER
- Environmental bias matrix (B, +1/-1/0): Equities: Growth-up+1, Growth-down−1, Infl-up 0, Infl-down+1; LT/IT Treasuries: Growth-down+1, Infl-up−1, Infl-down+1; Gold: Infl-up+1; Commodities: Growth-up+1, Growth-down−1, Infl-up+1

**Integration emit → consumed by (§9):**
- emit `target_weights (30/40/15/7.5/7.5)` → consumed by Step `2.3`, Step `2.4`, Step `2.5`
- emit `RC%_i` → consumed by Step `2.4`, Step `2.5`
- emit `drift_band` → consumed by execution layer
- emit `σ_p` → consumed by Step `2.4` (leverage input)

**Source line refs:**
- §4 L34–48, §5 L49–77, §6 L79–111, §7 L113–161, §8a L164–188, §9 L254–267

---

## research/10_alpha_portable_alpha.md → Step 2.3 · Alpha Generation & Portable Alpha

**Inputs (§4 input table):**
- `RF (cash rate)` · source: `FRED (H.15)` · cadence: `D` · url/api: `series_id=DGS3MO`
- `Mkt-RF` · source: `Ken French Data Library` · cadence: `M` · url/api: `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip`
- `SMB, HML, Mom` · source: `Ken French Data Library` · cadence: `M` · url/api: same zip archive
- `σ_Alpha, IC, N, ρ_avg` · source: manager-proprietary — no public API (internally estimated from trade blotter/forecast log)

**Formulas / decision rules (§5 + §6):**
- Return decomposition: `r_total = r_cash + β·(r_benchmark − r_cash) + α`; β via rolling 36-month OLS
- Per-slice IR: `IR_slice = IC·√n_dec` (Grinold 1989 Fundamental Law, NON-DALIO)
- Portfolio IR under correlation: `IR_port = IR_slice·√N / √[1 + (N−1)·ρ_avg]`
- Effective breadth: `N_eff = N / [1 + (N−1)·ρ_avg]`
- Portable alpha overlay: `r_client = r_cash + w_β·(r_benchmark − r_cash) + w_α·r_alpha_book`
- Decision rules: N_eff < 6 → add uncorrelated strategies; ρ_avg > 0.20 → cut most-correlated slice; IR_slice ≥ 0.30 → eligible; IR_slice < 0.15 → retire; post-publication decay > 35% → discount ≥35% (McLean & Pontiff 2016, NON-DALIO)

**State / regime output:**
- States: concentrated (`N_eff < 6`), eligible (`IR_slice ≥ 0.30`), retire (`IR_slice < 0.15`)
- Outputs: `IR_port`, `N_eff`, eligibility flag per slice

**Byte-exact / canonical values (§7):**
- Dalio Chart 5 (Engineering, p.8) exact values: P1 N=6, ρ=0.25, IR_slice=0.35 → chart says IR=0.6; recomputed = 0.571
- P2 N=77, ρ=0.04, IR_slice=0.35 → chart says IR=1.4; recomputed = 1.528 (chart implies ρ=0.050, not 0.04 — rounding)
- IR ratio chart: 1.4/0.6=2.33×; recomputed: 1.528/0.571=2.67×; both inside Dalio's "two to four times"
- Dalio examples of client tracking error: "one client might choose 3% tracking error while another might choose 6%"

**Integration emit → consumed by (§9):**
- emit `IR_port` → consumed by Step `2.4`
- emit `σ_Alpha` (tracking error) → consumed by Step `2.4`
- emit `N_eff` (alpha sleeve) → consumed by Step `2.4`

**Source line refs:**
- §4 L32–43, §5 L45–75, §6 L79–98, §7 L107–122, §8a L128–161, §9 L256–265

---

## research/11_risk_parity_leverage.md → Step 2.4 · Risk Parity & Leverage

**Inputs (§4 input table):**
- `ret_spx` · source: `FRED` · cadence: `D` · url/api: `series_id=SP500`
- `ret_ust10` · source: `FRED` · cadence: `D` · url/api: `series_id=DGS10` (yield → price via duration ≈8.5)
- `ret_gold` · source: `FRED` · cadence: `D` · url/api: `series_id=GOLDPMGBD228NLBM`
- `ret_bcom` · source: `Yahoo Finance` · cadence: `D` · url/api: `https://query1.finance.yahoo.com/v8/finance/chart/%5EBCOM?interval=1d&range=10y`
- `r_f` · source: `FRED` · cadence: `M/D` · url/api: `series_id=FEDFUNDS` / `DFF`
- `r_repo` · source: `FRED` · cadence: `D` · url/api: `series_id=DTB3`
- `vix` · source: `FRED` · cadence: `D` · url/api: `series_id=VIXCLS`
- `σ_target` · operator-set constant; typical default = 10%
- vol lookback: 63-day daily (DERIVED; AFP 2012 uses 36-month monthly)

**Formulas / decision rules (§5 + §6):**
- Vol: `σ_i = √252·stdev(r_i)` over 63 days; `Σ_{ij} = σ_i·σ_j·ρ_{ij}`; `σ_p = √(w'Σw)`
- Inverse-vol weights: `w_i = (1/σ_i) / Σ_j(1/σ_j)` (exact ERC only when correlations equal; gap < 2pp for 4-6 sleeves)
- Leverage: `L = σ_target / σ_p`; hard cap L ≤ 3.0×
- Net return: `r_net = L·r_p − (L−1)·r_fund`
- Sharpe with funding spread s: `SR_lev = (r_p − r_f)/σ_p − [(L−1)/L]·(s/σ_p)`
- Funding spread brackets: GREEN ≤ 25bp; AMBER 25-100bp; RED > 100bp → reduce L one step
- L bands: GREEN [1.0×, 2.0×]; AMBER (2.0×, 3.0×]; RED > 3.0×
- Rebalance: monthly; trigger early if `|σ_p_realized − σ_target|/σ_target > 25%`
- Margin buffer: `5% × (L−1)` of NAV

**State / regime output:**
- States: `GREEN` | `AMBER` | `RED` (L band, funding-spread band)
- Outputs: `w_i` (inverse-vol weights), `σ_p`, `L`, `r_net`, `SR_lev`, `sharpeDrag`, margin buffer

**Byte-exact / canonical values (§7):**
- Dalio anchor: "All Weather is around 2 times leveraged" (Engineering, p.11)
- Illustrative 4-sleeve (Apr-2026): σ_SPX=16%, σ_UST10=6%, σ_Gold=15%, σ_BCOM=18%
- Inverse-vol weights: 1/σ sum=35.139; SPX=17.79%, UST10=47.43%, Gold=18.97%, BCOM=15.81%
- σ_p = 6.037%; L = 10.00%/6.037% = **1.656×**; levered gross=165.6% of NAV
- Sharpe table (r_f=4.0%, r_p=7.415%, s=0): Unlevered SR=0.566; Levered SR=0.566; +25bp → 0.549; +50bp → 0.533; +100bp → 0.500
- Drag @ 25bp = 1.64pp Sharpe; @ 100bp = 6.56pp Sharpe
- Margin buffer = `5% × 0.656 = 3.28% × NAV`
- Dalio Sharpe range for betas: "0.2 to 0.3" (Engineering, p.3); used 0.30 as top-of-range in example

**Integration emit → consumed by (§9):**
- emit `L` → consumed by Step `2.3` (overlay sizing), execution layer
- emit `w_i` (risk-parity weights) → consumed by Step `2.3`
- emit `SR_lev`, `sharpeDrag` → consumed by Step `2.3`, Step `2.5`
- emit `margin_buffer` → consumed by execution layer

**Source line refs:**
- §4 L28–43, §5 L45–121, §6 L79–118, §7 L122–171, §8a L175–201, §9 L278–290

---

## research/12_stress_testing.md → Step 2.5 · Stress-Testing & Scenario Analysis

**Inputs (§4 input table):**
- `ret_spx` · source: `FRED` · cadence: `D` · url/api: `series_id=SP500`
- `ret_ltsy` · source: `Damodaran NYU Stern` · cadence: `A` · url/api: `https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html`
- `ret_itsy` · source: `Damodaran NYU Stern` · cadence: `A` · url/api: same URL (10y T.Bond column proxy)
- `ret_gold` · source: `FRED / LBMA` · cadence: `D` · url/api: `series_id=GOLDPMGBD228NLBM`
- `ret_comm` · source: `Bloomberg/Wikipedia (BCOM)` · cadence: `M` · url/api: `https://en.wikipedia.org/wiki/Bloomberg_Commodity_Index`
- `cape_shiller` · source: `shillerdata.com` · cadence: `M` · url/api: `https://shillerdata.com/` (ie_data.xls)
- `gdp_longrun` · source: `Maddison Project 2020` · cadence: `periodic` · url/api: `https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2020`
- `w_target` · locked Robbins 2014 weights 30/40/15/7.5/7.5 (static, from 2.2)

**Formulas / decision rules (§5 + §6):**
- Shock matrix application: `R^{port}_e = Σ_i w_i·S_{i,e}` with w=(0.30, 0.40, 0.15, 0.075, 0.075)
- Per-sleeve contribution: `C_{i,e} = w_i·S_{i,e}`; dominant = max |C_{i,e}|
- Asymmetry ratio: `max_e |R^{port}_e| / min_e |R^{port}_e|`; > 8× → RED (re-architect)
- Decision bands: GREEN > −10%; AMBER −20% to −10%; RED < −20% → handoff to 2.4

**State / regime output:**
- States: `GREEN` | `AMBER` | `RED` (per archetype)
- Outputs: `R^{port}_e`, `C_{i,e}` per sleeve per archetype, MaxDD/recovery durations, asymmetry ratio

**Byte-exact / canonical values (§7):**
- Shock matrix S (cumulative, 5 sleeves × 4 archetypes):
  - SPX: Defl=−50%, Infl=−30%, Stag=−37%, Refl=+25%
  - LongTsy: Defl=+20%, Infl=−50%, Stag=−5%, Refl=+5%
  - IntTsy: Defl=+10%, Infl=−40%, Stag=+2%, Refl=+3%
  - Gold: Defl=0%, Infl=+80%, Stag=+100%, Refl=+10%
  - Comm: Defl=−35%, Infl=+40%, Stag=+30%, Refl=+15%
- Portfolio returns (Table 7.1): Defl=**−8.125%**, Infl=**−26.000%**, Stag=**−3.050%**, Refl=**+11.825%**
- Dominant driver: Defl=SPX (−15.00ppt); Infl=LongTsy (−20.00ppt); Stag=SPX (−11.10ppt); Refl=SPX (+7.50ppt)
- MaxDD (months): Defl=34, Infl=24, Stag=21, Refl=3
- Peak-to-recovery (months): Defl=302, Infl=60, Stag=91, Refl=6
- 2008 reconciliation (Damodaran): SPX=−36.55%, LT=+20.10%, IT=+20.10%, Gold≈+5.00%, Comm=−37.42% → unleveraged sum=**−2.34%** vs Bridgewater fund **−20%**; gap=−17.66ppt = leverage + ILB sleeve
- Asymmetry ratio: 26.00/3.05 = **8.52×** → > 8× → RED (inflationary depression dominates tail)
- Anchors: Deflationary calibrated from 1929-33 Dow peak-trough −89.2%; Infl from Weimar + gold 1973 +66.79% / 1974 +72.59%; Stag from 1973-74 SPX ≈−37% (Damodaran); Refl from 2009/2020 rebounds

**Integration emit → consumed by (§9):**
- emit `R^{port}_e` per archetype → consumed by Step `2.4` (leverage/hedge decisions)
- emit `asymmetry_ratio` → consumed by Step `2.4`
- emit `C_{i,e}` dominant sleeve → consumed by execution layer (overlay tickets)
- emit scenario outputs → consumed by quarterly risk dashboard

**Source line refs:**
- §4 L28–42, §5 L44–77, §6 L79–101, §7 L103–148, §8a L150–182, §9 L261–272
