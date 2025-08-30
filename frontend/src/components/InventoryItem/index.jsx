import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import './styles.css';

const formatStatusText = (status) => {
  if (!status) return '';
  const formatted = status.replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const InventoryItem = ({ item, canManage, onEdit, onDelete }) => {
  return (
    <div className="inventory-item-component">
      <div className="inventory-info">
        <span className="inventory-name">{item.name}</span>
        <span className="inventory-type">{item.type}</span>
      </div>
      <div className="inventory-serial">{item.serial_number || 'N/A'}</div>
      <div className="inventory-status">
        <span 
          className={`status-badge-inv status-${item.status.toLowerCase().replace(/[\s_]/g, '-')}`}
        >
          {formatStatusText(item.status)} 
        </span>
      </div>
      <div className="inventory-assigned">{item.assigned_user_name || 'Ninguém'}</div>
      <div className="inventory-actions">
        {canManage && (
          <>
            <button onClick={onEdit} className="action-btn edit-btn" title="Editar Item">
              <FiEdit size={18} />
            </button>
            <button onClick={onDelete} className="action-btn delete-btn" title="Apagar Item">
              <FiTrash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryItem;