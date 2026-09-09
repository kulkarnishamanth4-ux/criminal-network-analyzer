import axios from 'axios';

// Use environment variable for deployed API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

export const searchEntities = (query, type, caseId = 'dawood') => {
  return client.get('/api/search', { params: { q: query, type, case_id: caseId } }).then(res => res.data);
};

export const getNetwork = (entityId, depth = 2, caseId = 'dawood') => {
  return client.get(`/api/network/${entityId}`, { params: { depth, case_id: caseId } }).then(res => res.data);
};

export const getFullGraph = (limit = 150, caseId = 'dawood') => {
  return client.get(`/api/graph/full?limit=${limit}&case_id=${caseId}`).then(res => res.data);
};

export const getTopInfluencers = (limit = 10, caseId = 'dawood') => {
  return client.get('/api/analytics/top-influencers', { params: { limit, case_id: caseId } }).then(res => res.data);
};

export const getCommunities = (caseId = 'dawood') => {
  return client.get('/api/analytics/communities', { params: { case_id: caseId } }).then(res => res.data);
};

export const getAnomalies = (caseId = 'dawood') => {
  return client.get('/api/analytics/anomalies', { params: { case_id: caseId } }).then(res => res.data);
};

export const getCrimePredictions = (caseId = 'dawood') => {
  return client.get('/api/analytics/crime-predictions', { params: { case_id: caseId } }).then(res => res.data);
};

export const getPredictedLinks = (minConfidence = 0.3, caseId = 'dawood') => {
  return client.get('/api/analytics/predicted-links', { params: { min_confidence: minConfidence, case_id: caseId } }).then(res => res.data);
};

export const getDashboardStats = (caseId = 'dawood') => {
  return client.get('/api/analytics/dashboard-stats', { params: { case_id: caseId } }).then(res => res.data);
};

export const getEntityDossier = (entityId) => {
  return client.get(`/api/entity/${entityId}/dossier`).then(res => res.data);
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
  return client.get('/api/graph/shortest-path', { params: { source_id: sourceId, target_id: targetId, case_id: caseId } }).then(res => res.data);
};

export const getDecapitation = (maxTargets = 3, caseId = "dawood") => {
  return client.get('/api/experimental/decapitation', { params: { max_targets: maxTargets, case_id: caseId } }).then(res => res.data);
};

export const getGhostRendezvous = (maxHours = 48, caseId = "dawood") => {
  return client.get('/api/experimental/ghost-rendezvous', { params: { max_time_diff_hours: maxHours, case_id: caseId } }).then(res => res.data);
};

export const matchStylometry = (text, caseId = "dawood") => {
  return client.post('/api/experimental/stylometry/match', { text, case_id: caseId }).then(res => res.data);
};

export const interrogateSuspect = (entityId, question, history = []) => {
  return client.post('/api/experimental/interrogate', { entity_id: entityId, question, history }).then(res => res.data);
};

export const getSuspectsList = (caseId = "dawood") => {
  return client.get('/api/experimental/suspects', { params: { case_id: caseId } }).then(res => res.data);
};

export const analyzeAcoustics = (audioProfileId = "intercept_call_001", caseId = "dawood") => {
  return client.post('/api/experimental/ghost-acoustic/analyze', { audio_profile_id: audioProfileId, case_id: caseId }).then(res => res.data);
};

export const getQuantumMole = (caseId = "dawood") => {
  return client.get('/api/experimental/quantum-mole', { params: { case_id: caseId } }).then(res => res.data);
};

export const getDynastyPedigree = (caseId = "dawood") => {
  return client.get('/api/experimental/dynasty-pedigree', { params: { case_id: caseId } }).then(res => res.data);
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
export const chatWithAgent = async (message, caseId = 'dawood') => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, case_id: caseId })
  });
  if (!response.ok) throw new Error('Chat API failed');
  return response.json();
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

