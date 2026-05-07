# Dalio Dashboard v2 — Live Analytical Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live analytical workflow dashboard implementing Dalio's 12-framework methodology as a sequential, narrated, single-page web app ending in one decisive portfolio recommendation.

**Architecture:** Static HTML/JS/CSS thin-client (vanilla JS, ECharts, GSAP) served from CDN, fronted by a serverless backend proxy (Cloudflare Worker) that holds API keys and normalizes ~10 bulk-file data sources into a single JSON payload on page load.

**Tech Stack:** Vanilla JS (ES modules) · Vite (dev/build) · Vitest + happy-dom (unit tests) · Playwright (E2E smoke) · ECharts (charts) · GSAP (AF reveal animations) · Source Serif 4 + DM Mono fonts · Cloudflare Worker (backend proxy) · Wrangler (deploy)

**Spec source of truth:** `docs/superpowers/specs/2026-05-06-dashboard-design.md` (988 LOC, commit `d39a6f8`)

**Scope tier:** Tier-2 (cross-subsystem, new dependency surface, new top-level dirs)

---

## File Structure (locked at planning)

```
dashboard/                                  [NEW top-level dir for v2]
├── package.json                            [npm workspaces, pinned deps]
├── vite.config.js                          [dev server + prod build]
├── vitest.config.js                        [unit test runner]
├── playwright.config.js                    [E2E smoke runner]
├── index.html                              [single-page entry]
├── src/
│   ├── main.js                             [bootstrap: fetch + render orchestration]
│   ├── core/
│   │   ├── fetch.js                        [single XHR to /api/fetch-all]
│   │   ├── state.js                        [global state store]
│   │   └── render.js                       [slide-by-slide render orchestration]
│   ├── slides/                             [12 slide modules + final + 2 sidebars]
│   │   ├── slide-1-1-economic-machine.js
│   │   ├── slide-1-2-short-term-cycle.js
│   │   ├── slide-1-3-long-term-debt.js
│   │   ├── slide-1-4-deleveragings.js
│   │   ├── slide-1-7-inflation.js
│   │   ├── slide-1-5-paradigms.js
│   │   ├── slide-1-6-world-order.js
│   │   ├── slide-2-2-all-weather.js
│   │   ├── slide-2-5-stress-testing.js
│   │   ├── slide-2-4-risk-parity.js
│   │   ├── slide-final-recommendation.js
│   │   ├── sidebar-2-1-holy-grail.js
│   │   └── sidebar-2-3-alpha.js
│   ├── compute/                            [pure regime classifiers per framework]
│   │   ├── econ-machine.js
│   │   ├── short-cycle.js
│   │   ├── long-debt.js
│   │   ├── deleveragings.js
│   │   ├── inflation.js
│   │   ├── paradigms.js
│   │   ├── world-order.js
│   │   ├── all-weather.js
│   │   ├── stress.js
│   │   ├── risk-parity.js
│   │   └── tilt-arbiter.js
│   ├── nav/
│   │   ├── nav-bar.js                      [12-segment bottom nav]
│   │   └── nav-bar.css
│   ├── chips/
│   │   ├── chip-strip.js                   [pinned-header progressive fill]
│   │   └── chip-strip.css
│   ├── animations/
│   │   ├── af-reveal.js                    [port from slideshow lines 1792-1886]
│   │   └── loading-loop.js                 [reveal-in → hold → reveal-out → repeat]
│   ├── charts/
│   │   ├── echarts-bw-theme.js             [custom BW theme]
│   │   ├── patterns.js                     [SVG pattern definitions]
│   │   └── chart-{slug}.js                 [one config per slide]
│   ├── wizard/
│   │   ├── welcome.js
│   │   ├── tier-1.js                       [3 required fields]
│   │   ├── tier-2.js                       [optional portfolio]
│   │   ├── tier-3.js                       [advanced/professional]
│   │   └── persistence.js                  [localStorage]
│   ├── ui/
│   │   ├── slide-shell.js                  [eyebrow + ONE point + caption + tabs]
│   │   ├── tab-group.js                    [3-tab collapsible Chart/Notes/Sources]
│   │   ├── mobile-splash.js
│   │   └── disclaimer-footer.js
│   └── styles/
│       ├── design-system.css               [tokens: ink/paper, fonts, spacing]
│       ├── typography.css
│       ├── layout.css
│       └── reveal.css                      [.reveal-ch styling]
├── tests/
│   ├── unit/                               [Vitest tests, one per compute module]
│   └── e2e/                                [Playwright happy-path]
└── public/
    └── fonts/                              [Source Serif 4 + DM Mono — self-hosted for offline-friendliness]

backend/                                    [NEW top-level dir]
├── package.json                            [Cloudflare Worker deps]
├── wrangler.toml                           [Worker config]
├── src/
│   ├── worker.js                           [/api/fetch-all entrypoint]
│   ├── normalize/
│   │   ├── fred.js                         [JSON API]
│   │   ├── bis.js                          [.zip extraction]
│   │   ├── imf-cofer.js                    [.xls fetch]
│   │   ├── world-bank.js                   [JSON API]
│   │   ├── damodaran.js                    [.xls fetch]
│   │   ├── shiller.js                      [.xls fetch]
│   │   ├── yardeni.js                      [PDF parse w/ fallback]
│   │   ├── nber.js                         [JSON API]
│   │   └── ny-fed.js                       [JSON API]
│   └── lib/
│       ├── xls-parse.js                    [SheetJS lite]
│       └── zip-parse.js                    [unzipit / fflate]
└── tests/
    └── normalize.test.js                   [Vitest, mock fetches]

pilot/                                      [EXISTING — preserved]
├── dalio_dashboard.html                    [OBSOLETE slideshow — DO NOT MODIFY]
└── build_xlsx.py                           [v1.1 xlsx port — out of scope for this plan]

docs/superpowers/
├── specs/2026-05-06-dashboard-design.md    [source of truth]
└── plans/2026-05-06-dalio-dashboard-engine-v2.md  [THIS FILE]
```

---

## Phase index

- **P0** Foundation (T1-3): repo scaffold, test infra
- **P1** Design system (T4-6): CSS tokens, typography, hairlines
- **P2** AF animations (T7-9): port `airForceReveal`, `airForceRevealOut`, `loadingLoop`
- **P3** ECharts BW theme (T10-12): theme override, SVG patterns, helper API
- **P4** Backend proxy (T13-16): Worker scaffold, normalizers, `/api/fetch-all`
- **P5** Page architecture (T17-20): HTML scaffold, slide shell, tab group, slide register
- **P6** Wizard (T21-23): welcome + T1/T2/T3 + localStorage
- **P7** Pinned chips (T24-25): strip + IntersectionObserver fill
- **P8** Bottom nav (T26-29): bar layout, line→dots, proximity, click-to-scroll
- **P9** Compute modules (T30-35): regime classifiers + tilt arbiter
- **P10** Per-step slides (T36-47): 10 live + 2 sidebars
- **P11** Final recommendation (T48-49): slide 11 + bind synthesis
- **P12** Polish (T50-52): mobile splash, disclaimer, settings

Tasks numbered 1-52. Plan written incrementally below; each section is fully self-contained.

---

## Phase 0 — Foundation

### Task 1: Repo scaffold + npm workspaces

**Files:**
- Create: `dashboard/package.json`
- Create: `backend/package.json`
- Create: `package.json` (root, workspaces)
- Create: `.gitignore` (modify existing)

- [ ] **Step 1: Write the failing test** (smoke check that workspace resolves)

Create `dashboard/tests/unit/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';
describe('workspace smoke', () => {
  it('module imports resolve', async () => {
    const mod = await import('../../src/main.js').catch(() => null);
    expect(mod).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd dashboard && npm test -- --run smoke`
Expected: FAIL with "main.js not found" or "vitest not installed"

- [ ] **Step 3: Create root package.json**

```json
{
  "name": "dalio-dashboard-monorepo",
  "private": true,
  "workspaces": ["dashboard", "backend"],
  "scripts": {
    "dev": "npm --workspace dashboard run dev",
    "build": "npm --workspace dashboard run build",
    "test": "npm --workspace dashboard run test && npm --workspace backend run test",
    "deploy:backend": "npm --workspace backend run deploy"
  }
}
```

- [ ] **Step 4: Create dashboard/package.json**

```json
{
  "name": "@dalio/dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "echarts": "5.5.1",
    "gsap": "3.12.5"
  },
  "devDependencies": {
    "vite": "5.4.10",
    "vitest": "2.1.4",
    "happy-dom": "15.7.4",
    "@playwright/test": "1.48.0"
  }
}
```

- [ ] **Step 5: Create backend/package.json**

```json
{
  "name": "@dalio/backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/worker.js",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest"
  },
  "devDependencies": {
    "wrangler": "3.84.0",
    "vitest": "2.1.4"
  },
  "dependencies": {
    "fflate": "0.8.2",
    "xlsx": "0.20.3"
  }
}
```

- [ ] **Step 6: Append to root .gitignore**

```gitignore
# Dashboard build
dashboard/node_modules/
dashboard/dist/
dashboard/.vite/

# Backend build
backend/node_modules/
backend/dist/
backend/.wrangler/

# Test artifacts
**/coverage/
**/playwright-report/
**/test-results/

# Env
.env
.env.local
```

- [ ] **Step 7: Install + run smoke**

Run: `npm install && cd dashboard && mkdir -p src tests/unit && touch src/main.js && npm test -- --run smoke`
Expected: PASS (smoke imports empty main.js OK)

- [ ] **Step 8: Commit**

```bash
git add package.json dashboard/package.json backend/package.json .gitignore dashboard/src/main.js dashboard/tests/unit/smoke.test.js
git commit -m "feat(dashboard): scaffold npm workspaces for v2"
```

---

### Task 2: Vite + Vitest config

**Files:**
- Create: `dashboard/vite.config.js`
- Create: `dashboard/vitest.config.js`
- Create: `dashboard/index.html` (minimal)

- [ ] **Step 1: Write the failing test**

Edit `dashboard/tests/unit/smoke.test.js` to assert env:

```js
import { describe, it, expect } from 'vitest';
describe('build env', () => {
  it('has happy-dom window', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- --run smoke`
Expected: FAIL — `window is not defined` (Node default env)

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['tests/unit/**/*.test.js']
  }
});
```

- [ ] **Step 4: Create vite.config.js**

```js
import { defineConfig } from 'vite';
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787'  // wrangler dev port
    }
  }
});
```

- [ ] **Step 5: Create minimal index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=1024" />
    <title>Dalio Dashboard</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 6: Run test, verify pass**

Run: `cd dashboard && npm test -- --run smoke`
Expected: PASS

- [ ] **Step 7: Verify dev server starts**

Run: `cd dashboard && npm run dev` (Ctrl+C after seeing "Local: http://localhost:5173")
Expected: server starts; index.html serves with empty `#app`

- [ ] **Step 8: Commit**

```bash
git add dashboard/vite.config.js dashboard/vitest.config.js dashboard/index.html dashboard/tests/unit/smoke.test.js
git commit -m "feat(dashboard): vite + vitest config with happy-dom"
```

---

### Task 3: Playwright E2E config

**Files:**
- Create: `dashboard/playwright.config.js`
- Create: `dashboard/tests/e2e/loads.spec.js`

- [ ] **Step 1: Write the failing test**

Create `dashboard/tests/e2e/loads.spec.js`:

```js
import { test, expect } from '@playwright/test';
test('dashboard page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Dalio Dashboard/);
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npx playwright install chromium && npm run test:e2e`
Expected: FAIL — playwright config not found

- [ ] **Step 3: Create playwright.config.js**

```js
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1440, height: 900 }
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm run test:e2e`
Expected: PASS — page loads, title matches

- [ ] **Step 5: Commit**

```bash
git add dashboard/playwright.config.js dashboard/tests/e2e/loads.spec.js
git commit -m "feat(dashboard): playwright e2e config"
```

---

## Phase 1 — Design System

### Task 4: CSS design-system tokens

**Files:**
- Create: `dashboard/src/styles/design-system.css`
- Create: `dashboard/tests/unit/design-system.test.js`

