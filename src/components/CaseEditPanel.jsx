import { useState } from "react";
import { T } from "../constants/theme";

export default function CaseEditPanel({ caso, editJson, setEditJson, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(caso)));
  const [jsonError, setJsonError] = useState(null);
  const [mode, setMode] = useState("fields"); // "fields" | "json"

  const set = (path, value) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let node = next;
      for (let i = 0; i < keys.length - 1; i++) {
        node[keys[i]] ??= {};
        node = node[keys[i]];
      }
      node[keys.at(-1)] = value;
      return next;
    });
  };

  const handleJsonChange = (raw) => {
    setEditJson(raw);
    try {
      setDraft(JSON.parse(raw));
      setJsonError(null);
    } catch {
      setJsonError("JSON inválido");
    }
  };

  const handleSave = () => {
    if (jsonError) return;
    if (mode === "fields") setEditJson(JSON.stringify(draft, null, 2));
    onSave();
  };

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 20,
        padding: 22,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.cyan, textTransform: "uppercase", letterSpacing: ".1em" }}>
          ✏️ Editar Caso
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <ModeBtn active={mode === "fields"} onClick={() => setMode("fields")}>Campos</ModeBtn>
          <ModeBtn active={mode === "json"}   onClick={() => { setEditJson(JSON.stringify(draft, null, 2)); setMode("json"); }}>JSON</ModeBtn>
        </div>
      </div>

      {mode === "fields" && (
        <div style={{ display: "grid", gap: 12 }}>
          <Row label="Título">
            <Input value={draft.meta?.titulo || ""} onChange={(v) => set("meta.titulo", v)} />
          </Row>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Row label="Região">
              <Input value={draft.meta?.regiao || ""} onChange={(v) => set("meta.regiao", v)} />
            </Row>
            <Row label="Subespecialidade">
              <Input value={draft.meta?.subespecialidade || ""} onChange={(v) => set("meta.subespecialidade", v)} />
            </Row>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Row label="Nível">
              <Select value={draft.meta?.nivel || ""} onChange={(v) => set("meta.nivel", v)}
                options={["basico", "intermediario", "avancado"]} />
            </Row>
            <Row label="Conduta">
              <Select value={draft.decisao_clinica?.output?.conduta || ""} onChange={(v) => set("decisao_clinica.output.conduta", v)}
                options={["conservador", "cirurgico", "urgente"]} />
            </Row>
            <Row label="Urgência">
              <Select value={draft.decisao_clinica?.output?.nivel_urgencia || ""} onChange={(v) => set("decisao_clinica.output.nivel_urgencia", v)}
                options={["baixa", "moderada", "alta", "critica"]} />
            </Row>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Row label="Código AO/OTA">
              <Input value={draft.classificacao?.ao_ota?.codigo || ""} onChange={(v) => set("classificacao.ao_ota.codigo", v)} />
            </Row>
            <Row label="Técnica Preferida">
              <Input value={draft.decisao_clinica?.output?.tecnica_preferida || ""} onChange={(v) => set("decisao_clinica.output.tecnica_preferida", v)} />
            </Row>
          </div>

          <Row label="Diagnóstico Principal">
            <Input value={draft.diagnostico?.principal || ""} onChange={(v) => set("diagnostico.principal", v)} />
          </Row>

          <Row label="Explicação da Decisão">
            <Textarea value={draft.decisao_clinica?.output?.explicacao || ""} onChange={(v) => set("decisao_clinica.output.explicacao", v)} rows={3} />
          </Row>
        </div>
      )}

      {mode === "json" && (
        <div>
          <textarea
            value={editJson}
            onChange={(e) => handleJsonChange(e.target.value)}
            style={{
              width: "100%",
              minHeight: 320,
              background: T.s3,
              border: `1px solid ${jsonError ? T.red : T.border}`,
              borderRadius: 10,
              padding: 12,
              color: "#a5f3fc",
              fontSize: 11,
              fontFamily: "monospace",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          {jsonError && (
            <div style={{ color: T.red, fontSize: 11, marginTop: 4 }}>{jsonError}</div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button
          onClick={handleSave}
          disabled={!!jsonError}
          style={actionBtn(T.green, !!jsonError)}
        >
          💾 Salvar
        </button>
        <button onClick={onCancel} style={actionBtn(T.muted, false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", background: T.s2, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12,
        outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

function Textarea({ value, onChange, rows = 2 }) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", background: T.s2, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12,
        outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", background: T.s2, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12,
        outline: "none", boxSizing: "border-box",
      }}
    >
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ModeBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", borderRadius: 7, border: `1px solid ${active ? T.cyan + "55" : T.border}`,
        background: active ? `${T.cyan}15` : "transparent", color: active ? T.cyan : T.muted,
        fontSize: 11, fontWeight: 700, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function actionBtn(color, disabled) {
  return {
    padding: "9px 18px", borderRadius: 9, border: `1px solid ${color}44`,
    background: `${color}18`, color: disabled ? T.muted : color,
    fontWeight: 700, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
}
