const connection = require('../database/connection');
const AppError = require('../errors/AppError');

module.exports = {
  async personal(request, response) {
    const { id: userId } = request.user;

    // O try/catch foi removido, pois nosso errorHandler global cuidará de erros inesperados.
    const chamados = await connection('chamados')
      .where('assigned_to_id', userId)
      .whereNotIn('chamados.status', ['Resolvido', 'Fechado'])
      .join('users', 'chamados.user_id', '=', 'users.id')
      .select('chamados.id', 'chamados.title', 'chamados.priority', 'users.name as creator_name')
      .orderByRaw(`
        CASE priority
          WHEN 'Crítica' THEN 1
          WHEN 'Alta' THEN 2
          WHEN 'Média' THEN 3
          WHEN 'Baixa' THEN 4
          ELSE 5
        END
      `)
      .orderBy('chamados.created_at', 'asc');
    
    return response.json(chamados);
  },
  
  async index(request, response) {
    const { role, id: userId } = request.user;
    
    const query = connection('chamados')
      .join('users', 'chamados.user_id', '=', 'users.id')
      .select('chamados.*', 'users.name as creator_name')
      .orderBy('chamados.created_at', 'desc');

    // Mantida a sua lógica de permissão
    if (role !== 'admin' && role !== 'tech') { // Assumindo que 'technician' no seu código original era 'tech'
      query.where('chamados.user_id', userId);
    }
    
    const chamados = await query;

    // Mantida a sua formatação de data
    const chamadosFormatados = chamados.map(chamado => ({
      ...chamado,
      created_at: new Date(chamado.created_at).toISOString(),
      closed_at: chamado.closed_at ? new Date(chamado.closed_at).toISOString() : null,
    }));
  
    return response.json(chamadosFormatados);
  },

  async show(request, response) {
    const { id: chamadoId } = request.params;
    const { id: userId, role } = request.user;
    
    if (isNaN(parseInt(chamadoId, 10))) {
      throw new AppError('O ID do chamado fornecido é inválido.', 400);
    }

    const chamado = await connection('chamados')
      .where('chamados.id', chamadoId)
      .leftJoin('users as creator', 'creator.id', '=', 'chamados.user_id')
      .leftJoin('users as assignee', 'assignee.id', '=', 'chamados.assigned_to_id')
      .select(
        'chamados.*', 
        'creator.name as creator_name', 
        'assignee.name as assigned_name'
      )
      .first();

    if (!chamado) {
      throw new AppError('Chamado não encontrado.', 404);
    }

    if (role === 'user' && chamado.user_id !== userId) {
      throw new AppError('Acesso negado.', 403);
    }

    const comments = await connection('comments')
      .where('chamado_id', chamadoId)
      .join('users', 'users.id', '=', 'comments.user_id')
      .select('comments.*', 'users.name as author_name')
      .orderBy('created_at', 'asc');
    
    chamado.created_at = new Date(chamado.created_at).toISOString();
    if(chamado.closed_at) {
      chamado.closed_at = new Date(chamado.closed_at).toISOString();
    }
    const formattedComments = comments.map(c => ({
        ...c,
        created_at: new Date(c.created_at).toISOString()
    }));

    return response.json({ chamado, comments: formattedComments });
  },

  async create(request, response) {
    const { title, description, priority } = request.body;
    const user_id = request.user.id;

    const [chamadoCriado] = await connection('chamados')
      .insert({
        title,
        description,
        priority,
        status: 'Aberto', // Padronizado com os status do método kpis
        user_id,
      })
      .returning(['id']);

    return response.status(201).json({ id: chamadoCriado.id });
  },

  async update(request, response) {
    const { id: chamadoId } = request.params;
    const { id: userId, role } = request.user;
    const { status, priority, assigned_to_id } = request.body;

    const chamado = await connection('chamados').where('id', chamadoId).first();

    if (!chamado) {
      throw new AppError('Chamado não encontrado.', 404);
    }

    if (role === 'user' && chamado.user_id !== userId) {
      throw new AppError('Acesso negado. Você não tem permissão para alterar este chamado.', 403);
    }

    const dadosParaAtualizar = { status, priority, assigned_to_id };

    if (status === 'Resolvido' || status === 'Fechado') {
      if (!chamado.closed_at) {
        dadosParaAtualizar.closed_at = new Date();
      }
    } else {
      dadosParaAtualizar.closed_at = null;
    }

    await connection('chamados').where('id', chamadoId).update(dadosParaAtualizar);

    const chamadoAtualizado = await connection('chamados')
      .where('chamados.id', chamadoId)
      .leftJoin('users as creator', 'creator.id', '=', 'chamados.user_id')
      .leftJoin('users as assignee', 'assignee.id', '=', 'chamados.assigned_to_id')
      .select('chamados.*', 'creator.name as creator_name', 'assignee.name as assigned_name')
      .first();

    return response.json(chamadoAtualizado);
  },

  async destroy(request, response) {
    const { id: chamadoId } = request.params;
    const { role } = request.user;

    if (role !== 'admin') {
      throw new AppError('Acesso negado. Apenas administradores podem apagar chamados.', 403);
    }

    const rowsDeleted = await connection('chamados').where('id', chamadoId).delete();

    if (rowsDeleted === 0) {
      throw new AppError('Chamado não encontrado.', 404);
    }

    return response.status(204).send();
  },

  // --- MANTIDO O SEU MÉTODO DE STATS ORIGINAL (AGORA REFATORADO) ---
  // Este método tem a lógica de permissão por usuário
  async stats(request, response) {
    const { id: userId, role } = request.user;

    const baseQuery = () => {
      const query = connection('chamados');
      if (role === 'user') {
        query.where({ user_id: userId });
      }
      return query;
    };

    const [
      totalResult,
      abertosResult,
      emAndamentoResult,
      pendentesResult,
      resolvidosResult
    ] = await Promise.all([
      baseQuery().count({ count: '*' }).first(),
      baseQuery().where({ status: 'Aberto' }).count({ count: '*' }).first(),
      baseQuery().where({ status: 'Em Andamento' }).count({ count: '*' }).first(),
      baseQuery().where({ status: 'Pendente' }).count({ count: '*' }).first(),
      baseQuery().whereIn('status', ['Resolvido', 'Fechado']).count({ count: '*' }).first()
    ]);

    const stats = {
      total: parseInt(totalResult.count, 10),
      abertos: parseInt(abertosResult.count, 10),
      emAndamento: parseInt(emAndamentoResult.count, 10),
      pendentes: parseInt(pendentesResult.count, 10),
      resolvidos: parseInt(resolvidosResult.count, 10)
    };

    return response.json(stats);
  },

  // --- NOVO MÉTODO OTIMIZADO PARA KPIs DO DASHBOARD ---
  // Este método faz uma única consulta ao banco e é ideal para os cards
  async kpis(request, response) {
    const counts = {
      aberto: 0,
      atendimento: 0,
      pendente: 0,
      resolvido: 0,
    };

    const statusCounts = await connection('chamados')
      .select('status')
      .count('status as count')
      .groupBy('status');

    statusCounts.forEach(item => {
      // Normaliza os status para chaves de objeto válidas (ex: "Em Andamento" -> "atendimento")
      const key = item.status.toLowerCase().replace(' ', '');
      if (counts.hasOwnProperty(key)) {
        counts[key] = Number(item.count);
      }
    });
    
    // Soma "Fechado" em "resolvido" se existir
    const fechado = statusCounts.find(s => s.status === 'Fechado');
    if (fechado) {
        counts.resolvido += Number(fechado.count);
    }

    return response.json(counts);
  },
};

