import os

# Use Supabase PostgreSQL as the primary database
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres.ykhmwegxhauqozmgmqcm:herbscanai123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres")
UPLOAD_DIR = "./uploads"
CORS_ORIGINS = ["*"]

os.makedirs(UPLOAD_DIR, exist_ok=True)
