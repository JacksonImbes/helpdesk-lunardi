const connection = require('../database/connection');

module.exports = {
  /**
   * Lista itens do inventário.
   */
  async index(request, response) {
    const { id: userId, role } = request.user;
    
    try {
      const query = connection('inventory_items')
        .leftJoin('users', 'inventory_items.assigned_to_id', '=', 'users.id')
        .select('inventory_items.*', 'users.name as assigned_user_name');
        
      // Usuários comuns veem apenas os itens atribuídos a eles.
      if (role === 'user') {
        query.where('inventory_items.assigned_to_id', userId);
      }
      
      const items = await query;
      return response.json(items);
    } catch (err) {
      console.error('Erro ao listar inventário:', err);
      return response.status(500).json({ error: 'Falha ao listar inventário.' });
    }
  },

  /**
   * Cria um novo item no inventário.
   */
  async create(request, response) {
    const { ...itemData } = request.body;
    
    try {
      const [id] = await connection('inventory_items').insert(itemData).returning('id');

      const newItem = await connection('inventory_items')
        .leftJoin('users', 'inventory_items.assigned_to_id', '=', 'users.id')
        .select('inventory_items.*', 'users.name as assigned_user_name')
        .where('inventory_items.id', id.id || id)
        .first();
            
      return response.status(201).json(newItem);
    } catch (err) {
      console.error('Erro ao criar item:', err);
      return response.status(500).json({ error: 'Falha ao criar item.' });
    }
  },

  /**
   * Atualiza um item do inventário.
   */
  async update(request, response) {
    const { id } = request.params;
    const { assigned_to_id, ...itemData } = request.body;

    try {
      const itemExists = await connection('inventory_items').where('id', id).first();
      if (!itemExists) {
        return response.status(404).json({ error: 'Item de inventário não encontrado.' });
      }
      
      // Valida se o usuário para o qual o item está sendo atribuído existe
      if (assigned_to_id) {
        const userExists = await connection('users').where('id', assigned_to_id).first();
        if (!userExists) {
          return response.status(400).json({ error: 'O usuário para o qual você está tentando atribuir o item não existe.' });
        }
      }

      await connection('inventory_items').where('id', id).update({ assigned_to_id, ...itemData });

      const updatedItem = await connection('inventory_items')
        .leftJoin('users', 'inventory_items.assigned_to_id', '=', 'users.id')
        .select('inventory_items.*', 'users.name as assigned_user_name')
        .where('inventory_items.id', id)
        .first();

      return response.json(updatedItem);
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      return response.status(500).json({ error: 'Falha ao atualizar o item.' });
    }
  },

  /**
   * Apaga um item do inventário.
   */
  async destroy(request, response) {
    const { id } = request.params;
    try {
      const operation = await connection('inventory_items').where('id', id).delete();
      if (operation === 0) {
        return response.status(404).json({ error: 'Item de inventário não encontrado.' });
      }
      return response.status(204).send();
    } catch (err) {
      console.error('Erro ao apagar item:', err);
      return response.status(500).json({ error: 'Falha ao apagar o item.' });
    }
  }
};