from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

Base = declarative_base()

class Entity(Base):
    __tablename__ = "entities"
    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(String(50), nullable=False, index=True)  # PERSON, PHONE, LOCATION, VEHICLE, BANK_ACCOUNT, ORGANIZATION
    name = Column(String(255), nullable=False, index=True)
    properties = Column(JSON, default=dict)  # Flexible JSON for type-specific fields
    risk_score = Column(Float, default=0.0)
    pagerank = Column(Float, default=0.0)
    betweenness = Column(Float, default=0.0)
    community_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    case_id = Column(String(50), nullable=True, default="dawood")

class Relationship(Base):
    __tablename__ = "relationships"
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    target_id = Column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    rel_type = Column(String(50), nullable=False, index=True)  # CALLED, TRANSFERRED_MONEY_TO, SPOTTED_AT, MENTIONED_IN_FIR, OWNS_VEHICLE, OWNS_ACCOUNT, ASSOCIATED_WITH
    weight = Column(Float, default=1.0)
    properties = Column(JSON, default=dict)
    timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    case_id = Column(String(50), nullable=True, default="dawood")

class FIR(Base):
    __tablename__ = "firs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    fir_number = Column(String(50), unique=True, nullable=True)
    date = Column(DateTime, nullable=True)
    police_station = Column(String(255), nullable=True)
    district = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=False)
    crime_type = Column(String(100), nullable=True)
    crime_confidence = Column(Float, nullable=True)
    extracted_entities = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    case_id = Column(String(50), nullable=True, default="dawood")

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(Integer, primary_key=True, autoincrement=True)
    anomaly_type = Column(String(100), nullable=False)  # BURST_CALLING, RAPID_MONEY_FLOW, GEO_ANOMALY, CIRCULAR_TRANSACTION, GHOST_CONNECTOR
    severity = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    evidence = Column(JSON, default=list)
    entity_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    case_id = Column(String(50), nullable=True, default="dawood")
