import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.fecastore-ujed.com/api'
});

// En tu archivo de configuración de API (donde creas axios.create)
// api.ts
api.interceptors.request.use((config) => {
  // Detectar si la ruta es de alumno o admin
  let token = null;
  const adminToken = localStorage.getItem("feca-admin-token");
  const alumnoToken = localStorage.getItem("feca-alumno-token");

  if (config.url?.includes('/alumno/')) {
    token = alumnoToken;
  } else if (config.url?.includes('/administrador/')) {
    token = adminToken;
  } else if (config.url?.includes('/auth/me')) {
    // Perfil puede ser solicitado por cualquier rol autenticado.
    token = adminToken || alumnoToken;
  }

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