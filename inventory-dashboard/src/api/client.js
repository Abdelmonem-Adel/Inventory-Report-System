import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? (import.meta.env.VITE_API_BASE_URL + "/api") : '/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to include the token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const toggleAlertVisibility = (id) => client.patch(`/locations/scans/${id}/toggle-alert-visibility`)
export const bulkToggleAlertVisibility = (ids, hidden) => client.patch('/locations/scans/bulk-toggle-alert-visibility', { ids, hidden })

export default client
