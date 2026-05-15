import { create } from "zustand";

export const useUIStore = create((set) => ({
  mobileDrawerOpen: false,
  setMobileDrawerOpen: (v) =>
    set((s) => ({ mobileDrawerOpen: typeof v === "function" ? v(s.mobileDrawerOpen) : v })),

  tema: "",
  nivel: "",
  regiao: "",
  generating: false,
  stage: "",
  pct: 0,

  setTema: (tema) => set({ tema }),
  setNivel: (nivel) => set({ nivel }),
  setRegiao: (regiao) => set({ regiao }),
  setGenerating: (generating) => set({ generating }),
  setStage: (stage) => set({ stage }),
  setPct: (pct) => set({ pct }),
  resetGenerator: () => set({ tema: "", nivel: "", regiao: "", pct: 0, stage: "" }),
}));
