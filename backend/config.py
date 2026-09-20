import os

# Default to completely offline local SQLite for air-gapped security
# To connect to cloud Supabase PostgreSQL, set USE_LOCAL_SQLITE=false or export DATABASE_URL
USE_LOCAL_SQLITE = os.environ.get("USE_LOCAL_SQLITE", "true").lower() in ("true", "1", "yes")

if USE_LOCAL_SQLITE:
    DATABASE_URL = os.environ.get("LOCAL_DATABASE_URL", "sqlite:///./criminal_network.db")
else:
    DATABASE_URL = os.environ.get(
        "DATABASE_URL", 
        "postgresql://postgres.ykhmwegxhauqozmgmqcm:herbscanai123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
    )

UPLOAD_DIR = "./uploads"
CORS_ORIGINS = ["*"]

os.makedirs(UPLOAD_DIR, exist_ok=True)

