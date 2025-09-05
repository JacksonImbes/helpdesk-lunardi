import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { FiPlusCircle, FiFileText, FiAlertCircle, FiClock, FiCheckCircle, FiUser, FiList } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ChamadoItem from '../../components/ChamadoItem';
import ChamadosPorStatusChart from '../../components/ChamadosPorStatusChart';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './styles.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [chamados, setChamados] = useState([]);
  const [stats, setStats] = useState(null);
  const [personalTickets, setPersonalTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newChamadoTitle, setNewChamadoTitle] = useState('');
  const [newChamadoDescription, setNewChamadoDescription] = useState('');
  const [newChamadoPriority, setNewChamadoPriority] = useState('Baixa');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [chamadosResponse, statsResponse, personalResponse] = await Promise.all([
        api.get('/chamados'),
        api.get('/chamados/stats'),
        api.get('/chamados/personal')
      ]);
      setChamados(chamadosResponse.data);
      setStats(statsResponse.data);
      setPersonalTickets(personalResponse.data);
    } catch (err) { 
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard."); 
    } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleCreateChamado = async (e) => {
    e.preventDefault();
    const data = { title: newChamadoTitle, description: newChamadoDescription, priority: newChamadoPriority };
    try {
      await api.post('/chamados', data);
      handleCloseModal();
      fetchData();
      setNewChamadoTitle(''); setNewChamadoDescription(''); setNewChamadoPriority('Baixa');
    } catch (err) { alert('Erro ao criar chamado.'); }
  };

  const handleDeleteChamado = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este chamado?')) {
      try {
        await api.delete(`/chamados/${id}`);
        fetchData();
      } catch (err) { alert('Erro ao apagar chamado.'); }
    }
  };

  if (loading || !stats) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}><Spinner animation="border" /></div>;
  }

  return (
    <div className="dashboard-container">
      {error && <Alert variant="danger">{error}</Alert>}
      {user && ( <div className="welcome-header"> <FiUser size={28} /> <h2>Seja bem-vindo, {user.name.split(' ')[0].toUpperCase()}!</h2> </div> )}
      
      <div className="stats-grid">
        <StatCard icon={<FiFileText size={22} />} title="Total de Chamados" value={stats.total} color="#1890ff" />
        <StatCard icon={<FiAlertCircle size={22} />} title="Abertos" value={stats.abertos} color="#f5222d" />
        <StatCard icon={<FiClock size={22} />} title="Em Andamento / Pendente" value={stats.emAndamento + stats.pendentes} color="#faad14" />
        <StatCard icon={<FiCheckCircle size={22} />} title="Resolvidos / Fechados" value={stats.resolvidos} color="#52c41a" />
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-charts">
          <Card className="shadow-sm">
            <Card.Body>
              {stats.total > 0 ? (<ChamadosPorStatusChart stats={stats} />) : <div className="text-center p-3">Não há dados para exibir no gráfico.</div>}
            </Card.Body>
          </Card>
        </div>

        <div className="priorities-panel">
          <Card className="shadow-sm h-100">
            <Card.Header>
              <FiList className="me-2" /> Minha Fila de Prioridades
            </Card.Header>
            <Card.Body className="p-0">
              <ul className="priorities-list">
                {personalTickets.length > 0 ? (
                  personalTickets.map(ticket => (
                    <li key={ticket.id} className="priority-item">
                      <span className={`priority-indicator ${ticket.priority.toLowerCase()}`}></span>
                      <div className="priority-item-details">
                        <Link to={`/chamados/${ticket.id}`} className="priority-item-title">#{ticket.id} - {ticket.title}</Link>
                        <span className="priority-item-creator">Aberto por: {ticket.creator_name}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted">A sua fila está vazia. Bom trabalho!</div>
                )}
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Todos os Chamados</h5>
          <Button variant="primary" onClick={() => setShowModal(true)} style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>
            <FiPlusCircle className="me-2" /> Novo Chamado
          </Button>
        </Card.Header>
        
        <div className="chamado-list-container">
          {chamados.length > 0 ? (
            <>
              <div className="chamado-list-header chamado-list-row">
                <div className="col-title">Título</div>
                <div className="col-status">Status</div>
                <div className="col-date">Data</div>
                <div className="col-actions">Ações</div>
              </div>
              
              <div className="chamado-list-body">
                {chamados.map(chamado => (
                  <ChamadoItem key={chamado.id} chamado={chamado} onDelete={() => {}} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center p-5"><h4>Nenhum chamado encontrado.</h4></div>
          )}
        </div>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton><Modal.Title>Abrir Novo Chamado</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreateChamado}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Título</Form.Label><Form.Control type="text" value={newChamadoTitle} onChange={e => setNewChamadoTitle(e.target.value)} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Prioridade</Form.Label><Form.Select value={newChamadoPriority} onChange={e => setNewChamadoPriority(e.target.value)}><option value="Baixa">Baixa</option><option value="Média">Média</option><option value="Alta">Alta</option><option value="Crítica">Crítica</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={4} value={newChamadoDescription} onChange={e => setNewChamadoDescription(e.target.value)} required /></Form.Group>
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