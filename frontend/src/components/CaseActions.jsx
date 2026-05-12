import { T } from "../constants/theme";

export default function CaseActions({ caso, onNewCase, onEdit, onExportPdf, onSubmitReview }) {
  if (!caso) return null;

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(caso, null, 2));
    alert("JSON copiado.");
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(caso, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const slug = caso.meta?.slug || "caso-orthostudy";

    a.href = url;
    a.download = `${slug}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 14,
      }}
    >
      <button onClick={copyJson} style={buttonStyle(T.cyan)}>
        📋 Copiar JSON
      </button>

      <button onClick={downloadJson} style={buttonStyle(T.green)}>
        ⬇️ Baixar JSON
      </button>

      {onEdit && (
        <button onClick={onEdit} style={buttonStyle(T.blue)}>
          ✏️ Editar
        </button>
      )}

      {onExportPdf && (
        <button onClick={onExportPdf} style={buttonStyle(T.red)}>
          📄 Exportar PDF
        </button>
      )}

      {onSubmitReview && (
        <button onClick={onSubmitReview} style={buttonStyle(T.purple)}>
          🔍 Enviar para revisão
        </button>
      )}

      <button onClick={onNewCase} style={buttonStyle(T.amber)}>
        ↺ Novo Caso
      </button>
    </div>
  );
}

function buttonStyle(color) {
  return {
    padding: "8px 14px",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 800,
    background: `${color}12`,
    border: `1px solid ${color}35`,
    color,
  };
}
