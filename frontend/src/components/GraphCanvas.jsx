import React, { useRef, useEffect, useCallback, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import { FiCrosshair, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import TimelineScrubber from './TimelineScrubber';
import { getPredictedLinks } from '../api/client';
import { FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';

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

  // ── NODE TYPES ──
  { selector: 'node[type="PERSON"]', style: {
    'background-color': '#ff6b6b',
    'border-color': '#ff6b6b40',
    'shape': 'ellipse',
  }},
  { selector: 'node[type="PHONE"]', style: {
    'background-color': '#4ecdc4',
    'border-color': '#4ecdc440',
    'shape': 'diamond',
  }},
  { selector: 'node[type="LOCATION"]', style: {
    'background-color': '#45b7d1',
    'border-color': '#45b7d140',
    'shape': 'round-rectangle',
  }},
  { selector: 'node[type="VEHICLE"]', style: {
    'background-color': '#96c93d',
    'border-color': '#96c93d40',
    'shape': 'pentagon',
  }},
  { selector: 'node[type="BANK_ACCOUNT"]', style: {
    'background-color': '#f9ca24',
    'border-color': '#f9ca2440',
    'shape': 'hexagon',
  }},
  { selector: 'node[type="ORGANIZATION"]', style: {
    'background-color': '#a29bfe',
    'border-color': '#a29bfe40',
    'shape': 'round-rectangle',
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
  { selector: '.temporal-hidden', style: {
    'display': 'none'
  }},
];

const layout = {
  name: 'cose',
  idealEdgeLength: 160,
  nodeOverlap: 20,
  refresh: 20,
  fit: true,
  padding: 60,
  randomize: false, // Virtualization: Prevent scrambling when new nodes are loaded dynamically
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

export default function GraphCanvas({ elements, activeCase, onNodeSelect, onClearSelection, highlightPath }) {
  const cyRef = useRef(null);
  const [timelineFilter, setTimelineFilter] = useState(null);

  useEffect(() => {
    if (!cyRef.current || timelineFilter === null) return;
    const cy = cyRef.current;
    
    cy.batch(() => {
      cy.edges().forEach(edge => {
        const ts = edge.data('timestamp');
        if (ts && new Date(ts).getTime() > timelineFilter) {
          edge.addClass('temporal-hidden');
        } else {
          edge.removeClass('temporal-hidden');
        }
      });
      
      cy.nodes().forEach(node => {
        const connectedEdges = node.connectedEdges();
        if (connectedEdges.length === 0) return;
        
        const hasVisibleEdge = connectedEdges.some(e => !e.hasClass('temporal-hidden'));
        if (hasVisibleEdge) {
          node.removeClass('temporal-hidden');
        } else {
          node.addClass('temporal-hidden');
        }
      });
    });
  }, [timelineFilter, elements]);

  // Normalize elements for Cytoscape
  const cyElements = React.useMemo(() => {
    if (!elements || (!elements.nodes && !elements.edges)) return [];
    
    const nodes = (elements.nodes || []).map(n => {
      const type = n.type || n.entity_type || 'UNKNOWN';
      const rawLabel = n.label || n.name || String(n.id);
      const pr = n.metrics?.pagerank || n.pagerank || 0;
      return {
        data: {
          ...n,
          id: String(n.id),
          label: rawLabel,
          shortLabel: truncateLabel(rawLabel, type),
          type: type,
          pagerank: pr,
          highRisk: pr > 0.08
        }
      };
    });
    
    const edges = (elements.edges || []).map(e => ({
      data: {
        ...e,
        id: String(e.id || `e${e.source}-${e.target}`),
        source: String(e.source),
        target: String(e.target),
        type: e.type,
        label: e.label || e.type,
        weight: e.weight || 1
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
        <>
          <TimelineScrubber elements={elements} onFilter={setTimelineFilter} />
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
          elements={cyElements}
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={layout}
          cy={(cy) => { cyRef.current = cy; }}
          wheelSensitivity={0.3}
          minZoom={0.2}
          maxZoom={3}
        />
        </>
      )}
    </div>
  );
}
