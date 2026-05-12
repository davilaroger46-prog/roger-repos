import { useState, useEffect } from "react";
import { listCases, getCase } from "../services/api";
import { T } from "../constants/theme";
import ReviewPanel from "../components/ReviewPanel";
import CasePreview from "../components/CasePreview";
import ReviewBadge from "../components/ReviewBadge";
import Tag from "../components/Tag";
import { NIV_C } from "../constants/theme";

export default function ReviewPage({ user }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [activeCase, setActiveCase] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await listCases({ review_status: "review_pending", page_size: 50 });
      setQueue(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleSelect = async (id) => {
    setActiveCaseId(id);
    const data = await getCase(id);
    setActiveCase(data);
  };

  const handleReviewed = async () => {
    await fetchQueue();
    if (activeCaseId) {
      const data = await getCase(activeCaseId);
      setActiveCase(data);
    }
  };

  if (loading) {
    return <div style={{ color: T.muted, fontSize: 13, padding: 20 }}>Carregando fila...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 12 }}>
          Fila · {queue.length} pendente{queue.length !== 1 ? "s" : ""}
        </div>

        {!queue.length && (
          <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.7 }}>
            Nenhum caso aguardando revisão.
          </div>
        )}

        {queue.map((c) => (
          <div
            key={c.id}
            onClick={() => handleSelect(c.id)}
            style={{
              background: activeCaseId === c.id ? `${T.blue}12` : T.s2,
              border: `1px solid ${activeCaseId === c.id ? T.blue + "55" : T.border}`,
              borderRadius: 12,
              padding: 12,
              cursor: "pointer",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "monospace", fontWeight: 700, marginBottom: 4 }}>
              #{c.id}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.35, marginBottom: 8 }}>
              {c.titulo}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {c.regiao && <Tag c={T.blue} sm>{c.regiao}</Tag>}
              {c.nivel && <Tag c={NIV_C[c.nivel] || T.blue} sm>{c.nivel}</Tag>}
              <ReviewBadge status={c.review_status} />
            </div>
          </div>
        ))}
      </div>

      <div>
        {activeCase ? (
          <>
            <ReviewPanel
              caseId={activeCaseId}
              user={user}
              onReviewed={handleReviewed}
            />
            <CasePreview caso={activeCase} />
          </>
        ) : (
          <div style={{ color: T.muted, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
            Selecione um caso para revisar.
          </div>
        )}
      </div>
    </div>
  );
}
