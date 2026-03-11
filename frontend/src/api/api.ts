import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('feca-admin-token');
  if (token) {
    config.headers['x-token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token no es válido o expiró
      localStorage.removeItem("feca-admin-token");
      // Opcional: Redirigir al login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;