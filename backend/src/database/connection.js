import knex from 'knex';
import configuration from '../../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const connection = knex(configuration[environment]);

export default connection;