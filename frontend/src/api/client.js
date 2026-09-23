import axios from 'axios';
import offlineData from '../data/offline_intelligence.json';

// Use environment variable for deployed API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const searchEntities = (query, type, caseId = 'dawood') => {
  return client.get('/api/search', { params: { q: query, type, case_id: caseId } })
    .then(res => res.data)
    .catch(() => {
      const g = offlineData[caseId]?.graph;
      if (!g || !query) return { results: [] };
      const qLower = query.toLowerCase();
      const results = (g.nodes || [])
        .filter(n => (n.name || n.label || '').toLowerCase().includes(qLower))
        .map(n => ({
          id: n.id,
          name: n.name || n.label,
          label: n.name || n.label,
          type: n.type || n.entity_type,
          entity_type: n.type || n.entity_type,
          risk_score: n.risk_score || n.metrics?.pagerank || 0,
          properties: n.properties || {},
          metrics: n.metrics || {}
        }));
      return { results };
    });
};

export const getNetwork = (entityId, depth = 2, caseId = 'dawood') => {
  return client.get(`/api/network/${entityId}`, { params: { depth, case_id: caseId } })
    .then(res => res.data)
    .catch(() => offlineData[caseId]?.graph || { nodes: [], edges: [] });
};

export const getFullGraph = (limit = 150, caseId = 'dawood') => {
  return client.get(`/api/graph/full?limit=${limit}&case_id=${caseId}`)
    .then(res => {
      if (res.data && res.data.nodes && res.data.nodes.length > 0) return res.data;
      return offlineData[caseId]?.graph || { nodes: [], edges: [] };
    })
    .catch(() => {
      return offlineData[caseId]?.graph || { nodes: [], edges: [] };
    });
};

export const getTopInfluencers = (limit = 10, caseId = 'dawood') => {
  return client.get('/api/analytics/top-influencers', { params: { limit, case_id: caseId } })
    .then(res => {
      if (res.data && (Array.isArray(res.data) ? res.data.length > 0 : res.data.influencers?.length > 0)) return res.data;
      return { influencers: offlineData[caseId]?.influencers || [] };
    })
    .catch(() => ({ influencers: offlineData[caseId]?.influencers || [] }));
};

export const getCommunities = (caseId = 'dawood') => {
  return client.get('/api/analytics/communities', { params: { case_id: caseId } })
    .then(res => {
      if (res.data && (Array.isArray(res.data) ? res.data.length > 0 : res.data.communities?.length > 0)) {
        return res.data;
      }
      return offlineData[caseId]?.communities || [];
    })
    .catch(() => offlineData[caseId]?.communities || []);
};

export const getAnomalies = (caseId = 'dawood') => {
  return client.get('/api/analytics/anomalies', { params: { case_id: caseId } })
    .then(res => {
      if (res.data && res.data.anomalies && res.data.anomalies.length > 0) return res.data;
      return { anomalies: offlineData[caseId]?.anomalies || [], count: offlineData[caseId]?.anomalies?.length || 0 };
    })
    .catch(() => ({ anomalies: offlineData[caseId]?.anomalies || [], count: offlineData[caseId]?.anomalies?.length || 0 }));
};

export const getCrimePredictions = (caseId = 'dawood') => {
  return client.get('/api/analytics/crime-predictions', { params: { case_id: caseId } })
    .then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      return [
        { crime_type: "Extortion & Threat Operations", confidence: 0.95, count: 4 },
        { crime_type: "Organized Crime / Gangland", confidence: 0.90, count: 3 },
        { crime_type: "Hawala & Money Laundering", confidence: 0.85, count: 2 },
        { crime_type: "Arms Smuggling & Firearms", confidence: 0.75, count: 2 }
      ];
    })
    .catch(() => [
      { crime_type: "Extortion & Threat Operations", confidence: 0.95, count: 4 },
      { crime_type: "Organized Crime / Gangland", confidence: 0.90, count: 3 },
      { crime_type: "Hawala & Money Laundering", confidence: 0.85, count: 2 },
      { crime_type: "Arms Smuggling & Firearms", confidence: 0.75, count: 2 }
    ]);
};

export const getPredictedLinks = (minConfidence = 0.3, caseId = 'dawood') => {
  return client.get('/api/analytics/predicted-links', { params: { min_confidence: minConfidence, case_id: caseId } })
    .then(res => res.data)
    .catch(() => ({ predicted_links: [] }));
};

