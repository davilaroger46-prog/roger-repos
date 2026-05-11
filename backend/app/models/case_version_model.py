from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.db.database import Base


class ClinicalCaseVersionModel(Base):
    __tablename__ = "clinical_case_versions"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(Integer, ForeignKey("clinical_cases.id"), index=True)

    action = Column(String, nullable=False)

    caso_json = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
