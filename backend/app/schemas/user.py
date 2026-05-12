from pydantic import BaseModel, EmailStr


class UserOutput(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