export const getDashboardStats = (caseId = 'dawood') => {
  return client.get('/api/analytics/dashboard-stats', { params: { case_id: caseId } })
    .then(res => {
      if (res.data && res.data.total_entities > 0) return res.data;
      return offlineData[caseId]?.stats || { total_entities: 0, total_relations: 0, total_clusters: 0, active_threats: 0 };
    })
    .catch(() => {
      return offlineData[caseId]?.stats || { total_entities: 0, total_relations: 0, total_clusters: 0, active_threats: 0 };
    });
};

export const buildOfflineEntityDossier = (entityId, caseId = 'dawood') => {
  const targetCase = offlineData[caseId] ? caseId : 'dawood';
  let caseData = offlineData[targetCase] || {};
  let graph = caseData.graph || { nodes: [], edges: [] };

  // 1. Try finding in active case
  let node = (graph.nodes || []).find(n => 
    String(n.id) === String(entityId) ||
    (n.name && String(n.name).toLowerCase() === String(entityId).toLowerCase()) ||
    (n.label && String(n.label).toLowerCase() === String(entityId).toLowerCase())
  );

  // 2. If not found, search all other cases in offline data
  if (!node) {
    for (const [cid, cData] of Object.entries(offlineData)) {
      const found = (cData.graph?.nodes || []).find(n => 
        String(n.id) === String(entityId) ||
        (n.name && String(n.name).toLowerCase() === String(entityId).toLowerCase()) ||
        (n.label && String(n.label).toLowerCase() === String(entityId).toLowerCase())
      );
      if (found) {
        node = found;
        caseData = cData;
        break;
      }
    }
  }

  const rawLabel = node?.name || node?.label || (entityId ? `Entity #${entityId}` : 'Unknown Entity');
  const type = node?.type || node?.entity_type || 'PERSON';
  const pr = node?.metrics?.pagerank || node?.pagerank || 0;
  const bt = node?.metrics?.betweenness || node?.betweenness || 0;
  const cid = node?.metrics?.community_id ?? node?.community_id ?? null;
  const risk = node?.risk_score || (pr > 0 ? Math.min(1.0, pr * 15) : 0.35);

  const entity = {
    id: node?.id || entityId,
    name: rawLabel,
    label: rawLabel,
    type: type,
    entity_type: type,
    properties: node?.properties || {},
    metrics: node?.metrics || { pagerank: pr, betweenness: bt, community_id: cid },
    pagerank: pr,
    betweenness: bt,
    community_id: cid,
    risk_score: risk
  };

  // Find connected relationships
  const relationships = [];
  const gEdges = caseData.graph?.edges || [];
  const gNodes = caseData.graph?.nodes || [];
  const nodeMap = new Map(gNodes.map(n => [String(n.id), n]));

  if (node) {
    gEdges.forEach(e => {
      const isOut = String(e.source) === String(node.id);
      const isIn = String(e.target) === String(node.id);
      if (isOut || isIn) {
        const otherId = isOut ? e.target : e.source;
        const otherNode = nodeMap.get(String(otherId));
        const otherName = otherNode ? (otherNode.name || otherNode.label) : `Entity #${otherId}`;
        relationships.push({
          id: e.id,
          type: e.type || e.label || 'ASSOCIATED_WITH',
          target_id: otherId,
          target_name: otherName,
          direction: isOut ? 'outgoing' : 'incoming',
          properties: e.properties || {},
          timestamp: e.timestamp || null
        });
      }
    });
  }

  // Linked anomalies
  const nodeIdStr = String(node?.id || entityId);
  const anomalies = (caseData.anomalies || []).filter(a =>
    a.entity_ids && a.entity_ids.some(eid => String(eid) === nodeIdStr)
  );

  // Linked FIRs
  const nameLower = rawLabel.toLowerCase();
  const firs = (caseData.firs || []).filter(f =>
    (f.raw_text && f.raw_text.toLowerCase().includes(nameLower)) ||
    (f.extracted_entities && f.extracted_entities.some(ee => String(ee).toLowerCase().includes(nameLower)))
  );

  return {
    entity,
    relationships,
    anomalies,
    firs
  };
};

export const getEntityDossier = (entityId, caseId = 'dawood') => {
  return client.get(`/api/entity/${entityId}/dossier`)
    .then(res => {
      if (res.data && res.data.entity && !res.data.error) {
        return res.data;
      }
      return buildOfflineEntityDossier(entityId, caseId);
    })
    .catch(() => {
      return buildOfflineEntityDossier(entityId, caseId);
    });
};

