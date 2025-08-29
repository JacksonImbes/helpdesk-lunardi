import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './styles.css';
import logoColorida from '../../assets/images/logomarca.png';

import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      // Se o login for bem-sucedido, o AllRoutes vai automaticamente
      // redirecionar para o Dashboard. Não precisamos fazer nada aqui.
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logoColorida} alt="Transportadora Lunardi" className="login-logo" />
        <h2 className="login-title">Acesso ao Sistema de TI</h2>
        <p className="login-subtitle">Utilize suas credenciais para entrar</p>
        
        <Form onSubmit={handleLogin}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Endereço de e-mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="seuemail@lunardi.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formBasicPassword">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit" size="lg" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>
              Entrar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}