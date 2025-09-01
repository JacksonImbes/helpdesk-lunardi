const connection = require('../database/connection');

module.exports = {
  async index(request, response) {
    const { id: userId, role } = request.user;
    
    try {
      const query = connection('inventory_items')
        .leftJoin('users', 'inventory_items.assigned_to_id', '=', 'users.id')
        .select('inventory_items.*', 'users.name as assigned_user_name');
        
      if (role === 'user') {
        query.where('inventory_items.assigned_to_id', userId);
      }
      
      const items = await query;
      return response.json(items);
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao listar inventário.' });
    }
  },

  async create(request, response) {
    const { ...itemData } = request.body;
    
    try {
      const [id] = await connection('inventory_items').insert(itemData);

      const newItem = await connection('inventory_items')
        .leftJoin('users', 'inventory_items.assigned_to_id', '=', 'users.id')
        .select('inventory_items.*', 'users.name as assigned_user_name')
        .where('inventory_items.id', id)
        .first();
          
      return response.status(201).json(newItem);
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao criar item.' });
    }
  },
  
};