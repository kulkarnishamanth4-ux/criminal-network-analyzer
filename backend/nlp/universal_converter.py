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
    from pypdf import PdfReader
    
    reader = PdfReader(io.BytesIO(content))
    extracted_text = []
    
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            extracted_text.append(page_text)
            
    full_text = "\n\n".join(extracted_text).strip()
    return full_text, []


def convert_docx_to_text_and_tables(content: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """Extracts paragraphs and tables from Word (.docx) documents."""
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
    return full_text, tables_data


def convert_excel_to_csv_text(content: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """Converts Excel workbook (.xlsx, .xls) into CSV text and row dicts."""
    df = pd.read_excel(io.BytesIO(content))
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_text = csv_buf.getvalue()
    records = df.fillna("").to_dict(orient="records")
    return csv_text, records


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
    Classifies the content into one of:
    - 'cdr' (Call Detail Records)
    - 'financial' (Banking / Hawala Ledger)
    - 'vehicle' (ANPR / Sighting Logs)
    - 'fir' (Incident narrative report)
    """
    fn_lower = filename.lower()
    t_lower = text_preview.lower()
    
    # Check headers in extracted tables or CSV lines
    if tables_data:
        keys = set(k.lower() for k in tables_data[0].keys())
        if any(k in keys for k in ["caller", "receiver", "calling_number", "dialed_number", "duration"]):
            return "cdr"
        if any(k in keys for k in ["amount", "sender_account", "receiver_account", "transaction_id", "inflow", "outflow"]):
            return "financial"
        if any(k in keys for k in ["plate_number", "vehicle", "camera_id", "toll_booth"]):
            return "vehicle"

    # Inspect CSV header line if text has comma separation
    first_line = t_lower.split("\n")[0] if "\n" in t_lower else t_lower
    if "," in first_line:
        cols = [c.strip() for c in first_line.split(",")]
        if any(c in cols for c in ["caller", "receiver", "calling", "dialed"]):
            return "cdr"
        if any(c in cols for c in ["amount", "sender", "receiver", "account", "transaction"]):
            return "financial"
        if any(c in cols for c in ["plate", "vehicle", "camera", "license"]):
            return "vehicle"

    # Filename clues
    if any(k in fn_lower for k in ["cdr", "call", "telecom"]):
        return "cdr"
    if any(k in fn_lower for k in ["bank", "financial", "transaction", "hawala", "ledger"]):
        return "financial"
    if any(k in fn_lower for k in ["vehicle", "anpr", "toll", "traffic", "plate"]):
        return "vehicle"

    # Default to FIR / narrative report
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
