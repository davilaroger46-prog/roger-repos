import { useEffect, useState } from "react";
import { T } from "../constants/theme";
import { listCases, getCase } from "../services/api";
import ReviewBadge from "./ReviewBadge";

export default function ReviewQueue({ onOpenCase }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await listCases({
        review_status: "review_pending",
        page_size: 50,
        sort_by: "updated_at",
        sort_dir: "desc",
      });

      setItems(data.items || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <section
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.purple,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 14,
        }}
      >
        Fila de revisão
      </div>

      {loading && (
        <div style={{ color: T.muted, fontSize: 13 }}>
          Carregando casos pendentes...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ color: T.muted, fontSize: 13 }}>
          Nenhum caso pendente de revisão.
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((c) => (
          <div
            key={c.id}
            style={{
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 14,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: T.text, fontWeight: 900 }}>
                {c.titulo}
              </div>

              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                #{c.id} · {c.regiao} · {c.nivel} · {c.ao_codigo}
              </div>

              <div style={{ marginTop: 8 }}>
                <ReviewBadge status={c.review_status} />
              </div>
            </div>

            <button
              onClick={async () => {
                const full = await getCase(c.id);
                onOpenCase(c.id, full);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 9,
                background: `${T.purple}12`,
                border: `1px solid ${T.purple}35`,
                color: T.purple,
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Revisar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
