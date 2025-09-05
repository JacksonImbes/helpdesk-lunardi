import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [data, setData] = useState({ user: null, loading: true });

  useEffect(() => {
    async function loadStoragedData() {
      const token = localStorage.getItem('@lunardi-helpdesk/token');
      const user = localStorage.getItem('@lunardi-helpdesk/user');

      if (token && user) {
        // Valida o token na API para garantir que a sessão ainda é válida
        try {
          await api.get('/sessions/validate');
          setData({ user: JSON.parse(user), loading: false });
        } catch (error) {
          // Se o token for inválido, limpa o armazenamento
          signOut();
        }
      } else {
        setData({ user: null, loading: false });
      }
    }
    loadStoragedData();
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('/sessions', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('@lunardi-helpdesk/token', token);
    localStorage.setItem('@lunardi-helpdesk/user', JSON.stringify(user));
    
    setData({ user, loading: false });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@lunardi-helpdesk/token');
    localStorage.removeItem('@lunardi-helpdesk/user');
    setData({ user: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, loading: data.loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}