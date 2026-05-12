"""
ao_engine.py - Motor de Decisão Clínica AO/OTA
OrthoStudy v2.0

Lógica médica isolada da camada de API.
Testável independentemente do FastAPI.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from app.core.logging import logger


@dataclass
class DecisionResult:
    conduta: str
    nivel_urgencia: str
    gravidade: str
    tecnica_preferida: str
    implante: str
    alertas: List[str]
    justificativa: str
    explicacao: str


KB: dict = {
    "11": {
        "osso": "Úmero Proximal",
        "articulacao": "Ombro",
        "alerta": None,
        "A": {
            "cons": "Tipoia 2-3 semanas → fisioterapia precoce.",
            "cir": "Placa bloqueada proximal do úmero (PHILOS 3,5 mm).",
            "imp": "Placa PHILOS + parafusos bloqueados de ângulo variável.",
        },
        "B": {
            "cons": "Apenas sem desvio - tipoia + analgesia.",
            "cir": "RAFI com placa PHILOS + suporte medial.",
            "imp": "Placa PHILOS 3,5 mm.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Artroplastia reversa total em idoso/osteoporose ou RAFI em jovem.",
            "imp": "Prótese reversa total do ombro ou placa PHILOS conforme perfil.",
        },
    },
    "12": {
        "osso": "Úmero Diáfise",
        "articulacao": "Úmero",
        "alerta": "Avaliar nervo radial em toda fratura de diáfise umeral.",
        "A": {
            "cons": "Brace funcional de Sarmiento em padrão estável.",
            "cir": "Haste IM anterógrada bloqueada ou placa DCP.",
            "imp": "Haste IM bloqueada anterógrada ou placa DCP.",
        },
        "B": {
            "cons": "Brace funcional em fraturas espirais estáveis selecionadas.",
            "cir": "Placa DCP 4,5 mm ou haste IM bloqueada.",
            "imp": "Placa DCP 4,5 mm ou LC-DCP 3,5 mm.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Placa bloqueada longa + enxerto ósseo se gap.",
            "imp": "Placa bloqueada longa.",
        },
    },
    "21": {
        "osso": "Rádio/Ulna Proximal",
        "articulacao": "Cotovelo",
        "alerta": "Identificar e proteger o nervo ulnar em todos os passos cirúrgicos.",
        "A": {
            "cons": "Mayo I sem desvio e mecanismo extensor íntegro - tala posterior e controle.",
            "cir": "Placa LCP posterior pré-moldada ou banda de tensão.",
            "imp": "Placa LCP posterior 3,5 mm + parafuso longo proximal 4,0 mm.",
        },
        "B": {
            "cons": "Fratura parcial sem desvio + cotovelo estável.",
            "cir": "Redução anatômica + placa posterior. Confirmar estabilidade.",
            "imp": "Placa LCP posterior + parafusos 3,5 mm.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "TC 3D pré-op. Placa longa + reconstrução ligamentar se instável.",
            "imp": "Placa bloqueada longa posterior + âncoras ligamentares.",
        },
    },
    "22": {
        "osso": "Rádio/Ulna Diáfise",
        "articulacao": "Antebraço",
        "alerta": "Sempre avaliar DRUJ e cabeça do rádio - Galeazzi e Monteggia mudam a conduta.",
        "A": {
            "cons": "Fratura isolada da ulna sem desvio pode ser conservadora em casos selecionados.",
            "cir": "Placa DCP 3,5 mm em ambos os ossos quando ambos acometidos.",
            "imp": "Placas DCP/LC-DCP 3,5 mm.",
        },
        "B": {
            "cons": "Não indicado em adultos na maioria dos casos.",
            "cir": "Avaliar Galeazzi e Monteggia. RAFI com placa 3,5 mm.",
            "imp": "Placa 3,5 mm + redução da lesão associada.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Fixação sequencial. TC se fragmentação. Enxerto ósseo se gap.",
            "imp": "Placa bloqueada + enxerto se necessário.",
        },
    },
    "23": {
        "osso": "Rádio Distal",
        "articulacao": "Punho",
        "alerta": None,
        "A": {
            "cons": "Fratura estável sem desvio - gesso antebraquial 4-6 semanas.",
            "cir": "Placa volar bloqueada se instável ou desvio secundário.",
            "imp": "VLP pré-moldada + parafusos bloqueados distais.",
        },
        "B": {
            "cons": "Estiloide sem desvio.",
            "cir": "Parafuso de estiloide ou placa radial em L.",
            "imp": "Parafuso 3,0-3,5 mm ou placa em L radial.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "TC pré-op. VLP + suporte dorsal se cominuição dorsal.",
            "imp": "VLP dupla coluna + enxerto se impactação relevante.",
        },
    },
    "31": {
        "osso": "Fêmur Proximal",
        "articulacao": "Quadril",
        "alerta": "Garden III-IV em jovem exige prioridade. Idoso osteoporótico frequentemente favorece artroplastia.",
        "A": {
            "cons": "Raro - apenas altíssimo risco cirúrgico.",
            "cir": "Haste cefalocondílica, DHS ou TFNA curta.",
            "imp": "DHS ou haste TFNA curta.",
        },
        "B": {
            "cons": "Não indicado em fraturas deslocadas.",
            "cir": "Garden I-II: parafusos canulados. Garden III-IV: artroplastia em idoso ou RAFI em jovem.",
            "imp": "Parafusos canulados 7,3 mm ou prótese conforme perfil.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Haste cefalomedular longa.",
            "imp": "Haste TFNA Advanced longa.",
        },
    },
    "32": {
        "osso": "Fêmur Diáfise",
        "articulacao": "Diáfise Femoral",
        "alerta": None,
        "A": {
            "cons": "Não indicado em adultos.",
            "cir": "Haste IM anterógrada bloqueada - padrão principal.",
            "imp": "Haste IM bloqueada anterógrada.",
        },
        "B": {
            "cons": "Não indicado.",
            "cir": "Haste IM + parafuso interfragmentário em espiral longa.",
            "imp": "Haste IM bloqueada ± cerclagem de proteção.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Haste IM longa. Fixador externo em damage control.",
            "imp": "Haste IM longa com bloqueio distal múltiplo.",
        },
    },
    "41": {
        "osso": "Tíbia Proximal",
        "articulacao": "Joelho",
        "alerta": "Avaliar ligamentos, meniscos e artéria poplítea em fraturas de platô tibial de alta energia.",
        "A": {
            "cons": "Extra-articular sem desvio - possível.",
            "cir": "Placa proximal lateral da tíbia.",
            "imp": "Placa LCP proximal tibial lateral pré-moldada.",
        },
        "B": {
            "cons": "Schatzker I sem desvio.",
            "cir": "Parafusos de compressão + placa de suporte lateral.",
            "imp": "Parafusos 6,5-7,3 mm + placa lateral de suporte.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "TC 3D. Protocolo em 2 tempos se partes moles comprometidas. Dupla placa.",
            "imp": "Dupla placa LCP tibial proximal ± enxerto ósseo.",
        },
    },
    "42": {
        "osso": "Tíbia Diáfise",
        "articulacao": "Diáfise Tibial",
        "alerta": "Monitorar síndrome compartimental; delta-P <30 mmHg sugere fasciotomia urgente.",
        "A": {
            "cons": "Fratura estável sem desvio - gesso longo em casos selecionados.",
            "cir": "Haste IM tibial bloqueada.",
            "imp": "Haste IM tibial bloqueada.",
        },
        "B": {
            "cons": "Apenas padrão estável e sem desvio relevante em paciente selecionado.",
            "cir": "Haste IM bloqueada + parafuso interfragmentário em espirais longas.",
            "imp": "Haste IM bloqueada ± cerclagem.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Haste IM longa. Fixador externo em fratura exposta Gustilo III.",
            "imp": "Haste IM bloqueada longa.",
        },
    },
    "43": {
        "osso": "Tíbia Distal (Pilão)",
        "articulacao": "Tornozelo",
        "alerta": "Partes moles determinam o timing; evitar RAFI definitiva com bolhas/flictenas.",
        "A": {
            "cons": "Metafisário sem articular - possível se desvio mínimo.",
            "cir": "Placa distal medial da tíbia.",
            "imp": "Placa medial distal tibial pré-moldada.",
        },
        "B": {
            "cons": "Não indicado em articular desviada.",
            "cir": "RAFI com preservação de partes moles.",
            "imp": "Placa de suporte + parafusos articulares.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Protocolo 2 tempos: fixador externo ponte + RAFI definitiva após melhora de partes moles.",
            "imp": "Placa bloqueada distal tibial + enxerto ósseo.",
        },
    },
    "44": {
        "osso": "Tornozelo",
        "articulacao": "Tornozelo",
        "alerta": "Weber C frequentemente envolve sindesmose; testar estabilidade e fixar se instável.",
        "A": {
            "cons": "Weber A sem desvio - suporte funcional e apoio conforme dor.",
            "cir": "Raramente. Placa 1/3 tubular se muito desviada.",
            "imp": "Placa 1/3 tubular fibular + parafusos 3,5 mm.",
        },
        "B": {
            "cons": "Weber B estável sem desvio tibiotalar - bota/gesso.",
            "cir": "Placa lateral fibular + parafuso de sindesmose se instável.",
            "imp": "Placa 1/3 tubular ou LCP fibular + parafuso de posição 3,5 mm.",
        },
        "C": {
            "cons": "Não indicado.",
            "cir": "Redução + fixação fibular + avaliação/fixação da sindesmose. Fixar maléolo posterior se indicado.",
            "imp": "Placa fibular + parafuso(s) de sindesmose + fixação maleolar conforme padrão.",
        },
    },
}


def _parse_ao_code(codigo: str) -> tuple[str, str]:
    codigo = str(codigo or "").strip().upper().replace(" ", "")
    if "-" in codigo:
        partes = codigo.split("-")
        segmento = partes[0]
        tipo = partes[1][0] if len(partes) > 1 and partes[1] else "A"
        return segmento, tipo
    if codigo.startswith(("2U1", "2R1")) and len(codigo) >= 4:
        return "21", codigo[3]
    if len(codigo) >= 3 and codigo[:2].isdigit():
        return codigo[:2], codigo[2]
    return "", "A"


def ao_decision_engine(data: dict) -> dict:
    alertas: List[str] = []
    acoes: List[str] = []
    gravidade = "baixa"
    conduta = "conservador"
    urgencia = "baixa"
    tecnica = "Consultar especialista ortopédico."
    implante = "-"

    codigo = str(data.get("codigo_ao") or data.get("ao_code") or "").strip()
    seg, tipo = _parse_ao_code(codigo)
    kb = KB.get(seg)

    if data.get("deficit_neurovascular"):
        gravidade = "critica"
        urgencia = "critica"
        conduta = "urgente"
        alertas.append(
            "⚡ DÉFICIT NEUROVASCULAR - avaliação vascular/neurológica imediata. "
            "Considerar angiotomografia de urgência se pulso ausente ou assimétrico."
        )

    if data.get("fratura_exposta"):
        if gravidade != "critica":
            gravidade = "alta"
            urgencia = "alta"
        conduta = "urgente"
        alertas.append(
            "🩸 FRATURA EXPOSTA - antibioticoterapia IV imediata, classificação Gustilo-Anderson, "
            "desbridamento e estabilização conforme protocolo."
        )

    if kb and kb.get("alerta"):
        alertas.append(f"⚠️ {kb['alerta']}")

    if kb and tipo in kb:
        rule = kb[tipo]
        tecnica = rule.get("cir", tecnica)
        implante = rule.get("imp", implante)
        conservador_base = rule.get("cons", "Avaliação individualizada.")
    else:
        conservador_base = "Avaliação individualizada."

    try:
        desvio_mm = float(data.get("desvio_mm", 0) or 0)
    except (TypeError, ValueError):
        desvio_mm = 0.0

    if tipo == "A":
        if desvio_mm <= 2 and not data.get("instabilidade") and not data.get("deficit_extensor"):
            if conduta != "urgente":
                conduta = "conservador"
                tecnica = conservador_base
            acoes.append(f"AO tipo A com desvio {desvio_mm} mm e estabilidade preservada → conservador possível.")
        else:
            if conduta != "urgente":
                conduta = "cirurgico"
            if gravidade == "baixa":
                gravidade = "moderada"
                urgencia = "moderada"
            acoes.append(f"AO tipo A com desvio {desvio_mm} mm ou instabilidade → tratamento cirúrgico favorecido.")

    elif tipo == "B":
        if conduta != "urgente":
            conduta = "cirurgico"
        if gravidade == "baixa":
            gravidade = "moderada"
            urgencia = "moderada"
        acoes.append("AO tipo B → fratura parcial articular/cunha; avaliar redução anatômica e estabilidade.")
        if data.get("incongruencia_articular"):
            alertas.append(
                "🦴 Incongruência articular - redução anatômica é prioritária para reduzir risco de artrose pós-traumática."
            )
            acoes.append("Incongruência articular → redução anatômica obrigatória.")

    elif tipo == "C":
        if conduta != "urgente":
            conduta = "cirurgico"
        if gravidade != "critica":
            gravidade = "alta"
            urgencia = "alta"
        alertas.append(
            "🔴 AO tipo C - fratura articular completa/complexa. TC 3D e planejamento cirúrgico detalhado."
        )
        acoes.append("AO tipo C → planejamento cirúrgico completo.")

    if data.get("cominuicao") or data.get("osso_osteoporotico"):
        alertas.append(
            "🔩 Cominuição/osteoporose - preferir construção bloqueada e implante de maior estabilidade."
        )
        acoes.append("Cominuição/osteoporose → implante bloqueado favorecido.")
        if implante != "-" and "bloquead" not in implante.lower():
            implante += " + opção bloqueada conforme disponibilidade"

    if data.get("instabilidade") and data.get("demanda_funcional") == "alta":
        if conduta != "urgente":
            conduta = "cirurgico"
        if gravidade == "baixa":
            gravidade = "moderada"
            urgencia = "moderada"
        acoes.append("Alta demanda funcional + instabilidade → cirurgia fortemente favorecida.")

    if data.get("instabilidade") and conduta == "conservador":
        conduta = "cirurgico"
        if gravidade == "baixa":
            gravidade = "moderada"
            urgencia = "moderada"
        alertas.append("⚠️ Instabilidade do foco - tratamento conservador contraindicado.")

    if data.get("deficit_extensor") and conduta == "conservador":
        conduta = "cirurgico"
        if gravidade == "baixa":
            gravidade = "moderada"
            urgencia = "moderada"
        alertas.append(
            "⚡ Déficit do mecanismo extensor - indicação cirúrgica forte; sem reparo, extensão ativa pode ficar comprometida."
        )

    idade = int(data.get("idade", 0) or 0)
    if seg == "31" and tipo in ("B", "C") and idade >= 65:
        alertas.append(
            "🦷 Fêmur proximal em idoso - considerar artroplastia vs RAFI conforme Garden, demanda e qualidade óssea."
        )
    if seg == "42":
        alertas.append("🦵 Tíbia diáfise - monitorar síndrome compartimental nas primeiras 48h.")
    if seg == "43" and tipo == "C":
        alertas.append(
            "🦶 Pilão tibial tipo C - considerar protocolo em 2 tempos com fixador externo provisório e RAFI definitiva após melhora de partes moles."
        )

    if conduta == "cirurgico" and urgencia == "baixa":
        urgencia = "moderada"
    if conduta == "urgente" and gravidade == "baixa":
        gravidade = "alta"

    justificativa = " | ".join(acoes) if acoes else "Decisão baseada em classificação AO/OTA e fatores clínicos."
    explicacao = (
        f"Fratura {codigo or 'não informada'} - tipo {tipo} "
        f"({kb['osso'] if kb else 'segmento não mapeado'}). "
        f"Desvio: {desvio_mm} mm. Demanda: {data.get('demanda_funcional', '-')}. "
        f"Conduta: {conduta.upper()}. Urgência: {urgencia}."
    )

    result = DecisionResult(
        conduta=conduta,
        nivel_urgencia=urgencia,
        gravidade=gravidade,
        tecnica_preferida=tecnica,
        implante=implante,
        alertas=alertas,
        justificativa=justificativa,
        explicacao=explicacao,
    )
    logger.info("ao_decision_engine codigo=%s conduta=%s urgencia=%s", codigo, conduta, urgencia)
    return result.__dict__


if __name__ == "__main__":
    exemplo = {
        "codigo_ao": "21-B1",
        "desvio_mm": 5,
        "incongruencia_articular": True,
        "instabilidade": False,
        "cominuicao": False,
        "fratura_exposta": False,
        "deficit_neurovascular": False,
        "idade": 34,
        "demanda_funcional": "alta",
        "osso_osteoporotico": False,
        "deficit_extensor": True,
    }
    from pprint import pprint
    pprint(ao_decision_engine(exemplo))
