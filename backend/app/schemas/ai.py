from pydantic import BaseModel
from typing import Optional


class GenerateCaseInput(BaseModel):
    tema: str
    nivel: str = "avancado"
    regiao: Optional[str] = None
