const connection = require('../database/connection');
const { format, utcToZonedTime } = require('date-fns-tz');

module.exports = {

  async index(request, response) {
    const { id: userId, role } = request.user;

    try {
      const query = connection('chamados')
        .leftJoin('users', 'users.id', '=', 'chamados.user_id')
        .select('chamados.*', 'users.name as creator_name')
        .orderBy('chamados.created_at', 'desc');

      if (role === 'user') {
        query.where('chamados.user_id', userId);
      }

      const chamados = await query;

      const formattedChamados = chamados.map(chamado => ({
        ...chamado,
        created_at: chamado.created_at ? new Date(chamado.created_at).toISOString() : null,
        closed_at: chamado.closed_at ? new Date(chamado.closed_at).toISOString() : null
      }));

      return response.json(formattedChamados);

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao listar chamados.' });
    }
  },

  async show(request, response) {
    const { id: chamadoId } = request.params;
    const { id: userId, role } = request.user;
    const timeZone = 'America/Sao_Paulo'; // Definimos nosso fuso horário alvo

    try {
      const chamado = await connection('chamados')
        .where('chamados.id', chamadoId)
        .leftJoin('users as creator', 'creator.id', '=', 'chamados.user_id')
        .leftJoin('users as assignee', 'assignee.id', '=', 'chamados.assigned_to_id')
        .select('chamados.*', 'creator.name as creator_name', 'assignee.name as assigned_name')
        .first();

      if (!chamado) {
        return response.status(404).json({ error: 'Chamado não encontrado.' });
      }

      if (role === 'user' && chamado.user_id !== userId) {
        return response.status(403).json({ error: 'Acesso negado.' });
      }

      const comments = await connection('comments')
        .where('chamado_id', chamadoId)
        .join('users', 'users.id', '=', 'comments.user_id')
        .select('comments.*', 'users.name as author_name')
        .orderBy('created_at', 'asc');

      if (chamado.created_at) {
        chamado.created_at = new Date(chamado.created_at).toISOString();
      }
      if (chamado.closed_at) {
        chamado.closed_at = new Date(chamado.closed_at).toISOString();
      }
      const formattedComments = comments.map(comment => ({
        ...comment,
        created_at: new Date(comment.created_at).toISOString()
      }));

      return response.json({ chamado, comments: formattedComments });

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao buscar detalhes do chamado.' });
    }
  },

  async create(request, response) {
    const { title, description, priority } = request.body;
    const { id: userId, role } = request.user;

    try {
      const dadosNovoChamado = { title, description, priority, status: 'Aberto', user_id: userId };
      if (role === 'admin' || role === 'technician') {
        dadosNovoChamado.assigned_to_id = userId;
      }

      const [id] = await connection('chamados').insert(dadosNovoChamado);

      const novoChamado = await connection('chamados')
        .where('chamados.id', id)
        .leftJoin('users as creator', 'creator.id', '=', 'chamados.user_id')
        .leftJoin('users as assignee', 'assignee.id', '=', 'chamados.assigned_to_id')
        .select('chamados.*', 'creator.name as creator_name', 'assignee.name as assigned_name')
        .first();

      return response.status(201).json(novoChamado);
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao criar chamado.' });
    }
  },

  async stats(request, response) {
    const { id: userId, role } = request.user;

    try {
      const baseQuery = () => {
        const query = connection('chamados');
        if (role === 'user') {
          query.where({ user_id: userId });
        }
        return query;
      };

      const countTotal = baseQuery().count({ count: '*' }).first();
      const countAbertos = baseQuery().where({ status: 'Aberto' }).count({ count: '*' }).first();
      const countEmAndamento = baseQuery().where({ status: 'Em Andamento' }).count({ count: '*' }).first();
      const countPendentes = baseQuery().where({ status: 'Pendente' }).count({ count: '*' }).first();
      const countResolvidos = baseQuery().whereIn('status', ['Resolvido', 'Fechado']).count({ count: '*' }).first();

      const [
        totalResult,
        abertosResult,
        emAndamentoResult,
        pendentesResult,
        resolvidosResult
      ] = await Promise.all([
        countTotal,
        countAbertos,
        countEmAndamento,
        countPendentes,
        countResolvidos
      ]);

      const stats = {
        total: parseInt(totalResult.count, 10),
        abertos: parseInt(abertosResult.count, 10),
        emAndamento: parseInt(emAndamentoResult.count, 10),
        pendentes: parseInt(pendentesResult.count, 10),
        resolvidos: parseInt(resolvidosResult.count, 10)
      };

      return response.json(stats);
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Erro ao calcular estatísticas.' });
    }
  },

  async update(request, response) {
    const { id: chamadoId } = request.params;
    const { id: userId, role } = request.user;
    const { status, priority, assigned_to_id } = request.body;

    try {
      const chamado = await connection('chamados').where('id', chamadoId).first();

      if (!chamado) {
        return response.status(404).json({ error: 'Chamado não encontrado.' });
      }

      if (role === 'user' && chamado.user_id !== userId) {
        return response.status(403).json({ error: 'Acesso negado. Você não tem permissão para alterar este chamado.' });
      }

      const dadosParaAtualizar = {
        status,
        priority,
        assigned_to_id
      };

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
        .select(
          'chamados.*',
          'creator.name as creator_name',
          'assignee.name as assigned_name'
        )
        .first();

      return response.json(chamadoAtualizado);

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao atualizar chamado.' });
    }
  },

  async destroy(request, response) {
    const { id: chamadoId } = request.params;
    const { role } = request.user;

    try {
      if (role !== 'admin') {
        return response.status(403).json({ error: 'Acesso negado. Apenas administradores podem apagar chamados.' });
      }

      const chamado = await connection('chamados').where('id', chamadoId).first();
      if (!chamado) {
        return response.status(404).json({ error: 'Chamado não encontrado.' });
      }

      await connection('chamados').where('id', chamadoId).delete();

      return response.status(204).send();

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao apagar chamado.' });
    }
  },
};