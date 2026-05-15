import { useState, useEffect } from "react";
import { T } from "../constants/theme";
import { getCaseTimeline } from "../services/api";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TimelinePanel({ caseId }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open && caseId && !loaded) {
      setLoading(true);
      getCaseTimeline(caseId)
        .then((data) => { setEvents(data); setLoaded(true); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, caseId, loaded]);

  // reset when case changes
  useEffect(() => {
    setEvents([]);
    setLoaded(false);
    setOpen(false);
  }, [caseId]);

  if (!caseId) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer",
          color: T.muted, fontSize: 11, fontWeight: 800,
          padding: "6px 0",
          textTransform: "uppercase", letterSpacing: ".1em",
        }}
      >
        <span style={{
          display: "inline-block", transition: "transform .15s",
          transform: open ? "rotate(90deg)" : "none", fontSize: 10,
        }}>▶</span>
        Timeline do Caso
        {loaded && events.length > 0 && !open && (
          <span style={{
            background: `${T.purple}20`, border: `1px solid ${T.purple}40`,
            color: T.purple, borderRadius: 999, padding: "1px 7px", fontSize: 10,
          }}>
            {events.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          background: T.s1, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: "16px 20px", marginTop: 6,
        }}>
          {loading ? (
            <div style={{ color: T.muted, fontSize: 12 }}>Carregando...</div>
          ) : events.length === 0 ? (
            <div style={{ color: T.muted, fontSize: 12 }}>Nenhum evento registrado.</div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* vertical line */}
              <div style={{
                position: "absolute", left: 11, top: 8, bottom: 8,
                width: 2, background: T.border, borderRadius: 2,
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {events.map((ev, i) => (
                  <div key={ev.id} style={{
                    display: "flex", gap: 14, alignItems: "flex-start",
                    paddingBottom: i < events.length - 1 ? 16 : 0,
                  }}>
                    {/* dot */}
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: T.s2, border: `2px solid ${T.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, zIndex: 1,
                    }}>
                      {ev.icon}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: T.text, lineHeight: 1.4 }}>
                        {ev.label}
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 2, flexWrap: "wrap" }}>
                        {ev.actor && (
                          <span style={{ fontSize: 10, color: T.muted }}>
                            por <span style={{ color: T.text, fontWeight: 700 }}>{ev.actor}</span>
                          </span>
                        )}
                        <span style={{ fontSize: 10, color: T.muted }}>
                          {formatDate(ev.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
