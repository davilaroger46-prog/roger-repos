export const T = {
  s1:     "var(--surface-1, #0f1117)",
  s2:     "var(--surface-2, #1a1d27)",
  text:   "var(--text, #e8eaf0)",
  muted:  "var(--muted, #6b7280)",
  border: "var(--border, #2a2d3a)",
  blue:   "var(--primary, #3b82f6)",
  green:  "var(--green, #10b981)",
  amber:  "var(--amber, #f59e0b)",
  red:    "var(--red, #ef4444)",
  purple: "var(--purple, #8b5cf6)",
};

export const NIV_C = {
  basico:        T.green,
  intermediario: T.amber,
  avancado:      T.red,
};

// legacy inline-style helpers
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
