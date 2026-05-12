import { useState } from "react";
import { T } from "../constants/theme";
import { reviewCase } from "../services/api";
import ReviewBadge from "./ReviewBadge";

const STATUS_LABELS = {
  draft: null,
  review_pending: "Este caso aguarda revisão.",
  approved: "Caso aprovado.",
  rejected: "Caso rejeitado.",
};

export default function ReviewPanel({ caso, caseId, currentUser, onReviewed }) {
  const [status, setStatus] = useState("approved");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canReview =
    currentUser?.role === "reviewer" || currentUser?.role === "admin";

  const reviewStatus = caso?.review_status || caso?.meta?.review_status;

  if (!reviewStatus || reviewStatus === "draft") return null;

  const handleSubmit = async () => {
    if (!caseId) return;
    setSubmitting(true);
    setError(null);
    try {
      await reviewCase(caseId, { status, notes: notes.trim() || null });
      setNotes("");
      onReviewed?.();
    } catch (err) {
      setError(err.message || "Erro ao enviar revisão.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: 18,
        marginTop: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".12em",
          marginBottom: 12,
        }}
      >
        Revisão Clínica
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <ReviewBadge status={reviewStatus} />
        {STATUS_LABELS[reviewStatus] && (
          <span style={{ fontSize: 12, color: T.muted }}>
            {STATUS_LABELS[reviewStatus]}
          </span>
        )}
      </div>

      {(reviewStatus === "approved" || reviewStatus === "rejected") &&
        caso?.review_notes && (
          <div
            style={{
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              color: T.text,
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: ".1em" }}>
              Notas do revisor
            </span>
            <p style={{ margin: "6px 0 0" }}>{caso.review_notes}</p>
          </div>
        )}

      {canReview && reviewStatus === "review_pending" && (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                  border: `1px solid ${status === s
                    ? (s === "approved" ? T.green : T.red) + "55"
                    : T.border}`,
                  background: status === s
                    ? (s === "approved" ? T.green : T.red) + "18"
                    : T.s2,
                  color: status === s
                    ? (s === "approved" ? T.green : T.red)
                    : T.muted,
                }}
              >
                {s === "approved" ? "✓ Aprovar" : "✗ Rejeitar"}
              </button>
            ))}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional)..."
            rows={3}
            style={{
              width: "100%",
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 9,
              padding: "9px 10px",
              color: T.text,
              fontSize: 12,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div style={{ fontSize: 12, color: T.red }}>{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "10px 16px",
              borderRadius: 9,
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 12,
              fontWeight: 800,
              border: "none",
              background: status === "approved" ? T.green : T.red,
              color: "#fff",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Enviando..." : status === "approved" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
          </button>
        </div>
      )}
    </div>
  );
}
