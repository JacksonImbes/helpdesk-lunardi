/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
  }).then(() => {
    return knex.schema.table('chamados', (table) => {
      // Prioridade do chamado. Ex: 'baixa', 'media', 'alta'
      table.string('priority').notNullable().defaultTo('baixa');
      // Data em que o chamado foi fechado
      table.timestamp('closed_at');
      
      // --- Chaves Estrangeiras ---
      // ID do usuário que abriu o chamado
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('id').inTable('users');
      
      // ID do técnico para quem o chamado foi atribuído
      table.integer('assigned_to_id').unsigned();
      table.foreign('assigned_to_id').references('id').inTable('users');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // O 'down' faz o processo reverso, removendo as colunas
  return knex.schema.table('chamados', (table) => {
    table.dropForeign('user_id');
    table.dropForeign('assigned_to_id');
    table.dropColumn('priority');
    table.dropColumn('closed_at');
    table.dropColumn('user_id');
    table.dropColumn('assigned_to_id');
  }).then(() => {
    return knex.schema.table('users', (table) => {
    });
  });
};
