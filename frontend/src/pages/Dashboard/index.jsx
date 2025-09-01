import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, FormControl, Modal, Form } from 'react-bootstrap';
import { FiInbox, FiFileText, FiCheckCircle, FiClock, FiPlusCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import StatCard from '../../components/StatCard';
import ChamadoItem from '../../components/ChamadoItem';
import './styles.css';

export default function Dashboard() {
  // --- Estados para dados do backend ---
  const [stats, setStats] = useState({ total: 0, abertos: 0, emAndamento: 0, pendentes: 0, resolvidos: 0 });
  const [chamados, setChamados] = useState([]);

  // --- Estados de controle da UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Estados para o Modal de Novo Chamado ---
  const [showModal, setShowModal] = useState(false);
  const [newChamadoTitle, setNewChamadoTitle] = useState('');
  const [newChamadoDescription, setNewChamadoDescription] = useState('');
  const [newChamadoPriority, setNewChamadoPriority] = useState('Baixa');

  // --- Funções de busca de dados ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResponse, chamadosResponse] = await Promise.all([
        api.get('/chamado/stats'),
        api.get('/chamado')
      ]);
      setStats(statsResponse.data);
      setChamados(chamadosResponse.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Funções de manipulação de eventos (handlers) ---
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleCreateChamado = async (e) => {
    e.preventDefault();
    const data = {
      title: newChamadoTitle,
      description: newChamadoDescription,
      priority: newChamadoPriority,
    };
    try {
      await api.post('/chamado', data);
      alert('Chamado criado com sucesso!');
      handleCloseModal();
      fetchData(); // Atualiza os dados do dashboard
      // Limpa os campos do formulário
      setNewChamadoTitle('');
      setNewChamadoDescription('');
      setNewChamadoPriority('Baixa');
    } catch (err) {
      alert('Erro ao criar chamado.');
      console.error(err);
    }
  };

  const handleDeleteChamado = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este chamado? Esta ação é irreversível.')) {
      try {
        await api.delete(`/chamado/${id}`);
        alert('Chamado apagado com sucesso.');
        fetchData(); // Atualiza a lista após apagar
      } catch (err) {
        alert('Erro ao apagar chamado. Apenas administradores podem apagar chamados.');
        console.error(err);
      }
    }
  }

  // Lógica para filtrar os chamados com base na busca
  const filteredChamados = useMemo(() =>
    chamados.filter(chamado =>
      chamado.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [chamados, searchTerm]);

  // --- Renderização ---
  if (loading) return <div className="loading-message">Carregando Dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      {/* SEÇÃO DE ESTATÍSTICAS */}
      <div className="stats-grid mb-4">
        <StatCard icon={<FiInbox size={24} />} title="Total de Chamados" value={stats.total} color="#1890ff" />
        <StatCard icon={<FiFileText size={24} />} title="Chamados Abertos" value={stats.abertos} color="var(--lunardi-red)" />
        <StatCard icon={<FiClock size={24} />} title="Em Atendimento / Pendentes" value={stats.emAndamento + stats.pendentes} color="#FAAD14" />
        <StatCard icon={<FiCheckCircle size={24} />} title="Chamados Resolvidos" value={stats.resolvidos} color="#38A169" />
      </div>

      {/* SEÇÃO DA LISTA DE CHAMADOS */}
      <div className="card shadow-sm">
        <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Chamados</h5>
          <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
            <FormControl
              placeholder="Buscar por título..."
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <Button variant="primary" onClick={handleShowModal} className="d-flex align-items-center flex-shrink-0" style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>
              <FiPlusCircle size={20} style={{ marginRight: '8px' }} />
              Novo Chamado
            </Button>
          </div>
        </div>

        <div className="list-container">
          {filteredChamados.length > 0 ? (
            <>
              <div className="list-header">
                <div className="header-item col-title">Título / Criado por</div>
                <div className="header-item col-status">Status</div>
                <div className="header-item col-date">Data de Abertura</div>
                <div className="header-item col-actions">Ações</div>
              </div>
              {filteredChamados.map(chamado => (
                <ChamadoItem
                  key={chamado.id}
                  chamado={chamado}
                  onDelete={handleDeleteChamado}
                />
              ))}
            </>
          ) : (
            <div className="text-center p-5">
              <h4>Nenhum chamado encontrado.</h4>
              <p className="text-muted">Tente ajustar sua busca ou crie um novo chamado.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE NOVO CHAMADO */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Abrir Novo Chamado</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateChamado}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" value={newChamadoTitle} onChange={e => setNewChamadoTitle(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prioridade</Form.Label>
              <Form.Select value={newChamadoPriority} onChange={e => setNewChamadoPriority(e.target.value)}>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={4} value={newChamadoDescription} onChange={e => setNewChamadoDescription(e.target.value)} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>Salvar Chamado</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}