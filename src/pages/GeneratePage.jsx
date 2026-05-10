import { useState } from "react";
import { generateCase } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

const EXEMPLOS = [
  "Fratura do olécrano 21-B1 em adulto jovem atleta",
  "Fratura do colo do fêmur em idosa osteoporótica",
  "Fratura do platô tibial lateral — Schatzker II",
  "Ruptura do manguito rotador em atleta",
  "Fratura de Colles em idosa com osteoporose",
  "Luxação do ombro anterior — Bankart",
  "Fratura subtrocantérica em adulto jovem — trauma de alta energia",
];

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

      <div className="card">
        <div className="risk-label" style={{ marginBottom: 8 }}>Tema do caso</div>
        <textarea
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: Fratura do olécrano em adulto jovem atleta"
          rows={3}
          style={{
            width: "100%", background: "transparent", border: "none",
            color: "var(--text)", fontSize: 14, outline: "none",
            resize: "none", lineHeight: 1.6,
          }}
        />
      </div>

      <div className="card">
        <div className="risk-label" style={{ marginBottom: 8 }}>Nível de dificuldade</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { val: "",             label: "Qualquer" },
            { val: "basico",       label: "Básico" },
            { val: "intermediario",label: "Intermediário" },
            { val: "avancado",     label: "Avançado" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setNivel(val)}
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                border: "1px solid var(--border)", cursor: "pointer",
                background: nivel === val ? "var(--primary)" : "transparent",
                color: nivel === val ? "#fff" : "var(--muted)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="risk-label" style={{ marginBottom: 8 }}>Exemplos rápidos</div>
        {EXEMPLOS.map((e) => (
          <div
            key={e}
            className="list-item"
            style={{ cursor: "pointer", fontSize: 13, padding: "8px 0" }}
            onClick={() => setTema(e)}
          >
            {e}
          </div>
        ))}
      </div>

      {error && (
        <div className="emergency-banner" style={{ marginBottom: 12 }}>{error}</div>
      )}

      {loading && (
        <LoadingSpinner message="Gerando caso com IA... (pode levar 20-30s)" />
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
