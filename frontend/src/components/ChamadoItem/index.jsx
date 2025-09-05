import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiTrash2, FiEye } from 'react-icons/fi';

const ChamadoItem = ({ chamado, onDelete }) => {
  const navigate = useNavigate();

  if (!chamado || !chamado.id) {
    return null;
  }

  const dataAbertura = chamado.created_at 
    ? format(new Date(chamado.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    : 'Data inválida';

  const handleRowClick = () => navigate(`/chamados/${chamado.id}`);
  const handleDeleteClick = (e) => { e.stopPropagation(); onDelete(chamado.id); };
  const handleViewClick = (e) => { e.stopPropagation(); navigate(`/chamados/${chamado.id}`); };

  return (
    <div className="chamado-item chamado-list-row" onClick={handleRowClick}>
      <div className="col-title">
        <span className="chamado-id">#{chamado.id}</span>
        <div className="chamado-title-creator">
          <span className="chamado-title-link">{chamado.title}</span>
          <span className="chamado-creator">Criado por: {chamado.creator_name || 'Autor Desconhecido'}</span>
        </div>
      </div>
      <div className="col-status">
        <span className={`status-badge status-${chamado.status?.toLowerCase().replace(/\s+/g, '-')}`}>{chamado.status}</span>
      </div>
      <div className="col-date">{dataAbertura}</div>
      <div className="col-actions">
        <button onClick={handleViewClick} className="action-btn view-btn" title="Ver Detalhes"><FiEye size={18} /></button>
        <button onClick={handleDeleteClick} className="action-btn delete-btn" title="Apagar Chamado"><FiTrash2 size={18} /></button>
      </div>
    </div>
  );
};

export default ChamadoItem;