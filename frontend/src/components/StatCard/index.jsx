import React from 'react';
import './styles.css';

const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="stat-card-component card shadow-sm">
      <div className="card-body d-flex align-items-center">
        <div className="icon-container me-3" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="info-container">
          <span className="title">{title}</span>
          <span className="value">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;