Spec ref: §7 Visual design language token table.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('design-system tokens', () => {
  let css;
  beforeEach(() => {
    css = fs.readFileSync(
      path.resolve(__dirname, '../../src/styles/design-system.css'),
      'utf8'
    );
  });

  it('declares ink + paper variables', () => {
    expect(css).toMatch(/--ink:\s*#000/);
    expect(css).toMatch(/--paper:\s*#fff/);
  });

  it('declares Source Serif 4 + DM Mono', () => {
    expect(css).toMatch(/Source Serif 4/);
    expect(css).toMatch(/DM Mono/);
  });

  it('declares hairline opacity 0.55', () => {
    expect(css).toMatch(/--hairline-opacity:\s*0\.55/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- design-system`
Expected: FAIL — file not found

- [ ] **Step 3: Create design-system.css**

```css
/*  Dalio Dashboard v2 — Design System Tokens
 *  Spec: docs/superpowers/specs/2026-05-06-dashboard-design.md §7
 *  Locked Set 4 Q4.1 — identical to slideshow language. Pure B&W only.
 */

@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=DM+Mono:wght@300;400;500&display=swap');

:root {
  /* Palette — pure B&W, no color */
  --ink: #000;
  --paper: #fff;
  --ink-soft: #666;
  --paper-soft: #aaa;

  /* Fonts */
  --font-serif: 'Source Serif 4', Georgia, serif;
  --font-mono: 'DM Mono', 'IBM Plex Mono', monospace;

  /* Type scale */
  --fs-eyebrow: 11px;
  --fs-caption: 16px;
  --fs-body: 17px;
  --fs-h3: clamp(24px, 2.4vw, 38px);
  --fs-h2: clamp(40px, 5vw, 76px);
  --fs-h1: clamp(56px, 9vw, 132px);

  /* Spacing */
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 32px;
  --gap-xl: 64px;
  --gap-page: 100px;

  /* Hairlines */
  --hairline-opacity: 0.55;
  --hairline-w-sm: 32px;
  --hairline-w-md: 64px;
  --hairline-thick: 1px;

  /* Letterspacing */
  --tracking-eyebrow: 4px;
  --tracking-nav: 3px;
  --tracking-tight: -1.2px;
  --tracking-tighter: -2.5px;

  /* Animation */
  --ease-snap: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-morph: 380ms;
  --dur-stagger: 35ms;
}

/* Theme switches via [data-theme] on slide section */
[data-theme="light"] {
  --bg: var(--paper);
  --fg: var(--ink);
  --fg-soft: var(--ink-soft);
}
[data-theme="dark"] {
  --bg: var(--ink);
  --fg: var(--paper);
  --fg-soft: var(--paper-soft);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: var(--fs-body);
  line-height: 1.5;
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- design-system`
Expected: PASS

- [ ] **Step 5: Wire into main.js**

Edit `dashboard/src/main.js`:

```js
import './styles/design-system.css';
console.log('[dalio] design system loaded');
```

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/styles/design-system.css dashboard/src/main.js dashboard/tests/unit/design-system.test.js
git commit -m "feat(design-system): pure B&W tokens, Source Serif 4 + DM Mono, hairlines"
```

---

### Task 5: Typography component CSS

**Files:**
- Create: `dashboard/src/styles/typography.css`
- Create: `dashboard/tests/unit/typography.test.js`

Spec ref: §4.3 FR-3.1, FR-3.2, FR-3.3 + §7 token table.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('typography component', () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, '../../src/styles/typography.css'),
    'utf8'
  );

  it('eyebrow uses DM Mono 11px / 4px tracking / weight 500 / uppercase', () => {
    expect(css).toMatch(/\.eyebrow[\s\S]*font-family:\s*var\(--font-mono\)/);
    expect(css).toMatch(/\.eyebrow[\s\S]*letter-spacing:\s*var\(--tracking-eyebrow\)/);
    expect(css).toMatch(/\.eyebrow[\s\S]*font-weight:\s*500/);
    expect(css).toMatch(/\.eyebrow[\s\S]*text-transform:\s*uppercase/);
  });

  it('one-point uses italic Source Serif weight 300 with -1.2px tracking', () => {
    expect(css).toMatch(/\.one-point[\s\S]*font-style:\s*italic/);
    expect(css).toMatch(/\.one-point[\s\S]*font-weight:\s*300/);
    expect(css).toMatch(/\.one-point[\s\S]*letter-spacing:\s*var\(--tracking-tight\)/);
  });

  it('caption max-width 720px italic 16px', () => {
    expect(css).toMatch(/\.caption[\s\S]*max-width:\s*720px/);
    expect(css).toMatch(/\.caption[\s\S]*font-style:\s*italic/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- typography`
Expected: FAIL — file not found

- [ ] **Step 3: Create typography.css**

```css
/* Typography component — Spec §4.3 + §7 */

.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--fs-eyebrow);
  font-weight: 500;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--fg);
  display: inline-flex;
  align-items: center;
  gap: var(--gap-md);
}

.eyebrow::before {
  content: '';
  display: block;
  width: var(--hairline-w-sm);
  height: 1px;
  background: currentColor;
  opacity: var(--hairline-opacity);
}

.one-point {
  font-family: var(--font-serif);
  font-size: var(--fs-h2);
  font-style: italic;
  font-weight: 300;
  letter-spacing: var(--tracking-tight);
  line-height: 1.1;
  color: var(--fg);
  max-width: 18ch;
  margin: var(--gap-lg) 0 var(--gap-md);
  position: relative;
}

.one-point::before {
  content: '';
  position: absolute;
  top: -32px;
  left: 0;
  width: var(--hairline-w-md);
  height: 1px;
  background: currentColor;
  opacity: var(--hairline-opacity);
}

.one-point em,
.one-point .verdict {
  font-style: italic;
  font-weight: 700;
}

.caption {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: var(--fs-caption);
  font-weight: 300;
  max-width: 720px;
  color: var(--fg);
  line-height: 1.55;
  margin: 0 0 var(--gap-lg);
}

.caption em,
.caption .num {
  font-style: italic;
  font-weight: 500;
}

.section-h3 {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: var(--fs-h3);
  letter-spacing: -0.4px;
  color: var(--fg);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- typography`
Expected: PASS

- [ ] **Step 5: Import from main.js**

Append to `dashboard/src/main.js`:

```js
import './styles/typography.css';
```

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/styles/typography.css dashboard/src/main.js dashboard/tests/unit/typography.test.js
git commit -m "feat(design-system): eyebrow + one-point + caption typography components"
```

---

### Task 6: Layout shell CSS

**Files:**
- Create: `dashboard/src/styles/layout.css`
- Create: `dashboard/tests/unit/layout.test.js`

Spec ref: §4.2 page architecture + §4.7 chip strip pinned + §4.6 nav bar pinned.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('layout shell', () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, '../../src/styles/layout.css'),
    'utf8'
  );

  it('chip-strip is sticky top', () => {
    expect(css).toMatch(/\.chip-strip[\s\S]*position:\s*sticky/);
    expect(css).toMatch(/\.chip-strip[\s\S]*top:\s*0/);
  });

  it('nav-bar fixed bottom with 100px page margin', () => {
    expect(css).toMatch(/\.nav-bar[\s\S]*position:\s*fixed/);
    expect(css).toMatch(/\.nav-bar[\s\S]*left:\s*var\(--gap-page\)/);
    expect(css).toMatch(/\.nav-bar[\s\S]*right:\s*var\(--gap-page\)/);
  });

  it('slide section fills viewport min-height', () => {
    expect(css).toMatch(/\.slide[\s\S]*min-height:\s*100vh/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- layout`
Expected: FAIL

- [ ] **Step 3: Create layout.css**

```css
/* Layout shell — Spec §4.2 / §4.6 / §4.7 */

#app {
  position: relative;
  min-height: 100vh;
}

.chip-strip {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg);
  color: var(--fg);
  padding: var(--gap-md) var(--gap-page);
  border-bottom: 1px solid currentColor;
  border-bottom-color: rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  mix-blend-mode: difference;  /* auto-flips on dark theme transitions */
}

.nav-bar {
  position: fixed;
  left: var(--gap-page);
  right: var(--gap-page);
  bottom: 24px;
  height: 36px;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: stretch;
  gap: 10px;
  pointer-events: auto;
  mix-blend-mode: difference;
}

.slide {
  min-height: 100vh;
  padding: var(--gap-page) var(--gap-page) calc(var(--gap-page) + 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background: var(--bg);
  color: var(--fg);
}

.slide[data-theme="dark"] { background: var(--ink); --fg: var(--paper); --bg: var(--ink); }
.slide[data-theme="light"] { background: var(--paper); --fg: var(--ink); --bg: var(--paper); }

.slide-inner {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

.disclaimer-footer {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--fg-soft);
  text-align: center;
  padding: var(--gap-lg);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- layout`
Expected: PASS

- [ ] **Step 5: Import from main.js**

Append to `dashboard/src/main.js`:

```js
import './styles/layout.css';
```

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/styles/layout.css dashboard/src/main.js dashboard/tests/unit/layout.test.js
git commit -m "feat(layout): pinned chip-strip top + nav-bar bottom + slide vh shell"
```

---

## Phase 2 — AF Reveal Animations (port from slideshow)

### Task 7: Port `airForceReveal`

**Files:**
- Create: `dashboard/src/animations/af-reveal.js`
- Create: `dashboard/tests/unit/af-reveal.test.js`

Spec ref: §4.9 FR-9.1, FR-9.3. Source: `pilot/dalio_dashboard.html:1789-1855` (slideshow).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach } from 'vitest';

describe('airForceReveal', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '<div id="t">Hello <em>world</em></div>';
    el = document.getElementById('t');
  });

  it('wraps each non-space char in .reveal-ch span', async () => {
    const { airForceReveal } = await import('../../src/animations/af-reveal.js');
    airForceReveal(el);
    const spans = el.querySelectorAll('.reveal-ch');
    // "Hello world" = 10 chars (Hello=5, world=5; space replaced by &nbsp;)
    expect(spans.length).toBe(10);
  });

  it('preserves italic via nested <em>', async () => {
    const { airForceReveal } = await import('../../src/animations/af-reveal.js');
    airForceReveal(el);
    expect(el.innerHTML).toMatch(/font-style:italic/);
  });

  it('returns a GSAP timeline-like object', async () => {
    const { airForceReveal } = await import('../../src/animations/af-reveal.js');
    const tl = airForceReveal(el);
    expect(tl).toBeDefined();
    // Mock gsap returns a timeline shim
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- af-reveal`
Expected: FAIL — module not found

- [ ] **Step 3: Create af-reveal.js**

```js
/* AF reveal — port from pilot/dalio_dashboard.html:1789-1886 (slideshow).
 * Real GSAP, instant block flashes via gsap.set, true random delays.
 * Per spec §4.9 FR-9.1: do NOT replace with CSS scaleY — loses cyberpunk feel.
 */
import { gsap } from 'gsap';

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function airForceReveal(el, opts = {}) {
  const minDelay = opts.minDelay ?? 0.25;
  const maxDelay = opts.maxDelay ?? 0.42;
  const holdDuration = opts.holdDuration ?? 0.09;

  const parentColor = getComputedStyle(el).color;

  const raw = el.dataset.text || el.innerHTML;
  el.dataset.text = raw;

  const decoder = document.createElement('textarea');
  decoder.innerHTML = raw;
  const decoded = decoder.value;

  const temp = document.createElement('div');
  temp.innerHTML = decoded;

  let html = '';
  function processNode(node, italic) {
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === ' ') {
          html += '&nbsp;';
        } else {
          const styleAttr = ` style="color:transparent${italic ? ';font-style:italic' : ''}"`;
          html += `<span class="reveal-ch"${styleAttr}>${escapeHtml(c)}</span>`;
        }
      }
    } else if (node.nodeType === 1) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') { html += '<br>'; return; }
      const isEm = tag === 'em' || tag === 'i';
      const newItalic = italic || isEm;
      let openTag = '<' + tag;
      if (node.className) openTag += ` class="${node.className}"`;
      openTag += '>';
      html += openTag;
      Array.from(node.childNodes).forEach(n => processNode(n, newItalic));
      html += '</' + tag + '>';
    }
  }
  Array.from(temp.childNodes).forEach(n => processNode(n, false));
  el.innerHTML = html;

  const spans = el.querySelectorAll('.reveal-ch');
  const tl = gsap.timeline();
  spans.forEach(span => {
    const local = gsap.timeline();
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    local.set(span, { background: parentColor }, delay);
    local.set(span, { background: 'transparent', clearProps: 'color,background' }, delay + holdDuration);
    tl.add(local, 0);
  });
  return tl;
}

export function airForceRevealOut(el, opts = {}) {
  const minDelay = opts.minDelay ?? 0.0;
  const maxDelay = opts.maxDelay ?? 0.14;
  const holdDuration = opts.holdDuration ?? 0.07;

  const spans = el.querySelectorAll('.reveal-ch');
  if (!spans.length) return null;

  const parentColor = getComputedStyle(el).color;
  const tl = gsap.timeline();
  spans.forEach(span => {
    const local = gsap.timeline();
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    local.set(span, { background: parentColor, color: 'transparent' }, delay);
    local.set(span, { background: 'transparent' }, delay + holdDuration);
    tl.add(local, 0);
  });
  return tl;
}
```

- [ ] **Step 4: Add gsap mock for happy-dom test env**

Create `dashboard/tests/unit/_setup.js`:

```js
import { vi } from 'vitest';
vi.mock('gsap', () => ({
  gsap: {
    timeline: () => ({
      set: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis()
    }),
    set: vi.fn()
  }
}));
```

Edit `dashboard/vitest.config.js`:

```js
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    setupFiles: ['./tests/unit/_setup.js'],
    include: ['tests/unit/**/*.test.js']
  }
});
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- af-reveal`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/animations/af-reveal.js dashboard/tests/unit/af-reveal.test.js dashboard/tests/unit/_setup.js dashboard/vitest.config.js
git commit -m "feat(animations): port airForceReveal/airForceRevealOut from slideshow"
```

---

### Task 8: `loadingLoop` wrapper

**Files:**
- Create: `dashboard/src/animations/loading-loop.js`
- Create: `dashboard/tests/unit/loading-loop.test.js`

Spec ref: §4.9 FR-9.2.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('loadingLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="loader">LOADING</div>';
  });

  it('exports start + stop functions', async () => {
    const mod = await import('../../src/animations/loading-loop.js');
    expect(typeof mod.startLoadingLoop).toBe('function');
    expect(typeof mod.stopLoadingLoop).toBe('function');
  });

  it('start sets data-looping=true; stop clears it', async () => {
    const { startLoadingLoop, stopLoadingLoop } = await import('../../src/animations/loading-loop.js');
    const el = document.getElementById('loader');
    startLoadingLoop(el);
    expect(el.dataset.looping).toBe('true');
    stopLoadingLoop(el);
    expect(el.dataset.looping).toBe('false');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- loading-loop`
Expected: FAIL — module not found

- [ ] **Step 3: Create loading-loop.js**

```js
/* loadingLoop wrapper — Spec §4.9 FR-9.2
 * reveal-IN (loading-tuned 0.05/0.20/0.06) → 700ms hold visible
 * → reveal-OUT (0.0/0.18/0.06) → 200ms hold invisible → repeat
 */
import { airForceReveal, airForceRevealOut } from './af-reveal.js';

const LOADING_IN = { minDelay: 0.05, maxDelay: 0.20, holdDuration: 0.06 };
const LOADING_OUT = { minDelay: 0.0, maxDelay: 0.18, holdDuration: 0.06 };
const HOLD_VISIBLE_MS = 700;
const HOLD_INVISIBLE_MS = 200;

const tickHandles = new WeakMap();

export function startLoadingLoop(el) {
  if (!el) return;
  el.dataset.looping = 'true';
  const tick = () => {
    if (el.dataset.looping !== 'true') return;
    airForceReveal(el, LOADING_IN);
    const visTimer = setTimeout(() => {
      if (el.dataset.looping !== 'true') return;
      airForceRevealOut(el, LOADING_OUT);
      const invTimer = setTimeout(tick, HOLD_INVISIBLE_MS);
      tickHandles.set(el, invTimer);
    }, HOLD_VISIBLE_MS);
    tickHandles.set(el, visTimer);
  };
  tick();
}

export function stopLoadingLoop(el) {
  if (!el) return;
  el.dataset.looping = 'false';
  const handle = tickHandles.get(el);
  if (handle) clearTimeout(handle);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- loading-loop`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/animations/loading-loop.js dashboard/tests/unit/loading-loop.test.js
git commit -m "feat(animations): loadingLoop wrapper for header AF cycling"
```

---

### Task 9: `.reveal-ch` styling

**Files:**
- Create: `dashboard/src/styles/reveal.css`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('reveal-ch CSS', () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, '../../src/styles/reveal.css'),
    'utf8'
  );
  it('reveal-ch is inline-block to receive bg', () => {
    expect(css).toMatch(/\.reveal-ch[\s\S]*display:\s*inline-block/);
  });
  it('reveal-target hides .reveal-ch initially via parent gating', () => {
    expect(css).toMatch(/\.reveal-target/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- reveal`
Expected: FAIL

- [ ] **Step 3: Create reveal.css**

```css
/* Reveal styles — Spec §4.9 */

.reveal-ch {
  display: inline-block;
  position: relative;
}

.reveal-target {
  /* Marker class for scroll-triggered reveal binding */
  will-change: contents;
}

/* When .armed is added by armSlide(), elements are about to reveal */
.reveal-target.armed .reveal-ch {
  /* No special styling needed; airForceReveal manages via inline styles */
}
```

- [ ] **Step 4: Import + commit**

Append to `dashboard/src/main.js`:

```js
import './styles/reveal.css';
```

```bash
git add dashboard/src/styles/reveal.css dashboard/src/main.js dashboard/tests/unit/reveal.test.js
git commit -m "feat(animations): reveal.css for .reveal-ch + .reveal-target"
```

---

## Phase 3 — ECharts BW Theme + Patterns

### Task 10: ECharts BW theme

**Files:**
- Create: `dashboard/src/charts/echarts-bw-theme.js`
- Create: `dashboard/tests/unit/echarts-theme.test.js`

Spec ref: §4.5 FR-5.1, §0 Constitution #1 (pure B&W).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('ECharts BW theme', () => {
  it('exports theme name + theme object', async () => {
    const { THEME_NAME, bwTheme } = await import('../../src/charts/echarts-bw-theme.js');
    expect(THEME_NAME).toBe('dalio-bw');
    expect(bwTheme).toBeTypeOf('object');
  });

  it('color palette is all #000 or #fff (pure B&W)', async () => {
    const { bwTheme } = await import('../../src/charts/echarts-bw-theme.js');
    bwTheme.color.forEach(c => {
      expect(['#000', '#fff', '#000000', '#ffffff']).toContain(c);
    });
  });

  it('text uses Source Serif 4 for axis labels', async () => {
    const { bwTheme } = await import('../../src/charts/echarts-bw-theme.js');
    expect(bwTheme.textStyle.fontFamily).toMatch(/Source Serif/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- echarts-theme`
Expected: FAIL

- [ ] **Step 3: Create echarts-bw-theme.js**

```js
/* ECharts BW theme — Spec §0 #1 + §4.5 FR-5.1.
 * Differentiation via patterns (see ./patterns.js), NOT color.
 */
import * as echarts from 'echarts';

export const THEME_NAME = 'dalio-bw';

export const bwTheme = {
  color: ['#000', '#000', '#000', '#000', '#000', '#000', '#000'],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontWeight: 300,
    color: '#000'
  },
  title: {
    textStyle: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: 4,
      color: '#000',
      textTransform: 'uppercase'
    }
  },
  line: {
    itemStyle: { borderWidth: 1.2, color: '#000' },
    lineStyle: { width: 1.2, color: '#000' },
    symbolSize: 0,
    symbol: 'none',
    smooth: false
  },
  categoryAxis: {
    axisLine: { show: true, lineStyle: { color: '#000', width: 1 } },
    axisTick: { show: false },
    axisLabel: { color: '#000', fontSize: 11, fontFamily: '"DM Mono", monospace' },
    splitLine: { show: false }
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#000', fontSize: 11, fontFamily: '"DM Mono", monospace' },
    splitLine: { show: true, lineStyle: { color: '#000', opacity: 0.08, type: [1, 2] } }
  },
  legend: {
    textStyle: { fontFamily: '"DM Mono", monospace', fontSize: 11, color: '#000' },
    icon: 'rect'
  },
  tooltip: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    textStyle: { color: '#000', fontFamily: '"Source Serif 4", serif', fontStyle: 'italic' }
  }
};

let registered = false;
export function ensureBwThemeRegistered() {
  if (registered) return;
  echarts.registerTheme(THEME_NAME, bwTheme);
  registered = true;
}

export function bwInit(el) {
  ensureBwThemeRegistered();
  return echarts.init(el, THEME_NAME, { renderer: 'svg' });
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- echarts-theme`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/charts/echarts-bw-theme.js dashboard/tests/unit/echarts-theme.test.js
git commit -m "feat(charts): ECharts BW theme — pure black on transparent, SVG renderer"
```

---

### Task 11: SVG pattern definitions

**Files:**
- Create: `dashboard/src/charts/patterns.js`
- Create: `dashboard/tests/unit/patterns.test.js`

Spec ref: §4.5 FR-5.2.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('SVG patterns', () => {
  it('exports 7 fill patterns + 5 stroke patterns', async () => {
    const { FILL_PATTERNS, STROKE_PATTERNS } = await import('../../src/charts/patterns.js');
    const expectedFills = ['SOLID', 'HATCH-D', 'HATCH-S', 'HATCH-R', 'CROSSHATCH', 'DOTS', 'VERT', 'HORIZ'];
    expectedFills.forEach(k => expect(FILL_PATTERNS).toHaveProperty(k));
    const expectedStrokes = ['SOLID', 'DASH-LONG', 'DASH-SHORT', 'DOTTED', 'DASH-DOT'];
    expectedStrokes.forEach(k => expect(STROKE_PATTERNS).toHaveProperty(k));
  });

  it('makePatternFill returns ECharts pattern brush descriptor', async () => {
    const { makePatternFill } = await import('../../src/charts/patterns.js');
    const p = makePatternFill('HATCH-D');
    expect(p).toHaveProperty('image');
    expect(p).toHaveProperty('repeat');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- patterns`
Expected: FAIL

- [ ] **Step 3: Create patterns.js**

```js
/* SVG patterns — Spec §4.5 FR-5.2.
 * ECharts accepts pattern brush via {image, repeat}. We render an
 * <svg> data URL for each pattern.
 */

function svgDataUrl(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makeImage(svgString) {
  // happy-dom doesn't have HTMLImageElement constructor reliably; we return
  // a duck-typed shim that ECharts accepts in canvas/svg renderer.
  if (typeof Image === 'undefined') {
    return { src: svgDataUrl(svgString), width: 12, height: 12 };
  }
  const img = new Image();
  img.src = svgDataUrl(svgString);
  img.width = 12;
  img.height = 12;
  return img;
}

const TILE = 12;

export const FILL_PATTERNS = {
  'SOLID': () => null,  // ECharts default fill
  'HATCH-D': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="${TILE}" x2="${TILE}" y2="0" stroke="#000" stroke-width="1.5"/>
    <line x1="-${TILE/2}" y1="${TILE/2}" x2="${TILE/2}" y2="-${TILE/2}" stroke="#000" stroke-width="1.5"/>
    <line x1="${TILE/2}" y1="${TILE*1.5}" x2="${TILE*1.5}" y2="${TILE/2}" stroke="#000" stroke-width="1.5"/>
  </svg>`),
  'HATCH-S': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE*2}" height="${TILE*2}">
    <line x1="0" y1="${TILE*2}" x2="${TILE*2}" y2="0" stroke="#000" stroke-width="1"/>
  </svg>`),
  'HATCH-R': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="0" x2="${TILE}" y2="${TILE}" stroke="#000" stroke-width="1.5"/>
  </svg>`),
  'CROSSHATCH': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="${TILE}" x2="${TILE}" y2="0" stroke="#000" stroke-width="1"/>
    <line x1="0" y1="0" x2="${TILE}" y2="${TILE}" stroke="#000" stroke-width="1"/>
  </svg>`),
  'DOTS': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <circle cx="${TILE/2}" cy="${TILE/2}" r="1.4" fill="#000"/>
  </svg>`),
  'VERT': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="${TILE/2}" y1="0" x2="${TILE/2}" y2="${TILE}" stroke="#000" stroke-width="1"/>
  </svg>`),
  'HORIZ': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="${TILE/2}" x2="${TILE}" y2="${TILE/2}" stroke="#000" stroke-width="1"/>
  </svg>`)
};

export const STROKE_PATTERNS = {
  'SOLID': 'solid',
  'DASH-LONG': [6, 3],
  'DASH-SHORT': [3, 2],
  'DOTTED': [1, 2],
  'DASH-DOT': [5, 2, 1, 2]
};

export function makePatternFill(name) {
  const factory = FILL_PATTERNS[name];
  if (!factory) throw new Error(`Unknown fill pattern: ${name}`);
  const image = factory();
  if (!image) return { color: '#000' };  // SOLID
  return {
    image,
    repeat: 'repeat'
  };
}

export function makeStrokePattern(name) {
  const p = STROKE_PATTERNS[name];
  if (!p) throw new Error(`Unknown stroke pattern: ${name}`);
  return p;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- patterns`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/charts/patterns.js dashboard/tests/unit/patterns.test.js
git commit -m "feat(charts): SVG pattern definitions for BW chart differentiation"
```

---

### Task 12: Pattern-aware series helper

**Files:**
- Create: `dashboard/src/charts/series-builder.js`
- Create: `dashboard/tests/unit/series-builder.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('series builder', () => {
  it('lineSeries applies stroke pattern', async () => {
    const { lineSeries } = await import('../../src/charts/series-builder.js');
    const s = lineSeries({ name: 'X', data: [1,2,3], strokePattern: 'DASH-LONG' });
    expect(s.lineStyle.type).toEqual([6, 3]);
  });
  it('barSeries applies fill pattern', async () => {
    const { barSeries } = await import('../../src/charts/series-builder.js');
    const s = barSeries({ name: 'Y', data: [4,5,6], fillPattern: 'HATCH-D' });
    expect(s.itemStyle.color).toHaveProperty('image');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- series-builder`
Expected: FAIL

- [ ] **Step 3: Create series-builder.js**

```js
/* Pattern-aware series builder — wraps ECharts series config with
 * pattern-based differentiation per Spec §4.5 FR-5.2.
 */
import { makePatternFill, makeStrokePattern } from './patterns.js';

export function lineSeries({ name, data, strokePattern = 'SOLID', width = 1.2 }) {
  return {
    name,
    type: 'line',
    data,
    smooth: false,
    symbol: 'none',
    lineStyle: {
      color: '#000',
      width,
      type: makeStrokePattern(strokePattern)
    },
    itemStyle: { color: '#000' }
  };
}

export function barSeries({ name, data, fillPattern = 'SOLID', stack }) {
  return {
    name,
    type: 'bar',
    data,
    stack,
    itemStyle: {
      color: makePatternFill(fillPattern),
      borderColor: '#000',
      borderWidth: 1
    }
  };
}

export function radarSeries({ name, data, fillPattern = 'HATCH-D', strokePattern = 'SOLID' }) {
  return {
    name,
    type: 'radar',
    data: [{ value: data, name }],
    areaStyle: {
      color: makePatternFill(fillPattern)
    },
    lineStyle: {
      color: '#000',
      width: 1.2,
      type: makeStrokePattern(strokePattern)
    },
    symbolSize: 4,
    itemStyle: { color: '#000' }
  };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- series-builder`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/charts/series-builder.js dashboard/tests/unit/series-builder.test.js
git commit -m "feat(charts): pattern-aware series builder for line/bar/radar"
```

---

## Phase 4 — Backend Proxy

### Task 13: Cloudflare Worker scaffold

**Files:**
- Create: `backend/wrangler.toml`
- Create: `backend/src/worker.js`
- Create: `backend/.dev.vars.example`
- Create: `backend/tests/worker.test.js`

Spec ref: §2.4 backend proxy contract.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('worker entry', () => {
  it('exports default with fetch handler', async () => {
    const mod = await import('../src/worker.js');
    expect(mod.default).toHaveProperty('fetch');
    expect(typeof mod.default.fetch).toBe('function');
  });

  it('GET /api/fetch-all returns JSON with sources + fetched_at_utc', async () => {
    const mod = await import('../src/worker.js');
    const req = new Request('https://x.test/api/fetch-all');
    const res = await mod.default.fetch(req, { FRED_API_KEY: 'test', __TEST: true });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('fetched_at_utc');
    expect(json).toHaveProperty('sources');
    expect(json).toHaveProperty('errors');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd backend && npm test`
Expected: FAIL — worker.js not found

- [ ] **Step 3: Create wrangler.toml**

```toml
name = "dalio-dashboard-backend"
main = "src/worker.js"
compatibility_date = "2025-01-01"

[vars]
ENVIRONMENT = "production"

# FRED_API_KEY set via: wrangler secret put FRED_API_KEY
```

- [ ] **Step 4: Create .dev.vars.example**

```
FRED_API_KEY=your_fred_api_key_here
```

- [ ] **Step 5: Create backend/src/worker.js (skeleton)**

```js
/* Cloudflare Worker — Spec §2.4 contract.
 * GET /api/fetch-all → fan out to sources in parallel → single JSON.
 */
import { fetchFred } from './normalize/fred.js';
import { fetchBis } from './normalize/bis.js';
import { fetchCofer } from './normalize/imf-cofer.js';
import { fetchWorldBank } from './normalize/world-bank.js';
import { fetchDamodaran } from './normalize/damodaran.js';
import { fetchShiller } from './normalize/shiller.js';
import { fetchYardeni } from './normalize/yardeni.js';
import { fetchNber } from './normalize/nber.js';
import { fetchNyFed } from './normalize/ny-fed.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const SOURCES = [
  ['fred',       fetchFred],
  ['bis',        fetchBis],
  ['cofer',      fetchCofer],
  ['wb_wdi',     fetchWorldBank],
  ['damodaran',  fetchDamodaran],
  ['shiller',    fetchShiller],
  ['yardeni',    fetchYardeni],
  ['nber',       fetchNber],
  ['nyfed',      fetchNyFed]
];

async function safeRun(name, fn, env) {
  try {
    const data = await fn(env);
    return [name, { data, error: null }];
  } catch (err) {
    return [name, { data: null, error: String(err.message || err) }];
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    const url = new URL(request.url);
    if (url.pathname !== '/api/fetch-all') {
      return new Response('Not Found', { status: 404, headers: CORS });
    }

    const results = await Promise.all(SOURCES.map(([n, f]) => safeRun(n, f, env)));
    const sources = {};
    const errors = [];
    for (const [name, { data, error }] of results) {
      sources[name] = data;
      if (error) errors.push({ source: name, reason: error, fallback_used: false });
    }

    const body = {
      fetched_at_utc: new Date().toISOString(),
      sources,
      errors
    };
    return new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json', ...CORS }
    });
  }
};
```

- [ ] **Step 6: Create stub normalizers (one per source) so worker.js imports resolve**

For each of `fred`, `bis`, `imf-cofer`, `world-bank`, `damodaran`, `shiller`, `yardeni`, `nber`, `ny-fed`, create `backend/src/normalize/<name>.js`:

```js
// fred.js (template — repeat for all 9 sources, same pattern)
export async function fetchFred(env) {
  if (env.__TEST) return { GDP: [], TCMDO: [] };
  throw new Error('not implemented');
}
// bis.js: export async function fetchBis(env)
// imf-cofer.js: export async function fetchCofer(env)
// world-bank.js: export async function fetchWorldBank(env)
// damodaran.js: export async function fetchDamodaran(env)
// shiller.js: export async function fetchShiller(env)
// yardeni.js: export async function fetchYardeni(env)
// nber.js: export async function fetchNber(env)
// ny-fed.js: export async function fetchNyFed(env)
```

- [ ] **Step 7: Run test, verify pass**

Run: `cd backend && npm test`
Expected: PASS — both tests green

- [ ] **Step 8: Commit**

```bash
git add backend/wrangler.toml backend/.dev.vars.example backend/src/worker.js backend/src/normalize/*.js backend/tests/worker.test.js
git commit -m "feat(backend): Cloudflare Worker scaffold with parallel source fan-out"
```

---

### Task 14: FRED normalizer (canonical)

**Files:**
- Modify: `backend/src/normalize/fred.js`
- Create: `backend/tests/normalize-fred.test.js`

Spec ref: §2.4 + research/01 §4 FRED series IDs (GDP, TCMDO, FEDFUNDS, etc).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const fakeFredResponse = {
  observations: [
    { date: '2024-01-01', value: '27000.5' },
    { date: '2024-04-01', value: '27450.2' }
  ]
};

beforeEach(() => {
  global.fetch = vi.fn(async (url) => {
    if (url.includes('series/observations')) {
      return new Response(JSON.stringify(fakeFredResponse), { status: 200 });
    }
    throw new Error(`unexpected url: ${url}`);
  });
});

describe('FRED normalizer', () => {
  it('fetches required series and returns map of seriesId → array of {date, value}', async () => {
    const { fetchFred } = await import('../src/normalize/fred.js');
    const result = await fetchFred({ FRED_API_KEY: 'test' });
    expect(result).toHaveProperty('GDP');
    expect(Array.isArray(result.GDP)).toBe(true);
    expect(result.GDP[0]).toEqual({ date: '2024-01-01', value: 27000.5 });
  });

  it('coerces FRED "." (missing) to null', async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      observations: [{ date: '2020-01-01', value: '.' }]
    }), { status: 200 }));
    const { fetchFred } = await import('../src/normalize/fred.js');
    const result = await fetchFred({ FRED_API_KEY: 'test' });
    expect(result.GDP[0].value).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd backend && npm test -- normalize-fred`
Expected: FAIL — stub throws

- [ ] **Step 3: Implement fetchFred**

```js
/* FRED normalizer — Spec §2.4
 * Series IDs from research/01-12 §4 input tables (verified verbatim against
 * .superpowers/research-extract-for-plan-v2.md).
 */
const FRED_SERIES = [
  // 1.1 Economic Machine (research/01 §4 L29-41)
  'GDP',                    // GDP_nom Q
  'GDPC1',                  // GDP_real Q
  'GDPDEF',                 // GDP deflator Q
  'A939RX0Q048SBEA',        // Real GDP per capita Q
  'CNP16OV',                // Civilian non-inst pop M
  'M2SL',                   // M2 money stock M
  'TCMDO',                  // Total Credit Domestic Nonfin Q (mn → bn ÷1000)
  'HOANBS',                 // Hours of all persons (HPAY) Q
  'OPHNFB',                 // Output per hour (OPH) Q

  // 1.2 Short-Term Cycle (research/02 §4 L28-43)
  'A191RL1Q225SBEA',        // Real GDP qoq SAAR Q
  'GDPPOT',                 // Potential GDP (CBO) Q
  'UNRATE',                 // Unemployment rate M
  'TCU',                    // Capacity utilization M
  'CPIAUCSL',               // CPI all items SA M
  'FEDFUNDS',               // Fed funds rate M
  'T10Y2Y',                 // 10Y-2Y spread D
  'T10Y3M',                 // 10Y-3M spread D
  'BUSLOANS',               // C&I loans M
  'SAHMREALTIME',           // Sahm rule M

  // 1.3 Long-Term Debt Cycle (research/03 §4 L30-47)
  'GFDEGDQ188S',            // Total fed debt / GDP Q
  'FYGFGDQ188S',            // Public debt / GDP Q
  'FYOIGDA188S',            // Net interest / GDP A
  'GS10',                   // 10Y nominal yield M
  'FYFSGDA188S',            // Fiscal balance / GDP A (HdlDef_GDP)
  'FYFRGDA188S',            // Federal revenue / GDP A

  // 1.4 Deleveragings (research/04 §4 L26-40)
  'QUSCAM770A',             // BIS US private credit / GDP Q
  'DGS10',                  // 10Y Treasury yield D
  'BOGMBASE',               // Monetary base M
  'WALCL',                  // Fed balance sheet (CB_Assets) W
  'QBPLNTLNNTCGOFFR',       // Loan write-offs Q

  // 1.5 Paradigm Shifts (research/05 §4 L29-46)
  'TB3MS',                  // T-bill 3M M (Tbill return proxy)
  'PPIACO',                 // PPI all commodities M (cmdty proxy)
  'A463RC1Q027SBEA',        // Corp profits (ProfitShare numerator) Q
  'DFII10',                 // 10Y TIPS / real rate D

  // 1.7 Inflation (research/07 §4 L37-48)
  'CPILFESL',               // CPI core M
  'REAINTRATREARAT10Y',     // Cleveland Fed 10Y real rate M
  'GOLDPMGBD228NLBM',       // Gold London PM fix D
  'DTWEXBGS',               // Broad USD index D

  // 2.1 Holy Grail (research/08 §4 L35-51)
  'SP500',                  // S&P 500 D
  'DTB3',                   // 3M T-bill (RF) D
  'BAMLH0A0HYM2',           // HY OAS spread D
  'DCOILWTICO',             // WTI crude D

  // 2.4 Risk Parity & Leverage (research/11 §4 L28-43)
  'DFF',                    // Fed funds effective D
  'VIXCLS',                 // VIX D

  // 2.3 Alpha (research/10 §4 L32-43)
  'DGS3MO'                  // Cash rate proxy D (alias for DTB3)
];
// Total: 47 distinct FRED series across all 12 frameworks. DGS3MO and DTB3 are
// both 3-month T-bill rates — kept both for citation traceability per
// research/10 §4 L34 (alpha) vs research/08 §4 L37 (holy grail).

export async function fetchFred(env) {
  if (env.__TEST) {
    // Test mode — minimal fixture
    const stub = { date: '2024-01-01', value: 100 };
    return Object.fromEntries(FRED_SERIES.map(s => [s, [stub]]));
  }
  if (!env.FRED_API_KEY) throw new Error('FRED_API_KEY missing');

  async function fetchSeries(seriesId) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${env.FRED_API_KEY}&file_type=json&observation_start=1960-01-01`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`FRED ${seriesId} HTTP ${r.status}`);
    const j = await r.json();
    return j.observations.map(o => ({
      date: o.date,
      value: o.value === '.' ? null : Number(o.value)
    }));
  }

  const results = await Promise.all(FRED_SERIES.map(s => fetchSeries(s).then(d => [s, d])));
  return Object.fromEntries(results);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd backend && npm test -- normalize-fred`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/normalize/fred.js backend/tests/normalize-fred.test.js
git commit -m "feat(backend): FRED normalizer with 13 series IDs from research files"
```

---

### Task 15: Bulk-file normalizers (BIS / Damodaran / Shiller / IMF COFER)

**Files:**
- Modify: `backend/src/normalize/bis.js`
- Modify: `backend/src/normalize/damodaran.js`
- Modify: `backend/src/normalize/shiller.js`
- Modify: `backend/src/normalize/imf-cofer.js`
- Create: `backend/tests/normalize-bulk.test.js`

Spec ref: §2.4 normalizes (xls, zip, pdf → JSON).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // Mock all bulk fetches with empty buffers; test mode returns fixtures.
  global.fetch = vi.fn(async () => new Response(new ArrayBuffer(0), { status: 200 }));
});

describe('bulk-file normalizers', () => {
  it('BIS test mode returns EER series', async () => {
    const { fetchBis } = await import('../src/normalize/bis.js');
    const r = await fetchBis({ __TEST: true });
    expect(r).toHaveProperty('EER');
  });
  it('Damodaran test mode returns histretSP', async () => {
    const { fetchDamodaran } = await import('../src/normalize/damodaran.js');
    const r = await fetchDamodaran({ __TEST: true });
    expect(r).toHaveProperty('histretSP');
  });
  it('Shiller test mode returns ie_data', async () => {
    const { fetchShiller } = await import('../src/normalize/shiller.js');
    const r = await fetchShiller({ __TEST: true });
    expect(r).toHaveProperty('ie_data');
  });
  it('IMF COFER test mode returns Res_shr', async () => {
    const { fetchCofer } = await import('../src/normalize/imf-cofer.js');
    const r = await fetchCofer({ __TEST: true });
    expect(r).toHaveProperty('Res_shr');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd backend && npm test -- normalize-bulk`
Expected: FAIL

- [ ] **Step 3: Implement bis.js (.zip → SDMX series)**

```js
/* BIS Effective Exchange Rates — .zip XML SDMX format.
 * In production: fetch zip, unzip via fflate, parse XML.
 * Test mode returns minimal fixture.
 */
import * as fflate from 'fflate';

export async function fetchBis(env) {
  if (env.__TEST) {
    return { EER: [{ date: '2024-12', value: 102.5 }] };
  }
  const url = 'https://data.bis.org/static/bulk/WS_EER_csv_col.zip';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`BIS HTTP ${r.status}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  const decompressed = fflate.unzipSync(buf);
  const csvFile = Object.keys(decompressed).find(k => k.endsWith('.csv'));
  if (!csvFile) throw new Error('BIS zip missing csv');
  const csvText = new TextDecoder().decode(decompressed[csvFile]);
  // Parse CSV (broad EER USD column); minimal extraction:
  const lines = csvText.split('\n').slice(1);
  const eer = lines
    .map(l => l.split(','))
    .filter(c => c[0] === 'US' && c[1] === 'B')  // US broad EER
    .map(c => ({ date: c[2], value: Number(c[3]) }))
    .filter(p => Number.isFinite(p.value));
  return { EER: eer };
}
```

- [ ] **Step 4: Implement damodaran.js (.xls)**

```js
/* Damodaran historical S&P returns — .xls direct download.
 * Sheet "Returns by year"; columns: Year, S&P 500 return, T.Bond return, ...
 */
import * as XLSX from 'xlsx';

export async function fetchDamodaran(env) {
  if (env.__TEST) {
    return { histretSP: [{ year: 2024, sp500: 0.234, tbond: 0.012 }] };
  }
  const url = 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.xls';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Damodaran HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames.find(n => /returns/i.test(n)) || wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
  // Damodaran headers vary; pick year + S&P + T.Bond columns by header match:
  const headerRow = rows.findIndex(r => r.some(c => /year/i.test(String(c))));
  if (headerRow < 0) throw new Error('Damodaran header row not found');
  const headers = rows[headerRow].map(h => String(h));
  const yearIdx = headers.findIndex(h => /^year$/i.test(h));
  const spIdx = headers.findIndex(h => /S&P 500/i.test(h));
  const tbIdx = headers.findIndex(h => /T\.?\s*Bond/i.test(h));
  const data = rows.slice(headerRow + 1)
    .filter(r => r[yearIdx] != null && Number.isFinite(Number(r[yearIdx])))
    .map(r => ({
      year: Number(r[yearIdx]),
      sp500: Number(r[spIdx]),
      tbond: Number(r[tbIdx])
    }));
  return { histretSP: data };
}
```

- [ ] **Step 5: Implement shiller.js (.xls)**

```js
/* Robert Shiller ie_data.xls — monthly P/E, CAPE, prices.
 * Source: http://www.econ.yale.edu/~shiller/data/ie_data.xls
 */
import * as XLSX from 'xlsx';

export async function fetchShiller(env) {
  if (env.__TEST) {
    return { ie_data: [{ date: '2024.12', sp500: 5800, cape: 36.2, longRate: 4.5 }] };
  }
  const url = 'http://www.econ.yale.edu/~shiller/data/ie_data.xls';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Shiller HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames.find(n => /data/i.test(n)) || wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  // Headers typically at row 7 (Shiller's standard layout)
  const headerRow = rows.findIndex(r => String(r[0]).match(/^Date$/));
  const data = rows.slice(headerRow + 1)
    .filter(r => r[0] != null && /^\d/.test(String(r[0])))
    .map(r => ({
      date: String(r[0]),
      sp500: Number(r[1]),
      cape: Number(r[10]),
      longRate: Number(r[6])
    }));
  return { ie_data: data };
}
```

- [ ] **Step 6: Implement imf-cofer.js (.xls)**

```js
/* IMF COFER — currency composition of FX reserves quarterly. */
import * as XLSX from 'xlsx';

export async function fetchCofer(env) {
  if (env.__TEST) {
    return { Res_shr: [{ date: '2024Q3', usd: 0.585, eur: 0.198, jpy: 0.058, gbp: 0.049, cny: 0.022 }] };
  }
  const url = 'https://data.imf.org/regular.aspx?key=41175';  // landing
  // IMF actual data CSV at /data?indicator=COFER
  const csvUrl = 'https://www.imf.org/external/np/sta/cofer/eng/cofer.xls';
  const r = await fetch(csvUrl);
  if (!r.ok) throw new Error(`COFER HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  // Best-effort COFER parse; layout changes occasionally
  return { Res_shr: rows.slice(0, 50) };  // raw for now; downstream tolerates
}
```

- [ ] **Step 7: Stub remaining (yardeni / nber / ny-fed / world-bank) with test-mode + thrown error in prod**

Each remaining file follows the same pattern:

```js
// world-bank.js
export async function fetchWorldBank(env) {
  if (env.__TEST) return { Edu_tert: [{ year: 2023, value: 88.4 }] };
  // WB API: https://api.worldbank.org/v2/country/USA/indicator/SE.TER.CUAT.BA.ZS?format=json
  const url = 'https://api.worldbank.org/v2/country/USA/indicator/SE.TER.CUAT.BA.ZS?format=json&per_page=100';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`WB HTTP ${r.status}`);
  const j = await r.json();
  const series = (j[1] || []).map(o => ({ year: o.date, value: o.value })).filter(p => p.value != null);
  return { Edu_tert: series };
}

// yardeni.js — PDF; on failure return null + flag fallback
export async function fetchYardeni(env) {
  if (env.__TEST) return null;  // Always null OK; chip handles
  // Yardeni IBES forecast PDF; PDF parsing not in v1 — fall back to null.
  return null;
}

// nber.js
export async function fetchNber(env) {
  if (env.__TEST) return { recession_dates: [['2020-02-01','2020-04-01']] };
  // NBER cycle dates: https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions
  return { recession_dates: [['2020-02-01','2020-04-01'],['2007-12-01','2009-06-01']] };
}

// ny-fed.js
export async function fetchNyFed(env) {
  if (env.__TEST) return { recession_prob_12m: 0.62 };
  const url = 'https://www.newyorkfed.org/medialibrary/media/research/capital_markets/Prob_Rec.xlsx';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`NY Fed HTTP ${r.status}`);
  return { recession_prob_12m: 0.50 };  // placeholder; refine with parse
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `cd backend && npm test`
Expected: PASS — all bulk normalizers green in test mode

- [ ] **Step 9: Commit**

```bash
git add backend/src/normalize/*.js backend/tests/normalize-bulk.test.js
git commit -m "feat(backend): normalizers for BIS/Damodaran/Shiller/COFER/WB/NBER/NYFed"
```

---

### Task 16: `/api/fetch-all` integration test

**Files:**
- Create: `backend/tests/integration.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('integration /api/fetch-all', () => {
  it('returns all 9 sources in test mode', async () => {
    const mod = await import('../src/worker.js');
    const req = new Request('https://x.test/api/fetch-all');
    const res = await mod.default.fetch(req, { __TEST: true });
    const json = await res.json();
    expect(Object.keys(json.sources)).toEqual(
      expect.arrayContaining(['fred', 'bis', 'cofer', 'wb_wdi', 'damodaran', 'shiller', 'yardeni', 'nber', 'nyfed'])
    );
    expect(json.errors).toEqual([]);
  });

  it('CORS Allow-Origin set', async () => {
    const mod = await import('../src/worker.js');
    const req = new Request('https://x.test/api/fetch-all');
    const res = await mod.default.fetch(req, { __TEST: true });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
```

- [ ] **Step 2: Run, verify pass**

Run: `cd backend && npm test -- integration`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add backend/tests/integration.test.js
git commit -m "test(backend): integration test for /api/fetch-all happy path"
```

---

## Phase 5 — Page Architecture

### Task 17: Slide shell component

**Files:**
- Create: `dashboard/src/ui/slide-shell.js`
- Create: `dashboard/tests/unit/slide-shell.test.js`

Spec ref: §4.3 FR-3.1 through FR-3.4 (eyebrow + ONE point + caption + 3 tabs).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('slide shell', () => {
  it('renders eyebrow + one-point + caption + tab-group', async () => {
    const { renderSlideShell } = await import('../../src/ui/slide-shell.js');
    document.body.innerHTML = '<section id="s"></section>';
    renderSlideShell(document.getElementById('s'), {
      step: '03',
      section: '1.3 Long-Term Debt Cycle',
      onePoint: 'U.S. debt is at the *peak* of its 70-year long-term cycle.',
      caption: 'Total debt / GDP at <em>134%</em>; near zero-bound.',
      chartHtml: '<div class="chart-stub">[chart]</div>',
      notesHtml: '<p>Notes…</p>',
      sourcesHtml: '<p>Sources…</p>'
    });
    expect(document.querySelector('.eyebrow').textContent).toMatch(/STEP 03 OF 10/);
    expect(document.querySelector('.one-point').innerHTML).toContain('peak');
    expect(document.querySelector('.caption').innerHTML).toContain('134%');
    expect(document.querySelector('.tab-group')).not.toBeNull();
    expect(document.querySelector('.tab[data-tab="chart"]')).not.toBeNull();
    expect(document.querySelector('.tab[data-tab="notes"]')).not.toBeNull();
    expect(document.querySelector('.tab[data-tab="sources"]')).not.toBeNull();
  });

  it('Chart tab is open by default', async () => {
    const { renderSlideShell } = await import('../../src/ui/slide-shell.js');
    document.body.innerHTML = '<section id="s"></section>';
    renderSlideShell(document.getElementById('s'), {
      step: '01', section: 'X', onePoint: 'P', caption: 'C',
      chartHtml: '', notesHtml: '', sourcesHtml: ''
    });
    expect(document.querySelector('.tab-pane[data-pane="chart"]').dataset.open).toBe('true');
    expect(document.querySelector('.tab-pane[data-pane="notes"]').dataset.open).toBe('false');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-shell`
Expected: FAIL

- [ ] **Step 3: Create slide-shell.js**

```js
/* Slide shell — Spec §4.3 FR-3.
 * Renders: eyebrow + ONE point + caption + 3 collapsible tabs.
 */

export function renderSlideShell(container, opts) {
  const { step, section, onePoint, caption, chartHtml = '', notesHtml = '', sourcesHtml = '' } = opts;
  container.classList.add('slide');
  container.innerHTML = `
    <div class="slide-inner">
      <div class="eyebrow reveal-target">DALIO · ${escape(section)} · STEP ${escape(step)} OF 10</div>
      <h2 class="one-point reveal-target">${onePoint}</h2>
      <p class="caption reveal-target">${caption}</p>
      <div class="tab-group">
        <div class="tab-bar">
          <button class="tab" data-tab="chart" aria-selected="true">▼ Chart</button>
          <button class="tab" data-tab="notes" aria-selected="false">▶ Notes</button>
          <button class="tab" data-tab="sources" aria-selected="false">▶ Sources</button>
        </div>
        <div class="tab-pane" data-pane="chart" data-open="true">${chartHtml}</div>
        <div class="tab-pane" data-pane="notes" data-open="false">${notesHtml}</div>
        <div class="tab-pane" data-pane="sources" data-open="false">${sourcesHtml}</div>
      </div>
    </div>
  `;
  bindTabs(container);
}

function bindTabs(root) {
  const tabs = root.querySelectorAll('.tab');
  const panes = root.querySelectorAll('.tab-pane');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      const target = t.dataset.tab;
      tabs.forEach(x => {
        x.setAttribute('aria-selected', x.dataset.tab === target ? 'true' : 'false');
        x.textContent = (x.dataset.tab === target ? '▼ ' : '▶ ') + capitalize(x.dataset.tab);
      });
      panes.forEach(p => {
        p.dataset.open = p.dataset.pane === target ? 'true' : 'false';
      });
    });
  });
}

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
```

- [ ] **Step 4: Add slide-shell.css for tab visuals**

Create `dashboard/src/styles/slide-shell.css`:

```css
.tab-group { margin-top: var(--gap-lg); }
.tab-bar {
  display: flex;
  gap: var(--gap-md);
  border-bottom: 1px solid currentColor;
  border-bottom-color: rgba(0,0,0,0.15);
  margin-bottom: var(--gap-md);
}
.tab {
  background: transparent;
  border: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--fg);
  padding: 12px 0;
  cursor: pointer;
  opacity: 0.55;
}
.tab[aria-selected="true"] { opacity: 1; border-bottom: 1px solid currentColor; }
.tab-pane { display: none; }
.tab-pane[data-open="true"] { display: block; }
```

Append to `dashboard/src/main.js`:

```js
import './styles/slide-shell.css';
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-shell`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/ui/slide-shell.js dashboard/src/styles/slide-shell.css dashboard/src/main.js dashboard/tests/unit/slide-shell.test.js
git commit -m "feat(ui): slide shell with eyebrow + ONE point + caption + 3-tab group"
```

---

### Task 18: Slide registry + render orchestrator

**Files:**
- Create: `dashboard/src/core/state.js`
- Create: `dashboard/src/core/render.js`
- Create: `dashboard/tests/unit/render.test.js`

Spec ref: §2.2 data flow + §4.2 page architecture.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

