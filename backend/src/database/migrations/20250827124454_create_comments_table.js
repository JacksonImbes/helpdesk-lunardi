/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // --- Chaves Estrangeiras ---
    // ID do chamado ao qual o comentário pertence
    table.integer('chamado_id').notNullable().unsigned();
    table.foreign('chamado_id').references('id').inTable('chamados');
    
    // ID do usuário que escreveu o comentário
    table.integer('user_id').notNullable().unsigned();
    table.foreign('user_id').references('id').inTable('users');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('comments');
};
