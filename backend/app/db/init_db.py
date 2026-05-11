from app.db.database import engine, Base
from app.models.case_model import ClinicalCaseModel
from app.models.case_version_model import ClinicalCaseVersionModel

Base.metadata.create_all(bind=engine)

print("Banco criado com sucesso.")
