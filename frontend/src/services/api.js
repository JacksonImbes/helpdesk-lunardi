import axios from 'axios';

const api = axios.create({
  // Lê a URL da API do arquivo .env
  baseURL: process.env.REACT_APP_API_URL,
});

// O interceptor de request continua sendo a melhor forma de anexar o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@HelpdeskLunardi:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;