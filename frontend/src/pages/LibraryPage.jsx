import { T } from "../constants/theme";

import CaseActions from "../components/CaseActions";
import CasePreview from "../components/CasePreview";
import CaseVisualEditor from "../components/CaseVisualEditor";
import CaseVersionsPanel from "../components/CaseVersionsPanel";
import CaseVersionDiff from "../components/CaseVersionDiff";
import ReviewPanel from "../components/ReviewPanel";

export default function LibraryPage({
  caso,
  activeCaseId,
  editing,
  setEditing,
  versionPreview,
  setVersionPreview,
  currentUser,

  onNewCase,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onAutoCorrect,
  onExportPdf,
  onSubmitReview,
  onReviewed,

  onRestoreField,
  onRestoreBlock,
}) {
  if (!caso) {
    return (
      <div
        style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: 24,
          color: T.muted,
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        <strong style={{ color: T.text }}>Nenhum caso selecionado.</strong>
        <br />
        Selecione um caso na sidebar ou gere um novo caso clínico.
      </div>
    );
  }

  return (
    <div>
      {activeCaseId && (
        <CaseVersionsPanel
          caseId={activeCaseId}
          onOpenVersion={(oldCase) => setVersionPreview(oldCase)}
          onRestoreVersion={async (restoredCase) => {
            setVersionPreview(null);
            await onSaveEdit(restoredCase);
          }}
        />
      )}

      {versionPreview && (
        <>
          <div
            style={{
              background: "rgba(139,92,246,.07)",
              border: "1px solid rgba(139,92,246,.25)",
              borderRadius: 14,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: T.purple,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                marginBottom: 8,
              }}
            >
              Visualizando versão antiga
            </div>

            <button
              onClick={() => setVersionPreview(null)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: T.s2,
                border: `1px solid ${T.border}`,
                color: T.muted,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Voltar para versão atual
            </button>
          </div>

          <CaseVersionDiff
            currentCase={caso}
            oldCase={versionPreview}
            onRestoreField={onRestoreField}
            onRestoreBlock={onRestoreBlock}
          />
        </>
      )}

      <ReviewPanel
        caseId={activeCaseId}
        user={currentUser}
        onReviewed={onReviewed}
      />

      <CaseActions
        caso={caso}
        onNewCase={onNewCase}
        onEdit={onStartEdit}
        onExportPdf={onExportPdf}
        onSubmitReview={onSubmitReview}
      />

      {editing ? (
        <CaseVisualEditor
          caso={caso}
          onCancel={onCancelEdit}
          onSave={onSaveEdit}
          onAutoCorrect={onAutoCorrect}
        />
      ) : (
        <CasePreview caso={versionPreview || caso} />
      )}
    </div>
  );
}
