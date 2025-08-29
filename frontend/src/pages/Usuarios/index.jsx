import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { FiUserPlus, FiTrash2, FiEdit } from 'react-icons/fi';

export default function Usuarios() {
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '', email: '', password: '', role: 'user',
    cpf: '', phone: '', admission_date: '', position: '', department: '', status: 'ativo'
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);
  async function loadUsers() {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar utilizadores:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- Funções de Controlo dos Modais ---
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({ name: '', email: '', password: '', role: 'user', cpf: '', phone: '', admission_date: '', position: '', department: '', status: 'ativo' });
  };

  const handleShowEditModal = (user) => {
    setEditingUser({
      ...user,
      admission_date: user.admission_date ? user.admission_date.split('T')[0] : ''
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  // --- Funções de CRUD ---
  const handleCreateInputChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users', createFormData);
      setUsers([...users, response.data]);
      handleCloseCreateModal();
    } catch (error) {
      alert(error.response?.data?.error || "Falha ao criar o utilizador.");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/users/${editingUser.id}`, editingUser);
      setUsers(users.map(user => user.id === editingUser.id ? response.data : user));
      handleCloseEditModal();
    } catch (error)
    {
      alert(error.response?.data?.error || "Falha ao atualizar o utilizador.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem a certeza de que deseja apagar este utilizador?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        alert(error.response?.data?.error || "Falha ao apagar o utilizador.");
      }
    }
  };

  const formatarRole = (role) => {
    const roleMap = { 'admin': 'Administrador', 'technician': 'Técnico', 'user': 'Utilizador' };
    return roleMap[role] || role;
  };

  const formatarStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loggedUser.role !== 'admin') {
    return (
      <div>
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para ver esta página.</p>
      </div>
    );
  }

  if (loading) return <h4>A carregar utilizadores...</h4>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestão de Utilizadores</h1>
        {/* O botão de adicionar só aparece para administradores (redundância) */}
        {loggedUser.role === 'admin' && (
          <Button onClick={handleShowCreateModal} variant="primary" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>
            <FiUserPlus size={20} style={{ marginRight: '8px' }} />
            Adicionar Novo Utilizador
          </Button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Status</th>
                {/* A coluna de ações só aparece para administradores */}
                {loggedUser.role === 'admin' && <th className="text-center">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{formatarRole(user.role)}</td>
                  <td>{user.status}</td>
                  {/* Os botões de ação só aparecem para administradores */}
                  {loggedUser.role === 'admin' && (
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(user)}>
                        <FiEdit />
                      </Button>
                      {loggedUser.id !== user.id && (
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <FiTrash2 />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO ATUALIZADO */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Novo Utilizador / Funcionário</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUser}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}><Form.Group><Form.Label>Nome Completo*</Form.Label><Form.Control name="name" value={createFormData.name} onChange={handleCreateInputChange} required /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>CPF</Form.Label><Form.Control name="cpf" value={createFormData.cpf} onChange={handleCreateInputChange} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Telefone</Form.Label><Form.Control name="phone" value={createFormData.phone} onChange={handleCreateInputChange} /></Form.Group></Col>
            </Row>
            <Row className="mb-3">
              <Col md={3}><Form.Group><Form.Label>Data de Admissão</Form.Label><Form.Control type="date" name="admission_date" value={createFormData.admission_date} onChange={handleCreateInputChange} /></Form.Group></Col>
              <Col md={5}><Form.Group><Form.Label>Cargo</Form.Label><Form.Control name="position" value={createFormData.position} onChange={handleCreateInputChange} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Setor</Form.Label><Form.Control name="department" value={createFormData.department} onChange={handleCreateInputChange} /></Form.Group></Col>
            </Row>
            <hr />
            <h5 className="mb-3">Credenciais de Acesso</h5>
            <Row>
              <Col md={6}><Form.Group><Form.Label>E-mail*</Form.Label><Form.Control type="email" name="email" value={createFormData.email} onChange={handleCreateInputChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Senha*</Form.Label><Form.Control type="password" name="password" value={createFormData.password} onChange={handleCreateInputChange} required /></Form.Group></Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}><Form.Group><Form.Label>Função no Sistema*</Form.Label><Form.Select name="role" value={createFormData.role} onChange={handleCreateInputChange}><option value="user">Utilizador</option><option value="technician">Técnico</option><option value="admin">Administrador</option></Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Situação*</Form.Label><Form.Select name="status" value={createFormData.status} onChange={handleCreateInputChange}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></Form.Select></Form.Group></Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCreateModal}>Cancelar</Button>
            <Button variant="primary" type="submit" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>Salvar Utilizador</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DE EDIÇÃO ATUALIZADO */}
      {editingUser && (
        <Modal show={showEditModal} onHide={handleCloseEditModal} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Utilizador: {editingUser.name}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateUser}>
            <Modal.Body>
              <Row className="mb-3">
                <Col md={6}><Form.Group><Form.Label>Nome Completo*</Form.Label><Form.Control name="name" value={editingUser.name || ''} onChange={handleEditInputChange} required /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>CPF</Form.Label><Form.Control name="cpf" value={editingUser.cpf || ''} onChange={handleEditInputChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Telefone</Form.Label><Form.Control name="phone" value={editingUser.phone || ''} onChange={handleEditInputChange} /></Form.Group></Col>
              </Row>
              <Row className="mb-3">
                <Col md={3}><Form.Group><Form.Label>Data de Admissão</Form.Label><Form.Control type="date" name="admission_date" value={editingUser.admission_date || ''} onChange={handleEditInputChange} /></Form.Group></Col>
                <Col md={5}><Form.Group><Form.Label>Cargo</Form.Label><Form.Control name="position" value={editingUser.position || ''} onChange={handleEditInputChange} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Setor</Form.Label><Form.Control name="department" value={editingUser.department || ''} onChange={handleEditInputChange} /></Form.Group></Col>
              </Row>
              <hr />
              <h5 className="mb-3">Credenciais de Acesso</h5>
              <Row>
                <Col md={6}><Form.Group><Form.Label>E-mail*</Form.Label><Form.Control type="email" name="email" value={editingUser.email || ''} onChange={handleEditInputChange} required /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Função no Sistema*</Form.Label><Form.Select name="role" value={editingUser.role || 'user'} onChange={handleEditInputChange}><option value="user">Utilizador</option><option value="technician">Técnico</option><option value="admin">Administrador</option></Form.Select></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Situação*</Form.Label><Form.Select name="status" value={editingUser.status || 'ativo'} onChange={handleEditInputChange}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></Form.Select></Form.Group></Col>
              </Row>
              <small className="d-block mt-3 text-muted">A alteração de senha deve ser feita através de um fluxo de "Esqueci a minha senha".</small>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEditModal}>Cancelar</Button>
              <Button variant="primary" type="submit" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>Salvar Alterações</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </>
  );
}