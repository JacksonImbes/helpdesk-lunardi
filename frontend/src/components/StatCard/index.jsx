import React from 'react';
import './styles.css';

export default function StatCard({ icon, title, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
      </div>
    </div>
  );
}