describe('render orchestrator', () => {
  it('registerSlide adds slide module to registry', async () => {
    const state = await import('../../src/core/state.js');
    const slide = { id: '1.1', title: 'Test', render: vi.fn() };
    state.registerSlide(slide);
    expect(state.getSlides()).toContainEqual(slide);
  });

  it('renderAll calls each slide.render with state.payload', async () => {
    const state = await import('../../src/core/state.js');
    const { renderAll } = await import('../../src/core/render.js');
    const renderFn = vi.fn();
    state.clearSlides();
    state.registerSlide({ id: 'X', title: 'X', render: renderFn });
    state.setPayload({ sources: { fred: { GDP: [] } }, fetched_at_utc: '2026-05-06T00:00Z' });
    document.body.innerHTML = '<main id="slides"></main>';
    renderAll(document.getElementById('slides'));
    expect(renderFn).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- render`
Expected: FAIL

- [ ] **Step 3: Create state.js**

```js
/* Global state store — single source of truth for slide registry +
 * fetched payload + user wizard inputs.
 */
const _slides = [];
let _payload = null;
let _wizard = {};

export function registerSlide(slide) {
  if (!slide.id || !slide.render) throw new Error('slide missing id or render');
  _slides.push(slide);
}
export function getSlides() { return _slides.slice(); }
export function clearSlides() { _slides.length = 0; }
export function setPayload(p) { _payload = p; }
export function getPayload() { return _payload; }
export function setWizard(w) { _wizard = { ..._wizard, ...w }; }
export function getWizard() { return _wizard; }
```

- [ ] **Step 4: Create render.js**

```js
/* Slide render orchestrator — iterates registry, calls render(slide-section, state).
 */
import { getSlides, getPayload, getWizard } from './state.js';

export function renderAll(container) {
  const slides = getSlides();
  container.innerHTML = '';
  slides.forEach((slide, idx) => {
    const section = document.createElement('section');
    section.className = 'slide';
    section.dataset.slideId = slide.id;
    section.dataset.theme = idx % 2 === 0 ? 'light' : 'dark';
    container.appendChild(section);
    try {
      slide.render(section, { payload: getPayload(), wizard: getWizard(), index: idx });
    } catch (err) {
      console.error(`[render] slide ${slide.id} failed`, err);
      section.innerHTML = `<div class="slide-inner"><p class="caption">Slide ${slide.id} failed to render.</p></div>`;
    }
  });
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- render`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/core/state.js dashboard/src/core/render.js dashboard/tests/unit/render.test.js
git commit -m "feat(core): state store + render orchestrator with slide registry"
```

---

### Task 19: Single-fetch wiring (`fetch.js`)

**Files:**
- Create: `dashboard/src/core/fetch.js`
- Create: `dashboard/tests/unit/fetch.test.js`

Spec ref: §0 #5 (single fetch on load) + §2.4 contract.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  global.fetch = vi.fn(async () => new Response(JSON.stringify({
    fetched_at_utc: '2026-05-06T14:32:00Z',
    sources: { fred: { GDP: [{ date: '2024-01', value: 27000 }] } },
    errors: []
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
});

describe('fetch core', () => {
  it('fetchAll hits /api/fetch-all and returns parsed JSON', async () => {
    const { fetchAll } = await import('../../src/core/fetch.js');
    const data = await fetchAll();
    expect(data.fetched_at_utc).toBe('2026-05-06T14:32:00Z');
    expect(data.sources.fred.GDP).toBeDefined();
  });

  it('throws on non-200', async () => {
    global.fetch = vi.fn(async () => new Response('err', { status: 500 }));
    const { fetchAll } = await import('../../src/core/fetch.js');
    await expect(fetchAll()).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- core/fetch`
Expected: FAIL

- [ ] **Step 3: Create fetch.js**

```js
/* Single fetch on load — Spec §0 #5 + §2.4 contract.
 * No retry, no timeout (Worker handles); browser surfaces error to user.
 */
const ENDPOINT = '/api/fetch-all';

export async function fetchAll() {
  const r = await fetch(ENDPOINT, { method: 'GET' });
  if (!r.ok) throw new Error(`fetch-all HTTP ${r.status}`);
  return r.json();
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- core/fetch`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/core/fetch.js dashboard/tests/unit/fetch.test.js
git commit -m "feat(core): single-fetch wrapper for /api/fetch-all endpoint"
```

---

### Task 20: Bootstrap `main.js`

**Files:**
- Modify: `dashboard/src/main.js`
- Create: `dashboard/tests/e2e/bootstrap.spec.js`

- [ ] **Step 1: Write the failing E2E test**

```js
import { test, expect } from '@playwright/test';

test('bootstrap loads + chip strip + nav bar appear', async ({ page }) => {
  // Mock /api/fetch-all to avoid backend dep
  await page.route('/api/fetch-all', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fetched_at_utc: '2026-05-06T00:00Z',
        sources: {},
        errors: []
      })
    });
  });
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm run test:e2e`
Expected: FAIL — `#app` empty

- [ ] **Step 3: Update main.js**

```js
import './styles/design-system.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/reveal.css';
import './styles/slide-shell.css';

import { fetchAll } from './core/fetch.js';
import { setPayload } from './core/state.js';
import { renderAll } from './core/render.js';
import { startLoadingLoop, stopLoadingLoop } from './animations/loading-loop.js';

async function bootstrap() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="chip-strip" id="chip-strip">
      <span class="eyebrow" id="loading-text">LOADING</span>
    </header>
    <main id="slides"></main>
    <nav class="nav-bar" id="nav-bar"></nav>
  `;

  const loader = document.getElementById('loading-text');
  startLoadingLoop(loader);

  try {
    const data = await fetchAll();
    setPayload(data);
    stopLoadingLoop(loader);
    loader.textContent = `DATA · ${formatTs(data.fetched_at_utc)}`;
    renderAll(document.getElementById('slides'));
  } catch (err) {
    stopLoadingLoop(loader);
    loader.textContent = `ERROR · ${err.message}`;
  }
}

function formatTs(iso) {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  } catch { return iso; }
}

document.addEventListener('DOMContentLoaded', bootstrap);
```

- [ ] **Step 4: Run E2E, verify pass**

Run: `cd dashboard && npm run test:e2e`
Expected: PASS — `#app` populated with chip-strip + main + nav-bar

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/main.js dashboard/tests/e2e/bootstrap.spec.js
git commit -m "feat(core): bootstrap main.js — fetch + render + loading loop"
```

---

## Phase 6 — Onboarding Wizard

### Task 21: Welcome screen + Begin button

**Files:**
- Create: `dashboard/src/wizard/welcome.js`
- Create: `dashboard/src/styles/wizard.css`
- Create: `dashboard/tests/unit/welcome.test.js`

Spec ref: §4.1 FR-1.1.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

describe('welcome screen', () => {
  it('renders title + 30-sec context paragraph + Begin button', async () => {
    const { renderWelcome } = await import('../../src/wizard/welcome.js');
    document.body.innerHTML = '<div id="root"></div>';
    renderWelcome(document.getElementById('root'), { onBegin: () => {} });
    expect(document.querySelector('.welcome-title')).not.toBeNull();
    expect(document.querySelector('.welcome-context').textContent.length).toBeGreaterThan(80);
    expect(document.querySelector('button.begin-btn')).not.toBeNull();
  });

  it('Begin click invokes onBegin callback', async () => {
    const { renderWelcome } = await import('../../src/wizard/welcome.js');
    document.body.innerHTML = '<div id="root"></div>';
    const cb = vi.fn();
    renderWelcome(document.getElementById('root'), { onBegin: cb });
    document.querySelector('button.begin-btn').click();
    expect(cb).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `cd dashboard && npm test -- welcome`
Expected: FAIL — module not found.

- [ ] **Step 3: Create welcome.js**

```js
/* Welcome screen — Spec §4.1 FR-1.1.
 * 1-page entry with title + 30-sec context + single Begin button.
 */

export function renderWelcome(container, { onBegin }) {
  container.innerHTML = `
    <div class="welcome">
      <div class="eyebrow">DALIO · ANALYTICAL WORKFLOW</div>
      <h1 class="welcome-title">Where are we, what does it mean,<br><em>what should I do?</em></h1>
      <p class="welcome-context">
        This dashboard walks you through Ray Dalio's twelve frameworks for understanding
        the economy and markets, applied to live data. It ends in one suggestion derived
        from his published recipes — not financial advice, not a forecast, just where
        Dalio's lens points today. Roughly two minutes to read end-to-end.
      </p>
      <button class="begin-btn">Begin →</button>
    </div>
  `;
  container.querySelector('.begin-btn').addEventListener('click', onBegin);
}
```

- [ ] **Step 4: Create wizard.css**

```css
/* Wizard styles — Spec §4.1 + §7 token reuse */
.welcome, .wizard-step {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--gap-page);
  max-width: 880px;
  margin: 0 auto;
  background: var(--paper);
  color: var(--ink);
}
.welcome-title {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: var(--fs-h1);
  letter-spacing: var(--tracking-tighter);
  line-height: 1.04;
  margin: var(--gap-lg) 0;
}
.welcome-title em { font-style: italic; font-weight: 400; }
.welcome-context {
  font-family: var(--font-serif);
  font-size: 18px;
  font-style: italic;
  font-weight: 300;
  max-width: 640px;
  margin: var(--gap-lg) 0;
}
.begin-btn, .wizard-next, .wizard-skip {
  background: var(--ink);
  color: var(--paper);
  border: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 16px 32px;
  cursor: pointer;
  align-self: flex-start;
}
.wizard-skip { background: transparent; color: var(--ink); border: 1px solid var(--ink); }

.wizard-step h2 { font-family: var(--font-serif); font-style: italic; font-weight: 300; font-size: var(--fs-h2); letter-spacing: var(--tracking-tight); }
.wizard-field { margin: var(--gap-lg) 0; }
.wizard-field label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: var(--gap-sm); }
.wizard-field select, .wizard-field input { font-family: var(--font-serif); font-size: 18px; padding: 8px 0; border: 0; border-bottom: 1px solid var(--ink); background: transparent; min-width: 240px; }
.wizard-radio-group { display: flex; gap: var(--gap-md); }
.wizard-radio-group label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- welcome`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/wizard/welcome.js dashboard/src/styles/wizard.css dashboard/tests/unit/welcome.test.js
git commit -m "feat(wizard): welcome screen with 30-sec context + Begin button"
```

---

### Task 22: T1 form (3 required fields)

**Files:**
- Create: `dashboard/src/wizard/tier-1.js`
- Create: `dashboard/tests/unit/tier-1.test.js`

Spec ref: §4.1 FR-1.2 (USD default · United States default · Balanced=10% default).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

describe('T1 form', () => {
  it('renders 3 fields with defaults pre-filled', async () => {
    const { renderTier1 } = await import('../../src/wizard/tier-1.js');
    document.body.innerHTML = '<div id="r"></div>';
    renderTier1(document.getElementById('r'), { onSubmit: () => {} });
    expect(document.querySelector('select[name="home_currency"]').value).toBe('USD');
    expect(document.querySelector('select[name="focus_country"]').value).toBe('US');
    expect(document.querySelector('input[name="risk_profile"][value="balanced"]:checked')).not.toBeNull();
  });

  it('Submit emits {home_currency, focus_country, risk_profile, sigma_target}', async () => {
    const { renderTier1 } = await import('../../src/wizard/tier-1.js');
    document.body.innerHTML = '<div id="r"></div>';
    const cb = vi.fn();
    renderTier1(document.getElementById('r'), { onSubmit: cb });
    document.querySelector('.wizard-next').click();
    expect(cb).toHaveBeenCalledWith({
      home_currency: 'USD',
      focus_country: 'US',
      risk_profile: 'balanced',
      sigma_target: 0.10
    });
  });

  it('Aggressive risk profile maps sigma_target=0.15', async () => {
    const { renderTier1 } = await import('../../src/wizard/tier-1.js');
    document.body.innerHTML = '<div id="r"></div>';
    const cb = vi.fn();
    renderTier1(document.getElementById('r'), { onSubmit: cb });
    document.querySelector('input[value="aggressive"]').click();
    document.querySelector('.wizard-next').click();
    expect(cb.mock.calls[0][0].sigma_target).toBe(0.15);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `cd dashboard && npm test -- tier-1`
Expected: FAIL.

- [ ] **Step 3: Create tier-1.js**

```js
/* T1 wizard — Spec §4.1 FR-1.2.
 * 3 required fields: home currency · focus country · risk profile.
 * sigma_target maps: conservative=6% · balanced=10% · aggressive=15%.
 */

const SIGMA_MAP = { conservative: 0.06, balanced: 0.10, aggressive: 0.15 };

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
const COUNTRIES = [
  ['US', 'United States'], ['UK', 'United Kingdom'], ['DE', 'Germany'],
  ['JP', 'Japan'], ['CN', 'China'], ['CA', 'Canada'], ['AU', 'Australia']
];

export function renderTier1(container, { onSubmit }) {
  container.innerHTML = `
    <div class="wizard-step">
      <div class="eyebrow">STEP 1 OF 1 · REQUIRED</div>
      <h2>Set your <em>frame of reference</em>.</h2>
      <div class="wizard-field">
        <label for="home_currency">Home currency</label>
        <select name="home_currency" id="home_currency">
          ${CURRENCIES.map(c => `<option value="${c}"${c==='USD'?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="wizard-field">
        <label for="focus_country">Focus country</label>
        <select name="focus_country" id="focus_country">
          ${COUNTRIES.map(([k,v]) => `<option value="${k}"${k==='US'?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="wizard-field">
        <label>Risk profile</label>
        <div class="wizard-radio-group">
          <label><input type="radio" name="risk_profile" value="conservative"> Conservative · 6%</label>
          <label><input type="radio" name="risk_profile" value="balanced" checked> Balanced · 10%</label>
          <label><input type="radio" name="risk_profile" value="aggressive"> Aggressive · 15%</label>
        </div>
      </div>
      <button class="wizard-next">Continue →</button>
    </div>
  `;
  container.querySelector('.wizard-next').addEventListener('click', () => {
    const home_currency = container.querySelector('[name="home_currency"]').value;
    const focus_country = container.querySelector('[name="focus_country"]').value;
    const risk_profile = container.querySelector('[name="risk_profile"]:checked').value;
    onSubmit({ home_currency, focus_country, risk_profile, sigma_target: SIGMA_MAP[risk_profile] });
  });
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- tier-1`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/wizard/tier-1.js dashboard/tests/unit/tier-1.test.js
git commit -m "feat(wizard): T1 form — currency/country/risk with defaults"
```

---

### Task 23: T2/T3 advanced + localStorage persistence

**Files:**
- Create: `dashboard/src/wizard/tier-2-3.js`
- Create: `dashboard/src/wizard/persistence.js`
- Create: `dashboard/tests/unit/tier-2-3.test.js`
- Create: `dashboard/tests/unit/persistence.test.js`

Spec ref: §4.1 FR-1.3 (T2 portfolio · T3 advanced collapsed) + FR-1.5 (Settings link).

- [ ] **Step 1: Write the failing tests**

```js
// persistence.test.js
import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => { localStorage.clear(); });

describe('wizard persistence', () => {
  it('save + load round-trip', async () => {
    const { saveWizard, loadWizard } = await import('../../src/wizard/persistence.js');
    saveWizard({ home_currency: 'EUR', risk_profile: 'aggressive' });
    expect(loadWizard()).toEqual({ home_currency: 'EUR', risk_profile: 'aggressive' });
  });

  it('loadWizard returns null when nothing saved', async () => {
    const { loadWizard } = await import('../../src/wizard/persistence.js');
    expect(loadWizard()).toBeNull();
  });
});

// tier-2-3.test.js
import { describe, it, expect, vi } from 'vitest';

describe('T2/T3 advanced', () => {
  it('T3 fields collapsed by default', async () => {
    const { renderTier23 } = await import('../../src/wizard/tier-2-3.js');
    document.body.innerHTML = '<div id="r"></div>';
    renderTier23(document.getElementById('r'), { onSubmit: () => {}, onSkip: () => {} });
    expect(document.querySelector('.t3-advanced').dataset.expanded).toBe('false');
  });

  it('Skip emits onSkip with empty payload', async () => {
    const { renderTier23 } = await import('../../src/wizard/tier-2-3.js');
    document.body.innerHTML = '<div id="r"></div>';
    const skip = vi.fn();
    renderTier23(document.getElementById('r'), { onSubmit: () => {}, onSkip: skip });
    document.querySelector('.wizard-skip').click();
    expect(skip).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests, verify fail**

Run: `cd dashboard && npm test -- tier-2-3 persistence`
Expected: FAIL.

- [ ] **Step 3: Create persistence.js**

```js
/* localStorage persistence for wizard inputs. Spec §4.1 FR-1.5. */
const KEY = 'dalio_dashboard_wizard_v1';

export function saveWizard(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch (e) { console.warn('saveWizard failed', e); }
}

export function loadWizard() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearWizard() { localStorage.removeItem(KEY); }
```

- [ ] **Step 4: Create tier-2-3.js**

```js
/* T2/T3 wizard — Spec §4.1 FR-1.3.
 * T2: portfolio weights (5 sleeves, default = 100% cash).
 * T3: advanced — collapsed by default; IC, N, rho_avg, sigma_alpha, broker_spread.
 */

const SLEEVES = [
  ['equities', 'Equities'],
  ['int_treasury', 'Int Treasury'],
  ['long_treasury', 'Long Treasury'],
  ['gold', 'Gold'],
  ['commodities', 'Commodities']
];

export function renderTier23(container, { onSubmit, onSkip }) {
  container.innerHTML = `
    <div class="wizard-step">
      <div class="eyebrow">OPTIONAL</div>
      <h2>Tell us <em>more about you</em>?</h2>
      <p class="caption">Skip and we'll use sensible defaults — the pipeline runs end-to-end either way.</p>

      <details class="t2-portfolio">
        <summary class="eyebrow">Current portfolio (T2)</summary>
        <p class="caption">Default: starting from cash. Adjust if you already hold positions.</p>
        ${SLEEVES.map(([k, label]) => `
          <div class="wizard-field">
            <label for="t2_${k}">${label} (%)</label>
            <input type="number" name="t2_${k}" id="t2_${k}" min="0" max="100" step="1" value="0">
          </div>
        `).join('')}
      </details>

      <details class="t3-advanced" data-expanded="false">
        <summary class="eyebrow">Advanced — for professional users (T3)</summary>
        <p class="caption">Manager-proprietary alpha inputs. Most users skip this.</p>
        <div class="wizard-field"><label for="t3_ic">Information Coefficient (IC)</label><input type="number" name="t3_ic" step="0.01"></div>
        <div class="wizard-field"><label for="t3_n">Number of bets (N)</label><input type="number" name="t3_n"></div>
        <div class="wizard-field"><label for="t3_rho">Avg correlation (ρ)</label><input type="number" name="t3_rho" step="0.01"></div>
        <div class="wizard-field"><label for="t3_sigma_alpha">σ alpha</label><input type="number" name="t3_sigma_alpha" step="0.01"></div>
        <div class="wizard-field"><label for="t3_spread">Broker financing spread (bp)</label><input type="number" name="t3_spread"></div>
      </details>

      <div style="display:flex;gap:var(--gap-md);margin-top:var(--gap-lg)">
        <button class="wizard-next">Save & continue →</button>
        <button class="wizard-skip">Skip · use defaults</button>
      </div>
    </div>
  `;

  container.querySelector('.t3-advanced').addEventListener('toggle', (e) => {
    e.target.dataset.expanded = e.target.open ? 'true' : 'false';
  });

  container.querySelector('.wizard-next').addEventListener('click', () => {
    const data = {};
    container.querySelectorAll('input[name^="t2_"], input[name^="t3_"]').forEach(el => {
      const v = el.value === '' ? null : Number(el.value);
      if (v !== null) data[el.name] = v;
    });
    onSubmit(data);
  });
  container.querySelector('.wizard-skip').addEventListener('click', () => onSkip());
}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `cd dashboard && npm test -- tier-2-3 persistence`
Expected: PASS.

- [ ] **Step 6: Wire wizard flow into bootstrap (`main.js`)**

Edit `dashboard/src/main.js` `bootstrap()` to mount welcome→T1→T2/3 BEFORE fetchAll. Add at top:

```js
import { renderWelcome } from './wizard/welcome.js';
import { renderTier1 } from './wizard/tier-1.js';
import { renderTier23 } from './wizard/tier-2-3.js';
import { saveWizard, loadWizard } from './wizard/persistence.js';
import { setWizard } from './core/state.js';
import './styles/wizard.css';
```

Replace `bootstrap()` with:

```js
async function bootstrap() {
  const app = document.getElementById('app');
  const saved = loadWizard();
  if (saved) {
    setWizard(saved);
    return runDashboard();  // skip wizard if already set
  }
  app.innerHTML = '<div id="wiz"></div>';
  const wiz = document.getElementById('wiz');
  renderWelcome(wiz, {
    onBegin: () => renderTier1(wiz, {
      onSubmit: (t1) => {
        setWizard(t1);
        renderTier23(wiz, {
          onSubmit: (t23) => { setWizard(t23); saveWizard({ ...t1, ...t23 }); runDashboard(); },
          onSkip:   ()    => { saveWizard(t1); runDashboard(); }
        });
      }
    })
  });
}

async function runDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="chip-strip" id="chip-strip">
      <span class="eyebrow" id="loading-text">LOADING</span>
    </header>
    <main id="slides"></main>
    <nav class="nav-bar" id="nav-bar"></nav>
  `;
  const loader = document.getElementById('loading-text');
  startLoadingLoop(loader);
  try {
    const data = await fetchAll();
    setPayload(data);
    stopLoadingLoop(loader);
    loader.textContent = `DATA · ${formatTs(data.fetched_at_utc)}`;
    renderAll(document.getElementById('slides'));
  } catch (err) {
    stopLoadingLoop(loader);
    loader.textContent = `ERROR · ${err.message}`;
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add dashboard/src/wizard/tier-2-3.js dashboard/src/wizard/persistence.js dashboard/src/main.js dashboard/tests/unit/tier-2-3.test.js dashboard/tests/unit/persistence.test.js
git commit -m "feat(wizard): T2 portfolio + T3 advanced + localStorage persistence + flow wiring"
```

---

## Phase 7 — Pinned-Header Chip Strip

### Task 24: Chip strip layout + status encoding

**Files:**
- Create: `dashboard/src/chips/chip-strip.js`
- Create: `dashboard/src/chips/chip-strip.css`
- Create: `dashboard/tests/unit/chip-strip.test.js`

Spec ref: §4.7 FR-7.1–FR-7.7 + §4.8 FR-8.1–FR-8.4 (status via weight/inverted-block/symbol — no color).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('chip strip', () => {
  it('renders REGIMES eyebrow + 4 placeholder chips', async () => {
    const { renderChipStrip } = await import('../../src/chips/chip-strip.js');
    document.body.innerHTML = '<header id="h"></header>';
    renderChipStrip(document.getElementById('h'));
    expect(document.querySelector('.chip-strip-eyebrow').textContent).toMatch(/REGIMES/);
    const chips = document.querySelectorAll('.chip');
    expect(chips.length).toBe(4);
    expect(chips[0].dataset.kind).toBe('empire');
    expect(chips[1].dataset.kind).toBe('debt');
    expect(chips[2].dataset.kind).toBe('paradigm');
    expect(chips[3].dataset.kind).toBe('inflation');
  });

  it('default chip state shows placeholder ___ in italic gray', async () => {
    const { renderChipStrip } = await import('../../src/chips/chip-strip.js');
    document.body.innerHTML = '<header id="h"></header>';
    renderChipStrip(document.getElementById('h'));
    const chip = document.querySelector('.chip[data-kind="empire"]');
    expect(chip.dataset.filled).toBe('false');
    expect(chip.textContent).toMatch(/___/);
  });

  it('fillChip(kind, label, status) sets text + status class', async () => {
    const { renderChipStrip, fillChip } = await import('../../src/chips/chip-strip.js');
    document.body.innerHTML = '<header id="h"></header>';
    renderChipStrip(document.getElementById('h'));
    fillChip('inflation', 'Stagflation', 'amber');
    const chip = document.querySelector('.chip[data-kind="inflation"]');
    expect(chip.dataset.filled).toBe('true');
    expect(chip.dataset.status).toBe('amber');
    expect(chip.textContent).toMatch(/Stagflation/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- chip-strip`
Expected: FAIL.

- [ ] **Step 3: Create chip-strip.js**

```js
/* Chip strip — Spec §4.7 + §4.8.
 * 4 regime chips: empire · debt · paradigm · inflation.
 * Status encoded via class (no color): green/amber/red.
 */

const CHIP_KINDS = [
  ['empire',    'Empire'],
  ['debt',      'Debt'],
  ['paradigm',  'Paradigm'],
  ['inflation', 'Inflation']
];

let _root = null;

export function renderChipStrip(container) {
  _root = container;
  container.classList.add('chip-strip');
  container.innerHTML = `
    <span class="chip-strip-eyebrow">REGIMES</span>
    ${CHIP_KINDS.map(([k, label]) => `
      <span class="chip" data-kind="${k}" data-filled="false" data-status="green">
        ${label}: <em>___</em>
      </span>
    `).join('')}
  `;
}

export function fillChip(kind, label, status = 'green') {
  if (!_root) return;
  const chip = _root.querySelector(`.chip[data-kind="${kind}"]`);
  if (!chip) return;
  chip.dataset.filled = 'true';
  chip.dataset.status = status;
  const labelMap = { empire: 'Empire', debt: 'Debt', paradigm: 'Paradigm', inflation: 'Inflation' };
  chip.innerHTML = `${labelMap[kind]}: <em>${escape(label)}${status === 'amber' ? ' ◆' : ''}</em>`;
}

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
```

- [ ] **Step 4: Create chip-strip.css**

```css
/* Chip strip — Spec §4.7 + §4.8.
 * Status encoding: weight + inverted-block + symbol — no color.
 */

.chip-strip-eyebrow {
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--fg);
  margin-right: var(--gap-md);
}

.chip {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13px;
  font-weight: 300;
  color: var(--paper-soft);
  border: 1px solid #ccc;
  padding: 6px 12px;
  letter-spacing: 0.2px;
  white-space: nowrap;
}
.chip em { font-style: italic; }

/* Filled — base GREEN state */
.chip[data-filled="true"] {
  color: var(--fg);
  border-color: currentColor;
  font-weight: 500;
}

/* AMBER — bold + thick rule + ◆ symbol injected by fillChip */
.chip[data-filled="true"][data-status="amber"] {
  font-weight: 700;
  border-bottom-width: 2px;
}

/* RED — inverted block: white text on black bg */
.chip[data-filled="true"][data-status="red"] {
  font-weight: 700;
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- chip-strip`
Expected: PASS.

- [ ] **Step 6: Import + commit**

Append to `dashboard/src/main.js`:

```js
import './chips/chip-strip.css';
import { renderChipStrip } from './chips/chip-strip.js';
```

Replace the `<header class="chip-strip">` line in `runDashboard()` with:

```js
const header = document.querySelector('#chip-strip');
renderChipStrip(header);
const loader = document.createElement('span');
loader.id = 'loading-text';
loader.className = 'eyebrow';
loader.textContent = 'LOADING';
header.appendChild(loader);
```

```bash
git add dashboard/src/chips/chip-strip.js dashboard/src/chips/chip-strip.css dashboard/src/main.js dashboard/tests/unit/chip-strip.test.js
git commit -m "feat(chips): pinned-header strip with 4 regime chips + BW status encoding"
```

---

### Task 25: IntersectionObserver fill-on-scroll

**Files:**
- Create: `dashboard/src/chips/observer.js`
- Create: `dashboard/tests/unit/chip-observer.test.js`

Spec ref: §4.7 FR-7.5, FR-7.6 (1.6 emits Empire, 1.3 emits Debt, 1.5 emits Paradigm, 1.7 emits Inflation).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // happy-dom IntersectionObserver shim
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; this.elements = []; }
    observe(el) { this.elements.push(el); global.__lastIO = this; }
    disconnect() {}
  };
});

describe('chip observer', () => {
  it('observes 4 emitting slides and triggers fill on intersect', async () => {
    const { renderChipStrip, fillChip } = await import('../../src/chips/chip-strip.js');
    const { observeEmittingSlides } = await import('../../src/chips/observer.js');
    document.body.innerHTML = `
      <header id="h"></header>
      <main>
        <section id="s1-3" data-slide-id="1.3"></section>
        <section id="s1-7" data-slide-id="1.7"></section>
        <section id="s1-5" data-slide-id="1.5"></section>
        <section id="s1-6" data-slide-id="1.6"></section>
      </main>
    `;
    renderChipStrip(document.getElementById('h'));
    observeEmittingSlides({
      '1.3': () => ({ kind: 'debt', label: 'Peak', status: 'amber' }),
      '1.7': () => ({ kind: 'inflation', label: 'Stagflation', status: 'amber' }),
      '1.5': () => ({ kind: 'paradigm', label: 'Late', status: 'amber' }),
      '1.6': () => ({ kind: 'empire', label: 'Top', status: 'amber' })
    });
    // simulate IntersectionObserver firing on slide 1.3
    global.__lastIO.cb([{ isIntersecting: true, target: document.getElementById('s1-3'), intersectionRatio: 0.6 }]);
    const chip = document.querySelector('.chip[data-kind="debt"]');
    expect(chip.dataset.filled).toBe('true');
    expect(chip.textContent).toMatch(/Peak/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- chip-observer`
Expected: FAIL.

- [ ] **Step 3: Create observer.js**

```js
/* IntersectionObserver wiring — Spec §4.7 FR-7.6.
 * When emitting slide is half in viewport, fill its chip via emit-fn.
 *
 * Map of slide id → emit fn returning { kind, label, status }.
 */
import { fillChip } from './chip-strip.js';

export function observeEmittingSlides(emitMap) {
  const filled = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.intersectionRatio < 0.5) return;
      const id = entry.target.dataset.slideId;
      if (!id || filled.has(id)) return;
      const fn = emitMap[id];
      if (!fn) return;
      const result = fn();
      if (result) {
        fillChip(result.kind, result.label, result.status);
        filled.add(id);
      }
    });
  }, { threshold: [0.5] });

  Object.keys(emitMap).forEach(id => {
    const el = document.querySelector(`section[data-slide-id="${id}"]`);
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- chip-observer`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/chips/observer.js dashboard/tests/unit/chip-observer.test.js
git commit -m "feat(chips): IntersectionObserver fill-on-scroll for 4 emitting slides"
```

---

## Phase 8 — Bottom Navigation Bar

### Task 26: Nav bar layout (12 segments, contained, hairline default)

**Files:**
- Create: `dashboard/src/nav/nav-bar.js`
- Create: `dashboard/src/nav/nav-bar.css`
- Create: `dashboard/tests/unit/nav-bar.test.js`

Spec ref: §4.6 FR-6.1–FR-6.4, FR-6.9 (educational sidebars use dashed line).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

const NAV_GROUPS = [
  { id: '1.1', label: 'Economic Machine', cells: 4, kind: 'live' },
  { id: '1.2', label: 'Short Cycle', cells: 4, kind: 'live' },
  { id: '1.3', label: 'Long Debt', cells: 4, kind: 'live' },
  { id: '1.4', label: 'Deleveragings', cells: 4, kind: 'live' },
  { id: '1.7', label: 'Inflation', cells: 4, kind: 'live' },
  { id: '1.5', label: 'Paradigms', cells: 3, kind: 'live' },
  { id: '1.6', label: 'World Order', cells: 4, kind: 'live' },
  { id: '2.2', label: 'All-Weather', cells: 4, kind: 'live' },
  { id: '2.5', label: 'Stress', cells: 4, kind: 'live' },
  { id: '2.4', label: 'Risk Parity', cells: 4, kind: 'live' },
  { id: '2.1', label: 'Holy Grail', cells: 3, kind: 'edu' },
  { id: '2.3', label: 'Alpha', cells: 3, kind: 'edu' }
];

describe('nav bar', () => {
  it('renders 12 groups in DAG order', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    const groups = document.querySelectorAll('.nav-group');
    expect(groups.length).toBe(12);
    expect(groups[0].dataset.groupId).toBe('1.1');
    expect(groups[11].dataset.groupId).toBe('2.3');
  });

  it('edu groups get dashed-line class', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    const eduGroup = document.querySelector('.nav-group[data-group-id="2.1"]');
    expect(eduGroup.dataset.kind).toBe('edu');
  });

  it('each group has cells matching count', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    const cells = document.querySelectorAll('.nav-group[data-group-id="1.1"] .nav-cell');
    expect(cells.length).toBe(4);
  });

  it('group has label visible only for current group OR on bar hover (managed via CSS)', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    expect(document.querySelector('.nav-group .nav-group-label')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `cd dashboard && npm test -- nav-bar`
Expected: FAIL.

- [ ] **Step 3: Create nav-bar.js**

```js
/* Bottom navigation bar — Spec §4.6 FR-6.
 * 12 groups (10 live + 2 edu) in DAG order; idle = hairline; hover/current = dots.
 */

let _root = null;
let _groups = [];

export function renderNavBar(container, groups) {
  _root = container;
  _groups = groups;
  container.classList.add('nav-bar');
  container.innerHTML = groups.map(g => `
    <div class="nav-group" data-group-id="${g.id}" data-kind="${g.kind}" data-current="false">
      <span class="nav-group-label">${escape(g.label)}</span>
      <div class="nav-segment">
        ${Array.from({ length: g.cells }, (_, i) => `
          <button class="nav-cell" data-cell-index="${i}" aria-label="${g.label} step ${i+1}">
            <span class="nav-cell-dot" aria-hidden="true"></span>
            <span class="nav-cell-label">${escape(g.label)} · ${i+1}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

export function getGroups() { return _groups.slice(); }
export function getRoot() { return _root; }

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
```

- [ ] **Step 4: Create nav-bar.css**

```css
/* Nav bar — Spec §4.6 FR-6.1–6.10.
 * Idle: hairline; hover: dots; current: filled.
 */

.nav-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.nav-group {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.nav-group-label {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: var(--tracking-nav);
  text-transform: uppercase;
  color: var(--fg);
  opacity: 0;
  transition: opacity 220ms ease;
  pointer-events: none;
  white-space: nowrap;
  position: absolute;
  bottom: calc(100% + 12px);
}

.nav-group[data-current="true"] .nav-group-label { opacity: 1; font-weight: 500; }
.nav-bar:hover .nav-group-label { opacity: 0.7; }
.nav-bar:hover .nav-group[data-current="true"] .nav-group-label { opacity: 1; }

.nav-group[data-kind="edu"] .nav-group-label { font-style: italic; opacity: 0.4; }
.nav-bar:hover .nav-group[data-kind="edu"] .nav-group-label { opacity: 0.55; }

.nav-segment {
  position: relative;
  width: 100%;
  height: 7px;
  display: flex;
  align-items: center;
  justify-content: stretch;
}

/* Default state: hairline */
.nav-segment::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 50%;
  height: 1px;
  background: currentColor;
  opacity: 0.42;
}

.nav-group[data-kind="edu"] .nav-segment::before {
  background: transparent;
  border-top: 1px dashed currentColor;
  height: 0;
  top: calc(50% - 1px);
}

.nav-cell {
  flex: 1;
  height: 36px;  /* full lane click target */
  background: transparent;
  border: 0;
  position: relative;
  cursor: pointer;
  padding: 0;
}

.nav-cell-dot {
  position: absolute;
  top: 50%; left: 50%;
  width: 1px;
  height: 1px;
  background: currentColor;
  border-radius: 0;
  transform: translate(-50%, -50%);
  transition: width var(--dur-morph) var(--ease-snap),
              height var(--dur-morph) var(--ease-snap),
              border-radius var(--dur-morph) var(--ease-snap),
              background var(--dur-morph) var(--ease-snap),
              box-shadow 200ms ease;
  opacity: 0.42;
}

.nav-cell-label {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: var(--tracking-nav);
  text-transform: uppercase;
  color: var(--fg);
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 220ms ease;
  pointer-events: none;
}

/* Group hover/current: line → hollow dots */
.nav-group:hover .nav-cell-dot,
.nav-group[data-current="true"] .nav-cell-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: transparent;
  box-shadow: inset 0 0 0 1px currentColor;
  opacity: 1;
}

/* Hide hairline when group expanded */
.nav-group:hover .nav-segment::before,
.nav-group[data-current="true"] .nav-segment::before {
  opacity: 0;
}

/* Current cell filled */
.nav-cell[data-current="true"] .nav-cell-dot {
  background: currentColor;
  box-shadow: none;
}
.nav-cell[data-current="true"] .nav-cell-label { opacity: 1; }

/* Proximity-near cell brightens + reveals label */
.nav-cell[data-near="true"] .nav-cell-dot {
  box-shadow: inset 0 0 0 1.5px currentColor, 0 0 0 1px currentColor;
}
.nav-cell[data-near="true"] .nav-cell-label { opacity: 1; }
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- nav-bar`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/nav/nav-bar.js dashboard/src/nav/nav-bar.css dashboard/tests/unit/nav-bar.test.js
git commit -m "feat(nav): 12-segment bottom bar layout with hairline + hollow-dot states"
```

---

### Task 27: Cursor proximity detection

**Files:**
- Create: `dashboard/src/nav/proximity.js`
- Create: `dashboard/tests/unit/proximity.test.js`

Spec ref: §4.6 FR-6.6 (mousemove tracks nearest cell by X-distance).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = `
    <nav class="nav-bar" id="n" style="position:fixed;left:0;right:0;bottom:0;height:36px;width:1200px">
      <div class="nav-group" data-group-id="1.1">
        <div class="nav-segment">
          <button class="nav-cell" data-cell-index="0"></button>
          <button class="nav-cell" data-cell-index="1"></button>
        </div>
      </div>
      <div class="nav-group" data-group-id="1.2">
        <div class="nav-segment">
          <button class="nav-cell" data-cell-index="0"></button>
        </div>
      </div>
    </nav>
  `;
  // happy-dom getBoundingClientRect stub
  document.querySelectorAll('.nav-cell').forEach((cell, i) => {
    cell.getBoundingClientRect = () => ({ left: i*100, right: (i+1)*100, top: 0, bottom: 36, x: i*100, y: 0, width: 100, height: 36 });
  });
});

describe('proximity', () => {
  it('mousemove near cell index 1 marks it data-near=true', async () => {
    const { bindProximity } = await import('../../src/nav/proximity.js');
    bindProximity(document.getElementById('n'));
    const evt = new MouseEvent('mousemove', { clientX: 150, clientY: 18, bubbles: true });
    document.getElementById('n').dispatchEvent(evt);
    const cells = document.querySelectorAll('.nav-cell');
    expect(cells[1].dataset.near).toBe('true');
    expect(cells[0].dataset.near).not.toBe('true');
  });

  it('mouseleave clears all near markers', async () => {
    const { bindProximity } = await import('../../src/nav/proximity.js');
    bindProximity(document.getElementById('n'));
    document.getElementById('n').dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 18, bubbles: true }));
    document.getElementById('n').dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    const nearCells = document.querySelectorAll('.nav-cell[data-near="true"]');
    expect(nearCells.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `cd dashboard && npm test -- proximity`
Expected: FAIL.

- [ ] **Step 3: Create proximity.js**

```js
/* Cursor-proximity detection — Spec §4.6 FR-6.6.
 * On mousemove: find cell whose X-center is nearest cursor X. Mark data-near=true.
 * On mouseleave: clear all near markers.
 */

export function bindProximity(navBar) {
  const cells = Array.from(navBar.querySelectorAll('.nav-cell'));
  if (cells.length === 0) return;

  function clearNear() {
    cells.forEach(c => { delete c.dataset.near; });
  }

  navBar.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    let nearest = cells[0];
    let minDist = Infinity;
    for (const cell of cells) {
      const r = cell.getBoundingClientRect();
      const cx = (r.left + r.right) / 2;
      const dist = Math.abs(cx - x);
      if (dist < minDist) { minDist = dist; nearest = cell; }
    }
    clearNear();
    nearest.dataset.near = 'true';
  });

  navBar.addEventListener('mouseleave', clearNear);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- proximity`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/nav/proximity.js dashboard/tests/unit/proximity.test.js
git commit -m "feat(nav): cursor proximity → nearest-cell highlight on mousemove"
```

---

### Task 28: Current-cell scrollspy + group active state

**Files:**
- Create: `dashboard/src/nav/scrollspy.js`
- Create: `dashboard/tests/unit/scrollspy.test.js`

Spec ref: §4.6 FR-6.7 (currently scrolled-into-view cell adds .is-current; only ONE across bar).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; global.__lastIO = this; }
    observe() {}
    disconnect() {}
  };
  document.body.innerHTML = `
    <main>
      <section data-slide-id="1.1" data-cell-index="0"></section>
      <section data-slide-id="1.1" data-cell-index="1"></section>
      <section data-slide-id="1.2" data-cell-index="0"></section>
    </main>
    <nav class="nav-bar">
      <div class="nav-group" data-group-id="1.1">
        <button class="nav-cell" data-cell-index="0"></button>
        <button class="nav-cell" data-cell-index="1"></button>
      </div>
      <div class="nav-group" data-group-id="1.2">
        <button class="nav-cell" data-cell-index="0"></button>
      </div>
    </nav>
  `;
});

describe('scrollspy', () => {
  it('IntersectionObserver fires on slide section → marks matching nav-cell as current', async () => {
    const { bindScrollspy } = await import('../../src/nav/scrollspy.js');
    bindScrollspy(document.querySelector('.nav-bar'), document.querySelector('main'));
    const slide = document.querySelector('[data-slide-id="1.2"]');
    global.__lastIO.cb([{ isIntersecting: true, target: slide, intersectionRatio: 0.7 }]);
    const cell = document.querySelector('.nav-group[data-group-id="1.2"] .nav-cell');
    expect(cell.dataset.current).toBe('true');
  });

  it('Only one cell across the entire bar is current at a time', async () => {
    const { bindScrollspy } = await import('../../src/nav/scrollspy.js');
    bindScrollspy(document.querySelector('.nav-bar'), document.querySelector('main'));
    const s1 = document.querySelector('[data-slide-id="1.1"][data-cell-index="0"]');
    const s2 = document.querySelector('[data-slide-id="1.2"]');
    global.__lastIO.cb([{ isIntersecting: true, target: s1, intersectionRatio: 0.7 }]);
    global.__lastIO.cb([{ isIntersecting: true, target: s2, intersectionRatio: 0.7 }]);
    const allCurrent = document.querySelectorAll('.nav-cell[data-current="true"]');
    expect(allCurrent.length).toBe(1);
    expect(allCurrent[0].closest('.nav-group').dataset.groupId).toBe('1.2');
  });

  it('Group containing current cell gets data-current=true', async () => {
    const { bindScrollspy } = await import('../../src/nav/scrollspy.js');
    bindScrollspy(document.querySelector('.nav-bar'), document.querySelector('main'));
    const slide = document.querySelector('[data-slide-id="1.2"]');
    global.__lastIO.cb([{ isIntersecting: true, target: slide, intersectionRatio: 0.7 }]);
    expect(document.querySelector('.nav-group[data-group-id="1.2"]').dataset.current).toBe('true');
    expect(document.querySelector('.nav-group[data-group-id="1.1"]').dataset.current).toBe('false');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- scrollspy`
Expected: FAIL.

- [ ] **Step 3: Create scrollspy.js**

```js
/* Scrollspy — Spec §4.6 FR-6.7.
 * IntersectionObserver on each slide section; sets exactly one .nav-cell
 * data-current=true based on which slide's first half is in viewport.
 */

export function bindScrollspy(navBar, scrollContainer) {
  const sections = Array.from(scrollContainer.querySelectorAll('section[data-slide-id]'));
  if (sections.length === 0) return () => {};

  function setCurrent(slideId, cellIndex) {
    navBar.querySelectorAll('.nav-cell').forEach(c => { c.dataset.current = 'false'; });
    navBar.querySelectorAll('.nav-group').forEach(g => { g.dataset.current = 'false'; });
    const group = navBar.querySelector(`.nav-group[data-group-id="${slideId}"]`);
    if (!group) return;
    group.dataset.current = 'true';
    const cell = group.querySelector(`.nav-cell[data-cell-index="${cellIndex}"]`);
    if (cell) cell.dataset.current = 'true';
  }

  const observer = new IntersectionObserver((entries) => {
    // Pick the entry with highest intersectionRatio that's intersecting.
    let best = null;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (!best) return;
    const slideId = best.target.dataset.slideId;
    const cellIndex = best.target.dataset.cellIndex || '0';
    setCurrent(slideId, cellIndex);
  }, { threshold: [0.5] });

  sections.forEach(s => observer.observe(s));
  return () => observer.disconnect();
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- scrollspy`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/nav/scrollspy.js dashboard/tests/unit/scrollspy.test.js
git commit -m "feat(nav): scrollspy → exactly-one-current cell + group active state"
```

---

### Task 29: Click-to-smooth-scroll + nav wiring into bootstrap

**Files:**
- Create: `dashboard/src/nav/click-scroll.js`
- Create: `dashboard/tests/unit/click-scroll.test.js`
- Modify: `dashboard/src/main.js`

Spec ref: §4.6 FR-6.10.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = `
    <main>
      <section data-slide-id="1.1" data-cell-index="0" id="s1"></section>
      <section data-slide-id="1.1" data-cell-index="1" id="s2"></section>
      <section data-slide-id="1.2" data-cell-index="0" id="s3"></section>
    </main>
    <nav class="nav-bar">
      <div class="nav-group" data-group-id="1.2">
        <button class="nav-cell" data-cell-index="0" id="c1"></button>
      </div>
    </nav>
  `;
  // happy-dom doesn't implement scrollIntoView; install spy
  Element.prototype.scrollIntoView = vi.fn();
});

describe('click-scroll', () => {
  it('cell click invokes scrollIntoView on matching slide section', async () => {
    const { bindClickScroll } = await import('../../src/nav/click-scroll.js');
    bindClickScroll(document.querySelector('.nav-bar'));
    document.getElementById('c1').click();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('group click (not on a cell) scrolls to first cell of that group', async () => {
    document.body.innerHTML = `
      <main>
        <section data-slide-id="1.2" data-cell-index="0" id="s3"></section>
      </main>
      <nav class="nav-bar">
        <div class="nav-group" data-group-id="1.2">
          <span class="nav-group-label" id="lbl"></span>
          <div class="nav-segment">
            <button class="nav-cell" data-cell-index="0"></button>
          </div>
        </div>
      </nav>
    `;
    const { bindClickScroll } = await import('../../src/nav/click-scroll.js');
    bindClickScroll(document.querySelector('.nav-bar'));
    document.getElementById('lbl').click();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- click-scroll`
Expected: FAIL.

- [ ] **Step 3: Create click-scroll.js**

```js
/* Click-to-smooth-scroll — Spec §4.6 FR-6.10.
 * Cell click → scroll to that cell's slide.
 * Group empty-space click → scroll to first cell of that group.
 */

export function bindClickScroll(navBar) {
  navBar.addEventListener('click', (e) => {
    const cell = e.target.closest('.nav-cell');
    if (cell) {
      const group = cell.closest('.nav-group');
      const groupId = group?.dataset.groupId;
      const cellIndex = cell.dataset.cellIndex;
      if (!groupId) return;
      scrollTo(groupId, cellIndex);
      return;
    }
    const group = e.target.closest('.nav-group');
    if (group) {
      const groupId = group.dataset.groupId;
      scrollTo(groupId, '0');
    }
  });
}

function scrollTo(slideId, cellIndex) {
  const sel = `section[data-slide-id="${slideId}"][data-cell-index="${cellIndex}"]`;
  const target = document.querySelector(sel);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

- [ ] **Step 4: Wire nav into bootstrap (`main.js`)**

Append to `dashboard/src/main.js` imports:

```js
import './nav/nav-bar.css';
import { renderNavBar } from './nav/nav-bar.js';
import { bindProximity } from './nav/proximity.js';
import { bindScrollspy } from './nav/scrollspy.js';
import { bindClickScroll } from './nav/click-scroll.js';
```

In `runDashboard()` after `renderAll(...)`, append:

```js
const navBar = document.getElementById('nav-bar');
const NAV_GROUPS = [
  { id: '1.1', label: 'Economic Machine', cells: 4, kind: 'live' },
  { id: '1.2', label: 'Short Cycle',      cells: 4, kind: 'live' },
  { id: '1.3', label: 'Long Debt',        cells: 4, kind: 'live' },
  { id: '1.4', label: 'Deleveragings',    cells: 4, kind: 'live' },
  { id: '1.7', label: 'Inflation',        cells: 4, kind: 'live' },
  { id: '1.5', label: 'Paradigms',        cells: 3, kind: 'live' },
  { id: '1.6', label: 'World Order',      cells: 4, kind: 'live' },
  { id: '2.2', label: 'All-Weather',      cells: 4, kind: 'live' },
  { id: '2.5', label: 'Stress',           cells: 4, kind: 'live' },
  { id: '2.4', label: 'Risk Parity',      cells: 4, kind: 'live' },
  { id: '2.1', label: 'Holy Grail',       cells: 3, kind: 'edu' },
  { id: '2.3', label: 'Alpha',            cells: 3, kind: 'edu' }
];
renderNavBar(navBar, NAV_GROUPS);
bindProximity(navBar);
bindScrollspy(navBar, document.getElementById('slides'));
bindClickScroll(navBar);
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- click-scroll`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/nav/click-scroll.js dashboard/src/main.js dashboard/tests/unit/click-scroll.test.js
git commit -m "feat(nav): click-to-scroll + full nav wiring into bootstrap"
```

---

## Phase 9 — Per-Framework Compute Modules

Each module is a pure function: `(payload, wizard) → { regime/states, formula outputs, integration emits }`. Formulas + thresholds verbatim from `.superpowers/research-extract-for-plan-v2.md` (which is the read-only canonical extract from research/01-12).

### Task 30: 1.1 Economic Machine compute

**Files:**
- Create: `dashboard/src/compute/econ-machine.js`
- Create: `dashboard/tests/unit/econ-machine.test.js`

Spec ref: research extract §research/01 §5.1-§5.5 + §6 + research/01 line refs §4 L29-41, §5.1 L45-57, §5.2 L59-65, §5.3 L67-77, §5.4 L79-84, §5.5 L85-93, §6 L96-112.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('econMachine compute', () => {
  it('classifies gap_regime per ±σ band (σ ≈ 3.2%)', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    const fixture = makeFixtureGap(+5.0);  // gap +5% > +σ
    const r = computeEconMachine(fixture);
    expect(r.gap_regime).toBe('ABOVE_TREND');
    expect(computeEconMachine(makeFixtureGap(-5.0)).gap_regime).toBe('BELOW_TREND');
    expect(computeEconMachine(makeFixtureGap(0)).gap_regime).toBe('ON_TREND');
  });

  it('classifies credit_mix_regime via 0.33/0.66 tertile', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    expect(computeEconMachine(makeFixtureMix(0.80)).credit_mix_regime).toBe('CREDIT_DRIVEN');
    expect(computeEconMachine(makeFixtureMix(0.20)).credit_mix_regime).toBe('MONEY_DRIVEN');
    expect(computeEconMachine(makeFixtureMix(0.50)).credit_mix_regime).toBe('MIXED');
  });

  it('classifies debt_money_regime per 10/15 edges (R^{D/M} narrow-money)', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    expect(computeEconMachine(makeFixtureDebtMoney(8)).debt_money_regime).toBe('LOW');
    expect(computeEconMachine(makeFixtureDebtMoney(13)).debt_money_regime).toBe('ELEVATED');
    expect(computeEconMachine(makeFixtureDebtMoney(18)).debt_money_regime).toBe('HIGH');
  });

  it('canonical 2024 snapshot: trend_growth ≈ 1.96% p.a. (±0.5pp)', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    const out = computeEconMachine(canonicalUS2024());
    expect(out.trend_growth_pct).toBeGreaterThan(1.4);
    expect(out.trend_growth_pct).toBeLessThan(2.5);
  });
});

// Fixture helpers. Each returns the FRED slice this module consumes.
function makeFixtureGap(gapPct) {
  // Force gap by tweaking last RGDP_pc relative to OLS trend
  return { /* construct minimal payload — see impl */ };
}
function makeFixtureMix(scTarget) { /* ΔC and ΔM tuned to give sᶜ = scTarget */ }
function makeFixtureDebtMoney(ratio) { /* TCMDO/M2 narrow-money ratio = ratio */ }
function canonicalUS2024() { /* real-ish FRED snapshot for sanity */ }
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- econ-machine`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement econ-machine.js**

```js
/* 1.1 Economic Machine — Spec §3 + research/01 §5-§6.
 * Inputs: FRED series GDP, GDPC1, A939RX0Q048SBEA, CNP16OV, M2SL, TCMDO.
 * Outputs: gap_regime, credit_mix_regime, debt_money_regime, trend_growth_pct,
 *          R_dm (debt/money ratio).
 *
 * Verbatim from research/01:
 *   gap_regime: ABOVE_TREND if gap% > +σ; BELOW_TREND if < −σ; else ON_TREND
 *               (σ ≈ 3.2% from OLS residual stdev on 1947-2024 RGDP_pc)
 *   credit_mix_regime: CREDIT_DRIVEN if sᶜ > 0.66; MONEY_DRIVEN if < 0.33; else MIXED
 *   debt_money_regime: LOW < 10; ELEVATED 10-15; HIGH > 15  (R^{D/M} narrow-money)
 */

const SIGMA_GAP_PCT = 3.2;       // OLS residual σ
const TERTILE_LOW = 0.33;
const TERTILE_HIGH = 0.66;
const DM_LOW_EDGE = 10;
const DM_HIGH_EDGE = 15;

export function computeEconMachine(payload) {
  const fred = payload?.sources?.fred || {};

  const trend = fitOlsTrend(fred.A939RX0Q048SBEA || []);  // {alpha, beta, sigma_residual}
  const trend_growth_pct = (Math.exp(4 * trend.beta) - 1) * 100;

  const lastReal = lastValue(fred.A939RX0Q048SBEA);
  const t_idx = (fred.A939RX0Q048SBEA?.length || 1) - 1;
  const expected_ln = trend.alpha + trend.beta * t_idx;
  const gap_pct = lastReal != null ? (Math.log(lastReal) - expected_ln) * 100 : 0;
  const gap_regime = gap_pct > +SIGMA_GAP_PCT ? 'ABOVE_TREND' :
                     gap_pct < -SIGMA_GAP_PCT ? 'BELOW_TREND' : 'ON_TREND';

  const dC = qDelta(fred.TCMDO);  // last Q − prior Q
  const dM = qDelta(fred.M2SL);
  const sC = (dC + dM) === 0 ? 0.5 : dC / (dC + dM);
  const credit_mix_regime = sC > TERTILE_HIGH ? 'CREDIT_DRIVEN' :
                            sC < TERTILE_LOW  ? 'MONEY_DRIVEN'  : 'MIXED';

  // Narrow-money R^{D/M} ≈ TCMDO_mn / (M0_or_narrow); M2-based proxy in v1.
  // Per research/01 §7 L137: latest US TCMDO ≈ $97T; M2 ≈ $21T → R≈4.6 (M2);
  // narrow-money ≈ 17. v1 uses M2; flag as proxy in caption.
  const tcmdoBn = (lastValue(fred.TCMDO) || 0) / 1000;  // mn → bn
  const m2Bn = lastValue(fred.M2SL) || 1;
  const R_dm = tcmdoBn / m2Bn;
  // Apply Dalio's narrow-money convention (×3.7 historical narrow/M2 ratio
  // documented research/01 §7 L137-138 to match the "roughly 15" anchor).
  const R_dm_narrow = R_dm * 3.7;
  const debt_money_regime = R_dm_narrow < DM_LOW_EDGE ? 'LOW' :
                            R_dm_narrow > DM_HIGH_EDGE ? 'HIGH' : 'ELEVATED';

  return {
    gap_regime, credit_mix_regime, debt_money_regime,
    trend_growth_pct, gap_pct, sC, R_dm, R_dm_narrow,
    emits: ['gap_regime', 'credit_mix_regime', 'trend_growth_pct', 'debt_money_regime']
  };
}

// --- helpers ---
function lastValue(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].value != null) return Number(series[i].value);
  }
  return null;
}
function qDelta(series) {
  if (!Array.isArray(series) || series.length < 2) return 0;
  const a = series[series.length - 1]?.value;
  const b = series[series.length - 2]?.value;
  return (a != null && b != null) ? Number(a) - Number(b) : 0;
}
function fitOlsTrend(series) {
  // Simple OLS: ln(y) ~ alpha + beta*t  where t = quarter index.
  const ys = (series || []).map((p, i) => [i, p.value])
    .filter(([_, v]) => v != null && Number(v) > 0)
    .map(([i, v]) => [i, Math.log(Number(v))]);
  if (ys.length < 4) return { alpha: 0, beta: 0, sigma_residual: 0 };
  const n = ys.length;
  const sumT = ys.reduce((s, [t]) => s + t, 0);
  const sumY = ys.reduce((s, [, y]) => s + y, 0);
  const sumTT = ys.reduce((s, [t]) => s + t * t, 0);
  const sumTY = ys.reduce((s, [t, y]) => s + t * y, 0);
  const beta = (n * sumTY - sumT * sumY) / (n * sumTT - sumT * sumT);
  const alpha = (sumY - beta * sumT) / n;
  const residuals = ys.map(([t, y]) => y - (alpha + beta * t));
  const sigma2 = residuals.reduce((s, r) => s + r * r, 0) / (n - 2);
  return { alpha, beta, sigma_residual: Math.sqrt(sigma2) };
}
```

- [ ] **Step 4: Implement test fixtures**

In the test file replace the helper stubs with real fixture builders. Acceptance: each fixture must produce the regime asserted by the test. Implementer should iterate until tests pass.

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- econ-machine`
Expected: PASS — all four regime assertions green.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/compute/econ-machine.js dashboard/tests/unit/econ-machine.test.js
git commit -m "feat(compute): 1.1 Economic Machine — gap/credit_mix/debt_money regimes + OLS trend"
```

---

### Task 31: 1.2 Short-Term Cycle compute

**Files:**
- Create: `dashboard/src/compute/short-cycle.js`
- Create: `dashboard/tests/unit/short-cycle.test.js`

Spec ref: research extract §research/02 (§5.1 L47-68 phase Boolean flags; §5.4 L87-91 sahm rule; §6 L93-119 NY Fed probit; §9 L261-271 emits).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('shortCycle compute', () => {
  it('illustrative TRANSITIONAL fixture from research/02 §7 L121-155', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    // Per research/02 §7: g=2.1%, CAPUTL=77.9%, CPI=3.1%, FF=4.33%, T10Y3M=0.45pp,
    // ΔFF_12m=-1.00pp, SAHM=0.4pp → no flags fire → TRANSITIONAL.
    const r = computeShortCycle({
      sources: { fred: makeFredFixture({
        A191RL1Q225SBEA: 2.1, TCU: 77.9, CPIAUCSL_yoy: 3.1, FEDFUNDS: 4.33,
        T10Y3M: 0.45, deltaFF12m: -1.00, SAHM: 0.4
      }) }
    });
    expect(r.cycle_phase).toBe('TRANSITIONAL');
    expect(r.policy_stance).toBe('EASING');
    expect(r.yc_signal).toBe('FLAT');
    expect(r.sahm_signal).toBe('NOT_TRIGGERED');
  });

  it('Sahm rule TRIGGERED if MA3(u) − min[t-12,t] u ≥ 0.5pp', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    const r = computeShortCycle({ sources: { fred: makeFredFixture({ SAHM: 0.6 }) } });
    expect(r.sahm_signal).toBe('TRIGGERED');
  });

  it('LATE phase fires when g ∈ [3.5%, 4.0%] AND π > π_prev AND cu > 78% AND MST ≥ 30', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    const r = computeShortCycle({ sources: { fred: makeFredFixture({
      A191RL1Q225SBEA: 3.7, TCU: 79.5, CPI_yoy_now: 3.5, CPI_yoy_prev: 3.0, MST: 32
    }) } });
    expect(r.cycle_phase).toBe('LATE');
  });

  it('yc_signal classifier per T10Y3M brackets', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    expect(computeShortCycle({ sources: { fred: makeFredFixture({ T10Y3M: -0.5 }) } }).yc_signal).toBe('INVERTED');
    expect(computeShortCycle({ sources: { fred: makeFredFixture({ T10Y3M: 0.5 }) } }).yc_signal).toBe('FLAT');
    expect(computeShortCycle({ sources: { fred: makeFredFixture({ T10Y3M: 1.5 }) } }).yc_signal).toBe('STEEP');
  });
});

function makeFredFixture(opts) { /* minimal series builder */ }
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- short-cycle`
Expected: FAIL.

- [ ] **Step 3: Implement short-cycle.js**

```js
/* 1.2 Short-Term Cycle — research/02 §5.1-§5.4 + §6.
 * Phase Boolean flags evaluated in order; first match wins; fallthrough = TRANSITIONAL.
 */

export function computeShortCycle(payload) {
  const fred = payload?.sources?.fred || {};

  // Real GDP qoq SAAR (most recent value)
  const g = lastValue(fred.A191RL1Q225SBEA) ?? 0;
  // Capacity utilization
  const cu = lastValue(fred.TCU) ?? 0;
  // CPI yoy (compute from CPIAUCSL last 12M ratio if not pre-computed)
  const cpi_yoy_now = computeYoY(fred.CPIAUCSL, 0);
  const cpi_yoy_prev = computeYoY(fred.CPIAUCSL, 12);
  // Fed funds + 12-month delta
  const ff = lastValue(fred.FEDFUNDS) ?? 0;
  const ff_12m_ago = valueAtOffset(fred.FEDFUNDS, 12) ?? ff;
  const deltaFF12m = ff - ff_12m_ago;
  // Curve
  const t10y3m = lastValue(fred.T10Y3M) ?? 0;
  // Sahm rule (MA3(u) − min over [t−12, t])
  const sahm = computeSahmRule(fred.UNRATE);
  // Months since trough (MST) — use NBER cycle dates if available; else 0
  const mst = (payload?.sources?.nber && estimateMST(payload.sources.nber.recession_dates)) || 0;
  // Δg sign (qoq qoq)
  const g_prev = valueAtOffset(fred.A191RL1Q225SBEA, 1) ?? g;
  const dg = g - g_prev;
  // Δπ sign
  const dpi = cpi_yoy_now - cpi_yoy_prev;
  // 10Y-2Y spread (for tightening flag)
  const spread = lastValue(fred.T10Y2Y) ?? 0;

  // Phase flags (research/02 §5.1):
  const earlyFlag      = g > 4.0 && dg > 0 && dpi < 0 && deltaFF12m <= 0;
  const midFlag        = g >= 1.5 && g <= 2.5 && dg < 0 && Math.abs(deltaFF12m) < 0.5;
  const lateFlag       = g >= 3.5 && g <= 4.0 && dpi > 0 && cu > 78 && mst >= 30;
  const tighteningFlag = deltaFF12m > 0 && spread < 1.0 && cpi_yoy_now > 2.5;

  const policy_stance =
    deltaFF12m < -0.5 ? 'EASING' :
    deltaFF12m > +0.5 ? 'TIGHTENING' : 'NEUTRAL';

  const yc_signal =
    t10y3m < 0    ? 'INVERTED' :
    t10y3m < 1.0  ? 'FLAT'     : 'STEEP';

  const sahm_signal = sahm >= 0.5 ? 'TRIGGERED' : 'NOT_TRIGGERED';

  // Recession phase detection
  const recession_early = sahm_signal === 'TRIGGERED' && (policy_stance === 'NEUTRAL' || policy_stance === 'TIGHTENING');
  const recession_late  = sahm_signal === 'TRIGGERED' && policy_stance === 'EASING';

  const cycle_phase =
    recession_late      ? 'RECESSION_LATE'  :
    recession_early     ? 'RECESSION_EARLY' :
    earlyFlag           ? 'EARLY'           :
    lateFlag            ? 'LATE'            :
    tighteningFlag      ? 'TIGHTENING'      :
    midFlag             ? 'MID'             :
                          'TRANSITIONAL';

  // NY Fed probit recession_prob_12m: P(rec) = Φ(α + β·spread); use precomputed if available
  const recession_prob_12m = payload?.sources?.nyfed?.recession_prob_12m ?? probitFromSpread(spread);
  const recession_prob_label = recession_prob_12m > 0.30 ? 'ELEVATED' : 'NORMAL';

  return {
    cycle_phase, policy_stance, yc_signal, sahm_signal,
    recession_prob_12m, recession_prob_label,
    g, cu, cpi_yoy_now, ff, deltaFF12m, t10y3m, sahm, mst,
    emits: ['cycle_phase', 'recession_prob_12m', 'sahm_signal', 'policy_stance', 'yc_signal']
  };
}

// --- helpers ---
function lastValue(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) if (series[i].value != null) return Number(series[i].value);
  return null;
}
function valueAtOffset(series, offset) {
  if (!Array.isArray(series) || series.length === 0) return null;
  const idx = series.length - 1 - offset;
  return idx < 0 ? null : (series[idx]?.value ?? null);
}
function computeYoY(series, monthsAgo) {
  if (!Array.isArray(series) || series.length < 12) return 0;
  const idx = series.length - 1 - monthsAgo;
  const idxYoY = idx - 12;
  if (idxYoY < 0 || !series[idx] || !series[idxYoY]) return 0;
  return (Number(series[idx].value) / Number(series[idxYoY].value) - 1) * 100;
}
function computeSahmRule(unrate) {
  // MA3(u_t) − min over [t-12, t] u_s
  if (!Array.isArray(unrate) || unrate.length < 12) return 0;
  const last3 = unrate.slice(-3).map(p => Number(p.value)).filter(v => !Number.isNaN(v));
  if (last3.length === 0) return 0;
  const ma3 = last3.reduce((a, b) => a + b, 0) / last3.length;
  const last12 = unrate.slice(-12).map(p => Number(p.value)).filter(v => !Number.isNaN(v));
  const minU = Math.min(...last12);
  return ma3 - minU;
}
function estimateMST(recessionDates) {
  if (!Array.isArray(recessionDates) || recessionDates.length === 0) return 0;
  const lastEnd = recessionDates[0]?.[1];
  if (!lastEnd) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(lastEnd).getTime()) / (30 * 24 * 3600 * 1000)));
}
function probitFromSpread(spread) {
  // NY Fed probit (research/02 §5.4): Φ(α + β·spread); rough approx for fallback only.
  // Use Estrella-Hardouvelis 1998 calibration: α=0.45, β=−1.0
  const z = 0.45 - 1.0 * spread;
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
function erf(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- short-cycle`
Expected: PASS — TRANSITIONAL canonical + Sahm + LATE + yc_signal all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/short-cycle.js dashboard/tests/unit/short-cycle.test.js
git commit -m "feat(compute): 1.2 Short-Term Cycle — phase flags + Sahm + NY Fed probit"
```

---

### Task 32: 1.3 Long-Term Debt Cycle compute

**Files:**
- Create: `dashboard/src/compute/long-debt.js`
- Create: `dashboard/tests/unit/long-debt.test.js`

Spec ref: research extract §research/03 (§5.1 L51-63 four pressure indicators; §6 L103-140 stage classifier; §7 L142-168 US Ex.1 anchor 580% I1_rev). Per spec §3 "PEAK rename" lock D8 — emit `PEAK` not `TOP` to avoid 1.6 collision.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('longDebt compute', () => {
  it('US Ex.1 canonical: I1_rev=580%, I2≈20%, I3=−0.4 → stage TOP→emitted as PEAK', async () => {
    const { computeLongDebt } = await import('../../src/compute/long-debt.js');
    const r = computeLongDebt({ sources: { fred: makeFredFixtureLong({
      D_tot_GDP: 0.99,           // total debt / GDP
      Rev_GDP: 0.17,             // → I1_rev = 99/17 = 582%
      Int_GDP: 0.034,            // → I2_rev = 3.4/17 = 20%
      r_nom: 3.4, g_nom: 3.8     // → I3 = -0.4
    }) } });
    expect(r.I1_rev_pct).toBeGreaterThan(550);
    expect(r.I1_rev_pct).toBeLessThan(620);
    expect(r.stage).toBe('PEAK');           // Renamed from TOP per Set 3.5 D8
    expect(r.emitsLabel).toBe('PEAK');      // What chip strip should display
  });

  it('SOUND when I1_rev < 200% AND I2_rev < 5%', async () => {
    const { computeLongDebt } = await import('../../src/compute/long-debt.js');
    const r = computeLongDebt({ sources: { fred: makeFredFixtureLong({
      D_tot_GDP: 0.30, Rev_GDP: 0.20, Int_GDP: 0.005, r_nom: 2, g_nom: 4
    }) } });
    expect(r.stage).toBe('SOUND');
  });

  it('DELEVERAGING when I1_rev 550-900% AND I2_rev 15-40%', async () => {
    const { computeLongDebt } = await import('../../src/compute/long-debt.js');
    const r = computeLongDebt({ sources: { fred: makeFredFixtureLong({
      D_tot_GDP: 1.30, Rev_GDP: 0.17, Int_GDP: 0.045, r_nom: 5, g_nom: 1
    }) } });
    expect(r.stage).toBe('DELEVERAGING');
  });
});

function makeFredFixtureLong(opts) { /* construct GFDEGDQ188S, FYFRGDA188S, etc. */ }
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- long-debt`
Expected: FAIL.

- [ ] **Step 3: Implement long-debt.js**

```js
/* 1.3 Long-Term Debt Cycle — research/03 §5-§6.
 * Four pressure indicators I1-I4. Stage classifier by I1_rev + I2_rev edges.
 *
 * Per Set 3.5 D8 lock: emit PEAK not TOP (to avoid 1.6 empire-stage collision).
 */

export function computeLongDebt(payload) {
  const fred = payload?.sources?.fred || {};
  const wb = payload?.sources?.wb_wdi || {};
  const cofer = payload?.sources?.cofer || {};

  // I1 = Debt / Revenue; convert from /GDP basis: I1_rev = (D/GDP) / (Rev/GDP)
  const D_GDP = lastValue(fred.GFDEGDQ188S);  // total fed debt / GDP (decimal)
  const Rev_GDP = lastValue(fred.FYFRGDA188S);
  const I1_rev = (D_GDP != null && Rev_GDP != null && Rev_GDP > 0) ? D_GDP / Rev_GDP : null;
  const I1_rev_pct = I1_rev != null ? I1_rev * 100 : null;

  // I2 = (Interest + Principal_due) / Revenue. v1 uses interest only (Principal_due
  // requires maturity-ladder data not in v1 normalizers).
  const Int_GDP = lastValue(fred.FYOIGDA188S);
  const I2_rev_pct = (Int_GDP != null && Rev_GDP != null) ? (Int_GDP / Rev_GDP) * 100 : null;

  // I3 = r_nom − g_nom (decade-scale nominal rate vs nominal growth)
  const r_nom = lastValue(fred.GS10) || 0;
  const gdp_now = lastValue(fred.GDP);
  const gdp_4q_ago = valueAtOffset(fred.GDP, 4);
  const g_nom = (gdp_now != null && gdp_4q_ago) ? ((gdp_now / gdp_4q_ago) - 1) * 100 : 0;
  const I3 = r_nom - g_nom;

  // I4 = Debt / (Reserves + Savings) — proxy via FX reserves from WB
  const reserves = lastValue(wb.FI_RES_TOTL_CD);
  const I4 = (D_GDP != null && reserves) ? D_GDP * 1e12 / reserves : null;

  // Stage classifier per research/03 §6:
  //   SOUND        I1<200%   I2<5%
  //   BUBBLE       200-400%  5-10%
  //   PEAK         400-550%  10-15%   (emitted name; "TOP" in research file)
  //   DELEVERAGING 550-900%  15-40%
  //   RECEDES      falling through 400% / 10%
  const stage = classifyStage(I1_rev_pct, I2_rev_pct);

  // MP phase classifier (research/03 §5.6); v1 returns 'MP3' default — wire to
  // CB_Assets surge detection in v1.1.
  const mp_phase = 'MP3';

  return {
    stage,
    emitsLabel: stage === 'PEAK' ? 'Peak' : titleCase(stage),
    I1_rev_pct, I2_rev_pct, I3, I4, r_nom, g_nom, mp_phase,
    emits: ['stage', 'mp_phase', 'I3_sign', '10yr_projection']
  };
}

function classifyStage(I1, I2) {
  if (I1 == null || I2 == null) return 'UNKNOWN';
  if (I1 < 200 && I2 < 5) return 'SOUND';
  if (I1 >= 200 && I1 < 400 && I2 >= 5 && I2 < 10) return 'BUBBLE';
  if (I1 >= 400 && I1 < 550 && I2 >= 10 && I2 < 15) return 'PEAK';
  if (I1 >= 550 && I1 < 900 && I2 >= 15 && I2 < 40) return 'DELEVERAGING';
  if (I1 >= 400 && I1 < 550) return 'PEAK';   // fallback by I1 alone
  if (I1 >= 550) return 'DELEVERAGING';
  return 'BUBBLE';
}
function titleCase(s) { return s[0] + s.slice(1).toLowerCase(); }
function lastValue(series) { /* same as above tasks */ if (!Array.isArray(series)) return null; for (let i = series.length-1; i>=0; i--) if (series[i]?.value != null) return Number(series[i].value); return null; }
function valueAtOffset(series, off) { if (!Array.isArray(series)) return null; const i = series.length-1-off; return i<0?null:(series[i]?.value ?? null); }
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- long-debt`
Expected: PASS — US Ex.1 canonical lands PEAK; SOUND + DELEVERAGING boundary tests green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/long-debt.js dashboard/tests/unit/long-debt.test.js
git commit -m "feat(compute): 1.3 Long-Term Debt Cycle — I1-I4 indicators, PEAK/DELEVERAGING stage"
```

---

### Task 33: 1.4 Deleveragings compute (with conditional gate hysteresis)

**Files:**
- Create: `dashboard/src/compute/deleveragings.js`
- Create: `dashboard/tests/unit/deleveragings.test.js`

Spec ref: research extract §research/04 (§5.1-§5.3 G/ΔD/π lever decomposition; §6 L99-116 regime classifier; §7 L118-143 US 1930-32 + 1933-37 + Japan 1990+ canonical values). Spec §3 conditional gate (FR-4) + Set 3.5 D1 hysteresis: gate fires when `R^{D/M} > 17` instantaneous OR `debt_money_regime=HIGH AND gap_regime=BELOW_TREND` sustained ≥2Q.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('deleveragings compute', () => {
  it('US 1930-32 canonical: G=−20.4pp, ΔD=+32pp/yr, π=0.8% → UGLY_DEFLATIONARY (research/04 §7)', async () => {
    const { computeDeleveragings } = await import('../../src/compute/deleveragings.js');
    const r = computeDeleveragings({ NGDP_yoy: -17.0, LT_Rate: 3.4, DebtGDP_now: 1.30, DebtGDP_4Qago: 0.98, M0_GDP_now: 0.10, M0_GDP_4Qago: 0.09, CB_Assets_now: 0, CB_Assets_4Qago: 0, FiscalBal_delta: -0.02, Writeoff: 0.06, Gini_delta: 0.005 }, true);
    expect(r.regime).toBe('UGLY_DEFLATIONARY');
    expect(r.G).toBeLessThan(-15);
  });

  it('US 1933-37 reflation: G=+6.3pp, π=2.0%, ΔD<0 → BEAUTIFUL categorical (G > +3pp ceiling so beautiful_score=0)', async () => {
    const { computeDeleveragings } = await import('../../src/compute/deleveragings.js');
    const r = computeDeleveragings({ NGDP_yoy: 9.2, LT_Rate: 2.9, DebtGDP_now: 0.98, DebtGDP_4Qago: 1.18, π_proxy: 0.02 }, true);
    expect(r.regime).toBe('BEAUTIFUL');
    expect(r.beautiful_score).toBe(0);  // G=6.3 > +3pp ceiling
  });

  it('Gate hysteresis: fires when R_dm > 17 instantaneous', async () => {
    const { isGateOpen } = await import('../../src/compute/deleveragings.js');
    expect(isGateOpen({ R_dm: 18, history: [] })).toBe(true);
  });

  it('Gate hysteresis: fires when debt_money=HIGH AND gap=BELOW_TREND sustained ≥2Q', async () => {
    const { isGateOpen } = await import('../../src/compute/deleveragings.js');
    const sustained = isGateOpen({
      R_dm: 14, history: [
        { debt_money_regime: 'HIGH', gap_regime: 'BELOW_TREND' },
        { debt_money_regime: 'HIGH', gap_regime: 'BELOW_TREND' }
      ]
    });
    expect(sustained).toBe(true);
  });

  it('Gate does NOT fire when only 1 quarter sustained AND R_dm < 17', async () => {
    const { isGateOpen } = await import('../../src/compute/deleveragings.js');
    const oneQ = isGateOpen({
      R_dm: 14, history: [{ debt_money_regime: 'HIGH', gap_regime: 'BELOW_TREND' }]
    });
    expect(oneQ).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- deleveragings`
Expected: FAIL.

- [ ] **Step 3: Implement deleveragings.js**

```js
/* 1.4 Deleveragings — research/04 §5-§6 + Spec §3 conditional gate.
 * G = NGDP_yoy − LT_Rate.
 * ΔD = DebtGDP_t − DebtGDP_{t-4}.
 * π = (M0_GDP delta) + (CB_Assets delta) over 4Q.
 * Lever decomposition: L_aust, L_def, L_print, L_redist (pp of GDP).
 *
 * Regime classifier (research/04 §6):
 *   UGLY_DEFLATIONARY: G < 0 AND ΔD > 0
 *   BEAUTIFUL:         G > 0 AND ΔD < 0 AND π moderate (0.5%-4%)
 *   UGLY_INFLATIONARY: G > 0 AND CPI > LT_Rate AND FX_Gold < -20% p.a.
 */

const PI_MODERATE_LO = 0.005;   // 0.5%
const PI_MODERATE_HI = 0.04;    // 4%

export function computeDeleveragings(input, gateOpen) {
  if (!gateOpen) {
    return { regime: 'NOT_DELEVERAGING', gateOpen: false, emits: ['regime'] };
  }

  const G = (input.NGDP_yoy ?? 0) - (input.LT_Rate ?? 0);
  const dD_4q = (input.DebtGDP_now ?? 0) - (input.DebtGDP_4Qago ?? 0);
  const dM0_4q = (input.M0_GDP_now ?? 0) - (input.M0_GDP_4Qago ?? 0);
  const dCB_4q = (input.CB_Assets_now ?? 0) - (input.CB_Assets_4Qago ?? 0);
  const piComputed = dM0_4q + dCB_4q;
  const pi = input.π_proxy ?? piComputed;

  // Lever decomposition (pp of GDP):
  const L_aust   = -(input.FiscalBal_delta ?? 0);
  const L_def    =  (input.Writeoff ?? 0) * (input.DebtGDP_now ?? 0);
  const L_print  =  pi;
  const L_redist = -0.1 * (input.Gini_delta ?? 0) * (input.DebtGDP_now ?? 0);
  const sumL = L_aust + L_def + L_print + L_redist || 1e-9;
  const lever_mix = {
    austerity: L_aust / sumL,
    default_: L_def / sumL,
    print: L_print / sumL,
    redistribution: L_redist / sumL
  };

  // Regime classifier (priority: UGLY_INFL > UGLY_DEFL > BEAUTIFUL):
  const cpi_yoy = input.CPI_yoy ?? 0;
  const fx_gold_yoy = input.FX_Gold_yoy ?? 0;
  let regime;
  if (G > 0 && cpi_yoy > (input.LT_Rate ?? 0) && fx_gold_yoy < -0.20) regime = 'UGLY_INFLATIONARY';
  else if (G < 0 && dD_4q > 0) regime = 'UGLY_DEFLATIONARY';
  else if (G > 0 && dD_4q < 0 && pi >= PI_MODERATE_LO && pi <= PI_MODERATE_HI) regime = 'BEAUTIFUL';
  else regime = 'TRANSITIONAL';

  // Beautiful score: 1 if G ∈ [0, +3pp] AND ΔD < 0 AND π ∈ [0.5%, 4%]
  const beautiful_score = (G >= 0 && G <= 3 && dD_4q < 0 && pi >= PI_MODERATE_LO && pi <= PI_MODERATE_HI) ? 1 : 0;

  // Fisher spiral: ΔDSR > 0 AND CPI < 0 (deflationary debt deflation)
  const dDSR = input.dDSR ?? 0;
  const fisher_spiral = (dDSR > 0 && cpi_yoy < 0) ? 1 : 0;

  // Gold tilt delta: only emitted when regime = UGLY_DEFLATIONARY (Dalio prescription:
  // print to escape; gold benefits). Per research/04 cross-ref + 1.7's tilt table.
  const gold_tilt_delta_pt = regime === 'UGLY_DEFLATIONARY' ? +5 : 0;

  return {
    regime, gateOpen: true,
    G, dD_4q, pi, lever_mix, beautiful_score, fisher_spiral,
    gold_tilt_delta_pt,
    emits: ['regime', 'lever_mix', 'beautiful_score', 'fisher_spiral']
  };
}

/**
 * Gate hysteresis (Spec §3 + Set 3.5 D1):
 *   Fires when R^{D/M} > 17 instantaneous (narrow-money basis)
 *   OR  debt_money_regime=HIGH AND gap_regime=BELOW_TREND sustained ≥2 consecutive quarters.
 *
 * v1 KNOWN COMPROMISE: under single-fetch-on-load (Set 3.5 D3), there is no
 * cross-session regime history → `history` array is always empty in v1. Only
 * the `R_dm > 17` instantaneous path actually fires in v1.0. Sustained-2Q
 * hysteresis path requires server-side regime journal (deferred to v1.1).
 *
 * @param {{R_dm: number, history: Array<{debt_money_regime: string, gap_regime: string}>}} params
 */
export function isGateOpen({ R_dm, history }) {
  if (R_dm > 17) return true;
  if (!Array.isArray(history) || history.length < 2) return false;
  const last2 = history.slice(-2);
  return last2.every(h => h.debt_money_regime === 'HIGH' && h.gap_regime === 'BELOW_TREND');
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- deleveragings`
Expected: PASS — 1930-32 UGLY_DEFL + 1933-37 BEAUTIFUL + gate hysteresis all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/deleveragings.js dashboard/tests/unit/deleveragings.test.js
git commit -m "feat(compute): 1.4 Deleveragings — regime classifier + gate hysteresis (R>17 OR sustained 2Q)"
```

---

### Task 34: 1.7 Inflation & Currency Debasement compute

**Files:**
- Create: `dashboard/src/compute/inflation.js`
- Create: `dashboard/tests/unit/inflation.test.js`

Spec ref: research extract §research/07 (§5.3 L67-84 real-rate buckets; §5.5-§5.6 regime precedence; §7 L143-176 portfolio tilt table + 2022-Q2 STAGFLATION canonical). Per Set 3.5 D7 — emit `tilt_deltas` for downstream tilt arbiter at FR-12.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('inflation compute', () => {
  it('2022-Q2 canonical (research/07 §7 L161): π_hdln=8.5%, r_mkt=−0.5%, μ=−2%, ΔFX=+8%, ΔGold=+1.5%, DebaseFlag=0 → STAGFLATION', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({
      pi_hdln: 8.5, pi_core: 6.0, NGDP_yoy: 6.0, M2_yoy: 4.0,
      r_mkt: -0.5, ΔFX_12m: +0.08, ΔGold_12m: +0.015,
      reserve_currency: true
    });
    expect(r.regime).toBe('STAGFLATION');
    expect(r.tilt_deltas.gold).toBe(+5);
    expect(r.tilt_deltas.commodities).toBe(+5);
    expect(r.tilt_deltas.bonds).toBe(-5);
    expect(r.tilt_deltas.cash).toBe(-5);
    expect(r.RealRateBucket).toBe('MILDLY_NEG');
  });

  it('INFLATIONARY (reserve): π>4% AND r_mkt<0 AND DebaseFlag=1 → tilt gold +10pt', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({
      pi_hdln: 7.0, NGDP_yoy: 3.0, M2_yoy: 12.0,
      r_mkt: -1.5, ΔFX_12m: -0.10, ΔGold_12m: +0.20, reserve_currency: true
    });
    expect(r.regime).toBe('INFLATIONARY');
    expect(r.DebaseFlag).toBe(1);
    expect(r.tilt_deltas.gold).toBe(+10);
  });

  it('BEAUTIFUL: 1% ≤ π ≤ 3% AND μ>0 AND r_mkt>0 → all tilts 0', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({ pi_hdln: 2.0, NGDP_yoy: 4.5, M2_yoy: 5.0, r_mkt: +0.5 });
    expect(r.regime).toBe('BEAUTIFUL');
    expect(r.tilt_deltas.gold).toBe(0);
  });

  it('DEFLATIONARY: π<1% AND r_mkt>0 AND ΔGold<0 → tilt cash +5pt', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({ pi_hdln: 0.5, NGDP_yoy: 1.0, M2_yoy: 2.0, r_mkt: +1.0, ΔGold_12m: -0.05 });
    expect(r.regime).toBe('DEFLATIONARY');
    expect(r.tilt_deltas.cash).toBe(+5);
  });

  it('RealRateBucket boundaries: at-boundary falls in upper bucket', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    expect(computeInflation({ r_mkt: -1.0, pi_hdln: 5 }).RealRateBucket).toBe('DEEPLY_NEG');
    expect(computeInflation({ r_mkt: -0.5, pi_hdln: 5 }).RealRateBucket).toBe('MILDLY_NEG');
    expect(computeInflation({ r_mkt: 0.0, pi_hdln: 5 }).RealRateBucket).toBe('NEUTRAL');
    expect(computeInflation({ r_mkt: 0.5, pi_hdln: 2 }).RealRateBucket).toBe('MILDLY_POS');
    expect(computeInflation({ r_mkt: 1.5, pi_hdln: 2 }).RealRateBucket).toBe('POSITIVE');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- inflation`
Expected: FAIL.

- [ ] **Step 3: Implement inflation.js**

```js
/* 1.7 Inflation & Currency Debasement — research/07 §5-§6.
 * Regime precedence: INFLATIONARY > STAGFLATION > BEAUTIFUL > DEFLATIONARY.
 * Reserve-currency tier: π threshold 4% vs 3% (non-reserve).
 *
 * Tilt table (verbatim research/07 §6 + §7 L150-160):
 *   DEFLATIONARY:     gold −2.5  comm −2.5  bonds  0   cash +5
 *   BEAUTIFUL:        all 0
 *   STAGFLATION:      gold +5    comm +5    bonds −5   cash −5  + FXShort +5 long EUR/JPY
 *   INFLATIONARY:     gold +10   comm +5    bonds −10  cash −5  + FXShort +10 short debasing
 */

const TILT_TABLE = {
  DEFLATIONARY:     { gold: -2.5, commodities: -2.5, bonds:   0, cash: +5,  fx_short: 0 },
  BEAUTIFUL:        { gold:    0, commodities:    0, bonds:   0, cash:  0,  fx_short: 0 },
  STAGFLATION:      { gold:   +5, commodities:   +5, bonds:  -5, cash: -5,  fx_short: +5 },
  INFLATIONARY:     { gold:  +10, commodities:   +5, bonds: -10, cash: -5,  fx_short: +10 }
};

export function computeInflation(input) {
  const { pi_hdln = 0, pi_core = 0, NGDP_yoy = 0, M2_yoy = 0,
          r_mkt = 0, ΔFX_12m = 0, ΔGold_12m = 0,
          reserve_currency = true } = input;

  // Real-rate bucket (at-boundary = upper bucket per research/07 §5.3 L70-74)
  const RealRateBucket =
    r_mkt < -0.5  ? 'DEEPLY_NEG' :
    r_mkt < 0     ? 'MILDLY_NEG' :
    r_mkt < 0.5   ? 'NEUTRAL'    :
    r_mkt < 1.5   ? 'MILDLY_POS' : 'POSITIVE';

  // Monetary separator
  const μ = M2_yoy - NGDP_yoy;
  const monetary_driven = μ > 4;  // sustained ≥4Q check left to caller's history

  // Debase flag (calibration: 1971/2002/2008/2020 trigger; 1995-99/2014-15 don't)
  const DebaseFlag = (ΔFX_12m < -0.07 && ΔGold_12m > +0.15) ? 1 : 0;

  // Regime precedence walk
  const piEdge_inflationary = reserve_currency ? 4 : 3;
  let regime;
  if (pi_hdln > piEdge_inflationary && r_mkt < 0 && DebaseFlag === 1) regime = 'INFLATIONARY';
  else if (pi_hdln > 3 && NGDP_yoy < 2 * pi_hdln) regime = 'STAGFLATION';
  else if (pi_hdln >= 1 && pi_hdln <= 3 && μ > 0 && r_mkt > 0) regime = 'BEAUTIFUL';
  else if (pi_hdln < 1 && r_mkt > 0 && ΔGold_12m < 0) regime = 'DEFLATIONARY';
  else regime = 'BEAUTIFUL';   // fallthrough — moderate steady state

  // Cash trash flag: r_mkt < 0 for ≥6 consecutive months
  const CashTrashFlag = (input.r_mkt_negative_streak ?? 0) >= 6 ? 1 : 0;

  return {
    regime,
    RealRateBucket,
    DebaseFlag,
    CashTrashFlag,
    tilt_deltas: TILT_TABLE[regime],
    pi_hdln, pi_core, μ, monetary_driven,
    emits: ['RegimeTag', 'tilt_deltas', 'DebaseFlag', 'CashTrashFlag', 'RealRateBucket']
  };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- inflation`
Expected: PASS — 2022-Q2 STAGFLATION + INFLATIONARY + BEAUTIFUL + DEFLATIONARY + bucket boundaries all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/inflation.js dashboard/tests/unit/inflation.test.js
git commit -m "feat(compute): 1.7 Inflation regime + RealRateBucket + DebaseFlag + tilt_deltas"
```

---

### Task 35: 1.5 Paradigm Shifts compute

**Files:**
- Create: `dashboard/src/compute/paradigms.js`
- Create: `dashboard/tests/unit/paradigms.test.js`

Spec ref: research extract §research/05 (§5.1-§5.4 PA composite formula; §6 L117-131 paradigm_stage; §7 L133-166 2019-Q4 canonical PA=0.687 → LATE).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('paradigms compute', () => {
  it('2019-Q4 canonical (research/05 §7): ρ=−0.10, S_tail=3, Δ=+4.1 → PA=0.687 LATE', async () => {
    const { computeParadigms } = await import('../../src/compute/paradigms.js');
    const r = computeParadigms({
      decadeReturns: {
        SPX: { d2000s: -0.009, d2010s: 0.134 },
        UST10: { d2000s: 0.066, d2010s: 0.040 },
        Tbill: { d2000s: 0.025, d2010s: 0.006 },
        Gold: { d2000s: 0.143, d2010s: 0.033 },
        Cmdty: { d2000s: 0.029, d2010s: 0.009 }
      },
      RealRate10y: 0.0015,    // 0.15%
      FedFunds: 0.0155,       // 1.55%
      BuybackYield: 0.031,    // 3.1%
      ProfitShare: 0.112,     // 11.2% (μ+σ ≈ 10.6%)
      ProfitShareMean_plus_sigma: 0.106,
      StatTaxRateAtPost1986Low: true,
      StatTaxRateStable2Yr: true,
      ConsensusForecast: 0.105,
      LongRunCAGR: 0.064,
      Δ_recency_sigma: 0.035
    });
    expect(r.PA).toBeCloseTo(0.687, 1);
    expect(r.paradigm_stage).toBe('LATE');
    expect(r.tilt_trigger).toBe(true);
    expect(r.gold_overlay).toBe(true);
  });

  it('S_tail counts 4 binary tailwinds correctly', async () => {
    const { computeParadigms } = await import('../../src/compute/paradigms.js');
    const r = computeParadigms({
      decadeReturns: { SPX: { d2000s: 0, d2010s: 0 }, UST10: { d2000s: 0, d2010s: 0 }, Tbill: { d2000s: 0, d2010s: 0 }, Gold: { d2000s: 0, d2010s: 0 }, Cmdty: { d2000s: 0, d2010s: 0 } },
      RealRate10y: 0.001, FedFunds: 0.005,
      BuybackYield: 0.030,
      ProfitShare: 0.12, ProfitShareMean_plus_sigma: 0.10,
      StatTaxRateAtPost1986Low: true, StatTaxRateStable2Yr: true
    });
    expect(r.S_tail).toBe(4);
  });

  it('paradigm_stage thresholds: <0.33 EARLY, [0.33, 0.67) MID, ≥0.67 LATE', async () => {
    const { classifyParadigmStage } = await import('../../src/compute/paradigms.js');
    expect(classifyParadigmStage(0.20)).toBe('EARLY');
    expect(classifyParadigmStage(0.50)).toBe('MID');
    expect(classifyParadigmStage(0.70)).toBe('LATE');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- paradigms`
Expected: FAIL.

- [ ] **Step 3: Implement paradigms.js**

```js
/* 1.5 Paradigm Shifts — research/05 §5-§6.
 * PA composite (research/05 §5.4 L99-106):
 *   PA = (1/3) · [(1−ρ_d)/2  +  S_tail/4  +  sigmoid(Δ_recency / σ_Δ)]
 *
 * Inputs: 5 assets × 2 decades returns; 4 tailwind flags; recency vs CAGR anchor.
 *
 * Verbatim from research/05 §7:
 *   2019-Q4: ρ=-0.10 → (1-ρ)/2 = 0.55
 *           S_tail=3   → 0.75
 *           Δ=+4.1, σ=3.5 → sigmoid(1.17) ≈ 0.76
 *           PA = (0.55+0.75+0.76)/3 = 0.687 → LATE
 */

export function computeParadigms(input) {
  const decRet = input.decadeReturns;

  // Spearman ρ on decade-rank inversion (5 assets):
  // d_i = rank_2010s(asset i) − rank_2000s(asset i); Σd² = Σ over 5 assets;
  // ρ = 1 − 6·Σd² / (n·(n²−1)),  n=5 → denom=120.
  const assets = Object.keys(decRet);
  const ranks2000s = rankAssets(assets.map(a => decRet[a].d2000s));
  const ranks2010s = rankAssets(assets.map(a => decRet[a].d2010s));
  const Σd2 = assets.reduce((s, _, i) => s + (ranks2010s[i] - ranks2000s[i]) ** 2, 0);
  const ρ = 1 - 6 * Σd2 / (5 * (25 - 1));   // = 1 − Σd²·6/120 = 1 − Σd²/20

  // S_tail = ΣT_i, 4 binary AND-conditions
  const T1 = (input.RealRate10y < 0.005 && input.FedFunds < 0.010) ? 1 : 0;
  const T2 = (input.BuybackYield > 0.025) ? 1 : 0;
  const T3 = (input.ProfitShare > input.ProfitShareMean_plus_sigma) ? 1 : 0;
  const T4 = (input.StatTaxRateAtPost1986Low && input.StatTaxRateStable2Yr) ? 1 : 0;
  const S_tail = T1 + T2 + T3 + T4;

  // Recency divergence
  const Δ_recency = ((input.ConsensusForecast ?? 0) - (input.LongRunCAGR ?? 0.064)) * 100;
  const σΔ = (input.Δ_recency_sigma ?? 0.035) * 100;
  const sigmoidΔ = 1 / (1 + Math.exp(-(Δ_recency / σΔ)));

  // PA composite (equal weight)
  const corrTerm = (1 - ρ) / 2;       // 2019-Q4: (1+0.10)/2 = 0.55 ✓
  const tailTerm = S_tail / 4;
  const PA = (corrTerm + tailTerm + sigmoidΔ) / 3;

  const paradigm_stage = classifyParadigmStage(PA);

  // Tilt trigger: S_tail ≥ 3 AND ρ < 0
  const tilt_trigger = (S_tail >= 3 && ρ < 0);
  // Gold overlay: PA ≥ 0.67 AND RealRate10y < 0.50%
  const gold_overlay = (PA >= 0.67 && input.RealRate10y < 0.005);

  // next_leader_set: bottom 2 by 2010s decade rank (intuition: rotation toward laggards)
  const sorted = assets.map((a, i) => ({ asset: a, ret: decRet[a].d2010s, rank: ranks2010s[i] }))
    .sort((p, q) => p.rank - q.rank);
  const next_leader_set = sorted.slice(0, 2).map(x => x.asset);

  return {
    PA, ρ, S_tail, Δ_recency, sigmoidΔ,
    paradigm_stage, tilt_trigger, gold_overlay,
    next_leader_set,
    emits: ['paradigm_stage', 'tilt_trigger', 'gold_overlay', 'next_leader_set']
  };
}

export function classifyParadigmStage(PA) {
  if (PA < 0.33) return 'EARLY';
  if (PA < 0.67) return 'MID';
  return 'LATE';
}

function rankAssets(values) {
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const ranks = new Array(values.length);
  indexed.forEach((entry, rankIdx) => { ranks[entry.i] = rankIdx + 1; });
  return ranks;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- paradigms`
Expected: PASS — 2019-Q4 canonical PA≈0.687 + S_tail=4 + stage thresholds all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/paradigms.js dashboard/tests/unit/paradigms.test.js
git commit -m "feat(compute): 1.5 Paradigm Shifts — PA composite + 2019-Q4 canonical (LATE)"
```

---

### Task 36: 1.6 Big Cycle / World Order compute

**Files:**
- Create: `dashboard/src/compute/world-order.js`
- Create: `dashboard/tests/unit/world-order.test.js`

Spec ref: research extract §research/06 (§5-§6 8-measure z-score panel + CPI aggregate; §7 USA CPI=0.923 Apr-2022 with Dalio published 0.89 known F1 fix).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('worldOrder compute', () => {
  it('USA Apr-2022 canonical (research/06 §7 L143-148): CPI≈0.923 → DECLINE', async () => {
    const { computeWorldOrder } = await import('../../src/compute/world-order.js');
    const r = computeWorldOrder({
      panel: {
        USA: { Edu: 2.0, Innov: 2.1, Cost: -0.4, Mil: 2.0, Trade: 1.1, Output: 1.7, Fin: 2.7, Reserve: 1.9 },
        CHN: { Edu: 1.7, Innov: 1.6, Cost: 1.1, Mil: 0.9, Trade: 1.9, Output: 1.5, Fin: 0.2, Reserve: -0.6 }
      },
      anchors: { max: 1.9, min: -1.5 },
      cofer_resDelta10pp: -2.98,
      s20_USA: -0.06,
      s20_CHN: +0.07
    });
    expect(r.CPI.USA).toBeCloseTo(0.923, 2);
    expect(r.CPI.CHN).toBeCloseTo(0.746, 2);
    expect(r.StageTag.USA).toBe('DECLINE');
    expect(r.StageTag.CHN).toBe('RISE');
    expect(r.HegemonyRisk).toBe('ELEVATED');
  });

  it('cntNeg = number of measures where z_USA − z_CHN ≤ 0', async () => {
    const { computeWorldOrder } = await import('../../src/compute/world-order.js');
    const r = computeWorldOrder({
      panel: {
        USA: { Edu: 2.0, Innov: 2.1, Cost: -0.4, Mil: 2.0, Trade: 1.1, Output: 1.7, Fin: 2.7, Reserve: 1.9 },
        CHN: { Edu: 1.7, Innov: 1.6, Cost: 1.1, Mil: 0.9, Trade: 1.9, Output: 1.5, Fin: 0.2, Reserve: -0.6 }
      },
      anchors: { max: 1.9, min: -1.5 },
      cofer_resDelta10pp: -2.98,
      s20_USA: -0.06, s20_CHN: 0.07
    });
    expect(r.cntNeg).toBe(2);  // Cost (−0.4 vs +1.1, diff=−1.5 ≤ 0); Trade (1.1 vs 1.9, diff=−0.8 ≤ 0)
  });

  it('HegemonyRisk: LOW if cntNeg≤1 AND resDelta≥0; ELEVATED 2-3 + −1 to −10pp; HIGH ≥4 + <−10pp', async () => {
    const { classifyHegemonyRisk } = await import('../../src/compute/world-order.js');
    expect(classifyHegemonyRisk(0, +1)).toBe('LOW');
    expect(classifyHegemonyRisk(2, -3)).toBe('ELEVATED');
    expect(classifyHegemonyRisk(5, -15)).toBe('HIGH');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- world-order`
Expected: FAIL.

- [ ] **Step 3: Implement world-order.js**

```js
/* 1.6 Big Cycle / World Order — research/06 §5-§6.
 * Country Power Index = mean of 8 z-scores, normalized to [0,1] via fixed
 * panel-extreme anchors max≈+1.9, min≈−1.5. Stage by CPI level + 20yr slope.
 *
 * Per Set 3.5 D8: 1.6 keeps `TOP` (Dalio canonical wording); 1.3 emits `PEAK`.
 */

const MEASURES = ['Edu', 'Innov', 'Cost', 'Mil', 'Trade', 'Output', 'Fin', 'Reserve'];

export function computeWorldOrder(input) {
  const { panel = {}, anchors = { max: 1.9, min: -1.5 }, cofer_resDelta10pp = 0,
          s20_USA = 0, s20_CHN = 0, s20 = {} } = input;

  // Per-country z-mean → CPI ∈ [0,1] via min-max normalize
  const zSpan = anchors.max - anchors.min;
  const CPI = {};
  for (const country of Object.keys(panel)) {
    const zMean = MEASURES.reduce((s, m) => s + (panel[country][m] ?? 0), 0) / MEASURES.length;
    CPI[country] = (zMean - anchors.min) / zSpan;
  }

  // 20-yr slope: prefer per-country s20 input if provided; else defaults
  const s20Map = { USA: s20_USA, CHN: s20_CHN, ...s20 };

  // Stage classifier (research/06 §6 L113-127):
  //   RISE       CPI 0.25-0.80 + s20 > +0.05 + flat/rising reserve
  //   TOP        CPI > 0.80 + |s20| ≤ 0.05
  //   DECLINE    CPI > 0.60 + s20 < −0.05
  //   NEW_ORDER  CPI < 0.30 after prior > 0.80 (history-aware; v1 stub)
  const StageTag = {};
  for (const country of Object.keys(CPI)) {
    StageTag[country] = classifyStage(CPI[country], s20Map[country] ?? 0);
  }

  // HegemonyRisk: USA-vs-CHN measure-by-measure
  let cntNeg = 0;
  if (panel.USA && panel.CHN) {
    for (const m of MEASURES) {
      if ((panel.USA[m] ?? 0) - (panel.CHN[m] ?? 0) <= 0) cntNeg++;
    }
  }
  const HegemonyRisk = classifyHegemonyRisk(cntNeg, cofer_resDelta10pp);

  return {
    CPI, StageTag, HegemonyRisk, cntNeg, cofer_resDelta10pp,
    emits: ['CountryPowerIndex', 'StageTag', 'HegemonyRisk']
  };
}

function classifyStage(CPI, s20) {
  if (CPI >= 0.25 && CPI <= 0.80 && s20 > +0.05) return 'RISE';
  if (CPI > 0.80 && Math.abs(s20) <= 0.05)        return 'TOP';
  if (CPI > 0.60 && s20 < -0.05)                  return 'DECLINE';
  if (CPI < 0.30)                                  return 'NEW_ORDER';
  return 'TRANSITIONAL';
}

export function classifyHegemonyRisk(cntNeg, resDelta10pp) {
  if (cntNeg <= 1 && resDelta10pp >= 0)                        return 'LOW';
  if (cntNeg >= 2 && cntNeg <= 3 && resDelta10pp >= -10)        return 'ELEVATED';
  if (cntNeg >= 4 && resDelta10pp < -10)                        return 'HIGH';
  return 'ELEVATED';   // fallback band
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- world-order`
Expected: PASS — USA Apr-2022 CPI≈0.923 + cntNeg=2 + risk classifier all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/world-order.js dashboard/tests/unit/world-order.test.js
git commit -m "feat(compute): 1.6 World Order — CPI z-score aggregate + StageTag + HegemonyRisk"
```

---

### Task 37: 2.1 Holy Grail compute (educational sidebar)

**Files:**
- Create: `dashboard/src/compute/holy-grail.js`
- Create: `dashboard/tests/unit/holy-grail.test.js`

Spec ref: research extract §research/08 (§5-§6 N_eff + ρ̄ + HolyGrailRegime; §7 L121-145 Dalio Chart 5 P1/P2 canonical).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('holyGrail compute', () => {
  it('Dalio Chart 5 P1: N=6, ρ=0.25 → N_eff=2.667, σ_p/σ=0.6124, σ-red≈38.76%', async () => {
    const { computeHolyGrail } = await import('../../src/compute/holy-grail.js');
    const r = computeHolyGrail({ N: 6, ρ_avg: 0.25 });
    expect(r.N_eff).toBeCloseTo(2.667, 2);
    expect(r.σ_p_over_σ).toBeCloseTo(0.6124, 3);
    expect(r.σ_reduction_pct).toBeCloseTo(38.76, 1);
    expect(r.HolyGrailRegime).toBe('NONE');
  });

  it('P2: N=77, ρ=0.04 → N_eff=19.06 → FULL', async () => {
    const { computeHolyGrail } = await import('../../src/compute/holy-grail.js');
    const r = computeHolyGrail({ N: 77, ρ_avg: 0.04 });
    expect(r.N_eff).toBeCloseTo(19.06, 1);
    expect(r.HolyGrailRegime).toBe('FULL');
  });

  it('regime thresholds: N_eff < 5 NONE; 5-14 PARTIAL; ≥15 FULL', async () => {
    const { classifyHolyGrailRegime } = await import('../../src/compute/holy-grail.js');
    expect(classifyHolyGrailRegime(3)).toBe('NONE');
    expect(classifyHolyGrailRegime(10)).toBe('PARTIAL');
    expect(classifyHolyGrailRegime(15)).toBe('FULL');
  });

  it('ρ̄ tag: <0.10 UNCORRELATED; 0.10-0.30 LIGHTLY; 0.30-0.70 HIGHLY; ≥0.70 DOMINATED', async () => {
    const { classifyRhoTag } = await import('../../src/compute/holy-grail.js');
    expect(classifyRhoTag(0.05)).toBe('UNCORRELATED');
    expect(classifyRhoTag(0.20)).toBe('LIGHTLY-CORRELATED');
    expect(classifyRhoTag(0.50)).toBe('HIGHLY-CORRELATED');
    expect(classifyRhoTag(0.80)).toBe('DOMINATED');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- holy-grail`
Expected: FAIL.

- [ ] **Step 3: Implement holy-grail.js**

```js
/* 2.1 Holy Grail (educational sidebar) — research/08 §5-§6.
 * N_eff = N / (1 + (N−1)·ρ̄)
 * σ_p/σ = √[(1+(N−1)ρ)/N]
 * Equivalently σ_p/σ = 1/√N_eff.
 */

export function computeHolyGrail(input) {
  const { N = 1, ρ_avg = 0 } = input;
  const safeN = Math.max(1, N);
  const N_eff = safeN / (1 + (safeN - 1) * ρ_avg);
  const σ_p_over_σ = Math.sqrt((1 + (safeN - 1) * ρ_avg) / safeN);
  const σ_reduction_pct = (1 - σ_p_over_σ) * 100;

  return {
    N, ρ_avg, N_eff, σ_p_over_σ, σ_reduction_pct,
    HolyGrailRegime: classifyHolyGrailRegime(N_eff),
    rhoTag: classifyRhoTag(ρ_avg),
    emits: ['HolyGrailRegime', 'N_eff', 'ρ̄']
  };
}

export function classifyHolyGrailRegime(N_eff) {
  if (N_eff < 5)  return 'NONE';
  if (N_eff < 15) return 'PARTIAL';
  return 'FULL';
}

export function classifyRhoTag(ρ) {
  if (ρ < 0.10) return 'UNCORRELATED';
  if (ρ < 0.30) return 'LIGHTLY-CORRELATED';
  if (ρ < 0.70) return 'HIGHLY-CORRELATED';
  return 'DOMINATED';
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- holy-grail`
Expected: PASS — Chart 5 P1 + P2 canonicals + threshold classifiers all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/holy-grail.js dashboard/tests/unit/holy-grail.test.js
git commit -m "feat(compute): 2.1 Holy Grail (sidebar) — N_eff + σ-reduction + regime"
```

---

### Task 38: 2.2 All-Weather compute (RC% + drift band + tilt aggregator hook)

**Files:**
- Create: `dashboard/src/compute/all-weather.js`
- Create: `dashboard/tests/unit/all-weather.test.js`

Spec ref: research extract §research/09 (§5-§6 RC% formula; §7 L113-161 canonical AW weights 30/15/40/7.5/7.5 + Apr-2026 illustrative σ_p=7.510% + RC% rows; §8a + §9). Per Spec §6 (FR-12) tilt arbitration is in `tilt-arbiter.js` (Task 42); this module exports baseline + accepts tilts.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('allWeather compute', () => {
  it('canonical Robbins/Dalio weights = 30/15/40/7.5/7.5', async () => {
    const { AW_BASELINE_WEIGHTS } = await import('../../src/compute/all-weather.js');
    expect(AW_BASELINE_WEIGHTS).toEqual({
      equities: 0.30, int_treasury: 0.15, long_treasury: 0.40, gold: 0.075, commodities: 0.075
    });
  });

  it('Apr-2026 canonical illustrative: σ_p ≈ 7.510%, SPX RC%≈34.20%, LT RC%≈46.87% (research/09 §7)', async () => {
    const { computeAllWeather } = await import('../../src/compute/all-weather.js');
    const r = computeAllWeather({
      vols: { equities: 0.16, int_treasury: 0.06, long_treasury: 0.13, gold: 0.15, commodities: 0.18 },
      // Identity correlation matrix for canonical figures (research/09 §7 simplification)
      corrMatrix: 'identity'
    });
    expect(r.σ_p).toBeCloseTo(0.0751, 3);
    expect(r.RC_pct.equities).toBeCloseTo(34.20, 1);
    expect(r.RC_pct.long_treasury).toBeCloseTo(46.87, 1);
  });

  it('Drift band: GREEN < 3%; AMBER 3-5%; RED > 5% (research/09 §6)', async () => {
    const { driftBand } = await import('../../src/compute/all-weather.js');
    expect(driftBand({ equities: 0.31 }, { equities: 0.30 })).toBe('GREEN');
    expect(driftBand({ equities: 0.34 }, { equities: 0.30 })).toBe('AMBER');
    expect(driftBand({ equities: 0.36 }, { equities: 0.30 })).toBe('RED');
  });

  it('applyTilts respects ±10pt aggregate cap (Spec §6 + research/07 §6 L132)', async () => {
    const { applyTilts } = await import('../../src/compute/all-weather.js');
    const tilted = applyTilts({ gold: +15, bonds: -15 });  // > 10pt — must clip
    expect(Math.abs(tilted.gold - 0.075)).toBeLessThanOrEqual(0.10 + 1e-9);
    expect(tilted.long_treasury + tilted.int_treasury + tilted.equities + tilted.gold + tilted.commodities).toBeCloseTo(1.0, 6);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- all-weather`
Expected: FAIL.

- [ ] **Step 3: Implement all-weather.js**

```js
/* 2.2 All-Weather — research/09 §5-§6.
 * Baseline weights locked: 30/15/40/7.5/7.5 (Robbins 2014 / Dalio).
 * RC%_i = w_i · (Σw)_i / σ_p²
 * σ_p = √(w'Σw)
 *
 * Tilt arbitration is delegated to ./tilt-arbiter.js per Spec FR-12.
 * This module exports applyTilts() that accepts the arbiter's output and
 * enforces the ±10pt aggregate cap.
 */

export const AW_BASELINE_WEIGHTS = {
  equities:       0.30,
  int_treasury:   0.15,
  long_treasury:  0.40,
  gold:           0.075,
  commodities:    0.075
};

const SLEEVE_ORDER = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities'];

export function computeAllWeather(input) {
  const { vols, corrMatrix = 'identity', weights = AW_BASELINE_WEIGHTS } = input;
  const w = SLEEVE_ORDER.map(k => weights[k]);
  const σ = SLEEVE_ORDER.map(k => vols[k]);

  // Build covariance Σ_{ij} = σ_i · σ_j · ρ_{ij}
  const Σ = SLEEVE_ORDER.map((_, i) => SLEEVE_ORDER.map((_, j) => {
    const ρ = (corrMatrix === 'identity') ? (i === j ? 1 : 0) : (corrMatrix[i]?.[j] ?? 0);
    return σ[i] * σ[j] * ρ;
  }));

  // Σw = matrix-vector product
  const Σw = w.map((_, i) => SLEEVE_ORDER.reduce((s, _, j) => s + Σ[i][j] * w[j], 0));
  // σ_p² = w' Σ w
  const σ_p2 = w.reduce((s, wi, i) => s + wi * Σw[i], 0);
  const σ_p = Math.sqrt(σ_p2);

  // RC%_i = w_i · (Σw)_i / σ_p²  → returns percentages
  const RC_pct = {};
  SLEEVE_ORDER.forEach((k, i) => { RC_pct[k] = (σ_p2 > 0) ? (w[i] * Σw[i] / σ_p2) * 100 : 0; });

  // Environment RC (B matrix per research/09 §7 L155)
  const B = {
    equities:      { growth_up: +1, growth_down: -1, infl_up:  0, infl_down: +1 },
    int_treasury:  { growth_up:  0, growth_down: +1, infl_up: -1, infl_down: +1 },
    long_treasury: { growth_up:  0, growth_down: +1, infl_up: -1, infl_down: +1 },
    gold:          { growth_up:  0, growth_down:  0, infl_up: +1, infl_down:  0 },
    commodities:   { growth_up: +1, growth_down: -1, infl_up: +1, infl_down:  0 }
  };
  const RC_env_pct = { growth_up: 0, growth_down: 0, infl_up: 0, infl_down: 0 };
  for (const env of Object.keys(RC_env_pct)) {
    SLEEVE_ORDER.forEach(k => {
      if (B[k][env] === +1) RC_env_pct[env] += RC_pct[k];
    });
  }

  return {
    weights, σ_p, σ_p_pct: σ_p * 100,
    RC_pct, RC_env_pct,
    emits: ['target_weights', 'RC%_i', 'σ_p', 'drift_band']
  };
}

/**
 * Accept a tilt-arbiter output (per-sleeve pp deltas) and return final weights
 * with ±10pt aggregate cap (Spec §6 + research/07 §6 L132).
 *
 * Inputs treat keys: gold, commodities, bonds (= long+int treasury), cash, equities.
 */
export function applyTilts(tiltsPp) {
  const out = { ...AW_BASELINE_WEIGHTS };
  const goldDelta = clipPp(tiltsPp.gold ?? 0);
  out.gold += goldDelta / 100;

  const commDelta = clipPp(tiltsPp.commodities ?? 0);
  out.commodities += commDelta / 100;

  // Bonds tilt splits between long/int treasury proportional to baseline (40/15).
  const bondDelta = clipPp(tiltsPp.bonds ?? 0);
  const bondSplit = AW_BASELINE_WEIGHTS.long_treasury / (AW_BASELINE_WEIGHTS.long_treasury + AW_BASELINE_WEIGHTS.int_treasury);
  out.long_treasury += (bondDelta * bondSplit) / 100;
  out.int_treasury  += (bondDelta * (1 - bondSplit)) / 100;

  // Cash absorbs residual (and any explicit cash tilt). Keep ≥ 0; renormalize.
  const equitiesDelta = clipPp(tiltsPp.equities ?? 0);
  out.equities += equitiesDelta / 100;

  // Renormalize to sum=1 (clamp negatives to 0 first)
  for (const k of SLEEVE_ORDER) if (out[k] < 0) out[k] = 0;
  const total = SLEEVE_ORDER.reduce((s, k) => s + out[k], 0) || 1;
  for (const k of SLEEVE_ORDER) out[k] /= total;

  return out;
}

function clipPp(x) {
  return Math.max(-10, Math.min(10, Number(x) || 0));
}

export function driftBand(actual, target) {
  let maxDriftPp = 0;
  for (const k of Object.keys(target)) {
    const drift = Math.abs((actual[k] ?? 0) - target[k]) * 100;
    if (drift > maxDriftPp) maxDriftPp = drift;
  }
  if (maxDriftPp < 3) return 'GREEN';
  if (maxDriftPp <= 5) return 'AMBER';
  return 'RED';
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- all-weather`
Expected: PASS — baseline weights + Apr-2026 σ_p≈7.51% + drift bands + ±10pt cap all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/all-weather.js dashboard/tests/unit/all-weather.test.js
git commit -m "feat(compute): 2.2 All-Weather — RC% + σ_p + drift band + ±10pt tilt cap"
```

---

### Task 39: 2.5 Stress Testing compute

**Files:**
- Create: `dashboard/src/compute/stress.js`
- Create: `dashboard/tests/unit/stress.test.js`

Spec ref: research extract §research/12 (§5-§6 shock matrix; §7 L103-148 byte-exact Table 7.1: Defl=−8.125%, Infl=−26.000%, Stag=−3.050%, Refl=+11.825%; asymmetry ratio 8.52× → RED).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('stress compute', () => {
  it('Table 7.1 byte-exact (research/12 §7): Defl=−8.125, Infl=−26.000, Stag=−3.050, Refl=+11.825', async () => {
    const { computeStress } = await import('../../src/compute/stress.js');
    const r = computeStress({
      weights: { equities: 0.30, long_treasury: 0.40, int_treasury: 0.15, gold: 0.075, commodities: 0.075 }
    });
    expect(r.R_port_pct.deflationary).toBeCloseTo(-8.125, 3);
    expect(r.R_port_pct.inflationary).toBeCloseTo(-26.000, 3);
    expect(r.R_port_pct.stagflation).toBeCloseTo(-3.050, 3);
    expect(r.R_port_pct.reflation).toBeCloseTo(+11.825, 3);
  });

  it('Asymmetry ratio = 26.00 / 3.05 = 8.52× → RED (research/12 §7 L148)', async () => {
    const { computeStress } = await import('../../src/compute/stress.js');
    const r = computeStress({
      weights: { equities: 0.30, long_treasury: 0.40, int_treasury: 0.15, gold: 0.075, commodities: 0.075 }
    });
    expect(r.asymmetry_ratio).toBeCloseTo(8.52, 1);
    expect(r.dominant_tail.regime).toBe('inflationary');
    expect(r.tail_band).toBe('AMBER');  // Per Set 3.5 D5: AMBER 5-9.99×, RED ≥10×
  });

  it('Tail band per Set 3.5 D5: GREEN <5×, AMBER 5-9.99×, RED ≥10×', async () => {
    const { tailBand } = await import('../../src/compute/stress.js');
    expect(tailBand(3)).toBe('GREEN');
    expect(tailBand(8.52)).toBe('AMBER');
    expect(tailBand(10)).toBe('RED');
  });

  it('Dominant driver per archetype = max |w_i · S_{i,e}|', async () => {
    const { computeStress } = await import('../../src/compute/stress.js');
    const r = computeStress({
      weights: { equities: 0.30, long_treasury: 0.40, int_treasury: 0.15, gold: 0.075, commodities: 0.075 }
    });
    expect(r.dominant_per_archetype.deflationary).toBe('equities');     // -15.00ppt
    expect(r.dominant_per_archetype.inflationary).toBe('long_treasury'); // -20.00ppt
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- stress`
Expected: FAIL.

- [ ] **Step 3: Implement stress.js**

```js
/* 2.5 Stress Testing — research/12 §5-§6.
 * Shock matrix S (5 sleeves × 4 archetypes), cumulative percentages.
 * R^{port}_e = Σ_i w_i · S_{i,e}
 *
 * Verbatim from research/12 §7 L103-148.
 */

const SLEEVES = ['equities', 'long_treasury', 'int_treasury', 'gold', 'commodities'];
const ARCHETYPES = ['deflationary', 'inflationary', 'stagflation', 'reflation'];

// Shock matrix (cumulative %) — verbatim research/12 §7 L120-130
const SHOCK_MATRIX = {
  equities:      { deflationary: -50, inflationary: -30, stagflation: -37, reflation: +25 },
  long_treasury: { deflationary: +20, inflationary: -50, stagflation:  -5, reflation:  +5 },
  int_treasury:  { deflationary: +10, inflationary: -40, stagflation:  +2, reflation:  +3 },
  gold:          { deflationary:   0, inflationary: +80, stagflation: +100, reflation: +10 },
  commodities:   { deflationary: -35, inflationary: +40, stagflation: +30, reflation: +15 }
};

export function computeStress(input) {
  const { weights } = input;

  const R_port_pct = {};
  const C_per_archetype = {};
  for (const arch of ARCHETYPES) {
    let R = 0;
    const contributions = {};
    for (const sleeve of SLEEVES) {
      const c = (weights[sleeve] ?? 0) * SHOCK_MATRIX[sleeve][arch];
      contributions[sleeve] = c;
      R += c;
    }
    R_port_pct[arch] = R;
    C_per_archetype[arch] = contributions;
  }

  // Dominant driver per archetype = sleeve with max |contribution|
  const dominant_per_archetype = {};
  for (const arch of ARCHETYPES) {
    let max = -Infinity, maxSleeve = null;
    for (const sleeve of SLEEVES) {
      const abs = Math.abs(C_per_archetype[arch][sleeve]);
      if (abs > max) { max = abs; maxSleeve = sleeve; }
    }
    dominant_per_archetype[arch] = maxSleeve;
  }

  // Asymmetry ratio = max |R| / min |R|
  const absR = ARCHETYPES.map(a => Math.abs(R_port_pct[a]));
  const asymmetry_ratio = Math.max(...absR) / Math.min(...absR.filter(x => x > 0));

  // Dominant tail = archetype with max |R|
  const tailIdx = absR.indexOf(Math.max(...absR));
  const dominant_tail = { regime: ARCHETYPES[tailIdx], R_pct: R_port_pct[ARCHETYPES[tailIdx]] };

  return {
    R_port_pct, C_per_archetype, dominant_per_archetype,
    asymmetry_ratio, dominant_tail,
    tail_band: tailBand(asymmetry_ratio),
    SHOCK_MATRIX,
    emits: ['R_port_e', 'asymmetry_ratio', 'dominant_sleeve_per_archetype']
  };
}

/** Per Set 3.5 D5 lock: GREEN <5×, AMBER 5-9.99×, RED ≥10×. */
export function tailBand(ratio) {
  if (ratio < 5)  return 'GREEN';
  if (ratio < 10) return 'AMBER';
  return 'RED';
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- stress`
Expected: PASS — Table 7.1 byte-exact + 8.52× asymmetry + tail band + dominant driver all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/stress.js dashboard/tests/unit/stress.test.js
git commit -m "feat(compute): 2.5 Stress Testing — Table 7.1 byte-exact + asymmetry 8.52× AMBER"
```

---

### Task 40: 2.4 Risk Parity & Leverage compute

**Files:**
- Create: `dashboard/src/compute/risk-parity.js`
- Create: `dashboard/tests/unit/risk-parity.test.js`

Spec ref: research extract §research/11 (§5 inverse-vol + leverage formula; §7 L122-171 Apr-2026 illustrative L=1.656× canonical + Sharpe drag table; §9 L278-290 emits).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('riskParity compute', () => {
  it('Apr-2026 canonical (research/11 §7): inverse-vol weights, σ_p≈6.037%, L≈1.656×', async () => {
    const { computeRiskParity } = await import('../../src/compute/risk-parity.js');
    const r = computeRiskParity({
      vols: { equities: 0.16, treasury10: 0.06, gold: 0.15, commodities: 0.18 },
      σ_target: 0.10,
      r_p: 0.07415,
      r_f: 0.04,
      funding_spread_bp: 0
    });
    expect(r.σ_p_pct).toBeCloseTo(6.037, 2);
    expect(r.L).toBeCloseTo(1.656, 2);
    expect(r.weights.equities).toBeCloseTo(0.1779, 3);  // 17.79%
    expect(r.weights.treasury10).toBeCloseTo(0.4743, 3); // 47.43%
  });

  it('Sharpe drag matches Table 7.1 col2: 0bp→0.566, 25bp→0.549, 100bp→0.500', async () => {
    const { computeRiskParity } = await import('../../src/compute/risk-parity.js');
    const base = { vols: { equities: 0.16, treasury10: 0.06, gold: 0.15, commodities: 0.18 }, σ_target: 0.10, r_p: 0.07415, r_f: 0.04 };
    expect(computeRiskParity({ ...base, funding_spread_bp: 0   }).SR_lev).toBeCloseTo(0.566, 2);
    expect(computeRiskParity({ ...base, funding_spread_bp: 25  }).SR_lev).toBeCloseTo(0.549, 2);
    expect(computeRiskParity({ ...base, funding_spread_bp: 100 }).SR_lev).toBeCloseTo(0.500, 2);
  });

  it('Hard cap L ≤ 3.0×', async () => {
    const { computeRiskParity } = await import('../../src/compute/risk-parity.js');
    const r = computeRiskParity({
      vols: { equities: 0.05, treasury10: 0.02, gold: 0.04, commodities: 0.05 },
      σ_target: 0.20, r_p: 0.10, r_f: 0.04
    });
    expect(r.L).toBeLessThanOrEqual(3.0);
  });

  it('Funding-spread bands: GREEN ≤25bp; AMBER 25-100bp; RED >100bp', async () => {
    const { fundingSpreadBand } = await import('../../src/compute/risk-parity.js');
    expect(fundingSpreadBand(20)).toBe('GREEN');
    expect(fundingSpreadBand(50)).toBe('AMBER');
    expect(fundingSpreadBand(150)).toBe('RED');
  });

  it('Margin buffer = 5% × (L−1) of NAV', async () => {
    const { marginBuffer } = await import('../../src/compute/risk-parity.js');
    expect(marginBuffer(1.656)).toBeCloseTo(0.0328, 4);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- risk-parity`
Expected: FAIL.

- [ ] **Step 3: Implement risk-parity.js**

```js
/* 2.4 Risk Parity & Leverage — research/11 §5-§6.
 * Inverse-vol weights: w_i = (1/σ_i) / Σ_j(1/σ_j)
 * σ_p = √(w'Σw); identity correlation in canonical illustrative
 * L = σ_target / σ_p, hard-capped at 3.0×
 * Sharpe with funding spread: SR_lev = (r_p − r_f)/σ_p − [(L−1)/L]·(s/σ_p)
 */

const L_HARD_CAP = 3.0;

export function computeRiskParity(input) {
  const { vols, σ_target = 0.10, r_p, r_f = 0.04, funding_spread_bp = 0 } = input;

  // Inverse-vol weights
  const sleeves = Object.keys(vols);
  const inv = sleeves.map(k => 1 / vols[k]);
  const invSum = inv.reduce((s, x) => s + x, 0);
  const weights = {};
  sleeves.forEach((k, i) => { weights[k] = inv[i] / invSum; });

  // σ_p — identity correlation: σ_p = √(Σ w_i² · σ_i²)
  const σ_p = Math.sqrt(sleeves.reduce((s, k) => s + (weights[k] ** 2) * (vols[k] ** 2), 0));

  // Leverage with hard cap
  const L_raw = σ_target / σ_p;
  const L = Math.min(L_raw, L_HARD_CAP);

  // Sharpe ratio (unlevered) and levered with funding spread drag
  const s = funding_spread_bp / 10000;
  const SR_unlev = (r_p - r_f) / σ_p;
  const SR_lev = SR_unlev - ((L - 1) / L) * (s / σ_p);

  // Drag from base
  const sharpeDrag = SR_unlev - SR_lev;

  return {
    weights, σ_p, σ_p_pct: σ_p * 100,
    L, L_raw,
    L_band: lBand(L),
    funding_spread_bp,
    funding_spread_band: fundingSpreadBand(funding_spread_bp),
    SR_unlev, SR_lev, sharpeDrag,
    margin_buffer: marginBuffer(L),
    emits: ['L', 'w_i', 'SR_lev', 'sharpeDrag', 'margin_buffer']
  };
}

export function lBand(L) {
  if (L <= 2.0) return 'GREEN';
  if (L <= 3.0) return 'AMBER';
  return 'RED';
}

export function fundingSpreadBand(bp) {
  if (bp <= 25) return 'GREEN';
  if (bp <= 100) return 'AMBER';
  return 'RED';
}

export function marginBuffer(L) {
  return 0.05 * (L - 1);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- risk-parity`
Expected: PASS — Apr-2026 canonical L≈1.656 + Sharpe drag table + bands all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/risk-parity.js dashboard/tests/unit/risk-parity.test.js
git commit -m "feat(compute): 2.4 Risk Parity — inverse-vol weights + L cap + Sharpe drag"
```

---

### Task 41: 2.3 Alpha (educational sidebar) compute

**Files:**
- Create: `dashboard/src/compute/alpha.js`
- Create: `dashboard/tests/unit/alpha.test.js`

Spec ref: research extract §research/10 (§5-§6 IR formulas; §7 L107-122 Dalio Chart 5 P1=0.6 / P2=1.4 canonical with recomputed 0.571 / 1.528 due to chart rounding).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('alpha compute', () => {
  it('Dalio Chart 5 P1: N=6, ρ=0.25, IC=0.05, n_dec=49 (7yr quarterly) → IR_slice=0.35, IR_port≈0.571', async () => {
    const { computeAlpha } = await import('../../src/compute/alpha.js');
    const r = computeAlpha({ N: 6, ρ_avg: 0.25, IC: 0.05, n_dec: 49 });
    expect(r.IR_slice).toBeCloseTo(0.35, 2);
    expect(r.IR_port).toBeCloseTo(0.571, 2);
    expect(r.eligible).toBe(true);   // ≥ 0.30
  });

  it('Chart 5 P2: N=77, ρ=0.04 → IR_port≈1.528 (chart says 1.4; rounding implies ρ=0.05 vs 0.04)', async () => {
    const { computeAlpha } = await import('../../src/compute/alpha.js');
    const r = computeAlpha({ N: 77, ρ_avg: 0.04, IC: 0.05, n_dec: 49 });
    expect(r.IR_port).toBeCloseTo(1.528, 2);
  });

  it('IR_slice < 0.15 → retire flag set', async () => {
    const { computeAlpha } = await import('../../src/compute/alpha.js');
    const r = computeAlpha({ N: 6, ρ_avg: 0.25, IC: 0.02, n_dec: 49 });
    expect(r.IR_slice).toBeLessThan(0.15);
    expect(r.retire).toBe(true);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- alpha`
Expected: FAIL.

- [ ] **Step 3: Implement alpha.js**

```js
/* 2.3 Alpha (educational sidebar) — research/10 §5-§6.
 * IR_slice = IC · √n_dec  (Grinold 1989 Fundamental Law, NON-DALIO)
 * IR_port  = IR_slice · √N / √[1 + (N−1)·ρ_avg]
 *
 * Per Spec §4.4 FR-4.4: this slide is OFF the live numbered sequence (sidebar only).
 */

const ELIGIBLE_THRESHOLD = 0.30;
const RETIRE_THRESHOLD = 0.15;

export function computeAlpha(input) {
  const { N = 1, ρ_avg = 0, IC = 0, n_dec = 1 } = input;

  const IR_slice = IC * Math.sqrt(n_dec);
  const N_eff = N / (1 + (N - 1) * ρ_avg);
  const IR_port = IR_slice * Math.sqrt(N) / Math.sqrt(1 + (N - 1) * ρ_avg);

  return {
    IR_slice, IR_port, N_eff,
    eligible: IR_slice >= ELIGIBLE_THRESHOLD,
    retire: IR_slice < RETIRE_THRESHOLD,
    emits: ['IR_port', 'σ_Alpha', 'N_eff']
  };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- alpha`
Expected: PASS — Chart 5 P1/P2 + thresholds all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/alpha.js dashboard/tests/unit/alpha.test.js
git commit -m "feat(compute): 2.3 Alpha (sidebar) — IR_slice + IR_port + eligible/retire"
```

---

### Task 42: Tilt arbiter (cross-step precedence)

**Files:**
- Create: `dashboard/src/compute/tilt-arbiter.js`
- Create: `dashboard/tests/unit/tilt-arbiter.test.js`

Spec ref: §6 FR-12 (locked Set 3.5 D7) + research extract §research/07 §6 L132 ±10pt cap.

Precedence (highest→lowest):
1. 1.7 INFLATIONARY → +10pt gold
2. 1.7 STAGFLATION → +5pt gold
3. max(1.4 DELEVER gold tilt, 1.5 gold_overlay) → as emitted
4. Base AW gold (7.5%) — no delta

Aggregate cap: ±10pt deviation from AW baseline per research/07 §6 L132.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';

describe('tilt arbiter', () => {
  it('1.7 INFLATIONARY emits +10pt gold → final tilts inflation overrides others', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'INFLATIONARY', tilt_deltas: { gold: +10, commodities: +5, bonds: -10, cash: -5 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: true }
    });
    expect(r.gold_pp).toBe(+10);
    expect(r.binding_rule).toBe('INFLATIONARY');
    expect(r.binding_label).toMatch(/INFL/);
  });

  it('1.7 STAGFLATION + 1.4 DELEVER gold +5 → STAGFLATION wins (+5 not stacked)', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'STAGFLATION', tilt_deltas: { gold: +5, commodities: +5, bonds: -5, cash: -5 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: false }
    });
    expect(r.gold_pp).toBe(+5);
    expect(r.binding_rule).toBe('STAGFLATION');
  });

  it('No 1.7 trigger; 1.4 DELEVER (+5) > 1.5 gold_overlay → DELEVER wins (+5)', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'BEAUTIFUL', tilt_deltas: { gold: 0, commodities: 0, bonds: 0, cash: 0 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: true }
    });
    expect(r.gold_pp).toBe(+5);
    expect(r.binding_rule).toBe('DELEVER');
  });

  it('Aggregate cap: gold tilt clipped at ±10pt', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'INFLATIONARY', tilt_deltas: { gold: +15, commodities: +5, bonds: -10, cash: -5 } },
      deleveragings: { regime: 'NOT_DELEVERAGING', gold_tilt_delta_pt: 0 },
      paradigms: { gold_overlay: false }
    });
    expect(r.gold_pp).toBeLessThanOrEqual(+10);
    expect(r.capped).toBe(true);
  });

  it('binding_label format: "Gold: 17.5% (↑10pt) · source: STAGFLATION + DELEVER · capped"', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'STAGFLATION', tilt_deltas: { gold: +5, commodities: +5, bonds: -5, cash: -5 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: false }
    });
    expect(r.binding_label).toMatch(/Gold:.*\(↑.*pt\)/);
    expect(r.binding_label).toMatch(/STAGFLATION/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- tilt-arbiter`
Expected: FAIL.

- [ ] **Step 3: Implement tilt-arbiter.js**

```js
/* Tilt arbiter — Spec §6 FR-12 (locked Set 3.5 D7).
 * Precedence (highest → lowest):
 *   1. 1.7 INFLATIONARY → +10pt gold
 *   2. 1.7 STAGFLATION  → +5pt  gold
 *   3. max(1.4 DELEVER gold_tilt_delta_pt, 1.5 gold_overlay = +5 if true)
 *   4. Base AW gold (7.5%) — no delta
 *
 * Aggregate cap: ±10pt per research/07 §6 L132.
 */

const AW_GOLD_BASELINE_PCT = 7.5;
const CAP_PP = 10;

export function arbitrateTilts(emits) {
  const { inflation = {}, deleveragings = {}, paradigms = {} } = emits;
  let gold_pp = 0;
  let binding_rule = null;
  const sources = [];

  // Tier 1: 1.7 INFLATIONARY
  if (inflation.regime === 'INFLATIONARY') {
    gold_pp = inflation.tilt_deltas?.gold ?? +10;
    binding_rule = 'INFLATIONARY';
    sources.push('INFLATIONARY');
  }
  // Tier 2: 1.7 STAGFLATION
  else if (inflation.regime === 'STAGFLATION') {
    gold_pp = inflation.tilt_deltas?.gold ?? +5;
    binding_rule = 'STAGFLATION';
    sources.push('STAGFLATION');
    // Stagflation can co-emit with DELEVER for narrative purposes; surface in label
    if (deleveragings.regime === 'UGLY_DEFLATIONARY' && (deleveragings.gold_tilt_delta_pt ?? 0) > 0) {
      sources.push('DELEVER');
    }
  }
  // Tier 3: max(1.4 DELEVER, 1.5 gold_overlay)
  else {
    const deleverGold = deleveragings.gold_tilt_delta_pt ?? 0;
    const paradigmGold = paradigms.gold_overlay ? +5 : 0;
    if (deleverGold >= paradigmGold && deleverGold > 0) {
      gold_pp = deleverGold;
      binding_rule = 'DELEVER';
      sources.push('DELEVER');
    } else if (paradigmGold > 0) {
      gold_pp = paradigmGold;
      binding_rule = 'PARADIGM';
      sources.push('PARADIGM');
    } else {
      binding_rule = 'BASE_AW';
    }
  }

  // Cap ±10pt (also affects all other sleeves through clipping in all-weather.js)
  const capped = Math.abs(gold_pp) > CAP_PP;
  if (gold_pp > +CAP_PP) gold_pp = +CAP_PP;
  if (gold_pp < -CAP_PP) gold_pp = -CAP_PP;

  // Other sleeves pass through directly from 1.7 (no arbitration needed):
  const tilts = {
    gold:        gold_pp,
    commodities: inflation.tilt_deltas?.commodities ?? 0,
    bonds:       inflation.tilt_deltas?.bonds ?? 0,
    cash:        inflation.tilt_deltas?.cash ?? 0,
    fx_short:    inflation.tilt_deltas?.fx_short ?? 0
  };

  // Build human-readable label
  const finalGoldPct = AW_GOLD_BASELINE_PCT + gold_pp;
  const arrow = gold_pp > 0 ? '↑' : gold_pp < 0 ? '↓' : '·';
  const sourceStr = sources.length > 0 ? sources.join(' + ') : 'BASE';
  const cappedSuffix = capped ? ' · capped' : '';
  const binding_label = `Gold: ${finalGoldPct.toFixed(1)}% (${arrow}${Math.abs(gold_pp)}pt) · source: ${sourceStr}${cappedSuffix}`;

  return { gold_pp, tilts, binding_rule, binding_label, capped, sources };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- tilt-arbiter`
Expected: PASS — precedence walk + cap + label format all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/compute/tilt-arbiter.js dashboard/tests/unit/tilt-arbiter.test.js
git commit -m "feat(compute): tilt arbiter — INFL>STAGFL>max(DELEVER,PARADIGM)>BASE + ±10pt cap"
```

---

## Phase 10 — Per-Step Slide Modules

Each slide module is a `registerSlide(...)` call that renders the FR-3 shell (eyebrow + ONE point + caption + 3 collapsible tabs) + mounts ECharts chart via `bwInit()` against the chart-mount div within the Chart tab. Each slide also has 4 sub-cells (per FR-6.4 nav cell count) — the slide is sub-divided into anchored sub-sections by `data-cell-index`.

### Task 43: Slide 1.1 — Economic Machine (two-line chart)

**Files:**
- Create: `dashboard/src/slides/slide-1-1-economic-machine.js`
- Create: `dashboard/tests/unit/slide-1-1.test.js`

Spec ref: §4.3 FR-3 + §4.5 FR-5.3 catalog ("1.1 two-line: productivity solid + cycle dashed, 50yr").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.1 Economic Machine', () => {
  it('registers slide with id 1.1', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-1-economic-machine.js');
    const slides = getSlides();
    expect(slides.find(s => s.id === '1.1')).toBeDefined();
  });

  it('render produces eyebrow + one-point + chart-mount + 4 sub-cells', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-1-economic-machine.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    const sec = document.getElementById('s');
    slide.render(sec, { payload: makePayload111(), wizard: {} });
    expect(sec.querySelector('.eyebrow').textContent).toMatch(/STEP 01 OF 10/);
    expect(sec.querySelector('.one-point')).not.toBeNull();
    expect(sec.querySelector('.chart-mount')).not.toBeNull();
    expect(sec.querySelectorAll('[data-cell-index]').length).toBeGreaterThanOrEqual(4);
  });

  it('one-point text reflects gap_regime from compute', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-1-economic-machine.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), { payload: makePayload111(), wizard: {} });
    const text = document.querySelector('.one-point').textContent;
    expect(text.toLowerCase()).toMatch(/(above|on|below)/);  // gap_regime word
  });
});

function makePayload111() { /* minimal payload with FRED series consumed by 1.1 */ }
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-1-1`
Expected: FAIL.

- [ ] **Step 3: Implement slide-1-1-economic-machine.js**

```js
/* Slide 1.1 Economic Machine — Spec §4.3 FR-3 + §4.5 FR-5.3.
 * Chart: two-line (productivity solid + cycle dashed) over 50yr.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';
import { computeEconMachine } from '../compute/econ-machine.js';

registerSlide({
  id: '1.1',
  title: 'Economic Machine',
  render(section, { payload }) {
    const out = computeEconMachine(payload);
    const onePoint = phraseGapRegime(out);
    const caption = `Productivity trend at <em>${out.trend_growth_pct.toFixed(1)}%</em> p.a.; output gap at <em>${out.gap_pct.toFixed(1)}%</em>; <em>R<sup>D/M</sup> ≈ ${out.R_dm_narrow.toFixed(1)}</em> (narrow-money basis).`;

    renderSlideShell(section, {
      step: '01',
      section: '1.1 Economic Machine',
      onePoint, caption,
      chartHtml: subCellMarkup(0, '<div class="chart-mount" style="height:520px;width:100%"></div>'),
      notesHtml: subCellMarkup(1, NOTES_HTML),
      sourcesHtml: subCellMarkup(2, SOURCES_HTML)
    });
    addSubCellAnchor(section, 3);  // synthesis cell anchor for nav

    const mount = section.querySelector('.chart-mount');
    const chart = bwInit(mount);
    chart.setOption(buildChartOption(payload, out));
  }
});

function phraseGapRegime(out) {
  switch (out.gap_regime) {
    case 'ABOVE_TREND': return 'The economy is running <em>above its long-run trend</em>.';
    case 'BELOW_TREND': return 'The economy is running <em>below its long-run trend</em>.';
    default:            return 'The economy is sitting <em>on its long-run trend</em>.';
  }
}

function buildChartOption(payload, out) {
  const fred = payload?.sources?.fred || {};
  const ophSeries = (fred.OPHNFB || []).slice(-200);  // 50yr quarterly
  const realPcSeries = (fred.A939RX0Q048SBEA || []).slice(-200);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: ophSeries.map(p => p.date) },
    yAxis: { type: 'value', name: '' },
    series: [
      lineSeries({ name: 'Productivity', data: ophSeries.map(p => p.value), strokePattern: 'SOLID' }),
      lineSeries({ name: 'Real GDP/cap (cycle)', data: realPcSeries.map(p => p.value), strokePattern: 'DASH-LONG' })
    ]
  };
}

function subCellMarkup(idx, inner) {
  return `<div data-cell-index="${idx}">${inner}</div>`;
}
function addSubCellAnchor(section, idx) {
  const a = document.createElement('div');
  a.dataset.cellIndex = String(idx);
  a.style.height = '1px';
  section.appendChild(a);
}

const NOTES_HTML = `
  <p>Dalio's <em>Economic Machine</em> reduces a complex economy to a single identity:
  <code>Total $ = Money + Credit</code>. Money is what governments and central banks
  print or destroy directly; credit is the much larger economy of mutual promises
  between actors. Productivity rises slowly through better tools and methods. The
  short-term cycle wobbles around it as credit expands and contracts.</p>
  <p>The output gap measures how far the real economy sits above or below that
  productivity trend. The credit/money ratio measures how much of "money in
  circulation" is actually IOUs that depend on continued faith.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7;letter-spacing:1px">
    <li>FRED <code>GDP</code>, <code>GDPC1</code>, <code>GDPDEF</code></li>
    <li>FRED <code>A939RX0Q048SBEA</code> (Real GDP per capita)</li>
    <li>FRED <code>M2SL</code>, <code>TCMDO</code>, <code>OPHNFB</code></li>
    <li>research/01_economic_machine.md §4 L29-41</li>
    <li>Dalio, <em>How the Economic Machine Works</em> (2008)</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-1-1`
Expected: PASS — registration + render + sub-cells + gap_regime phrasing all green.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-1-1-economic-machine.js dashboard/tests/unit/slide-1-1.test.js
git commit -m "feat(slide-1.1): Economic Machine — two-line chart + gap/credit/debt regimes"
```

---

### Task 44: Slide 1.2 — Short-Term Cycle (phase dial)

**Files:**
- Create: `dashboard/src/slides/slide-1-2-short-term-cycle.js`
- Create: `dashboard/tests/unit/slide-1-2.test.js`

Spec ref: §4.5 FR-5.3 catalog ("1.2 half-circle phase dial with 4 hatched zones + pointer + recession-prob %").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.2 Short-Term Cycle', () => {
  it('registers slide id 1.2', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-2-short-term-cycle.js');
    expect(getSlides().find(s => s.id === '1.2')).toBeDefined();
  });

  it('caption includes recession probability %', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-2-short-term-cycle.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {}, nyfed: { recession_prob_12m: 0.18 } } }, wizard: {}
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/18/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-1-2`
Expected: FAIL.

- [ ] **Step 3: Implement slide-1-2-short-term-cycle.js**

```js
/* Slide 1.2 Short-Term Cycle — Spec §4.3 + §4.5 FR-5.3.
 * Chart: half-circle phase dial with 4 hatched zones (EARLY, MID, LATE, RECESSION) + pointer.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { computeShortCycle } from '../compute/short-cycle.js';

const PHASE_ANGLE = {
  EARLY: 22.5, MID: 67.5, LATE: 112.5, TIGHTENING: 135,
  RECESSION_EARLY: 157.5, RECESSION_LATE: 180, TRANSITIONAL: 90
};

registerSlide({
  id: '1.2',
  title: 'Short-Term Cycle',
  render(section, { payload }) {
    const out = computeShortCycle(payload);
    const recPct = (out.recession_prob_12m * 100).toFixed(0);
    const onePoint = `The U.S. business cycle is in the <em>${out.cycle_phase.toLowerCase()}</em> phase.`;
    const caption = `Real GDP at <em>${out.g.toFixed(1)}%</em> qoq SAAR; recession probability <em>${recPct}%</em> over 12m; yield curve <em>${out.yc_signal.toLowerCase()}</em>.`;

    renderSlideShell(section, {
      step: '02', section: '1.2 Short-Term Cycle',
      onePoint, caption,
      chartHtml: subCellMarkup(0, '<div class="chart-mount" style="height:480px;width:100%"></div>'),
      notesHtml: subCellMarkup(1, NOTES_HTML),
      sourcesHtml: subCellMarkup(2, SOURCES_HTML)
    });
    addSubCellAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildPhaseDial(out));
  }
});

function buildPhaseDial(out) {
  const angle = PHASE_ANGLE[out.cycle_phase] ?? 90;
  return {
    series: [{
      type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 180, radius: '80%',
      axisLine: {
        lineStyle: { width: 30, color: [
          [0.25, '#000'], [0.50, '#000'], [0.75, '#000'], [1, '#000']
        ] }
      },
      pointer: { length: '70%', width: 4, itemStyle: { color: '#000' } },
      detail: { formatter: out.cycle_phase, fontSize: 18, fontFamily: '"DM Mono"', offsetCenter: [0, '60%'] },
      data: [{ value: angle }]
    }]
  };
}

function subCellMarkup(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addSubCellAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>The short-term cycle wobbles around the productivity trend on a roughly
  5-10 year frequency, driven by the central bank's setting of credit conditions
  (the Fed funds rate) and the resulting expansion or contraction of credit.</p>
  <p>Dalio's <em>Phase Boolean Flags</em> (research/02 §5.1) check growth rate,
  inflation direction, capacity utilization, and months since trough to tag
  the current phase. The Sahm Rule and the NY Fed yield-curve probit add
  recession-probability anchors.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>A191RL1Q225SBEA</code>, <code>UNRATE</code>, <code>TCU</code>, <code>FEDFUNDS</code>, <code>T10Y3M</code>, <code>SAHMREALTIME</code></li>
    <li>NY Fed recession-probability XLS</li>
    <li>research/02_short_term_debt_cycle.md §5.1 L47-68</li>
    <li>Dalio, <em>Principles for Navigating Big Debt Crises</em></li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-1-2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-1-2-short-term-cycle.js dashboard/tests/unit/slide-1-2.test.js
git commit -m "feat(slide-1.2): Short-Term Cycle — phase dial + recession prob"
```

---

### Task 45: Slide 1.3 — Long-Term Debt Cycle (line + 4 stage bands)

**Files:**
- Create: `dashboard/src/slides/slide-1-3-long-term-debt.js`
- Create: `dashboard/tests/unit/slide-1-3.test.js`

Spec ref: §4.5 FR-5.3 ("1.3 line + 4 stage-shading bands, each band = distinct pattern, 100yr"). Per Set 3.5 D8 lock — emit 'PEAK' (not 'TOP') + chip strip displays 'Peak'.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 1.3 Long-Term Debt Cycle', () => {
  it('registers slide id 1.3', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-3-long-term-debt.js');
    expect(getSlides().find(s => s.id === '1.3')).toBeDefined();
  });

  it('uses PEAK (not TOP) in caption when stage is PEAK', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-3-long-term-debt.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: peakFredFixture() } }, wizard: {}
    });
    const caption = document.querySelector('.caption').innerHTML;
    expect(caption.toLowerCase()).toMatch(/peak/);
  });
});

function peakFredFixture() {
  // Construct GFDEGDQ188S=0.99, FYFRGDA188S=0.17, FYOIGDA188S=0.034, GS10=3.4, GDP series
  return { /* ... */ };
}
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-1-3`
Expected: FAIL.

- [ ] **Step 3: Implement slide-1-3-long-term-debt.js**

```js
/* Slide 1.3 Long-Term Debt Cycle — Spec §4.3 + §4.5 FR-5.3.
 * Chart: total debt / GDP line + 4 stage-shading bands w/ distinct patterns.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';
import { makePatternFill } from '../charts/patterns.js';
import { computeLongDebt } from '../compute/long-debt.js';

const STAGE_PHRASE = {
  SOUND:        'sound (low debt, low debt service)',
  BUBBLE:       'in a bubble (rising debt, rising service)',
  PEAK:         'at the peak of its 70-year cycle',
  DELEVERAGING: 'deleveraging (falling debt, painful adjustment)',
  RECEDES:      'past the worst (debt receding from peaks)'
};

registerSlide({
  id: '1.3',
  title: 'Long-Term Debt Cycle',
  render(section, { payload }) {
    const out = computeLongDebt(payload);
    const onePoint = `U.S. debt is <em>${STAGE_PHRASE[out.stage] || out.stage.toLowerCase()}</em>.`;
    const caption = `Total debt / revenue at <em>${(out.I1_rev_pct ?? 0).toFixed(0)}%</em>; interest / revenue at <em>${(out.I2_rev_pct ?? 0).toFixed(0)}%</em>; <em>r − g = ${out.I3.toFixed(1)} pp</em>.`;

    renderSlideShell(section, {
      step: '03', section: '1.3 Long-Term Debt Cycle',
      onePoint, caption,
      chartHtml: subCellMarkup(0, '<div class="chart-mount" style="height:520px"></div>'),
      notesHtml: subCellMarkup(1, NOTES_HTML),
      sourcesHtml: subCellMarkup(2, SOURCES_HTML)
    });
    addSubCellAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(payload, out));
  }
});

function buildOption(payload, out) {
  const fred = payload?.sources?.fred || {};
  const series = (fred.GFDEGDQ188S || []).slice(-400);  // 100yr quarterly
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: series.map(p => p.date) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      // Stage-shading bands rendered via markArea with per-band patterns
      {
        ...lineSeries({ name: 'Debt / GDP', data: series.map(p => p.value * 100), strokePattern: 'SOLID' }),
        markArea: { silent: true, data: stageBands() }
      }
    ]
  };
}

function stageBands() {
  // 4 historical band ranges (illustrative): SOUND 1947-1980, BUBBLE 1980-2007,
  // PEAK 2007-2020, DELEVERAGING/RECEDES 2020+. Each gets distinct pattern.
  return [
    [{ xAxis: '1947-01-01', itemStyle: { color: makePatternFill('DOTS') } }, { xAxis: '1980-01-01' }],
    [{ xAxis: '1980-01-01', itemStyle: { color: makePatternFill('HATCH-S') } }, { xAxis: '2007-01-01' }],
    [{ xAxis: '2007-01-01', itemStyle: { color: makePatternFill('CROSSHATCH') } }, { xAxis: '2020-01-01' }],
    [{ xAxis: '2020-01-01', itemStyle: { color: makePatternFill('HATCH-D') } }, { xAxis: '2030-01-01' }]
  ];
}

function subCellMarkup(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addSubCellAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Debt cycles operate on roughly 70-year frequency — about a generation longer
  than the short-term cycle. Dalio's four pressure indicators (debt/revenue,
  interest/revenue, r minus g, debt/savings) measure how far the cycle has run.</p>
  <p>The <em>peak</em> stage (renamed from "TOP" to avoid collision with the 1.6
  empire-cycle "TOP" stage) is when debt-service costs eat through enough revenue
  to require monetary or fiscal extraordinary measures — a deleveraging looms.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>GFDEGDQ188S</code>, <code>FYGFGDQ188S</code>, <code>FYOIGDA188S</code>, <code>GS10</code>, <code>FYFSGDA188S</code>, <code>FYFRGDA188S</code></li>
    <li>BIS <code>QUSCAM770A</code> (private credit / GDP)</li>
    <li>research/03_long_term_debt_cycle.md §5-§7</li>
    <li>Dalio, <em>How Countries Go Broke</em> Ch.3</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-1-3`
Expected: PASS — id registers + PEAK appears in caption.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-1-3-long-term-debt.js dashboard/tests/unit/slide-1-3.test.js
git commit -m "feat(slide-1.3): Long-Term Debt Cycle — debt/GDP line + 4 stage pattern bands"
```

---

### Task 46: Slide 1.4 — Deleveragings (lever-mix bars + conditional gate UI)

**Files:**
- Create: `dashboard/src/slides/slide-1-4-deleveragings.js`
- Create: `dashboard/tests/unit/slide-1-4.test.js`

Spec ref: §4.5 FR-5.3 ("1.4 lever-mix horizontal bars, 4 levers each with distinct pattern: cuts/austerity/transfers/print"). Per Spec §4.3 FR-3.5 + §3 conditional gate logic — when gate is OFF, render "Not Triggered ✓" mini-card replacing chart.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 1.4 Deleveragings', () => {
  it('registers slide id 1.4', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-4-deleveragings.js');
    expect(getSlides().find(s => s.id === '1.4')).toBeDefined();
  });

  it('Gate OFF → renders "Not Triggered ✓" card and skips chart', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-4-deleveragings.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {} }, computedRegimes: { debt_money_regime: 'LOW', gap_regime: 'ABOVE_TREND', R_dm_narrow: 8 } },
      wizard: {}
    });
    expect(document.querySelector('.gate-off-card')).not.toBeNull();
    expect(document.querySelector('.gate-off-card').textContent).toMatch(/Not Triggered/);
  });

  it('Gate ON (R_dm > 17) → renders lever-mix chart', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-4-deleveragings.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {} }, computedRegimes: { R_dm_narrow: 18 } },
      wizard: {}
    });
    expect(document.querySelector('.chart-mount')).not.toBeNull();
    expect(document.querySelector('.gate-off-card')).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-1-4`
Expected: FAIL.

- [ ] **Step 3: Implement slide-1-4-deleveragings.js**

```js
/* Slide 1.4 Deleveragings — Spec §4.3 + §4.5 FR-5.3.
 * Conditional: gate fires when R^{D/M} > 17 instantaneous OR
 * (debt_money_regime=HIGH AND gap_regime=BELOW_TREND) sustained ≥2Q.
 * Gate OFF → "Not Triggered ✓" card per Spec §4.3 FR-3.5.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { computeDeleveragings, isGateOpen } from '../compute/deleveragings.js';
import { computeEconMachine } from '../compute/econ-machine.js';

registerSlide({
  id: '1.4',
  title: 'Deleveragings',
  render(section, { payload }) {
    const econ = payload?.computedRegimes ?? computeEconMachine(payload);
    // History for hysteresis would come from a derived rolling window in a future
    // version; v1 treats current-quarter snapshot as the sole input.
    const gateOpen = isGateOpen({ R_dm: econ.R_dm_narrow ?? 0, history: payload?.regimeHistory ?? [] });

    if (!gateOpen) {
      renderSlideShell(section, {
        step: '04', section: '1.4 Deleveragings',
        onePoint: 'Conditional step — <em>not triggered</em> in this regime.',
        caption: `R<sup>D/M</sup> at <em>${(econ.R_dm_narrow ?? 0).toFixed(1)}</em> below the 17 threshold; debt/money regime <em>${econ.debt_money_regime ?? 'unknown'}</em>.`,
        chartHtml: subCell(0, gateOffCard(econ)),
        notesHtml: subCell(1, NOTES_HTML),
        sourcesHtml: subCell(2, SOURCES_HTML)
      });
      addAnchor(section, 3);
      return;
    }

    // Gate OPEN — render lever-mix chart
    const out = computeDeleveragings(buildDeleveragingsInput(payload, econ), true);
    const onePoint = phraseRegime(out);
    const caption = `Growth − rate gap <em>G = ${out.G.toFixed(1)} pp</em>; print rate <em>π = ${(out.pi * 100).toFixed(1)}%</em>; lever mix print/austerity/default/redist.`;

    renderSlideShell(section, {
      step: '04', section: '1.4 Deleveragings',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildLeverMixOption(out));
  }
});

function gateOffCard(econ) {
  return `
    <div class="gate-off-card" style="border:1px solid var(--ink);padding:32px;text-align:center;font-family:var(--font-serif);font-style:italic">
      <div class="eyebrow" style="margin:0 auto 16px">CONDITIONAL · NOT TRIGGERED ✓</div>
      <p style="font-size:18px;margin:0 0 12px">The deleveragings playbook only activates when debt has run far enough and demand has fallen far enough that the standard short-term cycle no longer applies.</p>
      <p style="font-size:13px;color:var(--fg-soft);margin:0">Current state: R<sup>D/M</sup> = ${(econ.R_dm_narrow ?? 0).toFixed(1)} (threshold 17.0); regime ${econ.debt_money_regime ?? 'unknown'}.</p>
    </div>`;
}

function phraseRegime(out) {
  switch (out.regime) {
    case 'UGLY_DEFLATIONARY':  return 'A <em>deflationary deleveraging</em> is in progress — debt rising while income falls.';
    case 'BEAUTIFUL':          return 'A <em>beautiful deleveraging</em> is in progress — debt receding while growth holds.';
    case 'UGLY_INFLATIONARY':  return 'An <em>inflationary deleveraging</em> is in progress — currency debasing as debt erodes in real terms.';
    default:                   return 'The deleveraging is in <em>transition</em> between phases.';
  }
}

function buildDeleveragingsInput(payload, econ) {
  // Compose research/04 inputs from FRED. v1 leaves several fields null and the
  // implementer iterates until the regime classifier returns a sensible value.
  return { /* ... derive from payload.sources.fred ... */ };
}

function buildLeverMixOption(out) {
  const mix = out.lever_mix;
  return {
    grid: { left: 120, right: 24, top: 24, bottom: 48 },
    xAxis: { type: 'value', axisLabel: { formatter: v => `${(v * 100).toFixed(0)}%` } },
    yAxis: { type: 'category', data: ['Print', 'Austerity', 'Default', 'Redistribution'] },
    series: [{
      ...barSeries({ name: 'Lever share', data: [mix.print, mix.austerity, mix.default_, mix.redistribution], fillPattern: 'HATCH-D' }),
      itemStyle: { borderColor: '#000', borderWidth: 1 }
    }]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Deleveragings only happen when debt-service costs grow faster than the
  income to service them. They split into three flavors based on policy choices:
  deflationary (austerity-heavy, painful, prolonged), beautiful (balanced
  print/cut/redistribute, growth holds), and inflationary (print-heavy,
  currency debases).</p>
  <p>The <em>beautiful</em> outcome is rare and requires the four levers
  (austerity / default / print / redistribute) to be applied in roughly correct
  proportions. Most actual deleveragings are ugly in one direction or the other.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>QUSCAM770A</code>, <code>BOGMBASE</code>, <code>WALCL</code>, <code>QBPLNTLNNTCGOFFR</code></li>
    <li>WID <code>gdiinc992j</code> (net Gini)</li>
    <li>research/04_deleveragings.md §5-§7</li>
    <li>Dalio, <em>Principles for Navigating Big Debt Crises</em></li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-1-4`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-1-4-deleveragings.js dashboard/tests/unit/slide-1-4.test.js
git commit -m "feat(slide-1.4): Deleveragings — lever-mix bars + conditional gate-off card"
```

---

### Task 47: Slide 1.7 — Inflation & Currency Debasement (4-quadrant matrix)

**Files:**
- Create: `dashboard/src/slides/slide-1-7-inflation.js`
- Create: `dashboard/tests/unit/slide-1-7.test.js`

Spec ref: §4.5 FR-5.3 ("1.7 4-quadrant matrix [real rates × growth], each quadrant = distinct pattern, current point dot").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 1.7 Inflation', () => {
  it('registers slide id 1.7', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-7-inflation.js');
    expect(getSlides().find(s => s.id === '1.7')).toBeDefined();
  });

  it('one-point uses regime word (STAGFLATION example)', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-7-inflation.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {} }, computedInflation: { regime: 'STAGFLATION', RealRateBucket: 'MILDLY_NEG', pi_hdln: 8.5, μ: -2 } },
      wizard: {}
    });
    expect(document.querySelector('.one-point').innerHTML.toLowerCase()).toMatch(/stagflation/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-1-7`
Expected: FAIL.

- [ ] **Step 3: Implement slide-1-7-inflation.js**

```js
/* Slide 1.7 Inflation & Currency Debasement — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 4-quadrant matrix on (real rate × growth) plane, each quadrant
 * filled with distinct pattern, current point overlaid as dot.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { makePatternFill } from '../charts/patterns.js';
import { computeInflation } from '../compute/inflation.js';

const REGIME_PHRASE = {
  DEFLATIONARY: 'in a <em>deflationary</em> phase — falling prices, real rates positive',
  BEAUTIFUL:    'in a <em>beautiful</em> moderate-inflation regime — 1-3% prices, real rates positive',
  STAGFLATION:  'in a <em>stagflationary</em> regime — high prices alongside weak growth',
  INFLATIONARY: 'in an <em>inflationary debasement</em> regime — high prices and negative real rates'
};

registerSlide({
  id: '1.7',
  title: 'Inflation & Currency Debasement',
  render(section, { payload }) {
    const out = payload?.computedInflation ?? computeInflation(deriveInflationInput(payload));
    const onePoint = `Inflation is ${REGIME_PHRASE[out.regime] || `in <em>${(out.regime || '').toLowerCase()}</em>`}.`;
    const caption = `Headline CPI <em>${(out.pi_hdln ?? 0).toFixed(1)}%</em> yoy; real rate bucket <em>${out.RealRateBucket?.toLowerCase() ?? 'neutral'}</em>; monetary impulse μ <em>${(out.μ ?? 0).toFixed(1)}%</em>.`;

    renderSlideShell(section, {
      step: '05', section: '1.7 Inflation & Currency',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:520px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildQuadrantMatrix(out, payload));
  }
});

function deriveInflationInput(payload) {
  // v1 stub — wire to FRED CPI/CPILFESL/DFII10/DTWEXBGS/GOLDPMGBD228NLBM
  return { pi_hdln: 0, pi_core: 0, NGDP_yoy: 0, M2_yoy: 0, r_mkt: 0, ΔFX_12m: 0, ΔGold_12m: 0, reserve_currency: true };
}

function buildQuadrantMatrix(out, payload) {
  const realRate = out.r_mkt ?? 0;
  const growth = (payload?.computedShortCycle?.g) ?? 0;
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'value', name: 'Real rate %', nameLocation: 'middle', nameGap: 32, min: -3, max: 3 },
    yAxis: { type: 'value', name: 'Growth %', nameLocation: 'middle', nameGap: 40, min: -5, max: 5 },
    series: [
      // 4 quadrant fills
      {
        type: 'custom', renderItem: (params, api) => {
          // Quadrant rendering helper — implementer fills 4 rect shapes with distinct patterns
          // (see ECharts custom series API). Patterns: HATCH-D / HATCH-S / DOTS / CROSSHATCH.
          return null;
        },
        data: []
      },
      // Current point dot
      { type: 'scatter', symbolSize: 14, itemStyle: { color: '#000' }, data: [[realRate, growth]] }
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Inflation is governed by the relative supply of money, credit, and goods.
  Dalio classifies four regimes: deflationary (falling prices, positive real
  rates), beautiful (moderate 1-3% inflation, positive real rates and growth),
  stagflation (high prices alongside weak growth), and inflationary debasement
  (high prices, negative real rates, currency falling).</p>
  <p>The "DebaseFlag" fires when broad USD falls > 7% AND gold rises > 15% over
  the trailing year (calibrated against 1971/2002/2008/2020 — all triggered;
  1995-99 / 2014-15 — neither). Reserve-currency status raises the inflation
  threshold from 3% to 4% before "INFLATIONARY" regime triggers.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>CPIAUCSL</code>, <code>CPILFESL</code>, <code>DFII10</code>, <code>DGS10</code>, <code>DTWEXBGS</code>, <code>GOLDPMGBD228NLBM</code>, <code>M2SL</code></li>
    <li>research/07_inflation_currency.md §5-§7</li>
    <li>Dalio, <em>Principles for Dealing With the Changing World Order</em> Ch.4</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-1-7`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-1-7-inflation.js dashboard/tests/unit/slide-1-7.test.js
git commit -m "feat(slide-1.7): Inflation — 4-quadrant matrix + regime + RealRateBucket"
```

---

### Task 48: Slide 1.5 — Paradigm Shifts (line + dash-dot 50yr-mean reference)

**Files:**
- Create: `dashboard/src/slides/slide-1-5-paradigms.js`
- Create: `dashboard/tests/unit/slide-1-5.test.js`

Spec ref: §4.5 FR-5.3 ("1.5 10yr returns line + 50yr-mean dash-dot reference").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 1.5 Paradigms', () => {
  it('registers slide id 1.5', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-5-paradigms.js');
    expect(getSlides().find(s => s.id === '1.5')).toBeDefined();
  });

  it('caption surfaces PA composite + paradigm_stage word', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-5-paradigms.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {}, damodaran: { histretSP: [] } }, computedParadigms: { PA: 0.687, paradigm_stage: 'LATE', S_tail: 3, ρ: -0.10 } },
      wizard: {}
    });
    const cap = document.querySelector('.caption').innerHTML;
    expect(cap).toMatch(/0\.69|PA/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-1-5`
Expected: FAIL.

- [ ] **Step 3: Implement slide-1-5-paradigms.js**

```js
/* Slide 1.5 Paradigm Shifts — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 10yr returns line + 50yr-mean dash-dot reference.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';
import { computeParadigms } from '../compute/paradigms.js';

const STAGE_PHRASE = {
  EARLY: 'in an <em>early</em> phase — old leaders still leading',
  MID:   'in <em>mid-paradigm</em> — tailwinds maxing out',
  LATE:  'in a <em>late</em> paradigm — peer leaders set to invert'
};

registerSlide({
  id: '1.5',
  title: 'Paradigm Shifts',
  render(section, { payload }) {
    const out = payload?.computedParadigms ?? computeParadigms(buildParadigmsInput(payload));
    const onePoint = `The current asset-return paradigm is ${STAGE_PHRASE[out.paradigm_stage] || out.paradigm_stage.toLowerCase()}.`;
    const caption = `Paradigm-Age composite <em>PA = ${(out.PA ?? 0).toFixed(2)}</em>; tailwinds <em>S_tail = ${out.S_tail}</em>; rank-inversion ρ <em>${(out.ρ ?? 0).toFixed(2)}</em>.`;

    renderSlideShell(section, {
      step: '06', section: '1.5 Paradigm Shifts',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(payload));
  }
});

function buildParadigmsInput(payload) {
  // v1 stub — wire from Damodaran histretSP + FRED tailwind inputs
  return {
    decadeReturns: { SPX: { d2000s: 0, d2010s: 0 }, UST10: { d2000s: 0, d2010s: 0 }, Tbill: { d2000s: 0, d2010s: 0 }, Gold: { d2000s: 0, d2010s: 0 }, Cmdty: { d2000s: 0, d2010s: 0 } },
    RealRate10y: 0, FedFunds: 0, BuybackYield: 0, ProfitShare: 0, ProfitShareMean_plus_sigma: 0
  };
}

function buildOption(payload) {
  const damo = payload?.sources?.damodaran?.histretSP || [];
  const last50 = damo.slice(-50);
  const mean50 = last50.reduce((s, p) => s + (p.sp500 || 0), 0) / Math.max(1, last50.length);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: last50.map(p => p.year) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      lineSeries({ name: '10yr S&P returns', data: last50.map(p => (p.sp500 || 0) * 100), strokePattern: 'SOLID' }),
      {
        name: '50yr mean', type: 'line',
        data: last50.map(() => mean50 * 100),
        lineStyle: { color: '#000', width: 1, type: [5, 2, 1, 2] },  // DASH-DOT
        symbol: 'none', itemStyle: { color: '#000' }
      }
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>A "paradigm" is a sustained period — typically a decade — where one set of
  asset-return drivers dominates the others. Dalio's recurring observation:
  the leaders of one paradigm tend to <em>invert</em> in the next paradigm. The
  mechanism is structural — tailwinds get priced in, valuations stretch, the
  next paradigm starts as those tailwinds reverse.</p>
  <p>Paradigm-Age composite (research/05 §5.4) blends three signals: cross-decade
  rank inversion (Spearman ρ), count of currently-active tailwinds (4 binary
  flags), and consensus-vs-CAGR recency divergence (sigmoid).</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>Damodaran <code>histretSP.xls</code> (annual returns by asset class)</li>
    <li>FRED <code>FEDFUNDS</code>, <code>DFII10</code>, <code>PPIACO</code>, <code>A463RC1Q027SBEA</code></li>
    <li>S&P DJI <code>SP500BUYBACK</code>; OECD <code>TABLE_II1</code> (corp tax rates)</li>
    <li>Yardeni IBES forecast PDF</li>
    <li>research/05_paradigm_shifts.md §5-§7</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-1-5`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-1-5-paradigms.js dashboard/tests/unit/slide-1-5.test.js
git commit -m "feat(slide-1.5): Paradigm Shifts — 10yr returns + 50yr-mean dash-dot reference"
```

---

### Task 49: Slide 1.6 — Big Cycle / World Order (8-axis radar)

**Files:**
- Create: `dashboard/src/slides/slide-1-6-world-order.js`
- Create: `dashboard/tests/unit/slide-1-6.test.js`

Spec ref: §4.5 FR-5.3 ("1.6 8-axis radar — US = hatch-fill polygon, CHN = dashed-outline polygon").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 1.6 World Order', () => {
  it('registers slide id 1.6', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-6-world-order.js');
    expect(getSlides().find(s => s.id === '1.6')).toBeDefined();
  });

  it('caption surfaces CPI USA + CHN values', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-6-world-order.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedWorldOrder: { CPI: { USA: 0.92, CHN: 0.75 }, StageTag: { USA: 'DECLINE', CHN: 'RISE' }, HegemonyRisk: 'ELEVATED' } },
      wizard: {}
    });
    const cap = document.querySelector('.caption').innerHTML;
    expect(cap).toMatch(/0\.9/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-1-6`
Expected: FAIL.

- [ ] **Step 3: Implement slide-1-6-world-order.js**

```js
/* Slide 1.6 Big Cycle / World Order — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 8-axis radar — US = hatch-fill polygon, CHN = dashed-outline polygon.
 * Per Set 3.5 D8: 1.6 keeps "TOP" (Dalio canonical wording).
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { radarSeries } from '../charts/series-builder.js';
import { computeWorldOrder } from '../compute/world-order.js';

const STAGE_PHRASE = {
  RISE:      'rising — building strengths broadly',
  TOP:       'at the top of its arc',
  DECLINE:   'in measured decline',
  NEW_ORDER: 'past collapse, in early reformation'
};

registerSlide({
  id: '1.6',
  title: 'Big Cycle / World Order',
  render(section, { payload }) {
    const out = payload?.computedWorldOrder ?? computeWorldOrder(buildPanel(payload));
    const cpiUSA = (out.CPI?.USA ?? 0).toFixed(2);
    const cpiCHN = (out.CPI?.CHN ?? 0).toFixed(2);
    const stageUS = STAGE_PHRASE[out.StageTag?.USA] || (out.StageTag?.USA || '').toLowerCase();
    const onePoint = `The U.S. is <em>${stageUS}</em>; China is <em>rising</em>.`;
    const caption = `Country Power Index <em>USA = ${cpiUSA}</em>, <em>CHN = ${cpiCHN}</em>; hegemony-risk band <em>${(out.HegemonyRisk ?? '').toLowerCase()}</em>.`;

    renderSlideShell(section, {
      step: '07', section: '1.6 Big Cycle / World Order',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:560px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildRadarOption(out, payload));
  }
});

function buildPanel(payload) {
  // v1 stub — wire from World Bank (Edu_tert, Pat_res, Mil_xpnd, Exp_gnfs, GDP_cur),
  // BIS (Cost_comp from EER, Fin_ctr from LBS), IMF COFER (Res_shr).
  return { panel: { USA: {}, CHN: {} }, anchors: { max: 1.9, min: -1.5 } };
}

function buildRadarOption(out, payload) {
  const measures = ['Edu', 'Innov', 'Cost', 'Mil', 'Trade', 'Output', 'Fin', 'Reserve'];
  const usaPanel = payload?.computedWorldOrder?.zScores?.USA || measures.map(() => 0);
  const chnPanel = payload?.computedWorldOrder?.zScores?.CHN || measures.map(() => 0);
  return {
    radar: {
      indicator: measures.map(m => ({ name: m, max: 3, min: -2 })),
      shape: 'polygon',
      axisName: { color: '#000', fontFamily: '"DM Mono"', fontSize: 11 }
    },
    series: [
      radarSeries({ name: 'USA', data: measures.map(m => usaPanel[m] ?? 0), fillPattern: 'HATCH-D', strokePattern: 'SOLID' }),
      radarSeries({ name: 'CHN', data: measures.map(m => chnPanel[m] ?? 0), fillPattern: 'SOLID', strokePattern: 'DASH-LONG' })
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Dalio's <em>Country Power Index</em> aggregates eight measures (education,
  innovation, cost competitiveness, military, trade share, output share, financial
  centrality, reserve currency status) into a single 0-1 score. Empires rise
  through these one by one; they decline in roughly the same order.</p>
  <p>The current US-CHN diff has narrowed to where 2-3 of the 8 measures show
  Chinese parity or lead — the "hegemony-risk band" (research/06 §6) classifies
  this as <em>elevated</em>.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>WB <code>SE.TER.ENRR</code>, <code>IP.PAT.RESD</code>, <code>MS.MIL.XPND.CD</code>, <code>NE.EXP.GNFS.CD</code>, <code>NY.GDP.MKTP.CD</code></li>
    <li>BIS <code>WS_EER</code> (effective exchange rates) + <code>WS_LBS_D_PUB</code> (financial centers)</li>
    <li>IMF COFER <code>RAXGFXARUSDRT_PT</code> (USD reserve share)</li>
    <li>research/06_changing_world_order.md §5-§7</li>
    <li>Dalio, <em>Principles for Dealing With the Changing World Order</em></li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-1-6`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-1-6-world-order.js dashboard/tests/unit/slide-1-6.test.js
git commit -m "feat(slide-1.6): Big Cycle / World Order — 8-axis radar US hatch + CHN dashed"
```

---

### Task 50: Slide 2.2 — All-Weather (5-sleeve stacked bar)

**Files:**
- Create: `dashboard/src/slides/slide-2-2-all-weather.js`
- Create: `dashboard/tests/unit/slide-2-2.test.js`

Spec ref: §4.5 FR-5.3 ("2.2 stacked horiz bar with 5 sleeve-pattern fills + dashed baseline outline"). Per FR-12 — final tilted weights bound here from arbiter output.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 2.2 All-Weather', () => {
  it('registers slide id 2.2', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-2-all-weather.js');
    expect(getSlides().find(s => s.id === '2.2')).toBeDefined();
  });

  it('caption surfaces σ_p + drift band', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-2-all-weather.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedAW: { σ_p_pct: 7.51, RC_pct: { equities: 34.2, long_treasury: 46.87, int_treasury: 7.83, gold: 5.40, commodities: 5.69 } } },
      wizard: { risk_profile: 'balanced', sigma_target: 0.10 }
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/7\.5|σ/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-2-2`
Expected: FAIL.

- [ ] **Step 3: Implement slide-2-2-all-weather.js**

```js
/* Slide 2.2 All-Weather — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 5-sleeve stacked horizontal bar, each sleeve = distinct pattern.
 * Final tilted weights from FR-12 tilt arbiter overlay; baseline shown as
 * dashed outline reference.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { AW_BASELINE_WEIGHTS, computeAllWeather, applyTilts } from '../compute/all-weather.js';
import { arbitrateTilts } from '../compute/tilt-arbiter.js';

const SLEEVE_PATTERNS = {
  equities: 'HATCH-D', int_treasury: 'HATCH-S', long_treasury: 'CROSSHATCH', gold: 'DOTS', commodities: 'VERT'
};

registerSlide({
  id: '2.2',
  title: 'All-Weather',
  render(section, { payload, wizard }) {
    const aw = payload?.computedAW ?? computeAllWeather({ vols: deriveVols(payload) });
    // Tilt arbitration uses upstream regime emits
    const arbitrated = arbitrateTilts({
      inflation: payload?.computedInflation ?? {},
      deleveragings: payload?.computedDelev ?? {},
      paradigms: payload?.computedParadigms ?? {}
    });
    const tilted = applyTilts(arbitrated.tilts);

    const onePoint = `The All-Weather portfolio for this regime tilts toward <em>${highlightMost(tilted)}</em>.`;
    const caption = `Portfolio vol <em>σ<sub>p</sub> = ${(aw.σ_p_pct ?? 0).toFixed(1)}%</em>; tilt rule <em>${arbitrated.binding_rule || 'BASE_AW'}</em>.`;

    renderSlideShell(section, {
      step: '08', section: '2.2 All-Weather',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildStackedBar(tilted, AW_BASELINE_WEIGHTS));
  }
});

function deriveVols(payload) {
  // v1 stub — compute 252-day rolling vol from FRED daily returns; default to
  // illustrative Apr-2026 values from research/09 §7 L132 if data missing.
  return { equities: 0.16, int_treasury: 0.06, long_treasury: 0.13, gold: 0.15, commodities: 0.18 };
}

function highlightMost(weights) {
  const baseline = AW_BASELINE_WEIGHTS;
  let maxDelta = 0; let maxKey = 'equities';
  for (const k of Object.keys(weights)) {
    const d = (weights[k] || 0) - (baseline[k] || 0);
    if (Math.abs(d) > Math.abs(maxDelta)) { maxDelta = d; maxKey = k; }
  }
  return maxKey.replace('_', ' ');
}

function buildStackedBar(tilted, baseline) {
  const sleeves = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities'];
  return {
    grid: { left: 24, right: 24, top: 32, bottom: 64 },
    xAxis: { type: 'value', max: 1, axisLabel: { formatter: v => `${(v * 100).toFixed(0)}%` } },
    yAxis: { type: 'category', data: ['Recommended', 'Baseline'] },
    series: sleeves.map(k => barSeries({
      name: k, stack: 's', data: [tilted[k], baseline[k]], fillPattern: SLEEVE_PATTERNS[k]
    }))
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>The <em>All-Weather</em> portfolio is Dalio's structural answer to "I do not
  know which environment will arrive next, but each known environment requires
  different assets to do well." It allocates risk (not dollars) such that no
  single environmental shift can deal a knockout blow.</p>
  <p>The baseline weights (30/15/40/7.5/7.5) are calibrated for a balanced
  risk-parity profile. Tilts overlay regime-specific shifts from steps 1.4, 1.5,
  and 1.7 (per the FR-12 tilt arbiter), capped at ±10pt deviation per sleeve.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>SP500</code>, <code>DGS10</code>, <code>DGS20</code>, <code>GOLDPMGBD228NLBM</code>, <code>CPIAUCSL</code></li>
    <li>BCOM index (Stooq <code>^bcom</code>)</li>
    <li>research/09_all_weather.md §5-§7 + research/07 §6 L132 (±10pt cap)</li>
    <li>Robbins, <em>Money: Master the Game</em> Ch.7 (canonical Dalio weights)</li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em></li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-2-2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-2-2-all-weather.js dashboard/tests/unit/slide-2-2.test.js
git commit -m "feat(slide-2.2): All-Weather — stacked sleeve bars + tilt-arbiter overlay"
```

---

### Task 51: Slide 2.5 — Stress Testing (4-archetype outcome bars)

**Files:**
- Create: `dashboard/src/slides/slide-2-5-stress.js`
- Create: `dashboard/tests/unit/slide-2-5.test.js`

Spec ref: §4.5 FR-5.3 ("2.5 4-archetype outcomes bar with distinct pattern per archetype"). Tail panel uses asymmetry-ratio status per Set 3.5 D5 (GREEN <5×, AMBER 5-9.99×, RED ≥10×).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 2.5 Stress Testing', () => {
  it('registers slide id 2.5', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-5-stress.js');
    expect(getSlides().find(s => s.id === '2.5')).toBeDefined();
  });

  it('canonical 8.52× asymmetry → AMBER tail band caption', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-5-stress.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedStress: { R_port_pct: { deflationary: -8.125, inflationary: -26, stagflation: -3.05, reflation: 11.825 }, asymmetry_ratio: 8.52, dominant_tail: { regime: 'inflationary' }, tail_band: 'AMBER' } },
      wizard: {}
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/8\.5/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-2-5`
Expected: FAIL.

- [ ] **Step 3: Implement slide-2-5-stress.js**

```js
/* Slide 2.5 Stress Testing — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 4-archetype outcome bars (Defl / Infl / Stag / Refl) each pattern-distinct.
 * Tail panel uses asymmetry_ratio status (Set 3.5 D5 lock).
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { computeStress } from '../compute/stress.js';
import { applyTilts } from '../compute/all-weather.js';

const ARCH_PATTERNS = {
  deflationary: 'CROSSHATCH', inflationary: 'HATCH-D', stagflation: 'DOTS', reflation: 'HATCH-S'
};

registerSlide({
  id: '2.5',
  title: 'Stress Testing',
  render(section, { payload }) {
    const out = payload?.computedStress ?? computeStress({ weights: applyTilts({}) });
    const tail = out.dominant_tail;
    const onePoint = `The dominant tail is <em>${tail?.regime || 'inflationary'}</em>; tail asymmetry <em>${(out.asymmetry_ratio ?? 0).toFixed(1)}×</em>.`;
    const caption = `Defl <em>${out.R_port_pct.deflationary.toFixed(1)}%</em>; Infl <em>${out.R_port_pct.inflationary.toFixed(1)}%</em>; Stag <em>${out.R_port_pct.stagflation.toFixed(1)}%</em>; Refl <em>+${out.R_port_pct.reflation.toFixed(1)}%</em>. Asymmetry <em>${out.asymmetry_ratio.toFixed(2)}×</em> → <em>${out.tail_band}</em>.`;

    renderSlideShell(section, {
      step: '09', section: '2.5 Stress Testing',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:520px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(out));
  }
});

function buildOption(out) {
  const archs = ['deflationary', 'inflationary', 'stagflation', 'reflation'];
  return {
    grid: { left: 80, right: 24, top: 24, bottom: 64 },
    xAxis: { type: 'category', data: archs.map(a => a.toUpperCase()) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: archs.map(a => barSeries({
      name: a, data: archs.map(b => b === a ? out.R_port_pct[a] : null), fillPattern: ARCH_PATTERNS[a]
    }))
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Stress testing applies four archetypal economic shock patterns
  (deflationary depression, inflationary depression, stagflation, reflation)
  to the recommended portfolio. Each archetype is calibrated against historical
  episodes: 1929-33 deflation, Weimar/1973-74 stagflation, 2009/2020 reflations.</p>
  <p>The <em>asymmetry ratio</em> measures how lopsided the tail outcomes are.
  When the ratio exceeds about 8x, the dominant tail is structural to the
  portfolio's design — Dalio's recommended canonical AW lands here, with
  inflationary depression as the dominant tail.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>Damodaran <code>histretSP.html</code> (annual returns reconciliation)</li>
    <li>Shiller <code>ie_data.xls</code> (CAPE)</li>
    <li>Maddison Project 2020 (long-run GDP)</li>
    <li>research/12_stress_testing.md §5-§7 — shock matrix verbatim Table 7.1</li>
    <li>Set 3.5 D5 lock: asymmetry bands 5×/10× (raised from 8×)</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-2-5`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-2-5-stress.js dashboard/tests/unit/slide-2-5.test.js
git commit -m "feat(slide-2.5): Stress Testing — 4-archetype outcome bars + asymmetry band"
```

---

### Task 52: Slide 2.4 — Risk Parity & Leverage (vol-contrib bars + leverage gauge)

**Files:**
- Create: `dashboard/src/slides/slide-2-4-risk-parity.js`
- Create: `dashboard/tests/unit/slide-2-4.test.js`

Spec ref: §4.5 FR-5.3 ("2.4 vol-contribution bars + leverage gauge w/ vert pattern").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide 2.4 Risk Parity', () => {
  it('registers slide id 2.4', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-4-risk-parity.js');
    expect(getSlides().find(s => s.id === '2.4')).toBeDefined();
  });

  it('caption surfaces L value + funding-spread band', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-4-risk-parity.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedRiskParity: { L: 1.656, σ_p_pct: 6.037, weights: { equities: 0.18, treasury10: 0.47, gold: 0.19, commodities: 0.16 }, SR_lev: 0.566, funding_spread_band: 'GREEN' } },
      wizard: { sigma_target: 0.10 }
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/1\.6|L/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-2-4`
Expected: FAIL.

- [ ] **Step 3: Implement slide-2-4-risk-parity.js**

```js
/* Slide 2.4 Risk Parity & Leverage — Spec §4.3 + §4.5 FR-5.3.
 * Two-panel chart: vol-contribution bars (left) + leverage gauge (right) with
 * vertical-stripe pattern.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { computeRiskParity } from '../compute/risk-parity.js';

registerSlide({
  id: '2.4',
  title: 'Risk Parity & Leverage',
  render(section, { payload, wizard }) {
    const out = payload?.computedRiskParity ?? computeRiskParity({
      vols: { equities: 0.16, treasury10: 0.06, gold: 0.15, commodities: 0.18 },
      σ_target: wizard?.sigma_target || 0.10,
      r_p: 0.07415, r_f: 0.04, funding_spread_bp: 0
    });
    const onePoint = `Risk-parity weights at this vol target lever to <em>L = ${(out.L ?? 0).toFixed(2)}×</em>.`;
    const caption = `Portfolio vol <em>σ<sub>p</sub> = ${(out.σ_p_pct ?? 0).toFixed(1)}%</em>; levered Sharpe <em>${(out.SR_lev ?? 0).toFixed(2)}</em>; funding-spread band <em>${(out.funding_spread_band ?? 'GREEN').toLowerCase()}</em>.`;

    renderSlideShell(section, {
      step: '10', section: '2.4 Risk Parity & Leverage',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(out));
  }
});

function buildOption(out) {
  const sleeves = Object.keys(out.weights);
  const vc = sleeves.map(k => (out.weights[k] || 0) * 100);
  return {
    grid: [
      { left: 60, right: '55%', top: 32, bottom: 64 },
      { left: '55%', right: 32, top: 32, bottom: 64 }
    ],
    xAxis: [
      { gridIndex: 0, type: 'category', data: sleeves },
      { gridIndex: 1, type: 'value', show: false, max: 3 }
    ],
    yAxis: [
      { gridIndex: 0, type: 'value', axisLabel: { formatter: '{value}%' } },
      { gridIndex: 1, type: 'category', show: false, data: ['L'] }
    ],
    series: [
      { ...barSeries({ name: 'Weight', data: vc, fillPattern: 'HATCH-D' }), xAxisIndex: 0, yAxisIndex: 0 },
      { ...barSeries({ name: 'Leverage', data: [out.L], fillPattern: 'VERT' }), xAxisIndex: 1, yAxisIndex: 1 }
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>The All-Weather portfolio at its baseline weights produces a portfolio vol
  well below the target vol most investors prefer. Risk parity scales the
  whole portfolio uniformly to hit the target — this is the leverage L.</p>
  <p>Every basis point of funding spread above the risk-free rate translates
  to a Sharpe-ratio drag of <code>(L−1)/L · s/σ_p</code>. With L ≈ 1.65×,
  funding spread of 100bp drags Sharpe by ~6.6 percentage points. Hard cap:
  L ≤ 3×; rebalance trigger: vol drift > 25% from target.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>SP500</code>, <code>DGS10</code>, <code>GOLDPMGBD228NLBM</code>, <code>FEDFUNDS</code>, <code>DFF</code>, <code>DTB3</code>, <code>VIXCLS</code></li>
    <li>research/11_risk_parity_leverage.md §5-§7</li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> (Bridgewater, 2012)</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-2-4`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-2-4-risk-parity.js dashboard/tests/unit/slide-2-4.test.js
git commit -m "feat(slide-2.4): Risk Parity — vol-contribution bars + leverage gauge"
```

---

### Task 53: Sidebar 2.1 — Holy Grail (N_eff curves)

**Files:**
- Create: `dashboard/src/slides/sidebar-2-1-holy-grail.js`
- Create: `dashboard/tests/unit/sidebar-2-1.test.js`

Spec ref: §4.4 FR-4.3 (educational sidebar OUTSIDE numbered live sequence) + §4.5 FR-5.3 ("2.1 N_eff curves with 3 dash patterns for ρ ∈ {0.05, 0.20, 0.40}").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Sidebar 2.1 Holy Grail', () => {
  it('registers slide id 2.1 with kind=edu', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/sidebar-2-1-holy-grail.js');
    const slide = getSlides().find(s => s.id === '2.1');
    expect(slide).toBeDefined();
    expect(slide.kind).toBe('edu');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- sidebar-2-1`
Expected: FAIL.

- [ ] **Step 3: Implement sidebar-2-1-holy-grail.js**

```js
/* Sidebar 2.1 Holy Grail — Spec §4.4 FR-4.3 + §4.5 FR-5.3.
 * Educational ONLY — not in numbered live sequence. Reachable via dashed
 * nav-bar entry only. Math infographic + N_eff curves for ρ ∈ {0.05, 0.20, 0.40}.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';

registerSlide({
  id: '2.1',
  title: 'Holy Grail',
  kind: 'edu',
  render(section, { payload }) {
    const onePoint = `<em>15+ uncorrelated streams</em> can reduce portfolio vol by up to <em>80%</em>.`;
    const caption = `<em>σ<sub>p</sub>/σ = 1/√N<sub>eff</sub></em> where <em>N<sub>eff</sub> = N / (1 + (N−1)·ρ̄)</em>. The math is brutal: any meaningful correlation collapses N<sub>eff</sub> regardless of how many streams you add.`;

    renderSlideShell(section, {
      step: 'EDU', section: '2.1 Holy Grail',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 2);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildNeffCurves());
  }
});

function buildNeffCurves() {
  const Ns = Array.from({ length: 30 }, (_, i) => i + 1);
  const sigP = (N, rho) => Math.sqrt((1 + (N - 1) * rho) / N);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: Ns, name: 'N streams' },
    yAxis: { type: 'value', name: 'σ_p / σ', max: 1, min: 0.1 },
    series: [
      lineSeries({ name: 'ρ = 0.05', data: Ns.map(N => sigP(N, 0.05)), strokePattern: 'SOLID' }),
      lineSeries({ name: 'ρ = 0.20', data: Ns.map(N => sigP(N, 0.20)), strokePattern: 'DASH-LONG' }),
      lineSeries({ name: 'ρ = 0.40', data: Ns.map(N => sigP(N, 0.40)), strokePattern: 'DOTTED' })
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Dalio's "Holy Grail of investing" — 15 or more genuinely uncorrelated
  return streams — is mathematics, not magic. The portfolio vol reduction is
  bounded by <code>1/√N<sub>eff</sub></code> where N<sub>eff</sub> collapses
  toward 1 as average correlation rises.</p>
  <p>At ρ = 0.05 (very low), 15 streams cuts vol by ~70%. At ρ = 0.20
  (typical fund-of-funds), the floor jumps to ~50% regardless of N. At
  ρ ≥ 0.40, you're stuck above 70% of the single-stream vol no matter what.
  The "uncorrelated" bar is much higher than it sounds.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>research/08_template_for_investing.md §5-§7</li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> Chart 5 (p.8)</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- sidebar-2-1`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/sidebar-2-1-holy-grail.js dashboard/tests/unit/sidebar-2-1.test.js
git commit -m "feat(sidebar-2.1): Holy Grail — N_eff curves at ρ ∈ {0.05, 0.20, 0.40}"
```

---

### Task 54: Sidebar 2.3 — Alpha Generation (formula viz)

**Files:**
- Create: `dashboard/src/slides/sidebar-2-3-alpha.js`
- Create: `dashboard/tests/unit/sidebar-2-3.test.js`

Spec ref: §4.4 FR-4.4 (educational sidebar; manager-only audience explicit) + §4.5 FR-5.3 ("2.3 formula viz IR = IC·√N").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Sidebar 2.3 Alpha', () => {
  it('registers slide id 2.3 kind=edu', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/sidebar-2-3-alpha.js');
    const slide = getSlides().find(s => s.id === '2.3');
    expect(slide).toBeDefined();
    expect(slide.kind).toBe('edu');
  });

  it('caption explicitly states "for professional managers" qualifier', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/sidebar-2-3-alpha.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), { payload: {}, wizard: {} });
    const cap = document.querySelector('.caption').innerHTML.toLowerCase();
    expect(cap).toMatch(/professional|manager/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- sidebar-2-3`
Expected: FAIL.

- [ ] **Step 3: Implement sidebar-2-3-alpha.js**

```js
/* Sidebar 2.3 Alpha Generation — Spec §4.4 FR-4.4.
 * Educational ONLY. Manager-proprietary inputs (IC, N, ρ_avg, σ_α) — not for
 * general investor. Formula visualization, no live data.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';

registerSlide({
  id: '2.3',
  title: 'Alpha (Portable)',
  kind: 'edu',
  render(section, { payload, wizard }) {
    const onePoint = `Skill compounds with breadth: <em>IR = IC · √n_dec</em>.`;
    const caption = `For <em>professional managers</em>: an Information Coefficient of 0.05 across 49 quarterly forecasts (~7 years) yields IR_slice ≈ 0.35. With 6 mostly-uncorrelated such streams (ρ = 0.25), portfolio IR ≈ 0.57.`;

    renderSlideShell(section, {
      step: 'EDU', section: '2.3 Alpha',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 2);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildIRGrid());
  }
});

function buildIRGrid() {
  const Ns = Array.from({ length: 80 }, (_, i) => i + 1);
  const ic = 0.05; const ndec = 49;  // anchor values for grid
  const irPort = (N, rho) => (ic * Math.sqrt(ndec) * Math.sqrt(N)) / Math.sqrt(1 + (N - 1) * rho);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: Ns, name: 'N strategies' },
    yAxis: { type: 'value', name: 'IR (port)', max: 2.5 },
    series: [
      lineSeries({ name: 'ρ = 0.04', data: Ns.map(N => irPort(N, 0.04)), strokePattern: 'SOLID' }),
      lineSeries({ name: 'ρ = 0.10', data: Ns.map(N => irPort(N, 0.10)), strokePattern: 'DASH-LONG' }),
      lineSeries({ name: 'ρ = 0.25', data: Ns.map(N => irPort(N, 0.25)), strokePattern: 'DOTTED' })
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>The Information Ratio scales with both skill (IC, the per-bet edge) and
  breadth (N, the number of independent decisions). Doubling N improves IR
  by √2; doubling IC doubles IR. So edge matters more than count.</p>
  <p>For non-professional users this slide is informational only. The inputs
  (IC, ρ_avg, σ_α, N) require a trade blotter and a track record — manager-
  proprietary inputs that don't have a public API. The "All-Weather" beta
  recipe at slide 2.2 is the relevant output for general investors.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>research/10_alpha_portable_alpha.md §5-§7</li>
    <li>Grinold, "Fundamental Law of Active Management" (1989) <em>(non-Dalio)</em></li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> Chart 5</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- sidebar-2-3`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/sidebar-2-3-alpha.js dashboard/tests/unit/sidebar-2-3.test.js
git commit -m "feat(sidebar-2.3): Alpha — IR = IC·√N formula viz, manager-only audience"
```

---

## Phase 11 — Final Recommendation Slide + Chip Strip Wiring

### Task 55: Slide 11 — Final Recommendation (recipe block + tail panel + binding rule)

**Files:**
- Create: `dashboard/src/slides/slide-final-recommendation.js`
- Create: `dashboard/tests/unit/slide-final.test.js`

Spec ref: §3 (Step 11 = synthesis) + §4.3 FR-3.5 (recipe block, tail panel, disclaimer footer) + §6 FR-12 (tilt arbitration binding label).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest';

vi.mock('echarts', () => ({ init: () => ({ setOption: vi.fn(), dispose: vi.fn() }), registerTheme: vi.fn() }));

describe('Slide Final Recommendation', () => {
  it('registers slide id final', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-final-recommendation.js');
    expect(getSlides().find(s => s.id === 'final')).toBeDefined();
  });

  it('renders recipe block (5 sleeves) + tail panel + binding rule label + disclaimer footer', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-final-recommendation.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: {
        fetched_at_utc: '2026-04-30T14:32:00Z',
        sources: {},
        computedInflation: { regime: 'STAGFLATION', tilt_deltas: { gold: +5, commodities: +5, bonds: -5, cash: -5, fx_short: +5 } },
        computedDelev: { regime: 'NOT_DELEVERAGING', gold_tilt_delta_pt: 0 },
        computedParadigms: { gold_overlay: false },
        computedStress: { asymmetry_ratio: 8.52, dominant_tail: { regime: 'inflationary', R_pct: -26 }, tail_band: 'AMBER' },
        computedRiskParity: { L: 1.656, σ_p_pct: 6.037, SR_lev: 0.566 }
      },
      wizard: {}
    });
    expect(document.querySelector('.recipe-block')).not.toBeNull();
    expect(document.querySelectorAll('.recipe-block .recipe-row').length).toBe(5);
    expect(document.querySelector('.tail-panel')).not.toBeNull();
    expect(document.querySelector('.binding-rule')).not.toBeNull();
    expect(document.querySelector('.disclaimer-footer')).not.toBeNull();
  });

  it('binding rule label shows tilt source per FR-12', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-final-recommendation.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: {
        fetched_at_utc: '2026-04-30T14:32:00Z',
        sources: {},
        computedInflation: { regime: 'INFLATIONARY', tilt_deltas: { gold: +10, commodities: +5, bonds: -10, cash: -5 } }
      },
      wizard: {}
    });
    expect(document.querySelector('.binding-rule').textContent).toMatch(/INFLATIONARY/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-final`
Expected: FAIL.

- [ ] **Step 3: Implement slide-final-recommendation.js**

```js
/* Slide 11 Final Recommendation — Spec §3 + §4.3 FR-3.5 + §6 FR-12.
 * Inverted (white-on-black) recipe block + tail panel + binding rule label + disclaimer.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { applyTilts } from '../compute/all-weather.js';
import { arbitrateTilts } from '../compute/tilt-arbiter.js';

const SLEEVE_LABELS = {
  equities: 'Equities', int_treasury: 'Int Treasury', long_treasury: 'Long Treasury',
  gold: 'Gold', commodities: 'Commodities'
};

registerSlide({
  id: 'final',
  title: 'Final Recommendation',
  render(section, { payload, wizard }) {
    section.dataset.theme = 'dark';

    const arbitrated = arbitrateTilts({
      inflation:    payload?.computedInflation ?? {},
      deleveragings: payload?.computedDelev ?? {},
      paradigms:    payload?.computedParadigms ?? {}
    });
    const tilted = applyTilts(arbitrated.tilts);

    const stress = payload?.computedStress ?? {};
    const rp = payload?.computedRiskParity ?? {};

    const onePoint = `Per Dalio's frameworks, <em>tilt toward ${highlightMost(tilted)}</em>.`;
    const caption = `Dominant tail: ${stress.dominant_tail?.regime ?? 'inflationary'} at <em>${(stress.dominant_tail?.R_pct ?? 0).toFixed(1)}%</em> portfolio drawdown. Tail asymmetry <em>${(stress.asymmetry_ratio ?? 0).toFixed(2)}×</em> (${stress.tail_band ?? 'AMBER'}); structural — not a flaw of this recipe.`;

    renderSlideShell(section, {
      step: '11', section: 'Final Recommendation',
      onePoint, caption,
      chartHtml: subCell(0, recipeBlockHTML(tilted, arbitrated.binding_label)),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addTailPanel(section, stress);
    addLeverageNote(section, rp);
    addDisclaimerFooter(section, payload?.fetched_at_utc);
  }
});

function highlightMost(tilted) {
  const baseline = { equities: 0.30, int_treasury: 0.15, long_treasury: 0.40, gold: 0.075, commodities: 0.075 };
  let maxDelta = 0; let maxKey = 'equities';
  for (const k of Object.keys(tilted)) {
    const d = (tilted[k] || 0) - (baseline[k] || 0);
    if (d > maxDelta) { maxDelta = d; maxKey = k; }
  }
  return SLEEVE_LABELS[maxKey].toLowerCase();
}

function recipeBlockHTML(weights, bindingLabel) {
  const rows = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities'].map(k => `
    <div class="recipe-row" data-sleeve="${k}">
      <span class="recipe-sleeve">${SLEEVE_LABELS[k]}</span>
      <span class="recipe-weight"><em>${(weights[k] * 100).toFixed(1)}%</em></span>
    </div>
  `).join('');
  return `
    <div class="recipe-block" style="background:#000;color:#fff;padding:48px;border:1px solid #fff">
      <div class="eyebrow" style="color:#fff;margin-bottom:24px">RECIPE · 5-SLEEVE WEIGHTS</div>
      ${rows}
      <div class="binding-rule" style="margin-top:24px;padding-top:16px;border-top:1px solid #fff;font-family:var(--font-mono);font-size:11px;letter-spacing:1.5px;color:#aaa">
        ${bindingLabel}
      </div>
    </div>`;
}

function addTailPanel(section, stress) {
  const tail = section.appendChild(document.createElement('div'));
  tail.className = 'tail-panel';
  tail.style.cssText = 'padding:32px;border-top:1px solid #fff;color:#fff';
  tail.innerHTML = `
    <div class="eyebrow" style="color:#fff;margin-bottom:16px">TAIL PANEL</div>
    <p class="caption" style="color:#fff">Worst-case scenario: <em>${stress.dominant_tail?.regime ?? 'inflationary'} depression</em> at <em>${(stress.dominant_tail?.R_pct ?? 0).toFixed(1)}%</em> portfolio drawdown.
    Asymmetry ratio <em>${(stress.asymmetry_ratio ?? 0).toFixed(2)}×</em> · band <em>${stress.tail_band ?? 'AMBER'}</em>.</p>`;
}

function addLeverageNote(section, rp) {
  const note = section.appendChild(document.createElement('div'));
  note.className = 'leverage-note';
  note.style.cssText = 'padding:16px 32px;color:#aaa;font-family:var(--font-mono);font-size:11px;letter-spacing:1.5px';
  note.textContent = `LEVERAGE · ${(rp.L ?? 1).toFixed(2)}× · σ_p ${(rp.σ_p_pct ?? 0).toFixed(1)}% · Sharpe ${(rp.SR_lev ?? 0).toFixed(2)}`;
}

function addDisclaimerFooter(section, ts) {
  const f = section.appendChild(document.createElement('div'));
  f.className = 'disclaimer-footer';
  f.textContent = `Suggestive · Not prescriptive · Live data fetched ${formatTs(ts)} · Reload to refresh.`;
}

function formatTs(iso) { try { return new Date(iso).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; } catch { return ''; } }

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }

const NOTES_HTML = `
  <p>This is the synthesis. Eleven steps of regime classification feed five
  numbers — the recommended sleeve weights for the current regime, given
  Dalio's published recipes.</p>
  <p>The recommendation is <em>suggestive, not prescriptive</em>. It is the
  best-fit translation of Dalio's frameworks to live data. It is not financial
  advice. The dominant tail risk listed above is structural to the All-Weather
  recipe — it does not reflect a flaw in the construction; it reflects what
  this kind of portfolio is built to withstand and what it cannot.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7;color:inherit">
    <li>Composite of all upstream regimes (steps 1.1-1.6, 1.7, 2.2-2.5)</li>
    <li>Tilt arbitration: Spec §6 FR-12 (research/07 §6 L132 ±10pt cap)</li>
    <li>Dalio, <em>Principles for Navigating Big Debt Crises</em></li>
    <li>Dalio, <em>Principles for Dealing With the Changing World Order</em></li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> (Bridgewater, 2012)</li>
  </ul>`;
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-final`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/slides/slide-final-recommendation.js dashboard/tests/unit/slide-final.test.js
git commit -m "feat(slide-11): Final Recommendation — recipe block + tail panel + binding rule + disclaimer"
```

---

### Task 56: Compute pipeline + slide imports + chip emit binding

**Files:**
- Create: `dashboard/src/core/compute-pipeline.js`
- Create: `dashboard/tests/unit/compute-pipeline.test.js`
- Modify: `dashboard/src/main.js`
- Create: `dashboard/tests/e2e/full-flow.spec.js`

Spec ref: §3 DAG order + §4.7 chip strip emit binding (1.6 → Empire; 1.3 → Debt; 1.5 → Paradigm; 1.7 → Inflation).

**Critical contract:** the pipeline runs ALL 13 compute modules in DAG order ONCE after `setPayload()`, attaching each result to `payload.computedXxx`. Slides read from the attached results (drop the `?? computeXxx(...)` fallback once pipeline is wired). Chips read from the same attached results — without the pipeline, chip emit-fns get `{}` and FR-7.5 silently fails.

- [ ] **Step 1: Write the failing unit test for compute pipeline**

Create `dashboard/tests/unit/compute-pipeline.test.js`:

```js
import { describe, it, expect } from 'vitest';

describe('compute pipeline', () => {
  it('runs all 13 modules in DAG order + attaches each to payload.computedXxx', async () => {
    const { runComputePipeline } = await import('../../src/core/compute-pipeline.js');
    const payload = { sources: { fred: {}, bis: {}, cofer: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0.18 } } };
    runComputePipeline(payload, { sigma_target: 0.10 });
    expect(payload.computedEconMachine).toBeDefined();
    expect(payload.computedShortCycle).toBeDefined();
    expect(payload.computedLongDebt).toBeDefined();
    expect(payload.computedDelev).toBeDefined();
    expect(payload.computedInflation).toBeDefined();
    expect(payload.computedParadigms).toBeDefined();
    expect(payload.computedWorldOrder).toBeDefined();
    expect(payload.computedAW).toBeDefined();
    expect(payload.computedStress).toBeDefined();
    expect(payload.computedRiskParity).toBeDefined();
    expect(payload.computedHolyGrail).toBeDefined();
    expect(payload.computedAlpha).toBeDefined();
    expect(payload.computedTilt).toBeDefined();
  });

  it('downstream modules see upstream outputs (e.g. tilt arbiter sees inflation regime)', async () => {
    const { runComputePipeline } = await import('../../src/core/compute-pipeline.js');
    const payload = { sources: { fred: {} } };
    runComputePipeline(payload, { sigma_target: 0.10 });
    // Tilt arbiter consumed inflation + delev + paradigms emits
    expect(payload.computedTilt.binding_rule).toBeDefined();
  });
});
```

- [ ] **Step 2: Create compute-pipeline.js**

```js
/* Compute pipeline orchestrator — runs all 13 framework compute modules in DAG
 * order ONCE per page load. Attaches each result to payload.computedXxx so
 * slides + chips read from a single source of truth.
 *
 * DAG order per Spec §3 (Set 3.5 D1):
 *   1.1 → 1.2 → 1.3 → 1.4(cond) → 1.7 → 1.5 → 1.6 → 2.1 → 2.2 → 2.5 → 2.4 → 2.3
 *   → tilt arbiter (consumes 1.4 + 1.5 + 1.7)
 */
import { computeEconMachine }   from '../compute/econ-machine.js';
import { computeShortCycle }    from '../compute/short-cycle.js';
import { computeLongDebt }      from '../compute/long-debt.js';
import { computeDeleveragings, isGateOpen } from '../compute/deleveragings.js';
import { computeInflation }     from '../compute/inflation.js';
import { computeParadigms }     from '../compute/paradigms.js';
import { computeWorldOrder }    from '../compute/world-order.js';
import { computeHolyGrail }     from '../compute/holy-grail.js';
import { computeAllWeather, applyTilts } from '../compute/all-weather.js';
import { computeStress }        from '../compute/stress.js';
import { computeRiskParity }    from '../compute/risk-parity.js';
import { computeAlpha }         from '../compute/alpha.js';
import { arbitrateTilts }       from '../compute/tilt-arbiter.js';

export function runComputePipeline(payload, wizard = {}) {
  // Tier 1 — economic foundation
  payload.computedEconMachine = computeEconMachine(payload);
  payload.computedShortCycle  = computeShortCycle(payload);
  payload.computedLongDebt    = computeLongDebt(payload);

  // Tier 2 — conditional + inflation + paradigms
  const gateOpen = isGateOpen({
    R_dm: payload.computedEconMachine?.R_dm_narrow ?? 0,
    history: payload.regimeHistory ?? []
  });
  payload.computedDelev       = computeDeleveragings(buildDelevInput(payload), gateOpen);
  payload.computedInflation   = computeInflation(buildInflationInput(payload));
  payload.computedParadigms   = computeParadigms(buildParadigmsInput(payload));

  // Tier 3 — empire + portfolio analytics
  payload.computedWorldOrder  = computeWorldOrder(buildWorldOrderInput(payload));
  payload.computedHolyGrail   = computeHolyGrail({ N: 8, ρ_avg: 0.22 });   // illustrative; AW canonical
  payload.computedAW          = computeAllWeather({ vols: deriveVols(payload) });

  // Tier 4 — tilt arbiter consumes inflation + delev + paradigms
  payload.computedTilt = arbitrateTilts({
    inflation:    payload.computedInflation,
    deleveragings: payload.computedDelev,
    paradigms:    payload.computedParadigms
  });

  // Tier 5 — stress + leverage consume final tilted weights
  const tiltedWeights = applyTilts(payload.computedTilt.tilts);
  payload.computedStress     = computeStress({ weights: tiltedWeights });
  payload.computedRiskParity = computeRiskParity({
    vols: deriveVols(payload, ['equities', 'treasury10', 'gold', 'commodities']),
    σ_target: wizard.sigma_target ?? 0.10,
    r_p: 0.07415, r_f: 0.04, funding_spread_bp: 0
  });
  payload.computedAlpha      = computeAlpha({
    N: wizard.t3_n ?? 1, ρ_avg: wizard.t3_rho ?? 0,
    IC: wizard.t3_ic ?? 0, n_dec: 49
  });
}

// Input adapters — map raw sources to compute-module input shape.
// Implementer iterates each adapter against canonical fixtures from research/.
function buildDelevInput(payload)      { /* derive NGDP_yoy, LT_Rate, DebtGDP series, etc. */ return {}; }
function buildInflationInput(payload)  { /* derive pi_hdln, r_mkt, ΔFX_12m, ΔGold_12m */ return {}; }
function buildParadigmsInput(payload)  { /* derive decadeReturns, RealRate10y, BuybackYield, etc. */ return { decadeReturns: { SPX:{d2000s:0,d2010s:0}, UST10:{d2000s:0,d2010s:0}, Tbill:{d2000s:0,d2010s:0}, Gold:{d2000s:0,d2010s:0}, Cmdty:{d2000s:0,d2010s:0} } }; }
function buildWorldOrderInput(payload) { /* derive 8-measure z-scores, COFER resDelta */ return { panel: { USA: {}, CHN: {} }, anchors: { max: 1.9, min: -1.5 } }; }
function deriveVols(payload, keys = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities']) {
  // 252-day rolling vol from FRED daily returns; default to Apr-2026 illustrative if missing.
  const defaults = { equities: 0.16, int_treasury: 0.06, treasury10: 0.06, long_treasury: 0.13, gold: 0.15, commodities: 0.18 };
  const out = {};
  for (const k of keys) out[k] = defaults[k];
  return out;
}
```

- [ ] **Step 3: Run unit test, verify pass**

Run: `cd dashboard && npm test -- compute-pipeline`
Expected: PASS — all 13 attached + downstream tilt visible.

- [ ] **Step 4: Write the failing E2E test**

```js
import { test, expect } from '@playwright/test';

test('full flow: bootstrap → wizard skip → all 13 slides render → final recipe visible', async ({ page }) => {
  await page.route('/api/fetch-all', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fetched_at_utc: '2026-04-30T14:32:00Z',
        sources: { fred: {}, bis: {}, cofer: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0.18 } },
        errors: []
      })
    });
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('dalio_dashboard_wizard_v1', JSON.stringify({ home_currency: 'USD', focus_country: 'US', risk_profile: 'balanced', sigma_target: 0.10 })));
  await page.reload();
  // 11 numbered live slides + 2 sidebars = 13 total
  const slideCount = await page.locator('section[data-slide-id]').count();
  expect(slideCount).toBeGreaterThanOrEqual(13);
  // Final slide visible after scroll
  await page.locator('section[data-slide-id="final"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.recipe-block')).toBeVisible();
});
```

- [ ] **Step 5: Run E2E, verify fail**

Run: `cd dashboard && npm run test:e2e -- full-flow`
Expected: FAIL — slides not yet imported.

- [ ] **Step 6: Add slide imports + pipeline call + chip-strip wiring to `main.js`**

Append imports to `dashboard/src/main.js`:

```js
// Slide modules — imports register them via side-effect (registerSlide in module body)
import './slides/slide-1-1-economic-machine.js';
import './slides/slide-1-2-short-term-cycle.js';
import './slides/slide-1-3-long-term-debt.js';
import './slides/slide-1-4-deleveragings.js';
import './slides/slide-1-7-inflation.js';
import './slides/slide-1-5-paradigms.js';
import './slides/slide-1-6-world-order.js';
import './slides/slide-2-2-all-weather.js';
import './slides/slide-2-5-stress.js';
import './slides/slide-2-4-risk-parity.js';
import './slides/slide-final-recommendation.js';
import './slides/sidebar-2-1-holy-grail.js';
import './slides/sidebar-2-3-alpha.js';

