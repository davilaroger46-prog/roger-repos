import { useEffect, useState } from "react";
import { T, NIV_C, COND_C } from "../constants/theme";
import { getCaseStats } from "../services/api";

export default function CasesDashboard({ cases = [] }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCaseStats().then(setStats).catch(() => null);
  }, [cases.length]);

  if (!cases.length && !stats) return null;

  const byRegion = countBy(cases, "regiao");
  const byNivel = countBy(cases, "nivel");
  const byConduta = countBy(cases, "conduta");

  const statusColor = {
    draft: T.muted,
    review_pending: T.amber,
    approved: T.green,
    rejected: T.red,
  };
  const statusLabel = {
    draft: "Rascunho",
    review_pending: "Em revisão",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };

  return (
    <section style={{ background: T.s1, border: `1px solid ${T.b2}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: T.cyan, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14 }}>
        Dashboard da biblioteca
      </div>

      {/* Métricas principais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
        <Metric label="Total de casos" value={cases.length} color={T.blue} />
        <Metric label="Aprovados" value={stats?.by_status?.approved || 0} color={T.green} />
        <Metric label="Em revisão" value={stats?.by_status?.review_pending || 0} color={T.amber} />
        <Metric label="Regiões" value={Object.keys(byRegion).length} color={T.cyan} />
      </div>

      {/* Timeline */}
      {stats?.timeline?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Casos criados por dia
          </div>
          <Timeline data={stats.timeline} />
        </div>
      )}

      {/* Status distribution */}
      {stats?.by_status && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Por status de revisão
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(stats.by_status).map(([k, v]) => (
              <Pill key={k} label={`${statusLabel[k] || k}: ${v}`} color={statusColor[k] || T.muted} />
            ))}
          </div>
        </div>
      )}

      <Group title="Por região" data={byRegion} color={T.blue} />
      <Group title="Por nível" data={byNivel} colorMap={NIV_C} />
      <Group title="Por conduta" data={byConduta} colorMap={COND_C} />
    </section>
  );
}

function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const v = item[key] || "—";
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
}

function Timeline({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const last14 = data.slice(-14);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
      {last14.map((d) => {
        const h = Math.max(4, (d.count / max) * 44);
        return (
          <div key={d.date} title={`${d.date}: ${d.count} caso(s)`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ width: "100%", height: h, background: T.blue, opacity: 0.7, borderRadius: 3 }} />
            <div style={{ fontSize: 8, color: T.muted, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              {d.date.slice(5)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 9, color: T.muted, fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, color, borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 800 }}>
      {label}
    </div>
  );
}

function Group({ title, data, color = T.blue, colorMap }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(data).map(([key, value]) => {
          const c = colorMap?.[key] || color;
          return <Pill key={key} label={`${key}: ${value}`} color={c} />;
        })}
      </div>
    </div>
  );
}
