import connection from '../database/connection.js';

export default {
async personal(request, response) {
    const { id: userId } = request.user;

    try {
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

    } catch(err) {
      console.error("Erro ao buscar a fila pessoal:", err);
      return response.status(500).json({ error: 'Falha ao buscar a sua fila de chamados.' });
    }
  },
  
  async index(request, response) {
    const { role, id: userId } = request.user;
    
    try {
      const query = connection('chamados')
        .join('users', 'chamados.user_id', '=', 'users.id')
        .select('chamados.*', 'users.name as creator_name')
        .orderBy('chamados.created_at', 'desc');

      if (role !== 'admin' && role !== 'technician') {
        query.where('chamados.user_id', userId);
      }
      
      const chamados = await query;

      // Padroniza o formato das datas para ISO 8601 (UTC).
      const chamadosFormatados = chamados.map(chamado => ({
        ...chamado,
        created_at: new Date(chamado.created_at).toISOString(),
        closed_at: chamado.closed_at ? new Date(chamado.closed_at).toISOString() : null,
      }));
    
      return response.json(chamadosFormatados);

    } catch(err) {
        console.error("Erro ao buscar chamados:", err);
        return response.status(500).json({ error: 'Falha ao buscar os chamados.' });
    }
  },

  /**
   * Busca um chamado específico e seus comentários.
   */
  async show(request, response) {
    const { id: chamadoId } = request.params;
    const { id: userId, role } = request.user;
    
    // --- CORREÇÃO DE SEGURANÇA NO BACKEND ---
    // Validamos se o ID recebido é um número inteiro válido.
    // Se não for, retornamos um erro 400 (Bad Request) imediatamente.
    // A função isNaN() verifica se o valor NÃO é um número.
    if (isNaN(parseInt(chamadoId, 10))) {
      return response.status(400).json({ error: 'O ID do chamado fornecido é inválido.' });
    }

    try {
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
      
      chamado.created_at = new Date(chamado.created_at).toISOString();
      if(chamado.closed_at) {
        chamado.closed_at = new Date(chamado.closed_at).toISOString();
      }
      const formattedComments = comments.map(c => ({
          ...c,
          created_at: new Date(c.created_at).toISOString()
      }));

      return response.json({ chamado, comments: formattedComments });

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao buscar detalhes do chamado.' });
    }
  },

  /**
   * Cria um novo chamado.
   */
  async create(request, response) {
    const { title, description, priority } = request.body;
    const user_id = request.user.id;

    try {
      const [chamadoCriado] = await connection('chamados')
        .insert({
          title,
          description,
          priority,
          status: 'Aberto',
          user_id,
        })
        .returning(['id']);

      return response.status(201).json({ id: chamadoCriado.id });

    } catch (err) {
      console.error('Erro ao criar chamado:', err);
      return response.status(500).json({ error: 'Falha ao criar o chamado.' });
    }
  },
  
  /**
   * Retorna estatísticas dos chamados.
   */
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
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Erro ao calcular estatísticas.' });
    }
  },

  /**
   * Atualiza um chamado existente.
   */
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

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao atualizar chamado.' });
    }
  },

  /**
   * Apaga um chamado (apenas admin).
   */
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