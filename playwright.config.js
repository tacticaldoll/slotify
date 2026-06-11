// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright config for the Slotify theme browser smoke tests.
 *
 * The theme is a no-bundler SPA: the only runtime checks possible without a
 * browser are Hugo build + JSON validators. These tests cover the behaviour
 * those can't see — module loading, client-side routing, slot hydration,
 * Mermaid render, and code-copy — by driving a real `hugo server` of the
 * exampleSite. The webServer command mirrors the build command in the README
 * (`--themesDir ../..` because exampleSite sets `theme = 'slotify'` and the
 * theme lives in the repo root, one level above exampleSite's parent).
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:1313',
    trace: 'on-first-retry',
  },
  // Two servers, each PINNED to a pagination mode via `env` (the exampleSite
  // default is irrelevant to the suite, so both modes stay covered): client on
  // 1313 (full suite) and static on 1314 (the pagination.spec checks). `env`
  // sets the Hugo param cross-platform — no inline `VAR=val` shell prefix, which
  // Windows cmd wouldn't parse.
  webServer: [
    {
      command: 'hugo server --source exampleSite --themesDir ../.. --port 1313 --disableFastRender --renderStaticToDisk',
      url: 'http://localhost:1313',
      env: { HUGO_PARAMS_PAGINATIONMODE: 'client' },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'hugo server --source exampleSite --themesDir ../.. --port 1314 --disableFastRender --renderStaticToDisk',
      url: 'http://localhost:1314',
      env: { HUGO_PARAMS_PAGINATIONMODE: 'static' },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
  projects: [
    // Desktop runs the full suite (the smoke flows assume the desktop header
    // layout) EXCEPT the static-pagination spec, which points at the 1314 server.
    { name: 'chromium', testIgnore: /pagination\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
    // Static-pagination flows: same desktop engine, baseURL -> the 1314
    // (paginationMode=static) server. Scoped to pagination.spec.js only.
    { name: 'static-pagination', testMatch: /pagination\.spec\.js/, use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:1314' } },
    // Mobile + tablet run ONLY the responsive checks — testMatch scopes them so
    // the smoke flows (which click desktop-only header links) don't run there.
    { name: 'mobile', testMatch: /responsive\.spec\.js/, use: { ...devices['Pixel 5'] } },
    // Tablet width on the Chromium engine (a real iPad device profile would pull
    // in WebKit); ~820px lands in Vuetify's `sm` band, between mobile and desktop.
    { name: 'tablet', testMatch: /responsive\.spec\.js/, use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 } } },
  ],
});
