import React from 'react';
import { FiClock, FiUser, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './styles.css';

export default function ChamadoItem({ chamado, onDelete }) {

  const formatarData = (dataString) => {
    if (!dataString) return 'Data inválida';
    const data = new Date(dataString.replace(' ', 'T'));
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'aberto': return 'status-aberto';
      case 'resolvido': return 'status-resolvido';
      case 'pendente': return 'status-pendente';
      default: return 'status-default';
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Impede que o clique no botão propague para o Link
    e.preventDefault();  // Previne a navegação ao apagar
    if (window.confirm(`Tem a certeza de que deseja apagar o chamado #${chamado.id}?`)) {
      onDelete(chamado.id);
    }
  };

  return (
    <Link to={`/chamado/${chamado.id}`} className="chamado-item-link">
      <div className="chamado-item">
        <div className="chamado-info">
          <span className="chamado-id">#{chamado.id}</span>
          <div>
            <h6 className="chamado-title">{chamado.title}</h6>
            <span className="chamado-creator">
              <FiUser size={12} />
              {chamado.creator_name || 'Sistema'}
            </span>
          </div>
        </div>
        <div className="chamado-status">
          <span className={`status-badge ${getStatusClass(chamado.status)}`}>
            {chamado.status}
          </span>
        </div>
        <div className="chamado-data">
          <FiClock size={14} />
          <span>{formatarData(chamado.created_at)}</span>
        </div>
        <div className="chamado-actions">
          <Button variant="outline-danger" size="sm" onClick={handleDelete}>
            <FiTrash2 />
          </Button>
        </div>
      </div>
    </Link>
  );
}