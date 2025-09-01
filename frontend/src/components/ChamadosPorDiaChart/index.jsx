import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registro dos componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChamadosPorDiaChart = ({ chartData }) => {
  // Opções de configuração do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chamados Criados nos Últimos 7 Dias',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1 // Força o eixo Y a ter apenas números inteiros
        }
      }
    }
  };

  // Preparamos os dados para o formato que o Chart.js espera
  const data = {
    labels: chartData.map(d => new Date(d.dia).toLocaleDateString('pt-BR', {timeZone: 'UTC'})), // Dias
    datasets: [
      {
        label: 'Novos Chamados',
        data: chartData.map(d => d.total), // Quantidade
        backgroundColor: 'rgba(211, 62, 51, 0.7)', // Cor da sua marca com transparência
        borderColor: 'rgba(211, 62, 51, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ height: '400px' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default ChamadosPorDiaChart;