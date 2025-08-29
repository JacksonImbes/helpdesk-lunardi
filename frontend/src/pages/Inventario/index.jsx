import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { FiPlusCircle } from 'react-icons/fi';
import './styles.css';

export default function Inventario() {
  const { user: loggedUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // States para o Modal e o formulário
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Notebook', // Valor inicial
    serial_number: '',
    description: '',
    purchase_date: '',
    status: 'disponivel', // Valor inicial
  });

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await api.get('/inventory');
        setItems(response.data);
      } catch (error) {
        console.error("Erro ao buscar itens do inventário:", error);
        alert("Não foi possível carregar o inventário.");
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/inventory', formData);
      setItems([...items, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      alert("Falha ao criar o item. Verifique se o número de série já existe.");
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    data.setDate(data.getDate() + 1);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarStatus = (status) => {
    const statusMap = {
      'disponivel': 'Disponível',
      'em_uso': 'Em Uso',
      'em_manutencao': 'Em Manutenção',
      'descartado': 'Descartado'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <h4>A carregar inventário...</h4>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: 'var(--lunardi-dark)', fontWeight: '300' }}>
          Gestão de <span style={{ fontWeight: '700' }}>Inventário</span>
        </h1>
        {(loggedUser.role === 'admin' || loggedUser.role === 'technician') && (
          <Button onClick={handleShowModal} variant="primary" className="d-flex align-items-center shadow-sm" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>
            <FiPlusCircle size={20} style={{ marginRight: '8px' }} />
            Adicionar Novo Item
          </Button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <Table striped bordered hover responsive>

            <thead>
              <tr>
                <th>#ID</th>
                <th>Nome do Ativo</th>
                <th>Tipo</th>
                <th>Nº de Série</th>
                <th>Status</th>
                <th>Atribuído a</th>
                <th>Data da Compra</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.serial_number || '-'}</td>
                  <td>{formatarStatus(item.status)}</td>
                  <td>{item.assigned_user_name || 'Ninguém'}</td>
                  <td>{formatarData(item.purchase_date)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center">Nenhum item encontrado.</td>
                </tr>
              )}
            </tbody>
            {/* --- FIM DA CORREÇÃO --- */}
          </Table>
        </div>
      </div>

      {/* MODAL PARA ADICIONAR NOVO ITEM */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Novo Item ao Inventário</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateItem}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome do Ativo</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Notebook Dell Vostro 3500" required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="Notebook">Notebook</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Impressora">Impressora</option>
                    <option value="Software">Software</option>
                    <option value="Outro">Outro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Nº de Série</Form.Label>
                  <Form.Control type="text" name="serial_number" value={formData.serial_number} onChange={handleInputChange} placeholder="Opcional" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Data da Compra</Form.Label>
                  <Form.Control type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="disponivel">Disponível</option>
                    <option value="em_uso">Em Uso</option>
                    <option value="em_manutencao">Em Manutenção</option>
                    <option value="descartado">Descartado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} placeholder="Ex: Processador i5, 8GB RAM, SSD 256GB" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)' }}>Salvar Item</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}