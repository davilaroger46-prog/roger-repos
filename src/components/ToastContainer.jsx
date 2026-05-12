import { T } from "../constants/theme";

const TYPE_STYLES = {
  success: {
    background: "rgba(16,185,129,.12)",
    border: "1px solid rgba(16,185,129,.3)",
    color: "#6ee7b7",
  },
  error: {
    background: "rgba(239,68,68,.12)",
    border: "1px solid rgba(239,68,68,.3)",
    color: "#fca5a5",
  },
  info: {
    background: "rgba(59,130,246,.12)",
    border: "1px solid rgba(59,130,246,.3)",
    color: "#93c5fd",
  },
};

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            maxWidth: 320,
            boxShadow: "0 4px 24px rgba(0,0,0,.4)",
            ...TYPE_STYLES[t.type] || TYPE_STYLES.success,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