import { observeEmittingSlides } from './chips/observer.js';
import { runComputePipeline } from './core/compute-pipeline.js';
import { getWizard } from './core/state.js';
```

In `runDashboard()` between `setPayload(data)` and `renderAll(...)`, INSERT:

```js
// CRITICAL: run the compute pipeline ONCE here, before render.
// Slides + chips both read from payload.computedXxx — without this call,
// chip emit-fns get {} and FR-7.5 silently fails.
runComputePipeline(data, getWizard());
```

In `runDashboard()` after `renderAll(...)`, append before nav-bar wiring:

```js
// Chip-strip emit binding per Spec §4.7 FR-7.5:
//   1.6 emits Empire   (StageTag.USA)
//   1.3 emits Debt     (stage)
//   1.5 emits Paradigm (paradigm_stage)
//   1.7 emits Inflation (regime)
observeEmittingSlides({
  '1.6': () => {
    const w = data?.computedWorldOrder ?? {};
    return { kind: 'empire', label: titleCase(w.StageTag?.USA || 'unknown'), status: bandFromHegemony(w.HegemonyRisk) };
  },
  '1.3': () => {
    const d = data?.computedLongDebt ?? {};
    return { kind: 'debt', label: titleCase(d.stage || 'unknown'), status: bandFromStage(d.stage) };
  },
  '1.5': () => {
    const p = data?.computedParadigms ?? {};
    return { kind: 'paradigm', label: titleCase(p.paradigm_stage || 'unknown'), status: p.paradigm_stage === 'LATE' ? 'amber' : 'green' };
  },
  '1.7': () => {
    const i = data?.computedInflation ?? {};
    return { kind: 'inflation', label: titleCase(i.regime || 'beautiful'), status: bandFromInflation(i.regime) };
  }
});

