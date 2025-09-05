import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FiHash, FiUser, FiTag, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';

export default function ActionPanel({ chamado, onUpdate }) {
  const [status, setStatus] = useState(chamado.status);
  const [priority, setPriority] = useState(chamado.priority);
  const [assignedToId, setAssignedToId] = useState(chamado.assigned_to_id || '');
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        const response = await api.get('/users');
        const availableTechnicians = response.data.filter(
          user => user.role === 'admin' || user.role === 'technician'
        );
        setTechnicians(availableTechnicians);
      } catch (error) {
        console.error("Erro ao buscar técnicos:", error);
      }
    }
    fetchTechnicians();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    const data = {
      status,
      priority,
      assigned_to_id: assignedToId === '' ? null : Number(assignedToId),
    };

    try {
      // CORREÇÃO: A rota da API deve ser no plural.
      const response = await api.put(`/chamados/${chamado.id}`, data);
      alert('Chamado atualizado com sucesso!');
      onUpdate(response.data);
    } catch (error) {
      alert('Erro ao atualizar o chamado.');
    }
  }

  return (
    <Form onSubmit={handleUpdate}>
      <div className="details-card mb-4">
        <h5>Detalhes</h5>
        <ul>
          <li><FiHash /> <strong>ID:</strong> {chamado.id}</li>
          <li><FiUser /> <strong>Atribuído a:</strong> {chamado.assigned_name || 'Ninguém'}</li>
          <li><FiTag /> <strong>Prioridade:</strong> <span className={`priority-badge priority-${chamado.priority?.toLowerCase()}`}>{chamado.priority}</span></li>
          <li>
            <FiCalendar /> <strong>Resolvido em:</strong> 
            {chamado.closed_at 
              ? format(new Date(chamado.closed_at), 'dd/MM/yyyy') 
              : 'Em aberto'
            }
          </li>
        </ul>
      </div>

      <div className="actions-card">
        <h5>Ações</h5>
        <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select value={status} onChange={e => setStatus(e.target.value)}><option value="Aberto">Aberto</option><option value="Em Andamento">Em Andamento</option><option value="Pendente">Pendente</option><option value="Resolvido">Resolvido</option><option value="Fechado">Fechado</option></Form.Select></Form.Group>
        <Form.Group className="mb-3"><Form.Label>Prioridade</Form.Label><Form.Select value={priority} onChange={e => setPriority(e.target.value)}><option value="Baixa">Baixa</option><option value="Média">Média</option><option value="Alta">Alta</option><option value="Crítica">Crítica</option></Form.Select></Form.Group>
        <Form.Group className="mb-3"><Form.Label>Atribuir a</Form.Label><Form.Select value={assignedToId} onChange={e => setAssignedToId(e.target.value)}><option value="">Ninguém</option>{technicians.map(tech => (<option key={tech.id} value={tech.id}>{tech.name}</option>))}</Form.Select></Form.Group>
        <Button variant="primary" type="submit" className="w-100" style={{backgroundColor: 'var(--lunardi-red)', borderColor: 'var(--lunardi-red)'}}>Atualizar Chamado</Button>
      </div>
    </Form>
  );
}