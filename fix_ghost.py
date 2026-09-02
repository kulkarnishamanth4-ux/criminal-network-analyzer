import codecs

with codecs.open('frontend/src/components/GraphCanvas.jsx', 'r', 'utf-8') as f:
    content = f.read()

old_edges = '''    const edges = (elements.edges || []).map(e => ({
      data: {
        ...e,
        id: String(e.id || e-),
        source: String(e.source),
        target: String(e.target),
        type: e.type,
        label: e.label || e.type,
        weight: e.weight || 1
      }
    }));'''

new_edges = '''    const edges = (elements.edges || []).map(e => ({
      data: {
        ...e,
        id: String(e.id || e-),
        source: String(e.source),
        target: String(e.target),
        type: e.type,
        label: e.label || e.type,
        weight: e.weight || 1
      },
      classes: e.is_ghost ? 'ghost-link' : ''
    }));'''

content = content.replace(old_edges, new_edges)

with codecs.open('frontend/src/components/GraphCanvas.jsx', 'w', 'utf-8') as f:
    f.write(content)
print("Ghost links fixed.")
