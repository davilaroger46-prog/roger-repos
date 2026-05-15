import { useNavigate, useLocation } from "react-router-dom";
import { T } from "../constants/theme";

const BASE_TABS = [
  ["generate", "/generate", "⚡ Gerar"],
  ["library",  "/library",  "📚 Biblioteca"],
  ["dashboard", "/dashboard", "📊 Dashboard"],
];

export default function TopNav({ user }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [...BASE_TABS];
  if (["reviewer", "admin"].includes(user?.role)) {
    tabs.push(["review", "/review", "🩺 Revisão"]);
  }
  if (user?.role === "admin") {
    tabs.push(["admin", "/admin", "⚙️ Admin"]);
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
      {tabs.map(([id, path, label]) => {
        const isActive = pathname.startsWith(path) || (path === "/library" && pathname.startsWith("/cases"));
        return (
          <button
            key={id}
            onClick={() => navigate(path)}
            style={{
              padding: "9px 13px",
              borderRadius: 999,
              cursor: "pointer",
              background: isActive ? `${T.blue}18` : T.s1,
              border: `1px solid ${isActive ? T.blue + "45" : T.border}`,
              color: isActive ? T.blue : T.muted,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
