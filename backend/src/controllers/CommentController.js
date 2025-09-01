const connection = require('../database/connection');

module.exports = {
    async create(request, response) {
        const { chamado_id } = request.params;
        const { content } = request.body;
        const { id: userId, role } = request.user;

        if (!content) {
            return response.status(400).json({ error: 'O conteúdo do comentário é obrigatório.' });
        }

        try {
            const chamado = await connection('chamados').where('id', chamado_id).first();
            if (!chamado) {
                return response.status(404).json({ error: 'Chamado não encontrado.' });
            }

            if (role === 'user' && chamado.user_id !== userId) {
                return response.status(403).json({ error: 'Você não tem permissão para comentar neste chamado.' });
            }

            const [id] = await connection('comments').insert({
                content,
                chamado_id,
                user_id: userId
            });
            
            let novoComentario = await connection('comments')
                .where('comments.id', id)
                .join('users', 'users.id', '=', 'comments.user_id')
                .select('comments.*', 'users.name as author_name')
                .first();

            if (novoComentario.created_at) {
                novoComentario.created_at = new Date(novoComentario.created_at).toISOString();
            }

            return response.status(201).json(novoComentario);

        } catch (err) {
            console.error(err);
            return response.status(500).json({ error: 'Falha ao criar comentário.' });
        }
    }
};