const connection = require('../database/connection');

module.exports = {
    async create(request, response) {
        const { chamado_id } = request.params; // Pegamos o ID do chamado da URL
        const { content } = request.body; // Pegamos o conteúdo do comentário do corpo
        const { id: userId, role } = request.user; // Pegamos o usuário logado

        if (!content) {
            return response.status(400).json({ error: 'O conteúdo do comentário é obrigatório.' });
        }

        try {
            // Passo 1: Verificar se o chamado existe.
            const chamado = await connection('chamados').where('id', chamado_id).first();
            if (!chamado) {
                return response.status(404).json({ error: 'Chamado não encontrado.' });
            }

            // Passo 2: VERIFICAR PERMISSÃO (A mesma lógica do ChamadoController.show)
            // Um usuário comum só pode comentar no seu próprio chamado.
            if (role === 'user' && chamado.user_id !== userId) {
                return response.status(403).json({ error: 'Você não tem permissão para comentar neste chamado.' });
            }

            // Se a permissão for válida, inserimos o comentário.
            const [id] = await connection('comments').insert({
                content,
                chamado_id,
                user_id: userId
            });
            
            const novoComentario = await connection('comments').where('id', id).first();
            return response.status(201).json(novoComentario);

        } catch (err) {
            console.error(err);
            return response.status(500).json({ error: 'Falha ao criar comentário.' });
        }
    }
};