import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ChamadosPorStatusChart = ({ stats }) => {
  const data = {
    labels: ['Abertos', 'Em Andamento', 'Concluídos'],
    datasets: [
      {
        label: '# de Chamados',
        data: [
          stats.abertos,
          stats.emAndamento + stats.pendentes, 
          stats.resolvidos,
        ],
        backgroundColor: [
          'rgba(245, 34, 45, 0.7)',  
          '#faad149a', 
          'rgba(82, 196, 26, 0.7)',  
        ],
        borderColor: [
          'rgba(245, 34, 45, 1)',
          '#faad14',
          'rgba(82, 196, 26, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribuição de Chamados por Status',
        font: { size: 18 }
      },
    },
  };

  return (
    <div style={{ height: '350px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ChamadosPorStatusChart;
