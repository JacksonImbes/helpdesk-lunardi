import 'dotenv/config';

const config = {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './src/database/migrations'
    },
    pool: {
      min: 2,  // Mínimo de 2 ligações abertas
      max: 10, // Máximo de 10 ligações em simultâneo
      afterCreate: (conn, done) => {
        conn.query('SET statement_timeout TO 60000;', (err) => {
          done(err, conn);
        });
      },
      validate: (conn) => {
        return conn.query('SELECT 1').then(() => true).catch(() => false);
      }
    }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './src/database/migrations'
    },
    pool: {
      min: 2,
      max: 10,
      afterCreate: (conn, done) => {
        conn.query('SET statement_timeout TO 60000;', (err) => {
          done(err, conn);
        });
      },
      validate: (conn) => {
        return conn.query('SELECT 1').then(() => true).catch(() => false);
      }
    }
  }
};

export default config;