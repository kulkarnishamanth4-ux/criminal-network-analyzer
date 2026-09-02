import codecs

with codecs.open('backend/graph/algorithms.py', 'r', 'utf-8') as f:
    lines = f.readlines()

new_lines = []
in_func = False
for line in lines:
    if line.startswith("def get_communities_summary"):
        in_func = True
        continue
    
    if in_func:
        if line.startswith("def ") or line.startswith("@"):
            in_func = False
        else:
            continue
            
    if not in_func:
        new_lines.append(line)

summary_func = '''def get_communities_summary(db: Session, case_id: str = "dawood") -> list[dict]:
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    case_entities = db.query(Entity).filter(Entity.community_id.isnot(None)).filter(ent_filter).all()
    
    communities = {}
    for e in case_entities:
        cid = e.community_id
        if cid not in communities:
            communities[cid] = {"community_id": cid, "member_count": 0, "members": []}
        communities[cid]["member_count"] += 1
        if len(communities[cid]["members"]) < 5:
            communities[cid]["members"].append({"id": e.id, "name": e.name, "type": e.entity_type})
            
    # Assign tactical aliases based on members
    for cid, data in communities.items():
        member_names = [m["name"].lower() for m in data["members"]]
        
        if any("dawood" in n or "kaskar" in n for n in member_names):
            data["alias"] = "D-Company Global Command"
            data["dominant_crime_type"] = "Cross-border Syndicate Operations"
        elif any("salem" in n or "shooter" in n or "hitman" in n for n in member_names):
            data["alias"] = "Abu Salem Extortion Cadre"
            data["dominant_crime_type"] = "Extortion & Contract Killings"
        elif any("memon" in n or "smurfer" in n or "hawala" in n for n in member_names):
            data["alias"] = "Tiger Memon Financial Ring"
            data["dominant_crime_type"] = "Hawala & Money Laundering"
        elif any("mirchi" in n for n in member_names):
            data["alias"] = "Mirchi Narcotics Cartel"
            data["dominant_crime_type"] = "Global Narcotics Smuggling"
        else:
            data["alias"] = f"Peripheral Cell Alpha-{cid}"
            data["dominant_crime_type"] = "Logistics & Local Support"
            
    return list(communities.values())
'''

new_lines.append(summary_func)

with codecs.open('backend/graph/algorithms.py', 'w', 'utf-8') as f:
    f.writelines(new_lines)
print("algorithms.py rewritten.")
