import api from './api';

const setupInterceptors = (signOut) => {
  api.interceptors.response.use(
    // Se a resposta for sucesso, apenas a retorne
    (response) => response,
    // Se a resposta for erro...
    (error) => {
      // Verificamos se o erro é de 'Não Autorizado'
      if (error.response && error.response.status === 401) {
        // Se for, chamamos a função signOut que recebemos do AuthContext
        signOut();
      }
      // Rejeitamos a promise para que o erro continue seu fluxo e possa ser tratado no componente
      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;