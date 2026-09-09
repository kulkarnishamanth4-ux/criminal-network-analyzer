import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import GraphCanvas from './components/GraphCanvas';
import RightPanel from './components/RightPanel';
import UploadModal from './components/UploadModal';
import NodeLegend from './components/NodeLegend';
import PathFinder from './components/PathFinder';
import ExperimentalLabsModal from './components/ExperimentalLabsModal';
import BlockchainLedgerModal from './components/BlockchainLedgerModal';
import LandingPage from './components/LandingPage';
import GeospatialMap from './components/GeospatialMap';
import ChatBot from './components/ChatBot';
import LoginScreen from './components/LoginScreen';
import AuditLogViewer from './components/AuditLogViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { FiShare2, FiMap, FiRotateCcw, FiFileText } from 'react-icons/fi';
import { getFullGraph, getDashboardStats, getPredictedLinks, getShortestPath, resetInvestigation, loadSampleInvestigation, logAuditEvent } from './api/client';

const CASE_NAMES = {
  'custom_investigation': 'New Investigation (Custom Data Upload)',
  'dawood': 'Operation Syndicate (Dawood D-Company)',
  'drug_punjab': 'Operation Falcon: Golden Crescent Narcotics (Punjab)',
  'ht_assam': 'Operation Rescue: Cross-Border Trafficking (Assam)',
  'cyber_bengaluru': 'Project DarkWeb: Apex Crypto Extortion (Bengaluru)',
  'money_gujarat': 'Operation Swarn: Diamond City Hawala (Surat)',
  'arms_chhattisgarh': 'Operation Red Corridor: Jungle Arms (Bastar)',
  'wildlife_kerala': 'Operation WildTusk: Ivory Poaching (Wayanad)',
  'extortion_up': 'Operation Bahubali: Purvanchal Mafia (Gorakhpur)'
};

