import sqlite3

conn = sqlite3.connect('criminal_network.db')
c = conn.cursor()

tables = ['entities', 'relationships', 'firs', 'anomalies', 'uploaded_files']
for tbl in tables:
    c.execute(f"PRAGMA table_info({tbl})")
    cols = [r[1] for r in c.fetchall()]
    if cols:
        print(f"Table {tbl} has cols: {cols}")
        if 'case_id' not in cols:
            print(f"Adding case_id to {tbl}...")
            c.execute(f"ALTER TABLE {tbl} ADD COLUMN case_id VARCHAR(50) DEFAULT 'dawood'")

conn.commit()

# Verify
for tbl in tables:
    c.execute(f"PRAGMA table_info({tbl})")
    cols = [r[1] for r in c.fetchall()]
    print(f"Verified {tbl} case_id present: {'case_id' in cols}")

conn.close()
print("Migration completed successfully.")
