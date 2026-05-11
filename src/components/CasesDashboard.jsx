import { T, NIV_C, COND_C } from "../constants/theme";

export default function CasesDashboard({ cases = [] }) {
  if (!cases.length) return null;

  const countBy = (key) => {
    return cases.reduce((acc, item) => {
      const value = item[key] || "não informado";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  };

  const byRegion = countBy("regiao");
  const byNivel = countBy("nivel");
  const byConduta = countBy("conduta");

  return (
    <section
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.cyan,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 14,
        }}
      >
        Dashboard da biblioteca
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}
      >
        <Metric label="Total de casos" value={cases.length} color={T.blue} />
        <Metric label="Regiões" value={Object.keys(byRegion).length} color={T.cyan} />
        <Metric label="Avançados" value={byNivel.avancado || 0} color={T.red} />
        <Metric label="Cirúrgicos" value={byConduta.cirurgico || 0} color={T.amber} />
      </div>

      <Group title="Por região" data={byRegion} color={T.blue} />
      <Group title="Por nível" data={byNivel} colorMap={NIV_C} />
      <Group title="Por conduta" data={byConduta} colorMap={COND_C} />
    </section>
  );
}

function Metric({ label, value, color }) {
  return (
    <div
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 12,
        padding: 12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: T.muted,
          fontWeight: 800,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div style={{ color, fontSize: 22, fontWeight: 900 }}>
        {value}
      </div>
    </div>
  );
}

function Group({ title, data, color = T.blue, colorMap }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 10,
          color: T.muted,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(data).map(([key, value]) => {
          const c = colorMap?.[key] || color;

          return (
            <div
              key={key}
              style={{
                background: `${c}10`,
                border: `1px solid ${c}30`,
                color: c,
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {key}: {value}
            </div>
          );
        })}
      </div>
    </div>
  );
}
