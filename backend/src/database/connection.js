const knex = require('knex');
const configuration = require('../../knexfile');
const { types } = require('pg');


types.setTypeParser(1184, (stringValue) => {
  return stringValue;
});

const environment = process.env.NODE_ENV || 'development';
const connection = knex(configuration[environment]);

module.exports = connection;