export const uploadFile = (type, file, caseId, clearExisting = false) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`/api/upload/${type}?case_id=${caseId || 'custom_investigation'}&clear_existing=${clearExisting}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const resetInvestigation = (caseId = 'custom_investigation') => {
  return client.post(`/api/investigation/reset?case_id=${caseId}`).then(res => res.data);
};

export const loadSampleInvestigation = (caseId = 'custom_investigation') => {
  return client.post(`/api/investigation/load-sample?case_id=${caseId}`).then(res => res.data);
};

export const restoreCanonicalCase = (caseId = 'dawood') => {
  return client.post(`/api/investigation/restore-canonical?case_id=${caseId}`).then(res => res.data);
};

export const getShortestPath = (sourceId, targetId, caseId = 'dawood') => {
  return client.get('/api/graph/shortest-path', { params: { source_id: sourceId, target_id: targetId, case_id: caseId } })
    .then(res => res.data)
    .catch(() => {
      const graph = offlineData[caseId]?.graph || { nodes: [], edges: [] };
      const sId = String(sourceId);
      const tId = String(targetId);
      const adj = {};
      (graph.edges || []).forEach(e => {
        const u = String(e.source), v = String(e.target);
        if (!adj[u]) adj[u] = [];
        if (!adj[v]) adj[v] = [];
        adj[u].push({ neighbor: v, edge: e });
        adj[v].push({ neighbor: u, edge: e });
      });

      const queue = [[sId]];
      const visited = new Set([sId]);
      let foundPath = null;

      while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];
        if (curr === tId) {
          foundPath = path;
          break;
        }
        for (const { neighbor } of (adj[curr] || [])) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push([...path, neighbor]);
          }
        }
      }

      if (foundPath) {
        const nodeMap = new Map(graph.nodes.map(n => [String(n.id), n]));
        const steps = [];
        for (let i = 0; i < foundPath.length - 1; i++) {
          const fromNode = nodeMap.get(foundPath[i]);
          const toNode = nodeMap.get(foundPath[i+1]);
          steps.push({
            from: fromNode?.name || fromNode?.label || `Entity #${foundPath[i]}`,
            to: toNode?.name || toNode?.label || `Entity #${foundPath[i+1]}`,
            relationship: 'CONNECTED_TO'
          });
        }
        return { found: true, path: foundPath, steps };
      }
      return { found: false, message: 'No syndicate link found between entities' };
    });
};

export const getDecapitation = (maxTargets = 3, caseId = "dawood") => {
  return client.get('/api/experimental/decapitation', { params: { max_targets: maxTargets, case_id: caseId } }).then(res => res.data);
};

export const getGhostRendezvous = (maxHours = 48, caseId = "dawood") => {
  return client.get('/api/experimental/ghost-rendezvous', { params: { max_time_diff_hours: maxHours, case_id: caseId } }).then(res => res.data);
};

export const interrogateSuspect = (entityId, question, history = []) => {
  return client.post('/api/experimental/interrogate', { entity_id: entityId, question, history }).then(res => res.data);
};

export const getSuspectsList = (caseId = "dawood") => {
  return client.get('/api/experimental/suspects', { params: { case_id: caseId } }).then(res => res.data);
};

export const getQuantumMole = (caseId = "dawood") => {
  return client.get('/api/experimental/quantum-mole', { params: { case_id: caseId } }).then(res => res.data);
};

export const getPlateCloningResolver = (caseId = "dawood") => {
  return client.get('/api/experimental/plate-cloning-resolver', { params: { case_id: caseId } }).then(res => res.data);
};

export const sendChatMessage = (message) => {
  return client.post('/api/chat', { message }).then(res => res.data);
};

export const analyzeSocmint = (posts, caseId = "dawood") => {
  return client.post('/api/experimental/socmint/analyze', { posts, case_id: caseId }).then(res => res.data);
};



// AI Chatbot
export const chatWithAgent = async (message, caseId = 'dawood', selectedEntity = null) => {
  const payload = { message, case_id: caseId };
  if (selectedEntity) {
    payload.selected_entity_id = selectedEntity.id;
    payload.selected_entity_name = selectedEntity.name || selectedEntity.label;
  }
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Chat API failed');
    return await response.json();
  } catch (err) {
    console.warn('[OFFLINE FALLBACK] Synthesizing offline AI intelligence reply');
    const caseInfo = offlineData[caseId] || {};
    const topSuspect = caseInfo.influencers?.[0]?.name || 'Primary Syndicate Node';
    const nodeCount = caseInfo.graph?.nodes?.length || 0;
    const anomalyCount = caseInfo.anomalies?.length || 0;
    
    let answerText = `[Offline Topological Intelligence]\nWorkspace: ${caseId.toUpperCase()}\n- Mapped Entities: ${nodeCount}\n- Detected Anomalies: ${anomalyCount}\n- Primary Influencer Hub: ${topSuspect}\n\n`;
    const msgLower = (message || '').toLowerCase();
    
    if (msgLower.includes('kingpin') || msgLower.includes('leader') || msgLower.includes('boss')) {
      answerText += `Topological analysis flags ${topSuspect} as the primary command apex with the highest centrality score in this network. Immediate Section 65B dossier export is recommended.`;
    } else if (msgLower.includes('money') || msgLower.includes('hawala') || msgLower.includes('cash') || msgLower.includes('financial')) {
      answerText += `Identified ${anomalyCount} high-severity financial transaction anomalies and layered shell account bridges routed through non-banking conduits.`;
    } else {
      answerText += `Synthesized intelligence from the local offline knowledge graph. Network shows compartmentalized communication trees and cross-jurisdictional conduits. Zero cloud dependencies required.`;
    }

    return {
      answer: answerText,
      sources: [caseId, 'Offline Embedded Graph'],
      suggested_actions: ['Inspect Key Influencers', 'Filter High Risk Nodes', 'Export Case Dossier']
    };
  }
};

