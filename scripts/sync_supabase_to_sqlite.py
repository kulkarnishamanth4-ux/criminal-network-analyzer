"""
Syncs all cases, entities, relationships, FIRs, and anomalies
from Supabase PostgreSQL to the offline local SQLite database.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.models import Entity, Relationship, FIR, Anomaly, UploadedFile

PG_URL = 'postgresql://postgres.ykhmwegxhauqozmgmqcm:herbscanai123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres'
SQLITE_URL = 'sqlite:///./criminal_network.db'


def sync_all():
    pg_engine = create_engine(PG_URL)
    sqlite_engine = create_engine(SQLITE_URL)

    PgSession = sessionmaker(bind=pg_engine)
    SqliteSession = sessionmaker(bind=sqlite_engine)

    pg_db = PgSession()
    sq_db = SqliteSession()

    print('Starting sync from Supabase PostgreSQL to criminal_network.db...')
    
    sq_db.query(Relationship).delete()
    sq_db.query(Entity).delete()
    sq_db.query(FIR).delete()
    sq_db.query(Anomaly).delete()
    sq_db.commit()

    for e in pg_db.query(Entity).all():
        sq_db.add(Entity(
            id=e.id,
            entity_type=e.entity_type,
            name=e.name,
            properties=e.properties,
            risk_score=e.risk_score,
            pagerank=e.pagerank,
            betweenness=e.betweenness,
            community_id=e.community_id,
            case_id=e.case_id,
            created_at=e.created_at
        ))
    sq_db.commit()

    for r in pg_db.query(Relationship).all():
        sq_db.add(Relationship(
            id=r.id,
            source_id=r.source_id,
            target_id=r.target_id,
            rel_type=r.rel_type,
            weight=r.weight,
            properties=r.properties,
            timestamp=r.timestamp,
            case_id=r.case_id,
            created_at=r.created_at
        ))
    sq_db.commit()

    for f in pg_db.query(FIR).all():
        sq_db.add(FIR(
            id=f.id,
            fir_number=f.fir_number,
            date=f.date,
            police_station=f.police_station,
            district=f.district,
            raw_text=f.raw_text,
            crime_type=f.crime_type,
            crime_confidence=f.crime_confidence,
            extracted_entities=f.extracted_entities,
            case_id=f.case_id,
            created_at=f.created_at
        ))
    sq_db.commit()

    for a in pg_db.query(Anomaly).all():
        sq_db.add(Anomaly(
            id=a.id,
            anomaly_type=a.anomaly_type,
            severity=a.severity,
            title=a.title,
            description=a.description,
            evidence=a.evidence,
            entity_ids=a.entity_ids,
            case_id=a.case_id,
            created_at=a.created_at
        ))
    sq_db.commit()

    print(f'Sync complete. Copied {sq_db.query(Entity).count()} entities, {sq_db.query(Relationship).count()} edges, {sq_db.query(Anomaly).count()} anomalies.')
    pg_db.close()
    sq_db.close()


if __name__ == '__main__':
    sync_all()
