/**
 * useMermaid.js
 * Owns every Mermaid DOM + library side effect: applying the theme config and
 * rendering each .mermaid diagram from its text source, plus the visible error
 * fallback. utils/mermaidTheme.js stays pure (color + config computation); this
 * composable performs the mermaid.initialize()/render() calls and DOM mutation
 * (DOM/side-effect logic belongs in composables, not utils).
 */
import { t } from '../i18n.js';
import { themeColorsForMermaid, mermaidInitConfig } from '../utils/mermaidTheme.js';

// Mermaid is a large (~3 MB) self-contained global build, NOT an ES module — it
// sets window.mermaid when its classic <script> runs (so it can't be `import()`ed
// as a module). data/vendor.json marks it `lazy`, keeping it out of the eager
// vendor load; we inject the <script> on demand here, the first time a page
// actually has a diagram. The promise is a module-level singleton so concurrent
// or repeat callers share one load, and callers await it (rather than the old
// fire-and-forget `if (!window.mermaid) return` guard) so the render never
// silently races the download.
let mermaidLoad = null;
export function loadMermaid() {
  if (typeof window.mermaid !== 'undefined') return Promise.resolve(window.mermaid);
  if (mermaidLoad) return mermaidLoad;
  const src = (window.__SLOTIFY_LAZY__ || {}).mermaid;
  if (!src) return Promise.reject(new Error('[Slotify] Mermaid source not configured (data/vendor.json lazy entry).'));
  mermaidLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(window.mermaid);
    // Reset on failure so a later page can retry rather than be stuck on a
    // rejected singleton (e.g. a transient network error).
    script.onerror = () => { mermaidLoad = null; reject(new Error('[Slotify] Mermaid failed to load.')); };
    document.head.appendChild(script);
  });
  return mermaidLoad;
}

export function useMermaid() {
  /**
   * Replace a diagram that failed to render with a visible, non-destructive
   * fallback: a localized error notice plus the original source (so the
   * information is never silently lost). Source is written via textContent to
   * avoid injecting markup.
   */
  const renderError = (el, source, err) => {
    el.removeAttribute('data-processed');
    el.classList.add('mermaid--error');
    el.textContent = '';

    const notice = document.createElement('p');
    notice.className = 'mermaid-error__title';
    notice.setAttribute('role', 'alert');
    notice.textContent = t('ui.mermaidError');

    const code = document.createElement('pre');
    code.className = 'mermaid-error__source';
    code.textContent = source;

    el.appendChild(notice);
    el.appendChild(code);

    console.warn('[Slotify] Mermaid render failed:', (err && err.message) || err);
  };

  /**
   * Apply Slotify theme colors to Mermaid and (re-)render every .mermaid diagram
   * on the page from its text-only source.
   * @param {object} themeObj - a Vuetify theme entry (has `.colors` and `.dark`)
   * @param {boolean} [dark] - explicit dark flag; falls back to themeObj.dark
   */
  const renderDiagrams = (themeObj, dark) => {
    if (typeof mermaid === 'undefined') return;

    mermaid.initialize(mermaidInitConfig(themeColorsForMermaid(themeObj, dark)));

    const nodes = document.querySelectorAll('.mermaid');
    if (!nodes.length) return;

    // Render each diagram in isolation rather than via a single mermaid.run():
    // run() rejects globally on the first malformed diagram, so one bad block of
    // source would leave every other diagram on the page unrendered. Per-node
    // render() lets a syntax error fail to a visible fallback (renderError) while
    // its neighbours still render.
    //
    // Source: `data-graph`, set verbatim by the Hugo render hook
    // (render-codeblock-mermaid.html) from the author's raw fence content. We
    // read it directly — never from rendered DOM/textContent — so the diagram
    // source survives jsonify + Vue v-html + the browser's entity decoding
    // intact, and a re-render on theme switch always reads the original text
    // rather than a previously rendered SVG. textContent is a defensive fallback
    // for any node not produced by the render hook.
    let seq = 0;
    nodes.forEach((el) => {
      const source = (el.dataset.graph ?? el.textContent ?? '').trim();
      el.removeAttribute('data-processed');
      el.classList.remove('mermaid--error');

      const renderId = `mermaid-${seq++}`;
      mermaid.render(renderId, source)
        .then(({ svg, bindFunctions }) => {
          el.innerHTML = svg;
          if (typeof bindFunctions === 'function') bindFunctions(el);
          el.setAttribute('data-processed', 'true');
        })
        .catch((err) => renderError(el, source, err));
    });
  };

  return { renderDiagrams };
}
