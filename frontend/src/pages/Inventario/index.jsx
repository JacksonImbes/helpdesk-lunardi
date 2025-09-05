import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FiPlusCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

import InventoryItem from '../../components/InventoryItem';
import './styles.css';

export default function Inventario() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (err) {
      console.error("Erro ao buscar inventário:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShowCreateModal = () => {
    setIsEditing(false);
    setCurrentItem({ name: '', type: '', serial_number: '', description: '', purchase_date: '', status: 'Disponível' });
    setShowModal(true);
  };

  const handleShowEditModal = (item) => {
    setIsEditing(true);
    const purchaseDateFormatted = item.purchase_date ? item.purchase_date.split('T')[0] : '';
    setCurrentItem({ ...item, purchase_date: purchaseDateFormatted });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'put' : 'post';
    const url = isEditing ? `/inventory/${currentItem.id}` : '/inventory';

    try {
      await api[method](url, currentItem);
      alert(`Item ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} item.`);
      console.error(err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este item?')) {
        try {
            await api.delete(`/inventory/${id}`);
            alert('Item apagado com sucesso.');
            fetchData();
        } catch (err) {
            alert('Erro ao apagar item.');
            console.error(err);
        }
    }
  }

  const canManageInventory = user && (user.role === 'admin' || user.role === 'technician');

  if (loading) return <div className="loading-message">Carregando Inventário...</div>;
  return (
    <div className="inventory-container">
      <div className="card shadow-sm">
        <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Itens de Inventário</h5>
          {/* O botão de "Novo Item" só aparece para admins e técnicos */}
          {canManageInventory && (
            <Button variant="primary" onClick={handleShowCreateModal} className="d-flex align-items-center" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>
                <FiPlusCircle size={20} style={{ marginRight: '8px' }} />
                Novo Item
            </Button>
          )}
        </div>

        <div className="list-container">
          {inventory.length > 0 ? (
            <>
              <div className="list-header">
                <div className="header-item">Nome / Tipo</div>
                <div className="header-item">Nº de Série</div>
                <div className="header-item">Status</div>
                <div className="header-item">Atribuído a</div>
                <div className="header-item">Ações</div>
              </div>
              {inventory.map(item => (
                <InventoryItem 
                  key={item.id} 
                  item={item} 
                  canManage={canManageInventory}
                  onEdit={() => handleShowEditModal(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </>
          ) : (
            <div className="text-center p-5"><h4>Nenhum item de inventário encontrado.</h4></div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Item' : 'Adicionar Novo Item'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
              <Form.Group className="mb-3"><Form.Label>Nome do Ativo</Form.Label><Form.Control type="text" name="name" value={currentItem?.name} onChange={handleInputChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Tipo</Form.Label><Form.Control type="text" name="type" value={currentItem?.type} onChange={handleInputChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Número de Série</Form.Label><Form.Control type="text" name="serial_number" value={currentItem?.serial_number} onChange={handleInputChange} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Data de Compra</Form.Label><Form.Control type="date" name="purchase_date" value={currentItem?.purchase_date} onChange={handleInputChange} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select name="status" value={currentItem?.status} onChange={handleInputChange}><option value="Disponível">Disponível</option><option value="Em uso">Em uso</option><option value="Em manutenção">Em manutenção</option><option value="Descartado">Descartado</option></Form.Select></Form.Group>
              <Form.Group><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={3} name="description" value={currentItem?.description} onChange={handleInputChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="primary" type="submit" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}