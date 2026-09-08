/**
 * lazyLoader.js
 * Centralized dynamic asset loader for lazy vendor libraries.
 * Injects scripts (and optional stylesheets) on-demand with singleton memoization.
 */

const loaders = new Map();

export function loadLazyLibrary({ globalKey, lazyKey, label, cssKey }) {
  if (window[globalKey]) {
    return Promise.resolve(window[globalKey]);
  }
  if (loaders.has(globalKey)) {
    return loaders.get(globalKey);
  }

  const lazy = window.__SLOTIFY_LAZY__ || {};
  const src = lazy[lazyKey];
  if (!src) {
    return Promise.reject(new Error(`[Slotify] ${label} source not configured (data/vendor.json lazy entry).`));
  }

  // Inject stylesheet if declared and not already present
  if (cssKey && lazy[cssKey] && !document.querySelector(`link[href="${lazy[cssKey]}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = lazy[cssKey];
    document.head.appendChild(link);
  }

  const loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(window[globalKey]);
    script.onerror = () => {
      loaders.delete(globalKey);
      reject(new Error(`[Slotify] ${label} failed to load.`));
    };
    document.head.appendChild(script);
  });

  loaders.set(globalKey, loadPromise);
  return loadPromise;
}
