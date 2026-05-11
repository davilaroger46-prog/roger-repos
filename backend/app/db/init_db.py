from app.db.database import engine, Base
from app.models.case_model import ClinicalCaseModel  # noqa: F401 — registers table

Base.metadata.create_all(bind=engine)

print("Banco criado com sucesso.")
