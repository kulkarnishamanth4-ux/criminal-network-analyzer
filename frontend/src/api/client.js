import axios from 'axios';

// Use environment variable for deployed API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

export const searchEntities = (query, type) => {
  return client.get('/api/search', { params: { q: query, type } }).then(res => res.data);
};

export const getNetwork = (entityId, depth = 2) => {
  return client.get(`/api/network/${entityId}`, { params: { depth } }).then(res => res.data);
};

export const getFullGraph = () => {
  return client.get('/api/graph/full').then(res => res.data);
};

export const getTopInfluencers = (limit = 10) => {
  return client.get('/api/analytics/top-influencers', { params: { limit } }).then(res => res.data);
};

export const getCommunities = () => {
  return client.get('/api/analytics/communities').then(res => res.data);
};

export const getAnomalies = () => {
  return client.get('/api/analytics/anomalies').then(res => res.data);
};

export const getCrimePredictions = () => {
  return client.get('/api/analytics/crime-predictions').then(res => res.data);
};

export const getPredictedLinks = (minConfidence = 0.3) => {
  return client.get('/api/analytics/predicted-links', { params: { min_confidence: minConfidence } }).then(res => res.data);
};

export const getDashboardStats = () => {
  return client.get('/api/analytics/dashboard-stats').then(res => res.data);
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

export const getShortestPath = (sourceId, targetId) => {
  return client.get('/api/graph/shortest-path', { params: { source_id: sourceId, target_id: targetId } }).then(res => res.data);
};

export const getDecapitation = (maxTargets = 3) => {
  return client.get('/api/experimental/decapitation', { params: { max_targets: maxTargets } }).then(res => res.data);
};

export const getGhostRendezvous = (maxHours = 48) => {
  return client.get('/api/experimental/ghost-rendezvous', { params: { max_time_diff_hours: maxHours } }).then(res => res.data);
};

export const matchStylometry = (text) => {
  return client.post('/api/experimental/stylometry/match', { text }).then(res => res.data);
};

export const interrogateSuspect = (entityId, question, history = []) => {
  return client.post('/api/experimental/interrogate', { entity_id: entityId, question, history }).then(res => res.data);
};

export const getSuspectsList = () => {
  return client.get('/api/experimental/suspects').then(res => res.data);
};

export const analyzeAcoustics = (audioProfileId = "intercept_call_001") => {
  return client.post('/api/experimental/ghost-acoustic/analyze', { audio_profile_id: audioProfileId }).then(res => res.data);
};

export const simulateHawalaFluid = (frozenAccountIds = []) => {
  return client.post('/api/experimental/hawala-fluid/simulate', { frozen_account_ids: frozenAccountIds }).then(res => res.data);
};

export const getPanicEntropy = (entityId) => {
  return client.get(`/api/experimental/panic-entropy/${entityId}`).then(res => res.data);
};

export const getQuantumMole = () => {
  return client.get('/api/experimental/quantum-mole').then(res => res.data);
};

export const decodeCryptolalia = (text) => {
  return client.post('/api/experimental/cryptolalia/decode', { text }).then(res => res.data);
};

export const getZkFederation = () => {
  return client.get('/api/experimental/zk-federation').then(res => res.data);
};

export const simulateHoneypotSting = (threatMessage, turnIndex = 1) => {
  return client.post('/api/experimental/honeypot-sting/simulate', { threat_message: threatMessage, turn_index: turnIndex }).then(res => res.data);
};

export const getDynastyPedigree = () => {
  return client.get('/api/experimental/dynasty-pedigree').then(res => res.data);
};

export const getPlateCloningResolver = () => {
  return client.get('/api/experimental/plate-cloning-resolver').then(res => res.data);
};

export const forecastGangwarCascade = (triggerEvent = "FIR_001_VIKRAM_SHARMA_NARCOTICS_CRACKDOWN") => {
  return client.post('/api/experimental/gangwar-cascade/forecast', { trigger_event: triggerEvent }).then(res => res.data);
};

export const runMoriartyRedteam = (attackVector = "HAWALA_MICRO_SMURFING_EVASION") => {
  return client.post('/api/experimental/moriarty-redteam/attack-and-patch', { attack_vector: attackVector }).then(res => res.data);
};

export const sendChatMessage = (message) => {
  return client.post('/api/chat', { message }).then(res => res.data);
};

export const analyzeSocmint = (posts) => {
  return client.post('/api/experimental/socmint/analyze', { posts }).then(res => res.data);
};


