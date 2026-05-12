import { useState, useCallback } from "react";
import { T } from "../constants/theme";

let resolveRef = null;

export function useConfirmDialog() {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      resolveRef = resolve;
      setDialog(message);
    });
  }, []);

  const handleResolve = (value) => {
    setDialog(null);
    resolveRef?.(value);
    resolveRef = null;
  };

  const ConfirmDialog = dialog ? (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
      }}
      onClick={() => handleResolve(false)}
    >
      <div
        style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: 28,
          maxWidth: 380,
          width: "100%",
          margin: "0 20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, lineHeight: 1.5 }}>
          {dialog}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={() => handleResolve(false)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: T.s2,
              color: T.muted,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Cancelar
          </button>

          <button
            onClick={() => handleResolve(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              background: T.red,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
}
