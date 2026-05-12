import { T, NIV_C } from "../constants/theme";
import CasesDashboard from "../components/CasesDashboard";
import ReviewBadge from "../components/ReviewBadge";

export default function DashboardPage({ cases = [] }) {
  if (!cases.length) {
    return (
      <div
        style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: 24,
          color: T.muted,
          fontSize: 13,
          lineHeight: 1.8,
          textAlign: "center",
        }}
      >
        <strong style={{ color: T.text }}>Nenhum caso gerado ainda.</strong>
        <br />
        Use a aba ⚡ Gerar para criar seu primeiro caso clínico.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <CasesDashboard cases={cases} />

      <section
        style={{
          background: T.s1,
          border: `1px solid ${T.b2}`,
          borderRadius: 18,
          padding: 18,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: T.cyan,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".1em",
            marginBottom: 14,
          }}
        >
          Casos recentes
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {cases.slice(0, 20).map((c) => (
            <div
              key={c.id}
              style={{
                background: T.s2,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.titulo}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                  {c.regiao} · {c.ao_codigo}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                {c.nivel && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: NIV_C[c.nivel] || T.blue,
                      background: `${NIV_C[c.nivel] || T.blue}12`,
                      border: `1px solid ${NIV_C[c.nivel] || T.blue}30`,
                      borderRadius: 999,
                      padding: "3px 8px",
                      textTransform: "capitalize",
                    }}
                  >
                    {c.nivel}
                  </span>
                )}
                {c.review_status && c.review_status !== "draft" && (
                  <ReviewBadge status={c.review_status} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
