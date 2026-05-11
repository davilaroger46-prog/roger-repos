export const pill = {
  padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
  border: "1px solid var(--border)", cursor: "pointer",
};

export const pillStyle = (active) => ({
  ...pill,
  background: active ? "var(--primary)" : "transparent",
  color: active ? "#fff" : "var(--muted)",
});

export const btnPrimary = (disabled) => ({
  width: "100%", padding: 14, borderRadius: 14, border: "none",
  background: disabled ? "var(--panel-soft)" : "var(--primary)",
  color: disabled ? "var(--muted)" : "#fff",
  fontWeight: 800, fontSize: 15,
  cursor: disabled ? "not-allowed" : "pointer",
});
