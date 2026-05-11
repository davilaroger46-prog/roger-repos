import { useState } from "react";
import { T } from "../constants/theme";

export default function CaseVisualEditor({ caso, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(caso)));

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

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Field label="Título">
        <Input
          value={draft.meta?.titulo || ""}
          onChange={(v) => set("meta.titulo", v)}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Região">
          <Input
            value={draft.meta?.regiao || ""}
            onChange={(v) => set("meta.regiao", v)}
          />
        </Field>

        <Field label="Subespecialidade">
          <Input
            value={draft.meta?.subespecialidade || ""}
            onChange={(v) => set("meta.subespecialidade", v)}
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Field label="Nível">
          <Select
            value={draft.meta?.nivel || ""}
            onChange={(v) => set("meta.nivel", v)}
            options={["basico", "intermediario", "avancado"]}
          />
        </Field>

        <Field label="Conduta">
          <Select
            value={draft.decisao_clinica?.output?.conduta || ""}
            onChange={(v) => set("decisao_clinica.output.conduta", v)}
            options={["conservador", "cirurgico", "urgente"]}
          />
        </Field>

        <Field label="Urgência">
          <Select
            value={draft.decisao_clinica?.output?.nivel_urgencia || ""}
            onChange={(v) => set("decisao_clinica.output.nivel_urgencia", v)}
            options={["baixa", "moderada", "alta", "critica"]}
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Código AO/OTA">
          <Input
            value={draft.classificacao?.ao_ota?.codigo || ""}
            onChange={(v) => set("classificacao.ao_ota.codigo", v)}
          />
        </Field>

        <Field label="Técnica Preferida">
          <Input
            value={draft.decisao_clinica?.output?.tecnica_preferida || ""}
            onChange={(v) => set("decisao_clinica.output.tecnica_preferida", v)}
          />
        </Field>
      </div>

      <Field label="Diagnóstico Principal">
        <Input
          value={draft.diagnostico?.principal || ""}
          onChange={(v) => set("diagnostico.principal", v)}
        />
      </Field>

      <Field label="Explicação da Decisão">
        <Textarea
          value={draft.decisao_clinica?.output?.explicacao || ""}
          onChange={(v) => set("decisao_clinica.output.explicacao", v)}
          rows={3}
        />
      </Field>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={() => onSave(draft)} style={btn(T.green)}>
          💾 Salvar alterações
        </button>
        <button onClick={onCancel} style={btn(T.red)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".09em",
          marginBottom: 5,
        }}
      >
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
        width: "100%",
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        color: T.text,
        fontSize: 12,
        outline: "none",
        boxSizing: "border-box",
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
        width: "100%",
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        color: T.text,
        fontSize: 12,
        outline: "none",
        resize: "vertical",
        boxSizing: "border-box",
        lineHeight: 1.6,
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
        width: "100%",
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        color: T.text,
        fontSize: 12,
        outline: "none",
        boxSizing: "border-box",
      }}
    >
      <option value="">—</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function btn(color) {
  return {
    padding: "9px 15px",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800,
    background: `${color}12`,
    border: `1px solid ${color}35`,
    color,
  };
}
