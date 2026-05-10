import { useState } from "react";
import { runAoDecision } from "../api/client";
import ClinicalDecisionPanel from "../components/ClinicalDecisionPanel";

const SEGMENTOS = [
  { codigo: "11", label: "11 — Úmero Proximal" },
  { codigo: "12", label: "12 — Úmero Diáfise" },
  { codigo: "21", label: "21 — Rádio/Ulna Proximal" },
  { codigo: "22", label: "22 — Rádio/Ulna Diáfise" },
  { codigo: "23", label: "23 — Rádio Distal" },
  { codigo: "31", label: "31 — Fêmur Proximal" },
  { codigo: "32", label: "32 — Fêmur Diáfise" },
  { codigo: "41", label: "41 — Tíbia Proximal" },
  { codigo: "42", label: "42 — Tíbia Diáfise" },
  { codigo: "43", label: "43 — Tíbia Distal (Pilão)" },
  { codigo: "44", label: "44 — Tornozelo" },
];

const Toggle = ({ label, value, onChange }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
    <span style={{ fontSize: 13 }}>{label}</span>
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
      background: value ? "var(--primary)" : "var(--panel-soft)",
      position: "relative", transition: "background .2s",
    }}>
      <span style={{
        position: "absolute", top: 3, left: value ? 22 : 2,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left .2s",
      }} />
    </button>
  </div>
);

const INITIAL = {
  segmento: "21", tipo: "B", desvio_mm: 0,
  instabilidade: false, cominuicao: false,
  fratura_exposta: false, deficit_neurovascular: false,
  deficit_extensor: false, incongruencia_articular: false,
  osso_osteoporotico: false, demanda_funcional: "moderada", idade: 40,
};

export default function DecisionPage() {
  const [form, setForm]       = useState(INITIAL);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleRun() {
    setLoading(true);
    setError(null);
    const payload = {
      ...form,
      codigo_ao: `${form.segmento}-${form.tipo}`,
    };
    try {
      const res = await runAoDecision(payload);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const decisionData = result ? {
    decisao_clinica: {
      input: { deficit_neurovascular: form.deficit_neurovascular, fratura_exposta: form.fratura_exposta },
      output: {
        conduta: result.conduta_sugerida,
        tecnica_preferida: result.tecnica_preferida,
        nivel_urgencia: result.nivel_urgencia,
        explicacao: result.justificativa,
      },
    },
  } : null;

  return (
    <>
      <div className="decision-label" style={{ marginBottom: 12 }}>Motor de Decisão AO/OTA</div>

      {/* Segmento e tipo */}
      <div className="card">
        <div className="risk-label" style={{ marginBottom: 8 }}>Segmento AO</div>
        <select
          value={form.segmento}
          onChange={(e) => set("segmento", e.target.value)}
          style={{ width: "100%", background: "var(--panel-soft)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
        >
          {SEGMENTOS.map((s) => <option key={s.codigo} value={s.codigo}>{s.label}</option>)}
        </select>

        <div className="risk-label" style={{ margin: "12px 0 8px" }}>Tipo AO</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["A", "B", "C"].map((t) => (
            <button key={t} onClick={() => set("tipo", t)} style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border)",
              background: form.tipo === t ? "var(--primary)" : "transparent",
              color: form.tipo === t ? "#fff" : "var(--muted)",
              fontWeight: 800, fontSize: 16, cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Dados clínicos */}
      <div className="card">
        <div className="risk-label" style={{ marginBottom: 10 }}>Dados Clínicos</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>Desvio (mm): <strong style={{ color: "var(--primary)" }}>{form.desvio_mm} mm</strong></div>
          <input type="range" min="0" max="20" value={form.desvio_mm}
            onChange={(e) => set("desvio_mm", Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--primary)" }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>Idade: <strong style={{ color: "var(--primary)" }}>{form.idade} anos</strong></div>
          <input type="range" min="10" max="95" value={form.idade}
            onChange={(e) => set("idade", Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--primary)" }}
          />
        </div>

        <div className="risk-label" style={{ marginBottom: 4 }}>Demanda Funcional</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["baixa", "moderada", "alta"].map((d) => (
            <button key={d} onClick={() => set("demanda_funcional", d)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 8, border: "1px solid var(--border)",
              background: form.demanda_funcional === d ? "var(--primary)" : "transparent",
              color: form.demanda_funcional === d ? "#fff" : "var(--muted)",
              fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            }}>{d}</button>
          ))}
        </div>

        <Toggle label="Instabilidade articular"        value={form.instabilidade}           onChange={(v) => set("instabilidade", v)} />
        <Toggle label="Cominuição"                     value={form.cominuicao}              onChange={(v) => set("cominuicao", v)} />
        <Toggle label="Osso osteoporótico"             value={form.osso_osteoporotico}      onChange={(v) => set("osso_osteoporotico", v)} />
        <Toggle label="Déficit do mecanismo extensor"  value={form.deficit_extensor}        onChange={(v) => set("deficit_extensor", v)} />
        <Toggle label="Incongruência articular"        value={form.incongruencia_articular} onChange={(v) => set("incongruencia_articular", v)} />
        <Toggle label="🩸 Fratura exposta"             value={form.fratura_exposta}         onChange={(v) => set("fratura_exposta", v)} />
        <Toggle label="⚡ Déficit neurovascular"       value={form.deficit_neurovascular}   onChange={(v) => set("deficit_neurovascular", v)} />
      </div>

      {error && <div className="emergency-banner">{error}</div>}

      <button onClick={handleRun} disabled={loading} style={{
        width: "100%", padding: 14, borderRadius: 14, border: "none",
        background: loading ? "var(--panel-soft)" : "var(--accent)",
        color: loading ? "var(--muted)" : "#fff",
        fontWeight: 800, fontSize: 15, cursor: loading ? "wait" : "pointer", marginBottom: 14,
      }}>
        {loading ? "Calculando..." : "⚡ Calcular Decisão"}
      </button>

      {result && (
        <>
          <ClinicalDecisionPanel data={decisionData} decision={result} />

          <div className="card">
            <div className="decision-label" style={{ marginBottom: 8 }}>Implante Recomendado</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{result.implante}</div>
          </div>

          {result.alertas?.length > 0 && (
            <div className="card">
              <div className="decision-label" style={{ marginBottom: 8 }}>Alertas Clínicos</div>
              {result.alertas.map((a, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, lineHeight: 1.5 }}>{a}</div>
              ))}
            </div>
          )}

          <button onClick={() => { setResult(null); setForm(INITIAL); }} style={{
            width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--border)",
            background: "transparent", color: "var(--muted)", fontWeight: 700,
            fontSize: 13, cursor: "pointer", marginBottom: 20,
          }}>
            Limpar e recalcular
          </button>
        </>
      )}
    </>
  );
}
