import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// --- O INTERCEPTOR COM DEPURADORES ---
api.interceptors.request.use(
  (config) => {
    // SENSOR 1: Confirma que o interceptor está a ser ativado para cada pedido.
    console.log(`[Interceptor] Ativado para o pedido: ${config.method.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('@HelpdeskLunardi:token');

    if (token) {
      // SENSOR 2: Confirma que o token foi encontrado e qual é o seu valor.
      console.log('[Interceptor] Token encontrado. A anexar ao cabeçalho.');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // SENSOR 3: Avisa-nos se nenhum token for encontrado.
      console.warn('[Interceptor] Nenhum token encontrado no localStorage.');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;