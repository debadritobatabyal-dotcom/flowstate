import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

SAMPLE_PDF_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "storage", "uploads")
os.makedirs(SAMPLE_PDF_DIR, exist_ok=True)


def generate_land_document(file_path: str, institution_name: str = "Meridian Institute of Technology", acres: float = 5.25):
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=16, leading=20, alignment=1)
    sub_style = ParagraphStyle('SubStyle', parent=styles['Normal'], fontSize=10, leading=14, alignment=1, textColor=colors.gray)
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=11, leading=16)

    story.append(Paragraph("GOVERNMENT OF MAHARASHTRA", title_style))
    story.append(Paragraph("DEPARTMENT OF REVENUE & LAND RECORDS", sub_style))
    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>CERTIFICATE OF LAND TITLE AND OWNERSHIP FOR EDUCATIONAL INSTITUTION</b>", ParagraphStyle('BoldH', parent=title_style, fontSize=12)))
    story.append(Spacer(1, 20))

    story.append(Paragraph(
        f"This is to certify that the institutional property situated at Survey No. 102/4, Khasra Plot No. 48/B, "
        f"Khandala Industrial Knowledge Corridor, District Pune, measuring an aggregate area of <b>{acres} acres</b> "
        f"is legally owned and possessed by <b>{institution_name}</b>, managed under the Aegis of Meridian Educational Foundation.",
        body_style
    ))
    story.append(Spacer(1, 15))

    data = [
        ["Attribute", "Specification Value"],
        ["Institution Name", institution_name],
        ["Total Land Area", f"{acres} acres (21,245.9 sq.m)"],
        ["Normative Category", "Mega/Metro Urban Classification (Min. 2.5 acres required)"],
        ["Land Registration No.", "MAH-PN-2018-994102-REG"],
        ["Date of Registration", "14th August 2018"],
        ["Encumbrance Status", "Unencumbered Freehold Title"],
        ["Land Use Classification", "Designated for Higher Technical & Professional Education"],
    ]
    t = Table(data, colWidths=[200, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#102a43')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bcccdc')),
    ]))
    story.append(t)
    story.append(Spacer(1, 30))
    story.append(Paragraph("Digitally Authenticated by District Collector & Competent Land Authority.", sub_style))

    doc.build(story)
    return file_path


def generate_fire_safety_noc(file_path: str, institution_name: str, noc_no: str, validity_date: str, is_expired: bool = False):
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=15, leading=18, alignment=1)
    sub_style = ParagraphStyle('SubStyle', parent=styles['Normal'], fontSize=10, leading=14, alignment=1, textColor=colors.gray)
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=11, leading=16)

    story.append(Paragraph("STATE DISASTER MANAGEMENT & FIRE PREVENTION SERVICES", title_style))
    story.append(Paragraph("OFFICE OF THE CHIEF FIRE OFFICER", sub_style))
    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>FIRE SAFETY COMPLIANCE & OCCUPANCY CERTIFICATE (NOC)</b>", ParagraphStyle('BoldH', parent=title_style, fontSize=12)))
    story.append(Spacer(1, 20))

    story.append(Paragraph(
        f"This Fire Safety Certificate is granted to <b>{institution_name}</b> for Educational Campus Building Blocks A, B and C. "
        f"All installed fire hydrants, wet risers, automatic smoke detection and emergency evacuation corridors have been inspected.",
        body_style
    ))
    story.append(Spacer(1, 15))

    data = [
        ["Parameter", "Details"],
        ["Certificate / NOC No.", noc_no],
        ["Inspected Premises", f"{institution_name} Main Academic Campus"],
        ["Valid Until", validity_date],
        ["Compliance Standard", "National Building Code (NBC) 2016 Part 4"],
        ["Certificate Status", "EXPIRED (Requires Re-inspection)" if is_expired else "VALID & COMPLIANT"],
    ]
    t = Table(data, colWidths=[200, 320])
    bg_header = colors.HexColor('#991b1b') if is_expired else colors.HexColor('#166534')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), bg_header),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bcccdc')),
    ]))
    story.append(t)
    story.append(Spacer(1, 30))
    story.append(Paragraph("Issued by Directorate of Maharashtra Fire Services.", sub_style))

    doc.build(story)
    return file_path


