import React, { useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';

// We could import cose-bilkent or fcose if needed, but let's stick to standard cose for now.

const stylesheet = [
  { selector: 'node', style: {
    'label': 'data(label)',
    'text-valign': 'center',
    'color': '#e0e0e0',
    'font-size': '10px',
    'text-outline-color': '#0a0a1a',
    'text-outline-width': 2,
    'min-zoomed-font-size': 8,
    'width': 30,
    'height': 30,
  }},
  { selector: 'node[type="PERSON"]', style: {
    'background-color': '#ff6b6b',
    'shape': 'ellipse',
    'width': 'mapData(pagerank, 0, 1, 30, 80)',
    'height': 'mapData(pagerank, 0, 1, 30, 80)',
  }},
  { selector: 'node[type="PHONE"]', style: {
    'background-color': '#4ecdc4',
    'shape': 'diamond',
  }},
  { selector: 'node[type="LOCATION"]', style: {
    'background-color': '#45b7d1',
    'shape': 'round-rectangle',
  }},
  { selector: 'node[type="VEHICLE"]', style: {
    'background-color': '#96c93d',
    'shape': 'pentagon',
  }},
  { selector: 'node[type="BANK_ACCOUNT"]', style: {
    'background-color': '#f9ca24',
    'shape': 'hexagon',
  }},
  { selector: 'node[type="ORGANIZATION"]', style: {
    'background-color': '#a29bfe',
    'shape': 'round-rectangle',
  }},
  { selector: 'edge', style: {
    'width': 'mapData(weight, 1, 20, 1, 5)',
    'line-color': '#1e3a5f',
    'target-arrow-color': '#1e3a5f',
    'target-arrow-shape': 'triangle',
    'curve-style': 'bezier',
    'label': 'data(label)',
    'font-size': '8px',
    'color': '#8892b0',
    'text-rotation': 'autorotate',
    'text-outline-width': 1,
    'text-outline-color': '#0a0a1a',
  }},
  { selector: 'edge[type="CALLED"]', style: { 'line-color': '#4ecdc4', 'target-arrow-color': '#4ecdc4' }},
  { selector: 'edge[type="TRANSFERRED_MONEY_TO"]', style: { 'line-color': '#f9ca24', 'target-arrow-color': '#f9ca24' }},
  { selector: 'edge[type="SPOTTED_AT"]', style: { 'line-color': '#45b7d1', 'target-arrow-color': '#45b7d1' }},
  { selector: 'edge[type="MENTIONED_IN_FIR"]', style: { 'line-color': '#ff6b6b', 'target-arrow-color': '#ff6b6b' }},
  { selector: 'edge[type="PREDICTED"]', style: {
    'line-color': '#ffff00',
    'target-arrow-color': '#ffff00',
    'line-style': 'dashed',
    'line-dash-pattern': [6, 3],
  }},
  { selector: ':selected', style: {
    'border-width': 3,
    'border-color': '#64ffda',
  }},
];

const layout = {
  name: 'cose',
  idealEdgeLength: 100,
  nodeOverlap: 20,
  refresh: 20,
  fit: true,
  padding: 30,
  randomize: false,
  componentSpacing: 100,
  nodeRepulsion: 400000,
  edgeElasticity: 100,
  nestingFactor: 5,
  gravity: 80,
  numIter: 1000,
  animate: true,
  animationDuration: 1000,
};

export default function GraphCanvas({ elements, onNodeSelect, onClearSelection }) {
  const cyRef = useRef(null);

  // Normalize elements for Cytoscape
  const cyElements = React.useMemo(() => {
    if (!elements || (!elements.nodes && !elements.edges)) return [];
    
    const nodes = (elements.nodes || []).map(n => ({
      data: {
        id: n.id,
        label: n.label || n.name || n.id,
        type: n.type || n.entity_type,
        pagerank: n.metrics?.pagerank || n.pagerank || 0,
        ...n
      }
    }));
    
    const edges = (elements.edges || []).map(e => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label || e.type,
        weight: e.weight || 1,
        ...e
      }
    }));
    
    return [...nodes, ...edges];
  }, [elements]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    
    const handleTapNode = (evt) => {
      const node = evt.target;
      onNodeSelect(node.data());
    };
    
    const handleTapBg = (evt) => {
      if (evt.target === cy) {
        onClearSelection();
      }
    };

    cy.on('tap', 'node', handleTapNode);
    cy.on('tap', handleTapBg);
    
    return () => {
      cy.off('tap', 'node', handleTapNode);
      cy.off('tap', handleTapBg);
    };
  }, [onNodeSelect, onClearSelection]);

  useEffect(() => {
     if (cyRef.current) {
        cyRef.current.layout(layout).run();
     }
  }, [cyElements]);

  return (
    <div className="w-full h-full bg-[#05050f] absolute inset-0 z-0">
      <CytoscapeComponent 
        elements={cyElements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={layout}
        cy={(cy) => { cyRef.current = cy; }}
        wheelSensitivity={0.1}
      />
    </div>
  );
}
