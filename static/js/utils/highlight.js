/**
 * highlight.js
 * Pure helpers for safe search keyword highlighting in text.
 * Strictly pure functions with no DOM mutations or side effects (SKILL.md §3).
 */

/**
 * Escapes raw HTML special characters to prevent XSS.
 * @param {string} text - Raw unescaped string
 * @returns {string} HTML-escaped string
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(new RegExp('"', 'g'), '&quot;')
    .replace(new RegExp("'", 'g'), '&#039;');
}

/**
 * Escapes special characters for use in a regular expression.
 * @param {string} text - Raw string
 * @returns {string} Regex-escaped string
 */
export function escapeRegex(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights occurrences of query within text.
 * Safely escapes input text first, then wraps matching query terms
 * in `<mark class="search-highlight">...</mark>`.
 *
 * @param {string} text - Raw input text
 * @param {string} query - Search term to highlight
 * @returns {string} Safe HTML string with matches wrapped in mark tags
 */
export function highlightText(text, query) {
  if (!text || typeof text !== 'string') return '';
  const escapedText = escapeHtml(text);
  if (!query || typeof query !== 'string' || !query.trim()) {
    return escapedText;
  }

  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeHtml)
    .map(escapeRegex);

  if (terms.length === 0) return escapedText;

  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
}
