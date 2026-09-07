import React, { useRef, useEffect, useCallback, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import { FiCrosshair, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import TimelineScrubber from './TimelineScrubber';

// Helper to truncate long labels
function truncateLabel(label, type) {
  if (!label) return '?';
  const str = String(label);
  if (type === 'BANK_ACCOUNT' && str.length > 6) return '•••' + str.slice(-4);
  if (type === 'PHONE' && str.length > 6) return '•••' + str.slice(-4);
  if (type === 'LOCATION' && str.length > 14) return str.slice(0, 12) + '…';
  if (type === 'ORGANIZATION' && str.length > 15) return str.slice(0, 13) + '…';
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
    'font-size': 'data(fontSize)',
    'font-weight': 'bold',
    'text-outline-color': '#05050f',
    'text-outline-width': 2.5,
    'min-zoomed-font-size': 5,
    'width': 'data(nodeSize)',
    'height': 'data(nodeSize)',
    'border-width': 'data(borderWidth)',
    'border-color': '#ffffff30',
    'overlay-padding': '4px',
    'transition-property': 'opacity, border-color, border-width, width, height',
    'transition-duration': '0.2s',
  }},

  // ── NODE TYPES ──
  { selector: 'node[type="PERSON"]', style: {
    'background-color': '#ff4757',
    'border-color': '#ff6b81',
    'shape': 'ellipse',
  }},
  { selector: 'node[type="PHONE"]', style: {
    'background-color': '#00d2d3',
    'border-color': '#48dbfb',
    'shape': 'diamond',
  }},
  { selector: 'node[type="LOCATION"]', style: {
    'background-color': '#54a0ff',
    'border-color': '#2e86de',
    'shape': 'round-rectangle',
  }},
  { selector: 'node[type="VEHICLE"]', style: {
    'background-color': '#1dd1a1',
    'border-color': '#10ac84',
    'shape': 'pentagon',
  }},
  { selector: 'node[type="BANK_ACCOUNT"]', style: {
    'background-color': '#feca57',
    'border-color': '#ff9f43',
    'shape': 'hexagon',
  }},
  { selector: 'node[type="ORGANIZATION"]', style: {
    'background-color': '#a29bfe',
    'border-color': '#6c5ce7',
    'shape': 'round-rectangle',
  }},
  { selector: 'node[type="SOCIAL_HANDLE"]', style: {
    'background-color': '#fd79a8',
    'border-color': '#e84393',
    'shape': 'star',
  }},

  // ── THREAT-BASED SIZING & GLOW ──
  { selector: 'node[threatLevel="HIGH"]', style: {
    'border-width': 3.5,
    'border-color': '#ff0040',
    'shadow-blur': 18,
    'shadow-color': '#ff0040',
    'shadow-opacity': 0.85,
    'shadow-offset-x': 0,
    'shadow-offset-y': 0,
  }},
  { selector: 'node[threatLevel="MEDIUM"]', style: {
    'border-width': 2.2,
    'border-color': '#ffd32a',
    'shadow-blur': 8,
    'shadow-color': '#ffd32a',
    'shadow-opacity': 0.35,
    'shadow-offset-x': 0,
    'shadow-offset-y': 0,
  }},
  { selector: 'node[threatLevel="LOW"]', style: {
    'border-width': 1.5,
    'border-color': 'rgba(255,255,255,0.2)',
  }},

  // ── BASE EDGES (Labels hidden by default to keep canvas clean) ──
  { selector: 'edge', style: {
    'width': 2,
    'line-color': '#57606f',
    'target-arrow-color': '#57606f',
    'target-arrow-shape': 'triangle',
    'arrow-scale': 0.9,
    'curve-style': 'bezier',
    'opacity': 0.75,
    'label': '',
    'font-size': '9px',
    'font-weight': 'bold',
    'color': '#ffffff',
    'text-rotation': 'autorotate',
    'text-outline-width': 2,
    'text-outline-color': '#05050f',
    'transition-property': 'opacity, line-color, width, label',
    'transition-duration': '0.2s',
  }},

  // ── SPECIFIC RELATIONSHIPS (Vivid high-contrast colors) ──
  { selector: 'edge[type="COMMANDS"]', style: { 
    'line-color': '#ff4757', 
    'target-arrow-color': '#ff4757',
    'width': 2.5,
    'opacity': 0.9
  }},
  { selector: 'edge[type="DIRECTS_OPERATIONS_FOR"]', style: { 
    'line-color': '#ff6b81', 
    'target-arrow-color': '#ff6b81',
    'width': 2.5,
    'opacity': 0.9
  }},
  { selector: 'edge[type="HIRED"]', style: { 
    'line-color': '#ffa502', 
    'target-arrow-color': '#ffa502',
    'width': 2.2,
    'opacity': 0.85
  }},
  { selector: 'edge[type="CONTROLS"]', style: { 
    'line-color': '#a29bfe', 
    'target-arrow-color': '#a29bfe',
    'width': 2.2,
    'opacity': 0.85
  }},
  { selector: 'edge[type="CALLED"]', style: { 
    'line-color': '#00d2d3', 
    'target-arrow-color': '#00d2d3',
    'width': 2.2,
    'opacity': 0.85
  }},
  { selector: 'edge[type="THREATENED"]', style: { 
    'line-color': '#ff3838', 
    'target-arrow-color': '#ff3838',
    'line-style': 'dashed',
    'line-dash-pattern': [6, 3],
    'width': 2.5,
    'opacity': 0.95
  }},
  { selector: 'edge[type="TRANSFERRED_MONEY_TO"]', style: { 
    'line-color': '#ffd32a', 
    'target-arrow-color': '#ffd32a',
    'width': 2.5,
    'opacity': 0.9
  }},
  { selector: 'edge[type="SPOTTED_AT"]', style: { 
    'line-color': '#54a0ff', 
    'target-arrow-color': '#54a0ff',
    'width': 2.2,
    'opacity': 0.85
  }},
  { selector: 'edge[type="OWNS_PHONE"]', style: { 
    'line-color': '#2ed573', 
    'target-arrow-color': '#2ed573',
    'width': 1.8,
    'opacity': 0.8
  }},
  { selector: 'edge[type="OWNS_ACCOUNT"]', style: { 
    'line-color': '#eccc68', 
    'target-arrow-color': '#eccc68',
    'width': 1.8,
    'opacity': 0.8
  }},
  { selector: 'edge[type="OWNS_VEHICLE"]', style: { 
    'line-color': '#7bed9f', 
    'target-arrow-color': '#7bed9f',
    'width': 1.8,
    'opacity': 0.8
  }},
  { selector: 'edge[type="OWNS_HANDLE"]', style: { 
    'line-color': '#fd79a8', 
    'target-arrow-color': '#fd79a8',
    'width': 1.8,
    'opacity': 0.8
  }},
  { selector: 'edge[type="TAGGED_IN_POST"]', style: { 
    'line-color': '#e056fd', 
    'target-arrow-color': '#e056fd',
    'line-style': 'dashed',
    'line-dash-pattern': [5, 3],
    'width': 1.8,
    'opacity': 0.85
  }},
  { selector: 'edge[type="POSTED_FROM"]', style: { 
    'line-color': '#67e6dc', 
    'target-arrow-color': '#67e6dc',
    'width': 1.8,
    'opacity': 0.85
  }},
  { selector: 'edge[type="CO_ACCUSED"]', style: { 
    'line-color': '#ff4757', 
    'target-arrow-color': '#ff4757', 
    'width': 2.4,
    'opacity': 0.9
  }},
  { selector: 'edge[type="ASSOCIATED_WITH"]', style: { 
    'line-color': '#ffa502', 
    'target-arrow-color': '#ffa502', 
    'width': 2.2,
    'opacity': 0.85
  }},
  { selector: 'edge[type="OPERATES"]', style: { 
    'line-color': '#a29bfe', 
    'target-arrow-color': '#a29bfe', 
    'width': 2.2,
    'opacity': 0.85
  }},
  { selector: 'edge[type="OPERATES_VEHICLE"]', style: { 
    'line-color': '#7bed9f', 
    'target-arrow-color': '#7bed9f', 
    'width': 2.0,
    'opacity': 0.85
  }},
  { selector: 'edge[type="OPERATES_IN"]', style: { 
    'line-color': '#54a0ff', 
    'target-arrow-color': '#54a0ff', 
    'width': 2.0,
    'opacity': 0.85
  }},
  { selector: 'edge[type="MENTIONED_IN_FIR"]', style: { 
    'line-color': '#ff5252', 
    'target-arrow-color': '#ff5252', 
    'line-style': 'dotted',
    'width': 2,
    'opacity': 0.85
  }},
  { selector: 'edge[type="PREDICTED"]', style: {
    'line-color': '#ffff00',
    'target-arrow-color': '#ffff00',
    'line-style': 'dashed',
    'line-dash-pattern': [6, 3],
    'width': 2,
    'opacity': 0.85,
  }},
  { selector: 'edge.ghost-link', style: {
    'line-color': '#ff0066',
    'target-arrow-color': '#ff0066',
    'line-style': 'dashed',
    'line-dash-pattern': [8, 4],
    'opacity': 0.75,
    'width': 2,
  }},

  // ── SELECTION & HOVER ──
  { selector: 'node:active', style: {
    'overlay-color': '#64ffda',
    'overlay-opacity': 0.2,
  }},
  { selector: ':selected', style: {
    'border-width': 4,
    'border-color': '#64ffda',
    'opacity': 1,
  }},
  { selector: 'edge:selected, edge.edge-selected', style: {
    'label': 'data(label)',
    'width': 4.0,
    'opacity': 1,
    'font-size': '11px',
    'font-weight': 'bold',
    'color': '#64ffda',
    'line-color': '#64ffda',
    'target-arrow-color': '#64ffda',
    'text-outline-width': 2.5,
    'text-outline-color': '#05050f',
    'text-rotation': 'autorotate',
    'z-index': 9999,
  }},

  // ── NEIGHBORHOOD HIGHLIGHT ──
  { selector: 'node.highlighted', style: {
    'opacity': 1,
    'border-width': 4,
    'border-color': '#64ffda',
    'z-index': 999,
  }},
  { selector: 'edge.highlighted', style: {
    'opacity': 1,
    'width': 3.2,
    'z-index': 998,
  }},
  { selector: 'node.dimmed', style: {
    'opacity': 0.15,
  }},
  { selector: 'edge.dimmed', style: {
    'opacity': 0.08,
  }},
  { selector: '.temporal-hidden', style: {
    'display': 'none',
  }},
  { selector: 'node.connection-source', style: {
    'border-color': '#64ffda',
    'border-width': 5,
    'shadow-blur': 25,
    'shadow-color': '#64ffda',
    'shadow-opacity': 1,
    'z-index': 1000,
  }},
  { selector: 'node.connection-target', style: {
    'border-color': '#f9ca24',
    'border-width': 5,
    'shadow-blur': 25,
    'shadow-color': '#f9ca24',
    'shadow-opacity': 1,
    'z-index': 1000,
  }},
];

