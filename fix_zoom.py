import re

with open('frontend/src/components/GraphCanvas.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove wheelSensitivity or change it to 0.3
content = content.replace("wheelSensitivity={0.1}", "wheelSensitivity={0.3}\n          minZoom={0.2}\n          maxZoom={3}")

# Add zoom controls to the UI
import_icons = "import { FiCrosshair, FiZoomIn, FiZoomOut } from 'react-icons/fi';"
if "FiCrosshair" not in content:
    content = content.replace("import cytoscape from 'cytoscape';", "import cytoscape from 'cytoscape';\n" + import_icons)

controls_ui = '''
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
          <button onClick={() => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.2)} className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border)] rounded flex items-center justify-center text-white hover:bg-[var(--bg-highlight)] transition-colors shadow-lg" title="Zoom In">
            <FiZoomIn size={18} />
          </button>
          <button onClick={() => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8)} className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border)] rounded flex items-center justify-center text-white hover:bg-[var(--bg-highlight)] transition-colors shadow-lg" title="Zoom Out">
            <FiZoomOut size={18} />
          </button>
          <button onClick={() => cyRef.current && cyRef.current.fit()} className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border)] rounded flex items-center justify-center text-white hover:bg-[var(--bg-highlight)] transition-colors shadow-lg" title="Fit to Screen">
            <FiCrosshair size={18} />
          </button>
        </div>
        
        <CytoscapeComponent
'''

content = content.replace("<CytoscapeComponent", controls_ui.strip())

with open('frontend/src/components/GraphCanvas.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
