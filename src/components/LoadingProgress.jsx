import { useState, useEffect } from "react";

export default function LoadingProgress({ message = "Carregando...", estimated = 0 }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!estimated) return;
    const step = 100 / (estimated * 10);
    const id = setInterval(() => {
      setProgress((p) => Math.min(p + step, 92));
    }, 100);
    return () => clearInterval(id);
  }, [estimated]);

  return (
    <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--muted)" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid var(--panel-soft)",
        borderTop: "3px solid var(--primary)",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto 16px",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 13, marginBottom: estimated ? 12 : 0 }}>{message}</div>
      {estimated > 0 && (
        <div style={{
          height: 4, background: "var(--panel-soft)", borderRadius: 999,
          maxWidth: 200, margin: "0 auto",
        }}>
          <div style={{
            height: "100%", borderRadius: 999, background: "var(--primary)",
            width: `${progress}%`, transition: "width 0.1s linear",
          }} />
        </div>
      )}
    </div>
  );
}
