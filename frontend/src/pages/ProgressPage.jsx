import { useState, useEffect } from "react";
import { listCases } from "../services/api";

export default function ProgressPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCases()
      .then(setCases)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: "var(--muted)", padding: 20 }}>Carregando...</p>;
  }

  return (
    <>
      <div className="decision-label" style={{ marginBottom: 12 }}>Seu Progresso</div>

      <div className="risk-grid">
        {[
          ["Casos", cases.length, "var(--primary)"],
          ["Avançado", cases.filter(c => c.nivel === "avancado").length, "var(--red)"],
          ["Intermediário", cases.filter(c => c.nivel === "intermediario").length, "var(--amber)"],
        ].map(([label, value, color]) => (
          <div key={label} className="risk-box">
            <div className="risk-label">{label}</div>
            <div className="risk-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          <p>Nenhum caso gerado ainda.</p>
          <p style={{ fontSize: 13 }}>Use a aba ✨ para gerar seu primeiro caso.</p>
        </div>
      )}

      {cases.map((c) => (
        <div key={c.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={`badge badge-${c.nivel === "avancado" ? "red" : c.nivel === "intermediario" ? "amber" : "green"}`}>
              {c.nivel}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{c.regiao}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8 }}>{c.titulo}</div>
        </div>
      ))}
    </>
  );
}
