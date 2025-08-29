const connection = require('../database/connection');

module.exports = {

  async index(request, response) {
    const { id: userId, role } = request.user;

    try {
      const query = connection('chamados').select('*');

      // Se o usuário NÃO for admin ou técnico, filtramos para mostrar apenas os seus chamados.
      if (role === 'user') {
        query.where('user_id', userId);
      }

      // Para admin e technician, o filtro não é aplicado, então eles veem tudo.
      const chamados = await query;
      return response.json(chamados);

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao listar chamados.' });
    }
  },

  async show(request, response) {
    const { id: chamadoId } = request.params;
    const { id: userId, role } = request.user;

    try {
      const chamado = await connection('chamados')
        .where('chamados.id', chamadoId)
        // JOIN #1: Busca o nome do CRIADOR do chamado
        .leftJoin('users as creator', 'creator.id', '=', 'chamados.user_id')
        // JOIN #2: Busca o nome do TÉCNICO ATRIBUÍDO ao chamado
        .leftJoin('users as assignee', 'assignee.id', '=', 'chamados.assigned_to_id')
        .select(
          'chamados.*',
          'creator.name as creator_name', // Seleciona o nome do criador
          'assignee.name as assigned_name' // Seleciona o nome do atribuído
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

      return response.json({ chamado, comments });

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao buscar detalhes do chamado.' });
    }
  },

  async create(request, response) {
    // Pegamos os dados do corpo da requisição
    const { title, description, priority } = request.body;
    // Pegamos os dados do usuário que está logado (do token JWT)
    const { id: userId, role } = request.user;

    if (!title || !description || !priority) {
      return response.status(400).json({ error: 'Título, descrição e prioridade são obrigatórios.' });
    }

    try {
      // 1. Preparamos um objeto com os dados básicos do novo chamado
      const dadosNovoChamado = {
        title,
        description,
        priority,
        status: 'Aberto',
        user_id: userId // O 'user_id' é sempre quem criou o chamado
      };

      // 2. LÓGICA DE AUTO-ATRIBUIÇÃO
      // Se o usuário que está criando é um admin ou técnico,
      // o chamado já nasce atribuído a ele.
      if (role === 'admin' || role === 'technician') {
        dadosNovoChamado.assigned_to_id = userId;
      }

      // 3. Inserimos o objeto completo no banco de dados
      const [id] = await connection('chamados').insert(dadosNovoChamado);

      const novoChamado = await connection('chamados').where('id', id).first();
      return response.status(201).json(novoChamado);

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao criar chamado.' });
    }
  },

  async stats(request, response) {
    const { id: userId, role } = request.user;

    try {
        // Criamos uma query base que será usada para todos os cálculos.
        // Ela já inclui o filtro por usuário, se necessário.
        const baseQuery = () => {
            const query = connection('chamados');
            if (role === 'user') {
                query.where({ user_id: userId });
            }
            return query;
        };

        // Preparamos todas as contagens que queremos fazer.
        // O Knex permite clonar queries, o que é perfeito para isso!
        const countTotal = baseQuery().count({ count: '*' }).first();
        const countAbertos = baseQuery().where({ status: 'Aberto' }).count({ count: '*' }).first();
        const countEmAndamento = baseQuery().where({ status: 'Em Andamento' }).count({ count: '*' }).first();
        const countPendentes = baseQuery().where({ status: 'Pendente' }).count({ count: '*' }).first();
        const countResolvidos = baseQuery().whereIn('status', ['Resolvido', 'Fechado']).count({ count: '*' }).first();

        // Executamos todas as contagens em paralelo para máxima eficiência.
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
        
        // Montamos o objeto de resposta final.
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
    // Pegamos apenas os campos que o ActionPanel pode alterar
    const { status, priority, assigned_to_id } = request.body;

    try {
      const chamado = await connection('chamados').where('id', chamadoId).first();

      if (!chamado) {
        return response.status(404).json({ error: 'Chamado não encontrado.' });
      }

      if (role === 'user' && chamado.user_id !== userId) {
        return response.status(403).json({ error: 'Acesso negado. Você não tem permissão para alterar este chamado.' });
      }

      // Criamos um objeto apenas com os dados que queremos atualizar
      const dadosParaAtualizar = {
        status,
        priority,
        assigned_to_id
      };

      // Executamos a atualização no banco de dados
      await connection('chamados').where('id', chamadoId).update(dadosParaAtualizar);

      // --- A GRANDE MUDANÇA ESTÁ AQUI ---
      // Em vez de retornar uma busca simples, vamos retornar a mesma busca completa da função show()
      // para que o frontend receba todos os dados necessários (incluindo creator_name e assigned_name).
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
      // Passo 1: VERIFICAÇÃO DE PERMISSÃO (Rígida)
      // Apenas 'admin' pode prosseguir.
      if (role !== 'admin') {
        return response.status(403).json({ error: 'Acesso negado. Apenas administradores podem apagar chamados.' });
      }

      // Passo 2: Verificar se o chamado existe antes de tentar apagar.
      const chamado = await connection('chamados').where('id', chamadoId).first();
      if (!chamado) {
        return response.status(404).json({ error: 'Chamado não encontrado.' });
      }

      // Se a verificação passar, o usuário é admin e o chamado existe. Pode apagar.
      await connection('chamados').where('id', chamadoId).delete();

      // Retornamos 204 (No Content) para indicar que a operação foi bem-sucedida, mas não há nada para retornar.
      return response.status(204).send();

    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao apagar chamado.' });
    }
  },
};