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
 * Matches terms against raw text (longest first) and wraps matches in
 * `<mark class="search-highlight">...</mark>`, escaping all segments to
 * ensure XSS safety without corrupting HTML entities.
 *
 * @param {string} text - Raw input text
 * @param {string} query - Search term to highlight
 * @returns {string} Safe HTML string with matches wrapped in mark tags
 */
export function highlightText(text, query) {
  if (!text || typeof text !== 'string') return '';
  if (!query || typeof query !== 'string' || !query.trim()) {
    return escapeHtml(text);
  }

  const rawTerms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Deduplicate and sort by descending length so longer terms match before substrings
  const uniqueTerms = Array.from(new Set(rawTerms))
    .sort((a, b) => b.length - a.length);

  if (uniqueTerms.length === 0) return escapeHtml(text);

  const pattern = uniqueTerms.map(escapeRegex).join('|');
  const regex = new RegExp(pattern, 'gi');

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      result += escapeHtml(text.slice(lastIndex, matchIndex));
    }

    result += `<mark class="search-highlight">${escapeHtml(matchedText)}</mark>`;
    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < text.length) {
    result += escapeHtml(text.slice(lastIndex));
  }

  return result;
}
