import { useState } from "react";
import { T } from "../constants/theme";
import CaseValidationPanel from "./CaseValidationPanel";

const getValidationErrors = (caseData) => {
  const errors = [];

  if ((caseData.flashcards?.length || 0) !== 8) {
    errors.push("Flashcards precisam ser exatamente 8.");
  }

  if ((caseData.cirurgia?.passo_a_passo?.length || 0) !== 6) {
    errors.push("Passos cirúrgicos precisam ser exatamente 6.");
  }

  if ((caseData.reabilitacao?.length || 0) !== 4) {
    errors.push("Reabilitação precisa ter exatamente 4 fases.");
  }

  if ((caseData.tratamento?.cirurgico?.tecnicas?.length || 0) !== 3) {
    errors.push("Técnicas cirúrgicas precisam ser exatamente 3.");
  }

  if ((caseData.decisao_clinica?.regras?.length || 0) < 4) {
    errors.push("Decisão clínica precisa ter pelo menos 4 regras.");
  }

  if ((caseData.exame_fisico?.inspecao?.length || 0) < 4) {
    errors.push("Inspeção precisa ter pelo menos 4 itens.");
  }

  if ((caseData.exame_fisico?.palpacao?.length || 0) < 4) {
    errors.push("Palpação precisa ter pelo menos 4 itens.");
  }

  if ((caseData.exame_fisico?.red_flags?.length || 0) < 3) {
    errors.push("Red flags precisam ter pelo menos 3 itens.");
  }

  return errors;
};

