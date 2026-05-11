import { useState } from "react";
import { generateCase } from "../services/api";
import GeneratorForm from "../components/GeneratorForm";
import LoadingProgress from "../components/LoadingProgress";

export default function GeneratePage({ onGenerated }) {
  const [tema, setTema]       = useState("");
  const [nivel, setNivel]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function handleGenerate() {
    if (!tema.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateCase({ tema, nivel: nivel || undefined });
      onGenerated(data.caso);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="decision-label" style={{ marginBottom: 12 }}>Gerar Caso com IA</div>

      <GeneratorForm
        tema={tema}
        onTemaChange={setTema}
        nivel={nivel}
        onNivelChange={setNivel}
      />

      {error && (
        <div className="emergency-banner" style={{ marginBottom: 12 }}>{error}</div>
      )}

      {loading && (
        <LoadingProgress message="Gerando caso com IA... (pode levar 20-30s)" estimated={25} />
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !tema.trim()}
        style={{
          width: "100%", padding: 14, borderRadius: 14, border: "none",
          background: loading || !tema.trim() ? "var(--panel-soft)" : "var(--primary)",
          color: loading || !tema.trim() ? "var(--muted)" : "#fff",
          fontWeight: 800, fontSize: 15, cursor: loading ? "wait" : "pointer",
          marginTop: 8,
        }}
      >
        {loading ? "Gerando..." : "✨ Gerar Caso"}
      </button>
    </>
  );
}
