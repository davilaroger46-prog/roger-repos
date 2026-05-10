"""
seed.py — Carrega casos clínicos JSON no banco SQLite.
Uso: python seed.py
     python seed.py --reset   (apaga e reinsere tudo)
"""

import asyncio
import json
import sys
from pathlib import Path

import aiosqlite

DB_PATH = "orthostudy.db"
CASES_DIR = Path(__file__).parent / "data" / "cases"


async def seed(reset: bool = False):
    files = sorted(CASES_DIR.glob("*.json"))
    if not files:
        print("Nenhum arquivo JSON encontrado em data/cases/")
        return

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        await db.execute("""
            CREATE TABLE IF NOT EXISTS cases (
                id          TEXT PRIMARY KEY,
                regiao      TEXT NOT NULL,
                nivel       TEXT NOT NULL,
                titulo      TEXT NOT NULL,
                data        TEXT NOT NULL,
                updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        await db.commit()

        if reset:
            await db.execute("DELETE FROM cases")
            await db.commit()
            print("Banco resetado.")

        inseridos = 0
        atualizados = 0
        erros = 0

        for f in files:
            try:
                caso = json.loads(f.read_text(encoding="utf-8"))
                meta = caso.get("meta", {})
                caso_id = meta.get("id")
                if not caso_id:
                    print(f"  SKIP {f.name} — sem meta.id")
                    continue

                existing = await db.execute_fetchall(
                    "SELECT id FROM cases WHERE id = ?", (caso_id,)
                )

                if existing and not reset:
                    await db.execute(
                        "UPDATE cases SET data = ?, updated_at = datetime('now') WHERE id = ?",
                        (json.dumps(caso, ensure_ascii=False), caso_id),
                    )
                    atualizados += 1
                    print(f"  UPDATE [{caso_id}] {meta.get('titulo', '')}")
                else:
                    await db.execute(
                        "INSERT OR REPLACE INTO cases (id, regiao, nivel, titulo, data) VALUES (?, ?, ?, ?, ?)",
                        (
                            caso_id,
                            meta.get("regiao", ""),
                            meta.get("nivel", "intermediario"),
                            meta.get("titulo", ""),
                            json.dumps(caso, ensure_ascii=False),
                        ),
                    )
                    inseridos += 1
                    print(f"  INSERT [{caso_id}] {meta.get('titulo', '')}")

                await db.commit()

            except Exception as e:
                print(f"  ERRO {f.name}: {e}")
                erros += 1

    print(f"\nConcluido: {inseridos} inseridos, {atualizados} atualizados, {erros} erros.")


if __name__ == "__main__":
    reset = "--reset" in sys.argv
    asyncio.run(seed(reset=reset))
