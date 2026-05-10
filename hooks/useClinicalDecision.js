import { useMemo } from "react";

export function useClinicalDecision(data, decision) {
  return useMemo(() => {
    const output = decision || data?.decisao_clinica?.output;

    const isEmergency =
      data?.decisao_clinica?.input?.deficit_neurovascular ||
      data?.decisao_clinica?.input?.fratura_exposta;

    const riskLevel = output?.nivel_urgencia || "baixa";

    return {
      output,
      isEmergency,
      riskLevel,
      riskClass:
        riskLevel === "critica"
          ? "case-critical"
          : riskLevel === "alta"
          ? "case-high"
          : riskLevel === "moderada"
          ? "case-moderate"
          : "case-low",
    };
  }, [data, decision]);
}
