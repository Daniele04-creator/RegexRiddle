"""Regenerate the one-page project sheet (requires ReportLab)."""

from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "N86005238-Daniele-De-Blasio-Traccia&Scelte-Tecnologiche.pdf"
INK = colors.HexColor("#302942")
BODY = ParagraphStyle("body", fontName="Times-Roman", fontSize=11, leading=16, textColor=INK)
TITLE = ParagraphStyle("title", parent=BODY, fontName="Times-Bold", fontSize=28, leading=34)
HEADING = ParagraphStyle("heading", parent=BODY, fontName="Times-Bold", fontSize=15, leading=22)
SMALL = ParagraphStyle("small", parent=BODY, fontSize=10, leading=14)


def paragraph(text: str, style=BODY):
    return Paragraph(text, style)


def main() -> None:
    document = SimpleDocTemplate(str(OUTPUT), pagesize=A4, topMargin=54, bottomMargin=54, leftMargin=54, rightMargin=54)
    story = [
        paragraph("Università degli Studi di Napoli Federico II", SMALL),
        paragraph("Corso di Tecnologie Web - A.A. 2025/2026", SMALL),
        Spacer(1, 28), paragraph("REGEXRIDDLE", TITLE),
        paragraph("Scheda di presentazione del progetto"), Spacer(1, 30),
        paragraph("Dati dello studente", HEADING), Spacer(1, 10),
    ]
    rows = [[paragraph(f"<b>{label}</b>"), paragraph(value)] for label, value in (
        ("Nome", "Daniele"), ("Cognome", "De Blasio"),
        ("Matricola", "N86005238"), ("Traccia scelta", "RegexRiddle"),
    )]
    table = Table(rows, colWidths=[135, A4[0] - 108 - 135])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#ded9e6")),
    ]))
    story += [table, Spacer(1, 30), paragraph("Tecnologie utilizzate", HEADING), Spacer(1, 12)]
    for label, text in (
        ("Back-end", "Node.js 24 e TypeScript; API REST con Fastify 5; Prisma 7 e PostgreSQL; Argon2id per le password e RE2-WASM per le espressioni regolari."),
        ("Front-end", "Single Page Application con Angular 21 e TypeScript; Angular Router, Forms, Signals e RxJS; interfaccia responsive in HTML5 e CSS3."),
        ("Ambiente e test", "Docker e Docker Compose per i servizi; test unitari con Node.js e test End-to-End automatici con Playwright, su viewport desktop e mobile. Comandi e verifiche ripetibili nel README."),
    ):
        story += [paragraph(f"<b>{label}</b>"), paragraph(text), Spacer(1, 15)]
    document.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    main()
