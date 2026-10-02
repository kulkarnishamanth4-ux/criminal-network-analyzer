"""
Generates test evidence files in .xlsx, .pdf, and .docx formats
for verifying the custom investigation pipeline handles all file types.
All files contain coherent, interconnected crime data.
"""
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "public", "samples")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_xlsx_cdr():
    """Generate CDR records as .xlsx"""
    import pandas as pd
    records = [
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-15T22:10:00",
            "duration_seconds": 180,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-76543-21098",
            "timestamp": "2026-09-15T22:15:00",
            "duration_seconds": 45,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-87654-32109",
            "receiver": "+91-76543-21098",
            "timestamp": "2026-09-15T23:00:00",
            "duration_seconds": 320,
            "cell_tower": "DEL-LAJPAT-0018"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-15T23:05:00",
            "duration_seconds": 12,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-15T23:08:00",
            "duration_seconds": 8,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-15T23:12:00",
            "duration_seconds": 22,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-15T23:18:00",
            "duration_seconds": 15,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-15T23:25:00",
            "duration_seconds": 30,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-76543-21098",
            "receiver": "+91-65432-10987",
            "timestamp": "2026-09-16T01:00:00",
            "duration_seconds": 600,
            "cell_tower": "MUM-ANDHERI-0091"
        },
        {
            "caller": "+91-65432-10987",
            "receiver": "+91-54321-09876",
            "timestamp": "2026-09-16T02:30:00",
            "duration_seconds": 420,
            "cell_tower": "MUM-BANDRA-0044"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-65432-10987",
            "timestamp": "2026-09-16T09:00:00",
            "duration_seconds": 240,
            "cell_tower": "DEL-NEHRU-0055"
        },
        {
            "caller": "+91-54321-09876",
            "receiver": "+91-98112-34567",
            "timestamp": "2026-09-16T14:30:00",
            "duration_seconds": 90,
            "cell_tower": "HYD-HITEC-0012"
        },
        {
            "caller": "+91-87654-32109",
            "receiver": "+91-54321-09876",
            "timestamp": "2026-09-17T10:15:00",
            "duration_seconds": 150,
            "cell_tower": "DEL-LAJPAT-0018"
        },
        {
            "caller": "+91-76543-21098",
            "receiver": "+91-98112-34567",
            "timestamp": "2026-09-17T22:45:00",
            "duration_seconds": 35,
            "cell_tower": "MUM-ANDHERI-0091"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-17T22:50:00",
            "duration_seconds": 18,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-17T22:55:00",
            "duration_seconds": 10,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-17T23:00:00",
            "duration_seconds": 25,
            "cell_tower": "DEL-SAKET-0042"
        },
        {
            "caller": "+91-98112-34567",
            "receiver": "+91-87654-32109",
            "timestamp": "2026-09-17T23:05:00",
            "duration_seconds": 14,
            "cell_tower": "DEL-SAKET-0042"
        },
    ]
    df = pd.DataFrame(records)
    path = os.path.join(OUTPUT_DIR, "sample_cdr_records.xlsx")
    df.to_excel(path, index=False, sheet_name="CDR Records")
    print(f"  Created {path} ({len(records)} rows)")


