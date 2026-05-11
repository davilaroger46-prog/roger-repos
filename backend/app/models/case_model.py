from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class ClinicalCaseModel(Base):
    __tablename__ = "clinical_cases"

    id = Column(Integer, primary_key=True, index=True)

    titulo = Column(String, nullable=False)
    regiao = Column(String)
    nivel = Column(String)
    ao_codigo = Column(String)

    caso_json = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
