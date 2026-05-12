from pydantic import BaseModel
from typing import Literal


class ReviewDecisionInput(BaseModel):
    status: Literal["approved", "rejected"]
    notes: str | None = None
