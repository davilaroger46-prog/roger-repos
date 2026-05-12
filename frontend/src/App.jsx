import { useState, useEffect, useRef } from "react";
import GeneratePage from "./pages/GeneratePage";
import { T } from "./constants/theme";
import SidebarCases from "./components/SidebarCases";
import CasePreview from "./components/CasePreview";
import CaseActions from "./components/CaseActions";
import CaseVisualEditor from "./components/CaseVisualEditor";
import CaseVersionsPanel from "./components/CaseVersionsPanel";
import CaseVersionDiff from "./components/CaseVersionDiff";
import ReviewPanel from "./components/ReviewPanel";
import TopNav from "./components/TopNav";
import ReviewQueue from "./components/ReviewQueue";
import CasesDashboard from "./components/CasesDashboard";
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

  const handleSave = async () => {
    try {
      await refreshCases();
    } catch (err) {
      setError("Erro ao atualizar lista de casos.");
    }
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
          <ProgressPage />
        )}

        {activeTab === "review" && (
          <>
            <ReviewQueue
              onOpenCase={(id, fullCase) => {
                setActiveCaseId(id);
                setCaso(fullCase);
              }}
            />

            {caso && (
              <div style={{ marginTop: 16 }}>
                <ReviewPanel
                  caseId={activeCaseId}
                  user={currentUser}
                  onReviewed={async () => {
                    showToast("Revisão registrada.");
                    const updated = await getCase(activeCaseId);
                    setCaso(updated);
                    await refreshCases(caseFilters);
                  }}
                />
                <CasePreview caso={caso} />
              </div>
            )}
          </>
        )}

        {activeTab === "library" && (
          <>
            {caso ? (
              <>
                <CaseActions
                  caso={caso}
                  onNewCase={handleNewCase}
                  onEdit={handleStartEdit}
                  onExportPdf={async () => {
                    if (!activeCaseId) {
                      setError("Este caso ainda não possui ID no banco.");
                      return;
                    }
                    try {
                      await downloadCasePdf(activeCaseId);
                    } catch (err) {
                      setError(err.message || "Erro ao exportar PDF.");
                    }
                  }}
                  onSubmitReview={async () => {
                    try {
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
                    } catch (err) {
                      showToast(err.message || "Erro ao enviar para revisão.", "error");
                    }
                  }}
                />

                <ReviewPanel
                  caseId={activeCaseId}
                  user={currentUser}
                  onReviewed={async () => {
                    showToast("Revisão registrada.");
                    const updated = await getCase(activeCaseId);
                    setCaso(updated);
                    const list = await listCases(caseFilters);
                    setSavedCases(list.items || list);
                  }}
                />

                {editing ? (
                  <CaseVisualEditor
                    caso={caso}
                    onCancel={handleCancelEdit}
                    onSave={async (draft) => {
                      try {
                        if (!activeCaseId) {
                          setError("Este caso ainda não possui ID no banco.");
                          return;
                        }
                        const updated = await updateCase(activeCaseId, draft);
                        setCaso(updated);
                        setEditing(false);
                        await refreshCases();
                        showToast("Caso salvo com sucesso.");
                      } catch (err) {
                        showToast(err.message || "Erro ao salvar edição.", "error");
                      }
                    }}
                    onAutoCorrect={async (draft) => {
                      try {
                        setError(null);
                        const corrected = await autocorrectCase(draft);
                        showToast("Autocorreção aplicada.");
                        return corrected;
                      } catch (err) {
                        showToast(err.message || "Erro ao autocorrigir caso.", "error");
                        return draft;
                      }
                    }}
                  />
                ) : (
                  <>
                    <CasePreview caso={versionPreview || caso} />
                    {versionPreview && (
                      <CaseVersionDiff
                        currentCase={caso}
                        oldCase={versionPreview}
                        onRestoreField={async (path) => {
                          try {
                            const oldValue = getByPath(versionPreview, path);
                            const merged = setByPath(caso, path, oldValue);
                            const updated = await updateCase(activeCaseId, merged);
                            setCaso(updated);
                            await refreshCases();
                          } catch (err) {
                            setError(err.message || "Erro ao restaurar campo.");
                          }
                        }}
                        onRestoreBlock={async (path) => {
                          try {
                            const oldValue = getByPath(versionPreview, path);
                            const merged = setByPath(caso, path, oldValue);
                            const updated = await updateCase(activeCaseId, merged);
                            setCaso(updated);
                            await refreshCases();
                          } catch (err) {
                            setError(err.message || "Erro ao restaurar bloco.");
                          }
                        }}
                      />
                    )}
                    {activeCaseId && (
                      <div style={{ marginTop: 24 }}>
                        {versionPreview && (
                          <div
                            style={{
                              background: "rgba(139,92,246,.07)",
                              border: "1px solid rgba(139,92,246,.25)",
                              borderRadius: 14,
                              padding: 14,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: T.purple,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: ".1em",
                                marginBottom: 8,
                              }}
                            >
                              Visualizando versão antiga
                            </div>
                            <button
                              onClick={() => setVersionPreview(null)}
                              style={{
                                padding: "7px 12px",
                                borderRadius: 8,
                                cursor: "pointer",
                                background: T.s2,
                                border: `1px solid ${T.border}`,
                                color: T.muted,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              Voltar para versão atual
                            </button>
                          </div>
                        )}
                        <CaseVersionsPanel
                          caseId={activeCaseId}
                          onOpenVersion={(oldCase) => setVersionPreview(oldCase)}
                          onRestoreVersion={async (restoredCase) => {
                            setCaso(restoredCase);
                            setVersionPreview(null);
                            await refreshCases();
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div style={{ color: T.muted, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
                Selecione um caso na sidebar para visualizar.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
