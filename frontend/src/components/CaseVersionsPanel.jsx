import { useEffect, useState } from "react";
import { T } from "../constants/theme";
import { listCaseVersions, getCaseVersion, restoreCaseVersion } from "../services/api";

export default function CaseVersionsPanel({ caseId, onOpenVersion, onRestoreVersion }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    async function load() {
      setLoading(true);
      try {
        const data = await listCaseVersions(caseId);
        setVersions(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [caseId]);

  if (!caseId) return null;

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
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
          marginBottom: 10,
        }}
      >
        Histórico de versões
      </div>

      {loading && (
        <div style={{ color: T.muted, fontSize: 12 }}>
          Carregando versões...
        </div>
      )}

      {!loading && versions.length === 0 && (
        <div style={{ color: T.muted, fontSize: 12 }}>
          Nenhuma versão anterior salva ainda.
        </div>
      )}

      {versions.map((v) => (
        <div
          key={v.id}
          style={{
            background: T.s2,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 10,
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: T.text, fontSize: 12, fontWeight: 800 }}>
              Versão #{v.id}
            </div>
            <div style={{ color: T.muted, fontSize: 11 }}>
              {v.action} · {v.created_at}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={async () => {
                const data = await getCaseVersion(caseId, v.id);
                onOpenVersion(data);
              }}
              style={{
                padding: "7px 11px",
                borderRadius: 8,
                cursor: "pointer",
                background: `${T.purple}12`,
                border: `1px solid ${T.purple}35`,
                color: T.purple,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Abrir
            </button>

            <button
              onClick={async () => {
                const restored = await restoreCaseVersion(caseId, v.id);
                onRestoreVersion(restored);
              }}
              style={{
                padding: "7px 11px",
                borderRadius: 8,
                cursor: "pointer",
                background: `${T.green}12`,
                border: `1px solid ${T.green}35`,
                color: T.green,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Restaurar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
