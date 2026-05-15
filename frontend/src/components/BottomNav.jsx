import { useNavigate, useLocation } from "react-router-dom";
import { T } from "../constants/theme";

const BASE_ITEMS = [
  { id: "generate",  path: "/generate",  icon: "⚡", label: "Gerar" },
  { id: "library",   path: "/library",   icon: "📚", label: "Biblio" },
  { id: "_cases",    path: null,         icon: "💾", label: "Casos" },
  { id: "dashboard", path: "/dashboard", icon: "📊", label: "Stats" },
];

export default function BottomNav({ onCasesOpen, user }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [...BASE_ITEMS];
  if (["reviewer", "admin"].includes(user?.role)) {
    items.push({ id: "review", path: "/review", icon: "🩺", label: "Revisão" });
  }

  return (
    <nav
      className="ortho-bottomnav"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: T.s1, borderTop: `1px solid ${T.border}`,
        display: "flex", zIndex: 200,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {items.map(({ id, path, icon, label }) => {
        const isCases = id === "_cases";
        const isActive = !isCases && path && (pathname.startsWith(path) || (path === "/library" && pathname.startsWith("/cases")));
        return (
          <button
            key={id}
            onClick={() => isCases ? onCasesOpen() : navigate(path)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "10px 4px 8px", background: "none", border: "none",
              color: isActive ? T.blue : T.muted,
              cursor: "pointer", gap: 3, minWidth: 0,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
            <span style={{
              fontSize: 9, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: ".05em", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%",
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
