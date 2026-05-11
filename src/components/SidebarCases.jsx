import { T, NIV_C } from "../constants/theme";
import Tag from "./Tag";

export default function SidebarCases({
  cases = [],
  activeCaseId,
  onLoadCase,
  onDeleteCase,
}) {
  if (!cases.length) return null;

  return (
    <aside
      style={{
        width: 280,
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        background: T.s1,
        borderRight: `1px solid ${T.border}`,
        padding: "18px 12px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".12em",
          marginBottom: 14,
        }}
      >
        💾 Casos Salvos · {cases.length}
      </div>

      {cases.map((c) => (
        <div
          key={c.id}
          onClick={() => onLoadCase(c.id)}
          style={{
            background: activeCaseId === c.id ? `${T.blue}12` : T.s2,
            border: `1px solid ${
              activeCaseId === c.id ? T.blue + "55" : T.border
            }`,
            borderRadius: 12,
            padding: 12,
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: T.muted,
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              #{c.id}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCase(c.id);
              }}
              style={{
                background: "none",
                border: "none",
                color: T.muted,
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: T.text,
              lineHeight: 1.35,
              marginBottom: 8,
            }}
          >
            {c.titulo}
          </div>

          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {c.regiao    && <Tag c={T.blue}                  sm>{c.regiao}</Tag>}
            {c.nivel     && <Tag c={NIV_C[c.nivel] || T.blue} sm>{c.nivel}</Tag>}
            {c.ao_codigo && <Tag c={T.purple}                sm>{c.ao_codigo}</Tag>}
          </div>
        </div>
      ))}
    </aside>
  );
}
