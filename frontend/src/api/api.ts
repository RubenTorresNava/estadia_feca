import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// En tu archivo de configuración de API (donde creas axios.create)
// api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("feca-admin-token");
  if (token) {
    config.headers["x-token"] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Solo limpiar y redirigir si NO estamos ya en la página de login
      localStorage.removeItem("feca-admin-token");
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;