import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthScreen from "../components/AuthScreen";
import { useAuthStore } from "../stores/authStore";
import { useCaseStore } from "../stores/caseStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loadUser, isAuthenticated } = useAuthStore();
  const { refreshCases } = useCaseStore();

  useEffect(() => {
    if (isAuthenticated) navigate("/generate", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <AuthScreen
      onAuth={async () => {
        await loadUser();
        await refreshCases({});
        navigate("/generate", { replace: true });
      }}
    />
  );
}
