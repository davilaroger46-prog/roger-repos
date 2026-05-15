import { useCaseStore } from "../stores/caseStore";

export default function useCases() {
  const store = useCaseStore();
  return {
    cases: store.cases,
    setCases: () => {},
    caso: store.caso,
    setCaso: store.setCaso,
    activeCaseId: store.activeCaseId,
    setActiveCaseId: store.setActiveCaseId,
    caseFilters: store.filters,
    setCaseFilters: () => {},
    casePage: store.page,
    casePages: store.pages,
    caseTotal: store.total,
    refreshCases: store.refreshCases,
    loadCase: store.loadCase,
    removeCase: store.removeCase,
    applyFilters: store.applyFilters,
    changePage: store.changePage,
    resetCaseSelection: store.resetCaseSelection,
    reset: store.reset,
  };
}
