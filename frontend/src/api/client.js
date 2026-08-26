import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
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
