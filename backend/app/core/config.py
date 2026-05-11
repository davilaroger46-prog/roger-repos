import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

if not ANTHROPIC_API_KEY:
    raise RuntimeError("ANTHROPIC_API_KEY não encontrada no .env")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL não encontrada no .env")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não encontrada")
