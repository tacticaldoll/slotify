/**
 * useKatex.js
 * Owns every KaTeX DOM + library side effect: dynamically loading the KaTeX
 * CSS and JS assets on demand, and rendering each .math element inside the
 * content container.
 */
import { t } from '../i18n.js';

let katexLoad = null;

/**
 * Dynamically load KaTeX stylesheet and JavaScript bundle on demand.
 * Keeps KaTeX out of the eager head payload; only downloaded when a page
 * contains math formulas.
 * @returns {Promise<object>} resolves with window.katex
 */
export function loadKatex() {
  if (typeof window.katex !== 'undefined') return Promise.resolve(window.katex);
  if (katexLoad) return katexLoad;

  const lazy = window.__SLOTIFY_LAZY__ || {};
  const jsSrc = lazy.katex;
  const cssHref = lazy.katexCss;

  if (!jsSrc) {
    return Promise.reject(new Error('[Slotify] KaTeX source not configured (data/vendor.json lazy entry).'));
  }

  // Ensure CSS is injected once into <head>
  if (cssHref && !document.querySelector(`link[href="${cssHref}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
  }

  katexLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = jsSrc;
    script.async = true;
    script.onload = () => resolve(window.katex);
    script.onerror = () => {
      katexLoad = null;
      reject(new Error('[Slotify] KaTeX failed to load.'));
    };
    document.head.appendChild(script);
  });

  return katexLoad;
}

/**
 * Strip LaTeX delimiter wrappers from string content.
 * @param {string} raw
 * @returns {string} clean LaTeX formula
 */
function extractFormula(raw) {
  const text = (raw || '').trim();
  if (
    (text.startsWith('\\(') && text.endsWith('\\)')) ||
    (text.startsWith('\\[') && text.endsWith('\\]')) ||
    (text.startsWith('$$') && text.endsWith('$$'))
  ) {
    return text.slice(2, -2).trim();
  }
  if (text.startsWith('$') && text.endsWith('$')) {
    return text.slice(1, -1).trim();
  }
  return text;
}

export function useKatex() {
  /**
   * Render math formulas in the given content container.
   * Targets .math elements emitted by Hugo's Goldmark passthrough or custom markup.
   * @param {HTMLElement|string} target - container element or container id
   */
  const renderMath = (target) => {
    if (typeof window.katex === 'undefined') return;

    const container = typeof target === 'string' ? document.getElementById(target) : target;
    if (!container) return;

    const nodes = container.querySelectorAll('.math:not([data-processed]), .katex-render:not([data-processed])');
    if (!nodes.length) return;

    nodes.forEach((el) => {
      const raw = el.dataset.math ?? el.textContent ?? '';
      const isDisplay =
        el.classList.contains('display') ||
        el.classList.contains('block') ||
        el.tagName === 'DIV' ||
        raw.trim().startsWith('$$') ||
        raw.trim().startsWith('\\[');

      const formula = extractFormula(raw);
      if (!formula) return;

      try {
        window.katex.render(formula, el, {
          displayMode: isDisplay,
          throwOnError: false,
          output: 'htmlAndMathml'
        });
        el.setAttribute('data-processed', 'true');
      } catch (err) {
        console.warn('[Slotify] KaTeX render failed:', (err && err.message) || err);
        el.setAttribute('data-processed', 'error');
        el.setAttribute('title', t('ui.mathError'));
      }
    });
  };

  return { renderMath };
}
