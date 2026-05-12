export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)",
      borderRadius: 12, padding: 14, marginBottom: 14,
    }}>
      <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 700, marginBottom: onRetry ? 8 : 0 }}>
        ⚠️ {message}
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: "6px 14px", borderRadius: 8, border: "none",
          background: "var(--red)", color: "#fff", fontSize: 12,
          fontWeight: 700, cursor: "pointer",
        }}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
