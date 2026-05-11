"""
Migration: add created_at and updated_at to clinical_cases.

Safe to run multiple times — uses ADD COLUMN IF NOT EXISTS.
Run once against the live database:

    cd backend
    python -m app.db.migrate_add_timestamps
"""

from app.db.database import engine
from sqlalchemy import text

ADD_CREATED_AT = """
ALTER TABLE clinical_cases
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
"""

ADD_UPDATED_AT = """
ALTER TABLE clinical_cases
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
"""

with engine.connect() as conn:
    conn.execute(text(ADD_CREATED_AT))
    conn.execute(text(ADD_UPDATED_AT))
    conn.commit()
    print("Migration applied: created_at and updated_at added to clinical_cases.")
