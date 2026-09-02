import codecs

with codecs.open('frontend/src/components/LeftPanel.jsx', 'r', 'utf-8') as f:
    left = f.read()

left = left.replace('className="absolute top-2 right-2', 'className="absolute top-2 right-2 z-50')

with codecs.open('frontend/src/components/LeftPanel.jsx', 'w', 'utf-8') as f:
    f.write(left)

print("LeftPanel fixed.")
