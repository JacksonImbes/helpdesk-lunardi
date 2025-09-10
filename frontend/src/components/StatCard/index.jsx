import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import './styles.css';

function StatCard({ title, value, icon, color, loading }) {
  return (
    <Card className="stat-card-custom shadow-sm" style={{ borderLeft: `5px solid ${color || '#ddd'}` }}>
      <Card.Body>
        <div className="card-content">
          <div className="card-text">
            <p className="card-title">{title}</p>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <h2 className="card-value">{value !== null && value !== undefined ? value : '-'}</h2>
            )}
          </div>
          <div className="card-icon" style={{ color: color || '#ddd' }}>
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default StatCard;
