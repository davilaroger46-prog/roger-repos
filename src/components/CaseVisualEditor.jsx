import { useState } from "react";
import { T } from "../constants/theme";

export default function CaseVisualEditor({
  caso,
  onCancel,
  onSave,
}) {
  const [draft, setDraft] = useState(() =>
    JSON.parse(JSON.stringify(caso))
  );

  const update = (path, value) => {
    setDraft((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = copy;

      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }

      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  return (
    <div
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
          color: T.amber,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 14,
        }}
      >
        Editor visual do caso
      </div>

      <Section title="Identificação do caso">
        <Field
          label="Título"
          value={draft.meta?.titulo}
          onChange={(v) => update("meta.titulo", v)}
        />

        <Field
          label="Região"
          value={draft.meta?.regiao}
          onChange={(v) => update("meta.regiao", v)}
        />

        <Field
          label="Subespecialidade"
          value={draft.meta?.subespecialidade}
          onChange={(v) => update("meta.subespecialidade", v)}
        />

        <SelectField
          label="Nível"
          value={draft.meta?.nivel}
          options={["basico", "intermediario", "avancado"]}
          onChange={(v) => update("meta.nivel", v)}
        />
      </Section>

      <Section title="Paciente">
        <SelectField
          label="Sexo"
          value={draft.paciente?.sexo}
          options={["Masculino", "Feminino"]}
          onChange={(v) => update("paciente.sexo", v)}
        />

        <Field
          label="Idade"
          type="number"
          value={draft.paciente?.idade}
          onChange={(v) => update("paciente.idade", Number(v))}
        />

        <Field
          label="Atividade"
          value={draft.paciente?.atividade}
          onChange={(v) => update("paciente.atividade", v)}
        />

        <SelectField
          label="Lado"
          value={draft.paciente?.lado}
          options={["Direito", "Esquerdo", "Bilateral"]}
          onChange={(v) => update("paciente.lado", v)}
        />

        <SelectField
          label="Demanda funcional"
          value={draft.paciente?.demanda_funcional}
          options={["baixa", "moderada", "alta"]}
          onChange={(v) => update("paciente.demanda_funcional", v)}
        />
      </Section>

      <Section title="História clínica">
        <Field
          label="Queixa principal"
          value={draft.historia?.queixa_principal}
          onChange={(v) => update("historia.queixa_principal", v)}
        />

        <SelectField
          label="Início"
          value={draft.historia?.inicio}
          options={["agudo", "subagudo", "cronico"]}
          onChange={(v) => update("historia.inicio", v)}
        />

        <Field
          label="Tempo de evolução"
          value={draft.historia?.tempo_evolucao}
          onChange={(v) => update("historia.tempo_evolucao", v)}
        />

        <TextAreaField
          label="Mecanismo de lesão"
          value={draft.historia?.mecanismo_lesao}
          onChange={(v) => update("historia.mecanismo_lesao", v)}
        />

        <TextAreaField
          label="Descrição"
          value={draft.historia?.descricao}
          onChange={(v) => update("historia.descricao", v)}
        />
      </Section>

      <Section title="Classificação AO/OTA">
        <Field
          label="Código AO/OTA"
          value={draft.classificacao?.ao_ota?.codigo}
          onChange={(v) => update("classificacao.ao_ota.codigo", v)}
        />

        <Field
          label="Osso"
          value={draft.classificacao?.ao_ota?.osso}
          onChange={(v) => update("classificacao.ao_ota.osso", v)}
        />

        <Field
          label="Segmento"
          value={draft.classificacao?.ao_ota?.segmento}
          onChange={(v) => update("classificacao.ao_ota.segmento", v)}
        />

        <SelectField
          label="Tipo"
          value={draft.classificacao?.ao_ota?.tipo}
          options={["A", "B", "C"]}
          onChange={(v) => update("classificacao.ao_ota.tipo", v)}
        />

        <SelectField
          label="Gravidade"
          value={draft.classificacao?.ao_ota?.gravidade}
          options={["baixa", "moderada", "alta"]}
          onChange={(v) => update("classificacao.ao_ota.gravidade", v)}
        />

        <TextAreaField
          label="Descrição AO/OTA"
          value={draft.classificacao?.ao_ota?.descricao}
          onChange={(v) => update("classificacao.ao_ota.descricao", v)}
        />
      </Section>

      <Section title="Diagnóstico">
        <Field
          label="Diagnóstico principal"
          value={draft.diagnostico?.principal}
          onChange={(v) => update("diagnostico.principal", v)}
        />

        <SelectField
          label="Confirmação"
          value={draft.diagnostico?.confirmacao}
          options={["clinico", "imagem", "combinado"]}
          onChange={(v) => update("diagnostico.confirmacao", v)}
        />
      </Section>

      <Section title="Exame físico">
        <ListEditor
          label="Inspeção"
          items={draft.exame_fisico?.inspecao || []}
          onChange={(v) => update("exame_fisico.inspecao", v)}
        />

        <ListEditor
          label="Palpação"
          items={draft.exame_fisico?.palpacao || []}
          onChange={(v) => update("exame_fisico.palpacao", v)}
        />

        <TextAreaField
          label="Movimento / ROM"
          value={draft.exame_fisico?.movimento}
          onChange={(v) => update("exame_fisico.movimento", v)}
        />

        <ListEditor
          label="Red flags"
          items={draft.exame_fisico?.red_flags || []}
          onChange={(v) => update("exame_fisico.red_flags", v)}
        />
      </Section>

      <Section title="Diagnósticos diferenciais">
        <ListEditor
          label="Diferenciais"
          items={draft.diagnostico?.diferenciais || []}
          onChange={(v) => update("diagnostico.diferenciais", v)}
          placeholder="Ex: entorse radiocárpica, fratura do escafoide..."
        />
      </Section>

      <Section title="Decisão clínica">
        <SelectField
          label="Conduta"
          value={draft.decisao_clinica?.output?.conduta}
          options={["conservador", "cirurgico", "urgente"]}
          onChange={(v) => update("decisao_clinica.output.conduta", v)}
        />

        <SelectField
          label="Urgência"
          value={draft.decisao_clinica?.output?.nivel_urgencia}
          options={["baixa", "moderada", "alta", "critica"]}
          onChange={(v) => update("decisao_clinica.output.nivel_urgencia", v)}
        />

        <Field
          label="Técnica preferida"
          value={draft.decisao_clinica?.output?.tecnica_preferida}
          onChange={(v) => update("decisao_clinica.output.tecnica_preferida", v)}
        />

        <TextAreaField
          label="Explicação"
          value={draft.decisao_clinica?.output?.explicacao}
          onChange={(v) => update("decisao_clinica.output.explicacao", v)}
        />
      </Section>

      <Section title="Output do app">
        <Field
          label="Diagnóstico resumido"
          value={draft.output_app?.diagnostico}
          onChange={(v) => update("output_app.diagnostico", v)}
        />

        <Field
          label="Conduta resumida"
          value={draft.output_app?.conduta}
          onChange={(v) => update("output_app.conduta", v)}
        />

        <Field
          label="Técnica resumida"
          value={draft.output_app?.tecnica}
          onChange={(v) => update("output_app.tecnica", v)}
        />

        <TextAreaField
          label="Resumo executivo"
          value={draft.output_app?.resumo}
          onChange={(v) => update("output_app.resumo", v)}
        />
      </Section>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => onSave(draft)} style={buttonStyle(T.green)}>
          💾 Salvar alterações
        </button>

        <button onClick={onCancel} style={buttonStyle(T.red)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section
      style={{
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.cyan,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label style={labelStyle}>
      <span style={labelText}>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label style={labelStyle}>
      <span style={labelText}>{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      >
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
      <span style={labelText}>{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{
          ...inputStyle,
          resize: "vertical",
          lineHeight: 1.6,
        }}
      />
    </label>
  );
}

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const labelText = {
  fontSize: 10,
  color: T.muted,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".07em",
};

const inputStyle = {
  width: "100%",
  background: T.s3,
  border: `1px solid ${T.border}`,
  borderRadius: 9,
  padding: "9px 10px",
  color: T.text,
  fontSize: 12,
  outline: "none",
  fontFamily: "inherit",
};

function buttonStyle(color) {
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

function ListEditor({ label, items = [], onChange, placeholder = "Novo item" }) {
  const updateItem = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const addItem = () => {
    onChange([...(items || []), ""]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <div style={labelText}>{label}</div>

      <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
        {items?.map((item, index) => (
          <div key={index} style={{ display: "flex", gap: 8 }}>
            <input
              value={item ?? ""}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              style={inputStyle}
            />

            <button
              onClick={() => removeItem(index)}
              type="button"
              style={smallButton(T.red)}
            >
              ×
            </button>
          </div>
        ))}

        <button onClick={addItem} type="button" style={smallButton(T.blue)}>
          + Adicionar item
        </button>
      </div>
    </div>
  );
}

function smallButton(color) {
  return {
    padding: "8px 11px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800,
    background: `${color}12`,
    border: `1px solid ${color}35`,
    color,
    whiteSpace: "nowrap",
  };
}
