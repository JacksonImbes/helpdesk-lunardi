const connection = require('../database/connection');

module.exports = {
  // Listar todos os itens do inventário
  async index(request, response) {
    const items = await connection('inventory_items')
      .leftJoin('users', 'inventory_items.assigned_to_id', '=', 'users.id')
      .select([
        'inventory_items.*',
        'users.name as assigned_user_name'
      ]);
    return response.json(items);
  },

  // Criar um novo item no inventário
  async create(request, response) {
    const { 
      name, 
      type, 
      serial_number, 
      description, 
      purchase_date, 
      status, 
      assigned_to_id 
    } = request.body;

    const [id] = await connection('inventory_items').insert({
      name,
      type,
      serial_number,
      description,
      purchase_date,
      status,
      assigned_to_id,
    });

    const newItem = await connection('inventory_items')
      .leftJoin('users', 'inventory_items.assigned_to_id', '=', 'users.id')
      .select('inventory_items.*', 'users.name as assigned_user_name')
      .where('inventory_items.id', id)
      .first();
      
    return response.status(201).json(newItem);
  }
};