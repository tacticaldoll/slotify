# Changelog

All notable changes to the Slotify Hugo theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-09-10

### Added
- **Search Keyword Highlighting**: Interactive search keyword highlighting across result titles and summaries powered by `highlightText` utility and theme-harmonious `.search-highlight` styling.
- **Post Publication Date in PostMeta**: Display post publication date with calendar icon alongside author, reading time, and word count in a restructured two-row vertical hierarchy.
- **Bidirectional Search URL Synchronization**: Query keyword synchronization to and from URL route query (`?q=`) via debounced `router.replace`, supporting shareable search links and browser history navigation.
- **Automated Smoke Tests**: Playwright smoke test coverage for keyword highlighting mark insertion, search query clearing, and URL settlement to `/search/`.

### Changed
- **Taxonomy Predicates Convergence**: Extracted `hasSeries` and `hasTags` predicates in `contentFields.js` and composed `hasTaxonomy`, converging inline taxonomy checks across `PostCard.js` and `PostMeta.js`.
- **Release Governance Documentation**: Codified release-centric integration branching (`release/<version>`), strict squash merge commit standards, late version bumping, and body-less release commits on `main` in `CONTRIBUTING.md`.

### Fixed
- **Search Highlight HTML Entity Escaping**: Prevented HTML entity corruption and nested matching by ordering query terms in descending length order.
- **Debounce Timer Hoisting**: Hoisted timer cancellation outside conditional guards in `useSearch.js` to eliminate query resurrection during clear and back navigation.
- **Vue Prop Reactivity Invariant**: Centralized route query reading via `readQuery` utility and guarded write-back synchronization to maintain single source of truth.

## [0.2.0] - 2026-09-09

### Added
- **Offline KaTeX Assets**: Pinned KaTeX 0.16.21 JS, CSS, and 20 WOFF2 webfonts in `static/vendor/` with SHA-256 integrity verification in `data/vendor-lock.json`.
- **Math Passthrough Delimiters**: Configured Hugo Goldmark passthrough extensions for inline (`$..$`, `\(..\)`) and display (`$$..$$`, `\[..\]`) mathematical formulas.
- **Math Feature Flag**: Introduced `params.features.math` (default `true`) allowing site authors to toggle KaTeX hydration and lazy asset loading.
- **Lazy Client-Side Hydration**: Implemented `useKatex` composable in Vue SPA to dynamically load KaTeX styles and script only when `.math` elements exist on the rendered page.
- **Markup Render Hooks**: Added `render-passthrough-inline.html` and `render-passthrough-block.html` emitting formula source via `data-math` attributes.
- **Mathematical Showcase**: Added comprehensive formula typesetting showcases (Euler's identity, Gaussian integral, Einstein field equations, Schrödinger equation, and Maxwell's equations) in `exampleSite/content/posts/showcase/index.md`.
- **Internationalization**: Added `ui.mathError` localization keys for English (`en.json`) and Traditional Chinese (`zh.json`).
- **Playwright Smoke Tests**: Added automated test coverage verifying KaTeX hydration, formula rendering, and empty formula filtering.

### Changed
- **Pre-Paint CSS Scoping**: Scoped pre-hydration formula suppression to `.slotify-js` (injected synchronously via head pre-paint script), eliminating raw LaTeX flash for JavaScript users while preserving raw formula visibility for no-JS environments.
- **Shared Content Hydration Skeleton**: Consolidated lazy library injection into `useLazyLibrary.js` and hydration error presentation into `useContentError.js`, strictly enforcing the architectural layer boundary (composables own DOM side effects, utils hold pure functions only).
- **Unified Hydration Error Styling**: Consolidated error presentation styling in `slotify.css` for consistent error banners and fallback code presentation across Mermaid and KaTeX.

### Fixed
- **Inline Math Baseline Displacement**: Restored `display: inline` on `.math.inline` to prevent text baseline displacement against CSS 2.1 §10.8.1.
- **Accessible Error Presentation**: Separated screen-reader accessible alert notices (`role="alert"`) from raw formula code elements on rendering failure.
- **Empty Formula Guard**: Marked whitespace-only formulas with `data-processed="empty"` to cleanly bypass rendering without visual disturbance.
- **Declarative Vendor Rewrites**: Replaced hardcoded CSS patch with declarative URL rewrites in `data/vendor.json` and `.agent/scripts/download-vendor.py`.
- **Feature Flag Symmetry**: Added explicit `features.mermaid` configuration guard to `hydrateMermaid` in `useContentHydration.js`.
- **CI Workflow Concurrency**: Isolated GitHub Actions concurrency groups per git ref while preserving non-cancellation on `main` deployments.

## [0.1.0] - 2026-06-12

### Added
- **Hybrid SPA Architecture**: Vue 3 + Vuetify 3 frontend with Hugo headless backend communicating via per-page JSON output formats.
- **Dual Pagination Engine**: Support for both instant client-side feed slicing (`client`) and build-time SEO-optimized paginator documents (`static`).
- **Theme Personalities**: 12 curated color palettes (Tokyo Night, Nord, Catppuccin, Gruvbox, etc.) with automatic light/dark mode and persistence.
- **Content Hydration**: Native SPA support for code syntax highlighting, copy-to-clipboard buttons, Mermaid diagram rendering, and image lightbox.
- **Client-Side Search**: Offline instant search powered by Fuse.js and pre-built search index.
- **Air-Gapped Vendor Bundle**: Zero runtime CDN dependencies; all scripts, stylesheets, and webfonts bundled locally and verified by hash.
- **Enterprise Architecture Audits**: Built-in pre-commit hooks enforcing line endings, 2-space indentation, lifecycle rules, and slot contracts.

[0.2.1]: https://github.com/tacticaldoll/slotify/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/tacticaldoll/slotify/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tacticaldoll/slotify/releases/tag/v0.1.0
