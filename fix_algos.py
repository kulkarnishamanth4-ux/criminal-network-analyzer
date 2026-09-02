import codecs

with codecs.open('backend/graph/algorithms.py', 'r', 'utf-8') as f:
    content = f.read()

old_alias = '''        if any("dawood" in n or "kaskar" in n for n in member_names):
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
            data["dominant_crime_type"] = "Logistics & Local Support"'''

new_alias = '''        if any("dawood" in n or "kaskar" in n for n in member_names):
            data["alias"] = f"D-Company Global Command (Cluster {cid})"
            data["dominant_crime_type"] = "Cross-border Syndicate Operations"
        elif any("salem" in n or "shooter" in n or "hitman" in n for n in member_names):
            data["alias"] = f"Abu Salem Extortion Cadre (Cluster {cid})"
            data["dominant_crime_type"] = "Extortion & Contract Killings"
        elif any("memon" in n or "smurfer" in n or "hawala" in n for n in member_names):
            data["alias"] = f"Tiger Memon Financial Ring (Cluster {cid})"
            data["dominant_crime_type"] = "Hawala & Money Laundering"
        elif any("mirchi" in n for n in member_names):
            data["alias"] = f"Mirchi Narcotics Cartel (Cluster {cid})"
            data["dominant_crime_type"] = "Global Narcotics Smuggling"
        else:
            data["alias"] = f"Peripheral Cell Alpha-{cid}"
            data["dominant_crime_type"] = "Logistics & Local Support"'''

content = content.replace(old_alias, new_alias)

with codecs.open('backend/graph/algorithms.py', 'w', 'utf-8') as f:
    f.write(content)
print("Algorithms alias fixed.")
