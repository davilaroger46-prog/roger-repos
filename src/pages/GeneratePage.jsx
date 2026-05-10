import { useState } from "react";
import axios from "axios";

const EXEMPLOS = [
  "Fratura do olécrano 21-B1 em adulto jovem atleta",
  "Fratura do colo do fêmur em idosa osteoporótica",
  "Fratura do platô tibial lateral — Schatzker II",
  "Ruptura do manguito rotador em atleta",
  "Fratura de Colles em idosa com osteoporose",
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
      const res = await axios.post("http://127.0.0.1:8000/generate/", { tema, nivel: nivel || undefined });
      onGenerated(res.data.caso);
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
        <div className="risk-label" style={{ marginBottom: 8 }}>Nível</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["", "basico", "intermediario", "avancado"].map((n) => (
            <button
              key={n}
              onClick={() => setNivel(n)}
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                border: "1px solid var(--border)", cursor: "pointer",
                background: nivel === n ? "var(--primary)" : "transparent",
                color: nivel === n ? "#fff" : "var(--muted)",
              }}
            >
              {n || "Qualquer"}
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
            style={{ cursor: "pointer", fontSize: 13 }}
            onClick={() => setTema(e)}
          >
            {e}
          </div>
        ))}
      </div>

      {error && (
        <div className="emergency-banner">{error}</div>
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
        {loading ? "Gerando caso com IA..." : "✨ Gerar Caso"}
      </button>
    </>
  );
}
