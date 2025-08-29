/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.string('cpf').unique();
    table.string('phone');
    table.date('admission_date');
    table.string('position'); // Cargo
    table.string('department'); // Setor
    table.string('status').notNullable().defaultTo('ativo'); // ativo ou inativo
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('cpf');
    table.dropColumn('phone');
    table.dropColumn('admission_date');
    table.dropColumn('position');
    table.dropColumn('department');
    table.dropColumn('status');
  });
};
