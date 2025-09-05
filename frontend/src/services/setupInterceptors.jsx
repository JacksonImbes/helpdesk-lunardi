import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// --- ESTA PARTE É A MAIS IMPORTANTE ---
// Interceptor que adiciona o token a TODAS as requisições
api.interceptors.request.use(async config => {
  // Busca o token do localStorage (ou de onde você o salvou)
  const token = localStorage.getItem('@lunardi-helpdesk/token');

  if (token) {
    // Se o token existir, adiciona o cabeçalho 'Authorization'
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;