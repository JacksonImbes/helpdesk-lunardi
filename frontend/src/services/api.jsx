import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
});

api.interceptors.request.use(
  (config) => {
    // Camada de segurança que se mantém ativa
    if (config.url && config.url.includes('/chamados/undefined')) {
      console.error(`[BLOQUEIO DE API] Requisição para URL inválida (${config.url}) foi bloqueada.`);
      return Promise.reject(new axios.Cancel('Requisição inválida cancelada.'));
    }

    const token = localStorage.getItem('@lunardi-helpdesk/token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;