import { Fragment } from "react";
import { T } from "../constants/theme";

export default function CaseVersionDiff({ currentCase, oldCase }) {
  if (!currentCase || !oldCase) return null;

  const rows = [
    ["Título", currentCase.meta?.titulo, oldCase.meta?.titulo],
    ["Região", currentCase.meta?.regiao, oldCase.meta?.regiao],
    ["Nível", currentCase.meta?.nivel, oldCase.meta?.nivel],
    ["AO/OTA", currentCase.classificacao?.ao_ota?.codigo, oldCase.classificacao?.ao_ota?.codigo],
    ["Gravidade", currentCase.classificacao?.ao_ota?.gravidade, oldCase.classificacao?.ao_ota?.gravidade],
    ["Diagnóstico", currentCase.diagnostico?.principal, oldCase.diagnostico?.principal],
    ["Conduta", currentCase.decisao_clinica?.output?.conduta, oldCase.decisao_clinica?.output?.conduta],
    ["Urgência", currentCase.decisao_clinica?.output?.nivel_urgencia, oldCase.decisao_clinica?.output?.nivel_urgencia],
    ["Técnica", currentCase.decisao_clinica?.output?.tecnica_preferida, oldCase.decisao_clinica?.output?.tecnica_preferida],
    ["Flashcards", currentCase.flashcards?.length, oldCase.flashcards?.length],
    ["Passos cirúrgicos", currentCase.cirurgia?.passo_a_passo?.length, oldCase.cirurgia?.passo_a_passo?.length],
    ["Fases reabilitação", currentCase.reabilitacao?.length, oldCase.reabilitacao?.length],
    ["Resumo", currentCase.output_app?.resumo, oldCase.output_app?.resumo, true],
  ];

  const changedCount = rows.filter((r) => String(r[1] ?? "") !== String(r[2] ?? "")).length;

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
          marginBottom: 10,
        }}
      >
        Comparação de versões · {changedCount} alteração(ões)
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr 1fr",
          gap: 8,
        }}
      >
        <Header>Campo</Header>
        <Header>Atual</Header>
        <Header>Antiga</Header>

        {rows.map(([label, current, old, multiline]) => {
          const changed = String(current ?? "") !== String(old ?? "");

          return (
            <Fragment key={label}>
              <LabelCell>{label}</LabelCell>
              <ValueCell changed={changed} multiline={multiline}>
                {String(current ?? "—")}
              </ValueCell>
              <ValueCell changed={changed} multiline={multiline}>
                {String(old ?? "—")}
              </ValueCell>
            </Fragment>
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
        padding: "0 4px 8px",
      }}
    >
      {children}
    </div>
  );
}

function LabelCell({ children }) {
  return (
    <div
      style={{
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: 10,
        fontSize: 11,
        fontWeight: 800,
        color: T.text,
      }}
    >
      {children}
    </div>
  );
}

function ValueCell({ children, changed, multiline }) {
  return (
    <div
      style={{
        background: changed ? "rgba(245,158,11,.08)" : T.s2,
        border: `1px solid ${changed ? "rgba(245,158,11,.28)" : T.border}`,
        borderRadius: 10,
        padding: 10,
        fontSize: 11,
        lineHeight: multiline ? 1.7 : 1.4,
        color: changed ? "#fde68a" : T.muted,
        whiteSpace: multiline ? "pre-wrap" : "normal",
      }}
    >
      {children}
    </div>
  );
}
