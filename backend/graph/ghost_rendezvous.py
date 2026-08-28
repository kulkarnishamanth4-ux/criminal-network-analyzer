from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.database.models import Entity, Relationship
from collections import defaultdict

def detect_ghost_rendezvous(db: Session, max_time_diff_hours: int = 48) -> dict:
    """
    Spatiotemporal Ghost-Rendezvous Engine (4D Trajectory Co-Location Intersection).
    Uncovers covert physical rendezvous between suspects who deliberately avoid
    direct phone calls or direct bank transfers with each other.
    Uses ACTUAL timestamps to verify they were at the same location within `max_time_diff_hours`.
    """
    persons = db.query(Entity).filter(Entity.entity_type == "PERSON").all()
    if len(persons) < 2:
        return {"status": "empty", "rendezvous_events": [], "count": 0}
        
    person_ids = {p.id: p.name for p in persons}
    
    # 1. Map all direct communication/financial links to verify absence of direct contact
    direct_ties = set()
    
    # We need to map Person -> Phone, Person -> Bank Account to resolve 2nd degree ties
    person_phones = defaultdict(list)
    person_accounts = defaultdict(list)
    
    for rel in db.query(Relationship).all():
        if rel.rel_type == "OWNS_PHONE":
            person_phones[rel.source_id].append(rel.target_id)
        elif rel.rel_type == "OWNS_ACCOUNT":
            person_accounts[rel.source_id].append(rel.target_id)
            
    # Resolve Person to Person direct ties via Phones and Accounts
    for rel in db.query(Relationship).all():
        if rel.rel_type == "CALLED":
            # Phone to Phone
            p1 = next((p for p, phones in person_phones.items() if rel.source_id in phones), None)
            p2 = next((p for p, phones in person_phones.items() if rel.target_id in phones), None)
            if p1 and p2:
                direct_ties.add(tuple(sorted([p1, p2])))
        elif rel.rel_type == "TRANSFERRED_MONEY_TO":
            # Account to Account
            p1 = next((p for p, accs in person_accounts.items() if rel.source_id in accs), None)
            p2 = next((p for p, accs in person_accounts.items() if rel.target_id in accs), None)
            if p1 and p2:
                direct_ties.add(tuple(sorted([p1, p2])))

    # 2. Extract Spatio-temporal traces
    person_locations = defaultdict(list)
    
    # Vehicle sightings
    owns_vehicle_rels = db.query(Relationship).filter(Relationship.rel_type == "OWNS_VEHICLE").all()
    vehicle_owners = {r.target_id: r.source_id for r in owns_vehicle_rels}
    
    for sr in db.query(Relationship).filter(Relationship.rel_type == "SPOTTED_AT").all():
        loc = db.query(Entity).filter(Entity.id == sr.target_id).first()
        if not loc: continue
        
        ts = sr.timestamp or datetime.utcnow()
        owner_id = vehicle_owners.get(sr.source_id)
        
        # Direct person spotted at (e.g., from FIR parsing or check-ins)
        if sr.source_id in person_ids:
            person_locations[sr.source_id].append({"loc": loc.name, "ts": ts, "src": "Direct Check-in / FIR"})
        elif owner_id:
            person_locations[owner_id].append({"loc": loc.name, "ts": ts, "src": f"Vehicle ANPR ({sr.source_id})"})
            
    for fr in db.query(Relationship).filter(Relationship.rel_type == "MENTIONED_IN_FIR").all():
        s = db.query(Entity).filter(Entity.id == fr.source_id).first()
        t = db.query(Entity).filter(Entity.id == fr.target_id).first()
        ts = fr.timestamp or datetime.utcnow()
        
        if s and t:
            if s.entity_type == "PERSON" and t.entity_type == "LOCATION":
                person_locations[s.id].append({"loc": t.name, "ts": ts, "src": "FIR Location Nexus"})
            elif t.entity_type == "PERSON" and s.entity_type == "LOCATION":
                person_locations[t.id].append({"loc": s.name, "ts": ts, "src": "FIR Location Nexus"})

    # 3. Detect Spatiotemporal Co-Incidences
    rendezvous_events = []
    person_id_list = list(person_ids.keys())
    
    for i in range(len(person_id_list)):
        for j in range(i + 1, len(person_id_list)):
            p1 = person_id_list[i]
            p2 = person_id_list[j]
            
            has_direct_telecom = tuple(sorted([p1, p2])) in direct_ties
            
            for t1 in person_locations.get(p1, []):
                for t2 in person_locations.get(p2, []):
                    if t1["loc"].lower() == t2["loc"].lower():
                        # Calculate REAL time difference
                        time_diff_hours = abs((t1["ts"] - t2["ts"]).total_seconds()) / 3600.0
                        
                        if time_diff_hours <= max_time_diff_hours:
                            # They were at the same place within the time window!
                            telecom_hygiene_bonus = 40 if not has_direct_telecom else 0
                            time_proximity_bonus = max(0, 40 * (1 - (time_diff_hours / max_time_diff_hours)))
                            
                            suspicion_score = min(99, int(20 + telecom_hygiene_bonus + time_proximity_bonus))
                            
                            rendezvous_events.append({
                                "id": f"ghost_{p1}_{p2}_{len(rendezvous_events)}",
                                "person_1_id": p1,
                                "person_1_name": person_ids[p1],
                                "person_2_id": p2,
                                "person_2_name": person_ids[p2],
                                "covert_telecom_hygiene": not has_direct_telecom,
                                "location": t1["loc"],
                                "time_gap_hours": round(time_diff_hours, 1),
                                "evidence_chain": [
                                    f"{person_ids[p1]} logged via {t1['src']} at {t1['ts'].strftime('%Y-%m-%d %H:%M')}",
                                    f"{person_ids[p2]} logged via {t2['src']} at {t2['ts'].strftime('%Y-%m-%d %H:%M')}",
                                    f"Spatiotemporal overlap: {round(time_diff_hours, 1)} hours apart.",
                                    "Zero direct phone/bank records found (Covert operational radio-silence)." if not has_direct_telecom else "Direct telecom connection exists (Standard meetup)."
                                ],
                                "suspicion_score": suspicion_score,
                                "tactical_assessment": "CRITICAL: Covert physical meetup highly probable." if suspicion_score > 75 else "MODERATE: Coincidental overlap possible."
                            })

    rendezvous_events.sort(key=lambda x: x["suspicion_score"], reverse=True)
    
    # Deduplicate events for the same pair
    seen_pairs = set()
    unique_events = []
    for ev in rendezvous_events:
        pair = tuple(sorted([ev["person_1_id"], ev["person_2_id"]]))
        if pair not in seen_pairs:
            seen_pairs.add(pair)
            unique_events.append(ev)
    
    return {
        "status": "success",
        "count": len(unique_events),
        "rendezvous_events": unique_events[:10],
        "summary": f"Detected {len(unique_events)} covert physical co-location events with strict spatiotemporal overlap (<{max_time_diff_hours}hrs)."
    }