def generate_faculty_list(file_path: str, institution_name: str):
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=15, leading=18, alignment=1)
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=10, leading=14)

    story.append(Paragraph(f"{institution_name.upper()}", title_style))
    story.append(Paragraph("<b>FACULTY CADRE RATIO & QUALIFICATION ROSTER</b>", ParagraphStyle('Sub', parent=title_style, fontSize=11)))
    story.append(Spacer(1, 15))

    story.append(Paragraph(
        "Cadre and Faculty ratio compliance in accordance with AICTE Approval Process Handbook Clause 1.9 & Annexure 6. "
        "Total Faculty: 40 | Ph.D Holders: 12 | Postgraduate (M.Tech/M.E): 28 | Student-to-Faculty Ratio: 1:15",
        body_style
    ))
    story.append(Spacer(1, 15))

    data = [
        ["S.No", "Faculty Name", "Designation", "Highest Qualification", "Department", "Exp (Yrs)"],
        ["1", "Dr. Arvind K. Sharma", "Professor & HoD", "Ph.D (IIT Bombay)", "Computer Engg", "22"],
        ["2", "Dr. Meera Vasudevan", "Professor", "Ph.D (IISc Bangalore)", "Computer Engg", "18"],
        ["3", "Prof. Rajesh Deshmukh", "Associate Professor", "M.Tech (COEP Pune)", "Computer Engg", "12"],
        ["4", "Prof. Sunita R. Patel", "Assistant Professor", "M.Tech (VJTI Mumbai)", "Computer Engg", "8"],
        ["5", "Dr. Sanjay Bhattacharya", "Professor", "Ph.D (IIT Kharagpur)", "Information Tech", "19"],
        ["6", "Prof. Neha Gupta", "Assistant Professor", "M.Tech (BITS Pilani)", "Information Tech", "6"],
    ]
    t = Table(data, colWidths=[35, 140, 110, 110, 95, 45])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#243b53')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bcccdc')),
    ]))
    story.append(t)

    doc.build(story)
    return file_path


def generate_financial_statement(file_path: str, institution_name: str):
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=15, leading=18, alignment=1)
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=10, leading=14)

    story.append(Paragraph("KAPOOR & ASSOCIATES — CHARTERED ACCOUNTANTS", title_style))
    story.append(Paragraph("<b>AUDITED BALANCE SHEET & ENDOWMENT CORPUS CERTIFICATE</b>", ParagraphStyle('Sub', parent=title_style, fontSize=11)))
    story.append(Spacer(1, 15))

    story.append(Paragraph(
        f"We have audited the financial accounts of <b>{institution_name}</b> for Financial Year 2023-2024. "
        "The institution maintains an unencumbered Joint Fixed Deposit / Endowment Reserve Fund with AICTE in accordance with regulations.",
        body_style
    ))
    story.append(Spacer(1, 15))

    data = [
        ["Financial Fund Category", "Amount (INR Lakhs)", "Deposit Certificate No.", "Maturity Date"],
        ["AICTE Joint Reserve Fund", "INR 100.00 Lakhs", "FDR-PNB-2024-8841", "31-03-2034"],
        ["Institutional Corpus Fund", "INR 350.00 Lakhs", "FDR-SBI-2024-1129", "15-06-2029"],
        ["Operating Reserve Account", "INR 180.50 Lakhs", "CA-HDFC-99104", "Current Account"],
    ]
    t = Table(data, colWidths=[180, 120, 130, 90])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#102a43')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bcccdc')),
    ]))
    story.append(t)

    doc.build(story)
    return file_path


def generate_all_sample_pdfs():
    files = {
        "land_document": generate_land_document(os.path.join(SAMPLE_PDF_DIR, "meridian_land_record.pdf")),
        "fire_expired": generate_fire_safety_noc(os.path.join(SAMPLE_PDF_DIR, "meridian_fire_noc_expired.pdf"), "Meridian Institute of Technology", "NOC-MH-FIRE-2021-94", "15-11-2023", is_expired=True),
        "fire_renewed": generate_fire_safety_noc(os.path.join(SAMPLE_PDF_DIR, "meridian_fire_noc_renewed.pdf"), "Meridian Institute of Technology", "NOC-MH-FIRE-2024-88", "31-12-2027", is_expired=False),
        "faculty_list": generate_faculty_list(os.path.join(SAMPLE_PDF_DIR, "meridian_faculty_roster.pdf"), "Meridian Institute of Technology"),
        "financial_statement": generate_financial_statement(os.path.join(SAMPLE_PDF_DIR, "meridian_financial_audit.pdf"), "Meridian Institute of Technology"),
    }
    return files
