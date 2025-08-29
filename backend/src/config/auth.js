require('dotenv').config();

module.exports = {
  // Lê o segredo do ambiente, com um valor padrão caso não seja encontrado
  secret: process.env.APP_SECRET || 'TLun@t1#2025',
  expiresIn: '7d',
};