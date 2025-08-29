/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('inventory_items', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('type').notNullable(); // Ex: 'Notebook', 'Monitor', 'Software'
    table.string('serial_number').unique();
    table.text('description');
    table.date('purchase_date');
    table.string('status').notNullable().defaultTo('disponivel'); // Ex: 'disponivel', 'em_uso', 'em_manutencao'
    
    // Chave Estrangeira para o utilizador ao qual o item está atribuído
    table.integer('assigned_to_id').unsigned();
    table.foreign('assigned_to_id').references('id').inTable('users');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('inventory_items');
};
