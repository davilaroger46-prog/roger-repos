from sqlalchemy import Column, Integer, JSON, ForeignKey, DateTime, func
from app.db.database import Base


class CaseVersionModel(Base):
    __tablename__ = "case_versions"

    id         = Column(Integer, primary_key=True, index=True)
    case_id    = Column(Integer, ForeignKey("clinical_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    caso_json  = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
