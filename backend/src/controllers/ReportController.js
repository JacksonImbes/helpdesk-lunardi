const connection = require('../database/connection');
const { subDays, format } = require('date-fns');

module.exports = {
  async chamadosPorDia(request, response) {
    const { role, id: userId } = request.user;

    try {
      // Pega a data de 7 dias atrás no formato do banco de dados
      const seteDiasAtras = format(subDays(new Date(), 7), 'yyyy-MM-dd');

      const query = connection('chamados')
        // Selecionamos a data de criação, truncada para o dia, e contamos quantos registros tem naquele dia
        .select(connection.raw("DATE(created_at) as dia"))
        .count('id as total')
        .where('created_at', '>=', seteDiasAtras)
        .groupBy('dia')
        .orderBy('dia', 'asc');

      // Se for um usuário comum, filtramos a contagem apenas para os chamados dele
      if (role === 'user') {
        query.andWhere({ user_id: userId });
      }

      const dados = await query;
      
      // O resultado será um array de objetos, ex: [{ dia: '2025-08-30', total: 3 }, { dia: '2025-09-01', total: 5 }]
      return response.json(dados);

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Erro ao gerar relatório de chamados por dia.' });
    }
  }
};