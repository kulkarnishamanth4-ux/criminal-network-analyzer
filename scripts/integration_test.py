"""End-to-end integration test for CrimeNet Intelligence Platform."""
import requests, os, sys, json

BASE = "http://localhost:8000"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "synthetic")
passed = failed = 0
errors = []

def test(name, func):
    global passed, failed
    try:
        result = func()
        if result:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name}")
            failed += 1; errors.append(name)
    except Exception as e:
        print(f"  [FAIL] {name} -- {e}")
        failed += 1; errors.append(f"{name}: {e}")

# Phase 1: Empty state
print("\n-- Phase 1: Empty State --")
test("Dashboard stats (empty)", lambda: requests.get(f"{BASE}/api/analytics/dashboard-stats").status_code == 200)

# Phase 2: Upload 5 FIRs
print("\n-- Phase 2: FIR Uploads --")
fir_dir = os.path.join(DATA_DIR, "firs")
for fname in sorted(os.listdir(fir_dir))[:5]:
    def upload_fir(fn=fname):
        with open(os.path.join(fir_dir, fn), "rb") as f:
            r = requests.post(f"{BASE}/api/upload/fir", files={"file": (fn, f, "text/plain")})
        if r.status_code != 200:
            raise Exception(f"HTTP {r.status_code}: {r.text[:200]}")
        d = r.json()
        print(f"       Entities: {d.get('entities_extracted','?')}, Crime: {d.get('crime_type','?')} ({d.get('crime_confidence','?')})")
        return d["status"] == "success"
    test(f"Upload {fname}", upload_fir)

# Phase 3: Upload CDR
print("\n-- Phase 3: CDR Upload --")
def test_cdr():
    with open(os.path.join(DATA_DIR, "cdr_records.csv"), "rb") as f:
        r = requests.post(f"{BASE}/api/upload/cdr", files={"file": ("cdr.csv", f, "text/csv")})
    if r.status_code != 200: raise Exception(f"HTTP {r.status_code}: {r.text[:200]}")
    d = r.json(); print(f"       Records: {d.get('records_processed','?')}")
    return d["status"] == "success"
test("Upload CDR", test_cdr)

# Phase 4: Upload Financial
print("\n-- Phase 4: Financial Upload --")
def test_fin():
    with open(os.path.join(DATA_DIR, "financial_transactions.csv"), "rb") as f:
        r = requests.post(f"{BASE}/api/upload/financial", files={"file": ("fin.csv", f, "text/csv")})
    if r.status_code != 200: raise Exception(f"HTTP {r.status_code}: {r.text[:200]}")
    d = r.json(); print(f"       Records: {d.get('records_processed','?')}")
    return d["status"] == "success"
test("Upload Financial", test_fin)

# Phase 5: Upload Vehicle
print("\n-- Phase 5: Vehicle Upload --")
def test_veh():
    with open(os.path.join(DATA_DIR, "vehicle_sightings.csv"), "rb") as f:
        r = requests.post(f"{BASE}/api/upload/vehicle", files={"file": ("veh.csv", f, "text/csv")})
    if r.status_code != 200: raise Exception(f"HTTP {r.status_code}: {r.text[:200]}")
    d = r.json(); print(f"       Records: {d.get('records_processed','?')}")
    return d["status"] == "success"
test("Upload Vehicle", test_veh)

# Phase 6: Dashboard
print("\n-- Phase 6: Dashboard Stats --")
def test_dash():
    r = requests.get(f"{BASE}/api/analytics/dashboard-stats")
    d = r.json()
    print(f"       Entities: {d['total_entities']}, Rels: {d['total_relationships']}")
    print(f"       Types: {d['entities_by_type']}")
    print(f"       Communities: {d['communities_count']}, Anomalies: {d['anomalies_count']}")
    return d["total_entities"] > 0
test("Dashboard populated", test_dash)

# Phase 7: Search
print("\n-- Phase 7: Search --")
def test_search():
    r = requests.get(f"{BASE}/api/search", params={"q": "Vikram"})
    d = r.json()
    results = d.get("results", d) if isinstance(d, dict) else d
    count = len(results) if isinstance(results, list) else 0
    print(f"       Found {count} results for 'Vikram'")
    return r.status_code == 200
