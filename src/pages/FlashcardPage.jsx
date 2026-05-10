import { useState } from "react";
import { updateProgress } from "../api/client";

export default function FlashcardPage({ caso, onBack }) {
  const flashcards = caso.flashcards || [];
  const [index, setIndex]     = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [corretos, setCorretos] = useState(0);
  const [vistos, setVistos]   = useState(0);
  const [done, setDone]       = useState(false);

  if (flashcards.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>
        <p>Nenhum flashcard disponível para este caso.</p>
        <button onClick={onBack} style={btnStyle}>← Voltar</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((corretos / flashcards.length) * 100);
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {pct >= 70 ? "🏆" : pct >= 40 ? "📚" : "💪"}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "var(--primary)" }}>{pct}%</div>
        <div style={{ color: "var(--muted)", marginTop: 8 }}>
          {corretos} de {flashcards.length} corretos
        </div>
        <button onClick={onBack} style={{ ...btnStyle, marginTop: 24 }}>← Voltar ao Caso</button>
      </div>
    );
  }

  const card = flashcards[index];

  function handleAnswer(acertou) {
    const novosVistos   = vistos + 1;
    const novosCorretos = acertou ? corretos + 1 : corretos;
    setVistos(novosVistos);
    if (acertou) setCorretos(novosCorretos);

    if (index + 1 >= flashcards.length) {
      updateProgress({
        caso_id: caso.id || caso.meta?.id,
        flashcards_vistos: novosVistos,
        flashcards_corretos: novosCorretos,
      }).catch(() => {});
      setDone(true);
    } else {
      setIndex(index + 1);
      setFlipped(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          {index + 1} / {flashcards.length}
        </span>
        <div style={{ flex: 1, height: 4, background: "var(--panel-soft)", borderRadius: 999 }}>
          <div style={{
            height: "100%", borderRadius: 999, background: "var(--primary)",
            width: `${((index + 1) / flashcards.length) * 100}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      <div
        className="card decision-card"
        style={{ minHeight: 200, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center" }}
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? (
          <>
            <div className="decision-label">Pergunta</div>
            <div className="decision-main" style={{ fontSize: 16, marginTop: 10 }}>{card.pergunta}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted)" }}>Toque para ver a resposta</div>
          </>
        ) : (
          <>
            <div className="decision-label" style={{ color: "var(--green)" }}>Resposta</div>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{card.resposta}</div>
          </>
        )}
      </div>

      {flipped && (
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            onClick={() => handleAnswer(false)}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "rgba(239,68,68,.15)", color: "var(--red)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            ✗ Errei
          </button>
          <button
            onClick={() => handleAnswer(true)}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "rgba(16,185,129,.15)", color: "var(--green)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            ✓ Acertei
          </button>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "12px 24px", borderRadius: 12, border: "none",
  background: "var(--primary)", color: "#fff", fontWeight: 800,
  fontSize: 14, cursor: "pointer",
};
