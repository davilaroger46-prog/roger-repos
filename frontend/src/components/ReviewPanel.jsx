import { useState } from "react";
import { T } from "../constants/theme";
import { reviewCase } from "../services/api";

export default function ReviewPanel({
  caseId,
  user,
  onReviewed,
}) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!caseId) return null;

  const canReview = ["reviewer", "admin"].includes(user?.role);

  if (!canReview) return null;

  const submit = async (status) => {
    try {
      setLoading(true);

      await reviewCase(caseId, {
        status,
        notes,
      });

      setNotes("");
      onReviewed?.(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.purple}35`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.purple,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 10,
        }}
      >
        Painel de revisão médica
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas da revisão..."
        rows={3}
        style={{
          width: "100%",
          background: T.s2,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 12,
          color: T.text,
          fontSize: 12,
          outline: "none",
          resize: "vertical",
          marginBottom: 10,
        }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={loading}
          onClick={() => submit("approved")}
          style={btn(T.green, loading)}
        >
          ✅ Aprovar
        </button>

        <button
          disabled={loading}
          onClick={() => submit("rejected")}
          style={btn(T.red, loading)}
        >
          ❌ Rejeitar
        </button>
      </div>
    </div>
  );
}

function btn(color, disabled) {
  return {
    padding: "9px 13px",
    borderRadius: 9,
    cursor: disabled ? "not-allowed" : "pointer",
    background: `${color}12`,
    border: `1px solid ${color}35`,
    color,
    fontSize: 12,
    fontWeight: 900,
    opacity: disabled ? 0.5 : 1,
  };
}
