import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns-tz';
import { FiTrash2, FiEye } from 'react-icons/fi';
import './styles.css';

const ChamadoItem = ({ chamado, onDelete }) => {
  const dataAberturaFormatada = format(
    new Date(chamado.created_at), 
    'dd/MM/yyyy', 
    { timeZone: 'America/Sao_Paulo' }
  );

  return (
    <div className="chamado-item-component">
      <div className="chamado-info col-title">
        <span className="chamado-id">#{chamado.id}</span>
        <div className="chamado-title-creator">
          <Link to={`/chamado/${chamado.id}`} className="chamado-title-link">{chamado.title}</Link>
          <span className="chamado-creator">Criado por: {chamado.creator_name || 'Sistema'}</span>
        </div>
      </div>
      <div className="chamado-status col-status">
        <span className={`status-badge status-${chamado.status.toLowerCase().replace(' ', '-')}`}>{chamado.status}</span>
      </div>
      <div className="chamado-date col-date">{dataAberturaFormatada}</div>
      <div className="chamado-actions col-actions">
        <Link to={`/chamado/${chamado.id}`} className="action-btn view-btn" title="Ver Detalhes">
          <FiEye size={18} />
        </Link>
        <button onClick={() => onDelete(chamado.id)} className="action-btn delete-btn" title="Apagar Chamado">
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChamadoItem;