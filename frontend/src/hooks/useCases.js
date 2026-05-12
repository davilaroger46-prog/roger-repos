import { useCallback, useState } from "react";
import {
  listCases,
  getCase,
  deleteCase,
} from "../services/api";

export default function useCases() {
  const [cases, setCases] = useState([]);
  const [caseFilters, setCaseFilters] = useState({});
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [caso, setCaso] = useState(null);

  const [casePage, setCasePage] = useState(1);
  const [casePages, setCasePages] = useState(1);
  const [caseTotal, setCaseTotal] = useState(0);

  const refreshCases = useCallback(async (filters = caseFilters) => {
    const data = await listCases({
      ...filters,
      page: filters.page || 1,
      page_size: 20,
    });

    setCases(data.items || []);
    setCaseTotal(data.total || 0);
    setCasePage(data.page || 1);
    setCasePages(data.pages || 1);
  }, [caseFilters]);

  const loadCase = useCallback(async (caseId) => {
    const data = await getCase(caseId);

    setCaso(data);
    setActiveCaseId(caseId);

    return data;
  }, []);

  const removeCase = useCallback(async (caseId) => {
    await deleteCase(caseId);

    if (activeCaseId === caseId) {
      setCaso(null);
      setActiveCaseId(null);
    }

    await refreshCases(caseFilters);
  }, [activeCaseId, caseFilters, refreshCases]);

  const applyFilters = useCallback(async (filters) => {
    setCaseFilters(filters);
    await refreshCases({ ...filters, page: 1 });
  }, [refreshCases]);

  const changePage = useCallback(async (page) => {
    setCasePage(page);
    await refreshCases({ ...caseFilters, page });
  }, [caseFilters, refreshCases]);

  const resetCaseSelection = () => {
    setCaso(null);
    setActiveCaseId(null);
  };

  return {
    cases,
    setCases,

    caso,
    setCaso,

    activeCaseId,
    setActiveCaseId,

    caseFilters,
    setCaseFilters,

    casePage,
    casePages,
    caseTotal,

    refreshCases,
    loadCase,
    removeCase,
    applyFilters,
    changePage,
    resetCaseSelection,
  };
}
