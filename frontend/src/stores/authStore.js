import { create } from "zustand";
import { getMe, getToken, logoutUser } from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!getToken(),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  loadUser: async () => {
    if (!getToken()) {
      set({ user: null, isAuthenticated: false });
      return null;
    }
    try {
      const user = await getMe();
      set({ user, isAuthenticated: true });
      return user;
    } catch {
      await logoutUser();
      set({ user: null, isAuthenticated: false });
      return null;
    }
  },

  logout: async () => {
    await logoutUser();
    set({ user: null, isAuthenticated: false });
  },
}));
