import { useCallback, useEffect, useState } from "react";
import { getMe, getToken, logoutUser } from "../services/api";

export default function useAuth({ onLogout } = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const loadCurrentUser = useCallback(async () => {
    if (!getToken()) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      return null;
    }

    try {
      setAuthLoading(true);
      const user = await getMe();
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch {
      logoutUser();
      setIsAuthenticated(false);
      setCurrentUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    setIsAuthenticated(true);
    await loadCurrentUser();
  }, [loadCurrentUser]);

  const logout = useCallback(() => {
    logoutUser();
    setIsAuthenticated(false);
    setCurrentUser(null);
    onLogout?.();
  }, [onLogout]);

  useEffect(() => {
    if (getToken()) {
      loadCurrentUser();
    }
  }, [loadCurrentUser]);

  useEffect(() => {
    const handler = () => {
      logout();
    };

    window.addEventListener("orthostudy:unauthorized", handler);

    return () => {
      window.removeEventListener("orthostudy:unauthorized", handler);
    };
  }, [logout]);

  return {
    isAuthenticated,
    currentUser,
    authLoading,
    loadCurrentUser,
    handleAuthSuccess,
    logout,
  };
}
