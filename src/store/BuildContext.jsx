import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useCatalogue } from './CatalogueContext';
import { clearBuild, loadBuild, saveBuild } from '../helpers/buildStorage';

const BuildContext = createContext(null);

export function BuildProvider({ children }) {
  const { status: catalogueStatus, categories } = useCatalogue();
  const [selection, setSelection] = useState(loadBuild);
  // A part that vanished from the catalogue is dropped from the build; the
  // builder says so, naming the category, until a new part is chosen.
  const [removed, setRemoved] = useState(null);

  useEffect(() => {
    saveBuild(selection);
  }, [selection]);

  useEffect(() => {
    if (catalogueStatus !== 'ready') return;

    const kept = {};
    let vanished = null;
    let dropped = false;
    for (const [code, partId] of Object.entries(selection)) {
      const category = categories.find((item) => item.code === code);
      const part = category && category.parts.find((item) => item.id === partId);
      if (part) {
        kept[code] = partId;
      } else {
        dropped = true;
        if (category) vanished = category;
      }
    }

    if (dropped) {
      setSelection(kept);
      if (vanished) setRemoved({ categoryCode: vanished.code, categoryName: vanished.name });
    }
  }, [catalogueStatus, categories, selection]);

  const choose = useCallback((categoryCode, partId) => {
    setSelection((previous) => {
      if (previous[categoryCode] === partId) {
        const next = { ...previous };
        delete next[categoryCode];
        return next;
      }
      return { ...previous, [categoryCode]: partId };
    });
    setRemoved((previous) =>
      previous && previous.categoryCode === categoryCode ? null : previous,
    );
  }, []);

  const removePart = useCallback((categoryCode) => {
    setSelection((previous) => {
      const next = { ...previous };
      delete next[categoryCode];
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelection({});
    setRemoved(null);
    clearBuild();
  }, []);

  const rows = useMemo(
    () =>
      categories.map((category) => ({
        category,
        part: category.parts.find((part) => part.id === selection[category.code]) || null,
      })),
    [categories, selection],
  );

  const selectedRows = rows.filter((row) => row.part);
  const missing = rows.filter((row) => row.category.required && !row.part);
  const total = selectedRows.reduce((sum, row) => sum + row.part.priceRupiah, 0);

  const value = useMemo(
    () => ({
      rows,
      selectedRows,
      missing,
      total,
      selectedCount: selectedRows.length,
      complete: rows.length > 0 && missing.length === 0,
      partIds: selectedRows.map((row) => row.part.id),
      choose,
      removePart,
      clear,
      removed,
    }),
    [rows, selectedRows, missing, total, choose, removePart, clear, removed],
  );

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild() {
  const context = useContext(BuildContext);
  if (!context) throw new Error('useBuild must be used inside BuildProvider');
  return context;
}