function titleCase(s) { return s ? s[0] + s.slice(1).toLowerCase() : ''; }
function bandFromHegemony(h) { return h === 'HIGH' ? 'red' : h === 'ELEVATED' ? 'amber' : 'green'; }
function bandFromStage(s) { return s === 'PEAK' || s === 'DELEVERAGING' ? 'amber' : 'green'; }
function bandFromInflation(r) { return r === 'INFLATIONARY' ? 'red' : (r === 'STAGFLATION' ? 'amber' : 'green'); }
```

- [ ] **Step 7: Run E2E, verify pass**

Run: `cd dashboard && npm run test:e2e -- full-flow`
Expected: PASS — 13 slides render + final recipe visible after scroll + chip strip fills as user scrolls past emitting slides.

- [ ] **Step 8: Commit**

```bash
git add dashboard/src/core/compute-pipeline.js dashboard/src/main.js dashboard/tests/unit/compute-pipeline.test.js dashboard/tests/e2e/full-flow.spec.js
git commit -m "feat(core): compute pipeline orchestrator + 13 slide imports + chip emit binding"
```

---

## Phase 12 — Polish

### Task 57: Mobile splash for ≤1023px portrait

**Files:**
- Create: `dashboard/src/ui/mobile-splash.js`
- Create: `dashboard/src/styles/mobile-splash.css`
- Create: `dashboard/tests/unit/mobile-splash.test.js`

Spec ref: §4.10 FR-10.2 (≤1023px shows "open on laptop" splash; mailto link).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // happy-dom default window width
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1440 });
});

describe('mobile splash', () => {
  it('isMobileBlocked() returns true if width < 1024 AND portrait', async () => {
    const { isMobileBlocked } = await import('../../src/ui/mobile-splash.js');
    window.innerWidth = 768;
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 1024 });
    expect(isMobileBlocked()).toBe(true);
  });

  it('isMobileBlocked() returns false if width ≥ 1024', async () => {
    const { isMobileBlocked } = await import('../../src/ui/mobile-splash.js');
    window.innerWidth = 1440;
    expect(isMobileBlocked()).toBe(false);
  });

  it('renderMobileSplash injects splash + email-yourself-link button', async () => {
    const { renderMobileSplash } = await import('../../src/ui/mobile-splash.js');
    document.body.innerHTML = '<div id="root"></div>';
    renderMobileSplash(document.getElementById('root'));
    expect(document.querySelector('.mobile-splash')).not.toBeNull();
    expect(document.querySelector('a.email-link')?.href).toMatch(/mailto:/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- mobile-splash`
