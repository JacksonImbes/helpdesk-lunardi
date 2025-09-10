import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import { subDays, format } from 'date-fns';
import api from '../../services/api';

import "react-datepicker/dist/react-datepicker.css";
import './styles.css';

const ChamadosPorDiaChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/dashboard/reports/chamados-por-dia', {
          params: { startDate: formattedStartDate, endDate: formattedEndDate },
        });
        setData(response.data);
      } catch (err) {
        setError('Erro ao carregar dados do gráfico.');
        console.error("Erro ao buscar dados do gráfico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="chart-header">
          <Card.Title as="h2">Chamados Criados por Dia</Card.Title>
          <div className="date-picker-wrapper">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              className="form-control form-control-sm"
            />
            <span className="date-separator">até</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              className="form-control form-control-sm"
            />
          </div>
        </div>
        
        {loading && <p className="text-center p-5">Carregando gráfico...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Novos Chamados" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="empty-state">
            <p>Nenhum chamado encontrado no período selecionado.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChamadosPorDiaChart;
