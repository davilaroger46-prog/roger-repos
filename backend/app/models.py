from typing import List, Optional
from pydantic import BaseModel, Field


# ─── AO Decision ─────────────────────────────────────────────────

class AoDecisionInput(BaseModel):
    codigo_ao: Optional[str] = None
    ao_code: Optional[str] = None
    desvio_mm: Optional[float] = 0
    instabilidade: Optional[bool] = False
    cominuicao: Optional[bool] = False
    fratura_exposta: Optional[bool] = False
    deficit_neurovascular: Optional[bool] = False
    deficit_extensor: Optional[bool] = False
    incongruencia_articular: Optional[bool] = False
    osso_osteoporotico: Optional[bool] = False
    demanda_funcional: Optional[str] = "moderada"
    idade: Optional[int] = 0


class AoDecisionOutput(BaseModel):
    gravidade: str
    conduta_sugerida: str
    tecnica_preferida: str
    implante: str
    alertas: List[str]
    justificativa: str
    nivel_urgencia: str


# ─── Caso Clínico ─────────────────────────────────────────────────

class CasoMeta(BaseModel):
    id: str
    titulo: str
    slug: Optional[str] = None
    especialidade: Optional[str] = "ortopedia"
    regiao: str
    subespecialidade: Optional[str] = None
    nivel: str
    tags: Optional[List[str]] = []
    versao: Optional[str] = "2.0"


class CasoCreate(BaseModel):
    meta: CasoMeta
    paciente: Optional[dict] = {}
    historia: Optional[dict] = {}
    classificacao: Optional[dict] = {}
    exame_fisico: Optional[dict] = {}
    imagem: Optional[dict] = {}
    diagnostico: Optional[dict] = {}
    decisao_clinica: Optional[dict] = {}
    tratamento: Optional[dict] = {}
    cirurgia: Optional[dict] = {}
    pos_operatorio: Optional[dict] = {}
    reabilitacao: Optional[List[dict]] = []
    complicacoes: Optional[dict] = {}
    evidencia: Optional[dict] = {}
    flashcards: Optional[List[dict]] = []
    output_app: Optional[dict] = {}


class CasoUpdate(BaseModel):
    meta: Optional[dict] = None
    paciente: Optional[dict] = None
    historia: Optional[dict] = None
    classificacao: Optional[dict] = None
    exame_fisico: Optional[dict] = None
    imagem: Optional[dict] = None
    diagnostico: Optional[dict] = None
    decisao_clinica: Optional[dict] = None
    tratamento: Optional[dict] = None
    cirurgia: Optional[dict] = None
    pos_operatorio: Optional[dict] = None
    reabilitacao: Optional[List[dict]] = None
    complicacoes: Optional[dict] = None
    evidencia: Optional[dict] = None
    flashcards: Optional[List[dict]] = None
    output_app: Optional[dict] = None


# ─── Progresso ───────────────────────────────────────────────────

class ProgressUpdate(BaseModel):
    caso_id: str
    flashcards_vistos: Optional[int] = 0
    flashcards_corretos: Optional[int] = 0
    decisao_acertada: Optional[bool] = None
    tempo_segundos: Optional[int] = None


class ProgressResponse(BaseModel):
    caso_id: str
    flashcards_vistos: int
    flashcards_corretos: int
    decisoes_acertadas: int
    decisoes_total: int
    ultima_atividade: Optional[str] = None


# ─── Geração via Claude API ───────────────────────────────────────

class GenerateRequest(BaseModel):
    tema: str
    nivel: Optional[str] = None
    regiao: Optional[str] = None
    parametros: Optional[str] = None
