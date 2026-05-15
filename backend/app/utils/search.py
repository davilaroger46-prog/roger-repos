def build_search_text(case_json: dict) -> str:
    parts = [
        case_json.get("meta", {}).get("titulo", ""),
        case_json.get("meta", {}).get("regiao", ""),
        case_json.get("classificacao", {}).get("ao_ota", {}).get("codigo", ""),
        case_json.get("diagnostico", {}).get("principal", ""),
        case_json.get("diagnostico", {}).get("diferencial", ""),
        case_json.get("decisao_clinica", {}).get("output", {}).get("justificativa", ""),
        case_json.get("output_app", {}).get("resumo", ""),
        " ".join(
            f.get("titulo", "") + " " + f.get("frente", "") + " " + f.get("verso", "")
            for f in (case_json.get("flashcards") or [])
        ),
    ]
    return " ".join(p for p in parts if p).lower()
