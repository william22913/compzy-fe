import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCatalogue } from '../core/services/catalogueService';

const CatalogueContext = createContext(null);

export function CatalogueProvider({ children }) {
  // status: loading | ready | error
  const [state, setState] = useState({ status: 'loading', categories: [], error: null });

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, status: 'loading', error: null }));
    try {
      const categories = await fetchCatalogue();
      setState({ status: 'ready', categories, error: null });
    } catch (error) {
      setState({ status: 'error', categories: [], error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ status: state.status, categories: state.categories, error: state.error, reload: load }),
    [state, load],
  );

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue() {
  const context = useContext(CatalogueContext);
  if (!context) throw new Error('useCatalogue must be used inside CatalogueProvider');
  return context;
}
