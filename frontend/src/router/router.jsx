import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { useAuthStore } from "../stores/authStore";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/LoginPage";
import GeneratePage from "../pages/GeneratePage";
import LibraryPage from "../pages/LibraryPage";
import ReviewPage from "../pages/ReviewPage";
import DashboardPage from "../pages/DashboardPage";
import AdminPage from "../pages/AdminPage";
import SettingsPage from "../pages/SettingsPage";
import ToastContainer from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

function ErrorFallback() {
  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#0f1117", color: "#e2e8f0", fontFamily: "system-ui",
        gap: 12, padding: 24, textAlign: "center",
      }}
    >
      <div style={{ fontSize: 32 }}>⚠️</div>
      <h2 style={{ margin: 0, fontSize: 20 }}>Algo deu errado</h2>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        O erro foi registrado automaticamente. Tente recarregar a página.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "10px 20px", borderRadius: 10, border: "none",
          background: "#1d4ed8", color: "#fff", cursor: "pointer",
          fontWeight: 700, fontSize: 14, marginTop: 8,
        }}
      >
        Recarregar
      </button>
    </div>
  );
}

function RootLayout() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <ToastContainer />
      <ConfirmModal />
      <Outlet />
    </Sentry.ErrorBoundary>
  );
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      {
        path: "/",
        element: <ProtectedLayout />,
        children: [
          { index: true, element: <Navigate to="/generate" replace /> },
          { path: "generate", element: <GeneratePage /> },
          { path: "library", element: <LibraryPage /> },
          { path: "cases/:id", element: <LibraryPage /> },
          { path: "review", element: <ReviewPage /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "admin", element: <AdminPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <Navigate to="/generate" replace /> },
    ],
  },
]);
