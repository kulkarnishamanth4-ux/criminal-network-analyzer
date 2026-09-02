import codecs

with codecs.open('backend/api/routes_network.py', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace("def get_full_graph(limit: int = 500,", "def get_full_graph(limit: int = 3000,")

with codecs.open('backend/api/routes_network.py', 'w', 'utf-8') as f:
    f.write(content)
print("Graph limit fixed.")
