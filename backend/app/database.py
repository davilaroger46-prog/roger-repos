import aiosqlite

DB_PATH = "orthostudy.db"


async def init_db():
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
        await db.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                caso_id              TEXT PRIMARY KEY,
                flashcards_vistos    INTEGER NOT NULL DEFAULT 0,
                flashcards_corretos  INTEGER NOT NULL DEFAULT 0,
                decisoes_acertadas   INTEGER NOT NULL DEFAULT 0,
                decisoes_total       INTEGER NOT NULL DEFAULT 0,
                ultima_atividade     TEXT
            )
        """)
        await db.commit()


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db