const layout = {
  name: 'cose',
  animate: true,
  animationDuration: 750,
  animationEasing: 'ease-out',
  fit: true,
  padding: 55,
  randomize: false,
  componentSpacing: 120,
  nodeRepulsion: 75000,
  nodeOverlap: 10,
  idealEdgeLength: 110,
  edgeElasticity: 45,
  nestingFactor: 1.1,
  gravity: 0.25,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0,
};

export default function GraphCanvas({ 
  elements, 
  activeCase, 
  onNodeSelect, 
  onClearSelection, 
  highlightPath, 
  isConnectionMode = false,
  connectionSource = null,
  connectionTarget = null,
  connectionPathResult = null,
  onConnectionNodeClick,
  onExitConnectionMode,
  onResetConnection
}) {
  const cyRef = useRef(null);
  const [timelineFilter, setTimelineFilter] = useState(null);

  const isConnectionModeRef = useRef(isConnectionMode);
  const onConnectionNodeClickRef = useRef(onConnectionNodeClick);
  useEffect(() => { isConnectionModeRef.current = isConnectionMode; }, [isConnectionMode]);
  useEffect(() => { onConnectionNodeClickRef.current = onConnectionNodeClick; }, [onConnectionNodeClick]);

  // Sync source and target node highlighting on Cytoscape
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.nodes().removeClass('connection-source').removeClass('connection-target');

    if (connectionSource) {
      const s = cy.getElementById(String(connectionSource.id));
      if (s.length) s.addClass('connection-source');
    }
    if (connectionTarget) {
      const t = cy.getElementById(String(connectionTarget.id));
      if (t.length) t.addClass('connection-target');
    }
  }, [connectionSource, connectionTarget]);


  useEffect(() => {
    if (!cyRef.current || timelineFilter === null) return;
    const cy = cyRef.current;
    
    cy.batch(() => {
      cy.edges().forEach(edge => {
        const ts = edge.data('timestamp');
        // If edge has a timestamp, hide if it occurred AFTER the filter date
        if (ts && new Date(ts).getTime() > timelineFilter) {
          edge.addClass('temporal-hidden');
        } else {
          edge.removeClass('temporal-hidden');
        }
      });
      
      cy.nodes().forEach(node => {
        const connectedEdges = node.connectedEdges();
        if (connectedEdges.length === 0) return;
        
        // A node is visible if ANY of its connected edges are visible
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
      const risk = n.risk_score || n.riskScore || 0;
      const role = String(n.properties?.role || '').toLowerCase();
      const nameLower = rawLabel.toLowerCase();

      // Threat & Node Size Logic:
      // HIGH: Apex Kingpins, Cartel Bosses (Size: 52px, Font: 11px)
      // MEDIUM: Lieutenants, Enforcers, Key Hubs (Size: 34px, Font: 9.5px)
      // LOW/NORMAL: Standard Suspects (28px), Orgs (26px), Locations (24px), Phones/Vehicles/Accounts (22px)
      let threatLevel = 'LOW';
      let nodeSize = 22;
      let fontSize = '8.5px';
      let borderWidth = 1.4;

      const isHighRole = role.includes('boss') || role.includes('head') || role.includes('mastermind') || role.includes('don') || role.includes('commander') || role.includes('leader') || role.includes('cartel');
      const isHighName = nameLower.includes('dawood') || nameLower.includes('shakeel') || nameLower.includes('salem') || nameLower.includes('tiger memon') || nameLower.includes('d-international');

      if (type === 'PERSON' && (isHighRole || isHighName || pr >= 0.08 || risk >= 0.7)) {
        threatLevel = 'HIGH';
        nodeSize = 52;
        fontSize = '11px';
        borderWidth = 3.2;
      } else if (type === 'PERSON' && (pr >= 0.03 || risk >= 0.35 || role.includes('lt') || role.includes('lieutenant') || role.includes('distributor') || role.includes('tech lead') || role.includes('shooter'))) {
        threatLevel = 'MEDIUM';
        nodeSize = 34;
        fontSize = '9.5px';
        borderWidth = 2.0;
      } else if (type === 'PERSON') {
        threatLevel = 'LOW';
        nodeSize = 28;
        fontSize = '9.0px';
        borderWidth = 1.6;
      } else if (type === 'ORGANIZATION') {
        threatLevel = (pr >= 0.05 || risk >= 0.5) ? 'MEDIUM' : 'LOW';
        nodeSize = 26;
        fontSize = '8.5px';
        borderWidth = 1.6;
      } else if (type === 'LOCATION') {
        threatLevel = 'LOW';
        nodeSize = 24;
        fontSize = '8.5px';
        borderWidth = 1.4;
      } else if (type === 'PHONE' || type === 'BANK_ACCOUNT' || type === 'VEHICLE') {
        threatLevel = 'LOW';
        nodeSize = 22;
        fontSize = '8.0px';
        borderWidth = 1.2;
      } else {
        threatLevel = 'LOW';
        nodeSize = 22;
        fontSize = '8.5px';
        borderWidth = 1.4;
      }

      return {
        data: {
          ...n,
          id: String(n.id),
          label: rawLabel,
          shortLabel: truncateLabel(rawLabel, type),
          type: type,
          pagerank: pr,
          threatLevel: threatLevel,
          nodeSize: nodeSize,
          fontSize: fontSize,
          borderWidth: borderWidth,
          highRisk: threatLevel === 'HIGH'
        }
      };
    });
    
    const edges = (elements.edges || []).map((e, idx) => ({
      data: {
        ...e,
        id: `edge_${e.id ?? `${e.source}_${e.target}_${idx}`}`,
        source: String(e.source),
        target: String(e.target),
        type: e.type,
        label: e.label || e.type,
        weight: e.weight || 1
      },
      classes: e.is_ghost ? 'ghost-link' : ''
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
      
      if (isConnectionModeRef.current) {
        if (onConnectionNodeClickRef.current) {
          onConnectionNodeClickRef.current(node.data());
        }
        return;
      }
      
      cy.edges().removeClass('edge-selected').unselect();
      highlightNeighborhood(cy, node);
      onNodeSelect(node.data());
    };

    const handleTapEdge = (evt) => {
      const edge = evt.target;
      cy.edges().removeClass('edge-selected').unselect();
      edge.addClass('edge-selected').select();
    };
    
    const handleTapBg = (evt) => {
      if (evt.target === cy) {
        if (isConnectionModeRef.current) {
          return;
        }
        clearHighlight(cy);
        cy.edges().removeClass('edge-selected').unselect();
        onClearSelection();
      }
    };

    const handleMouseOver = (evt) => {
      const node = evt.target;
      const d = node.data();
      const fullLabel = d.label || d.id;
      node.scratch('_tippy', fullLabel);
      node.style('content', fullLabel);
    };

    cy.on('tap', 'node', handleTapNode);
    cy.on('tap', 'edge', handleTapEdge);
    cy.on('tap', handleTapBg);
    
    return () => {
      cy.off('tap', 'node', handleTapNode);
      cy.off('tap', 'edge', handleTapEdge);
      cy.off('tap', handleTapBg);
    };
  }, [onNodeSelect, onClearSelection, highlightNeighborhood, clearHighlight]);

  // Highlight path from PathFinder or Two-Click Connection Tracer
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    
    if (!highlightPath || highlightPath.length === 0) {
      if (isConnectionMode && connectionSource) {
        cy.elements().addClass('dimmed').removeClass('highlighted');
        const sNode = cy.getElementById(String(connectionSource.id));
        if (sNode.length) sNode.removeClass('dimmed').addClass('highlighted');
      } else {
        clearHighlight(cy);
      }
      return;
    }
    
    clearHighlight(cy);
    const pathIds = highlightPath.map(String);
    cy.elements().addClass('dimmed').removeClass('highlighted');
    
    const highlightedElements = [];
    pathIds.forEach(id => {
      const node = cy.getElementById(id);
      if (node.length) {
        node.removeClass('dimmed').addClass('highlighted');
        highlightedElements.push(node);
      }
    });
    
    for (let i = 0; i < pathIds.length - 1; i++) {
      const edges = cy.edges().filter(e => {
        const s = e.data('source'), t = e.data('target');
        return (s === pathIds[i] && t === pathIds[i+1]) || (s === pathIds[i+1] && t === pathIds[i]);
      });
      edges.removeClass('dimmed').addClass('highlighted');
      edges.forEach(e => highlightedElements.push(e));
    }

    // Zoom and pan smoothly to the highlighted path
    if (highlightedElements.length > 1) {
      try {
        const collection = cy.collection(highlightedElements);
        cy.animate({
          fit: { eles: collection, padding: 80 },
          duration: 500,
          easing: 'ease-in-out'
        });
      } catch {
        // Safe fallback
      }
    }
  }, [highlightPath, isConnectionMode, connectionSource, clearHighlight]);

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
          
          {/* Top-Center Floating HUD Banner for Connection Mode */}
          {isConnectionMode && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto">
              {!connectionSource && (
                <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#0a1628]/95 border border-[#64ffda] shadow-[0_0_25px_rgba(100,255,218,0.35)] backdrop-blur-md">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#64ffda] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#64ffda]"></span>
                  </span>
                  <span className="text-xs text-white font-mono font-medium">
                    <strong className="text-[#64ffda]">STEP 1:</strong> Click 1st entity on canvas to set <span className="text-[#64ffda] underline font-bold">SOURCE</span>
                  </span>
                  <button
                    onClick={onExitConnectionMode}
                    className="ml-2 text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#1e3a5f]/70 hover:bg-[#1e3a5f] border border-[#1e3a5f] font-mono transition-colors cursor-pointer"
                    title="Exit Connection Mode"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {connectionSource && !connectionTarget && (
                <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#0a1628]/95 border border-[#f9ca24] shadow-[0_0_25px_rgba(249,202,36,0.35)] backdrop-blur-md">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f9ca24] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f9ca24]"></span>
                  </span>
                  <span className="text-xs text-white font-mono font-medium">
                    Source: <strong className="text-[#64ffda]">{connectionSource.label || connectionSource.name}</strong> ➔ <strong className="text-[#f9ca24]">STEP 2:</strong> Click <span className="text-[#f9ca24] underline font-bold">TARGET</span> entity
                  </span>
                  <button
                    onClick={onResetConnection}
                    className="ml-2 text-xs text-gray-300 hover:text-white px-2.5 py-0.5 rounded bg-[#13233a] hover:bg-[#1e3a5f] border border-[#1e3a5f] font-mono transition-colors cursor-pointer"
                    title="Change source entity"
                  >
                    Reset
                  </button>
                  <button
                    onClick={onExitConnectionMode}
                    className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#1e3a5f]/70 hover:bg-[#1e3a5f] border border-[#1e3a5f] font-mono transition-colors cursor-pointer"
                    title="Exit Connection Mode"
                  >
                    ✕
                  </button>
                </div>
              )}

              {connectionSource && connectionTarget && (
                <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#0a1628]/95 border border-[#64ffda] shadow-[0_0_30px_rgba(100,255,218,0.4)] backdrop-blur-md">
                  <span className="text-xs text-white font-mono font-medium flex items-center gap-2">
                    <span className="text-[#64ffda] font-bold">✓ Path:</span>
                    <span className="text-gray-200 font-semibold">{connectionSource.label || connectionSource.name}</span>
                    <span className="text-[#64ffda]">➔</span>
                    <span className="text-gray-200 font-semibold">{connectionTarget.label || connectionTarget.name}</span>
                    <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#64ffda]/20 text-[#64ffda] font-bold text-[11px] border border-[#64ffda]/40">
                      {connectionPathResult?.found ? `${connectionPathResult.length ?? (connectionPathResult.path?.length - 1)} Hops` : 'No Direct Link'}
                    </span>
                  </span>
                  <button
                    onClick={onResetConnection}
                    className="ml-2 text-xs text-[#64ffda] hover:text-white px-2.5 py-0.5 rounded bg-[#13233a] hover:bg-[#1e3a5f] border border-[#64ffda]/50 hover:border-[#64ffda] font-mono transition-colors font-bold cursor-pointer"
                    title="Trace another pair of entities"
                  >
                    ↺ Trace Another
                  </button>
                  <button
                    onClick={onExitConnectionMode}
                    className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#1e3a5f]/70 hover:bg-[#1e3a5f] border border-[#1e3a5f] font-mono transition-colors cursor-pointer"
                    title="Exit Connection Mode"
                  >
                    ✕ Exit
                  </button>
                </div>
              )}
            </div>
          )}
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
