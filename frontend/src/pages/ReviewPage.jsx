import { useState } from "react";
import ReviewQueue from "../components/ReviewQueue";
import ReviewPanel from "../components/ReviewPanel";
import CasePreview from "../components/CasePreview";
import { useCaseStore } from "../stores/caseStore";
import { useAuthStore } from "../stores/authStore";
import { showToast } from "../core/toastStore";
import { getCase } from "../services/api";

export default function ReviewPage() {
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const { caso, setCaso, activeCaseId, setActiveCaseId, refreshCases, filters } = useCaseStore();
  const { user } = useAuthStore();

  const handleReviewed = async () => {
    showToast("Revisão registrada.");
    setReviewRefreshKey((k) => k + 1);
    const updated = await getCase(activeCaseId);
    setCaso(updated);
    await refreshCases(filters);
  };

  return (
    <>
      <ReviewQueue
        refreshKey={reviewRefreshKey}
        onOpenCase={(id, fullCase) => {
          setActiveCaseId(id);
          setCaso(fullCase);
        }}
      />

      {caso && (
        <div style={{ marginTop: 16 }}>
          <ReviewPanel
            caseId={activeCaseId}
            user={user}
            onReviewed={handleReviewed}
          />

          <CasePreview caso={caso} />
        </div>
      )}
    </>
  );
}
