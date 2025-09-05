import React from 'react';
import { Card } from 'react-bootstrap';
import './styles.css';

const StatCard = ({ icon, title, value, color }) => {
  return (
    <Card className="stat-card-component shadow-sm">
      <Card.Body>
        <div className="icon-container" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="info-container">
          <span className="title">{title}</span>
          <span className="value">{value}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
