import { useState, useEffect } from "react";
import { subscribeConfirm, resolveConfirm } from "../core/confirmStore";
import { T } from "../constants/theme";

export default function ConfirmModal() {
  const [state, setState] = useState(null);

  useEffect(() => subscribeConfirm(setState), []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => { if (e.key === "Escape") resolveConfirm(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  if (!state) return null;

  return (
    <div
      onClick={() => resolveConfirm(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.s2, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: 28, maxWidth: 420, width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,.6)",
          animation: "confirmIn .15s ease",
        }}
      >
        {state.title && (
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 10 }}>
            {state.title}
          </div>
        )}
        <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 24 }}>
          {state.message}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={() => resolveConfirm(false)}
            style={{
              padding: "9px 18px", borderRadius: 10, border: `1px solid ${T.border}`,
              background: "transparent", color: T.muted,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            {state.cancelLabel}
          </button>
          <button
            onClick={() => resolveConfirm(true)}
            style={{
              padding: "9px 18px", borderRadius: 10, border: "none",
              background: state.danger ? T.red : T.blue,
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes confirmIn { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );
}
