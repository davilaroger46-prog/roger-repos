import { useEffect, useRef } from "react";
import useToast from "../hooks/useToast";
import { dismissToast } from "../core/toastStore";

const MAX_VISIBLE = 5;
const DURATION = 4000;

const TYPE_STYLES = {
  success: { bg: "rgba(16,185,129,.13)", border: "rgba(16,185,129,.35)", text: "#6ee7b7", bar: "#10b981" },
  error:   { bg: "rgba(239,68,68,.13)",  border: "rgba(239,68,68,.35)",  text: "#fca5a5", bar: "#ef4444" },
  info:    { bg: "rgba(59,130,246,.13)", border: "rgba(59,130,246,.35)", text: "#93c5fd", bar: "#3b82f6" },
  warning: { bg: "rgba(245,158,11,.13)", border: "rgba(245,158,11,.35)", text: "#fcd34d", bar: "#f59e0b" },
};

function ToastItem({ toast }) {
  const s = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  const barRef = useRef(null);

  useEffect(() => {
    if (!barRef.current) return;
    barRef.current.style.transition = `width ${DURATION}ms linear`;
    requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.width = "0%";
    });
  }, []);

  return (
    <div
      style={{
        position: "relative", overflow: "hidden",
        padding: "11px 40px 11px 14px",
        borderRadius: 12, fontSize: 13, fontWeight: 600,
        maxWidth: 340, minWidth: 240,
        background: s.bg, border: `1px solid ${s.border}`, color: s.text,
        boxShadow: "0 4px 24px rgba(0,0,0,.45)",
        animation: "toastIn .2s ease",
      }}
    >
      {toast.message}

      <button
        onClick={() => dismissToast(toast.id)}
        style={{
          position: "absolute", top: 8, right: 10,
          background: "none", border: "none",
          color: s.text, opacity: 0.6, cursor: "pointer",
          fontSize: 15, fontWeight: 900, lineHeight: 1, padding: 2,
        }}
      >
        ×
      </button>

      <div
        ref={barRef}
        style={{
          position: "absolute", bottom: 0, left: 0,
          height: 3, width: "100%",
          background: s.bar, opacity: 0.6, borderRadius: "0 0 12px 12px",
        }}
      />
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToast();
  const visible = toasts.slice(-MAX_VISIBLE);

  if (!visible.length) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
      <div
        style={{
          position: "fixed", bottom: 24, right: 24,
          zIndex: 9999, display: "flex",
          flexDirection: "column", gap: 8,
          alignItems: "flex-end",
        }}
      >
        {visible.map((t) => <ToastItem key={t.id} toast={t} />)}
      </div>
    </>
  );
}
