from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

DARK_BG    = colors.HexColor("#0f1117")
SURFACE    = colors.HexColor("#1a1d27")
BORDER     = colors.HexColor("#2a2d3a")
TEXT       = colors.HexColor("#e8eaf0")
MUTED      = colors.HexColor("#6b7280")
PURPLE     = colors.HexColor("#8b5cf6")
AMBER      = colors.HexColor("#f59e0b")
GREEN      = colors.HexColor("#10b981")
RED        = colors.HexColor("#ef4444")
BLUE       = colors.HexColor("#3b82f6")
WHITE      = colors.white


def _styles():
    base = getSampleStyleSheet()

    def s(name, **kw):
        return ParagraphStyle(name, parent=base["Normal"], **kw)

    return {
        "title": s(
            "title",
            fontSize=16, fontName="Helvetica-Bold",
            textColor=WHITE, spaceAfter=2,
        ),
        "subtitle": s(
            "subtitle",
            fontSize=9, fontName="Helvetica",
            textColor=MUTED, spaceAfter=8,
        ),
        "section": s(
            "section",
            fontSize=8, fontName="Helvetica-Bold",
            textColor=PURPLE, spaceBefore=12, spaceAfter=4,
            textTransform="uppercase",
        ),
        "body": s(
            "body",
            fontSize=9, fontName="Helvetica",
            textColor=TEXT, leading=14, spaceAfter=4,
        ),
        "label": s(
            "label",
            fontSize=7, fontName="Helvetica-Bold",
            textColor=MUTED, spaceAfter=1,
        ),
        "value": s(
            "value",
            fontSize=9, fontName="Helvetica",
            textColor=TEXT, spaceAfter=6,
        ),
        "bullet": s(
            "bullet",
            fontSize=9, fontName="Helvetica",
            textColor=TEXT, leading=14,
            leftIndent=10, spaceAfter=2,
        ),
        "tag": s(
            "tag",
            fontSize=8, fontName="Helvetica-Bold",
            textColor=AMBER,
        ),
    }


def _divider():
    return HRFlowable(
        width="100%", thickness=0.5,
        color=BORDER, spaceAfter=6, spaceBefore=2,
    )


def _field(label, value, st):
    if not value:
        return []
    return [
        Paragraph(label.upper(), st["label"]),
        Paragraph(str(value), st["value"]),
    ]


def _kv_table(pairs, st):
    data = []
    for label, value in pairs:
        if value is not None and value != "":
            data.append([
                Paragraph(label, st["label"]),
                Paragraph(str(value), st["value"]),
            ])
    if not data:
        return []
    col_w = (PAGE_W - 2 * MARGIN) / 2
    tbl = Table(data, colWidths=[col_w * 0.38, col_w * 1.62])
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return [tbl]


def _bullet_list(items, st, prefix="•"):
    out = []
    for item in (items or []):
        text = item if isinstance(item, str) else str(item)
        out.append(Paragraph(f"{prefix}  {text}", st["bullet"]))
    return out


