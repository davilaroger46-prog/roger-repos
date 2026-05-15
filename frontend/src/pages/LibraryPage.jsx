import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { T } from "../constants/theme";
import { useCaseStore } from "../stores/caseStore";
import { useAuthStore } from "../stores/authStore";
import useCaseEditor from "../hooks/useCaseEditor";
import CaseActions from "../components/CaseActions";
import CasePreview from "../components/CasePreview";
import CaseVisualEditor from "../components/CaseVisualEditor";
import CaseVersionsPanel from "../components/CaseVersionsPanel";
import CaseVersionDiff from "../components/CaseVersionDiff";
import ReviewPanel from "../components/ReviewPanel";
import SharePanel from "../components/SharePanel";
import { downloadCasePdf, downloadCasePdfDraft, submitCaseReview, getCase } from "../services/api";
import { showToast } from "../core/toastStore";

export default function LibraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { caso, setCaso, activeCaseId, setActiveCaseId, loadCase, refreshCases, filters } = useCaseStore();
  const { user } = useAuthStore();
  const {
    editing, setEditing, versionPreview, setVersionPreview,
    startEdit, cancelEdit, saveEdit, autoCorrect, restoreField, restoreBlock,
  } = useCaseEditor();

  useEffect(() => {
    if (id && parseInt(id) !== activeCaseId) {
      loadCase(parseInt(id)).catch(() => navigate("/library", { replace: true }));
    }
  }, [id]);

  const handleExportPdf = async () => {
    if (!activeCaseId) { showToast("Este caso ainda não possui ID no banco.", "error"); return; }
    await downloadCasePdf(activeCaseId);
  };

  const handleExportDraftPdf = async () => {
    if (!activeCaseId) { showToast("Este caso ainda não possui ID no banco.", "error"); return; }
    await downloadCasePdfDraft(activeCaseId);
  };

  const handleSubmitReview = async () => {
    if (!activeCaseId) { showToast("Este caso ainda não possui ID no banco.", "error"); return; }
    await submitCaseReview(activeCaseId);
    showToast("Caso enviado para revisão.");
    await refreshCases(filters);
    const updated = await getCase(activeCaseId);
    setCaso(updated);
  };

  const handleReviewed = async () => {
    showToast("Revisão registrada.");
    const updated = await getCase(activeCaseId);
    setCaso(updated);
    await refreshCases(filters);
  };

  const handleNewCase = () => {
    useCaseStore.getState().resetCaseSelection();
    navigate("/generate");
  };

  if (!caso) {
    return (
      <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 18, padding: 32, textAlign: "center" }}>
        <h2 style={{ color: T.text, fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>Nenhum caso selecionado</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Escolha um caso na lateral ou gere um novo caso clínico.</p>
      </div>
    );
  }

  return (
    <div>
      {activeCaseId && (
        <CaseVersionsPanel
          caseId={activeCaseId}
          onOpenVersion={(oldCase) => setVersionPreview(oldCase)}
          onRestoreVersion={async (restoredCase) => { setVersionPreview(null); await saveEdit(restoredCase); }}
        />
      )}

      {versionPreview && (
        <>
          <div style={{ background: "rgba(139,92,246,.07)", border: "1px solid rgba(139,92,246,.25)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: T.purple, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
              Visualizando versão antiga
            </div>
            <button onClick={() => setVersionPreview(null)} style={{ padding: "7px 12px", borderRadius: 8, cursor: "pointer", background: T.s2, border: `1px solid ${T.border}`, color: T.muted, fontSize: 11, fontWeight: 800 }}>
              Voltar para versão atual
            </button>
          </div>
          <CaseVersionDiff currentCase={caso} oldCase={versionPreview} onRestoreField={restoreField} onRestoreBlock={restoreBlock} />
        </>
      )}

      <ReviewPanel caseId={activeCaseId} user={user} onReviewed={handleReviewed} />

      <SharePanel caseId={activeCaseId} currentUser={user} caso={caso} />

      <CaseActions
        caso={caso}
        onNewCase={handleNewCase}
        onEdit={startEdit}
        onExportPdf={handleExportPdf}
        onExportDraftPdf={handleExportDraftPdf}
        onSubmitReview={handleSubmitReview}
      />

      {editing ? (
        <CaseVisualEditor caso={caso} onCancel={cancelEdit} onSave={saveEdit} onAutoCorrect={autoCorrect} />
      ) : (
        <CasePreview caso={versionPreview || caso} />
      )}
    </div>
  );
}
