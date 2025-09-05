import React from 'react';
// CORREÇÃO 1: Importa o useAuth diretamente do contexto para garantir consistência
import { useAuth } from './contexts/AuthContext';
import AppRoutes from './routes/app.routes';
import AuthRoutes from './routes/auth.routes';

function App() {
  // CORREÇÃO 2: Pega 'user' do contexto, em vez de 'signed'
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>A carregar sistema...</h2>
      </div>
    );
  }

  // CORREÇÃO 3: A decisão de qual rota mostrar é baseada na existência do 'user'
  return user ? <AppRoutes /> : <AuthRoutes />;
}

export default App;