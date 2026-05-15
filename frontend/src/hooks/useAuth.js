import { useAuthStore } from "../stores/authStore";

export default function useAuth() {
  const store = useAuthStore();
  return {
    isAuthenticated: store.isAuthenticated,
    currentUser: store.user,
    authLoading: false,
    loadCurrentUser: store.loadUser,
    handleAuthSuccess: store.loadUser,
    logout: store.logout,
  };
}
