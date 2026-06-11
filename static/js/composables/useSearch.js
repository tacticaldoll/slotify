/**
 * useSearch.js
 * Composable for managing Fuse.js search logic and index loading.
 */
const { ref, watch } = Vue;
// `fuse` resolves via the import map in baseof.html (data/vendor.json -> the
// Fuse entry's `specifier`), so the vendored file is swappable without editing
// this import. The map is emitted before any module script loads.
import Fuse from 'fuse';
import { fetchSearchIndex } from '../services/api.js';
import { useApi } from './useApi.js';
import { usePageTitle } from './usePageTitle.js';
import { t } from '../i18n.js';

export function useSearch() {
  const searchQuery = ref('');
  const results = ref([]);
  // The Search page identity is a static chrome label. Bind it declaratively at
  // mount (a getter so it follows a UI-language switch) — independent of whether
  // the index loads, so a failed fetch never leaves the previous route's title.
  usePageTitle(() => t('menu.search'));
  let fuse = null;

  // 1. Initialize API Composable
  const { loading: loadingIndex, error, execute: fetchIndex } = useApi(fetchSearchIndex);

  const initFuse = (items) => {
    fuse = new Fuse(items, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'series', weight: 0.6 },
        { name: 'tags', weight: 0.5 },
        { name: 'summary', weight: 0.3 }
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true
    });
  };

  const loadSearchIndex = async () => {
    const { data, error } = await fetchIndex();
    if (!error && data) {
      initFuse(data);
    }
  };

  // Real-time fuzzy search
  watch(searchQuery, (newQuery) => {
    if (!fuse || !newQuery.trim()) {
      results.value = [];
      return;
    }
    results.value = fuse.search(newQuery.trim());
  });

  return {
    searchQuery,
    results,
    loadingIndex,
    error,
    loadSearchIndex
  };
}
