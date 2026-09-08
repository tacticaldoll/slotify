/**
 * renderError.js
 * Centralized utility to render an accessible, non-destructive fallback for failed content elements.
 * Generates an ARIA role="alert" notice with the localized error message and preserves the raw source.
 */
import { t } from '../i18n.js';

export function renderContentError(el, source, err, { messageKey, label = 'Content', isDisplay = false, classPrefix = 'content' } = {}) {
  el.removeAttribute('data-processed');
  el.setAttribute('data-processed', 'error');
  el.classList.add(`${classPrefix}--error`);
  el.textContent = '';

  const notice = document.createElement(isDisplay ? 'p' : 'span');
  notice.className = `${classPrefix}-error__title`;
  notice.setAttribute('role', 'alert');
  notice.textContent = t(messageKey);

  const code = document.createElement(isDisplay ? 'pre' : 'code');
  code.className = `${classPrefix}-error__source`;
  code.textContent = source;

  el.appendChild(notice);
  el.appendChild(code);

  console.warn(`[Slotify] ${label} render failed:`, (err && err.message) || err);
}
