import os

DATABASE_URL = "sqlite:///./criminal_network.db"
UPLOAD_DIR = "./uploads"
CORS_ORIGINS = ["*"]

os.makedirs(UPLOAD_DIR, exist_ok=True)
