import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import './styles.css';
import logoColorida from '../../assets/images/logomarca.png';

// ALTERAÇÃO AQUI: Importando diretamente do Contexto para garantir que usamos o código mais recente.
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Pegamos também o 'loading' do nosso hook de autenticação
  const { signIn, loading } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Corrigido para passar um objeto, como o nosso AuthContext espera
      await signIn({ email, password });
      // O redirecionamento é feito automaticamente pela estrutura de rotas
    } catch (err) {
      // Capturamos a mensagem de erro específica vinda do servidor
      const errorMessage = err.response?.data?.error || 'Falha no login. Verifique suas credenciais.';
      setError(errorMessage);
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
            {/* O botão agora fica desabilitado e mostra um spinner durante o login */}
            <Button
              variant="primary"
              type="submit"
              size="lg"
              style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Carregando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}