import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns-tz';
import api from '../../services/api';
import Comment from '../../components/Comments';
import ActionPanel from '../../components/ActionPanel';
import { Form, Button } from 'react-bootstrap';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import './styles.css';


export default function ChamadoDetalhe() {
  const { id } = useParams();
  const [chamado, setChamado] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const fetchChamado = useCallback(async () => {
    try {
      const response = await api.get(`/chamado/${id}`);
      // Agora estas linhas estão CORRETAS, pois o backend envia neste formato
      setChamado(response.data.chamado);
      setComments(response.data.comments);
    } catch (error) {
      console.error("Erro detalhado no fetchChamado:", error.response || error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChamado();
  }, [fetchChamado]);

  async function handlePostComment(e) {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const token = localStorage.getItem('@HelpdeskLunardi:token');

    if (!token) {
      alert('A sua sessão expirou. Por favor, faça login novamente.');
      // Futuramente, podemos redirecionar o utilizador para a página de login aqui.
      return;
    }

    try {
      const response = await api.post(`/chamado/${id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      alert('Erro ao enviar comentário. Tente novamente.');
      console.error(error);
    }
  }

  const handleChamadoUpdate = (updatedChamado) => {
    setChamado(updatedChamado);
  };

  if (loading) {
    return <div className="loading-message">A carregar detalhes do chamado...</div>;
  }

  if (!chamado) {
    return <div className="error-message">Chamado não encontrado.</div>;
  }

  return (
    <div>
      <Link to="/" className="back-link">
        <FiArrowLeft />
        Voltar para o Dashboard
      </Link>

      <div className="detalhe-container">
        {/* Coluna Principal com a Timeline */}
        <div className="main-content">
          <div className="chamado-header">
            <span className={`status-badge-lg status-${chamado.status}`}>{chamado.status}</span>
            <h1>{chamado.title}</h1>
            <p className="header-subtext">
              Aberto por <strong>{chamado.creator_name || 'Sistema'}</strong> em {
                new Date(chamado.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
              }
            </p>
          </div>

          <div className="chamado-body">
            <h5>Descrição do Problema</h5>
            <p>{chamado.description}</p>
          </div>

          <div className="timeline-section">
            <h5>Histórico de Interações</h5>

            <div className="timeline-comments">
              {comments.length > 0 ? (
                comments.map(comment => <Comment key={comment.id} comment={comment} />)
              ) : (
                <p className="text-secondary">Nenhum comentário ainda. Seja o primeiro a interagir!</p>
              )}
            </div>

            <div className="new-comment-form">
              <Form onSubmit={handlePostComment}>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Escreva a sua atualização ou resposta aqui..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button variant="primary" type="submit" className="mt-2" style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>
                  <FiSend size={16} style={{ marginRight: '8px' }} />
                  Enviar Comentário
                </Button>
              </Form>
            </div>
          </div>
        </div>

        {/* Coluna Lateral com Ações e Detalhes */}
        <div className="sidebar-content">
          <ActionPanel chamado={chamado} onUpdate={handleChamadoUpdate} />
        </div>
      </div>
    </div>
  );
}