import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import setupInterceptors from '../services/setupInterceptors';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = () => {
    localStorage.removeItem('@HelpdeskLunardi:user');
    localStorage.removeItem('@HelpdeskLunardi:token');
    setUser(null);
  };
  
  useEffect(() => {
    setupInterceptors(signOut);

    function loadStoragedData() {
      const storagedUser = localStorage.getItem('@HelpdeskLunardi:user');
      const storagedToken = localStorage.getItem('@HelpdeskLunardi:token');

      if (storagedUser && storagedToken) {
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
    
    setUser(user);
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