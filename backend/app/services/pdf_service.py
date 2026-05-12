from io import BytesIO
from datetime import datetime

from app.core.logging import logger

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


def generate_case_pdf(case: dict) -> BytesIO:
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.7 * cm,
        leftMargin=1.7 * cm,
        topMargin=2 * cm,
        bottomMargin=1.7 * cm,
    )

    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading2"],
            textColor=colors.HexColor("#1f4e79"),
            spaceAfter=8,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SmallMuted",
            parent=styles["BodyText"],
            fontSize=8,
            textColor=colors.grey,
        )
    )

    story = []

    def header_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.grey)
        canvas.drawString(1.7 * cm, 1 * cm, "OrthoStudy — Relatório Clínico")
        canvas.drawRightString(19 * cm, 1 * cm, f"Página {doc.page}")
        canvas.restoreState()

    def section(title):
        story.append(Spacer(1, 10))
        story.append(Paragraph(title, styles["SectionTitle"]))

    def text(value):
        story.append(Paragraph(str(value or "-"), styles["BodyText"]))
        story.append(Spacer(1, 6))

    def table(data):
        t = Table(data, colWidths=[5 * cm, 11 * cm])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f1fb")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f2742")),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7fbff")]),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.append(t)
        story.append(Spacer(1, 10))

    meta = case.get("meta", {})
    paciente = case.get("paciente", {})
    historia = case.get("historia", {})
    ao = case.get("classificacao", {}).get("ao_ota", {})
    diagnostico = case.get("diagnostico", {})
    decisao = case.get("decisao_clinica", {}).get("output", {})
    cirurgia = case.get("cirurgia", {})
    complicacoes = case.get("complicacoes", {})

    # CAPA
    story.append(Paragraph("ORTHOSTUDY", styles["Title"]))
    story.append(Paragraph("AI Clinical Orthopedic Engine", styles["Heading2"]))
    story.append(Spacer(1, 24))
    story.append(Paragraph(meta.get("titulo", "Caso clínico"), styles["Title"]))
    story.append(Spacer(1, 18))

    table([
        ["Campo", "Valor"],
        ["Região", meta.get("regiao")],
        ["Subespecialidade", meta.get("subespecialidade")],
        ["Nível", meta.get("nivel")],
        ["AO/OTA", ao.get("codigo")],
        ["Conduta", decisao.get("conduta")],
        ["Urgência", decisao.get("nivel_urgencia")],
        ["Data de geração", datetime.now().strftime("%d/%m/%Y %H:%M")],
    ])

    story.append(PageBreak())

    section("1. Resumo executivo")
    text(case.get("output_app", {}).get("resumo"))

    section("2. Paciente")
    table([
        ["Campo", "Valor"],
        ["Sexo", paciente.get("sexo")],
        ["Idade", paciente.get("idade")],
        ["Atividade", paciente.get("atividade")],
        ["Lado", paciente.get("lado")],
        ["Demanda funcional", paciente.get("demanda_funcional")],
        ["Comorbidades", ", ".join(paciente.get("comorbidades", []))],
    ])

    section("3. História clínica")
    table([
        ["Campo", "Descrição"],
        ["Queixa principal", historia.get("queixa_principal")],
        ["Início", historia.get("inicio")],
        ["Tempo de evolução", historia.get("tempo_evolucao")],
        ["Mecanismo", historia.get("mecanismo_lesao")],
        ["Descrição", historia.get("descricao")],
    ])

    section("4. Diagnóstico e classificação")
    table([
        ["Campo", "Valor"],
        ["Diagnóstico principal", diagnostico.get("principal")],
        ["Confirmação", diagnostico.get("confirmacao")],
        ["AO/OTA", ao.get("codigo")],
        ["Osso", ao.get("osso")],
        ["Segmento", ao.get("segmento")],
        ["Tipo", ao.get("tipo")],
        ["Gravidade", ao.get("gravidade")],
        ["Descrição", ao.get("descricao")],
    ])

    section("5. Decisão clínica")
    table([
        ["Campo", "Valor"],
        ["Conduta", decisao.get("conduta")],
        ["Técnica preferida", decisao.get("tecnica_preferida")],
        ["Nível de urgência", decisao.get("nivel_urgencia")],
        ["Explicação", decisao.get("explicacao")],
    ])

    section("6. Passo a passo cirúrgico")
    for passo in cirurgia.get("passo_a_passo", []):
        table([
            ["Campo", "Valor"],
            ["Ordem", passo.get("ordem")],
            ["Título", passo.get("titulo")],
            ["Descrição", passo.get("descricao")],
            ["Ponto crítico", passo.get("ponto_critico")],
        ])

    section("7. Reabilitação")
    for fase in case.get("reabilitacao", []):
        table([
            ["Campo", "Valor"],
            ["Fase", fase.get("fase")],
            ["Período", fase.get("periodo")],
            ["Objetivo", fase.get("objetivo")],
            ["Exercícios", "; ".join(fase.get("exercicios", []))],
            ["Restrições", "; ".join(fase.get("restricoes", []))],
        ])

    section("8. Complicações")
    table([
        ["Tipo", "Descrição"],
        ["Precoces", "; ".join(complicacoes.get("precoces", []))],
        ["Tardias", "; ".join(complicacoes.get("tardias", []))],
        ["Prevenção", "; ".join(complicacoes.get("prevencao", []))],
    ])

    section("9. Flashcards")
    for i, card in enumerate(case.get("flashcards", []), start=1):
        table([
            ["Campo", "Conteúdo"],
            [f"Pergunta {i}", card.get("pergunta")],
            ["Resposta", card.get("resposta")],
        ])

    story.append(Spacer(1, 20))
    story.append(
        Paragraph(
            "Documento gerado pelo OrthoStudy. Deve ser revisado por médico responsável antes de uso clínico.",
            styles["SmallMuted"],
        )
    )

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)

    buffer.seek(0)
    logger.info("generate_case_pdf titulo=%s", meta.get("titulo"))
    return buffer
