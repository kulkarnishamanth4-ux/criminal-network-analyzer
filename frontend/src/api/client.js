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

export const uploadFile = (type, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`/api/upload/${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
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

export const simulateHawalaFluid = (frozenAccountIds = [], caseId = "dawood") => {
  return client.post('/api/experimental/hawala-fluid/simulate', { frozen_account_ids: frozenAccountIds, case_id: caseId }).then(res => res.data);
};

export const getPanicEntropy = (entityId, caseId = "dawood") => {
  return client.get(`/api/experimental/panic-entropy/${entityId}`, { params: { case_id: caseId } }).then(res => res.data);
};

export const getQuantumMole = (caseId = "dawood") => {
  return client.get('/api/experimental/quantum-mole', { params: { case_id: caseId } }).then(res => res.data);
};

export const decodeCryptolalia = (text, caseId = "dawood") => {
  return client.post('/api/experimental/cryptolalia/decode', { text, case_id: caseId }).then(res => res.data);
};

export const simulateHoneypotSting = (threatMessage, turnIndex = 1, caseId = "dawood") => {
  return client.post('/api/experimental/honeypot-sting/simulate', { threat_message: threatMessage, turn_index: turnIndex, case_id: caseId }).then(res => res.data);
};

export const getDynastyPedigree = (caseId = "dawood") => {
  return client.get('/api/experimental/dynasty-pedigree', { params: { case_id: caseId } }).then(res => res.data);
};

export const getPlateCloningResolver = (caseId = "dawood") => {
  return client.get('/api/experimental/plate-cloning-resolver', { params: { case_id: caseId } }).then(res => res.data);
};

export const forecastGangwarCascade = (triggerEvent = "FIR_001_VIKRAM_SHARMA_NARCOTICS_CRACKDOWN", caseId = "dawood") => {
  return client.post('/api/experimental/gangwar-cascade/forecast', { trigger_event: triggerEvent, case_id: caseId }).then(res => res.data);
};

export const runMoriartyRedteam = (attackVector = "HAWALA_MICRO_SMURFING_EVASION", caseId = "dawood") => {
  return client.post('/api/experimental/moriarty-redteam/attack-and-patch', { attack_vector: attackVector, case_id: caseId }).then(res => res.data);
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

