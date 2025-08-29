/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    // .unique() garante que não teremos dois usuários com o mesmo e-mail
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    // Futuramente podemos adicionar um campo de permissão (ex: 'admin', 'user')
    // table.string('role').notNullable().defaultTo('user');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
