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

export function useKatex() {
  /**
   * Render math formulas in the given content container.
   * Targets .math elements emitted by Hugo's Goldmark passthrough markup hooks.
   * @param {HTMLElement|string} target - container element or container id
   */
  const renderMath = (target) => {
    if (typeof window.katex === 'undefined') return;

    const container = typeof target === 'string' ? document.getElementById(target) : target;
    if (!container) return;

    const nodes = container.querySelectorAll('.math:not([data-processed])');
    if (!nodes.length) return;

    nodes.forEach((el) => {
      const formula = (el.dataset.math ?? el.textContent ?? '').trim();
      if (!formula) return;

      const isDisplay =
        el.classList.contains('display') ||
        el.classList.contains('block') ||
        el.tagName === 'DIV';

      try {
        window.katex.render(formula, el, {
          displayMode: isDisplay,
          throwOnError: true,
          output: 'htmlAndMathml'
        });
        el.setAttribute('data-processed', 'true');
      } catch (err) {
        console.warn('[Slotify] KaTeX render failed:', (err && err.message) || err);
        el.setAttribute('data-processed', 'error');
        el.setAttribute('title', t('ui.mathError'));
        el.textContent = formula;
      }
    });
  };

  return { renderMath };
}
