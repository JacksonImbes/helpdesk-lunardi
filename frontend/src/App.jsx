import React from 'react';
import { useAuth } from './contexts/AuthContext';
import AppRoutes from './routes/app.routes';
import AuthRoutes from './routes/auth.routes';

function App() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>A carregar sistema...</h2>
      </div>
    );
  }

  return signed ? <AppRoutes /> : <AuthRoutes />;
}

export default App;