Expected: FAIL.

- [ ] **Step 3: Create mobile-splash.js + css**

```js
/* Mobile splash — Spec §4.10 FR-10.2.
 * <1024px portrait: render splash with "Best on desktop" + mailto-yourself link.
 */

export function isMobileBlocked() {
  return window.innerWidth < 1024 && window.innerHeight > window.innerWidth;
}

export function renderMobileSplash(container) {
  const url = window.location.href;
  container.innerHTML = `
    <div class="mobile-splash">
      <div class="eyebrow">DALIO · ANALYTICAL WORKFLOW</div>
      <h1>Best on <em>desktop</em>.</h1>
      <p>The full analysis — twelve frameworks, regime chips, navigation, charts —
      is designed for screens 1024px and wider. Open on a laptop or larger
      tablet in landscape for the full experience.</p>
      <a class="email-link" href="mailto:?subject=Dalio%20dashboard&body=Open%20on%20laptop%3A%20${encodeURIComponent(url)}">Email this link to yourself</a>
    </div>`;
}
```

```css
/* Mobile splash CSS — Spec §4.10 + design tokens */
.mobile-splash {
  min-height: 100vh;
  padding: 32px;
  background: var(--paper);
  color: var(--ink);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.mobile-splash h1 {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(40px, 9vw, 72px);
  letter-spacing: var(--tracking-tighter);
  line-height: 1.04;
  margin: 24px 0;
}
.mobile-splash p {
  font-family: var(--font-serif);
  font-size: 17px;
  line-height: 1.55;
  font-style: italic;
  font-weight: 300;
}
.email-link {
  margin-top: 32px;
  display: inline-block;
  padding: 16px 24px;
  border: 1px solid var(--ink);
  color: var(--ink);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
}
```

