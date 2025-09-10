// backend/knexfile.js
require('dotenv').config();

const pgConnection = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

const baseConfig = {
  client: 'pg',
  connection: pgConnection,
  migrations: {
    directory: './src/database/migrations'
  },
  pool: {
    min: 2,
    max: 10,
  }
};

module.exports = {
  development: {
    ...baseConfig
  },
  production: {
    ...baseConfig
  }
};