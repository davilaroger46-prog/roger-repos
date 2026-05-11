import { useState, useEffect } from "react";
import { getProgress, getCases } from "../services/api";

export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [casesMap, setCasesMap]   = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getProgress(), getCases()])
      .then(([prog, cases]) => {
        const map = {};
        cases.forEach((c) => { map[c.id] = c.titulo; });
        setProgress(prog);
        setCasesMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalFlashcards = progress.reduce((s, p) => s + p.flashcards_vistos, 0);
  const totalCorretos   = progress.reduce((s, p) => s + p.flashcards_corretos, 0);
  const totalDecisoes   = progress.reduce((s, p) => s + (p.decisoes_total || 0), 0);
  const acertosDecisao  = progress.reduce((s, p) => s + (p.decisoes_acertadas || 0), 0);
  const pctFlash = totalFlashcards > 0 ? Math.round((totalCorretos / totalFlashcards) * 100) : 0;

  if (loading) {
    return <p style={{ color: "var(--muted)", padding: 20 }}>Carregando progresso...</p>;
  }

  return (
    <>
      <div className="decision-label" style={{ marginBottom: 12 }}>Seu Progresso</div>

      <div className="risk-grid">
        {[
          ["Flashcards", totalFlashcards, "var(--primary)"],
          ["Corretos",   totalCorretos,   "var(--green)"],
          ["Acurácia",   `${pctFlash}%`,  pctFlash >= 70 ? "var(--green)" : "var(--amber)"],
        ].map(([label, value, color]) => (
          <div key={label} className="risk-box">
            <div className="risk-label">{label}</div>
            <div className="risk-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {totalDecisoes > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="decision-label">Decisões Clínicas</div>
          <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900, color: "var(--primary)" }}>
            {acertosDecisao}/{totalDecisoes}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>acertos</div>
        </div>
      )}

      {progress.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          <p>Nenhuma atividade ainda.</p>
          <p style={{ fontSize: 13 }}>Estude alguns flashcards para ver seu progresso aqui.</p>
        </div>
      )}

      {progress.map((p) => {
        const pct = p.flashcards_vistos > 0
          ? Math.round((p.flashcards_corretos / p.flashcards_vistos) * 100)
          : 0;
        const titulo = casesMap[p.caso_id] || p.caso_id;
        return (
          <div key={p.caso_id} className="card">
            <div style={{ fontWeight: 700, fontSize: 13 }}>{titulo}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
              <div style={{ flex: 1, height: 6, background: "var(--panel-soft)", borderRadius: 999 }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  background: pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)",
                  width: `${pct}%`,
                  transition: "width 0.4s ease",
                }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 36 }}>{pct}%</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {p.flashcards_corretos}/{p.flashcards_vistos} flashcards corretos
            </div>
          </div>
        );
      })}
    </>
  );
}
