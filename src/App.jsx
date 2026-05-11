import { useState, useEffect } from "react";
import CaseListPage from "./pages/CaseListPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import FlashcardPage from "./pages/FlashcardPage";
import ProgressPage from "./pages/ProgressPage";
import GeneratePage from "./pages/GeneratePage";
import DecisionPage from "./pages/DecisionPage";
import { TABS } from "./constants/prompt";
import SidebarCases from "./components/SidebarCases";
import {
  generateCase,
  listCases,
  getCase,
  deleteCase,
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
    <div className="mobile-app">
      <header className="mobile-header">
        <span style={{ fontWeight: 900, fontSize: 18 }}>OrthoStudy</span>
        <span className="status">● Online</span>
      </header>

      <main className="mobile-content">
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
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </nav>
    </div>
  );
}
