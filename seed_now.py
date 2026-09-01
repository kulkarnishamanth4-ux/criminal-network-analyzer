import os
import sys
sys.path.append(os.getcwd())

from backend.database.schema import SessionLocal
from scripts.seed_other_cases import seed_additional_cases

db = SessionLocal()
seed_additional_cases(db)
