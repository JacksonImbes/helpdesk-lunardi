import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadStoragedData() {
      const storagedUser = localStorage.getItem('@HelpdeskLunardi:user');
      const storagedToken = localStorage.getItem('@HelpdeskLunardi:token');

      if (storagedUser && storagedToken) {
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`;
        setUser(JSON.parse(storagedUser));
      }
      setLoading(false);
    }
    loadStoragedData();
  }, []);

  async function signIn(email, password) {
    const response = await api.post('/sessions', { email, password });
    const { user, token } = response.data;

    localStorage.setItem('@HelpdeskLunardi:user', JSON.stringify(user));
    localStorage.setItem('@HelpdeskLunardi:token', token);

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
  }

  function signOut() {
    localStorage.removeItem('@HelpdeskLunardi:user');
    localStorage.removeItem('@HelpdeskLunardi:token');
    delete api.defaults.headers.Authorization;
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}