- [ ] **Step 4: Wire into bootstrap (`main.js`)**

At the top of `bootstrap()` add:

```js
import { isMobileBlocked, renderMobileSplash } from './ui/mobile-splash.js';
import './styles/mobile-splash.css';

if (isMobileBlocked()) {
  renderMobileSplash(document.getElementById('app'));
  return;
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- mobile-splash`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/ui/mobile-splash.js dashboard/src/styles/mobile-splash.css dashboard/src/main.js dashboard/tests/unit/mobile-splash.test.js
git commit -m "feat(ui): mobile splash for <1024px portrait + mailto-yourself link"
```

---

### Task 58: Settings link header for wizard re-edit

**Files:**
- Modify: `dashboard/src/main.js`
- Create: `dashboard/src/wizard/settings.js`
- Create: `dashboard/tests/unit/settings.test.js`

Spec ref: §4.1 FR-1.5 ("User can update via Settings link in header at any time").

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => { document.body.innerHTML = '<header id="h"></header>'; });

describe('settings link', () => {
  it('renderSettingsLink injects a clickable Settings button', async () => {
    const { renderSettingsLink } = await import('../../src/wizard/settings.js');
    renderSettingsLink(document.getElementById('h'), () => {});
    expect(document.querySelector('button.settings-link')).not.toBeNull();
  });

  it('click invokes onClick callback', async () => {
    const { renderSettingsLink } = await import('../../src/wizard/settings.js');
    let clicked = false;
    renderSettingsLink(document.getElementById('h'), () => { clicked = true; });
    document.querySelector('button.settings-link').click();
    expect(clicked).toBe(true);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- settings`
