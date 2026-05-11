import { T } from "../constants/theme";

export default function CaseVersionDiff({
  currentCase,
  oldCase,
}) {
  if (!currentCase || !oldCase) return null;

  const rows = [
    {
      label: "Título",
      current: currentCase.meta?.titulo,
      old: oldCase.meta?.titulo,
    },
    {
      label: "Código AO/OTA",
      current: currentCase.classificacao?.ao_ota?.codigo,
      old: oldCase.classificacao?.ao_ota?.codigo,
    },
    {
      label: "Diagnóstico",
      current: currentCase.diagnostico?.principal,
      old: oldCase.diagnostico?.principal,
    },
    {
      label: "Conduta",
      current: currentCase.decisao_clinica?.output?.conduta,
      old: oldCase.decisao_clinica?.output?.conduta,
    },
    {
      label: "Urgência",
      current: currentCase.decisao_clinica?.output?.nivel_urgencia,
      old: oldCase.decisao_clinica?.output?.nivel_urgencia,
    },
    {
      label: "Técnica",
      current: currentCase.decisao_clinica?.output?.tecnica_preferida,
      old: oldCase.decisao_clinica?.output?.tecnica_preferida,
    },
    {
      label: "Resumo",
      current: currentCase.output_app?.resumo,
      old: oldCase.output_app?.resumo,
      multiline: true,
    },
  ];

  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.purple}35`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.purple,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 14,
        }}
      >
        Comparação de versões
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 1fr",
          gap: 10,
        }}
      >
        <Header>Campo</Header>
        <Header>Versão Atual</Header>
        <Header>Versão Antiga</Header>

        {rows.map((r) => {
          const changed =
            JSON.stringify(r.current) !== JSON.stringify(r.old);

          return (
            <>
              <CellLabel key={r.label}>
                {r.label}
              </CellLabel>

              <Cell
                changed={changed}
                multiline={r.multiline}
              >
                {String(r.current || "—")}
              </Cell>

              <Cell
                changed={changed}
                multiline={r.multiline}
              >
                {String(r.old || "—")}
              </Cell>
            </>
          );
        })}
      </div>
    </div>
  );
}

function Header({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: T.muted,
        fontWeight: 800,
        textTransform: "uppercase",
        paddingBottom: 8,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {children}
    </div>
  );
}

function CellLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: T.text,
        fontWeight: 700,
        padding: 10,
        background: T.s2,
        borderRadius: 10,
      }}
    >
      {children}
    </div>
  );
}

function Cell({
  children,
  changed,
  multiline,
}) {
  return (
    <div
      style={{
        fontSize: 11,
        color: changed ? "#fde68a" : T.muted,
        background: changed
          ? "rgba(245,158,11,.08)"
          : T.s2,
        border: `1px solid ${
          changed
            ? "rgba(245,158,11,.25)"
            : T.border
        }`,
        borderRadius: 10,
        padding: 10,
        lineHeight: multiline ? 1.7 : 1.4,
        whiteSpace: multiline ? "pre-wrap" : "normal",
      }}
    >
      {children}
    </div>
  );
}
