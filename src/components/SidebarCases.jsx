export default function SidebarCases({ cases = [], onSelect, onDelete, selectedId }) {
  if (cases.length === 0) {
    return (
      <div style={{ padding: "20px 16px", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
        Nenhum caso salvo ainda.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0" }}>
      {cases.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect?.(c.id)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            cursor: "pointer",
            background: selectedId === c.id ? "var(--primary)" : "var(--panel-soft)",
            color: selectedId === c.id ? "#fff" : "var(--text)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            transition: "background 0.15s",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: 13,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {c.titulo}
            </div>
            <div style={{
              fontSize: 11,
              color: selectedId === c.id ? "rgba(255,255,255,.75)" : "var(--muted)",
              marginTop: 2,
            }}>
              {c.regiao} · {c.nivel}
            </div>
          </div>

          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: selectedId === c.id ? "rgba(255,255,255,.8)" : "var(--muted)",
                fontSize: 15, lineHeight: 1, padding: 2, flexShrink: 0,
              }}
              title="Deletar caso"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
