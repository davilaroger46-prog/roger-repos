"""
case_generator.py
Chama a Claude API para gerar casos clínicos no formato JSON v2.0.
Requer ANTHROPIC_API_KEY no ambiente.
"""

import asyncio
import json
import os

import anthropic
from pathlib import Path

_PROMPT_PATH = Path(__file__).parent.parent.parent.parent / "docs" / "prompt-mestre.md"

_SYSTEM_BLOCKS = [
    {
        "type": "text",
        "text": (
            "Você é um sistema especializado em geração de casos clínicos estruturados "
            "para a plataforma OrthoStudy, voltada a médicos e residentes de ortopedia "
            "e traumatologia.\n\n"
            "Ao receber um tema ortopédico, retorne EXCLUSIVAMENTE um JSON válido e completo "
            "seguindo o schema v2.0 do OrthoStudy. Não escreva texto fora do JSON. Não use "
            "markdown, não use blocos de código. Retorne apenas o JSON puro. O primeiro "
            "caractere deve ser `{` e o último `}`."
        ),
        "cache_control": {"type": "ephemeral"},
    }
]


def _call_claude(user_message: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=6000,
        temperature=0.4,
        system=_SYSTEM_BLOCKS,
        messages=[{"role": "user", "content": user_message}],
    )
    return message.content[0].text.strip()


async def generate_case(tema: str, nivel: str | None = None, parametros: str | None = None) -> dict:
    user_parts = [f"Tema: {tema}"]
    if nivel:
        user_parts.append(f"Nível: {nivel}")
    if parametros:
        user_parts.append(parametros)
    user_parts.append(
        "Importante: o JSON deve ser retornado completo. "
        "Se necessário, reduza o nível de detalhe mas mantenha todos os campos preenchidos."
    )
    user_message = "\n".join(user_parts)

    # Roda o cliente síncrono em thread separada para não bloquear o event loop
    raw = await asyncio.to_thread(_call_claude, user_message)

    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0]

    return json.loads(raw)