test("Search 'Vikram'", test_search)

# Phase 8: Full Graph
print("\n-- Phase 8: Full Graph --")
def test_graph():
    r = requests.get(f"{BASE}/api/graph/full")
    d = r.json()
    print(f"       Nodes: {len(d.get('nodes',[]))}, Edges: {len(d.get('edges',[]))}")
    return len(d.get("nodes",[])) > 0
test("Full graph", test_graph)

# Phase 9: Ego Network
print("\n-- Phase 9: Ego Network --")
def test_ego():
    r = requests.get(f"{BASE}/api/search", params={"q": "a", "limit": "1"})
    d = r.json()
    results = d.get("results", d) if isinstance(d, dict) else d
    if not results: return True
    eid = results[0]["id"] if isinstance(results[0], dict) else results[0]
    r2 = requests.get(f"{BASE}/api/network/{eid}", params={"depth": "2"})
    d2 = r2.json()
    print(f"       Entity {eid}: {len(d2.get('nodes',[]))} nodes, {len(d2.get('edges',[]))} edges")
    return r2.status_code == 200
test("Ego network", test_ego)

# Phase 10: Analytics
print("\n-- Phase 10: Analytics --")
def test_influencers():
    r = requests.get(f"{BASE}/api/analytics/top-influencers", params={"limit": "5"})
    data = r.json()
    items = data if isinstance(data, list) else data.get("influencers", [])
    for i in items[:3]:
        print(f"       {i.get('name','?')} (PR: {i.get('pagerank',0):.4f}, BW: {i.get('betweenness',0):.4f})")
    return r.status_code == 200
test("Top influencers", test_influencers)

def test_communities():
    r = requests.get(f"{BASE}/api/analytics/communities")
    data = r.json()
    items = data if isinstance(data, list) else data.get("communities", [])
    print(f"       {len(items)} communities")
    return r.status_code == 200
test("Communities", test_communities)

def test_anomalies():
    r = requests.get(f"{BASE}/api/analytics/anomalies")
    data = r.json()
    items = data.get("anomalies", data) if isinstance(data, dict) else data
    if isinstance(items, list):
        print(f"       {len(items)} anomalies")
        for a in items[:3]:
            if isinstance(a, dict):
                print(f"         [{a.get('severity','?')}] {a.get('title','?')}")
    return r.status_code == 200
test("Anomalies", test_anomalies)

def test_crime():
    r = requests.get(f"{BASE}/api/analytics/crime-predictions")
    data = r.json()
    items = data if isinstance(data, list) else data.get("predictions", [])
    for p in (items[:3] if isinstance(items, list) else []):
        print(f"       {p.get('crime_type','?')}: {p.get('confidence',0):.0%}")
    return r.status_code == 200
test("Crime predictions", test_crime)

def test_links():
    r = requests.get(f"{BASE}/api/analytics/predicted-links", params={"min_confidence": "0.1"})
    data = r.json()
    items = data if isinstance(data, list) else data.get("predicted_links", [])
    count = len(items) if isinstance(items, list) else 0
    print(f"       {count} predicted links")
    return r.status_code == 200
test("Predicted links", test_links)

# Phase 11: Dossier
print("\n-- Phase 11: Entity Dossier --")
def test_dossier():
    r = requests.get(f"{BASE}/api/search", params={"q": "a", "limit": "1"})
    d = r.json()
    results = d.get("results", d) if isinstance(d, dict) else d
    if not results: return True
    eid = results[0]["id"] if isinstance(results[0], dict) else results[0]
    r2 = requests.get(f"{BASE}/api/entity/{eid}/dossier")
    d2 = r2.json()
    print(f"       Keys: {list(d2.keys())}")
    return r2.status_code == 200
test("Entity dossier", test_dossier)

# Summary
print(f"\n{'='*50}")
print(f"  RESULTS: {passed} passed, {failed} failed / {passed+failed} total")
if errors:
    print(f"  FAILURES:"); [print(f"    - {e}") for e in errors]
print(f"{'='*50}\n")
sys.exit(0 if failed == 0 else 1)
