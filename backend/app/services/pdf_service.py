from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import cm


def generate_case_pdf(case: dict) -> BytesIO:
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    def add_title(text):
        story.append(Paragraph(text, styles["Title"]))
        story.append(Spacer(1, 12))

    def add_heading(text):
        story.append(Paragraph(text, styles["Heading2"]))
        story.append(Spacer(1, 6))

    def add_text(text):
        story.append(Paragraph(str(text or "-"), styles["BodyText"]))
        story.append(Spacer(1, 8))

    add_title(case["meta"]["titulo"])

    add_heading("Resumo executivo")
    add_text(case.get("output_app", {}).get("resumo"))

    add_heading("Paciente")
    paciente = case.get("paciente", {})
    add_text(
        f'{paciente.get("sexo")} - {paciente.get("idade")} anos - '
        f'{paciente.get("atividade")} - lado {paciente.get("lado")}'
    )

    add_heading("Diagnóstico")
    add_text(case.get("diagnostico", {}).get("principal"))

    add_heading("Classificação AO/OTA")
    ao = case.get("classificacao", {}).get("ao_ota", {})
    add_text(
        f'{ao.get("codigo")} - {ao.get("descricao")} - '
        f'gravidade: {ao.get("gravidade")}'
    )

    add_heading("Decisão clínica")
    decisao = case.get("decisao_clinica", {}).get("output", {})
    add_text(f'Conduta: {decisao.get("conduta")}')
    add_text(f'Técnica: {decisao.get("tecnica_preferida")}')
    add_text(decisao.get("explicacao"))

    add_heading("Tratamento")
    tratamento = case.get("tratamento", {})
    conservador = tratamento.get("conservador", {})
    cirurgico = tratamento.get("cirurgico", {})

    add_text(f'Conservador indicado: {conservador.get("indicado")}')
    add_text(f'Cirúrgico indicado: {cirurgico.get("indicado")}')

    add_heading("Passo a passo cirúrgico")
    for passo in case.get("cirurgia", {}).get("passo_a_passo", []):
        add_text(
            f'{passo.get("ordem")}. {passo.get("titulo")} - '
            f'{passo.get("descricao")} '
            f'Ponto crítico: {passo.get("ponto_critico")}'
        )

    add_heading("Reabilitação")
    for fase in case.get("reabilitacao", []):
        add_text(
            f'{fase.get("fase")} ({fase.get("periodo")}): '
            f'{fase.get("objetivo")}'
        )

    add_heading("Complicações")
    complicacoes = case.get("complicacoes", {})
    add_text("Precoces: " + "; ".join(complicacoes.get("precoces", [])))
    add_text("Tardias: " + "; ".join(complicacoes.get("tardias", [])))

    add_heading("Flashcards")
    for i, card in enumerate(case.get("flashcards", []), start=1):
        add_text(f'{i}. {card.get("pergunta")}')
        add_text(f'Resposta: {card.get("resposta")}')

    doc.build(story)

    buffer.seek(0)
    return buffer
