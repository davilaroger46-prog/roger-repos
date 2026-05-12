import json
from anthropic import Anthropic
from app.core.config import ANTHROPIC_API_KEY
from app.schemas.case import ClinicalCase
from app.core.logging import logger

client = Anthropic(api_key=ANTHROPIC_API_KEY)


SYSTEM_PROMPT = """
Você é um especialista em ortopedia e traumatologia gerando casos clínicos estruturados para a plataforma OrthoStudy.

Retorne EXCLUSIVAMENTE JSON válido.
Sem texto.
Sem markdown.
Sem blocos de código.
O primeiro caractere deve ser { e o último deve ser }.

SCHEMA v2.0 OBRIGATÓRIO:
- meta
- paciente
- historia
- classificacao
- exame_fisico
- imagem
- diagnostico
- decisao_clinica
- tratamento
- cirurgia
- pos_operatorio
- reabilitacao
- complicacoes
- evidencia
- flashcards
- output_app

REQUISITOS MÍNIMOS:
- Exatamente 8 flashcards nível residência médica
- Exatamente 6 passos cirúrgicos com pontos críticos reais
- 4 fases de reabilitação com exercícios concretos
- 4 ou mais regras na decisão clínica
- Medicamentos com doses reais em mg, via, intervalo e duração
- 3 técnicas cirúrgicas com vantagens e desvantagens
- Percentuais de complicações quando possível
- Linguagem médica tecnicamente precisa
"""


def extract_json(text: str) -> dict:
    clean = text.strip()

    if clean.startswith("```json"):
        clean = clean.replace("```json", "", 1).strip()

    if clean.startswith("```"):
        clean = clean.replace("```", "", 1).strip()

    if clean.endswith("```"):
        clean = clean[:-3].strip()

    start = clean.find("{")
    end = clean.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("A IA não retornou JSON válido.")

    return json.loads(clean[start:end + 1])


def validate_case_schema(case: dict) -> dict:
    validated = ClinicalCase.model_validate(case)

    return validated.model_dump(
        by_alias=True,
        exclude_none=True,
        mode="json",
    )


def generate_orthopedic_case(tema: str, nivel: str, regiao: str | None = None) -> dict:
    user_prompt = f"""
Tema: {tema}
Nível: {nivel}
Região anatômica: {regiao or "não especificada"}

Gere um caso clínico ortopédico completo em JSON v2.0.
Preencha todos os campos.
Não use markdown.
Não explique.
Retorne somente JSON.
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=6000,
        temperature=0.3,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    raw_text = response.content[0].text
    parsed = extract_json(raw_text)
    result = validate_case_schema(parsed)
    logger.info(f"Gerando caso ortopédico | tema={tema} | nivel={nivel} | regiao={regiao}")
    return result


def autocorrect_orthopedic_case(case: dict) -> dict:
    prompt = f"""
Você receberá um caso clínico ortopédico em JSON.

OBJETIVO:
Corrigir apenas o que estiver incompleto, ausente, vazio ou fora das regras do schema.

REGRAS:
- Preserve ao máximo o conteúdo já escrito pelo médico.
- Não apague campos válidos.
- Não altere diagnóstico, conduta ou técnica se já estiverem coerentes.
- Complete apenas lacunas.
- Corrija contagens obrigatórias.
- Retorne exclusivamente JSON válido.
- Sem markdown.
- Sem comentários.

CONTAGENS OBRIGATÓRIAS:
- flashcards: exatamente 8
- cirurgia.passo_a_passo: exatamente 6
- reabilitacao: exatamente 4 fases
- tratamento.cirurgico.tecnicas: exatamente 3
- decisao_clinica.regras: mínimo 4
- exame_fisico.inspecao: mínimo 4
- exame_fisico.palpacao: mínimo 4
- exame_fisico.red_flags: 3 a 5

CASO ATUAL:
{json.dumps(case, ensure_ascii=False)}
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        temperature=0.2,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    raw_text = response.content[0].text
    parsed = extract_json(raw_text)
    result = validate_case_schema(parsed)
    logger.info("Autocorreção de caso iniciada")
    return result
