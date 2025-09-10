const connection = require('../database/connection');
const AppError = require('../errors/AppError');

module.exports = {
  /**
   * Retorna a contagem de chamados criados por dia dentro de um intervalo de datas.
   * Espera startDate e endDate como query params (ex: ?startDate=2025-08-01&endDate=2025-08-31)
   */
  async chamadosPorDia(request, response) {
    const { startDate, endDate } = request.query;

    if (!startDate || !endDate) {
      throw new AppError('As datas de início e fim são obrigatórias.', 400);
    }
    
    // --- CORREÇÃO ---
    // Criamos objetos Date e definimos a hora para o início e fim do dia.
    // Usamos UTC para evitar problemas com fuso horário.
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    // Agora passamos os objetos Date diretamente para o Knex.
    const dailyCounts = await connection('chamados')
      .select(connection.raw("DATE(created_at) as date")) // Extrai apenas a data
      .count('* as count')
      .whereBetween('created_at', [start, end])
      .groupByRaw('DATE(created_at)') // Agrupa pelo dia
      .orderBy('date', 'asc');

    // Formata a data para o padrão YYYY-MM-DD para consistência
    const formattedData = dailyCounts.map(item => ({
      date: new Date(item.date).toISOString().split('T')[0],
      count: Number(item.count)
    }));

    return response.json(formattedData);
  },
};