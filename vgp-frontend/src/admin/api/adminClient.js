import axios from 'axios';

const adminClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'}/admin`,
  timeout: 30000,
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default adminClient;
