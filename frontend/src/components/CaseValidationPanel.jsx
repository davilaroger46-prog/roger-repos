import { T } from "../constants/theme";

export default function CaseValidationPanel({ caso }) {
  if (!caso) return null;

  const checks = [
    {
      label: "Flashcards",
      current: caso.flashcards?.length || 0,
      expected: 8,
    },
    {
      label: "Passos cirúrgicos",
      current: caso.cirurgia?.passo_a_passo?.length || 0,
      expected: 6,
    },
    {
      label: "Fases de reabilitação",
      current: caso.reabilitacao?.length || 0,
      expected: 4,
    },
    {
      label: "Técnicas cirúrgicas",
      current: caso.tratamento?.cirurgico?.tecnicas?.length || 0,
      expected: 3,
    },
    {
      label: "Regras de decisão",
      current: caso.decisao_clinica?.regras?.length || 0,
      expected: 4,
      minOnly: true,
    },
    {
      label: "Inspeção",
      current: caso.exame_fisico?.inspecao?.length || 0,
      expected: 4,
      minOnly: true,
    },
    {
      label: "Palpação",
      current: caso.exame_fisico?.palpacao?.length || 0,
      expected: 4,
      minOnly: true,
    },
    {
      label: "Red flags",
      current: caso.exame_fisico?.red_flags?.length || 0,
      expected: 3,
      minOnly: true,
    },
  ];

  const hasError = checks.some((c) =>
    c.minOnly ? c.current < c.expected : c.current !== c.expected
  );

  return (
    <div
      style={{
        background: hasError ? "rgba(225,29,72,.07)" : "rgba(16,185,129,.07)",
        border: `1px solid ${
          hasError ? "rgba(225,29,72,.25)" : "rgba(16,185,129,.25)"
        }`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: hasError ? T.red : T.green,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 10,
        }}
      >
        {hasError ? "⚠️ Validação incompleta" : "✅ Caso pronto para salvar"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
        }}
      >
        {checks.map((c) => {
          const ok = c.minOnly
            ? c.current >= c.expected
            : c.current === c.expected;

          return (
            <div
              key={c.label}
              style={{
                background: T.s2,
                border: `1px solid ${ok ? T.green + "35" : T.red + "35"}`,
                borderRadius: 10,
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: T.muted,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                {c.label}
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: ok ? T.green : T.red,
                }}
              >
                {c.current}/{c.expected}
                {c.minOnly ? "+" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
