import { T } from "../constants/theme";

export default function CaseActions({ caso, onFlashcards, onDetail, onDelete }) {
  if (!caso) return null;

  const flashCount = caso.flashcards?.length ?? 0;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 20,
      }}
    >
      {onFlashcards && (
        <ActionBtn
          onClick={() => onFlashcards(caso)}
          color={T.cyan}
          label={`🃏 Estudar Flashcards (${flashCount})`}
          disabled={flashCount === 0}
        />
      )}

      {onDetail && (
        <ActionBtn
          onClick={() => onDetail(caso)}
          color={T.blue}
          label="📋 Ver Detalhes"
        />
      )}

      {onDelete && (
        <ActionBtn
          onClick={() => onDelete(caso.id ?? caso.meta?.titulo)}
          color={T.red}
          label="🗑 Deletar"
          ghost
        />
      )}
    </div>
  );
}

function ActionBtn({ onClick, color, label, disabled, ghost }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "9px 16px",
        borderRadius: 10,
        border: `1px solid ${color}55`,
        background: ghost ? "transparent" : `${color}18`,
        color: disabled ? T.muted : color,
        fontWeight: 700,
        fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background .15s",
      }}
    >
      {label}
    </button>
  );
}
