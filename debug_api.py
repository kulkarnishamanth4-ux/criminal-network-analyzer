import sys
import threading
import time
import requests
import uvicorn
from backend.main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8011, log_level="error")

t = threading.Thread(target=run_server, daemon=True)
t.start()
time.sleep(5)

try:
    r = requests.get('http://127.0.0.1:8011/api/graph/full?case_id=cyber_bengaluru')
    print("STATUS:", r.status_code)
    print("JSON:", r.text[:500])
except Exception as e:
    print("ERROR:", e)