function App() {
  const [showApp, setShowApp] = useState(false);
  const [viewMode, setViewMode] = useState('network');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [stats, setStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExperimentalModal, setShowExperimentalModal] = useState(false);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightPath, setHighlightPath] = useState(null);
  const [toast, setToast] = useState(null);

  const [activeCase, setActiveCase] = useState('dawood');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Panel Collapse & Layout States
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);
  const prevPanelStateRef = useRef({ left: false, right: false, timeline: false });

  // Two-Click Connection Tracer State
  const [isConnectionMode, setIsConnectionMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState(null);
  const [connectionTarget, setConnectionTarget] = useState(null);
  const [connectionPathResult, setConnectionPathResult] = useState(null);
  const [isPathFinderOpen, setIsPathFinderOpen] = useState(false);
  const [pathLoading, setPathLoading] = useState(false);

  const canAccess = (feature) => {
    if (!currentUser) return false;
    const level = currentUser.level || 0;
    const permissions = {
      'upload': level >= 2,
      'chat': level >= 2,
      'alias': level >= 3,
      'experimental': level >= 3,
      'blockchain': level >= 3,
      'audit': level >= 3,
      'report': level >= 2,
    };
    return permissions[feature] ?? false;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async (caseId = activeCase) => {
    setIsLoading(true);
    try {
      const [graphRes, statsRes, linksRes] = await Promise.all([
        getFullGraph(3000, caseId).catch(() => ({ nodes: [], edges: [] })),
        getDashboardStats(caseId).catch(() => null),
        getPredictedLinks(caseId).catch(() => ({ predictions: [] }))
      ]);
      
      let finalEdges = graphRes?.edges || [];
      if (linksRes && linksRes.predictions && linksRes.predictions.length > 0) {
          const predictedEdges = linksRes.predictions.map((p, i) => ({
              id: `pred_${p.source_id}_${p.target_id}_${i}`,
              source: p.source_id,
              target: p.target_id,
              type: 'PREDICTED',
              label: 'PREDICTED LINK',
              weight: p.confidence
          }));
          finalEdges = [...finalEdges, ...predictedEdges];
      }
      
      if (graphRes) setGraphData({ nodes: graphRes.nodes || [], edges: finalEdges });
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaseChange = (newCase) => {
    setActiveCase(newCase);
    setSelectedEntity(null);
    setHighlightPath(null);
    handleExitConnectionMode();
    const caseTitle = CASE_NAMES[newCase] || newCase;
    logAuditEvent({
      action: 'CASE_SWITCHED',
      resource: `CASE:${newCase}`,
      details: `Officer switched active investigation workspace to '${caseTitle}'`,
      severity: 'INFO',
      user: currentUser?.name || currentUser?.badge || 'OFFICER-ATS-402'
    });
  };

  const handleStartConnectionMode = () => {
    // Save current panel states before auto-collapsing
    prevPanelStateRef.current = {
      left: isLeftPanelCollapsed,
      right: isRightPanelCollapsed,
      timeline: isTimelineCollapsed
    };

    // Auto-collapse Left Panel, Right Panel, and bottom Timeline Panel
    setIsLeftPanelCollapsed(true);
    setIsRightPanelCollapsed(true);
    setIsTimelineCollapsed(true);

    setIsConnectionMode(true);
    setIsPathFinderOpen(true);
    setConnectionSource(null);
    setConnectionTarget(null);
    setConnectionPathResult(null);
    setHighlightPath(null);
    setSelectedEntity(null);

    // Trigger Cytoscape Fit to Screen on expanded canvas
    setFitTrigger(prev => prev + 1);
  };

  const handleExitConnectionMode = () => {
    setIsConnectionMode(false);
    setIsPathFinderOpen(false);
    setConnectionSource(null);
    setConnectionTarget(null);
    setConnectionPathResult(null);
    setHighlightPath(null);

    // Restore previous panel states
    if (prevPanelStateRef.current) {
      setIsLeftPanelCollapsed(prevPanelStateRef.current.left);
      setIsRightPanelCollapsed(prevPanelStateRef.current.right);
      setIsTimelineCollapsed(prevPanelStateRef.current.timeline);
    }

    // Trigger Fit to Screen to adapt to restored canvas dimensions
    setFitTrigger(prev => prev + 1);
  };

  const handleResetConnection = () => {
    setConnectionSource(null);
    setConnectionTarget(null);
    setConnectionPathResult(null);
    setHighlightPath(null);
    setFitTrigger(prev => prev + 1);
  };

  const executeShortestPath = async (src, tgt) => {
    if (!src || !tgt) return;
    setPathLoading(true);
    try {
      const result = await getShortestPath(src.id, tgt.id, activeCase);
      setConnectionPathResult(result);
      if (result.found && result.path && result.path.length > 0) {
        setHighlightPath(result.path);
        const hops = result.length ?? (result.path.length - 1);
        showToast(`Traced connection: ${hops} hops between ${src.label || src.name} and ${tgt.label || tgt.name}`, 'success');
        logAuditEvent({
          action: 'CONNECTION_PATH_TRACED',
          resource: `TRACE:${src.id}->${tgt.id}`,
          details: `Traced ${hops}-hop criminal connection chain between '${src.label || src.name}' and '${tgt.label || tgt.name}' (Case: ${activeCase})`,
          severity: 'INFO',
          user: currentUser?.name || currentUser?.badge || 'OFFICER-ATS-402'
        });
      } else {
        setHighlightPath(null);
        showToast(result.message || 'No direct connection found between selected entities', 'warning');
      }
    } catch (err) {
      console.error("Shortest path error", err);
      setConnectionPathResult({ found: false, message: 'Connection lookup failed' });
      showToast('Path lookup failed', 'error');
    } finally {
      setPathLoading(false);
    }
  };

  const handleConnectionNodeClick = async (nodeData) => {
    const formattedNode = {
      id: nodeData.id,
      name: nodeData.label || nodeData.name,
      label: nodeData.label || nodeData.name,
      entity_type: nodeData.type || nodeData.entity_type,
      type: nodeData.type || nodeData.entity_type,
    };

    if (!connectionSource) {
      // 1st click: Set Source
      setConnectionSource(formattedNode);
      setConnectionTarget(null);
      setConnectionPathResult(null);
      setHighlightPath([formattedNode.id]);
      showToast(`Source set: "${formattedNode.name}". Now click target entity on canvas.`, 'info');
    } else if (!connectionTarget) {
      // 2nd click: Set Target
      if (String(connectionSource.id) === String(formattedNode.id)) {
        showToast('Please click a different entity as target', 'warning');
        return;
      }
      setConnectionTarget(formattedNode);
      await executeShortestPath(connectionSource, formattedNode);
    } else {
      // 3rd click after path found: start new trace
      setConnectionSource(formattedNode);
      setConnectionTarget(null);
      setConnectionPathResult(null);
      setHighlightPath([formattedNode.id]);
      showToast(`New trace started! Source: "${formattedNode.name}". Click target entity.`, 'info');
    }
  };

  const handleSelectSource = (srcNode) => {
    const formatted = {
      id: srcNode.id,
      name: srcNode.name || srcNode.label,
      label: srcNode.name || srcNode.label,
      entity_type: srcNode.entity_type || srcNode.type,
      type: srcNode.entity_type || srcNode.type,
    };
    setConnectionSource(formatted);
    setConnectionPathResult(null);
    if (connectionTarget) {
      executeShortestPath(formatted, connectionTarget);
    } else {
      setHighlightPath([formatted.id]);
    }
  };

  const handleSelectTarget = (tgtNode) => {
    const formatted = {
      id: tgtNode.id,
      name: tgtNode.name || tgtNode.label,
      label: tgtNode.name || tgtNode.label,
      entity_type: tgtNode.entity_type || tgtNode.type,
      type: tgtNode.entity_type || tgtNode.type,
    };
    setConnectionTarget(formatted);
    if (connectionSource) {
      executeShortestPath(connectionSource, formatted);
    }
  };

  useEffect(() => {
    if (showApp) {
      loadData(activeCase);
    }
  }, [showApp, activeCase]);

  const handleNodeSelect = (node) => {
    setSelectedEntity(node);
    if (!node) return;
    const name = node.label || node.name || `Entity #${node.id}`;
    const type = node.type || node.entity_type || 'ENTITY';
    const props = node.properties || {};
    const role = props.role || props.classification || '';
    const isVictim = String(role).toLowerCase().includes('victim') || props.status === 'Under Police Protection';
    const isAccused = (node.risk_score || 0) >= 0.7 || String(role).toLowerCase().includes('kingpin') || String(role).toLowerCase().includes('boss') || String(role).toLowerCase().includes('enforcer') || String(role).toLowerCase().includes('sharpshooter');
    const classification = isVictim ? 'VICTIM' : (isAccused ? 'ACCUSED' : type);

    logAuditEvent({
      action: 'ENTITY_RECORD_ACCESSED',
      resource: `ENTITY:${node.id}:${name}`,
      details: `Officer inspected intelligence profile for ${classification} '${name}' (Role: ${role || type}, Risk: ${Math.round((node.risk_score || 0) * 100)}%, Case: ${activeCase})`,
      severity: isAccused ? 'WARNING' : 'INFO',
      user: currentUser?.name || currentUser?.badge || 'OFFICER-ATS-402'
    });
  };

  const handleClearSelection = () => {
    setSelectedEntity(null);
    setHighlightPath(null);
  };

  const handleUploadSuccess = (targetCase) => {
    setShowUploadModal(false);
    const destination = targetCase || 'custom_investigation';
    showToast(`Data ingested successfully into ${destination === 'custom_investigation' ? 'New Investigation' : destination}.`, 'success');
    if (destination !== activeCase) {
      setActiveCase(destination);
    }
    loadData(destination);
  };

  const handleResetCase = async () => {
    if (!window.confirm("Reset this investigation to a blank canvas? All uploaded data for this case will be wiped.")) return;
    try {
      await resetInvestigation('custom_investigation');
      showToast('Investigation reset to clean canvas.', 'info');
      setSelectedEntity(null);
      setHighlightPath(null);
      loadData('custom_investigation');
    } catch (err) {
      console.error(err);
      showToast('Failed to reset investigation', 'error');
    }
  };

  const handleLoadSampleCase = async () => {
    try {
      await loadSampleInvestigation('custom_investigation');
      showToast('Loaded verified sample FIR investigation.', 'success');
      setSelectedEntity(null);
      setHighlightPath(null);
      if (activeCase !== 'custom_investigation') {
        setActiveCase('custom_investigation');
      }
      loadData('custom_investigation');
    } catch (err) {
      console.error(err);
      showToast('Failed to load sample dataset', 'error');
    }
  };

  const handlePathFound = (path) => {
    setHighlightPath(path);
    showToast(`Connection traced: ${path.length - 1} hops`, 'info');
  };

  const handleExpandNetwork = async (entityId) => {
    if (!entityId) return;
    try {
      const { getNetwork } = await import('./api/client');
      const netRes = await getNetwork(entityId, 1, activeCase); // Depth 1 expansion
      if (netRes && netRes.nodes && netRes.nodes.length > 0) {
        
        // Virtualization: Merge the newly fetched subnetwork into the main graph state
        setGraphData(prev => {
          const existingNodeIds = new Set(prev.nodes.map(n => n.id));
          const existingEdgeIds = new Set(prev.edges.map(e => e.id));
          
          const newNodes = netRes.nodes.filter(n => !existingNodeIds.has(n.id));
          const newEdges = netRes.edges.filter(e => !existingEdgeIds.has(e.id));
          
          return {
            nodes: [...prev.nodes, ...newNodes],
            edges: [...prev.edges, ...newEdges]
          };
        });

        // Highlight the expanded neighborhood
        setHighlightPath(netRes.nodes.map(n => String(n.id)));
        showToast(`Expanded Network: Loaded ${netRes.nodes.length} connected entities`, 'info');
      }
    } catch {
      showToast('Could not expand subnetwork', 'error');
    }
  };

  const handleCommunitySelect = (communityId) => {
    const members = graphData.nodes.filter(n => n.metrics && String(n.metrics.community_id) === String(communityId));
    setHighlightPath(members.map(n => String(n.id)));
    showToast(`Spotlighted ${members.length} syndicate entities on canvas`, 'info');
  };

  const handleHighlightNodes = (nodeIds) => {
    setHighlightPath(nodeIds.map(String));
    showToast(`Spotlighted ${nodeIds.length} tactical strike targets on canvas`, 'info');
  };

  if (!showApp) return <LandingPage onEnter={() => setShowApp(true)} />;
  if (!isLoggedIn) return (
    <LoginScreen 
      onLogin={(user) => { 
        setCurrentUser(user); 
        setIsLoggedIn(true);
        logAuditEvent({
          action: 'OFFICER_SESSION_AUTHENTICATED',
          resource: `USER:${user.badge || user.id || 'OFFICER'}`,
          details: `Authorized login: ${user.name} (${user.role || 'Forensic Examiner'}, Level ${user.level || 1})`,
          severity: 'INFO',
          user: user.name || user.badge || 'OFFICER-ATS-402'
        });
      }} 
    />
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header 
        onUploadClick={() => setShowUploadModal(true)} 
        onExperimentalClick={() => setShowExperimentalModal(true)}
        onBlockchainClick={() => setShowBlockchainModal(true)}
        activeCase={activeCase}
        onCaseChange={handleCaseChange}
        currentUser={currentUser}
        onAuditClick={() => setShowAuditModal(true)}
        onLogout={() => {
          logAuditEvent({
            action: 'OFFICER_SESSION_LOGOUT',
            resource: `USER:${currentUser?.badge || currentUser?.id || 'OFFICER'}`,
            details: `Officer session terminated: ${currentUser?.name || 'Officer'}`,
            severity: 'INFO',
            user: currentUser?.name || currentUser?.badge || 'OFFICER-ATS-402'
          });
          setIsLoggedIn(false); 
          setCurrentUser(null); 
        }}
      />
      
      <div className="flex flex-1 overflow-hidden relative z-0">
        <LeftPanel 
          key={activeCase}
          stats={stats} 
          onEntitySelect={handleNodeSelect} 
          onCommunitySelect={handleCommunitySelect} 
          activeCase={activeCase}
          isCollapsed={isLeftPanelCollapsed}
          onToggleCollapse={setIsLeftPanelCollapsed}
        />
        
        <main className="flex-1 relative flex flex-col bg-[#05050f]">
          {/* Top-Right Canvas Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5">
            {activeCase === 'custom_investigation' && (
              <div className="flex items-center gap-1.5 bg-[#0a1424]/90 p-1 rounded-lg border border-[#1e3a5f] shadow-lg backdrop-blur-md">
                <button
                  onClick={handleLoadSampleCase}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-[#10223a] hover:bg-[#162c4b] border border-[#1e3a5f] hover:border-[#64ffda] text-[#64ffda] transition-colors cursor-pointer"
                  title="Load verified sample FIR dataset"
                >
                  <FiFileText size={12} /> Load Verified Sample
                </button>
                <button
                  onClick={handleResetCase}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-[#201018] hover:bg-[#2e1420] border border-red-500/40 hover:border-red-500 text-red-400 transition-colors cursor-pointer"
                  title="Clear this investigation to a blank canvas"
                >
                  <FiRotateCcw size={12} /> Reset Canvas
                </button>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex bg-[#111] p-1 rounded-lg border border-[#333] shadow-lg">
              <button 
                onClick={() => setViewMode('network')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'network' ? 'bg-[var(--text-accent)] text-[#000]' : 'text-gray-400 hover:text-white'}`}
              >
                <FiShare2 size={14} /> Network View
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'map' ? 'bg-[var(--text-accent)] text-[#000]' : 'text-gray-400 hover:text-white'}`}
              >
                <FiMap size={14} /> Map View
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--text-accent)]"></div>
            </div>
          ) : viewMode === 'network' ? (
            <>
              <GraphCanvas 
                key={activeCase}
                elements={graphData} 
                activeCase={activeCase}
                onNodeSelect={handleNodeSelect} 
                onClearSelection={handleClearSelection}
                highlightPath={highlightPath}
                isConnectionMode={isConnectionMode}
                connectionSource={connectionSource}
                connectionTarget={connectionTarget}
                connectionPathResult={connectionPathResult}
                onConnectionNodeClick={handleConnectionNodeClick}
                onExitConnectionMode={handleExitConnectionMode}
                onResetConnection={handleResetConnection}
                fitTrigger={fitTrigger}
                isTimelineCollapsed={isTimelineCollapsed}
                onToggleTimelineCollapse={setIsTimelineCollapsed}
              />
              <NodeLegend forceClose={isConnectionMode} />
              <PathFinder 
                isOpen={isPathFinderOpen}
                onOpen={handleStartConnectionMode}
                onClose={handleExitConnectionMode}
                source={connectionSource}
                target={connectionTarget}
                pathResult={connectionPathResult}
                onSelectSource={handleSelectSource}
                onSelectTarget={handleSelectTarget}
                onClearSource={() => { 
                  setConnectionSource(null); 
                  setConnectionPathResult(null); 
                  setHighlightPath(null); 
                }}
                onClearTarget={() => { 
                  setConnectionTarget(null); 
                  setConnectionPathResult(null); 
                  if (connectionSource) setHighlightPath([connectionSource.id]); 
                }}
                onReset={handleResetConnection}
                onFindPath={() => executeShortestPath(connectionSource, connectionTarget)}
                activeCase={activeCase}
                loading={pathLoading}
              />
            </>
          ) : (
            <GeospatialMap 
              elements={graphData} 
              onNodeSelect={handleNodeSelect}
              selectedEntity={selectedEntity}
            />
          )}
        </main>
        
        <RightPanel 
          selectedEntity={selectedEntity} 
          onEntitySelect={handleNodeSelect}
          onExpandNetwork={handleExpandNetwork}
          activeCase={activeCase}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={setIsRightPanelCollapsed}
        />
      </div>

      {showUploadModal && canAccess('upload') && (
        <UploadModal 
          activeCase={activeCase}
          onClose={() => setShowUploadModal(false)} 
          onSuccess={handleUploadSuccess} 
        />
      )}

      {showExperimentalModal && canAccess('experimental') && (
        <ExperimentalLabsModal 
          onClose={() => setShowExperimentalModal(false)}
          onHighlightNodes={handleHighlightNodes} activeCase={activeCase}
        />
      )}

      {showBlockchainModal && canAccess('blockchain') && (
        <ErrorBoundary>
          <BlockchainLedgerModal 
            onClose={() => setShowBlockchainModal(false)}
            activeCase={activeCase}
          />
        </ErrorBoundary>
      )}

      <AuditLogViewer isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} />

      {/* Floating AI Assistant */}
      {canAccess('chat') && <ChatBot activeCase={activeCase} />}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'success' ? 'bg-[var(--neon-green)] text-[#0a0a1a]' :
          toast.type === 'info' ? 'bg-[var(--text-accent)] text-[#0a0a1a]' :
          'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' && '✓'}
          {toast.type === 'info' && ''}
          {toast.type === 'error' && ''}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
