import { useMemo } from "react";
import { T, NIV_C, COND_C } from "../constants/theme";

export default function CasesDashboard({ cases = [] }) {
  const stats = useMemo(() => {
    const byNivel = {};
    const byRegiao = {};
    const byConduta = {};

    for (const c of cases) {
      if (c.nivel) byNivel[c.nivel] = (byNivel[c.nivel] || 0) + 1;
      if (c.regiao) byRegiao[c.regiao] = (byRegiao[c.regiao] || 0) + 1;

      const conduta = c.output_app?.conduta || c.meta?.conduta;
      if (conduta) byConduta[conduta] = (byConduta[conduta] || 0) + 1;
    }

    return { byNivel, byRegiao, byConduta };
  }, [cases]);

  const total = cases.length;
  if (!total) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <StatCard label="Total de casos" value={total} color={T.blue} />

      {Object.entries(stats.byNivel).map(([nivel, count]) => (
        <StatCard
          key={nivel}
          label={NIVEL_LABEL[nivel] || nivel}
          value={count}
          color={NIV_C[nivel] || T.blue}
          sub={pct(count, total)}
        />
      ))}

      {Object.entries(stats.byConduta).map(([conduta, count]) => (
        <StatCard
          key={conduta}
          label={CONDUTA_LABEL[conduta] || conduta}
          value={count}
          color={COND_C[conduta] || T.blue}
          sub={pct(count, total)}
        />
      ))}

      <RegiaoCard byRegiao={stats.byRegiao} total={total} />
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color }}>{value}</span>
        {sub && (
          <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function RegiaoCard({ byRegiao, total }) {
  const entries = Object.entries(byRegiao).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 14,
        padding: "14px 16px",
        gridColumn: "span 2",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 10,
        }}
      >
        Por região
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map(([regiao, count]) => (
          <div key={regiao} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                fontSize: 11,
                color: T.text,
                fontWeight: 600,
                width: 120,
                flexShrink: 0,
              }}
            >
              {regiao}
            </div>

            <div
              style={{
                flex: 1,
                height: 6,
                background: T.s2,
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(count / total) * 100}%`,
                  height: "100%",
                  background: T.purple,
                  borderRadius: 999,
                }}
              />
            </div>

            <div style={{ fontSize: 11, color: T.muted, width: 32, textAlign: "right" }}>
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function pct(count, total) {
  return `${Math.round((count / total) * 100)}%`;
}

const NIVEL_LABEL = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const CONDUTA_LABEL = {
  conservador: "Conservador",
  cirurgico: "Cirúrgico",
  urgente: "Urgente",
};
