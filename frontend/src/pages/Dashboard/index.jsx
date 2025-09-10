import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { FiPlusCircle, FiAlertOctagon, FiTool, FiClock, FiCheckCircle, FiUser, FiList } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ChamadoItem from '../../components/ChamadoItem';
import ChamadosPorDiaChart from '../../components/ChamadosPorStatusChart'; // Nosso novo gráfico
import StatCard from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './styles.css';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Estados para os dados
  const [chamados, setChamados] = useState([]);
  const [kpis, setKpis] = useState(null); // Usaremos 'kpis' em vez de 'stats'
  const [personalTickets, setPersonalTickets] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [newChamadoTitle, setNewChamadoTitle] = useState('');
  const [newChamadoDescription, setNewChamadoDescription] = useState('');
  const [newChamadoPriority, setNewChamadoPriority] = useState('Baixa');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // --- OTIMIZAÇÃO ---
      // Buscando dados dos endpoints novos e antigos em paralelo.
      // Substituímos '/chamados/stats' por '/dashboard/kpis'
      const [chamadosResponse, kpisResponse, personalResponse] = await Promise.all([
        api.get('/chamados'),
        api.get('/dashboard/kpis'),
        api.get('/chamados/personal')
      ]);
      setChamados(chamadosResponse.data);
      setKpis(kpisResponse.data);
      setPersonalTickets(personalResponse.data);
    } catch (err) { 
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard."); 
    } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Funções do Modal (mantidas do seu código original)
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewChamadoTitle('');
    setNewChamadoDescription('');
    setNewChamadoPriority('Baixa');
  };

  const handleCreateChamado = async (e) => {
    e.preventDefault();
    const data = { title: newChamadoTitle, description: newChamadoDescription, priority: newChamadoPriority };
    try {
      await api.post('/chamados', data);
      handleCloseModal();
      fetchData(); // Atualiza todos os dados do dashboard
    } catch (err) { 
      // Idealmente, mostrar um erro mais amigável (Toast/Snackbar)
      alert('Erro ao criar chamado.'); 
    }
  };
  
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}><Spinner animation="border" /></div>;
  }

  return (
    <div className="dashboard-container">
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Mantido: Mensagem de Boas-vindas */}
      {user && ( <div className="welcome-header"> <FiUser size={28} /> <h2>Seja bem-vindo, {user.name.split(' ')[0]}!</h2> </div> )}
      
      <div className="stats-grid">
        {/* Usando o novo endpoint 'kpis' com o componente StatCard melhorado */}
        <StatCard icon={<FiAlertOctagon size={22} />} title="Abertos" value={kpis?.aberto} color="#E91E63" />
        <StatCard icon={<FiTool size={22} />} title="Em Atendimento" value={kpis?.atendimento} color="#FF9800" />
        <StatCard icon={<FiClock size={22} />} title="Pendentes" value={kpis?.pendente} color="#2196F3" />
        <StatCard icon={<FiCheckCircle size={22} />} title="Resolvidos" value={kpis?.resolvido} color="#4CAF50" />
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-charts">
          {/* Substituído pelo novo gráfico com seletor de datas */}
          <ChamadosPorDiaChart />
        </div>

        {/* Mantido: Fila de Prioridades */}
        <div className="priorities-panel">
          <Card className="shadow-sm h-100">
            <Card.Header> <FiList className="me-2" /> Minha Fila de Prioridades </Card.Header>
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
      
      {/* Mantido: Lista de Todos os Chamados */}
      <Card className="shadow-sm mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Todos os Chamados</h5>
          <Button variant="primary" onClick={handleShowModal} style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>
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
      
      {/* Mantido: Modal de Novo Chamado */}
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
