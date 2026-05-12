from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base


class ClinicalCaseModel(Base):
    __tablename__ = "clinical_cases"

    id = Column(Integer, primary_key=True, index=True)

    titulo = Column(String, nullable=False)
    regiao = Column(String)
    nivel = Column(String)
    ao_codigo = Column(String)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    caso_json = Column(JSON, nullable=False)

    review_status = Column(String, default="draft", nullable=False)
    review_notes = Column(String, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
