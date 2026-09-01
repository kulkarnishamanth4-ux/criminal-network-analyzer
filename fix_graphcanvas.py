import codecs

with codecs.open('frontend/src/components/GraphCanvas.jsx', 'r', 'utf-8') as f:
    content = f.read()

# Add getPredictedLinks import
content = content.replace("import TimelineScrubber from './TimelineScrubber';", "import TimelineScrubber from './TimelineScrubber';\nimport { getPredictedLinks } from '../api/client';\nimport { FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';")

# Add ghost-link to stylesheet
stylesheet_addition = """  { selector: '.temporal-hidden', style: {
    'display': 'none'
  }},
  { selector: 'edge.ghost-link', style: {
    'line-color': '#ff6b6b',
    'line-style': 'dashed',
    'width': 2,
    'opacity': 0.8,
    'target-arrow-color': '#ff6b6b',
    'label': 'data(label)',
    'text-outline-color': '#05050f',
    'text-outline-width': 2,
    'color': '#ff6b6b'
  }},
"""
content = content.replace("  { selector: '.temporal-hidden', style: {\n    'display': 'none'\n  }},", stylesheet_addition)

# Update component definition
content = content.replace("export default function GraphCanvas({ elements, onNodeSelect, onClearSelection, highlightPath }) {", "export default function GraphCanvas({ elements, activeCase, onNodeSelect, onClearSelection, highlightPath }) {")

# Add states
state_addition = """  const cyRef = useRef(null);
  const [timelineFilter, setTimelineFilter] = useState(null);
  const [showGhostLinks, setShowGhostLinks] = useState(false);
  const [predictedLinks, setPredictedLinks] = useState([]);
  const [isLoadingGhosts, setIsLoadingGhosts] = useState(false);

  const toggleGhostLinks = async () => {
    if (!showGhostLinks && predictedLinks.length === 0) {
      setIsLoadingGhosts(true);
      try {
        const data = await getPredictedLinks(activeCase);
        if (data.predictions) {
          setPredictedLinks(data.predictions);
        }
      } catch (err) {
        console.error("Failed to load ghost links", err);
      }
      setIsLoadingGhosts(false);
    }
    setShowGhostLinks(!showGhostLinks);
  };
"""
content = content.replace("  const cyRef = useRef(null);\n  const [timelineFilter, setTimelineFilter] = useState(null);", state_addition)

# Inject ghost links into cyElements
cy_elements_start = "      const edges = (elements.edges || []).map(e => ({"
cy_elements_replacement = """      const edges = (elements.edges || []).map(e => ({
        data: {
          id: String(e.id || Math.random()),
          source: String(e.source),
          target: String(e.target),
          type: e.type || e.rel_type || 'UNKNOWN',
          label: e.label || e.type || e.rel_type,
          weight: e.weight || 1.0,
          timestamp: e.timestamp
        }
      }));
      
      if (showGhostLinks && predictedLinks.length > 0) {
        predictedLinks.forEach((link, idx) => {
          edges.push({
            data: {
              id: 'ghost-' + idx,
              source: String(link.source_id),
              target: String(link.target_id),
              type: 'PREDICTED',
              label: (link.probability * 100).toFixed(0) + '% PROBABLE',
            },
            classes: 'ghost-link'
          });
        });
      }
      return [...nodes, ...edges];"""
      
# Find the exact lines to replace for edges in cyElements
import re
edges_pattern = re.compile(r"      const edges = \(elements\.edges \|\| \[\]\)\.map\(e => \(\{\n        data: \{\n          id: String\(e\.id \|\| Math\.random\(\)\),\n          source: String\(e\.source\),\n          target: String\(e\.target\),\n          type: e\.type \|\| e\.rel_type \|\| 'UNKNOWN',\n          label: e\.label \|\| e\.type \|\| e\.rel_type,\n          weight: e\.weight \|\| 1\.0,\n          timestamp: e\.timestamp\n        \}\n      \}\)\);\n\n      return \[\.\.\.nodes, \.\.\.edges\];", re.MULTILINE)

content = edges_pattern.sub(cy_elements_replacement, content)

# Inject the Ghost Link Button
button_injection = """          <button onClick={() => cyRef.current && cyRef.current.fit()} className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border)] rounded flex items-center justify-center text-white hover:bg-[var(--bg-highlight)] transition-colors shadow-lg" title="Fit to Screen">
            <FiCrosshair size={18} />
          </button>
          
          <button onClick={toggleGhostLinks} className={w-10 h-10  border rounded flex items-center justify-center transition-colors shadow-lg} title="Toggle Predictive Ghost Links">
            {isLoadingGhosts ? <FiLoader className="animate-spin" size={18} /> : (showGhostLinks ? <FiEye size={18} /> : <FiEyeOff size={18} />)}
          </button>"""
content = content.replace('          <button onClick={() => cyRef.current && cyRef.current.fit()} className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border)] rounded flex items-center justify-center text-white hover:bg-[var(--bg-highlight)] transition-colors shadow-lg" title="Fit to Screen">\n            <FiCrosshair size={18} />\n          </button>', button_injection)

with codecs.open('frontend/src/components/GraphCanvas.jsx', 'w', 'utf-8') as f:
    f.write(content)
print("GraphCanvas updated.")
