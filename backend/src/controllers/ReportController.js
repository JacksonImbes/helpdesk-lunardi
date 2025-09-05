import connection from '../database/connection.js';

export default {
  /**
   * Gera um relatório de contagem de chamados por dia.
   */
  async chamadosPorDia(request, response) {
    try {
      // Agrupa chamados por dia e conta quantos foram criados em cada dia.
      const data = await connection('chamados')
        .select(connection.raw("DATE(created_at) as day, COUNT(*)::integer as count"))
        .groupBy('day')
        .orderBy('day', 'asc');

      // Formata a data para o frontend (ex: '2025-09-03')
      const formattedData = data.map(row => ({
        ...row,
        day: new Date(row.day).toISOString().split('T')[0]
      }));

      return response.json(formattedData);
    } catch (err) {
      console.error('Erro ao gerar relatório de chamados por dia:', err);
      return response.status(500).json({ error: 'Falha ao gerar o relatório.' });
    }
  },
};