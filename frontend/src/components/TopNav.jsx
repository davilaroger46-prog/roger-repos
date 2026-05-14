import { T } from "../constants/theme";

export default function TopNav({ activeTab, onChange, user }) {
  const tabs = [
    ["generate", "⚡ Gerar"],
    ["library", "📚 Biblioteca"],
    ["dashboard", "📊 Dashboard"],
  ];

  if (["reviewer", "admin"].includes(user?.role)) {
    tabs.push(["review", "🩺 Revisão"]);
  }

  if (user?.role === "admin") {
    tabs.push(["admin", "⚙️ Admin"]);
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
      {tabs.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            padding: "9px 13px",
            borderRadius: 999,
            cursor: "pointer",
            background: activeTab === id ? `${T.blue}18` : T.s1,
            border: `1px solid ${activeTab === id ? T.blue + "45" : T.border}`,
            color: activeTab === id ? T.blue : T.muted,
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
