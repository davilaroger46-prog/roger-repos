from sqlalchemy import Column, Integer, String, JSON
from app.db.database import Base


class ClinicalCaseModel(Base):
    __tablename__ = "clinical_cases"

    id        = Column(Integer, primary_key=True, index=True)
    titulo    = Column(String, nullable=False)
    regiao    = Column(String)
    nivel     = Column(String)
    ao_codigo = Column(String)
    caso_json = Column(JSON, nullable=False)
