const knex = require('knex');
const configuration = require('../../knexfile');
const { types } = require('pg'); // Importe o objeto 'types' do driver 'pg'

types.setTypeParser(1184, (stringValue) => {
    return stringValue;
});

const connection = knex(configuration.development);

module.exports = connection;