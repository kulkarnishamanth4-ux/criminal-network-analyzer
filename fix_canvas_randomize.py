import codecs

with codecs.open('frontend/src/components/GraphCanvas.jsx', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace("randomize: false, // Virtualization: Prevent scrambling when new nodes are loaded dynamically", "randomize: true,")

with codecs.open('frontend/src/components/GraphCanvas.jsx', 'w', 'utf-8') as f:
    f.write(content)
print("Canvas randomize fixed.")
