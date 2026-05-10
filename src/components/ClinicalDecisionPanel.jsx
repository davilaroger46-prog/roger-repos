import { useClinicalDecision } from "../hooks/useClinicalDecision";

export default function ClinicalDecisionPanel({ data, decision }) {
  const { output, isEmergency, riskClass } =
    useClinicalDecision(data, decision);

  if (!output) return null;

  return (
    <div className={`card decision-card ${riskClass}`}>

      {isEmergency && (
        <div className="emergency-banner">
          🚨 Emergência: intervenção imediata necessária
        </div>
      )}

      <div className="decision-label">Conduta</div>

      <div className="decision-main">
        {output.conduta === "cirurgico"
          ? "🔪 Cirúrgico"
          : "🩹 Conservador"}
      </div>

      <div className="decision-technique">
        {output.tecnica_preferida}
      </div>

      <p style={{ marginTop: 10, fontSize: 13 }}>
        {output.explicacao}
      </p>

      {output.alertas?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {output.alertas.map((a, i) => (
            <div key={i} className="alert">
              ⚠️ {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
