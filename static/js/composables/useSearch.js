/**
 * useSearch.js
 * Composable for managing Fuse.js search logic and index loading.
 */
const { ref, watch } = Vue;
const { useRouter, useRoute } = VueRouter;
// `fuse` resolves via the import map in baseof.html (data/vendor.json -> the
// Fuse entry's `specifier`), so the vendored file is swappable without editing
// this import. The map is emitted before any module script loads.
import Fuse from 'fuse';
import { fetchSearchIndex } from '../services/api.js';
import { useApi } from './useApi.js';
import { usePageTitle } from './usePageTitle.js';
import { t } from '../i18n.js';

/** Normalizes a route query parameter into a single string (handling repeated array params). */
const readQuery = (q) => {
  if (typeof q === 'string') return q;
  if (Array.isArray(q) && typeof q[0] === 'string') return q[0];
  return '';
};

export function useSearch() {
  const router = useRouter();
  const route = useRoute();
  const initialQuery = readQuery(route.query.q);
  const searchQuery = ref(initialQuery);
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

  const runSearch = (query) => {
    if (!fuse || !query || !query.trim()) {
      results.value = [];
      return;
    }
    results.value = fuse.search(query.trim());
  };

  const loadSearchIndex = async () => {
    const { data, error } = await fetchIndex();
    if (!error && data) {
      initFuse(data);
      runSearch(searchQuery.value);
    }
  };

  // Synchronize route query changes (e.g. back/forward navigation or link transitions)
  watch(() => route.query.q, (newQ) => {
    const q = readQuery(newQ);
    if (q !== searchQuery.value) {
      searchQuery.value = q;
    }
  });

  // Real-time fuzzy search and URL write-back
  watch(searchQuery, (newQuery) => {
    runSearch(newQuery);
    const q = newQuery.trim();
    if (q !== readQuery(route.query.q)) {
      router.replace({ query: q ? { q } : {} });
    }
  });

  return {
    searchQuery,
    results,
    loadingIndex,
    error,
    loadSearchIndex
  };
}
