import { useState, useEffect } from "react";
import CaseListPage from "./pages/CaseListPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import FlashcardPage from "./pages/FlashcardPage";
import ProgressPage from "./pages/ProgressPage";
import GeneratePage from "./pages/GeneratePage";
import DecisionPage from "./pages/DecisionPage";
import { TABS } from "./constants/prompt";
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

  const handleLoadCase = async (caseId) => {
    try {
      const data = await getCase(caseId);
      setCaso(data);
    } catch (err) {
      setError("Erro ao carregar caso.");
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
