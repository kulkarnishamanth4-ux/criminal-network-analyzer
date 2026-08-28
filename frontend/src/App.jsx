import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import GraphCanvas from './components/GraphCanvas';
import RightPanel from './components/RightPanel';
import UploadModal from './components/UploadModal';
import NodeLegend from './components/NodeLegend';
import PathFinder from './components/PathFinder';
import ExperimentalLabsModal from './components/ExperimentalLabsModal';
import LandingPage from './components/LandingPage';
import GeospatialMap from './components/GeospatialMap';
import { FiShare2, FiMap } from 'react-icons/fi';
import { getFullGraph, getDashboardStats, getPredictedLinks } from './api/client';

function App() {
  const [showApp, setShowApp] = useState(false);
  const [viewMode, setViewMode] = useState('network');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [stats, setStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExperimentalModal, setShowExperimentalModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightPath, setHighlightPath] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [graphRes, statsRes, linksRes] = await Promise.all([
        getFullGraph().catch(() => ({ nodes: [], edges: [] })),
        getDashboardStats().catch(() => null),
        getPredictedLinks().catch(() => ({ predictions: [] }))
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

  useEffect(() => {
    if (showApp) {
      loadData();
    }
  }, [showApp]);

  const handleNodeSelect = (node) => {
    setSelectedEntity(node);
  };

  const handleClearSelection = () => {
    setSelectedEntity(null);
    setHighlightPath(null);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    showToast('Data ingested successfully. Network updated.');
    loadData();
  };

  const handlePathFound = (path) => {
    setHighlightPath(path);
    showToast(`Connection traced: ${path.length - 1} hops`, 'info');
  };

  const handleExpandNetwork = async (entityId) => {
    if (!entityId) return;
    try {
      const { getNetwork } = await import('./api/client');
      const netRes = await getNetwork(entityId, 2);
      if (netRes && netRes.nodes && netRes.nodes.length > 0) {
        setHighlightPath(netRes.nodes.map(n => n.id));
        showToast(`Subnetwork isolated: ${netRes.nodes.length} connected entities`, 'info');
      }
    } catch {
      showToast('Could not isolate subnetwork', 'error');
    }
  };

  const handleHighlightNodes = (nodeIds) => {
    setHighlightPath(nodeIds.map(String));
    showToast(`Spotlighted ${nodeIds.length} tactical strike targets on canvas`, 'info');
  };

  if (!showApp) {
    return <LandingPage onEnter={() => setShowApp(true)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header 
        onUploadClick={() => setShowUploadModal(true)} 
        onSearchResultSelect={handleNodeSelect}
        onExperimentalClick={() => setShowExperimentalModal(true)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <LeftPanel stats={stats} onEntitySelect={handleNodeSelect} />
        
        <main className="flex-1 relative flex flex-col bg-[#05050f]">
          {/* View Toggle */}
          <div className="absolute top-4 right-4 z-50 flex bg-[#111] p-1 rounded-lg border border-[#333] shadow-lg">
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

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--text-accent)]"></div>
            </div>
          ) : viewMode === 'network' ? (
            <>
              <GraphCanvas 
                elements={graphData} 
                onNodeSelect={handleNodeSelect} 
                onClearSelection={handleClearSelection}
                highlightPath={highlightPath}
              />
              <NodeLegend />
              <PathFinder onPathFound={handlePathFound} />
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
        />
      </div>

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onSuccess={handleUploadSuccess} 
        />
      )}

      {showExperimentalModal && (
        <ExperimentalLabsModal 
          onClose={() => setShowExperimentalModal(false)}
          onHighlightNodes={handleHighlightNodes}
        />
      )}

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
