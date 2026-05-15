import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { T } from "../constants/theme";
import { useAuthStore } from "../stores/authStore";
import { useCaseStore } from "../stores/caseStore";
import { useUIStore } from "../stores/uiStore";
import SidebarCases from "../components/SidebarCases";
import TopNav from "../components/TopNav";
import BottomNav from "../components/BottomNav";
import { downloadCasePdf } from "../services/api";
import { showToast } from "../core/toastStore";
import { confirmAction } from "../core/confirm";

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, loadUser, logout } = useAuthStore();
  const {
    cases, caso, activeCaseId, page, pages, total,
    loadCase, removeCase, applyFilters, changePage, reset, refreshCases,
  } = useCaseStore();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUIStore();

  useEffect(() => {
    if (!user) loadUser();
  }, []);

  useEffect(() => {
    refreshCases({});
  }, []);

  const handleLogout = async () => {
    await logout();
    reset();
    navigate("/login");
  };

  const handleLoadCase = async (caseId) => {
    try {
      await loadCase(caseId);
      navigate("/library");
    } catch (err) {
      showToast(err.message || "Erro ao carregar caso.", "error");
    }
  };

  const handleDeleteCase = async (caseId) => {
    const ok = confirmAction("Tem certeza que deseja deletar este caso? Esta ação não pode ser desfeita.");
    if (!ok) return;
    try {
      await removeCase(caseId);
      showToast("Caso deletado com sucesso.");
    } catch (err) {
      showToast(err.message || "Erro ao deletar caso.", "error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "flex",
      }}
    >
      <style>{`
        .ortho-bottomnav { display: none; }
        @media (max-width: 768px) {
          .ortho-sidebar   { display: none !important; }
          .ortho-main      { padding: 16px 12px 80px !important; }
          .ortho-topnav    { display: none !important; }
          .ortho-user-bar  { display: none !important; }
          .ortho-bottomnav { display: flex !important; }
        }
      `}</style>

      <SidebarCases
        className="ortho-sidebar"
        cases={cases}
        activeCaseId={activeCaseId}
        onLoadCase={handleLoadCase}
        onDeleteCase={handleDeleteCase}
        onExportPdf={async (caseId) => {
          try { await downloadCasePdf(caseId); }
          catch (err) { showToast(err.message || "Erro ao baixar PDF", "error"); }
        }}
        page={page}
        pages={pages}
        total={total}
        onPageChange={changePage}
        onFilterChange={applyFilters}
      />

      {mobileDrawerOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.55)" }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, left: 0, bottom: 0,
              width: "88vw", maxWidth: 340,
              background: T.s1, display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0,
            }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>Casos Salvos</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}
              >×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <SidebarCases
                cases={cases}
                activeCaseId={activeCaseId}
                onLoadCase={(id) => { handleLoadCase(id); setMobileDrawerOpen(false); }}
                onDeleteCase={handleDeleteCase}
                onExportPdf={async (caseId) => {
                  try { await downloadCasePdf(caseId); }
                  catch (err) { showToast(err.message || "Erro ao baixar PDF", "error"); }
                }}
                page={page}
                pages={pages}
                total={total}
                onPageChange={changePage}
                onFilterChange={applyFilters}
              />
              {!cases.length && (
                <div style={{ padding: 24, color: T.muted, fontSize: 13, textAlign: "center" }}>
                  Nenhum caso salvo ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main
        className="ortho-main"
        style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "36px 24px 80px" }}
      >
        <div className="ortho-user-bar" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "7px 12px", borderRadius: 9, background: T.s2,
                border: `1px solid ${T.border}`, color: T.muted,
                cursor: "pointer", fontSize: 11, fontWeight: 800,
              }}
            >Sair</button>
          </div>
        </div>

        <div className="ortho-topnav">
          <TopNav user={user} />
        </div>

        <Outlet />
      </main>

      <BottomNav
        onCasesOpen={() => setMobileDrawerOpen(true)}
        user={user}
      />
    </div>
  );
}