// Blockchain & Crypto Intelligence
export const getBlockchainBlocks = (caseId = null) => {
  return client.get('/api/blockchain/blocks', { params: { case_id: caseId } }).then(res => res.data);
};

export const mineEvidenceBlock = (payload) => {
  return client.post('/api/blockchain/mine', payload).then(res => res.data);
};

export const verifyBlockchain = () => {
  return client.get('/api/blockchain/verify').then(res => res.data);
};

export const simulateTamperAttack = (blockIndex = 1) => {
  return client.post('/api/blockchain/simulate-tamper', { block_index: blockIndex }).then(res => res.data);
};

export const repairBlockchain = () => {
  return client.post('/api/blockchain/repair').then(res => res.data);
};

export const getSection65BCertificate = (blockIndex) => {
  return client.get(`/api/blockchain/certificate/${blockIndex}`).then(res => res.data);
};

export const getCryptoFlow = (caseId = 'cyber_bengaluru', walletAddress = null) => {
  return client.get('/api/blockchain/crypto-flow', { params: { case_id: caseId, wallet_address: walletAddress } }).then(res => res.data);
};

// === FILE MANAGER ===
export const getUploadedFiles = (caseId) => 
  client.get(`/api/files/${caseId}`).then(res => res.data);

export const getFilePreview = (caseId, fileId) => 
  client.get(`/api/files/${caseId}/${fileId}/preview`).then(res => res.data);

export const deleteUploadedFile = (caseId, fileId) =>
  client.delete(`/api/files/${caseId}/${fileId}`).then(res => res.data);

export const clearAllUploadedFiles = (caseId) =>
  client.delete(`/api/files/${caseId}`).then(res => res.data);

// === ALIAS PROBABILITY ===
export const checkAliasMatch = (nameA, nameB, caseId, context = '') => 
  client.post('/api/alias/probability', { name_a: nameA, name_b: nameB, case_id: caseId, context }).then(res => res.data);

export const getSuggestedSuspects = (caseId) =>
  client.get('/api/alias/suggest-suspects', { params: { case_id: caseId } }).then(res => res.data);

// === AUDIT LOGS ===
export const getAuditLogs = (limit = 100, severity = null, query = null) => 
  client.get('/api/audit/logs', { params: { limit, severity, q: query } }).then(res => res.data);

export const logAuditEvent = (payload) =>
  client.post('/api/audit/log', payload).then(res => res.data).catch(err => {
    console.warn('Silent audit log failure', err);
    return null;
  });

export const verifyAuditIntegrity = () => 
  client.get('/api/audit/verify').then(res => res.data);

export const exportAuditReport = () => 
  client.get('/api/audit/export').then(res => res.data);

// === HOD & SMS AUTHENTICATION ===
export const getHodSetup = () =>
  client.get('/api/auth/hod/setup').then(res => res.data);

export const verifyHodOtp = (otp, action = 'SENSITIVE_OPERATION', caseId = 'dawood', operator = 'OFFICER-ATS-402') =>
  client.post('/api/auth/hod/verify', { otp, action, case_id: caseId, operator }).then(res => res.data);

export const sendSmsOtp = (phone, rank = 'INVESTIGATOR', officerName = 'Officer') =>
  client.post('/api/auth/sms/send-otp', { phone, rank, officer_name: officerName }).then(res => res.data);

export const verifySmsOtp = (phone, otp, rank = 'INVESTIGATOR', officerName = 'Officer') =>
  client.post('/api/auth/sms/verify-otp', { phone, otp, rank, officer_name: officerName }).then(res => res.data);

export { client, API_URL };


