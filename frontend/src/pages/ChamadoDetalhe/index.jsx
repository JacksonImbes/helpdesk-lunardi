import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Comment from '../../components/Comments';
import ActionPanel from '../../components/ActionPanel';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import './styles.css';
import axios from 'axios';

export default function ChamadoDetalhe() {
  const { id } = useParams();
  const [chamado, setChamado] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isIdNumericAndValid = id && !isNaN(Number(id));

    if (!isIdNumericAndValid) {
      if (id !== undefined) {
        setError(`O ID do chamado na URL ("${id}") é inválido.`);
      }
      setLoading(false);
      return;
    }

    async function fetchChamado() {
      try {
        setLoading(true);
        const response = await api.get(`/chamados/${id}`);
        setChamado(response.data.chamado);
        setComments(response.data.comments);
        setError('');
      } catch (err) {
        if (axios.isCancel(err)) {
          setError('A requisição para um ID inválido foi bloqueada.');
          return;
        }
        setError('Não foi possível carregar os detalhes do chamado.');
      } finally {
        setLoading(false);
      }
    }

    fetchChamado();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '' || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/chamados/${id}/comments`, { content: newComment });
      setComments(prevComments => [...prevComments, response.data]);
      setNewComment('');
    } catch (err) {
      alert('Erro ao enviar comentário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChamadoUpdate = (updatedChamado) => {
    setChamado(updatedChamado);
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error || !chamado) {
    return (
      <div className="text-center mt-5">
        <Alert variant="danger">{error || 'Chamado não encontrado.'}</Alert>
        <Link to="/" className="btn btn-primary"><FiArrowLeft className="me-2" /> Voltar para o Dashboard</Link>
      </div>
    );
  }
  
  return (
    <div>
      <Link to="/" className="back-link"><FiArrowLeft /> Voltar para o Dashboard</Link>
      <div className="detalhe-container">
        <div className="main-content">
          <div className="chamado-header">
            <h1>{chamado.title}</h1>
            <p className="header-subtext">Aberto por <strong>{chamado.creator_name || 'Sistema'}</strong> em {new Date(chamado.created_at).toLocaleString('pt-BR')}</p>
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
              ) : <p className="text-secondary">Nenhum comentário ainda.</p>}
            </div>
            <div className="new-comment-form">
              <Form onSubmit={handlePostComment}>
                <Form.Control as="textarea" rows={3} placeholder="Escreva a sua atualização..." value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={isSubmitting} />
                <Button variant="primary" type="submit" className="mt-2" disabled={isSubmitting} style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>
                  {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : <FiSend size={16} />}
                  <span className="ms-2">{isSubmitting ? 'A Enviar...' : 'Enviar Comentário'}</span>
                </Button>
              </Form>
            </div>
          </div>
        </div>
        <div className="sidebar-content">
          <ActionPanel chamado={chamado} onUpdate={handleChamadoUpdate} />
        </div>
      </div>
    </div>
  );
}