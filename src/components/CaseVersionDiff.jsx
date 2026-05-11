import { T } from "../constants/theme";

export default function CaseVersionDiff({ current, previous }) {
  if (!current || !previous) return null;

  const diffs = computeDiffs(previous, current);

  if (diffs.length === 0) {
    return (
      <div
        style={{
          background: T.s1,
          border: `1px solid ${T.b2}`,
          borderRadius: 14,
          padding: 14,
        }}
      >
        <Header />
        <div style={{ color: T.muted, fontSize: 12 }}>
          Nenhuma diferença encontrada.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <Header count={diffs.length} />

      <div style={{ display: "grid", gap: 6 }}>
        {diffs.map((d) => (
          <div
            key={d.path}
            style={{
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: T.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 6,
              }}
            >
              {d.path}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <ValueBox label="Antes" value={d.before} color={T.red} />
              <ValueBox label="Depois" value={d.after} color={T.green} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Header({ count }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: T.purple,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: ".1em",
        marginBottom: count ? 10 : 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>Diferenças</span>
      {count > 0 && (
        <span
          style={{
            background: `${T.purple}18`,
            border: `1px solid ${T.purple}35`,
            color: T.purple,
            borderRadius: 999,
            padding: "2px 8px",
            fontSize: 10,
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function ValueBox({ label, value, color }) {
  const display = formatValue(value);
  return (
    <div
      style={{
        background: `${color}08`,
        border: `1px solid ${color}25`,
        borderRadius: 8,
        padding: "6px 8px",
      }}
    >
      <div style={{ fontSize: 9, color, fontWeight: 800, marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: T.text,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          maxHeight: 80,
          overflow: "hidden",
        }}
      >
        {display}
      </div>
    </div>
  );
}

function formatValue(v) {
  if (v === undefined || v === null) return "—";
  if (Array.isArray(v)) return `[${v.length} itens]`;
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

function flatten(obj, prefix = "", out = {}) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    out[prefix] = obj;
    return out;
  }
  for (const key of Object.keys(obj)) {
    flatten(obj[key], prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

function computeDiffs(before, after) {
  const flatBefore = flatten(before);
  const flatAfter  = flatten(after);
  const allKeys    = new Set([...Object.keys(flatBefore), ...Object.keys(flatAfter)]);
  const diffs      = [];

  for (const path of allKeys) {
    const b = flatBefore[path];
    const a = flatAfter[path];
    const bStr = JSON.stringify(b);
    const aStr = JSON.stringify(a);
    if (bStr !== aStr) {
      diffs.push({ path, before: b, after: a });
    }
  }

  return diffs;
}
