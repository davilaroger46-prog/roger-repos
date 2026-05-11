from pydantic import BaseModel, Field, ConfigDict
from typing import Literal


class Meta(BaseModel):
    id: str
    titulo: str
    slug: str
    especialidade: str
    regiao: str
    subespecialidade: str
    nivel: Literal["basico", "intermediario", "avancado"]
    tags: list[str]
    versao: str


class Paciente(BaseModel):
    sexo: Literal["Masculino", "Feminino"]
    idade: int
    atividade: str
    lado: Literal["Direito", "Esquerdo", "Bilateral"]
    demanda_funcional: Literal["baixa", "moderada", "alta"]
    comorbidades: list[str] = []


class Historia(BaseModel):
    queixa_principal: str
    inicio: Literal["agudo", "subagudo", "cronico"]
    tempo_evolucao: str
    mecanismo_lesao: str
    descricao: str


class AoOta(BaseModel):
    codigo: str
    osso: str
    segmento: str
    tipo: Literal["A", "B", "C"]
    grupo: str
    descricao: str
    gravidade: Literal["baixa", "moderada", "alta"]
    confianca: str


class ClassificacaoSecundaria(BaseModel):
    nome: str
    grau: str
    descricao: str


class Classificacao(BaseModel):
    primaria: str
    ao_ota: AoOta
    secundarias: list[ClassificacaoSecundaria]


class TesteFisico(BaseModel):
    nome: str
    sensibilidade: str
    especificidade: str
    positivo: str


class ExameFisico(BaseModel):
    inspecao:  list[str] = Field(min_length=4)
    palpacao:  list[str] = Field(min_length=4)
    movimento: str
    testes:    list[TesteFisico]
    red_flags: list[str] = Field(min_length=3, max_length=5)


class RX(BaseModel):
    indicado: bool
    achados: list[str]


class TC(BaseModel):
    indicado: bool
    quando: str


class RM(BaseModel):
    indicado: bool
    achados: list[str]


class Imagem(BaseModel):
    rx: RX
    tc: TC
    rm: RM


class Diagnostico(BaseModel):
    principal: str
    diferenciais: list[str]
    confirmacao: Literal["clinico", "imagem", "combinado"]


class DecisaoInput(BaseModel):
    ao_tipo: Literal["A", "B", "C"]
    desvio_mm: float
    instabilidade: bool
    cominuicao: bool
    demanda_funcional: str
    deficit_extensor: bool
    incongruencia_articular: bool
    osso_osteoporotico: bool


class RegraDecisao(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    if_: str = Field(alias="if")
    then: str
    prioridade: Literal["alta", "media", "baixa"]
    justificativa: str


class DecisaoOutput(BaseModel):
    conduta: Literal["conservador", "cirurgico", "urgente"]
    tecnica_preferida: str
    nivel_urgencia: Literal["baixa", "moderada", "alta", "critica"]
    explicacao: str


class DecisaoClinica(BaseModel):
    input: DecisaoInput
    regras: list[RegraDecisao] = Field(min_length=4)
    output: DecisaoOutput


class Medicamento(BaseModel):
    nome: str
    dose: str
    via: Literal["VO", "IV", "IM", "SC"]
    intervalo: str
    duracao: str


class TratamentoConservador(BaseModel):
    indicado: bool
    criterios: list[str]
    protocolo: list[str]
    medicamentos: list[Medicamento]


class TecnicaCirurgica(BaseModel):
    nome: str
    quando_usar: str
    vantagens: list[str]
    desvantagens: list[str]


class TratamentoCirurgico(BaseModel):
    indicado: bool
    criterios: list[str]
    tecnicas: list[TecnicaCirurgica] = Field(min_length=3, max_length=3)


class Tratamento(BaseModel):
    conservador: TratamentoConservador
    cirurgico: TratamentoCirurgico


class PassoCirurgico(BaseModel):
    ordem: int
    titulo: str
    descricao: str
    ponto_critico: str


class MaterialCirurgico(BaseModel):
    tipo: Literal["implante", "instrumental"]
    nome: str


class Cirurgia(BaseModel):
    indicacoes: list[str]
    posicionamento: str
    anestesia: list[str]
    passo_a_passo: list[PassoCirurgico] = Field(min_length=6, max_length=6)
    materiais: list[MaterialCirurgico]


class PrescricaoPosOperatoria(BaseModel):
    nome: str
    dose: str
    duracao: str


class PosOperatorio(BaseModel):
    imediato: list[str]
    prescricao: list[PrescricaoPosOperatoria]
    restricoes: list[str]


class ReabilitacaoFase(BaseModel):
    fase: str
    periodo: str
    objetivo: str
    exercicios: list[str]
    restricoes: list[str]


class Complicacoes(BaseModel):
    precoces: list[str]
    tardias: list[str]
    prevencao: list[str]


class Evidencia(BaseModel):
    nivel_I:   list[str]
    nivel_II:  list[str]
    nivel_III: list[str]
    nivel_IV:  list[str]
    nivel_V:   list[str]
    recentes:  list[str]


class Flashcard(BaseModel):
    pergunta: str
    resposta: str


class OutputApp(BaseModel):
    diagnostico: str
    conduta: str
    tecnica: str
    riscos: list[str]
    resumo: str


class ClinicalCase(BaseModel):
    meta:            Meta
    paciente:        Paciente
    historia:        Historia
    classificacao:   Classificacao
    exame_fisico:    ExameFisico
    imagem:          Imagem
    diagnostico:     Diagnostico
    decisao_clinica: DecisaoClinica
    tratamento:      Tratamento
    cirurgia:        Cirurgia
    pos_operatorio:  PosOperatorio
    reabilitacao:    list[ReabilitacaoFase] = Field(min_length=4, max_length=4)
    complicacoes:    Complicacoes
    evidencia:       Evidencia
    flashcards:      list[Flashcard] = Field(min_length=8, max_length=8)
    output_app:      OutputApp
