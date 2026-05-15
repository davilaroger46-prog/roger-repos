import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import AdminPanel from "../components/AdminPanel";

export default function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/generate", { replace: true });
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  return <AdminPanel currentUser={user} />;
}
