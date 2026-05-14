import { useState } from "react";
import { T } from "../constants/theme";
import { reviewCase } from "../services/api";

const CHECKLIST = [
  {
    category: "Diagnóstico",
    items: [
      { id: "diagnostico_confere", label: "Diagnóstico principal está correto e bem descrito" },
      { id: "classificacao_confere", label: "Classificação AO/OTA confere com o quadro clínico" },
      { id: "diferenciais_confere", label: "Diagnósticos diferenciais são clinicamente plausíveis" },
    ],
  },
  {
    category: "Conduta clínica",
    items: [
      { id: "conduta_confere", label: "Conduta proposta (conservador/cirúrgico) está adequada" },
      { id: "urgencia_confere", label: "Nível de urgência está correto" },
      { id: "tecnica_confere", label: "Técnica cirúrgica descrita é adequada para o caso" },
    ],
  },
  {
    category: "Detalhamento médico",
    items: [
      { id: "cirurgia_revisada", label: "Passo a passo cirúrgico está completo e seguro" },
      { id: "implantes_confere", label: "Implantes e materiais descritos são apropriados" },
      { id: "reabilitacao_revisada", label: "Protocolo de reabilitação é adequado (4 fases)" },
    ],
  },
  {
    category: "Segurança e evidência",
    items: [
      { id: "complicacoes_revisadas", label: "Complicações potenciais foram devidamente listadas" },
      { id: "evidencias_revisadas", label: "Referências bibliográficas são válidas e atuais" },
      { id: "red_flags_revisados", label: "Red flags e alertas clínicos estão presentes" },
    ],
  },
  {
    category: "Material educacional",
    items: [
      { id: "flashcards_confere", label: "Flashcards (8) são didáticos e clinicamente corretos" },
      { id: "resumo_confere", label: "Resumo do output_app está claro e preciso" },
    ],
  },
];

const ALL_IDS = CHECKLIST.flatMap((g) => g.items.map((i) => i.id));

export default function ReviewPanel({ caseId, user, onReviewed }) {
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!caseId) return null;
  if (!["reviewer", "admin"].includes(user?.role)) return null;

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const allChecked = ALL_IDS.every((id) => checked[id]);
  const checkedCount = ALL_IDS.filter((id) => checked[id]).length;

  const submit = async (status) => {
    try {
      setLoading(true);
      await reviewCase(caseId, { status, notes });
      setNotes("");
      setChecked({});
      onReviewed?.(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.s1, border: `1px solid ${T.purple}35`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: T.purple, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Painel de revisão médica
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: T.muted }}>Checklist de aprovação</span>
          <span style={{ fontSize: 11, color: allChecked ? T.green : T.amber, fontWeight: 700 }}>
            {checkedCount}/{ALL_IDS.length}
          </span>
        </div>
        <div style={{ height: 4, background: T.border, borderRadius: 99 }}>
          <div style={{
            height: 4, borderRadius: 99,
            background: allChecked ? T.green : T.amber,
            width: `${(checkedCount / ALL_IDS.length) * 100}%`,
            transition: "width .3s ease",
          }} />
        </div>
      </div>

      {/* Checklist por categoria */}
      {CHECKLIST.map((group) => (
        <div key={group.category} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.cyan, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
            {group.category}
          </div>
          {group.items.map((item) => (
            <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => toggle(item.id)}
                style={{ marginTop: 2, accentColor: T.purple, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: checked[item.id] ? T.text : T.muted, lineHeight: 1.4 }}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      ))}

      {/* Notas */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas da revisão (obrigatório para rejeição)..."
        rows={3}
        style={{
          width: "100%", background: T.s2, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: 12, color: T.text, fontSize: 12,
          outline: "none", resize: "vertical", marginBottom: 10, marginTop: 4,
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={loading || !allChecked}
          onClick={() => submit("approved")}
          title={!allChecked ? "Complete o checklist para aprovar" : ""}
          style={btn(T.green, loading || !allChecked)}
        >
          ✅ Aprovar
        </button>
        <button
          disabled={loading || !notes.trim()}
          onClick={() => submit("rejected")}
          title={!notes.trim() ? "Adicione notas para rejeitar" : ""}
          style={btn(T.red, loading || !notes.trim())}
        >
          ❌ Rejeitar
        </button>
      </div>

      {!allChecked && (
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
          Complete todos os {ALL_IDS.length} itens do checklist para aprovar.
        </div>
      )}
    </div>
  );
}

function btn(color, disabled) {
  return {
    padding: "9px 13px", borderRadius: 9,
    cursor: disabled ? "not-allowed" : "pointer",
    background: `${color}12`, border: `1px solid ${color}35`,
    color, fontSize: 12, fontWeight: 900,
    opacity: disabled ? 0.45 : 1,
  };
}
