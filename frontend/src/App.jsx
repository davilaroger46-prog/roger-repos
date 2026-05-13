import { useState, useRef, useEffect } from "react";
import GeneratePage from "./pages/GeneratePage";
import LibraryPage from "./pages/LibraryPage";
import DashboardPage from "./pages/DashboardPage";
import ReviewPage from "./pages/ReviewPage";
import { T } from "./constants/theme";
import SidebarCases from "./components/SidebarCases";
import TopNav from "./components/TopNav";
import AuthScreen from "./components/AuthScreen";
import ToastContainer from "./components/Toast";
import useAuth from "./hooks/useAuth";
import useCases from "./hooks/useCases";
import useCaseEditor from "./hooks/useCaseEditor";
import { showToast } from "./core/toastStore";
import { confirmAction } from "./core/confirm";
import {
  generateCase,
  getCase,
  downloadCasePdf,
  downloadCasePdfDraft,
  submitCaseReview,
} from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("generate");
  const [stage, setStage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [tema, setTema] = useState("");
  const [nivel, setNivel] = useState("");
  const [regiao, setRegiao] = useState("");
  const textareaRef = useRef(null);
  const [pct, setPct] = useState(0);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const {
    cases: savedCases,
    caso,
    setCaso,
    activeCaseId,
    setActiveCaseId,
    caseFilters,
    casePage,
    casePages,
    caseTotal,
    refreshCases,
    loadCase,
    removeCase,
    applyFilters,
    changePage,
    resetCaseSelection,
    reset: resetCases,
  } = useCases();

  const { isAuthenticated, currentUser, handleAuthSuccess, logout } = useAuth({ onLogout: resetCases });

  const {
    editing,
    setEditing,
    versionPreview,
    setVersionPreview,
    editorLoading,
    startEdit,
    cancelEdit,
    saveEdit,
    autoCorrect,
    restoreVersion,
    restoreField,
    restoreBlock,
  } = useCaseEditor({ caso, setCaso, activeCaseId, refreshCases, showToast });

  useEffect(() => {
    refreshCases({});
  }, []);

  const handleNewCase = () => {
    resetCaseSelection();
    setTema("");
    setNivel("");
    setRegiao("");
    setPct(0);
    setStage("");
  };

  const handleLoadCase = async (caseId) => {
    try {
      await loadCase(caseId);
      setActiveTab("library");
    } catch (err) {
      showToast(err.message || "Erro ao carregar caso.", "error");
    }
  };

  const handleDeleteCase = async (caseId) => {
    const ok = confirmAction(
      "Tem certeza que deseja deletar este caso? Esta ação não pode ser desfeita."
    );

    if (!ok) return;

    try {
      await removeCase(caseId);
      showToast("Caso deletado com sucesso.");
    } catch (err) {
      showToast(err.message || "Erro ao deletar caso.", "error");
    }
  };


  const handleExportPdf = async () => {
    if (!activeCaseId) {
      showToast("Este caso ainda não possui ID no banco.", "error");
      return;
    }
    await downloadCasePdf(activeCaseId);
  };

  const handleExportDraftPdf = async () => {
    if (!activeCaseId) {
      showToast("Este caso ainda não possui ID no banco.", "error");
      return;
    }
    await downloadCasePdfDraft(activeCaseId);
  };

  const handleSubmitReview = async () => {
    if (!activeCaseId) {
      showToast("Este caso ainda não possui ID no banco.", "error");
      return;
    }
    await submitCaseReview(activeCaseId);
    showToast("Caso enviado para revisão.");
    await refreshCases(caseFilters);
    const updated = await getCase(activeCaseId);
    setCaso(updated);
  };

  const handleReviewed = async () => {
    showToast("Revisão registrada.");
    setReviewRefreshKey((k) => k + 1);
    const updated = await getCase(activeCaseId);
    setCaso(updated);
    await refreshCases(caseFilters);
  };


  if (!isAuthenticated) {
    return (
      <AuthScreen onAuth={async () => {
        await handleAuthSuccess();
        await refreshCases({});
      }} />
    );
  }

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
      <ToastContainer />
      <SidebarCases
        cases={savedCases}
        activeCaseId={activeCaseId}
        onLoadCase={handleLoadCase}
        onDeleteCase={handleDeleteCase}
        onExportPdf={async (caseId) => {
          try {
            await downloadCasePdf(caseId);
          } catch (err) {
            showToast(err.message || "Erro ao baixar PDF", "error");
          }
        }}
        page={casePage}
        pages={casePages}
        total={caseTotal}
        onPageChange={changePage}
        onFilterChange={applyFilters}
      />

      <main style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "36px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: 10, color: T.muted }}>
                {currentUser?.email}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                padding: "7px 12px",
                borderRadius: 9,
                background: T.s2,
                border: `1px solid ${T.border}`,
                color: T.muted,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Sair
            </button>
          </div>
        </div>
        <TopNav activeTab={activeTab} onChange={setActiveTab} user={currentUser} />

        {activeTab === "generate" && (
          <GeneratePage
            tema={tema}
            setTema={setTema}
            nivel={nivel}
            setNivel={setNivel}
            regiao={regiao}
            setRegiao={setRegiao}
            loading={generating}
            stage={stage}
            pct={pct}
            textareaRef={textareaRef}
            onGenerate={async () => {
              if (!tema.trim()) return;
              setGenerating(true);
              setStage("Gerando caso com IA...");
              try {
                const data = await generateCase({ tema, nivel, regiao });
                setCaso(data);
                setActiveCaseId(data.id || null);
                await refreshCases();
                showToast("Caso gerado com sucesso.");
                setActiveTab("library");
              } catch (err) {
                showToast(err.message || "Erro ao gerar caso.", "error");
              } finally {
                setGenerating(false);
                setStage("");
              }
            }}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardPage cases={savedCases} />
        )}

        {activeTab === "review" && (
          <ReviewPage
            caso={caso}
            activeCaseId={activeCaseId}
            currentUser={currentUser}
            reviewRefreshKey={reviewRefreshKey}
            onOpenCase={(id, fullCase) => {
              setActiveCaseId(id);
              setCaso(fullCase);
            }}
            onReviewed={handleReviewed}
          />
        )}

        {activeTab === "library" && (
          <LibraryPage
            caso={caso}
            activeCaseId={activeCaseId}
            editing={editing}
            setEditing={setEditing}
            versionPreview={versionPreview}
            setVersionPreview={setVersionPreview}
            currentUser={currentUser}
            onNewCase={handleNewCase}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            onSaveEdit={saveEdit}
            onAutoCorrect={autoCorrect}
            onExportPdf={handleExportPdf}
            onExportDraftPdf={handleExportDraftPdf}
            onSubmitReview={handleSubmitReview}
            onReviewed={handleReviewed}
            onRestoreField={restoreField}
            onRestoreBlock={restoreBlock}
          />
        )}
      </main>
    </div>
  );
}
