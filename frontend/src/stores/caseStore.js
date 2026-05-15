import { create } from "zustand";
import { listCases, getCase, deleteCase } from "../services/api";

export const useCaseStore = create((set, get) => ({
  cases: [],
  caso: null,
  activeCaseId: null,
  filters: {},
  page: 1,
  pages: 1,
  total: 0,

  setCaso: (caso) => set({ caso }),
  setActiveCaseId: (id) => set({ activeCaseId: id }),

  refreshCases: async (filters) => {
    const f = filters ?? get().filters;
    const data = await listCases({ ...f, page: f?.page || 1, page_size: 20 });
    set({
      cases: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    });
  },

  loadCase: async (caseId) => {
    const data = await getCase(caseId);
    set({ caso: data, activeCaseId: caseId });
    return data;
  },

  removeCase: async (caseId) => {
    await deleteCase(caseId);
    const { activeCaseId, filters } = get();
    if (activeCaseId === caseId) {
      set({ caso: null, activeCaseId: null });
    }
    await get().refreshCases(filters);
  },

  applyFilters: async (filters) => {
    set({ filters });
    const data = await listCases({ ...filters, page: 1, page_size: 20 });
    set({
      cases: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    });
  },

  changePage: async (page) => {
    const { filters } = get();
    const data = await listCases({ ...filters, page, page_size: 20 });
    set({
      cases: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    });
  },

  resetCaseSelection: () => set({ caso: null, activeCaseId: null }),

  reset: () =>
    set({ cases: [], caso: null, activeCaseId: null, filters: {}, page: 1, pages: 1, total: 0 }),
}));
