from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Case(Base):
    __tablename__ = "cases"

    id:         Mapped[str]      = mapped_column(String, primary_key=True)
    titulo:     Mapped[str]      = mapped_column(String, index=True)
    regiao:     Mapped[str]      = mapped_column(String, index=True)
    nivel:      Mapped[str]      = mapped_column(String, index=True)
    data:       Mapped[dict]     = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
