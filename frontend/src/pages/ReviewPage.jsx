import ReviewQueue from "../components/ReviewQueue";
import ReviewPanel from "../components/ReviewPanel";
import CasePreview from "../components/CasePreview";

export default function ReviewPage({
  caso,
  activeCaseId,
  currentUser,
  reviewRefreshKey,
  onOpenCase,
  onReviewed,
}) {
  return (
    <>
      <ReviewQueue
        refreshKey={reviewRefreshKey}
        onOpenCase={onOpenCase}
      />

      {caso && (
        <div style={{ marginTop: 16 }}>
          <ReviewPanel
            caseId={activeCaseId}
            user={currentUser}
            onReviewed={onReviewed}
          />

          <CasePreview caso={caso} />
        </div>
      )}
    </>
  );
}
