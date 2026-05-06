# Phase-5 Build-Readiness Matrix

Mechanical readiness audit of all 12 `research/<NN>_*.md` files.
Verdict logic: GREEN = all 8 PASS · YELLOW = ≥1 PARTIAL · RED = ≥1 FAIL.

| File | C1 §4 | C2 §5 | C3 §6 | C4 §7 | C5 §8a | C6 §8b | C7 §8c | C8 §10 | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| `01_economic_machine.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `02_short_term_debt_cycle.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `03_long_term_debt_cycle.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `04_deleveragings.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `05_paradigm_shifts.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `06_changing_world_order.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `07_inflation_currency.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 YELLOW |
| `08_template_for_investing.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `09_all_weather.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `10_alpha_portable_alpha.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `11_risk_parity_leverage.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |
| `12_stress_testing.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 GREEN |

## Per-file detail

### `01_economic_machine.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 9/9 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=0 |
| C3 §6 decision rules | PASS | code_indicators=1 eq_fence=False math_compare=False decision_table=True prose_ineq=7 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=4 fence_numerics=0 inline_numerics=90 case_headers=6 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=False column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=8 |

### `02_short_term_debt_cycle.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 11/11 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=3 |
| C3 §6 decision rules | PASS | code_indicators=1 eq_fence=False math_compare=True decision_table=False prose_ineq=3 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=9 fence_numerics=2 inline_numerics=57 case_headers=7 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=False column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=12 |

### `03_long_term_debt_cycle.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 13/13 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=1 |
| C3 §6 decision rules | PASS | code_indicators=0 eq_fence=False math_compare=True decision_table=False prose_ineq=7 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=3 fence_numerics=0 inline_numerics=122 case_headers=6 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'legend', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=11 |

### `04_deleveragings.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 10/10 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=1 |
| C3 §6 decision rules | PASS | code_indicators=1 eq_fence=False math_compare=True decision_table=True prose_ineq=3 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=0 fence_numerics=0 inline_numerics=90 case_headers=3 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'legend', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=10 |

### `05_paradigm_shifts.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 13/13 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=1 |
| C3 §6 decision rules | PASS | code_indicators=0 eq_fence=False math_compare=True decision_table=True prose_ineq=4 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=5 fence_numerics=0 inline_numerics=142 case_headers=7 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=False column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'option', 'series', 'tooltip', 'type', 'visualMap', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=11 |

### `06_changing_world_order.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 10/10 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=2 |
| C3 §6 decision rules | PASS | code_indicators=0 eq_fence=False math_compare=True decision_table=True prose_ineq=1 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=8 fence_numerics=0 inline_numerics=129 case_headers=5 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=False fence_formula=False inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'legend', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=12 |

### `07_inflation_currency.md` — YELLOW

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 10/10 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=3 |
| C3 §6 decision rules | PASS | code_indicators=1 eq_fence=False math_compare=True decision_table=True prose_ineq=3 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=0 fence_numerics=0 inline_numerics=113 case_headers=4 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'option', 'series', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PARTIAL | urls=4 |

### `08_template_for_investing.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 12/12 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=8 |
| C3 §6 decision rules | PASS | code_indicators=0 eq_fence=False math_compare=True decision_table=True prose_ineq=5 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=15 fence_numerics=0 inline_numerics=236 case_headers=4 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'legend', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=14 |

### `09_all_weather.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 11/11 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=0 |
| C3 §6 decision rules | PASS | code_indicators=1 eq_fence=False math_compare=False decision_table=False prose_ineq=5 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=20 fence_numerics=0 inline_numerics=132 case_headers=5 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=9 |

### `10_alpha_portable_alpha.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 7/7 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=1 |
| C3 §6 decision rules | PASS | code_indicators=0 eq_fence=False math_compare=True decision_table=True prose_ineq=7 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=2 fence_numerics=0 inline_numerics=72 case_headers=2 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'legend', 'option', 'series', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=8 |

### `11_risk_parity_leverage.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 13/13 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=1 |
| C3 §6 decision rules | PASS | code_indicators=1 eq_fence=False math_compare=True decision_table=True prose_ineq=7 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=18 fence_numerics=0 inline_numerics=155 case_headers=8 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=True |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=13 |

### `12_stress_testing.md` — GREEN

| Check | Status | Detail |
|---|---|---|
| C1 §4 input table | PASS | 11/11 rows addressable |
| C2 §5 math operational | PASS | fences_with_eq=0 latex=True inline_eq_lines=1 |
| C3 §6 decision rules | PASS | code_indicators=0 eq_fence=False math_compare=True decision_table=False prose_ineq=3 state_tags=[] |
| C4 §7 worked example | PASS | table_rows=20 fence_numerics=0 inline_numerics=121 case_headers=4 |
| C5 §8a JS parses | PASS | 1/1 parse |
| C6 §8b excel spec | PASS | power_query=True fence_formula=True inline_formula=True column_spec=False |
| C7 §8c ECharts spec | PASS | keys_found=['grid', 'option', 'series', 'tooltip', 'type', 'xAxis', 'yAxis'] |
| C8 §10 sources | PASS | urls=11 |
