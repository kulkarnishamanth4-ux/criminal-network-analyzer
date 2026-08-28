import React, { useRef, useEffect, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';

// Helper to truncate long labels
function truncateLabel(label, type) {
  if (!label) return '?';
  const str = String(label);
  if (type === 'BANK_ACCOUNT' && str.length > 6) return '•••' + str.slice(-4);
  if (type === 'PHONE' && str.length > 6) return '•••' + str.slice(-4);
  if (str.length > 18) return str.slice(0, 16) + '…';
  return str;
}

const stylesheet = [
  // ── BASE NODE ──
  { selector: 'node', style: {
    'label': 'data(shortLabel)',
    'text-valign': 'bottom',
    'text-margin-y': 6,
    'color': '#c8d6e5',
    'font-size': '11px',
    'font-weight': 'bold',
    'text-outline-color': '#05050f',
    'text-outline-width': 2.5,
    'min-zoomed-font-size': 5,
    'width': 'mapData(pagerank, 0, 0.15, 22, 70)',
    'height': 'mapData(pagerank, 0, 0.15, 22, 70)',
    'border-width': 2,
    'border-color': '#ffffff20',
    'overlay-padding': '4px',
    'transition-property': 'opacity, border-color, border-width, width, height',
    'transition-duration': '0.2s',
  }},

  // ── ICONS (URL Encoded SVGs) ──
  // Note: %23 is # in URL encoding
  // PERSON (Red)
  { selector: 'node[type="PERSON"]', style: {
    'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    'background-fit': 'contain',
    'background-opacity': 0,
    'border-width': 0,
    'shape': 'ellipse',
  }},
  // PHONE (Teal)
  { selector: 'node[type="PHONE"]', style: {
    'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%234ecdc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
    'background-fit': 'contain',
    'background-opacity': 0,
    'border-width': 0,
    'shape': 'rectangle',
  }},
  // LOCATION (Blue)
  { selector: 'node[type="LOCATION"]', style: {
    'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2345b7d1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    'background-fit': 'contain',
    'background-opacity': 0,
    'border-width': 0,
    'shape': 'rectangle',
  }},
  // VEHICLE (Green)
  { selector: 'node[type="VEHICLE"]', style: {
    'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2396c93d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0zm-10 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"></path></svg>',
    'background-fit': 'contain',
    'background-opacity': 0,
    'border-width': 0,
    'shape': 'rectangle',
  }},
  // BANK ACCOUNT (Gold)
  { selector: 'node[type="BANK_ACCOUNT"]', style: {
    'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23f9ca24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
    'background-fit': 'contain',
    'background-opacity': 0,
    'border-width': 0,
    'shape': 'rectangle',
  }},
  // ORGANIZATION (Purple)
  { selector: 'node[type="ORGANIZATION"]', style: {
    'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23a29bfe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>',
    'background-fit': 'contain',
    'background-opacity': 0,
    'border-width': 0,
    'shape': 'rectangle',
  }},

  // ── HIGH-RISK GLOW ──
  { selector: 'node[?highRisk]', style: {
    'border-width': 4,
    'border-color': '#ff004080',
    'shadow-blur': 15,
    'shadow-color': '#ff0040',
    'shadow-opacity': 0.6,
    'shadow-offset-x': 0,
    'shadow-offset-y': 0,
  }},

  // ── EDGES ──
  { selector: 'edge', style: {
    'width': 'mapData(weight, 1, 20, 0.8, 3.5)',
    'line-color': '#1e3a5f',
    'target-arrow-color': '#1e3a5f',
    'target-arrow-shape': 'triangle',
    'arrow-scale': 0.8,
    'curve-style': 'bezier',
    'opacity': 0.45,
    'transition-property': 'opacity, line-color, width',
    'transition-duration': '0.2s',
  }},
  { selector: 'edge[type="CALLED"]', style: { 'line-color': '#4ecdc4', 'target-arrow-color': '#4ecdc4' }},
  { selector: 'edge[type="TRANSFERRED_MONEY_TO"]', style: { 'line-color': '#f9ca24', 'target-arrow-color': '#f9ca24' }},
  { selector: 'edge[type="SPOTTED_AT"]', style: { 'line-color': '#45b7d1', 'target-arrow-color': '#45b7d1' }},
  { selector: 'edge[type="MENTIONED_IN_FIR"]', style: { 'line-color': '#ff6b6b', 'target-arrow-color': '#ff6b6b', 'line-style': 'dotted' }},
  { selector: 'edge[type="OWNS_ACCOUNT"]', style: { 'line-color': '#f9ca2480', 'target-arrow-color': '#f9ca2480', 'line-style': 'solid', 'width': 1 }},
  { selector: 'edge[type="OWNS_VEHICLE"]', style: { 'line-color': '#96c93d80', 'target-arrow-color': '#96c93d80', 'line-style': 'solid', 'width': 1 }},
  { selector: 'edge[type="PREDICTED"]', style: {
    'line-color': '#ffff00',
    'target-arrow-color': '#ffff00',
    'line-style': 'dashed',
    'line-dash-pattern': [6, 3],
    'opacity': 0.7,
  }},

  // ── SELECTION & HOVER ──
  { selector: 'node:active', style: {
    'overlay-color': '#64ffda',
    'overlay-opacity': 0.15,
  }},
  { selector: ':selected', style: {
    'border-width': 4,
    'border-color': '#64ffda',
    'opacity': 1,
  }},
  { selector: 'edge:selected', style: {
    'width': 3,
    'opacity': 1,
    'label': 'data(label)',
    'font-size': '10px',
    'color': '#64ffda',
    'text-rotation': 'autorotate',
    'text-outline-width': 2,
    'text-outline-color': '#05050f',
  }},

  // ── NEIGHBORHOOD HIGHLIGHT (applied via classes) ──
  { selector: 'node.highlighted', style: {
    'opacity': 1,
    'border-width': 4,
    'border-color': '#64ffda',
    'z-index': 999,
  }},
  { selector: 'edge.highlighted', style: {
    'opacity': 1,
    'width': 3,
    'z-index': 999,
    'label': 'data(label)',
    'font-size': '9px',
    'color': '#8892b0',
    'text-rotation': 'autorotate',
    'text-outline-width': 1.5,
    'text-outline-color': '#05050f',
  }},
  { selector: 'node.dimmed', style: {
    'opacity': 0.12,
  }},
  { selector: 'edge.dimmed', style: {
    'opacity': 0.06,
  }},
];

const layout = {
  name: 'cose',
  idealEdgeLength: 160,
  nodeOverlap: 20,
  refresh: 20,
  fit: true,
  padding: 60,
  randomize: true,
  componentSpacing: 180,
  nodeRepulsion: 3000000,
  edgeElasticity: 45,
  nestingFactor: 5,
  gravity: 35,
  numIter: 1500,
  animate: true,
  animationDuration: 800,
  animationEasing: 'ease-out-cubic',
};

export default function GraphCanvas({ elements, onNodeSelect, onClearSelection, highlightPath }) {
  const cyRef = useRef(null);

  // Normalize elements for Cytoscape
  const cyElements = React.useMemo(() => {
    if (!elements || (!elements.nodes && !elements.edges)) return [];
    
    const nodes = (elements.nodes || []).map(n => {
      const type = n.type || n.entity_type || 'UNKNOWN';
      const rawLabel = n.label || n.name || String(n.id);
      const pr = n.metrics?.pagerank || n.pagerank || 0;
      return {
        data: {
          id: String(n.id),
          label: rawLabel,
          shortLabel: truncateLabel(rawLabel, type),
          type: type,
          pagerank: pr,
          highRisk: pr > 0.08,
          ...n
        }
      };
    });
    
    const edges = (elements.edges || []).map(e => ({
      data: {
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
        type: e.type,
        label: e.label || e.type,
        weight: e.weight || 1,
        ...e
      }
    }));
    
    return [...nodes, ...edges];
  }, [elements]);

  // Neighborhood highlight logic
  const highlightNeighborhood = useCallback((cy, node) => {
    cy.elements().addClass('dimmed').removeClass('highlighted');
    const neighborhood = node.closedNeighborhood();
    neighborhood.removeClass('dimmed').addClass('highlighted');
  }, []);

  const clearHighlight = useCallback((cy) => {
    cy.elements().removeClass('dimmed').removeClass('highlighted');
  }, []);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    
    const handleTapNode = (evt) => {
      const node = evt.target;
      highlightNeighborhood(cy, node);
      onNodeSelect(node.data());
    };
    
    const handleTapBg = (evt) => {
      if (evt.target === cy) {
        clearHighlight(cy);
        onClearSelection();
      }
    };

    // Hover tooltip via popper or title
    const handleMouseOver = (evt) => {
      const node = evt.target;
      const d = node.data();
      const fullLabel = d.label || d.id;
      const type = d.type || 'UNKNOWN';
      const pr = d.pagerank ? (d.pagerank * 100).toFixed(1) : '0.0';
      node.scratch('_tippy', fullLabel);
      // Use the browser title attribute for a native tooltip
      node.style('content', fullLabel);
    };

    cy.on('tap', 'node', handleTapNode);
    cy.on('tap', handleTapBg);
    
    return () => {
      cy.off('tap', 'node', handleTapNode);
      cy.off('tap', handleTapBg);
    };
  }, [onNodeSelect, onClearSelection, highlightNeighborhood, clearHighlight]);

  useEffect(() => {
     if (cyRef.current && cyElements.length > 0) {
        cyRef.current.layout(layout).run();
     }
  }, [cyElements]);

  // Highlight path from PathFinder
  useEffect(() => {
    if (!cyRef.current || !highlightPath || highlightPath.length === 0) return;
    const cy = cyRef.current;
    clearHighlight(cy);
    
    const pathIds = highlightPath.map(String);
    cy.elements().addClass('dimmed').removeClass('highlighted');
    
    pathIds.forEach(id => {
      const node = cy.getElementById(id);
      if (node.length) node.removeClass('dimmed').addClass('highlighted');
    });
    
    for (let i = 0; i < pathIds.length - 1; i++) {
      const edges = cy.edges().filter(e => {
        const s = e.data('source'), t = e.data('target');
        return (s === pathIds[i] && t === pathIds[i+1]) || (s === pathIds[i+1] && t === pathIds[i]);
      });
      edges.removeClass('dimmed').addClass('highlighted');
    }
  }, [highlightPath, clearHighlight]);

  return (
    <div className="w-full h-full bg-[#05050f] absolute inset-0 z-0">
      {cyElements.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center select-none">
          <div className="text-6xl mb-6 opacity-20"></div>
          <h2 className="text-xl font-bold text-[var(--text-secondary)] mb-2">No Intelligence Data Loaded</h2>
          <p className="text-sm text-[var(--text-secondary)] opacity-60 max-w-md mb-6">
            Upload FIR documents, CDR logs, financial records, or vehicle data to begin building the criminal network graph.
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--text-accent)] opacity-50">
            <span>Click</span>
            <span className="px-2 py-1 border border-[var(--text-accent)] rounded text-[var(--text-accent)]">Data Ingestion</span>
            <span>to get started</span>
          </div>
        </div>
      ) : (
        <CytoscapeComponent 
          elements={cyElements}
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={layout}
          cy={(cy) => { cyRef.current = cy; }}
          wheelSensitivity={0.1}
        />
      )}
    </div>
  );
}
