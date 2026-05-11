import { useEffect, useState } from "react";
import { T } from "../constants/theme";
import { listCaseVersions, getCaseVersion } from "../services/api";

export default function CaseVersionsPanel({ caseId, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    if (!caseId) return;

    setLoading(true);
    listCaseVersions(caseId)
      .then(setVersions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleRestore = async (versionId) => {
    setRestoring(versionId);
    try {
      const snapshot = await getCaseVersion(caseId, versionId);
      onRestore(snapshot);
    } catch (err) {
      console.error(err);
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return (
      <div style={{ color: T.muted, fontSize: 12, padding: "12px 0" }}>
        Carregando histórico...
      </div>
    );
  }

  if (!versions.length) {
    return (
      <div style={{ color: T.muted, fontSize: 12, padding: "12px 0" }}>
        Nenhuma versão anterior.
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 12,
        }}
      >
        🕓 Histórico de versões · {versions.length}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {versions.map((v) => (
          <div
            key={v.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>
                {ACTION_LABEL[v.action] ?? v.action}
              </div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                {formatDate(v.created_at)}
              </div>
            </div>

            {onRestore && (
              <button
                onClick={() => handleRestore(v.id)}
                disabled={restoring === v.id}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${T.amber}35`,
                  background: `${T.amber}12`,
                  color: T.amber,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: restoring === v.id ? "not-allowed" : "pointer",
                  opacity: restoring === v.id ? 0.5 : 1,
                }}
              >
                {restoring === v.id ? "..." : "Restaurar"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTION_LABEL = {
  before_update:  "Antes da edição",
  before_autocorrect: "Antes da autocorreção",
  generate: "Geração inicial",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