def generate_case_pdf(caso: dict) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
    )

    st = _styles()
    story = []

    meta   = caso.get("meta", {})
    pac    = caso.get("paciente", {})
    hist   = caso.get("historia", {})
    exam   = caso.get("exame_fisico", {})
    img    = caso.get("imagem", {})
    clf    = caso.get("classificacao", {})
    diag   = caso.get("diagnostico", {})
    dc     = caso.get("decisao_clinica", {})
    trat   = caso.get("tratamento", {})
    cir    = caso.get("cirurgia", {})
    reab   = caso.get("reabilitacao", [])
    comp   = caso.get("complicacoes", {})
    flash  = caso.get("flashcards", [])
    output = caso.get("output_app", {})

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph(meta.get("titulo", "Caso Clínico"), st["title"]))
    tags = "  ·  ".join(filter(None, [
        meta.get("regiao"), meta.get("nivel"),
        clf.get("ao_ota", {}).get("codigo"),
    ]))
    if tags:
        story.append(Paragraph(tags, st["subtitle"]))
    story.append(_divider())

    # ── Paciente ──────────────────────────────────────────────────────────────
    story.append(Paragraph("Paciente", st["section"]))
    story += _kv_table([
        ("Idade",      pac.get("idade")),
        ("Sexo",       pac.get("sexo")),
        ("Ocupação",   pac.get("ocupacao")),
        ("Mecanismo",  pac.get("mecanismo_trauma")),
        ("Lateralidade", pac.get("lateralidade")),
    ], st)

    # ── História ──────────────────────────────────────────────────────────────
    story.append(Paragraph("História", st["section"]))
    for f in ["queixa_principal", "historia_atual", "antecedentes"]:
        v = hist.get(f)
        if v:
            story.append(Paragraph(f.replace("_", " ").title(), st["label"]))
            story.append(Paragraph(str(v), st["body"]))

    # ── Exame Físico ──────────────────────────────────────────────────────────
    if exam:
        story.append(Paragraph("Exame Físico", st["section"]))
        for key in ["inspecao", "palpacao", "mobilidade", "testes_especiais"]:
            items = exam.get(key)
            if isinstance(items, list) and items:
                story.append(Paragraph(key.replace("_", " ").title(), st["label"]))
                story += _bullet_list(items, st)
            elif isinstance(items, str) and items:
                story.append(Paragraph(key.replace("_", " ").title(), st["label"]))
                story.append(Paragraph(items, st["body"]))

    # ── Imagem ────────────────────────────────────────────────────────────────
    if img:
        story.append(Paragraph("Imagem", st["section"]))
        story += _kv_table([
            ("Exame",    img.get("exame")),
            ("Achados",  img.get("achados")),
        ], st)

    # ── Classificação AO/OTA ──────────────────────────────────────────────────
    ao = clf.get("ao_ota", {})
    if ao:
        story.append(Paragraph("Classificação AO/OTA", st["section"]))
        story += _kv_table([
            ("Código",     ao.get("codigo")),
            ("Descrição",  ao.get("descricao")),
            ("Gravidade",  ao.get("gravidade")),
        ], st)

    # ── Diagnóstico ───────────────────────────────────────────────────────────
    story.append(Paragraph("Diagnóstico", st["section"]))
    story += _field("Principal", diag.get("principal"), st)
    difs = diag.get("diferenciais", [])
    if difs:
        story.append(Paragraph("Diferenciais", st["label"]))
        story += _bullet_list(difs, st)

    # ── Decisão Clínica ───────────────────────────────────────────────────────
    dc_out = dc.get("output", {})
    if dc_out:
        story.append(Paragraph("Decisão Clínica", st["section"]))
        story += _kv_table([
            ("Conduta",   dc_out.get("conduta")),
            ("Urgência",  dc_out.get("nivel_urgencia")),
            ("Técnica",   dc_out.get("tecnica_preferida")),
        ], st)
        justif = dc_out.get("justificativa")
        if justif:
            story.append(Paragraph("Justificativa", st["label"]))
            story.append(Paragraph(str(justif), st["body"]))

    # ── Tratamento ────────────────────────────────────────────────────────────
    if trat:
        story.append(Paragraph("Tratamento", st["section"]))
        cons = trat.get("conservador", {})
        if cons:
            story.append(Paragraph("Conservador", st["label"]))
            story += _bullet_list(cons.get("medidas", []), st)
        med_list = trat.get("medicamentos", [])
        if med_list:
            story.append(Paragraph("Medicamentos", st["label"]))
            for m in med_list:
                name  = m.get("nome", "")
                dose  = m.get("dose", "")
                via   = m.get("via", "")
                story.append(Paragraph(f"•  {name}  {dose}  {via}".strip(), st["bullet"]))

    # ── Cirurgia ──────────────────────────────────────────────────────────────
    if cir:
        story.append(Paragraph("Cirurgia", st["section"]))
        tecnicas = cir.get("tecnicas", [])
        if tecnicas:
            story.append(Paragraph("Técnicas", st["label"]))
            story += _bullet_list([t.get("nome", t) if isinstance(t, dict) else t for t in tecnicas], st)
        passos = cir.get("passo_a_passo", [])
        if passos:
            story.append(Paragraph("Passo a Passo", st["label"]))
            for i, p in enumerate(passos, 1):
                desc = p.get("descricao", p) if isinstance(p, dict) else p
                story.append(Paragraph(f"{i}.  {desc}", st["bullet"]))

    # ── Reabilitação ──────────────────────────────────────────────────────────
    if reab:
        story.append(Paragraph("Reabilitação", st["section"]))
        for fase in reab:
            nome = fase.get("fase", "")
            if nome:
                story.append(Paragraph(nome, st["label"]))
            story += _bullet_list(fase.get("exercicios", []), st)

    # ── Complicações ──────────────────────────────────────────────────────────
    if comp:
        story.append(Paragraph("Complicações", st["section"]))
        story += _bullet_list(comp.get("possiveis", []), st)
        red_flags = comp.get("red_flags", [])
        if red_flags:
            story.append(Paragraph("Red Flags", st["label"]))
            story += _bullet_list(red_flags, st)

    # ── Flashcards ────────────────────────────────────────────────────────────
    if flash:
        story.append(Paragraph("Flashcards", st["section"]))
        story.append(_divider())
        col_w = PAGE_W - 2 * MARGIN
        for fc in flash:
            q = fc.get("pergunta", "")
            a = fc.get("resposta", "")
            row = [[
                Paragraph(q, st["body"]),
                Paragraph(a, st["body"]),
            ]]
            tbl = Table(row, colWidths=[col_w * 0.48, col_w * 0.52])
            tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#8b5cf615")),
                ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#1a1d27")),
                ("BOX",        (0, 0), (-1, -1), 0.5, BORDER),
                ("INNERGRID",  (0, 0), (-1, -1), 0.5, BORDER),
                ("VALIGN",     (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING",   (0, 0), (-1, -1), 8),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 4))

    # ── Resumo ────────────────────────────────────────────────────────────────
    resumo = output.get("resumo")
    if resumo:
        story.append(Paragraph("Resumo", st["section"]))
        story.append(Paragraph(str(resumo), st["body"]))

    doc.build(story)
    return buf.getvalue()