def generate_xlsx_financial():
    """Generate Financial Transactions as .xlsx"""
    import pandas as pd
    records = [
        {"sender_account": "SBI-9910234561", "sender_name": "Naveen Tiwari", "receiver_account": "HDFC-8820345672", "receiver_name": "Pankaj Mishra", "amount": 2500000, "timestamp": "2026-09-10T10:30:00", "purpose": "Business Advance", "bank": "SBI"},
        {"sender_account": "HDFC-8820345672", "sender_name": "Pankaj Mishra", "receiver_account": "ICICI-7730456783", "receiver_name": "Rohit Aggarwal", "amount": 2450000, "timestamp": "2026-09-10T11:15:00", "purpose": "Vendor Payment", "bank": "HDFC"},
        {"sender_account": "ICICI-7730456783", "sender_name": "Rohit Aggarwal", "receiver_account": "SBI-9910234561", "receiver_name": "Naveen Tiwari", "amount": 2400000, "timestamp": "2026-09-10T12:00:00", "purpose": "Loan Repayment", "bank": "ICICI"},
        {"sender_account": "PNB-6640567894", "sender_name": "Seema Devi", "receiver_account": "BOB-5550678905", "receiver_name": "Arun Saxena", "amount": 500000, "timestamp": "2026-09-11T09:00:00", "purpose": "Property", "bank": "PNB"},
        {"sender_account": "BOB-5550678905", "sender_name": "Arun Saxena", "receiver_account": "HDFC-8820345672", "receiver_name": "Pankaj Mishra", "amount": 480000, "timestamp": "2026-09-11T09:45:00", "purpose": "Consultation Fee", "bank": "BOB"},
        {"sender_account": "SBI-9910234561", "sender_name": "Naveen Tiwari", "receiver_account": "PNB-6640567894", "receiver_name": "Seema Devi", "amount": 1500000, "timestamp": "2026-09-12T14:00:00", "purpose": "Gift", "bank": "SBI"},
        {"sender_account": "HDFC-8820345672", "sender_name": "Pankaj Mishra", "receiver_account": "BOB-5550678905", "receiver_name": "Arun Saxena", "amount": 750000, "timestamp": "2026-09-13T16:30:00", "purpose": "Investment", "bank": "HDFC"},
        {"sender_account": "ICICI-7730456783", "sender_name": "Rohit Aggarwal", "receiver_account": "PNB-6640567894", "receiver_name": "Seema Devi", "amount": 350000, "timestamp": "2026-09-14T08:00:00", "purpose": "Business Advance", "bank": "ICICI"},
        {"sender_account": "BOB-5550678905", "sender_name": "Arun Saxena", "receiver_account": "SBI-9910234561", "receiver_name": "Naveen Tiwari", "amount": 900000, "timestamp": "2026-09-14T11:30:00", "purpose": "Vendor Advance", "bank": "BOB"},
        {"sender_account": "PNB-6640567894", "sender_name": "Seema Devi", "receiver_account": "ICICI-7730456783", "receiver_name": "Rohit Aggarwal", "amount": 1200000, "timestamp": "2026-09-15T10:00:00", "purpose": "Software Export", "bank": "PNB"},
    ]
    df = pd.DataFrame(records)
    path = os.path.join(OUTPUT_DIR, "sample_financial_ledger.xlsx")
    df.to_excel(path, index=False, sheet_name="Financial Transactions")
    print(f"  Created {path} ({len(records)} rows)")


def generate_xlsx_vehicle():
    """Generate Vehicle Sightings as .xlsx"""
    import pandas as pd
    records = [
        {"plate_number": "DL-01-MK-4521", "location": "Saket, New Delhi", "timestamp": "2026-09-15T14:10:00", "camera_id": "DEL-SAKET-CAM-01"},
        {"plate_number": "DL-01-MK-4521", "location": "Lajpat Nagar, New Delhi", "timestamp": "2026-09-15T14:28:00", "camera_id": "DEL-LAJPAT-CAM-03"},
        {"plate_number": "MH-02-BZ-9901", "location": "Andheri West, Mumbai", "timestamp": "2026-09-16T01:05:00", "camera_id": "MUM-AND-CAM-07"},
        {"plate_number": "MH-02-BZ-9901", "location": "Bandra, Mumbai", "timestamp": "2026-09-16T02:40:00", "camera_id": "MUM-BDR-CAM-02"},
        {"plate_number": "UP-32-AB-7890", "location": "Noida Sector 62", "timestamp": "2026-09-16T09:15:00", "camera_id": "NOIDA-S62-CAM-05"},
        {"plate_number": "DL-01-MK-4521", "location": "Nehru Place, New Delhi", "timestamp": "2026-09-16T09:30:00", "camera_id": "DEL-NP-CAM-11"},
        {"plate_number": "TS-09-HA-3344", "location": "HITEC City, Hyderabad", "timestamp": "2026-09-16T14:45:00", "camera_id": "HYD-HTC-CAM-04"},
        {"plate_number": "DL-01-MK-4521", "location": "Connaught Place, New Delhi", "timestamp": "2026-09-17T10:30:00", "camera_id": "DEL-CP-CAM-08"},
        {"plate_number": "MH-02-BZ-9901", "location": "Dadar, Mumbai", "timestamp": "2026-09-17T11:00:00", "camera_id": "MUM-DDR-CAM-06"},
        {"plate_number": "UP-32-AB-7890", "location": "Greater Noida Expressway", "timestamp": "2026-09-17T22:55:00", "camera_id": "NOIDA-EXP-CAM-01"},
    ]
    df = pd.DataFrame(records)
    path = os.path.join(OUTPUT_DIR, "sample_vehicle_sightings.xlsx")
    df.to_excel(path, index=False, sheet_name="Vehicle Sightings")
    print(f"  Created {path} ({len(records)} rows)")


