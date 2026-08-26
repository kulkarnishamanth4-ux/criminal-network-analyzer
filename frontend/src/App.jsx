import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import GraphCanvas from './components/GraphCanvas';
import RightPanel from './components/RightPanel';
import UploadModal from './components/UploadModal';
import NodeLegend from './components/NodeLegend';
import { getFullGraph, getDashboardStats } from './api/client';

function App() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [stats, setStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [graphRes, statsRes] = await Promise.all([
        getFullGraph().catch(() => ({ nodes: [], edges: [] })),
        getDashboardStats().catch(() => null)
      ]);
      if (graphRes) setGraphData(graphRes);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNodeSelect = (node) => {
    setSelectedEntity(node);
  };

  const handleClearSelection = () => {
    setSelectedEntity(null);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadData(); // Refresh data after upload
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header onUploadClick={() => setShowUploadModal(true)} onSearchResultSelect={handleNodeSelect} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <LeftPanel stats={stats} onEntitySelect={handleNodeSelect} />
        
        <main className="flex-1 relative flex">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--text-accent)]"></div>
            </div>
          ) : (
            <GraphCanvas 
              elements={graphData} 
              onNodeSelect={handleNodeSelect} 
              onClearSelection={handleClearSelection}
            />
          )}
          <NodeLegend />
        </main>
        
        <RightPanel selectedEntity={selectedEntity} onEntitySelect={handleNodeSelect} />
      </div>

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onSuccess={handleUploadSuccess} 
        />
      )}
    </div>
  );
}

export default App;
