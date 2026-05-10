def ao_decision_engine(data):
    alerts = []

    if data.get("deficit_neurovascular"):
        alerts.append("Déficit neurovascular — emergência absoluta")

    if data.get("fratura_exposta"):
        alerts.append("Fratura exposta — risco infeccioso")

    if data.get("instabilidade"):
        alerts.append("Instabilidade articular — alto risco")

    if data["desvio_mm"] > 2 or data.get("deficit_extensor"):
        conduta = "cirurgico"
        tecnica = "Placa LCP 3.5mm"
    else:
        conduta = "conservador"
        tecnica = "Imobilização + reavaliação"

    urgencia = "alta" if alerts else "moderada"

    return {
        "conduta": conduta,
        "nivel_urgencia": urgencia,
        "tecnica_preferida": tecnica,
        "alertas": alerts,
        "explicacao": "Baseado em AO/OTA + critérios clínicos"
    }
