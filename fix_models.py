import codecs

with codecs.open('backend/database/models.py', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('case_id = Column(String(50), nullable=True, default="dawood")', 'case_id = Column(String(50), nullable=True, default="dawood", index=True)')

with codecs.open('backend/database/models.py', 'w', 'utf-8') as f:
    f.write(content)
print("models.py indices added.")
