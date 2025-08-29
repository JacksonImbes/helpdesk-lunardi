// frontend/src/components/ActionPanel/index.js
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../../services/api';
import {FiUser, FiCalendar, FiHash, FiTag } from 'react-icons/fi';

// O componente recebe o objeto 'chamado' e uma função 'onUpdate' como props
export default function ActionPanel({ chamado, onUpdate }) {
  // Estados locais para controlar os valores dos dropdowns
  const [status, setStatus] = useState(chamado.status);
  const [priority, setPriority] = useState(chamado.priority);
  const [assignedToId, setAssignedToId] = useState(chamado.assigned_to_id || '');
  
  // Estado para armazenar a lista de técnicos que podemos atribuir
  const [technicians, setTechnicians] = useState([]);

  // useEffect para buscar a lista de técnicos e admins quando o componente carregar
  useEffect(() => {
    async function fetchTechnicians() {
      try {
        // Assumindo que a rota GET /users retorna todos os usuários.
        // O ideal seria ter uma rota específica /technicians que retorna apenas admins e técnicos.
        const response = await api.get('/users');
        // Filtramos para pegar apenas usuários que são 'admin' ou 'technician'
        const availableTechnicians = response.data.filter(
          user => user.role === 'admin' || user.role === 'technician'
        );
        setTechnicians(availableTechnicians);
      } catch (error) {
        console.error("Erro ao buscar técnicos:", error);
      }
    }
    fetchTechnicians();
  }, []); // O array vazio [] significa que isso roda apenas uma vez

  // Função chamada quando o formulário é submetido
  async function handleUpdate(e) {
    e.preventDefault();

    const data = {
      status,
      priority,
      // Se "Ninguém" for selecionado, enviamos null para o backend
      assigned_to_id: assignedToId === '' ? null : Number(assignedToId),
    };

    try {
      const response = await api.put(`/chamados/${chamado.id}`, data);
      alert('Chamado atualizado com sucesso!');
      // Chamamos a função onUpdate para que a página principal (ChamadoDetalhe)
      // atualize seu estado com os novos dados do chamado.
      onUpdate(response.data);
    } catch (error) {
      alert('Erro ao atualizar o chamado.');
      console.error("Erro no update:", error);
    }
  }

  return (
    <Form onSubmit={handleUpdate}>
      <div className="details-card">
        <h5>Detalhes</h5>
        <ul>
          <li><FiHash /> <strong>ID:</strong> {chamado.id}</li>
          <li><FiUser /> <strong>Atribuído a:</strong> {chamado.assigned_name || 'Ninguém'}</li>
          <li><FiTag /> <strong>Prioridade:</strong> <span className={`priority-badge priority-${chamado.priority}`}>{chamado.priority}</span></li>
          <li><FiCalendar /> <strong>Resolvido em:</strong> {chamado.closed_at ? new Date(chamado.closed_at.replace(' ', 'T')).toLocaleDateString('pt-BR') : 'Em aberto'}</li>
        </ul>
      </div>

      <div className="actions-card">
        <h5>Ações</h5>
        
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Control as="select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Aberto">Aberto</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Pendente">Pendente</option>
            <option value="Resolvido">Resolvido</option>
            <option value="Fechado">Fechado</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Prioridade</Form.Label>
          <Form.Control as="select" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Atribuir a</Form.Label>
          <Form.Control as="select" value={assignedToId} onChange={e => setAssignedToId(e.target.value)}>
            <option value="">Ninguém</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>
          Atualizar Chamado
        </Button>
      </div>
    </Form>
  );
}