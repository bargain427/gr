import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userAPI = {
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  get: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
};

// DNA API
export const dnaAPI = {
  upload: async (userId, provider, file) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('provider', provider);
    formData.append('file', file);
    
    const response = await api.post('/dna/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getReports: async (userId) => {
    const response = await api.get(`/dna/reports/${userId}`);
    return response.data;
  },
  
  getStatus: async (reportId) => {
    const response = await api.get(`/dna/status/${reportId}`);
    return response.data;
  }
};

// Health Plans API
export const healthPlansAPI = {
  create: async (userId, planType) => {
    const response = await api.post('/health-plans', {
      user_id: userId,
      plan_type: planType
    });
    return response.data;
  },
  
  getUserPlans: async (userId) => {
    const response = await api.get(`/health-plans/${userId}`);
    return response.data;
  },
  
  getPlanDetail: async (planId) => {
    const response = await api.get(`/health-plans/detail/${planId}`);
    return response.data;
  }
};

// AI Insights API
export const insightsAPI = {
  getUserInsights: async (userId, limit = 10) => {
    const response = await api.get(`/insights/${userId}?limit=${limit}`);
    return response.data;
  },
  
  generateDailyInsight: async (userId) => {
    const response = await api.post(`/insights/daily/${userId}`);
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: async (userId) => {
    const response = await api.get(`/dashboard/${userId}`);
    return response.data;
  }
};

// Wearables API
export const wearablesAPI = {
  sync: async (userId, deviceData) => {
    const response = await api.post(`/wearables/sync/${userId}`, deviceData);
    return response.data;
  },
  
  getData: async (userId, days = 7) => {
    const response = await api.get(`/wearables/${userId}?days=${days}`);
    return response.data;
  }
};

export default api;