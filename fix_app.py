import codecs

with codecs.open('frontend/src/App.jsx', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace("getFullGraph(150, caseId)", "getFullGraph(3000, caseId)")

with codecs.open('frontend/src/App.jsx', 'w', 'utf-8') as f:
    f.write(content)
print("App.jsx limit fixed.")
