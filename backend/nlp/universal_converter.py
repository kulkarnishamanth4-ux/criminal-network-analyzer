"""
Universal Multi-Format File Ingestion & Conversion Engine.
Converts any incoming file (.pdf, .docx, .xlsx, .xls, .md, .txt, .csv)
into either:
1. Clean text (.txt) for First Information Reports (FIRs) and narrative intel, or
2. Structured tabular CSV for CDR, Financial, or ANPR Vehicle records.
"""

import io
import re
import csv
from typing import Tuple, Dict, Any, List, Optional
import pandas as pd


def convert_pdf_to_text_and_tables(content: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """Extracts text and any tabular data from PDF bytes using pypdf."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        if len(reader.pages) == 0:
            raise ValueError("PDF document has 0 pages or contains no readable content.")
        extracted_text = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_text.append(page_text)
                
        full_text = "\n\n".join(extracted_text).strip()
        if not full_text:
            raise ValueError("PDF document contains no extractable text (may be a blank scan or encrypted).")
        return full_text, []
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Corrupt or invalid PDF file: {str(e)}")


def convert_docx_to_text_and_tables(content: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """Extracts paragraphs and tables from Word (.docx) documents."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(content))
        text_parts = [p.text for p in doc.paragraphs if p.text.strip()]
        
        tables_data = []
        for table in doc.tables:
            rows = []
            for row in table.rows:
                rows.append([cell.text.strip() for cell in row.cells])
            if len(rows) > 1:
                headers = [h.lower() for h in rows[0]]
                for r in rows[1:]:
                    if len(r) == len(headers):
                        tables_data.append(dict(zip(headers, r)))
                        
        full_text = "\n".join(text_parts).strip()
        if not full_text and not tables_data:
            raise ValueError("Word document (.docx) contains no readable text or tables.")
        return full_text, tables_data
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Corrupt or invalid Word (.docx) document: {str(e)}")


def convert_excel_to_csv_text(content: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """Converts Excel workbook (.xlsx, .xls) into CSV text and row dicts."""
    try:
        df = pd.read_excel(io.BytesIO(content))
        if df.empty:
            raise ValueError("Excel spreadsheet is empty (0 data rows).")
        csv_buf = io.StringIO()
        df.to_csv(csv_buf, index=False)
        csv_text = csv_buf.getvalue()
        records = df.fillna("").to_dict(orient="records")
        return csv_text, records
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Corrupt or unreadable Excel spreadsheet: {str(e)}")


def convert_markdown_to_text(content: bytes) -> str:
    """Strips Markdown syntax into clean plain text."""
    try:
        raw = content.decode("utf-8")
    except UnicodeDecodeError:
        raw = content.decode("latin-1")
        
    # Remove markdown links, headings, bold/italic, code blocks
    cleaned = re.sub(r'```[\s\S]*?```', '', raw)
    cleaned = re.sub(r'#+\s*', '', cleaned)
    cleaned = re.sub(r'[*_~`]', '', cleaned)
    cleaned = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', cleaned)
    return cleaned.strip()


def detect_file_nature(filename: str, content: bytes, text_preview: str, tables_data: List[Dict[str, Any]]) -> str:
    """
    Classifies incoming evidence content into one of:
    - 'fir' (First Information Report / Narrative Police Intel)
    - 'cdr' (Call Detail Records / Telecom Logs)
    - 'financial' (Banking / Hawala Transaction Ledgers)
    - 'vehicle' (ANPR / Vehicle Sighting Logs)
    """
    fn_lower = filename.lower()
    t_lower = text_preview.lower()
    
    # 1. Strong FIR Content Signatures (Narrative Police Reports)
    fir_text_keywords = [
        "first information report", "fir no", "police station", "ps ",
        "under section", "u/s", "indian penal code", "ipc", "cr.p.c", "crpc",
        "complainant", "accused details", "details of the offence",
        "economic offences", "sub-inspector", "inspector", "station house officer"
    ]
    if any(kw in t_lower for kw in fir_text_keywords):
        return "fir"

    # 2. Strong Filename Clues for FIR
    if any(k in fn_lower for k in ["fir", "complaint", "police_report", "crime_report", "incident_report"]):
        return "fir"

    # 3. Check headers in extracted tables (from docx/pdf/excel)
    if tables_data:
        keys = set(k.lower() for k in tables_data[0].keys())
        if any(k in keys for k in ["caller", "receiver", "calling_number", "dialed_number", "duration", "cell_tower", "call_type"]):
            return "cdr"
        if any(k in keys for k in ["amount", "sender_account", "receiver_account", "transaction_id", "inflow", "outflow", "utr", "bank"]):
            return "financial"
        if any(k in keys for k in ["plate_number", "license_plate", "vehicle", "camera_id", "toll_booth", "speed"]):
            return "vehicle"

    # 4. Inspect CSV / Delimited header line
    lines = [line.strip() for line in t_lower.split("\n") if line.strip()]
    if lines:
        header_candidate = lines[0]
        # Check first line or second line if first is a title
        for cand in [lines[0], lines[1] if len(lines) > 1 else ""]:
            if not cand or "," not in cand:
                continue
            cols = [c.strip().strip('"').strip("'") for c in cand.split(",")]
            cols_lower = [c.lower() for c in cols]
            
            # CDR Headers
            if any(k in cols_lower for k in ["caller", "receiver", "calling_number", "dialed_number", "duration", "duration_seconds", "cell_tower", "call_type"]):
                return "cdr"
            # Financial Headers
            if any(k in cols_lower for k in ["amount", "sender_account", "receiver_account", "transaction_id", "utr", "sender_name", "receiver_name", "debit", "credit", "bank"]):
                return "financial"
            # Vehicle Headers
            if any(k in cols_lower for k in ["plate_number", "plate", "license_plate", "camera_id", "toll_booth", "location", "vehicle"]):
                return "vehicle"

    # 5. Filename clues for tabular logs
    if any(k in fn_lower for k in ["cdr", "call", "telecom"]):
        return "cdr"
    if any(k in fn_lower for k in ["bank", "financial", "transaction", "hawala", "ledger"]):
        return "financial"
    if any(k in fn_lower for k in ["vehicle", "anpr", "toll", "traffic", "plate"]):
        return "vehicle"

    # 6. Default to FIR / narrative report for unstructured documents
    return "fir"


def universal_ingest_file(filename: str, content: bytes) -> Dict[str, Any]:
    """
    Main universal conversion pipeline entry point.
    Converts any file type (.pdf, .docx, .xlsx, .xls, .md, .txt, .csv) into
    normalized text/csv representation ready for ingestion.
    """
    fn_lower = filename.lower()
    tables_data = []
    converted_text = ""
    converted_format = "txt"

    if fn_lower.endswith(".pdf"):
        converted_text, tables_data = convert_pdf_to_text_and_tables(content)
        converted_format = "txt"
    elif fn_lower.endswith(".docx"):
        converted_text, tables_data = convert_docx_to_text_and_tables(content)
        converted_format = "txt"
    elif fn_lower.endswith((".xlsx", ".xls")):
        converted_text, tables_data = convert_excel_to_csv_text(content)
        converted_format = "csv"
    elif fn_lower.endswith(".md"):
        converted_text = convert_markdown_to_text(content)
        converted_format = "txt"
    elif fn_lower.endswith(".csv"):
        try:
            converted_text = content.decode("utf-8")
        except UnicodeDecodeError:
            converted_text = content.decode("latin-1")
        converted_format = "csv"
    else:  # Standard text or unknown text-based file
        try:
            converted_text = content.decode("utf-8")
        except UnicodeDecodeError:
            converted_text = content.decode("latin-1", errors="ignore")
        converted_format = "txt"

    detected_type = detect_file_nature(filename, content, converted_text, tables_data)

    return {
        "original_filename": filename,
        "detected_type": detected_type,
        "converted_format": converted_format,
        "clean_content": converted_text,
        "clean_bytes": converted_text.encode("utf-8"),
        "tables_data": tables_data,
        "char_count": len(converted_text),
        "is_tabular": converted_format == "csv" or len(tables_data) > 0
    }
