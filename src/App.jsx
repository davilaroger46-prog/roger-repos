import { useState, useEffect } from "react";
import CaseListPage from "./pages/CaseListPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import FlashcardPage from "./pages/FlashcardPage";
import ProgressPage from "./pages/ProgressPage";
import GeneratePage from "./pages/GeneratePage";
import DecisionPage from "./pages/DecisionPage";
import { TABS } from "./constants/prompt";
import { T } from "./constants/theme";
import SidebarCases from "./components/SidebarCases";
import CasePreview from "./components/CasePreview";
import CaseActions from "./components/CaseActions";
import CaseVisualEditor from "./components/CaseVisualEditor";
import CaseVersionsPanel from "./components/CaseVersionsPanel";
import {
  generateCase,
  listCases,
  getCase,
  deleteCase,
  updateCase,
  autocorrectCase,
  restoreCaseVersion,
} from "./services/api";

export default function App() {
  const [tab, setTab] = useState("cases");
  const [selectedCase, setSelectedCase] = useState(null);
  const [flashcardCase, setFlashcardCase] = useState(null);
  const [savedCases, setSavedCases] = useState([]);
  const [caso, setCaso] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [tema, setTema] = useState("");
  const [regiao, setRegiao] = useState("");
  const [pct, setPct] = useState(0);
  const [editing, setEditing] = useState(false);
  const [versionPreview, setVersionPreview] = useState(null);

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await listCases();
        setSavedCases(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadCases();
  }, []);

  const stopPct = () => setGenerating(false);

  const handleNewCase = () => {
    setCaso(null);
    setTema("");
    setRegiao("");
    setError(null);
    setPct(0);
    setStage("");
    setActiveCaseId(null);
  };

  const handleGenerate = async ({ tema, nivel, regiao }) => {
    setGenerating(true);
    setStage("Gerando caso com IA...");
    setError(null);
    try {
      const data = await generateCase({ tema, nivel, regiao });

      stopPct();
      setStage("Caso gerado com sucesso.");
      setCaso(data);

      const updated = await listCases();
      setSavedCases(updated);
    } catch (err) {
      stopPct();
      setStage("");
      setError(err.message || "Erro ao gerar caso.");
    }
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
    try {
      await deleteCase(caseId);

      const updated = await listCases();
      setSavedCases(updated);

      if (activeCaseId === caseId) {
        setCaso(null);
        setActiveCaseId(null);
      }
    } catch (err) {
      setError("Erro ao deletar caso.");
    }
  };

  const handleCancelEdit = () => setEditing(false);

  const handleSave = async () => {
    try {
      const data = await listCases();
      setSavedCases(data);
    } catch (err) {
      setError("Erro ao atualizar lista de casos.");
    }
  };

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
      <SidebarCases
        cases={savedCases}
        activeCaseId={activeCaseId}
        onLoadCase={handleLoadCase}
        onDeleteCase={handleDeleteCase}
      />

      <main style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "36px 24px 80px" }}>
        {tab === "cases" && (
          <CaseListPage onSelect={setSelectedCase} />
        )}
        {tab === "decision" && (
          <DecisionPage />
        )}
        {tab === "generate" && (
          <GeneratePage onGenerated={setSelectedCase} />
        )}
        {tab === "progress" && (
          <ProgressPage />
        )}

        {caso && (
          <div style={{ marginTop: 20 }}>
            <CaseActions
              caso={caso}
              onNewCase={handleNewCase}
              onEdit={() => setEditing(true)}
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

                    const list = await listCases();
                    setSavedCases(list);
                  } catch (err) {
                    setError(err.message || "Erro ao salvar edição.");
                  }
                }}
                onAutoCorrect={async (draft) => {
                  try {
                    setError(null);
                    const corrected = await autocorrectCase(draft);
                    return corrected;
                  } catch (err) {
                    setError(err.message || "Erro ao autocorrigir caso.");
                    return draft;
                  }
                }}
              />
            ) : (
              <>
                <CasePreview caso={versionPreview || caso} />
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
                      onRestoreVersion={(restored) => {
                        setCaso(restored);
                        setVersionPreview(null);
                        listCases().then(setSavedCases).catch(console.error);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
