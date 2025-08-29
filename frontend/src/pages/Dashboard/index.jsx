import { useState, useEffect } from 'react';
import api from '../../services/api';
import ChamadoItem from '../../components/ChamadoItem';
import StatCard from '../../components/StatCard';
import { FiPlusCircle, FiInbox, FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { signed } = useAuth();

  const [chamados, setChamados] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    abertos: 0,
    emAndamento: 0,
    pendentes: 0,
    resolvidos: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [newChamadoTitle, setNewChamadoTitle] = useState('');
  const [newChamadoDescription, setNewChamadoDescription] = useState('');
  const [newChamadoPriority, setNewChamadoPriority] = useState('baixa');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChamados, setFilteredChamados] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (signed) {
        const [chamadosResponse, statsResponse] = await Promise.all([
          api.get('/chamados'),
          api.get('/chamados/stats')
        ]);
        setChamados(chamadosResponse.data);
        setFilteredChamados(chamadosResponse.data);
        setStats(statsResponse.data);
      }
    }
    loadData();
  }, [signed]);

  useEffect(() => {
    const results = chamados.filter(chamado =>
      chamado.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChamados(results);
  }, [searchTerm, chamados]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewChamadoTitle('');
    setNewChamadoDescription('');
    setNewChamadoPriority('baixa'); // Reseta a prioridade ao fechar
  };

  async function handleCreateChamado(event) {
    event.preventDefault();
    const data = {
      title: newChamadoTitle,
      description: newChamadoDescription,
      priority: newChamadoPriority,
    };

    try {
      const response = await api.post('/chamados', data);
      const novoChamado = response.data;

      // --- LÓGICA DE ATUALIZAÇÃO EM TEMPO REAL ---
      // Adiciona o novo chamado à lista de chamados existente
      setChamados([...chamados, novoChamado]);

      // Atualiza os cartões de estatísticas de forma otimista
      setStats(prevStats => ({
        total: prevStats.total + 1,
        abertos: prevStats.abertos + 1,
        resolvidos: prevStats.resolvidos,
      }));

      handleCloseModal();
    } catch (err) {
      alert('Erro ao criar chamado, tente novamente.');
      console.error(err);
    }
  };

  async function handleDeleteChamado(id) {
    try {
      await api.delete(`/chamados/${id}`);
      const chamadoApagado = chamados.find(c => c.id === id);
      setChamados(chamados.filter(chamado => chamado.id !== id));
      setStats(prevStats => {
        const isAberto = chamadoApagado && chamadoApagado.status === 'aberto';
        return {
          total: prevStats.total - 1,
          abertos: isAberto ? prevStats.abertos - 1 : prevStats.abertos,
          resolvidos: isAberto ? prevStats.resolvidos : prevStats.resolvidos - 1,
        };
      });
    } catch (err) {
      alert('Erro ao apagar o chamado, tente novamente.');
    }
  }

  return (
    <>
      {/* SEÇÃO DE ESTATÍSTICAS */}
      <div className="row mb-4">
        {/* Card 1: Total de Chamados (Sem alteração) */}
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            icon={<FiInbox size={24} />}
            title="Total de Chamados"
            value={stats.total}
            color="#1890ff"
          />
        </div>

        {/* Card 2: Chamados Abertos (Sem alteração, mas o valor agora é mais preciso) */}
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            icon={<FiFileText size={24} />}
            title="Chamados Abertos"
            value={stats.abertos}
            color="var(--lunardi-red)"
          />
        </div>

        {/* Card 3: Em Atendimento / Pendentes (NOVO CARD!) */}
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            icon={<FiClock size={24} />} // Ícone de relógio, para indicar tempo/espera
            title="Em Atendimento / Pendentes"
            value={stats.emAndamento + stats.pendentes} // Somamos os dois valores
            color="#FAAD14" // Uma cor de alerta/atenção, como amarelo ou laranja
          />
        </div>

        {/* Card 4: Chamados Resolvidos (Sem alteração, mas o valor agora é mais preciso) */}
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            icon={<FiCheckCircle size={24} />}
            title="Chamados Resolvidos"
            value={stats.resolvidos}
            color="#38A169"
          />
        </div>
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

        {/* CORPO DA LISTA COM CABEÇALHO */}
        <div className="list-container">
          {filteredChamados.length > 0 ? (
            <>
              {/* CORREÇÃO: Alinhamento explícito no cabeçalho */}
              <div className="list-header">
                <div className="header-item" style={{ justifyContent: 'flex-start' }}>Título / Criado por</div>
                <div className="header-item" style={{ justifyContent: 'center' }}>Status</div>
                <div className="header-item" style={{ justifyContent: 'flex-start' }}>Data de Abertura</div>
                <div className="header-item" style={{ justifyContent: 'center' }}>Ações</div>
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

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Abrir Novo Chamado</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleCreateChamado}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                value={newChamadoTitle}
                onChange={e => setNewChamadoTitle(e.target.value)}
                required
              />
            </Form.Group>

            {/* --- NOVO CAMPO DE PRIORIDADE --- */}
            <Form.Group className="mb-3">
              <Form.Label>Prioridade</Form.Label>
              <Form.Select
                value={newChamadoPriority}
                onChange={e => setNewChamadoPriority(e.target.value)}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newChamadoDescription}
                onChange={e => setNewChamadoDescription(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>
              Salvar Chamado
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}