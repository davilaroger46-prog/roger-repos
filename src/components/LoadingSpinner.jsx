export default function LoadingSpinner({ message = "Carregando..." }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid var(--panel-soft)",
        borderTop: "3px solid var(--primary)",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto 12px",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}
