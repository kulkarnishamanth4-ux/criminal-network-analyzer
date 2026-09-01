with open('frontend/src/components/GraphCanvas.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('      ) : (\n        <div className="absolute bottom-6 right-6', '      ) : (\n        <>\n        <div className="absolute bottom-6 right-6')
content = content.replace('maxZoom={3}\n        />\n      )}\n    </div>', 'maxZoom={3}\n        />\n        </>\n      )}\n    </div>')

with open('frontend/src/components/GraphCanvas.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
