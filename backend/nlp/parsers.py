import pandas as pd
import io
import csv

def parse_cdr_csv(file_content: bytes) -> list[dict]:
    """Parse Call Detail Records CSV.
    Expected columns: caller, receiver, timestamp, duration_seconds, cell_tower
    Returns list of dicts with these keys.
    Handle missing columns gracefully."""
    try:
        text = file_content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))
        expected_cols = ['caller', 'receiver', 'timestamp', 'duration_seconds', 'cell_tower']
        
        results = []
        for row in reader:
            parsed = {}
            for col in expected_cols:
                parsed[col] = row.get(col, '')
            results.append(parsed)
        return results
    except Exception as e:
        print(f"Error parsing CDR CSV: {e}")
        return []

def parse_financial_csv(file_content: bytes) -> list[dict]:
    """Parse Financial Transaction CSV.
    Expected columns: sender_account, sender_name, receiver_account, receiver_name, amount, timestamp, purpose, bank
    Returns list of dicts."""
    try:
        text = file_content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))
        expected_cols = ['sender_account', 'sender_name', 'receiver_account', 'receiver_name', 'amount', 'timestamp', 'purpose', 'bank']
        
        results = []
        for row in reader:
            parsed = {}
            for col in expected_cols:
                parsed[col] = row.get(col, '')
            results.append(parsed)
        return results
    except Exception as e:
        print(f"Error parsing Financial CSV: {e}")
        return []

def parse_vehicle_csv(file_content: bytes) -> list[dict]:
    """Parse Vehicle Sighting CSV.
    Expected columns: plate_number, location, timestamp, camera_id
    Returns list of dicts."""
    try:
        text = file_content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))
        expected_cols = ['plate_number', 'location', 'timestamp', 'camera_id']
        
        results = []
        for row in reader:
            parsed = {}
            for col in expected_cols:
                parsed[col] = row.get(col, '')
            results.append(parsed)
        return results
    except Exception as e:
        print(f"Error parsing Vehicle CSV: {e}")
        return []
