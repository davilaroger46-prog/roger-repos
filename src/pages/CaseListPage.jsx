import { useState, useEffect, useCallback } from "react";
import { listCases } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import Tag from "../components/Tag";
import { REGIOES, NIVEL_BADGE } from "../constants/prompt";

export default function CaseListPage({ onSelect }) {
  const [cases, setCases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [q, setQ]           = useState("");
  const [regiao, setRegiao] = useState("");
  const [nivel, setNivel]   = useState("");

  const fetchCases = useCallback(() => {
    setLoading(true);
    setError(null);
    listCases()
      .then(setCases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  return (
    <>
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Buscar caso..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: "100%", background: "transparent", border: "none",
            color: "var(--text)", fontSize: 15, outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {REGIOES.map((r) => (
          <button
            key={r}
            onClick={() => setRegiao(r)}
            style={{
              padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              border: "1px solid var(--border)", cursor: "pointer",
              background: regiao === r ? "var(--primary)" : "transparent",
              color: regiao === r ? "#fff" : "var(--muted)",
            }}
          >
            {r || "Todos"}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner message="Buscando casos..." />}
      {error   && <ErrorBanner message={error} onRetry={fetchCases} />}

      {(() => {
        let filtered = cases;
        if (regiao) filtered = filtered.filter(c => c.regiao?.toLowerCase() === regiao.toLowerCase());
        if (nivel)  filtered = filtered.filter(c => c.nivel === nivel);
        if (q)      filtered = filtered.filter(c =>
          c.titulo?.toLowerCase().includes(q.toLowerCase()) ||
          c.output_app?.resumo?.toLowerCase().includes(q.toLowerCase()) ||
          c.meta?.tags?.some(t => t.toLowerCase().includes(q.toLowerCase()))
        );
        return filtered.map((c) => (
          <div
            key={c.id}
            className="card"
            onClick={() => onSelect(c)}
            style={{ cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Tag nivel={c.nivel} />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{c.regiao}</span>
            </div>
            <div style={{ fontWeight: 800, marginTop: 8, fontSize: 15 }}>{c.titulo}</div>
            {c.output_app?.resumo && (
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                {c.output_app.resumo.substring(0, 120)}...
              </div>
            )}
            {c.meta?.tags?.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                {c.meta.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} label={tag} className="badge-blue" />
                ))}
              </div>
            )}
          </div>
        ));
      })()}

      {!loading && cases.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          <p>Nenhum caso encontrado.</p>
          <p style={{ fontSize: 13 }}>Use a aba ✨ para gerar um novo caso.</p>
        </div>
      )}

    </>
  );
}
