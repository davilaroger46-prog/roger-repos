import { useState, useEffect, useRef } from "react";
import GeneratePage from "./pages/GeneratePage";
import LibraryPage from "./pages/LibraryPage";
import DashboardPage from "./pages/DashboardPage";
import ReviewPage from "./pages/ReviewPage";
import { T } from "./constants/theme";
import SidebarCases from "./components/SidebarCases";
import TopNav from "./components/TopNav";
import AuthScreen from "./components/AuthScreen";
import ToastContainer from "./components/Toast";
import { showToast } from "./core/toastStore";
import { confirmAction } from "./core/confirm";
import { getByPath, setByPath } from "./utils/objectPath";
import {
  generateCase,
  listCases,
  getCase,
  deleteCase,
  updateCase,
  autocorrectCase,
  restoreCaseVersion,
  downloadCasePdf,
  submitCaseReview,
  getToken,
  logoutUser,
  getMe,
} from "./services/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedCase, setSelectedCase] = useState(null);
  const [flashcardCase, setFlashcardCase] = useState(null);
  const [savedCases, setSavedCases] = useState([]);
  const [caso, setCaso] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [tema, setTema] = useState("");
  const [nivel, setNivel] = useState("");
  const [regiao, setRegiao] = useState("");
  const textareaRef = useRef(null);
  const [pct, setPct] = useState(0);
  const [editing, setEditing] = useState(false);
  const [versionPreview, setVersionPreview] = useState(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [caseFilters, setCaseFilters] = useState({});
  const [casePage, setCasePage] = useState(1);
  const [casePages, setCasePages] = useState(1);
  const [caseTotal, setCaseTotal] = useState(0);

  const loadCurrentUser = async () => {
    try {
      const me = await getMe();
      setCurrentUser(me);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshCases = async (filters = caseFilters) => {
    try {
      const data = await listCases(filters);
      setSavedCases(data.items);
      setCaseTotal(data.total);
      setCasePages(data.pages);
    } catch (err) {
      setError("Erro ao carregar casos.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentUser();
    }
  }, []);

  useEffect(() => {
    refreshCases({});
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(false);
      setCaso(null);
      setSavedCases([]);
      showToast("Sessão expirada. Faça login novamente.", "error");
    };

    window.addEventListener("orthostudy:unauthorized", handler);

    return () => {
      window.removeEventListener("orthostudy:unauthorized", handler);
    };
  }, []);

  const handleNewCase = () => {
    setCaso(null);
    setTema("");
    setNivel("");
    setRegiao("");
    setError(null);
    setPct(0);
    setStage("");
    setActiveCaseId(null);
  };

  const handleLoadCase = async (caseId) => {
    try {
      const data = await getCase(caseId);
      setCaso(data);
      setActiveCaseId(caseId);
    } catch (err) {
      setError("Erro ao carregar caso.");
    }
  };

  const handleDeleteCase = async (caseId) => {
    const ok = confirmAction(
      "Tem certeza que deseja deletar este caso? Esta ação não pode ser desfeita."
    );

    if (!ok) return;

    try {
      await deleteCase(caseId);
      await refreshCases(caseFilters);

      if (activeCaseId === caseId) {
        setCaso(null);
        setActiveCaseId(null);
      }

      showToast("Caso deletado com sucesso.");
    } catch (err) {
      showToast(err.message || "Erro ao deletar caso.", "error");
    }
  };

  const handleStartEdit = () => setEditing(true);
  const handleCancelEdit = () => setEditing(false);

  const handleSaveEdit = async (draft) => {
    if (!activeCaseId) {
      showToast("Este caso ainda não possui ID no banco.", "error");
      return;
    }
    const updated = await updateCase(activeCaseId, draft);
    setCaso(updated);
    setEditing(false);
    await refreshCases();
    showToast("Caso salvo com sucesso.");
  };

  const handleAutoCorrect = async (draft) => {
    const corrected = await autocorrectCase(draft);
    showToast("Autocorreção aplicada.");
    return corrected;
  };

  const handleExportPdf = async () => {
    if (!activeCaseId) {
      showToast("Este caso ainda não possui ID no banco.", "error");
      return;
    }
    await downloadCasePdf(activeCaseId);
  };

  const handleSubmitReview = async () => {
    if (!activeCaseId) {
      showToast("Este caso ainda não possui ID no banco.", "error");
      return;
    }
    await submitCaseReview(activeCaseId);
    showToast("Caso enviado para revisão.");
    const list = await listCases(caseFilters);
    setSavedCases(list.items || list);
    const updated = await getCase(activeCaseId);
    setCaso(updated);
  };

  const handleReviewed = async () => {
    showToast("Revisão registrada.");
    setReviewRefreshKey((k) => k + 1);
    const updated = await getCase(activeCaseId);
    setCaso(updated);
    const list = await listCases(caseFilters);
    setSavedCases(list.items || list);
  };

  const handleRestoreField = async (path) => {
    const merged = setByPath(caso, path, getByPath(versionPreview, path));
    const updated = await updateCase(activeCaseId, merged);
    setCaso(updated);
    await refreshCases();
  };

  const handleRestoreBlock = async (path) => {
    const merged = setByPath(caso, path, getByPath(versionPreview, path));
    const updated = await updateCase(activeCaseId, merged);
    setCaso(updated);
    await refreshCases();
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen onAuth={async () => {
        setIsAuthenticated(true);
        await loadCurrentUser();
        await refreshCases({});
      }} />
    );
  }

  if (flashcardCase) {
    return (
      <div className="mobile-app">
        <FlashcardPage
          caso={flashcardCase}
          onBack={() => setFlashcardCase(null)}
        />
      </div>
    );
  }

  if (selectedCase) {
    return (
      <div className="mobile-app">
        <CaseDetailPage
          caso={selectedCase}
          onBack={() => setSelectedCase(null)}
          onFlashcards={(fullData) => setFlashcardCase(fullData)}
        />
      </div>
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
            setError(err.message || "Erro ao baixar PDF");
          }
        }}
        page={casePage}
        pages={casePages}
        total={caseTotal}
        onPageChange={(page) => {
          setCasePage(page);
          refreshCases({ ...caseFilters, page });
        }}
        onFilterChange={(filters) => {
          setCaseFilters(filters);
          setCasePage(1);
          refreshCases({ ...filters, page: 1 });
        }}
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
              onClick={() => {
                logoutUser();
                setIsAuthenticated(false);
                setCaso(null);
                setSavedCases([]);
                setCurrentUser(null);
              }}
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
              setError(null);
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
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onAutoCorrect={handleAutoCorrect}
            onExportPdf={handleExportPdf}
            onSubmitReview={handleSubmitReview}
            onReviewed={handleReviewed}
            onRestoreField={handleRestoreField}
            onRestoreBlock={handleRestoreBlock}
          />
        )}
      </main>
    </div>
  );
}
