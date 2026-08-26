import os

DATABASE_URL = "sqlite:///./criminal_network.db"
UPLOAD_DIR = "./uploads"
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]

os.makedirs(UPLOAD_DIR, exist_ok=True)