export default function CaseVisualEditor({
  caso,
  onCancel,
  onSave,
  onAutoCorrect,
}) {
  const [draft, setDraft] = useState(() =>
    JSON.parse(JSON.stringify(caso))
  );
  const [autoFixing, setAutoFixing] = useState(false);

  const validationErrors = getValidationErrors(draft);
  const canSave = validationErrors.length === 0;

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

      <CaseValidationPanel caso={draft} />

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

      <Section title="Imagem">
        <ListEditor
          label="Achados no RX"
          items={draft.imagem?.rx?.achados || []}
          onChange={(v) => update("imagem.rx.achados", v)}
        />

        <SelectField
          label="TC indicada?"
          value={String(draft.imagem?.tc?.indicado)}
          options={["true", "false"]}
          onChange={(v) => update("imagem.tc.indicado", v === "true")}
        />

        <TextAreaField
          label="Quando solicitar TC"
          value={draft.imagem?.tc?.quando}
          onChange={(v) => update("imagem.tc.quando", v)}
        />

        <SelectField
          label="RM indicada?"
          value={String(draft.imagem?.rm?.indicado)}
          options={["true", "false"]}
          onChange={(v) => update("imagem.rm.indicado", v === "true")}
        />

        <ListEditor
          label="Achados na RM"
          items={draft.imagem?.rm?.achados || []}
          onChange={(v) => update("imagem.rm.achados", v)}
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

      <Section title="Medicamentos">
        <ObjectListEditor
          label="Medicamentos do tratamento conservador"
          items={draft.tratamento?.conservador?.medicamentos || []}
          onChange={(v) => update("tratamento.conservador.medicamentos", v)}
          addLabel="+ Adicionar medicamento"
          createItem={() => ({
            nome: "",
            dose: "",
            via: "VO",
            intervalo: "",
            duracao: "",
          })}
          renderItem={(m, index, updateItem) => (
            <>
              <Field
                label="Nome"
                value={m.nome}
                onChange={(v) => updateItem(index, { nome: v })}
              />

              <Field
                label="Dose"
                value={m.dose}
                onChange={(v) => updateItem(index, { dose: v })}
              />

              <SelectField
                label="Via"
                value={m.via}
                options={["VO", "IV", "IM", "SC"]}
                onChange={(v) => updateItem(index, { via: v })}
              />

              <Field
                label="Intervalo"
                value={m.intervalo}
                onChange={(v) => updateItem(index, { intervalo: v })}
              />

              <Field
                label="Duração"
                value={m.duracao}
                onChange={(v) => updateItem(index, { duracao: v })}
              />
            </>
          )}
        />
      </Section>

      <Section title="Passo a passo cirúrgico">
        <ObjectListEditor
          label="Passos cirúrgicos"
          items={draft.cirurgia?.passo_a_passo || []}
          onChange={(v) => update("cirurgia.passo_a_passo", v)}
          min={6} max={6}
          addLabel="+ Adicionar passo"
          createItem={() => ({
            ordem: (draft.cirurgia?.passo_a_passo?.length || 0) + 1,
            titulo: "",
            descricao: "",
            ponto_critico: "",
          })}
          renderItem={(p, index, updateItem) => (
            <>
              <Field
                label="Ordem"
                type="number"
                value={p.ordem}
                onChange={(v) => updateItem(index, { ordem: Number(v) })}
              />

              <Field
                label="Título"
                value={p.titulo}
                onChange={(v) => updateItem(index, { titulo: v })}
              />

              <TextAreaField
                label="Descrição"
                value={p.descricao}
                onChange={(v) => updateItem(index, { descricao: v })}
              />

              <TextAreaField
                label="Ponto crítico"
                value={p.ponto_critico}
                onChange={(v) => updateItem(index, { ponto_critico: v })}
              />
            </>
          )}
        />
      </Section>

      <Section title="Técnicas cirúrgicas">
        <ObjectListEditor
          label="Técnicas"
          items={draft.tratamento?.cirurgico?.tecnicas || []}
          onChange={(v) => update("tratamento.cirurgico.tecnicas", v)}
          min={3} max={3}
          addLabel="+ Adicionar técnica"
          createItem={() => ({
            nome: "",
            quando_usar: "",
            vantagens: [],
            desvantagens: [],
          })}
          renderItem={(t, index, updateItem) => (
            <>
              <Field
                label="Nome da técnica"
                value={t.nome}
                onChange={(v) => updateItem(index, { nome: v })}
              />

              <TextAreaField
                label="Quando usar"
                value={t.quando_usar}
                onChange={(v) => updateItem(index, { quando_usar: v })}
              />

              <ListEditor
                label="Vantagens"
                items={t.vantagens || []}
                onChange={(v) => updateItem(index, { vantagens: v })}
              />

              <ListEditor
                label="Desvantagens"
                items={t.desvantagens || []}
                onChange={(v) => updateItem(index, { desvantagens: v })}
              />
            </>
          )}
        />
      </Section>

      <Section title="Reabilitação">
        <ObjectListEditor
          label="Fases de reabilitação"
          items={draft.reabilitacao || []}
          onChange={(v) => update("reabilitacao", v)}
          min={4} max={4}
          addLabel="+ Adicionar fase"
          createItem={() => ({
            fase: "",
            periodo: "",
            objetivo: "",
            exercicios: [],
            restricoes: [],
          })}
          renderItem={(f, index, updateItem) => (
            <>
              <Field
                label="Fase"
                value={f.fase}
                onChange={(v) => updateItem(index, { fase: v })}
              />

              <Field
                label="Período"
                value={f.periodo}
                onChange={(v) => updateItem(index, { periodo: v })}
              />

              <TextAreaField
                label="Objetivo"
                value={f.objetivo}
                onChange={(v) => updateItem(index, { objetivo: v })}
              />

              <ListEditor
                label="Exercícios"
                items={f.exercicios || []}
                onChange={(v) => updateItem(index, { exercicios: v })}
              />

              <ListEditor
                label="Restrições"
                items={f.restricoes || []}
                onChange={(v) => updateItem(index, { restricoes: v })}
              />
            </>
          )}
        />
      </Section>

      <Section title="Complicações">
        <ListEditor
          label="Complicações precoces"
          items={draft.complicacoes?.precoces || []}
          onChange={(v) => update("complicacoes.precoces", v)}
        />

        <ListEditor
          label="Complicações tardias"
          items={draft.complicacoes?.tardias || []}
          onChange={(v) => update("complicacoes.tardias", v)}
        />

        <ListEditor
          label="Prevenção"
          items={draft.complicacoes?.prevencao || []}
          onChange={(v) => update("complicacoes.prevencao", v)}
        />
      </Section>

      <Section title="Flashcards">
        <ObjectListEditor
          label="Flashcards de residência"
          items={draft.flashcards || []}
          onChange={(v) => update("flashcards", v)}
          min={8} max={8}
          addLabel="+ Adicionar flashcard"
          createItem={() => ({
            pergunta: "",
            resposta: "",
          })}
          renderItem={(f, index, updateItem) => (
            <>
              <TextAreaField
                label="Pergunta"
                value={f.pergunta}
                onChange={(v) => updateItem(index, { pergunta: v })}
              />

              <TextAreaField
                label="Resposta"
                value={f.resposta}
                onChange={(v) => updateItem(index, { resposta: v })}
              />
            </>
          )}
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

        <ListEditor
          label="Riscos principais"
          items={draft.output_app?.riscos || []}
          onChange={(v) => update("output_app.riscos", v)}
        />
      </Section>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={() => {
            if (!canSave) return;
            onSave(draft);
          }}
          disabled={!canSave}
          style={{
            ...buttonStyle(canSave ? T.green : T.muted),
            cursor: canSave ? "pointer" : "not-allowed",
            opacity: canSave ? 1 : 0.45,
          }}
        >
          💾 Salvar alterações
        </button>

        {onAutoCorrect && (
          <button
            disabled={autoFixing}
            onClick={async () => {
              try {
                setAutoFixing(true);
                const corrected = await onAutoCorrect(draft);
                setDraft(corrected);
              } finally {
                setAutoFixing(false);
              }
            }}
            style={{
              ...buttonStyle(T.blue),
              opacity: autoFixing ? 0.5 : 1,
              cursor: autoFixing ? "not-allowed" : "pointer",
            }}
          >
            {autoFixing ? "🤖 Corrigindo..." : "🤖 Autocorrigir com IA"}
          </button>
        )}

        <button onClick={onCancel} style={buttonStyle(T.red)}>
          Cancelar
        </button>
      </div>

      {validationErrors.length > 0 && (
        <div
          style={{
            background: "rgba(225,29,72,.07)",
            border: "1px solid rgba(225,29,72,.25)",
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
            color: "#fca5a5",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          <strong>Corrija antes de salvar:</strong>

          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
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

function ObjectListEditor({
  label,
  items = [],
  onChange,
  createItem,
  renderItem,
  addLabel = "+ Adicionar",
  min,
  max,
}) {
  const count = items?.length || 0;
  const underMin = min !== undefined && count < min;
  const overMax = max !== undefined && count > max;
  const countColor = underMin || overMax ? T.red : T.green;
  const updateItem = (index, patch) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      ...patch,
    };
    onChange(next);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...(items || []), createItem()]);
  };

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={labelText}>{label}</div>
        {(min !== undefined || max !== undefined) && (
          <span style={{ fontSize: 10, fontWeight: 800, color: countColor }}>
            {count}{min !== undefined ? `/${min}` : ""}{max !== undefined && max !== min ? `–${max}` : ""}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
        {items?.map((item, index) => (
          <div
            key={index}
            style={{
              background: T.s3,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <strong style={{ fontSize: 12, color: T.text }}>
                Item {index + 1}
              </strong>

              <button
                type="button"
                onClick={() => removeItem(index)}
                style={smallButton(T.red)}
              >
                Remover
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}
            >
              {renderItem(item, index, updateItem)}
            </div>
          </div>
        ))}

        <button type="button" onClick={addItem} style={smallButton(T.blue)}>
          {addLabel}
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