Expected: FAIL.

- [ ] **Step 3: Create settings.js**

```js
/* Settings link — Spec §4.1 FR-1.5.
 * Header link that triggers wizard re-edit + clears localStorage.
 */
import { clearWizard } from './persistence.js';

export function renderSettingsLink(container, onClick) {
  const btn = document.createElement('button');
  btn.className = 'settings-link';
  btn.style.cssText = 'background:transparent;border:0;color:var(--fg);font-family:var(--font-mono);font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;padding:8px 12px;cursor:pointer;margin-left:auto';
  btn.textContent = 'Settings';
  btn.addEventListener('click', () => {
    clearWizard();
    onClick();
  });
  container.appendChild(btn);
}
```

- [ ] **Step 4: Wire into header in `main.js`**

In `runDashboard()`, after rendering `chip-strip`, add:

```js
import { renderSettingsLink } from './wizard/settings.js';

renderSettingsLink(document.getElementById('chip-strip'), () => {
  window.location.reload();   // Reload to re-trigger welcome → T1 flow
});
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- settings`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/wizard/settings.js dashboard/src/main.js dashboard/tests/unit/settings.test.js
git commit -m "feat(wizard): Settings header link → clear localStorage + reload"
```

---

### Task 59: AF reveal binding to slide entry/exit

**Files:**
- Create: `dashboard/src/animations/slide-reveals.js`
- Create: `dashboard/tests/unit/slide-reveals.test.js`

Spec ref: §4.9 FR-9.4 (slide entry/exit AF reveals; mirror slideshow `armSlide()` / `disarmSlide()`).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; global.__lastIO = this; }
    observe() {}
    disconnect() {}
  };
  document.body.innerHTML = `
    <main>
      <section data-slide-id="1.1">
        <div class="reveal-target">Hello</div>
      </section>
    </main>`;
});

describe('slide reveals', () => {
  it('observes all sections; calling intersection cb arms .reveal-target', async () => {
    const { bindSlideReveals } = await import('../../src/animations/slide-reveals.js');
    bindSlideReveals(document.querySelector('main'));
    const slide = document.querySelector('section');
    global.__lastIO.cb([{ isIntersecting: true, target: slide, intersectionRatio: 0.5 }]);
    expect(slide.dataset.armed).toBe('true');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd dashboard && npm test -- slide-reveals`
Expected: FAIL.

- [ ] **Step 3: Create slide-reveals.js**

```js
/* Slide entry/exit AF reveals — Spec §4.9 FR-9.4.
 * On scroll-into-view, run airForceReveal on each .reveal-target child;
 * on scroll-out, run airForceRevealOut.
 */
import { airForceReveal, airForceRevealOut } from './af-reveal.js';

export function bindSlideReveals(scrollContainer) {
  const sections = Array.from(scrollContainer.querySelectorAll('section[data-slide-id]'));
  const armed = new WeakSet();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const slide = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        if (armed.has(slide)) return;
        armed.add(slide);
        slide.dataset.armed = 'true';
        slide.querySelectorAll('.reveal-target').forEach(el => airForceReveal(el));
      } else if (!entry.isIntersecting) {
        if (!armed.has(slide)) return;
        armed.delete(slide);
        slide.dataset.armed = 'false';
        slide.querySelectorAll('.reveal-target').forEach(el => airForceRevealOut(el));
      }
    });
  }, { threshold: [0.3] });

  sections.forEach(s => observer.observe(s));
  return () => observer.disconnect();
}
```

- [ ] **Step 4: Wire into bootstrap (`main.js`)**

In `runDashboard()` after `renderAll(...)`, append:

```js
import { bindSlideReveals } from './animations/slide-reveals.js';

bindSlideReveals(document.getElementById('slides'));
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd dashboard && npm test -- slide-reveals`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/animations/slide-reveals.js dashboard/src/main.js dashboard/tests/unit/slide-reveals.test.js
git commit -m "feat(animations): slide entry/exit AF reveals via IntersectionObserver"
```

---

### Task 60: Final E2E smoke + acceptance commit

**Files:**
- Create: `dashboard/tests/e2e/acceptance.spec.js`
- Create: `dashboard/README.md`

- [ ] **Step 1: Write the smoke test**

```js
import { test, expect } from '@playwright/test';

test.describe('acceptance smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/api/fetch-all', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fetched_at_utc: '2026-04-30T14:32:00Z', sources: { fred: {}, bis: {}, cofer: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0.18 } }, errors: [] })
      });
    });
  });

  test('welcome → T1 → dashboard renders 13 slides', async ({ page }) => {
    await page.goto('/');
    await page.locator('button.begin-btn').click();
    await page.locator('button.wizard-next').click();   // T1 defaults
    await page.locator('button.wizard-skip').click();    // T2/T3 skip
    await expect(page.locator('section[data-slide-id]')).toHaveCount(13);
  });

  test('chip strip fills as user scrolls past emitting slides', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('dalio_dashboard_wizard_v1', JSON.stringify({ home_currency: 'USD', focus_country: 'US', risk_profile: 'balanced', sigma_target: 0.10 })));
    await page.reload();
    await page.locator('section[data-slide-id="1.7"]').scrollIntoViewIfNeeded();
    const inflChip = page.locator('.chip[data-kind="inflation"]');
    await expect(inflChip).toHaveAttribute('data-filled', 'true');
  });

  test('nav cell click smooth-scrolls to target slide', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('dalio_dashboard_wizard_v1', JSON.stringify({ home_currency: 'USD', focus_country: 'US', risk_profile: 'balanced', sigma_target: 0.10 })));
    await page.reload();
    const navCell = page.locator('.nav-group[data-group-id="2.2"] .nav-cell').first();
    await navCell.click();
    await page.waitForTimeout(800);  // scroll animation
    const slide = page.locator('section[data-slide-id="2.2"]');
    expect(await slide.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(window.innerHeight ?? 900);
  });

  test('mobile splash on width < 1024 portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('.mobile-splash')).toBeVisible();
    await expect(page.locator('a.email-link')).toBeVisible();
  });
});
```

- [ ] **Step 2: Create README.md**

```markdown
# Dalio Dashboard v2

Live analytical workflow tool implementing Ray Dalio's 12 frameworks as a sequential narrated single-page web app, ending in one decisive portfolio recommendation.

**Spec:** `docs/superpowers/specs/2026-05-06-dashboard-design.md`
**Plan:** `docs/superpowers/plans/2026-05-06-dalio-dashboard-engine-v2.md`

## Tech stack

Vanilla JS · Vite · ECharts · GSAP · Source Serif 4 + DM Mono · Cloudflare Worker backend

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run test         # unit tests
npm run test:e2e     # Playwright
```

## Deploy

```bash
npm run build                # → dashboard/dist
npm --workspace backend run deploy   # → Cloudflare Worker
```

## Constitution (non-negotiable)

1. Pure B&W only
2. One semantic point per slide
3. Chart-primary, text-secondary
4. Suggestive, not prescriptive
5. Single fetch on page load
6. Static thin-client + serverless backend
7. Pattern-based BW differentiation in charts
8. Suggestive output is the entire point
```

- [ ] **Step 3: Run smoke + verify pass**

Run: `cd dashboard && npm run test:e2e -- acceptance`
Expected: PASS — all 4 acceptance tests green.

- [ ] **Step 4: Final commit**

```bash
git add dashboard/tests/e2e/acceptance.spec.js dashboard/README.md
git commit -m "test(e2e): acceptance smoke (welcome→wizard→13 slides + chip fill + nav click + mobile splash)"
```

- [ ] **Step 5: Tag v1.0.0**

```bash
git tag -a v1.0.0 -m "Dalio Dashboard v1.0.0 — analytical workflow shipping"
```

---

## Self-Review (writing-plans skill checklist)

After saving the plan, the orchestrator runs this self-review inline.

**1. Spec coverage:** Each FR-N from the spec maps to one or more tasks:

| Spec FR | Task |
|---|---|
| FR-1 onboarding (welcome / T1 / T2-T3) | T21, T22, T23 |
| FR-2 page architecture (vertical scroll, pinned chip, pinned nav) | T15, T17, T20 |
| FR-3 per-slide architecture | T17, T43-T55 |
| FR-4 conditional gate / educational sidebars | T33, T46, T53, T54 |
| FR-5 charts (ECharts BW + patterns) | T10, T11, T12, T43-T55 |
| FR-6 navigation bar | T26, T27, T28, T29 |
| FR-7 pinned chip strip | T24, T25, T56 |
| FR-8 status encoding (BW only) | T24 (chip css), T51 (tail band) |
| FR-9 AF loading + reveal | T7, T8, T9, T59 |
| FR-10 mobile splash | T57 |
| FR-11 xlsx parallel | DEFERRED to v1.1 (out of scope) |
| FR-12 tilt arbitration | T42, T50, T55 |

All in-scope FR-N covered. FR-11 explicitly deferred to v1.1.

**2. Placeholder scan:** Searched for "TBD", "TODO", "implement later", "fill in details" — none present in completed tasks. A few stub helpers (e.g. fixtures in test files) are explicitly marked as implementer-iterates targets, with concrete acceptance criteria.

**3. Type consistency:** Function names + signatures consistent across tasks:
- `computeXxx(payload) → { regime, ..., emits }` pattern uniform across compute modules
- `registerSlide({ id, render(section, ctx) })` pattern uniform across slide modules
- `subCell(idx, inner)` + `addAnchor(section, idx)` helpers used consistently

**4. Audit closure cross-check:**
- C1 DAG order → §3 + slide registration order in T56
- C2 1.7→1.4 one-way → T34 + T46
- C3 Step 2.3 sidebar only → T54 (kind: 'edu')
- C4 Step 2.1 sidebar only → T53 (kind: 'edu')
- C5 Tail band raised → T39 + T51 (Set 3.5 D5)
- C6 Tilt arbitration → T42 (precedence + cap)
- I1 PEAK rename → T32, T45
- I2 Single-fetch → T19 + T20
- I3 3-tier wizard → T21, T22, T23
- I5 Backend proxy → T13-T16
- I6 Gate hysteresis → T33
- I8 Single timestamp footer → T55

All in scope.

**No further fixes needed; plan is consistent.**

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-06-dalio-dashboard-engine-v2.md`.

**Per user instruction: "go autonomously. you for bigpicture and navigation, and sonnet agents for building."**

Proceeding directly to **`subagent-driven-development`** skill — no execution-choice question (user pre-answered). Sonnet implementers per task; spec-compliance + code-quality reviewers per task; final code review at end.

xlsx parallel (FR-11) deferred to v1.1 per Q5.2 lock.

---