def generate_pdf_fir():
    """Generate a realistic FIR report as .pdf"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

    path = os.path.join(OUTPUT_DIR, "sample_fir_report.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            leftMargin=50, rightMargin=50,
                            topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('FIRTitle', parent=styles['Title'], fontSize=16, spaceAfter=12)
    heading_style = ParagraphStyle('FIRHead', parent=styles['Heading2'], fontSize=13, spaceAfter=6, spaceBefore=10)
    body_style = ParagraphStyle('FIRBody', parent=styles['Normal'], fontSize=11, leading=16, spaceAfter=8)

    content = []

    content.append(Paragraph("FIRST INFORMATION REPORT (FIR)", title_style))
    content.append(Paragraph("Under Section 154 Cr.P.C.", styles['Normal']))
    content.append(Spacer(1, 12))

    content.append(Paragraph("FIR Details", heading_style))
    content.append(Paragraph(
        "<b>FIR No:</b> 0891/2026 &nbsp;&nbsp; <b>Police Station:</b> Saket, South District, New Delhi<br/>"
        "<b>Date:</b> 18-09-2026 &nbsp;&nbsp; <b>Sections:</b> IPC 420, 467, 468, 471, 120B, IT Act Sec 66C/66D<br/>"
        "<b>District:</b> South Delhi &nbsp;&nbsp; <b>State:</b> Delhi",
        body_style
    ))

    content.append(Paragraph("Complainant", heading_style))
    content.append(Paragraph(
        "Sub-Inspector Arvind Mehta, Cyber Crime Cell, South District, New Delhi. "
        "Contact: +91-98112-34567. Badge: DL-POL-CYBER-4412.",
        body_style
    ))

    content.append(Paragraph("Details of the Occurrence", heading_style))
    content.append(Paragraph(
        "Acting on intelligence inputs from the National Cyber Crime Reporting Portal (I4C), "
        "an investigation was initiated into a sophisticated multi-layered financial fraud and "
        "identity theft syndicate operating across Delhi-NCR, Mumbai, and Hyderabad. The syndicate, "
        "led by the accused <b>Naveen Tiwari urf Navi</b> (Age 38, s/o Late Dharampal Tiwari, "
        "r/o C-42 Saket, New Delhi), has been systematically defrauding senior citizens and NRI "
        "investors through fabricated KYC renewal portals and phishing SMS campaigns.",
        body_style
    ))
    content.append(Paragraph(
        "Accused No. 2: <b>Pankaj Mishra</b> (Age 35, r/o D-18 Lajpat Nagar, New Delhi) operates "
        "the technical infrastructure including cloned banking portals hosted on offshore servers. "
        "Accused No. 3: <b>Rohit Aggarwal urf Ricky</b> (Age 29, r/o Sector 62 Noida, Uttar Pradesh) "
        "manages the network of cash mules and cryptocurrency conversion pipelines. "
        "Accused No. 4: <b>Seema Devi</b> (Age 41, r/o Andheri West, Mumbai) serves as the chief "
        "money mule coordinator, recruiting vulnerable individuals to open bank accounts for layering "
        "stolen funds. Accused No. 5: <b>Arun Saxena</b> (Age 45, r/o HITEC City, Hyderabad) manages "
        "the hawala channel converting defrauded INR into USDT cryptocurrency through shell exchanges.",
        body_style
    ))
    content.append(Paragraph(
        "Investigation reveals that between 01-07-2026 and 15-09-2026, the accused persons have "
        "defrauded at least 47 victims across 6 states, siphoning a total of approximately "
        "Rs. 4.82 Crore (Rupees Four Crore Eighty-Two Lakh). The modus operandi involves sending "
        "bulk phishing SMS from spoofed SenderIDs mimicking SBI, HDFC, and ICICI banks, directing "
        "victims to counterfeit KYC renewal portals. Victims enter Aadhaar, PAN, and OTP credentials "
        "which are harvested in real-time by the accused's command-and-control server.",
        body_style
    ))

    content.append(Paragraph("Evidence Recovered", heading_style))
    content.append(Paragraph(
        "1. Two laptops and three mobile phones seized from Naveen Tiwari's Saket residence.<br/>"
        "2. Vehicle <b>DL-01-MK-4521</b> (Silver Honda City) registered in the name of accused Naveen Tiwari, "
        "spotted via ANPR cameras at Saket, Lajpat Nagar, Nehru Place, and Connaught Place.<br/>"
        "3. Vehicle <b>MH-02-BZ-9901</b> (Black Toyota Innova) registered to accused Seema Devi, spotted at "
        "Andheri, Bandra, and Dadar toll cameras.<br/>"
        "4. Vehicle <b>UP-32-AB-7890</b> (White Hyundai i20) used by accused Rohit Aggarwal, spotted at "
        "Noida Sector 62 and Greater Noida Expressway.<br/>"
        "5. Vehicle <b>TS-09-HA-3344</b> (Grey Maruti Swift) used by Arun Saxena in Hyderabad.<br/>"
        "6. Bank accounts SBI-9910234561 (Naveen Tiwari), HDFC-8820345672 (Pankaj Mishra), "
        "ICICI-7730456783 (Rohit Aggarwal), PNB-6640567894 (Seema Devi), BOB-5550678905 (Arun Saxena) "
        "showing suspicious circular transactions and rapid fund layering.<br/>"
        "7. Intercepted CDR records show burst calling patterns between +91-98112-34567 (Naveen) and "
        "+91-87654-32109 (Pankaj) during late night hours, indicative of operational coordination.<br/>"
        "8. Organization <b>GlobalTech Solutions Pvt. Ltd.</b> and <b>Sunrise Digital Services</b> identified "
        "as shell front companies used for layering stolen funds through fake software export invoices.",
        body_style
    ))

    content.append(Paragraph("Action Requested", heading_style))
    content.append(Paragraph(
        "Request for non-bailable warrants against all five accused persons. Freeze orders on all "
        "identified bank accounts. Section 65B certificates for digital evidence preservation. "
        "Red Corner lookout notice for accused Arun Saxena who may attempt to flee to Dubai.",
        body_style
    ))
    content.append(Spacer(1, 24))
    content.append(Paragraph(
        "<b>SI Arvind Mehta</b><br/>Cyber Crime Cell, South District, New Delhi<br/>Date: 18-09-2026",
        body_style
    ))

    doc.build(content)
    print(f"  Created {path}")


def generate_docx_fir():
    """Generate a realistic FIR report as .docx"""
    import docx
    
    path = os.path.join(OUTPUT_DIR, "sample_fir_report.docx")
    doc = docx.Document()
    
    doc.add_heading("FIRST INFORMATION REPORT (FIR)", level=0)
    doc.add_paragraph("Under Section 154 Cr.P.C.")
    
    doc.add_heading("FIR Details", level=1)
    p = doc.add_paragraph()
    p.add_run("FIR No: ").bold = True
    p.add_run("0891/2026    ")
    p.add_run("Police Station: ").bold = True
    p.add_run("Saket, South District, New Delhi\n")
    p.add_run("Date: ").bold = True
    p.add_run("18-09-2026    ")
    p.add_run("Sections: ").bold = True
    p.add_run("IPC 420, 467, 468, 471, 120B, IT Act Sec 66C/66D\n")
    p.add_run("District: ").bold = True
    p.add_run("South Delhi    ")
    p.add_run("State: ").bold = True
    p.add_run("Delhi")
    
    doc.add_heading("Complainant", level=1)
    doc.add_paragraph(
        "Sub-Inspector Arvind Mehta, Cyber Crime Cell, South District, New Delhi. "
        "Contact: +91-98112-34567. Badge: DL-POL-CYBER-4412."
    )
    
    doc.add_heading("Details of the Occurrence", level=1)
    doc.add_paragraph(
        "Acting on intelligence inputs from the National Cyber Crime Reporting Portal (I4C), "
        "an investigation was initiated into a sophisticated multi-layered financial fraud and "
        "identity theft syndicate operating across Delhi-NCR, Mumbai, and Hyderabad. The syndicate, "
        "led by the accused Naveen Tiwari urf Navi (Age 38, s/o Late Dharampal Tiwari, "
        "r/o C-42 Saket, New Delhi), has been systematically defrauding senior citizens and NRI "
        "investors through fabricated KYC renewal portals and phishing SMS campaigns."
    )
    doc.add_paragraph(
        "Accused No. 2: Pankaj Mishra (Age 35, r/o D-18 Lajpat Nagar, New Delhi) operates "
        "the technical infrastructure including cloned banking portals hosted on offshore servers. "
        "Accused No. 3: Rohit Aggarwal urf Ricky (Age 29, r/o Sector 62 Noida, Uttar Pradesh) "
        "manages the network of cash mules and cryptocurrency conversion pipelines. "
        "Accused No. 4: Seema Devi (Age 41, r/o Andheri West, Mumbai) serves as the chief "
        "money mule coordinator, recruiting vulnerable individuals to open bank accounts for layering "
        "stolen funds. Accused No. 5: Arun Saxena (Age 45, r/o HITEC City, Hyderabad) manages "
        "the hawala channel converting defrauded INR into USDT cryptocurrency through shell exchanges."
    )
    doc.add_paragraph(
        "Investigation reveals that between 01-07-2026 and 15-09-2026, the accused persons have "
        "defrauded at least 47 victims across 6 states, siphoning a total of approximately "
        "Rs. 4.82 Crore (Rupees Four Crore Eighty-Two Lakh). The modus operandi involves sending "
        "bulk phishing SMS from spoofed SenderIDs mimicking SBI, HDFC, and ICICI banks, directing "
        "victims to counterfeit KYC renewal portals. Victims enter Aadhaar, PAN, and OTP credentials "
        "which are harvested in real-time by the accused's command-and-control server."
    )

    doc.add_heading("Evidence Recovered", level=1)
    doc.add_paragraph(
        "1. Two laptops and three mobile phones seized from Naveen Tiwari's Saket residence."
    )
    doc.add_paragraph(
        "2. Vehicle DL-01-MK-4521 (Silver Honda City) registered in the name of accused Naveen Tiwari, "
        "spotted via ANPR cameras at Saket, Lajpat Nagar, Nehru Place, and Connaught Place."
    )
    doc.add_paragraph(
        "3. Vehicle MH-02-BZ-9901 (Black Toyota Innova) registered to accused Seema Devi, spotted at "
        "Andheri, Bandra, and Dadar toll cameras."
    )
    doc.add_paragraph(
        "4. Vehicle UP-32-AB-7890 (White Hyundai i20) used by accused Rohit Aggarwal, spotted at "
        "Noida Sector 62 and Greater Noida Expressway."
    )
    doc.add_paragraph(
        "5. Vehicle TS-09-HA-3344 (Grey Maruti Swift) used by Arun Saxena in Hyderabad."
    )
    doc.add_paragraph(
        "6. Bank accounts SBI-9910234561 (Naveen Tiwari), HDFC-8820345672 (Pankaj Mishra), "
        "ICICI-7730456783 (Rohit Aggarwal), PNB-6640567894 (Seema Devi), BOB-5550678905 (Arun Saxena) "
        "showing suspicious circular transactions and rapid fund layering."
    )
    doc.add_paragraph(
        "7. Intercepted CDR records show burst calling patterns between +91-98112-34567 (Naveen) and "
        "+91-87654-32109 (Pankaj) during late night hours, indicative of operational coordination."
    )
    doc.add_paragraph(
        "8. Organization GlobalTech Solutions Pvt. Ltd. and Sunrise Digital Services identified "
        "as shell front companies used for layering stolen funds through fake software export invoices."
    )

    doc.add_heading("Action Requested", level=1)
    doc.add_paragraph(
        "Request for non-bailable warrants against all five accused persons. Freeze orders on all "
        "identified bank accounts. Section 65B certificates for digital evidence preservation. "
        "Red Corner lookout notice for accused Arun Saxena who may attempt to flee to Dubai."
    )
    doc.add_paragraph("")
    p2 = doc.add_paragraph()
    p2.add_run("SI Arvind Mehta\n").bold = True
    p2.add_run("Cyber Crime Cell, South District, New Delhi\nDate: 18-09-2026")

    doc.save(path)
    print(f"  Created {path}")


if __name__ == "__main__":
    print("Generating test evidence files...")
    generate_xlsx_cdr()
    generate_xlsx_financial()
    generate_xlsx_vehicle()
    generate_pdf_fir()
    generate_docx_fir()
    print("All test files generated successfully!")
